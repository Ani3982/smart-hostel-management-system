const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');

// Format complaint record for response
const formatComplaint = (row) => ({
  id: row.id,
  studentId: row.student_id,
  studentName: row.student_name,
  prn: row.student_prn,
  hostelId: row.hostel_id,
  roomNumber: row.room_number || 'General',
  bedNumber: row.bed_number || '—',
  category: row.category,
  title: row.title || `${row.category} Grievance`,
  description: row.description,
  status: row.status,
  urgency: row.urgency || 'MEDIUM',
  remarks: row.warden_remarks || '',
  wardenRemarks: row.warden_remarks || '',
  date: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : '',
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  resolvedAt: row.resolved_at
});

// GET /api/complaints - Fetch complaints based on role
router.get('/', authenticate, async (req, res) => {
  try {
    const rawRole = req.user.role.replace(/^ROLE_/, '');
    const { status, hostelId } = req.query;

    let query = 'SELECT * FROM complaints';
    const params = [];
    const conditions = [];

    if (rawRole === 'STUDENT') {
      // Find student record for this user
      const [students] = await pool.query('SELECT id FROM students WHERE user_id = ?', [req.user.id]);
      if (students.length === 0) {
        return res.json({ success: true, message: 'No student found', data: [] });
      }
      conditions.push('student_id = ?');
      params.push(students[0].id);
    } else if (rawRole === 'BOYS_WARDEN') {
      conditions.push('hostel_id = 1');
    } else if (rawRole === 'GIRLS_WARDEN') {
      conditions.push('hostel_id = 2');
    } else if (hostelId) {
      conditions.push('hostel_id = ?');
      params.push(parseInt(hostelId, 10));
    }

    if (status && status !== 'ALL') {
      conditions.push('status = ?');
      params.push(status);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY id DESC';

    const [rows] = await pool.query(query, params);
    const data = rows.map(formatComplaint);

    return res.json({
      success: true,
      message: 'Complaints fetched successfully',
      data
    });
  } catch (err) {
    console.error('Error fetching complaints:', err);
    return res.status(500).json({ success: false, message: 'Server error fetching complaints', data: null });
  }
});

// POST /api/complaints - Student lodges a new complaint
router.post('/', authenticate, async (req, res) => {
  try {
    const { category, title, description, urgency, roomNumber, bedNumber } = req.body;

    if (!category || !description) {
      return res.status(400).json({
        success: false,
        message: 'Category and description are required to submit a complaint'
      });
    }

    // Get student details
    const [students] = await pool.query(
      'SELECT id, user_id, full_name, student_id, gender FROM students WHERE user_id = ?',
      [req.user.id]
    );

    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student record not found' });
    }

    const student = students[0];

    // Determine room, bed, and hostel from active allocation or application
    let finalRoomNumber = roomNumber || '';
    let finalBedNumber = bedNumber || '';
    let targetHostelId = student.gender === 'FEMALE' ? 2 : 1;

    // Check allocation
    const [allocs] = await pool.query(
      `SELECT al.hostel_id, r.room_number, b.bed_number 
       FROM allocations al
       JOIN rooms r ON al.room_id = r.id
       JOIN beds b ON al.bed_id = b.id
       WHERE al.student_id = ? AND al.status = 'ACTIVE'
       ORDER BY al.id DESC LIMIT 1`,
      [student.id]
    );

    if (allocs.length > 0) {
      targetHostelId = allocs[0].hostel_id;
      if (!finalRoomNumber) finalRoomNumber = allocs[0].room_number;
      if (!finalBedNumber) finalBedNumber = allocs[0].bed_number;
    } else {
      // Check application for hostel
      const [apps] = await pool.query(
        'SELECT hostel_id FROM applications WHERE student_id = ? ORDER BY id DESC LIMIT 1',
        [student.id]
      );
      if (apps.length > 0) {
        targetHostelId = apps[0].hostel_id;
      }
      if (!finalRoomNumber) finalRoomNumber = 'General / Campus';
      if (!finalBedNumber) finalBedNumber = '—';
    }

    const complaintTitle = title || `${category} issue reported in Room ${finalRoomNumber}`;
    const complaintUrgency = urgency || 'MEDIUM';

    const [result] = await pool.query(
      `INSERT INTO complaints (
        student_id, student_name, student_prn, hostel_id, room_number, bed_number,
        category, title, description, status, urgency
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?)`,
      [
        student.id,
        student.full_name,
        student.student_id,
        targetHostelId,
        finalRoomNumber,
        finalBedNumber,
        category,
        complaintTitle,
        description,
        complaintUrgency
      ]
    );

    const newId = result.insertId;

    // Notify Hostel Warden
    try {
      const wardenRole = targetHostelId === 2 ? 'ROLE_GIRLS_WARDEN' : 'ROLE_BOYS_WARDEN';
      const [wardenUsers] = await pool.query('SELECT id FROM app_users WHERE role = ?', [wardenRole]);
      for (const w of wardenUsers) {
        await pool.query(
          `INSERT INTO notifications (user_id, title, message, type)
           VALUES (?, ?, ?, 'WARNING')`,
          [
            w.id,
            `New Grievance: ${category} (Room ${finalRoomNumber})`,
            `Student ${student.full_name} (${student.student_id}) lodged a ${complaintUrgency} priority complaint: "${description.substring(0, 80)}..."`
          ]
        );
      }
    } catch (notifErr) {
      console.warn('Could not dispatch notification to warden:', notifErr.message);
    }

    const [createdRows] = await pool.query('SELECT * FROM complaints WHERE id = ?', [newId]);
    const createdComplaint = formatComplaint(createdRows[0]);

    return res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully to Warden Office',
      data: createdComplaint
    });
  } catch (err) {
    console.error('Error creating complaint:', err);
    return res.status(500).json({ success: false, message: 'Server error creating complaint', data: null });
  }
});

