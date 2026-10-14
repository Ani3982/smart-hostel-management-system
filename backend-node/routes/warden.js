const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');

// Middleware to resolve and enforce authenticated Warden's hostel_id from the database
const requireWarden = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = (req.user.role || '').toUpperCase().replace(/^ROLE_/, '');

    // Check if user is in hostel_heads
    const [heads] = await pool.query(`
      SELECT hh.*, h.hostel_name, h.hostel_type, u.role, u.status as user_status
      FROM hostel_heads hh
      JOIN hostels h ON hh.hostel_id = h.id
      JOIN app_users u ON hh.user_id = u.id
      WHERE hh.user_id = ?
    `, [userId]);

    if (heads.length > 0) {
      const head = heads[0];
      req.warden = {
        id: head.id,
        userId: head.user_id,
        hostelId: head.hostel_id,
        hostelName: head.hostel_name,
        hostelType: head.hostel_type,
        employeeId: head.employee_id,
        fullName: head.full_name || head.name,
        email: head.email,
        mobile: head.mobile,
        gender: head.gender,
        designation: head.designation,
        status: head.status
      };
      return next();
    }

    // Fallback: If user has role BOYS_WARDEN or GIRLS_WARDEN or HOSTEL_HEAD in app_users
    if (userRole === 'BOYS_WARDEN' || userRole === 'GIRLS_WARDEN' || userRole === 'HOSTEL_HEAD') {
      const [uRows] = await pool.query('SELECT * FROM app_users WHERE id = ?', [userId]);
      if (uRows.length > 0) {
        const u = uRows[0];
        const hType = (u.hostel_type || (userRole === 'GIRLS_WARDEN' ? 'GIRLS' : 'BOYS')).toUpperCase();
        const [hRows] = await pool.query('SELECT * FROM hostels WHERE hostel_type = ? LIMIT 1', [hType]);
        const h = hRows.length > 0 ? hRows[0] : (hType === 'GIRLS' ? { id: 2, hostel_name: 'Girls Hostel', hostel_type: 'GIRLS' } : { id: 1, hostel_name: 'Boys Hostel', hostel_type: 'BOYS' });
        req.warden = {
          id: 0,
          userId: u.id,
          hostelId: h.id,
          hostelName: h.hostel_name,
          hostelType: h.hostel_type,
          employeeId: hType === 'GIRLS' ? 'WH002' : 'WH001',
          fullName: u.name,
          email: u.email,
          mobile: '',
          gender: hType === 'GIRLS' ? 'FEMALE' : 'MALE',
          designation: `Warden (${hType})`,
          status: u.status || 'ACTIVE'
        };
        return next();
      }
    }

    return res.status(403).json({
      success: false,
      message: 'Access Denied: Only authenticated Hostel Wardens (HOSTEL_HEAD) or Administrators can access this portal.',
      data: null
    });
  } catch (err) {
    console.error('requireWarden error:', err);
    return res.status(500).json({ success: false, message: 'Authorization resolution failed', data: null });
  }
};

router.use(authenticate, requireWarden);

// Format application record
const formatApp = (row) => ({
  id: row.id,
  applicationDate: row.application_date,
  status: row.status,
  preferredRoomType: row.preferred_room_type,
  remarks: row.remarks,
  approvedBy: row.approved_by,
  approvedDate: row.approved_date,
  rejectionReason: row.rejection_reason,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  student: {
    id: row.student_id,
    userId: row.student_user_id,
    studentId: row.student_custom_id,
    fullName: row.student_name,
    dob: row.student_dob,
    gender: row.student_gender,
    mobile: row.student_mobile,
    email: row.student_email,
    address: row.student_address,
    city: row.student_city,
    state: row.student_state,
    pincode: row.student_pincode,
    collegeName: row.student_college_name,
    course: row.student_course,
    department: row.student_department,
    academicYear: row.student_academic_year,
    rollNumber: row.student_roll_number,
    parentName: row.student_parent_name,
    parentMobile: row.student_parent_mobile,
    emergencyContact: row.student_emergency_contact
  },
  hostel: {
    id: row.hostel_id,
    hostelName: row.hostel_name,
    hostelType: row.hostel_type
  }
});

