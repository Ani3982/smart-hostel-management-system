const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticate, authorize, enforceHostelIsolation } = require('../middleware/auth');

const formatStudent = (s) => ({
  id: s.id,
  studentId: s.student_id,
  fullName: s.full_name,
  dob: s.dob,
  gender: s.gender,
  mobile: s.mobile,
  email: s.email,
  address: s.address,
  city: s.city,
  state: s.state,
  pincode: s.pincode,
  collegeName: s.college_name,
  course: s.course,
  department: s.department,
  academicYear: s.academic_year,
  rollNumber: s.roll_number,
  parentName: s.parent_name,
  parentMobile: s.parent_mobile,
  emergencyContact: s.emergency_contact,
  createdAt: s.created_at,
  updatedAt: s.updated_at
});

// GET /api/students - Filtered strictly by Warden's hostel type
router.get('/', authenticate, authorize('BOYS_WARDEN', 'GIRLS_WARDEN', 'HOSTEL_HEAD'), async (req, res) => {
  try {
    const search = req.query.search || '';
    const userRole = (req.user.role || '').toUpperCase().replace(/^ROLE_/, '');
    const hostelType = req.user.hostelType || (userRole === 'GIRLS_WARDEN' ? 'GIRLS' : (userRole === 'BOYS_WARDEN' ? 'BOYS' : null));

    let query = 'SELECT * FROM students WHERE 1=1';
    const params = [];

    // Data isolation: Boys warden sees only boys, Girls warden sees only girls
    if (hostelType === 'BOYS' || userRole === 'BOYS_WARDEN') {
      query += " AND gender = 'MALE'";
    } else if (hostelType === 'GIRLS' || userRole === 'GIRLS_WARDEN') {
      query += " AND gender = 'FEMALE'";
    }

    if (search) {
      query += ` AND (full_name LIKE ? OR student_id LIKE ? OR email LIKE ? OR roll_number LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY id DESC';
    const [rows] = await pool.query(query, params);
    return res.json({ success: true, message: 'Students retrieved', data: rows.map(formatStudent) });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, data: null });
  }
});

// GET /api/students/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM students WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found', data: null });
    }
    return res.json({ success: true, message: 'Student retrieved', data: formatStudent(rows[0]) });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, data: null });
  }
});

// GET /api/students/user/:userId
router.get('/user/:userId', authenticate, async (req, res) => {
  try {
    const rawId = req.params.userId;
    const targetUserId = (!rawId || rawId === 'undefined' || rawId === 'null' || rawId === 'me')
      ? req.user.id
      : rawId;

    const [rows] = await pool.query('SELECT * FROM students WHERE user_id = ?', [targetUserId]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found', data: null });
    }
    return res.json({ success: true, message: 'Student retrieved', data: formatStudent(rows[0]) });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, data: null });
  }
});

// GET /api/students/hostel/:hostelId
router.get('/hostel/:hostelId', authenticate, authorize('BOYS_WARDEN', 'GIRLS_WARDEN', 'HOSTEL_HEAD'), enforceHostelIsolation, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT s.* 
      FROM students s
      JOIN allocations al ON al.student_id = s.id
      WHERE al.hostel_id = ? AND al.status = 'ACTIVE'
      ORDER BY s.id DESC
    `, [req.params.hostelId]);

    return res.json({ success: true, message: 'Hostel students retrieved', data: rows.map(formatStudent) });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, data: null });
  }
});

// PUT /api/students/:id
router.put('/:id', authenticate, async (req, res) => {
  try {
    const {
      fullName, dob, gender, mobile, address, city, state, pincode,
      course, department, academicYear, rollNumber, parentName,
      parentMobile, emergencyContact
    } = req.body;

    // Strict 10-digit mobile number validation
    const mobileRegex = /^[0-9]{10}$/;
    if (mobile !== undefined && mobile !== null) {
      const cleanMobile = String(mobile).replace(/\D/g, '');
      if (!cleanMobile || cleanMobile.length !== 10) {
        return res.status(400).json({
          success: false,
          message: 'Invalid mobile number. Only 10-digit mobile number is allowed.',
          data: null
        });
      }
    }
    if (parentMobile !== undefined && parentMobile !== null && String(parentMobile).trim() !== '') {
      const cleanParentMobile = String(parentMobile).replace(/\D/g, '');
      if (cleanParentMobile.length !== 10) {
        return res.status(400).json({
          success: false,
          message: 'Invalid parent mobile number. Only 10-digit mobile number is allowed.',
          data: null
        });
      }
    }
    if (emergencyContact !== undefined && emergencyContact !== null && String(emergencyContact).trim() !== '') {
      const cleanEmergency = String(emergencyContact).replace(/\D/g, '');
      if (cleanEmergency.length !== 10) {
        return res.status(400).json({
          success: false,
          message: 'Invalid emergency contact number. Only 10-digit number is allowed.',
          data: null
        });
      }
    }
    if (pincode !== undefined && pincode !== null) {
      const cleanPincode = String(pincode).replace(/\D/g, '');
      if (!cleanPincode || cleanPincode.length !== 6) {
        return res.status(400).json({
          success: false,
          message: 'Invalid PIN code. Only 6-digit PIN code is allowed.',
          data: null
        });
      }
    }

    await pool.query(`
      UPDATE students SET
        full_name = COALESCE(?, full_name),
        dob = COALESCE(?, dob),
        gender = COALESCE(?, gender),
        mobile = COALESCE(?, mobile),
        address = COALESCE(?, address),
        city = COALESCE(?, city),
        state = COALESCE(?, state),
        pincode = COALESCE(?, pincode),
        course = COALESCE(?, course),
        department = COALESCE(?, department),
        academic_year = COALESCE(?, academic_year),
        roll_number = COALESCE(?, roll_number),
        parent_name = COALESCE(?, parent_name),
        parent_mobile = COALESCE(?, parent_mobile),
        emergency_contact = COALESCE(?, emergency_contact)
      WHERE id = ?
    `, [
      fullName, dob, gender, mobile, address, city, state, pincode,
      course, department, academicYear, rollNumber, parentName,
      parentMobile, emergencyContact, req.params.id
    ]);

    const [rows] = await pool.query('SELECT * FROM students WHERE id = ?', [req.params.id]);
    return res.json({ success: true, message: 'Student profile updated', data: formatStudent(rows[0]) });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, data: null });
  }
});

module.exports = router;
