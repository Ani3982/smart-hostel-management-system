const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const upload = require('../middleware/upload');
const { authenticate, authorize } = require('../middleware/auth');

// POST /api/documents/upload
router.post('/upload', authenticate, upload.single('file'), async (req, res) => {
  try {
    const documentType = req.body.documentType || 'IDENTITY_PROOF';
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'File is required', data: null });
    }

    const [students] = await pool.query('SELECT id FROM students WHERE user_id = ?', [req.user.id]);
    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student profile not found', data: null });
    }
    const studentId = students[0].id;
    const fileUrl = `/uploads/${req.file.filename}`;

    const [result] = await pool.query(
      `INSERT INTO documents (student_id, document_type, file_name, file_url, verification_status)
       VALUES (?, ?, ?, ?, 'PENDING')`,
      [studentId, documentType, req.file.originalname, fileUrl]
    );

    return res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: {
        id: result.insertId,
        fileName: req.file.originalname,
        fileUrl,
        documentType,
        verificationStatus: 'PENDING'
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, data: null });
  }
});

// GET /api/documents/my-documents
router.get('/my-documents', authenticate, async (req, res) => {
  try {
    const [students] = await pool.query('SELECT id FROM students WHERE user_id = ?', [req.user.id]);
    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student profile not found', data: null });
    }

    const [rows] = await pool.query(
      `SELECT id, document_type AS documentType, file_name AS fileName, 
              file_url AS fileUrl, verification_status AS verificationStatus, uploaded_at AS uploadedAt
       FROM documents 
       WHERE student_id = ? 
       ORDER BY id DESC`,
      [students[0].id]
    );

    return res.json({ success: true, message: 'My documents retrieved', data: rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, data: null });
  }
});

// GET /api/documents/student/:studentId
router.get('/student/:studentId', authenticate, authorize('BOYS_WARDEN', 'GIRLS_WARDEN', 'HOSTEL_HEAD'), async (req, res) => {
  try {
    const userRole = (req.user.role || '').toUpperCase().replace(/^ROLE_/, '');
    const [students] = await pool.query('SELECT gender FROM students WHERE id = ?', [req.params.studentId]);
    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found', data: null });
    }
    if (userRole === 'BOYS_WARDEN' && students[0].gender !== 'MALE') {
      return res.status(403).json({ success: false, message: 'Access Denied: Boys Warden cannot view Girls student documents.', data: null });
    }
    if (userRole === 'GIRLS_WARDEN' && students[0].gender !== 'FEMALE') {
      return res.status(403).json({ success: false, message: 'Access Denied: Girls Warden cannot view Boys student documents.', data: null });
    }

    const [rows] = await pool.query(
      `SELECT id, document_type AS documentType, file_name AS fileName, 
              file_url AS fileUrl, verification_status AS verificationStatus, uploaded_at AS uploadedAt
       FROM documents 
       WHERE student_id = ? 
       ORDER BY id DESC`,
      [req.params.studentId]
    );

    return res.json({ success: true, message: 'Student documents retrieved', data: rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, data: null });
  }
});

module.exports = router;