const APP_SELECT = `
  SELECT a.*,
         s.id AS student_id, s.user_id AS student_user_id, s.student_id AS student_custom_id,
         s.full_name AS student_name, s.dob AS student_dob, s.gender AS student_gender,
         s.mobile AS student_mobile, s.email AS student_email, s.address AS student_address,
         s.city AS student_city, s.state AS student_state, s.pincode AS student_pincode,
         s.college_name AS student_college_name, s.course AS student_course,
         s.department AS student_department, s.academic_year AS student_academic_year,
         s.roll_number AS student_roll_number, s.parent_name AS student_parent_name,
         s.parent_mobile AS student_parent_mobile, s.emergency_contact AS student_emergency_contact,
         h.id AS hostel_id, h.hostel_name AS hostel_name, h.hostel_type AS hostel_type
  FROM applications a
  JOIN students s ON a.student_id = s.id
  JOIN hostels h ON a.hostel_id = h.id
`;

// GET /api/warden/profile - Warden profile
router.get('/profile', async (req, res) => {
  return res.json({
    success: true,
    message: 'Warden profile retrieved',
    data: req.warden
  });
});

// GET /api/warden/dashboard - Dynamic metrics for the Warden's specific hostel ONLY
router.get('/dashboard', async (req, res) => {
  try {
    const hostelId = req.warden.hostelId;

    const [rooms] = await pool.query('SELECT COUNT(*) AS total FROM rooms WHERE hostel_id = ?', [hostelId]);
    const [beds] = await pool.query(`
      SELECT 
        COUNT(*) AS totalBeds,
        SUM(CASE WHEN b.status = 'OCCUPIED' THEN 1 ELSE 0 END) AS occupiedBeds,
        SUM(CASE WHEN b.status = 'AVAILABLE' THEN 1 ELSE 0 END) AS availableBeds,
        SUM(CASE WHEN b.status = 'MAINTENANCE' THEN 1 ELSE 0 END) AS maintenanceBeds
      FROM beds b
      JOIN rooms r ON b.room_id = r.id
      WHERE r.hostel_id = ?
    `, [hostelId]);

    const [apps] = await pool.query(`
      SELECT 
        COUNT(*) AS totalApplications,
        SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) AS pendingApplications,
        SUM(CASE WHEN status = 'APPROVED' THEN 1 ELSE 0 END) AS approvedApplications,
        SUM(CASE WHEN status = 'REJECTED' THEN 1 ELSE 0 END) AS rejectedApplications
      FROM applications
      WHERE hostel_id = ?
    `, [hostelId]);

    const [students] = await pool.query(`
      SELECT COUNT(DISTINCT student_id) AS totalStudents 
      FROM allocations 
      WHERE hostel_id = ? AND status = 'ACTIVE'
    `, [hostelId]);

    const [payments] = await pool.query(`
      SELECT 
        COALESCE(SUM(CASE WHEN p.status = 'SUCCESS' THEN p.amount ELSE 0 END), 0) AS totalPaymentsAmount,
        SUM(CASE WHEN p.status = 'SUCCESS' THEN 1 ELSE 0 END) AS successfulPayments,
        SUM(CASE WHEN p.status = 'PENDING' THEN 1 ELSE 0 END) AS pendingPayments
      FROM payments p
      JOIN applications a ON p.application_id = a.id
      WHERE a.hostel_id = ?
    `, [hostelId]);

    const stats = {
      hostelId: req.warden.hostelId,
      hostelName: req.warden.hostelName,
      hostelType: req.warden.hostelType,
      wardenName: req.warden.fullName,
      employeeId: req.warden.employeeId,
      totalStudents: Number(students[0].totalStudents) || 0,
      totalRooms: Number(rooms[0].total) || 0,
      totalBeds: Number(beds[0].totalBeds) || 0,
      occupiedBeds: Number(beds[0].occupiedBeds) || 0,
      availableBeds: Number(beds[0].availableBeds) || 0,
      maintenanceBeds: Number(beds[0].maintenanceBeds) || 0,
      totalApplications: Number(apps[0].totalApplications) || 0,
      pendingApplications: Number(apps[0].pendingApplications) || 0,
      approvedApplications: Number(apps[0].approvedApplications) || 0,
      rejectedApplications: Number(apps[0].rejectedApplications) || 0,
      totalPaymentsAmount: parseFloat(payments[0].totalPaymentsAmount) || 0,
      successfulPayments: Number(payments[0].successfulPayments) || 0,
      pendingPayments: Number(payments[0].pendingPayments) || 0,
      pendingComplaints: 0,
      pendingRequests: 0
    };

    return res.json({
      success: true,
      message: `${req.warden.hostelName} Warden Dashboard statistics retrieved successfully`,
      data: stats
    });
  } catch (err) {
    console.error('Warden dashboard error:', err);
    return res.status(500).json({ success: false, message: err.message, data: null });
  }
});

