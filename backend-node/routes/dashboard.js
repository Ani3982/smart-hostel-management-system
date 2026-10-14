const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticate, authorize, enforceHostelIsolation } = require('../middleware/auth');

async function computeHostelStats(hostelId) {
  const [hostelRows] = await pool.query('SELECT * FROM hostels WHERE id = ?', [hostelId]);
  if (hostelRows.length === 0) return null;
  const h = hostelRows[0];

  const [rooms] = await pool.query('SELECT COUNT(*) AS total FROM rooms WHERE hostel_id = ?', [hostelId]);
  const [beds] = await pool.query(
    `SELECT 
       COUNT(*) AS totalBeds,
       SUM(CASE WHEN b.status = 'OCCUPIED' THEN 1 ELSE 0 END) AS occupiedBeds,
       SUM(CASE WHEN b.status = 'AVAILABLE' THEN 1 ELSE 0 END) AS availableBeds,
       SUM(CASE WHEN b.status = 'MAINTENANCE' THEN 1 ELSE 0 END) AS maintenanceBeds
     FROM beds b
     JOIN rooms r ON b.room_id = r.id
     WHERE r.hostel_id = ?`,
    [hostelId]
  );

  const [apps] = await pool.query(
    `SELECT 
       COUNT(*) AS totalApplications,
       SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) AS pendingApplications,
       SUM(CASE WHEN status = 'APPROVED' THEN 1 ELSE 0 END) AS approvedApplications,
       SUM(CASE WHEN status = 'REJECTED' THEN 1 ELSE 0 END) AS rejectedApplications
     FROM applications
     WHERE hostel_id = ?`,
    [hostelId]
  );

  const [students] = await pool.query(
    'SELECT COUNT(DISTINCT student_id) AS totalStudents FROM allocations WHERE hostel_id = ? AND status = "ACTIVE"',
    [hostelId]
  );

  const [pays] = await pool.query(
    `SELECT 
       COALESCE(SUM(CASE WHEN p.status = 'SUCCESS' THEN p.amount ELSE 0 END), 0) AS totalPaymentsAmount,
       SUM(CASE WHEN p.status = 'SUCCESS' THEN 1 ELSE 0 END) AS successfulPaymentsCount,
       SUM(CASE WHEN p.status = 'PENDING' THEN 1 ELSE 0 END) AS pendingPaymentsCount
     FROM payments p
     JOIN applications a ON p.application_id = a.id
     WHERE a.hostel_id = ?`,
    [hostelId]
  );

  return {
    hostelId: h.id,
    hostelName: h.hostel_name,
    hostelType: h.hostel_type,
    totalRooms: rooms[0].total || 0,
    totalBeds: Number(beds[0].totalBeds) || 0,
    occupiedBeds: Number(beds[0].occupiedBeds) || 0,
    availableBeds: Number(beds[0].availableBeds) || 0,
    maintenanceBeds: Number(beds[0].maintenanceBeds) || 0,
    totalStudents: Number(students[0].totalStudents) || 0,
    totalApplications: Number(apps[0].totalApplications) || 0,
    pendingApplications: Number(apps[0].pendingApplications) || 0,
    approvedApplications: Number(apps[0].approvedApplications) || 0,
    rejectedApplications: Number(apps[0].rejectedApplications) || 0,
    totalPaymentsAmount: parseFloat(pays[0].totalPaymentsAmount) || 0,
    successfulPaymentsCount: Number(pays[0].successfulPaymentsCount) || 0,
    pendingPaymentsCount: Number(pays[0].pendingPaymentsCount) || 0
  };
}

async function computeAdminStats() {
  const [hostels] = await pool.query('SELECT COUNT(*) AS total FROM hostels');
  const [rooms] = await pool.query('SELECT COUNT(*) AS total FROM rooms');
  const [beds] = await pool.query(`
    SELECT 
      COUNT(*) AS totalBeds,
      SUM(CASE WHEN status = 'OCCUPIED' THEN 1 ELSE 0 END) AS occupiedBeds,
      SUM(CASE WHEN status = 'AVAILABLE' THEN 1 ELSE 0 END) AS availableBeds,
      SUM(CASE WHEN status = 'MAINTENANCE' THEN 1 ELSE 0 END) AS maintenanceBeds
    FROM beds
  `);

  const [students] = await pool.query('SELECT COUNT(*) AS total FROM students');
  const [apps] = await pool.query(`
    SELECT 
      COUNT(*) AS totalApplications,
      SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) AS pendingApplications,
      SUM(CASE WHEN status = 'APPROVED' THEN 1 ELSE 0 END) AS approvedApplications,
      SUM(CASE WHEN status = 'REJECTED' THEN 1 ELSE 0 END) AS rejectedApplications
    FROM applications
  `);

  const [pays] = await pool.query(`
    SELECT 
      COALESCE(SUM(CASE WHEN status = 'SUCCESS' THEN amount ELSE 0 END), 0) AS totalPaymentsAmount,
      SUM(CASE WHEN status = 'SUCCESS' THEN 1 ELSE 0 END) AS successfulPaymentsCount,
      SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) AS pendingPaymentsCount
    FROM payments
  `);

  const boysHostel = await computeHostelStats(1);
  const girlsHostel = await computeHostelStats(2);

  return {
    totalHostels: hostels[0].total || 0,
    totalRooms: rooms[0].total || 0,
    totalBeds: Number(beds[0].totalBeds) || 0,
    occupiedBeds: Number(beds[0].occupiedBeds) || 0,
    availableBeds: Number(beds[0].availableBeds) || 0,
    maintenanceBeds: Number(beds[0].maintenanceBeds) || 0,
    totalStudents: students[0].total || 0,
    totalApplications: Number(apps[0].totalApplications) || 0,
    pendingApplications: Number(apps[0].pendingApplications) || 0,
    approvedApplications: Number(apps[0].approvedApplications) || 0,
    rejectedApplications: Number(apps[0].rejectedApplications) || 0,
    totalPaymentsAmount: parseFloat(pays[0].totalPaymentsAmount) || 0,
    successfulPaymentsCount: Number(pays[0].successfulPaymentsCount) || 0,
    pendingPaymentsCount: Number(pays[0].pendingPaymentsCount) || 0,
    boysHostel,
    girlsHostel
  };
}

// GET /api/dashboard/hostel/:hostelId
router.get('/hostel/:hostelId', authenticate, authorize('BOYS_WARDEN', 'GIRLS_WARDEN', 'HOSTEL_HEAD'), enforceHostelIsolation, async (req, res) => {
  try {
    const stats = await computeHostelStats(req.params.hostelId);
    if (!stats) {
      return res.status(404).json({ success: false, message: 'Hostel not found', data: null });
    }
    return res.json({ success: true, message: 'Hostel dashboard statistics retrieved dynamically', data: stats });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, data: null });
  }
});

// GET /api/dashboard/public/summary
router.get('/public/summary', async (req, res) => {
  try {
    const stats = await computeAdminStats();
    return res.json({ success: true, message: 'Public hostel summary retrieved dynamically', data: stats });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, data: null });
  }
});

module.exports = router;
