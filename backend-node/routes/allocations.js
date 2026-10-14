const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticate, authorize, enforceHostelIsolation } = require('../middleware/auth');

const formatAllocation = (row) => ({
  id: row.id,
  allocationDate: row.allocation_date,
  status: row.status,
  allocatedBy: row.allocated_by,
  student: {
    id: row.student_id,
    studentId: row.student_custom_id,
    fullName: row.student_name,
    email: row.student_email,
    mobile: row.student_mobile,
    gender: row.student_gender,
    course: row.student_course,
    department: row.student_department,
    rollNumber: row.student_roll_number
  },
  hostel: {
    id: row.hostel_id,
    hostelName: row.hostel_name,
    hostelType: row.hostel_type
  },
  room: {
    id: row.room_id,
    roomNumber: row.room_number,
    floor: row.room_floor
  },
  bed: {
    id: row.bed_id,
    bedNumber: row.bed_number,
    status: row.bed_status
  }
});

const ALLOC_SELECT = `
  SELECT al.*,
         s.id AS student_id, s.student_id AS student_custom_id, s.full_name AS student_name,
         s.email AS student_email, s.mobile AS student_mobile, s.gender AS student_gender,
         s.course AS student_course, s.department AS student_department, s.roll_number AS student_roll_number,
         h.id AS hostel_id, h.hostel_name AS hostel_name, h.hostel_type AS hostel_type,
         r.id AS room_id, r.room_number AS room_number, r.floor AS room_floor,
         b.id AS bed_id, b.bed_number AS bed_number, b.status AS bed_status
  FROM allocations al
  JOIN students s ON al.student_id = s.id
  JOIN hostels h ON al.hostel_id = h.id
  JOIN rooms r ON al.room_id = r.id
  JOIN beds b ON al.bed_id = b.id
`;

// GET /api/allocations/my-allocation
router.get('/my-allocation', authenticate, async (req, res) => {
  try {
    const [students] = await pool.query('SELECT id FROM students WHERE user_id = ?', [req.user.id]);
    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student profile not found', data: null });
    }

    const [rows] = await pool.query(`${ALLOC_SELECT} WHERE al.student_id = ? AND al.status = 'ACTIVE' LIMIT 1`, [students[0].id]);
    if (rows.length === 0) {
      return res.json({ success: true, message: 'No active allocation found', data: null });
    }

    return res.json({ success: true, message: 'Allocation retrieved', data: formatAllocation(rows[0]) });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, data: null });
  }
});

// GET /api/allocations/hostel/:hostelId
router.get('/hostel/:hostelId', authenticate, authorize('BOYS_WARDEN', 'GIRLS_WARDEN', 'HOSTEL_HEAD'), enforceHostelIsolation, async (req, res) => {
  try {
    const [rows] = await pool.query(`${ALLOC_SELECT} WHERE al.hostel_id = ? AND al.status = 'ACTIVE' ORDER BY al.id DESC`, [req.params.hostelId]);
    return res.json({ success: true, message: 'Hostel allocations retrieved', data: rows.map(formatAllocation) });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, data: null });
  }
});

// GET /api/allocations/student/:studentId
router.get('/student/:studentId', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.query(`${ALLOC_SELECT} WHERE al.student_id = ? ORDER BY al.id DESC LIMIT 1`, [req.params.studentId]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Allocation not found', data: null });
    }
    return res.json({ success: true, message: 'Allocation retrieved', data: formatAllocation(rows[0]) });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, data: null });
  }
});

// POST /api/allocations
router.post('/', authenticate, authorize('BOYS_WARDEN', 'GIRLS_WARDEN', 'HOSTEL_HEAD'), enforceHostelIsolation, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { studentId, hostelId, roomId, bedId } = req.body;
    const allocatedBy = req.user.name || 'Warden';

    await connection.beginTransaction();

    // Check if bed is available
    const [beds] = await connection.query('SELECT status FROM beds WHERE id = ? FOR UPDATE', [bedId]);
    if (beds.length === 0 || beds[0].status !== 'AVAILABLE') {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Selected bed is not available', data: null });
    }

    // Insert allocation
    const [result] = await connection.query(
      `INSERT INTO allocations (student_id, hostel_id, room_id, bed_id, allocated_by, status)
       VALUES (?, ?, ?, ?, ?, 'ACTIVE')`,
      [studentId, hostelId, roomId, bedId, allocatedBy]
    );

    // Update bed status to OCCUPIED
    await connection.query('UPDATE beds SET status = "OCCUPIED" WHERE id = ?', [bedId]);

    // Check room occupancy status
    const [roomBeds] = await connection.query('SELECT status FROM beds WHERE room_id = ?', [roomId]);
    const allOccupied = roomBeds.every(b => b.status === 'OCCUPIED');
    const roomStatus = allOccupied ? 'FULL' : 'PARTIALLY_OCCUPIED';
    await connection.query('UPDATE rooms SET status = ? WHERE id = ?', [roomStatus, roomId]);

    await connection.commit();

    const [rows] = await pool.query(`${ALLOC_SELECT} WHERE al.id = ?`, [result.insertId]);
    return res.status(201).json({
      success: true,
      message: 'Bed allocated successfully',
      data: formatAllocation(rows[0])
    });
  } catch (err) {
    await connection.rollback();
    return res.status(500).json({ success: false, message: err.message, data: null });
  } finally {
    connection.release();
  }
});

// DELETE /api/allocations/:id
router.delete('/:id', authenticate, authorize('BOYS_WARDEN', 'GIRLS_WARDEN', 'HOSTEL_HEAD'), async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [rows] = await connection.query('SELECT bed_id, room_id FROM allocations WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Allocation not found', data: null });
    }

    const { bed_id, room_id } = rows[0];

    // Mark allocation cancelled or delete
    await connection.query('DELETE FROM allocations WHERE id = ?', [req.params.id]);

    // Set bed to AVAILABLE
    await connection.query('UPDATE beds SET status = "AVAILABLE" WHERE id = ?', [bed_id]);

    // Update room status
    const [roomBeds] = await connection.query('SELECT status FROM beds WHERE room_id = ?', [room_id]);
    const anyOccupied = roomBeds.some(b => b.status === 'OCCUPIED');
    const roomStatus = anyOccupied ? 'PARTIALLY_OCCUPIED' : 'AVAILABLE';
    await connection.query('UPDATE rooms SET status = ? WHERE id = ?', [roomStatus, room_id]);

    await connection.commit();
    return res.json({ success: true, message: 'Deallocation completed successfully', data: null });
  } catch (err) {
    await connection.rollback();
    return res.status(500).json({ success: false, message: err.message, data: null });
  } finally {
    connection.release();
  }
});

module.exports = router;