// GET /api/warden/applications - Applications for this Warden's hostel ONLY
router.get('/applications', async (req, res) => {
  try {
    const hostelId = req.warden.hostelId;
    const { status, search } = req.query;

    let query = `${APP_SELECT} WHERE a.hostel_id = ?`;
    const params = [hostelId];

    if (status && status !== 'ALL') {
      query += ` AND a.status = ?`;
      params.push(status);
    }

    if (search) {
      query += ` AND (s.full_name LIKE ? OR s.student_id LIKE ? OR s.course LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY a.id DESC`;

    const [rows] = await pool.query(query, params);
    return res.json({
      success: true,
      message: `${req.warden.hostelName} applications retrieved`,
      data: rows.map(formatApp)
    });
  } catch (err) {
    console.error('Warden applications error:', err);
    return res.status(500).json({ success: false, message: err.message, data: null });
  }
});

// GET /api/warden/applications/:id
router.get('/applications/:id', async (req, res) => {
  try {
    const hostelId = req.warden.hostelId;
    const [rows] = await pool.query(`${APP_SELECT} WHERE a.id = ? AND a.hostel_id = ?`, [req.params.id, hostelId]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Application not found in ${req.warden.hostelName}`,
        data: null
      });
    }

    return res.json({
      success: true,
      message: 'Application details retrieved',
      data: formatApp(rows[0])
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, data: null });
  }
});

// PUT /api/warden/applications/:id/approve
router.put('/applications/:id/approve', async (req, res) => {
  try {
    const hostelId = req.warden.hostelId;
    const [appRows] = await pool.query('SELECT * FROM applications WHERE id = ? AND hostel_id = ?', [req.params.id, hostelId]);

    if (appRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Application not found or unauthorized in ${req.warden.hostelName}`,
        data: null
      });
    }

    const approvedBy = req.warden.fullName || 'Hostel Warden';
    await pool.query(
      "UPDATE applications SET status = 'APPROVED', approved_by = ?, approved_date = NOW() WHERE id = ?",
      [approvedBy, req.params.id]
    );

    // Notify student
    const [stRows] = await pool.query('SELECT user_id FROM students WHERE id = ?', [appRows[0].student_id]);
    if (stRows.length > 0) {
      await pool.query(
        "INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, 'SUCCESS')",
        [
          stRows[0].user_id,
          'Hostel Admission Confirmed!',
          `Your admission to ${req.warden.hostelName} has been confirmed & approved by ${approvedBy}. Proceed to Room & Bed Allocation.`,
        ]
      );
    }

    const [updated] = await pool.query(`${APP_SELECT} WHERE a.id = ?`, [req.params.id]);
    return res.json({
      success: true,
      message: 'Application approved & confirmed successfully by Warden',
      data: formatApp(updated[0])
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, data: null });
  }
});

