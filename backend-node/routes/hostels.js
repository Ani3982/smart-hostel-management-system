const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET /api/hostels
router.get('/', async (req, res) => {
  try {
    const [hostels] = await pool.query(`
      SELECT id, hostel_name AS hostelName, hostel_type AS hostelType, 
             address, total_rooms AS totalRooms, status, created_at AS createdAt
      FROM hostels 
      ORDER BY id ASC
    `);
    return res.json({ success: true, message: 'Hostels retrieved', data: hostels });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, data: null });
  }
});

// GET /api/hostels/:id
router.get('/:id', async (req, res) => {
  try {
    const [hostels] = await pool.query(`
      SELECT id, hostel_name AS hostelName, hostel_type AS hostelType, 
             address, total_rooms AS totalRooms, status, created_at AS createdAt
      FROM hostels WHERE id = ?
    `, [req.params.id]);

    if (hostels.length === 0) {
      return res.status(404).json({ success: false, message: 'Hostel not found', data: null });
    }
    return res.json({ success: true, message: 'Hostel retrieved', data: hostels[0] });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, data: null });
  }
});

module.exports = router;