// PATCH /api/complaints/:id/status - Warden updates complaint status & remarks
router.patch('/:id/status', authenticate, async (req, res) => {
  try {
    const rawRole = req.user.role.replace(/^ROLE_/, '');
    if (!['BOYS_WARDEN', 'GIRLS_WARDEN', 'HOSTEL_HEAD', 'ADMIN'].includes(rawRole)) {
      return res.status(403).json({ success: false, message: 'Only wardens can update complaint status' });
    }

    const complaintId = parseInt(req.params.id, 10);
    const { status, remarks } = req.body;

    if (!status || !['PENDING', 'IN_PROGRESS', 'RESOLVED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Valid status (PENDING, IN_PROGRESS, RESOLVED) is required' });
    }

    const [existing] = await pool.query('SELECT * FROM complaints WHERE id = ?', [complaintId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    const resolvedAtVal = status === 'RESOLVED' ? new Date() : null;

    await pool.query(
      `UPDATE complaints 
       SET status = ?, 
           warden_remarks = COALESCE(?, warden_remarks),
           resolved_at = ?
       WHERE id = ?`,
      [status, remarks || null, resolvedAtVal, complaintId]
    );

    // Notify student about update
    try {
      const [stud] = await pool.query('SELECT user_id, full_name FROM students WHERE id = ?', [existing[0].student_id]);
      if (stud.length > 0) {
        const notifType = status === 'RESOLVED' ? 'SUCCESS' : 'INFO';
        await pool.query(
          `INSERT INTO notifications (user_id, title, message, type)
           VALUES (?, ?, ?, ?)`,
          [
            stud[0].user_id,
            `Grievance Status: ${status.replace('_', ' ')}`,
            `Your complaint regarding "${existing[0].category}" has been updated to ${status.replace('_', ' ')}. Warden remarks: "${remarks || existing[0].warden_remarks || 'Inspection in progress'}"`,
            notifType
          ]
        );
      }
    } catch (notifErr) {
      console.warn('Could not dispatch notification to student:', notifErr.message);
    }

    const [updatedRows] = await pool.query('SELECT * FROM complaints WHERE id = ?', [complaintId]);
    return res.json({
      success: true,
      message: 'Complaint updated successfully',
      data: formatComplaint(updatedRows[0])
    });
  } catch (err) {
    console.error('Error updating complaint status:', err);
    return res.status(500).json({ success: false, message: 'Server error updating complaint', data: null });
  }
});

// DELETE /api/complaints/:id - Delete a complaint
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const complaintId = parseInt(req.params.id, 10);
    const [existing] = await pool.query('SELECT * FROM complaints WHERE id = ?', [complaintId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    await pool.query('DELETE FROM complaints WHERE id = ?', [complaintId]);
    return res.json({ success: true, message: 'Complaint deleted successfully' });
  } catch (err) {
    console.error('Error deleting complaint:', err);
    return res.status(500).json({ success: false, message: 'Server error deleting complaint' });
  }
});

module.exports = router;
