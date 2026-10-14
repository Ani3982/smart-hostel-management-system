const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticate, authorize, enforceHostelIsolation } = require('../middleware/auth');

// Helper to format application record with complete student details
const formatApplication = (row) => ({
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
    hostelType: row.hostel_type,
    address: row.hostel_address
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
         h.id AS hostel_id, h.hostel_name AS hostel_name, h.hostel_type AS hostel_type,
         h.address AS hostel_address
  FROM applications a
  JOIN students s ON a.student_id = s.id
  JOIN hostels h ON a.hostel_id = h.id
`;

// GET /api/applications
router.get('/', authenticate, authorize('BOYS_WARDEN', 'GIRLS_WARDEN', 'HOSTEL_HEAD'), async (req, res) => {
  try {
    const userRole = (req.user.role || '').toUpperCase().replace(/^ROLE_/, '');
    let query = `${APP_SELECT} WHERE 1=1`;
    const params = [];

    if (userRole === 'BOYS_WARDEN') {
      query += ' AND a.hostel_id = 1';
    } else if (userRole === 'GIRLS_WARDEN') {
      query += ' AND a.hostel_id = 2';
    }

    query += ' ORDER BY a.id DESC';
    const [rows] = await pool.query(query, params);
    return res.json({ success: true, message: 'Applications retrieved', data: rows.map(formatApplication) });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, data: null });
  }
});

// GET /api/applications/pending
router.get('/pending', authenticate, authorize('BOYS_WARDEN', 'GIRLS_WARDEN', 'HOSTEL_HEAD'), async (req, res) => {
  try {
    const userRole = (req.user.role || '').toUpperCase().replace(/^ROLE_/, '');
    let query = `${APP_SELECT} WHERE a.status = 'PENDING'`;
    const params = [];

    if (userRole === 'BOYS_WARDEN') {
      query += ' AND a.hostel_id = 1';
    } else if (userRole === 'GIRLS_WARDEN') {
      query += ' AND a.hostel_id = 2';
    }

    query += ' ORDER BY a.id DESC';
    const [rows] = await pool.query(query, params);
    return res.json({ success: true, message: 'Pending applications retrieved', data: rows.map(formatApplication) });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, data: null });
  }
});

// GET /api/applications/my-application and /api/applications/my
router.get(['/my-application', '/my'], authenticate, async (req, res) => {
  try {
    const [students] = await pool.query('SELECT id FROM students WHERE user_id = ?', [req.user.id]);
    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student profile not found', data: null });
    }

    const [rows] = await pool.query(`${APP_SELECT} WHERE a.student_id = ? ORDER BY a.id DESC LIMIT 1`, [students[0].id]);
    if (rows.length === 0) {
      return res.json({ success: true, message: 'No application found', data: null });
    }

    return res.json({ success: true, message: 'My application retrieved', data: formatApplication(rows[0]) });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, data: null });
  }
});

// GET /api/applications/hostel/:hostelId
router.get('/hostel/:hostelId', authenticate, authorize('BOYS_WARDEN', 'GIRLS_WARDEN', 'HOSTEL_HEAD'), enforceHostelIsolation, async (req, res) => {
  try {
    const { hostelId } = req.params;
    const search = req.query.search || '';

    let query = `${APP_SELECT} WHERE a.hostel_id = ?`;
    const params = [hostelId];

    if (search) {
      query += ` AND (s.full_name LIKE ? OR s.student_id LIKE ? OR s.course LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY a.id DESC`;

    const [rows] = await pool.query(query, params);
    return res.json({ success: true, message: 'Hostel applications retrieved', data: rows.map(formatApplication) });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, data: null });
  }
});

// GET /api/applications/hostel/:hostelId/pending
router.get('/hostel/:hostelId/pending', authenticate, authorize('BOYS_WARDEN', 'GIRLS_WARDEN', 'HOSTEL_HEAD'), enforceHostelIsolation, async (req, res) => {
  try {
    const [rows] = await pool.query(`${APP_SELECT} WHERE a.hostel_id = ? AND a.status = 'PENDING' ORDER BY a.id DESC`, [req.params.hostelId]);
    return res.json({ success: true, message: 'Pending hostel applications retrieved', data: rows.map(formatApplication) });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, data: null });
  }
});

// GET /api/applications/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.query(`${APP_SELECT} WHERE a.id = ?`, [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Application not found', data: null });
    }
    return res.json({ success: true, message: 'Application retrieved', data: formatApplication(rows[0]) });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, data: null });
  }
});

// POST /api/applications
router.post('/', authenticate, async (req, res) => {
  try {
    const [students] = await pool.query('SELECT id FROM students WHERE user_id = ?', [req.user.id]);
    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student profile not found', data: null });
    }
    const studentId = students[0].id;
    const { hostelId, preferredRoomType, remarks } = req.body;

    const [existing] = await pool.query(
      'SELECT id FROM applications WHERE student_id = ? AND status IN ("PENDING", "APPROVED")',
      [studentId]
    );
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'You already have an active application', data: null });
    }

    const [result] = await pool.query(
      `INSERT INTO applications (student_id, hostel_id, preferred_room_type, remarks, status)
       VALUES (?, ?, ?, ?, 'PENDING')`,
      [studentId, hostelId, preferredRoomType || 'Standard 4-Sharing', remarks || '']
    );

    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: { id: result.insertId }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, data: null });
  }
});

// PUT /api/applications/:id/approve
router.put('/:id/approve', authenticate, authorize('BOYS_WARDEN', 'GIRLS_WARDEN', 'HOSTEL_HEAD'), async (req, res) => {
  try {
    const userRole = (req.user.role || '').toUpperCase().replace(/^ROLE_/, '');
    const [existing] = await pool.query('SELECT hostel_id FROM applications WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Application not found', data: null });
    }
    if (userRole === 'BOYS_WARDEN' && existing[0].hostel_id !== 1) {
      return res.status(403).json({ success: false, message: 'Access Denied: Boys Warden can only approve Boys Hostel applications.', data: null });
    }
    if (userRole === 'GIRLS_WARDEN' && existing[0].hostel_id !== 2) {
      return res.status(403).json({ success: false, message: 'Access Denied: Girls Warden can only approve Girls Hostel applications.', data: null });
    }

    const approvedBy = req.user.name || 'Warden';
    await pool.query(
      `UPDATE applications 
       SET status = 'APPROVED', approved_by = ?, approved_date = NOW() 
       WHERE id = ?`,
      [approvedBy, req.params.id]
    );

    const [rows] = await pool.query(`${APP_SELECT} WHERE a.id = ?`, [req.params.id]);
    if (rows.length > 0) {
      const app = rows[0];
      await pool.query(
        `INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)`,
        [
          app.student_user_id,
          'Hostel Admission Confirmed & Approved!',
          `Congratulations! Your hostel admission application for ${app.hostel_name} has been approved by ${approvedBy}. Please check your student portal to view next steps.`,
          'SUCCESS'
        ]
      );
    }

    return res.json({
      success: true,
      message: 'Application approved successfully',
      data: formatApplication(rows[0])
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, data: null });
  }
});

// PUT /api/applications/:id/reject
router.put('/:id/reject', authenticate, authorize('BOYS_WARDEN', 'GIRLS_WARDEN', 'HOSTEL_HEAD'), async (req, res) => {
  try {
    const userRole = (req.user.role || '').toUpperCase().replace(/^ROLE_/, '');
    const [existing] = await pool.query('SELECT hostel_id FROM applications WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Application not found', data: null });
    }
    if (userRole === 'BOYS_WARDEN' && existing[0].hostel_id !== 1) {
      return res.status(403).json({ success: false, message: 'Access Denied: Boys Warden can only reject Boys Hostel applications.', data: null });
    }
    if (userRole === 'GIRLS_WARDEN' && existing[0].hostel_id !== 2) {
      return res.status(403).json({ success: false, message: 'Access Denied: Girls Warden can only reject Girls Hostel applications.', data: null });
    }

    const reason = req.body.reason || 'Criteria not met';
    await pool.query(
      `UPDATE applications 
       SET status = 'REJECTED', rejection_reason = ? 
       WHERE id = ?`,
      [reason, req.params.id]
    );

    const [rows] = await pool.query(`${APP_SELECT} WHERE a.id = ?`, [req.params.id]);
    if (rows.length > 0) {
      const app = rows[0];
      await pool.query(
        `INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)`,
        [
          app.student_user_id,
          'Hostel Admission Application Update',
          `Your application for ${app.hostel_name} has been updated to REJECTED. Reason: ${reason}. Please visit the Warden office for further details.`,
          'WARNING'
        ]
      );
    }

    return res.json({
      success: true,
      message: 'Application rejected',
      data: formatApplication(rows[0])
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, data: null });
  }
});

module.exports = router;