// PUT /api/warden/applications/:id/reject
router.put('/applications/:id/reject', async (req, res) => {
  try {
    const hostelId = req.warden.hostelId;
    const { reason, rejectionReason } = req.body;
    const reasonText = (reason || rejectionReason || '').trim();

    if (!reasonText) {
      return res.status(400).json({ success: false, message: 'Rejection reason is required', data: null });
    }

    const [appRows] = await pool.query('SELECT * FROM applications WHERE id = ? AND hostel_id = ?', [req.params.id, hostelId]);
    if (appRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Application not found or unauthorized in ${req.warden.hostelName}`,
        data: null
      });
    }

    await pool.query(
      "UPDATE applications SET status = 'REJECTED', rejection_reason = ?, approved_date = NOW() WHERE id = ?",
      [reasonText, req.params.id]
    );

    // Notify student
    const [stRows] = await pool.query('SELECT user_id FROM students WHERE id = ?', [appRows[0].student_id]);
    if (stRows.length > 0) {
      await pool.query(
        "INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, 'DANGER')",
        [
          stRows[0].user_id,
          'Hostel Application Rejected',
          `Your admission application was rejected by Warden: ${reasonText}`
        ]
      );
    }

    const [updated] = await pool.query(`${APP_SELECT} WHERE a.id = ?`, [req.params.id]);
    return res.json({
      success: true,
      message: 'Application rejected with reason',
      data: formatApp(updated[0])
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, data: null });
  }
});

// GET /api/warden/students - Students residing in or applied to this Warden's hostel ONLY
router.get('/students', async (req, res) => {
  try {
    const hostelId = req.warden.hostelId;
    const { search, status } = req.query;

    let query = `
      SELECT DISTINCT s.*, 
             a.id AS application_id, a.status AS application_status, a.preferred_room_type,
             al.id AS allocation_id, al.status AS allocation_status,
             r.room_number, b.bed_number,
             p.status AS payment_status, p.receipt_number
      FROM students s
      JOIN applications a ON s.id = a.student_id AND a.hostel_id = ?
      LEFT JOIN allocations al ON s.id = al.student_id AND al.hostel_id = ? AND al.status = 'ACTIVE'
      LEFT JOIN rooms r ON al.room_id = r.id
      LEFT JOIN beds b ON al.bed_id = b.id
      LEFT JOIN payments p ON a.id = p.application_id AND p.status = 'SUCCESS'
      WHERE 1=1
    `;
    const params = [hostelId, hostelId];

    if (search) {
      query += ` AND (s.full_name LIKE ? OR s.student_id LIKE ? OR s.course LIKE ? OR s.mobile LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status && status !== 'ALL') {
      query += ` AND a.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY s.id DESC`;

    const [rows] = await pool.query(query, params);
    return res.json({
      success: true,
      message: `${req.warden.hostelName} students retrieved`,
      data: rows
    });
  } catch (err) {
    console.error('Warden students error:', err);
    return res.status(500).json({ success: false, message: err.message, data: null });
  }
});

// GET /api/warden/rooms - Rooms belonging to this Warden's hostel ONLY
router.get('/rooms', async (req, res) => {
  try {
    const hostelId = req.warden.hostelId;
    const [rows] = await pool.query(`
      SELECT r.*,
             COUNT(b.id) AS total_beds,
             SUM(CASE WHEN b.status = 'OCCUPIED' THEN 1 ELSE 0 END) AS occupied_beds,
             SUM(CASE WHEN b.status = 'AVAILABLE' THEN 1 ELSE 0 END) AS available_beds
      FROM rooms r
      LEFT JOIN beds b ON r.id = b.room_id
      WHERE r.hostel_id = ?
      GROUP BY r.id
      ORDER BY r.floor ASC, r.room_number ASC
    `, [hostelId]);

    return res.json({
      success: true,
      message: `${req.warden.hostelName} rooms retrieved`,
      data: rows
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, data: null });
  }
});

// GET /api/warden/beds - Beds belonging to this Warden's hostel ONLY
router.get('/beds', async (req, res) => {
  try {
    const hostelId = req.warden.hostelId;
    const { roomId, status } = req.query;

    let query = `
      SELECT b.*, r.room_number, r.floor, r.capacity, r.hostel_id, h.hostel_name,
             s.full_name AS student_name, s.student_id AS student_prn,
             al.id AS allocation_id, al.allocation_date
      FROM beds b
      JOIN rooms r ON b.room_id = r.id
      JOIN hostels h ON r.hostel_id = h.id
      LEFT JOIN allocations al ON b.id = al.bed_id AND al.status = 'ACTIVE'
      LEFT JOIN students s ON al.student_id = s.id
      WHERE r.hostel_id = ?
    `;
    const params = [hostelId];

    if (roomId) {
      query += ` AND b.room_id = ?`;
      params.push(roomId);
    }

    if (status && status !== 'ALL') {
      query += ` AND b.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY r.room_number ASC, b.bed_number ASC`;

    const [rows] = await pool.query(query, params);
    return res.json({
      success: true,
      message: `${req.warden.hostelName} beds retrieved`,
      data: rows
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, data: null });
  }
});

// GET /api/warden/allocations - Allocations belonging to this Warden's hostel ONLY
router.get('/allocations', async (req, res) => {
  try {
    const hostelId = req.warden.hostelId;
    const [rows] = await pool.query(`
      SELECT al.*, 
             s.full_name AS student_name, s.student_id AS student_prn, s.course, s.mobile,
             r.room_number, r.floor, b.bed_number,
             p.status AS payment_status, p.receipt_number
      FROM allocations al
      JOIN students s ON al.student_id = s.id
      JOIN rooms r ON al.room_id = r.id
      JOIN beds b ON al.bed_id = b.id
      LEFT JOIN payments p ON al.student_id = p.student_id AND p.status = 'SUCCESS'
      WHERE al.hostel_id = ?
      ORDER BY al.id DESC
    `, [hostelId]);

    return res.json({
      success: true,
      message: `${req.warden.hostelName} allocations retrieved`,
      data: rows
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, data: null });
  }
});

// POST /api/warden/allocations - Allocate room & bed (Enforcing only AVAILABLE bed)
router.post('/allocations', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const hostelId = req.warden.hostelId;
    const { studentId, roomId, bedId } = req.body;

    if (!studentId || !roomId || !bedId) {
      return res.status(400).json({
        success: false,
        message: 'Student ID, Room ID, and Bed ID are required for allocation',
        data: null
      });
    }

    await connection.beginTransaction();

    // Verify room belongs to this Warden's hostel
    const [rooms] = await connection.query('SELECT * FROM rooms WHERE id = ? AND hostel_id = ?', [roomId, hostelId]);
    if (rooms.length === 0) {
      await connection.rollback();
      return res.status(403).json({ success: false, message: 'Room does not belong to your assigned hostel', data: null });
    }

    // Verify bed belongs to room and is AVAILABLE
    const [beds] = await connection.query('SELECT * FROM beds WHERE id = ? AND room_id = ? FOR UPDATE', [bedId, roomId]);
    if (beds.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Bed not found in the selected room', data: null });
    }

    if (beds[0].status !== 'AVAILABLE') {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: `Bed ${beds[0].bed_number} is already ${beds[0].status}. Only AVAILABLE beds can be allocated.`,
        data: null
      });
    }

    // Deactivate any previous active allocation for this student
    await connection.query("UPDATE allocations SET status = 'INACTIVE' WHERE student_id = ?", [studentId]);

    // Insert allocation
    const allocatedBy = req.warden.fullName || 'Warden';
    const [allocResult] = await connection.query(
      `INSERT INTO allocations (student_id, hostel_id, room_id, bed_id, status, allocated_by)
       VALUES (?, ?, ?, ?, 'ACTIVE', ?)`,
      [studentId, hostelId, roomId, bedId, allocatedBy]
    );

    // Update bed status to OCCUPIED
    await connection.query("UPDATE beds SET status = 'OCCUPIED' WHERE id = ?", [bedId]);

    // Update room status
    const [bedStats] = await connection.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'OCCUPIED' THEN 1 ELSE 0 END) as occ
      FROM beds WHERE room_id = ?
    `, [roomId]);

    const total = bedStats[0].total;
    const occ = bedStats[0].occ;
    const newRoomStatus = occ >= total ? 'FULL' : (occ > 0 ? 'PARTIALLY_OCCUPIED' : 'AVAILABLE');
    await connection.query('UPDATE rooms SET status = ? WHERE id = ?', [newRoomStatus, roomId]);

    // Send notification to student
    const [stUser] = await connection.query('SELECT user_id, full_name FROM students WHERE id = ?', [studentId]);
    if (stUser.length > 0) {
      await connection.query(
        "INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, 'SUCCESS')",
        [
          stUser[0].user_id,
          'Room & Bed Allocated!',
          `You have been allocated Room ${rooms[0].room_number}, Bed ${beds[0].bed_number} in ${req.warden.hostelName}. Hostel fee payment is now available.`,
        ]
      );
    }

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: `Bed ${beds[0].bed_number} allocated to student successfully.`,
      data: {
        allocationId: allocResult.insertId,
        roomNumber: rooms[0].room_number,
        bedNumber: beds[0].bed_number,
        status: 'ACTIVE'
      }
    });
  } catch (err) {
    await connection.rollback();
    console.error('Warden allocate error:', err);
    return res.status(500).json({ success: false, message: err.message, data: null });
  } finally {
    connection.release();
  }
});

// GET /api/warden/payments - Payments for this Warden's hostel ONLY
router.get('/payments', async (req, res) => {
  try {
    const hostelId = req.warden.hostelId;
    const { status, search } = req.query;

    let query = `
      SELECT p.*, s.full_name AS student_name, s.student_id AS student_prn, s.mobile,
             a.id AS application_id, h.hostel_name
      FROM payments p
      JOIN students s ON p.student_id = s.id
      JOIN applications a ON p.application_id = a.id
      JOIN hostels h ON a.hostel_id = h.id
      WHERE a.hostel_id = ?
    `;
    const params = [hostelId];

    if (status && status !== 'ALL') {
      query += ` AND p.status = ?`;
      params.push(status);
    }

    if (search) {
      query += ` AND (s.full_name LIKE ? OR s.student_id LIKE ? OR p.receipt_number LIKE ? OR p.transaction_id LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY p.id DESC`;

    const [rows] = await pool.query(query, params);
    return res.json({
      success: true,
      message: `${req.warden.hostelName} payments retrieved`,
      data: rows
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, data: null });
  }
});

// GET /api/warden/reports - Comprehensive filtered reports for this Warden's hostel ONLY
router.get('/reports', async (req, res) => {
  try {
    const hostelId = req.warden.hostelId;

    const [occupancy] = await pool.query(`
      SELECT r.room_number, r.floor, r.capacity, r.status AS room_status,
             COUNT(b.id) AS total_beds,
             SUM(CASE WHEN b.status = 'OCCUPIED' THEN 1 ELSE 0 END) AS occupied_beds,
             SUM(CASE WHEN b.status = 'AVAILABLE' THEN 1 ELSE 0 END) AS available_beds
      FROM rooms r
      LEFT JOIN beds b ON r.id = b.room_id
      WHERE r.hostel_id = ?
      GROUP BY r.id
      ORDER BY r.floor ASC, r.room_number ASC
    `, [hostelId]);

    const [students] = await pool.query(`
      SELECT s.student_id, s.full_name, s.course, s.academic_year, s.mobile, s.email,
             r.room_number, b.bed_number, al.allocation_date, p.status AS payment_status
      FROM students s
      JOIN allocations al ON s.id = al.student_id AND al.hostel_id = ? AND al.status = 'ACTIVE'
      JOIN rooms r ON al.room_id = r.id
      JOIN beds b ON al.bed_id = b.id
      LEFT JOIN applications a ON s.id = a.student_id AND a.hostel_id = ?
      LEFT JOIN payments p ON a.id = p.application_id AND p.status = 'SUCCESS'
      ORDER BY r.room_number ASC, b.bed_number ASC
    `, [hostelId, hostelId]);

    const [appSummary] = await pool.query(`
      SELECT status, COUNT(*) AS count
      FROM applications
      WHERE hostel_id = ?
      GROUP BY status
    `, [hostelId]);

    const [paymentSummary] = await pool.query(`
      SELECT p.status, COUNT(*) as count, COALESCE(SUM(p.amount), 0) as total_amount
      FROM payments p
      JOIN applications a ON p.application_id = a.id
      WHERE a.hostel_id = ?
      GROUP BY p.status
    `, [hostelId]);

    return res.json({
      success: true,
      message: `${req.warden.hostelName} reports generated successfully`,
      data: {
        hostelId: req.warden.hostelId,
        hostelName: req.warden.hostelName,
        wardenName: req.warden.fullName,
        generatedAt: new Date().toISOString(),
        occupancyReport: occupancy,
        studentResidentReport: students,
        applicationSummary: appSummary,
        paymentSummary: paymentSummary
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, data: null });
  }
});

module.exports = router;
