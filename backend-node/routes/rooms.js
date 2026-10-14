const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticate, authorize, enforceHostelIsolation } = require('../middleware/auth');

// GET /api/rooms
router.get('/', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT r.id, r.room_number AS roomNumber, r.floor, r.capacity, 
             r.room_type AS roomType, r.status, r.created_at AS createdAt,
             h.id AS hostel_id, h.hostel_name AS hostel_name, h.hostel_type AS hostel_type
      FROM rooms r
      JOIN hostels h ON r.hostel_id = h.id
      ORDER BY r.hostel_id ASC, r.room_number ASC
    `);

    const data = rows.map(r => ({
      id: r.id,
      roomNumber: r.roomNumber,
      floor: r.floor,
      capacity: r.capacity,
      roomType: r.roomType,
      status: r.status,
      createdAt: r.createdAt,
      hostel: {
        id: r.hostel_id,
        hostelName: r.hostel_name,
        hostelType: r.hostel_type
      }
    }));

    return res.json({ success: true, message: 'Rooms retrieved', data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, data: null });
  }
});

// GET /api/rooms/hostel/:hostelId
router.get('/hostel/:hostelId', authenticate, async (req, res) => {
  try {
    const { hostelId } = req.params;
    const search = req.query.search || '';

    let query = `
      SELECT r.id, r.room_number AS roomNumber, r.floor, r.capacity, 
             r.room_type AS roomType, r.status, r.created_at AS createdAt,
             h.id AS hostel_id, h.hostel_name AS hostel_name, h.hostel_type AS hostel_type
      FROM rooms r
      JOIN hostels h ON r.hostel_id = h.id
      WHERE r.hostel_id = ?
    `;
    const params = [hostelId];

    if (search) {
      query += ` AND (r.room_number LIKE ? OR r.room_type LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY r.room_number ASC`;

    const [rows] = await pool.query(query, params);
    const data = rows.map(r => ({
      id: r.id,
      roomNumber: r.roomNumber,
      floor: r.floor,
      capacity: r.capacity,
      roomType: r.roomType,
      status: r.status,
      createdAt: r.createdAt,
      hostel: {
        id: r.hostel_id,
        hostelName: r.hostel_name,
        hostelType: r.hostel_type
      }
    }));

    return res.json({ success: true, message: 'Rooms retrieved', data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, data: null });
  }
});

// GET /api/rooms/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT r.id, r.room_number AS roomNumber, r.floor, r.capacity, 
             r.room_type AS roomType, r.status, r.created_at AS createdAt,
             h.id AS hostel_id, h.hostel_name AS hostel_name, h.hostel_type AS hostel_type
      FROM rooms r
      JOIN hostels h ON r.hostel_id = h.id
      WHERE r.id = ?
    `, [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Room not found', data: null });
    }

    const r = rows[0];
    const data = {
      id: r.id,
      roomNumber: r.roomNumber,
      floor: r.floor,
      capacity: r.capacity,
      roomType: r.roomType,
      status: r.status,
      createdAt: r.createdAt,
      hostel: {
        id: r.hostel_id,
        hostelName: r.hostel_name,
        hostelType: r.hostel_type
      }
    };

    return res.json({ success: true, message: 'Room retrieved', data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, data: null });
  }
});

// POST /api/rooms
router.post('/', authenticate, authorize('BOYS_WARDEN', 'GIRLS_WARDEN', 'HOSTEL_HEAD'), enforceHostelIsolation, async (req, res) => {
  try {
    const { hostelId, roomNumber, floor, capacity, roomType } = req.body;
    const [result] = await pool.query(
      `INSERT INTO rooms (hostel_id, room_number, floor, capacity, room_type, status)
       VALUES (?, ?, ?, ?, ?, 'AVAILABLE')`,
      [hostelId, roomNumber, floor || 1, capacity || 4, roomType || 'Standard shared']
    );

    // Auto generate beds for the room
    const roomId = result.insertId;
    const bedCount = capacity || 4;
    for (let i = 1; i <= bedCount; i++) {
      const bedNumber = `${roomNumber}-${String(i).padStart(2, '0')}`;
      await pool.query('INSERT INTO beds (room_id, bed_number, status) VALUES (?, ?, ?)', [roomId, bedNumber, 'AVAILABLE']);
    }

    // Update hostel total rooms
    await pool.query('UPDATE hostels SET total_rooms = (SELECT COUNT(*) FROM rooms WHERE hostel_id = ?) WHERE id = ?', [hostelId, hostelId]);

    return res.status(201).json({ success: true, message: 'Room and beds created successfully', data: { id: roomId, roomNumber } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, data: null });
  }
});

// PUT /api/rooms/:id
router.put('/:id', authenticate, authorize('BOYS_WARDEN', 'GIRLS_WARDEN', 'HOSTEL_HEAD'), async (req, res) => {
  try {
    const userRole = (req.user.role || '').toUpperCase().replace(/^ROLE_/, '');
    const [rooms] = await pool.query('SELECT hostel_id FROM rooms WHERE id = ?', [req.params.id]);
    if (rooms.length === 0) {
      return res.status(404).json({ success: false, message: 'Room not found', data: null });
    }
    if (userRole === 'BOYS_WARDEN' && rooms[0].hostel_id !== 1) {
      return res.status(403).json({ success: false, message: 'Access Denied: Boys Warden can only manage Boys Hostel rooms.', data: null });
    }
    if (userRole === 'GIRLS_WARDEN' && rooms[0].hostel_id !== 2) {
      return res.status(403).json({ success: false, message: 'Access Denied: Girls Warden can only manage Girls Hostel rooms.', data: null });
    }

    const { roomNumber, floor, capacity, roomType, status } = req.body;
    await pool.query(
      `UPDATE rooms SET room_number = COALESCE(?, room_number), 
                       floor = COALESCE(?, floor), 
                       capacity = COALESCE(?, capacity), 
                       room_type = COALESCE(?, room_type),
                       status = COALESCE(?, status)
       WHERE id = ?`,
      [roomNumber, floor, capacity, roomType, status, req.params.id]
    );

    return res.json({ success: true, message: 'Room updated successfully', data: { id: req.params.id } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, data: null });
  }
});

// DELETE /api/rooms/:id
router.delete('/:id', authenticate, authorize('BOYS_WARDEN', 'GIRLS_WARDEN', 'HOSTEL_HEAD'), async (req, res) => {
  try {
    const userRole = (req.user.role || '').toUpperCase().replace(/^ROLE_/, '');
    const [rooms] = await pool.query('SELECT hostel_id FROM rooms WHERE id = ?', [req.params.id]);
    if (rooms.length > 0) {
      const hostelId = rooms[0].hostel_id;
      if (userRole === 'BOYS_WARDEN' && hostelId !== 1) {
        return res.status(403).json({ success: false, message: 'Access Denied: Boys Warden can only delete Boys Hostel rooms.', data: null });
      }
      if (userRole === 'GIRLS_WARDEN' && hostelId !== 2) {
        return res.status(403).json({ success: false, message: 'Access Denied: Girls Warden can only delete Girls Hostel rooms.', data: null });
      }
      await pool.query('DELETE FROM rooms WHERE id = ?', [req.params.id]);
      await pool.query('UPDATE hostels SET total_rooms = (SELECT COUNT(*) FROM rooms WHERE hostel_id = ?) WHERE id = ?', [hostelId, hostelId]);
    }
    return res.json({ success: true, message: 'Room deleted successfully', data: null });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, data: null });
  }
});

module.exports = router;
