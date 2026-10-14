const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/beds
router.get('/', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT b.id, b.bed_number AS bedNumber, b.status, b.created_at AS createdAt,
             r.id AS room_id, r.room_number AS room_number, r.floor AS room_floor,
             h.id AS hostel_id, h.hostel_name AS hostel_name
      FROM beds b
      JOIN rooms r ON b.room_id = r.id
      JOIN hostels h ON r.hostel_id = h.id
      ORDER BY r.hostel_id ASC, b.bed_number ASC
    `);

    const data = rows.map(b => ({
      id: b.id,
      bedNumber: b.bedNumber,
      status: b.status,
      createdAt: b.createdAt,
      room: {
        id: b.room_id,
        roomNumber: b.room_number,
        floor: b.room_floor,
        hostel: {
          id: b.hostel_id,
          hostelName: b.hostel_name
        }
      }
    }));

    return res.json({ success: true, message: 'Beds retrieved', data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, data: null });
  }
});

// GET /api/beds/room/:roomId
router.get('/room/:roomId', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT b.id, b.bed_number AS bedNumber, b.status, b.created_at AS createdAt
      FROM beds b
      WHERE b.room_id = ?
      ORDER BY b.bed_number ASC
    `, [req.params.roomId]);

    return res.json({ success: true, message: 'Room beds retrieved', data: rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, data: null });
  }
});

// GET /api/beds/hostel/:hostelId
router.get('/hostel/:hostelId', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT b.id, b.bed_number AS bedNumber, b.status, b.created_at AS createdAt,
             r.id AS room_id, r.room_number AS room_number, r.floor AS room_floor
      FROM beds b
      JOIN rooms r ON b.room_id = r.id
      WHERE r.hostel_id = ?
      ORDER BY b.bed_number ASC
    `, [req.params.hostelId]);

    const data = rows.map(b => ({
      id: b.id,
      bedNumber: b.bedNumber,
      status: b.status,
      createdAt: b.createdAt,
      room: {
        id: b.room_id,
        roomNumber: b.room_number,
        floor: b.room_floor
      }
    }));

    return res.json({ success: true, message: 'Hostel beds retrieved', data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, data: null });
  }
});

// GET /api/beds/available/:hostelId
router.get('/available/:hostelId', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT b.id, b.bed_number AS bedNumber, b.status, b.created_at AS createdAt,
             r.id AS room_id, r.room_number AS room_number, r.floor AS room_floor
      FROM beds b
      JOIN rooms r ON b.room_id = r.id
      WHERE r.hostel_id = ? AND b.status = 'AVAILABLE'
      ORDER BY b.bed_number ASC
    `, [req.params.hostelId]);

    const data = rows.map(b => ({
      id: b.id,
      bedNumber: b.bedNumber,
      status: b.status,
      createdAt: b.createdAt,
      room: {
        id: b.room_id,
        roomNumber: b.room_number,
        floor: b.room_floor
      }
    }));

    return res.json({ success: true, message: 'Available beds retrieved', data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, data: null });
  }
});

// POST /api/beds
router.post('/', authenticate, authorize('BOYS_WARDEN', 'GIRLS_WARDEN', 'HOSTEL_HEAD'), async (req, res) => {
  try {
    const userRole = (req.user.role || '').toUpperCase().replace(/^ROLE_/, '');
    const { roomId, bedNumber } = req.body;

    const [rooms] = await pool.query('SELECT hostel_id FROM rooms WHERE id = ?', [roomId]);
    if (rooms.length === 0) {
      return res.status(404).json({ success: false, message: 'Room not found', data: null });
    }
    if (userRole === 'BOYS_WARDEN' && rooms[0].hostel_id !== 1) {
      return res.status(403).json({ success: false, message: 'Access Denied: Boys Warden can only add beds in Boys Hostel.', data: null });
    }
    if (userRole === 'GIRLS_WARDEN' && rooms[0].hostel_id !== 2) {
      return res.status(403).json({ success: false, message: 'Access Denied: Girls Warden can only add beds in Girls Hostel.', data: null });
    }

    const [result] = await pool.query(
      'INSERT INTO beds (room_id, bed_number, status) VALUES (?, ?, "AVAILABLE")',
      [roomId, bedNumber]
    );
    return res.status(201).json({ success: true, message: 'Bed created successfully', data: { id: result.insertId, bedNumber } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, data: null });
  }
});

// PUT /api/beds/:id/status?status=...
router.put('/:id/status', authenticate, authorize('BOYS_WARDEN', 'GIRLS_WARDEN', 'HOSTEL_HEAD'), async (req, res) => {
  try {
    const userRole = (req.user.role || '').toUpperCase().replace(/^ROLE_/, '');
    const [beds] = await pool.query(`
      SELECT r.hostel_id 
      FROM beds b
      JOIN rooms r ON b.room_id = r.id
      WHERE b.id = ?
    `, [req.params.id]);

    if (beds.length === 0) {
      return res.status(404).json({ success: false, message: 'Bed not found', data: null });
    }
    if (userRole === 'BOYS_WARDEN' && beds[0].hostel_id !== 1) {
      return res.status(403).json({ success: false, message: 'Access Denied: Boys Warden can only update Boys Hostel beds.', data: null });
    }
    if (userRole === 'GIRLS_WARDEN' && beds[0].hostel_id !== 2) {
      return res.status(403).json({ success: false, message: 'Access Denied: Girls Warden can only update Girls Hostel beds.', data: null });
    }

    const status = req.query.status || req.body.status;
    await pool.query('UPDATE beds SET status = ? WHERE id = ?', [status, req.params.id]);
    return res.json({ success: true, message: 'Bed status updated successfully', data: { id: req.params.id, status } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, data: null });
  }
});

module.exports = router;
