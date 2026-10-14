const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticate, authorize, enforceHostelIsolation } = require('../middleware/auth');
const { sendAdmissionConfirmationEmail } = require('../utils/emailService');

const formatPayment = (row) => ({
  id: row.id,
  amount: parseFloat(row.amount),
  paymentMethod: row.payment_method,
  transactionId: row.transaction_id,
  paymentDate: row.payment_date,
  status: row.status,
  receiptNumber: row.receipt_number,
  createdAt: row.created_at,
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
  application: {
    id: row.application_id,
    status: row.app_status,
    hostel: {
      id: row.hostel_id,
      hostelName: row.hostel_name,
      hostelType: row.hostel_type
    }
  }
});

const PAY_SELECT = `
  SELECT p.*,
         s.id AS student_id, s.student_id AS student_custom_id, s.full_name AS student_name,
         s.email AS student_email, s.mobile AS student_mobile, s.gender AS student_gender,
         s.course AS student_course, s.department AS student_department, s.roll_number AS student_roll_number,
         a.id AS application_id, a.status AS app_status,
         h.id AS hostel_id, h.hostel_name AS hostel_name, h.hostel_type AS hostel_type
  FROM payments p
  JOIN students s ON p.student_id = s.id
  JOIN applications a ON p.application_id = a.id
  JOIN hostels h ON a.hostel_id = h.id
`;

// GET /api/payments
router.get('/', authenticate, authorize('BOYS_WARDEN', 'GIRLS_WARDEN', 'HOSTEL_HEAD'), async (req, res) => {
  try {
    const userRole = (req.user.role || '').toUpperCase().replace(/^ROLE_/, '');
    let query = `${PAY_SELECT} WHERE 1=1`;
    const params = [];

    if (userRole === 'BOYS_WARDEN') {
      query += ' AND a.hostel_id = 1';
    } else if (userRole === 'GIRLS_WARDEN') {
      query += ' AND a.hostel_id = 2';
    }

    query += ' ORDER BY p.id DESC';
    const [rows] = await pool.query(query, params);
    return res.json({ success: true, message: 'Payments retrieved', data: rows.map(formatPayment) });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, data: null });
  }
});

// GET /api/payments/hostel/:hostelId
router.get('/hostel/:hostelId', authenticate, authorize('BOYS_WARDEN', 'GIRLS_WARDEN', 'HOSTEL_HEAD'), enforceHostelIsolation, async (req, res) => {
  try {
    const [rows] = await pool.query(`${PAY_SELECT} WHERE a.hostel_id = ? ORDER BY p.id DESC`, [req.params.hostelId]);
    return res.json({ success: true, message: 'Hostel payments retrieved', data: rows.map(formatPayment) });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, data: null });
  }
});

// GET /api/payments/my-payments
router.get('/my-payments', authenticate, async (req, res) => {
  try {
    const [students] = await pool.query('SELECT id FROM students WHERE user_id = ?', [req.user.id]);
    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student profile not found', data: null });
    }

    const [rows] = await pool.query(`${PAY_SELECT} WHERE p.student_id = ? ORDER BY p.id DESC`, [students[0].id]);
    return res.json({ success: true, message: 'My payments retrieved', data: rows.map(formatPayment) });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, data: null });
  }
});

// GET /api/payments/receipt/:receiptNumber
router.get('/receipt/:receiptNumber', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.query(`${PAY_SELECT} WHERE p.receipt_number = ?`, [req.params.receiptNumber]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Receipt not found', data: null });
    }
    return res.json({ success: true, message: 'Payment receipt retrieved', data: formatPayment(rows[0]) });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, data: null });
  }
});

// POST /api/payments/create
// POST /api/payments/razorpay/create-order
router.post('/razorpay/create-order', authenticate, async (req, res) => {
  try {
    const feeAmount = req.body.amount || 15000;
    const orderId = `order_rzp_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
    return res.json({
      success: true,
      message: 'Razorpay order created',
      data: {
        orderId,
        amount: feeAmount * 100, // in paise
        currency: 'INR',
        keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_nacscAhilyanagar'
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, data: null });
  }
});

// POST /api/payments/create
router.post('/create', authenticate, async (req, res) => {
  try {
    const { applicationId, amount, paymentMethod, razorpayPaymentId, razorpayOrderId } = req.body;
    const [students] = await pool.query('SELECT id FROM students WHERE user_id = ?', [req.user.id]);
    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student profile not found', data: null });
    }
    const studentId = students[0].id;

    const payAmount = Number(amount) || 15000;
    const txId = razorpayPaymentId || `pay_rzp_${Date.now().toString(36)}${Math.random().toString(36).substring(2, 7)}`;
    const receiptNum = `REC-NACSC-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
    const method = paymentMethod || 'RAZORPAY_UPI';

    const [result] = await pool.query(
      `INSERT INTO payments (student_id, application_id, amount, payment_method, transaction_id, status, receipt_number)
       VALUES (?, ?, ?, ?, ?, 'SUCCESS', ?)`,
      [studentId, applicationId, payAmount, method, txId, receiptNum]
    );

    // Update allocated bed status to OCCUPIED
    const [allocRows] = await pool.query(
      'SELECT bed_id FROM allocations WHERE student_id = ? AND status = "ACTIVE"',
      [studentId]
    );
    if (allocRows.length > 0 && allocRows[0].bed_id) {
      await pool.query('UPDATE beds SET status = "OCCUPIED" WHERE id = ?', [allocRows[0].bed_id]);
    }

    // Add confirmation notification
    try {
      await pool.query(
        'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, "SUCCESS")',
        [
          req.user.id,
          'वसतिगृह शुल्क यशस्वी (Razorpay Payment Successful)',
          `आपले वसतिगृह प्रवेश शुल्क ₹${payAmount.toLocaleString('en-IN')} रेझरपे (Razorpay) द्वारे यशस्वीरित्या जमा झाले आहे. व्यवहार क्रमांक: ${txId}. अधिकृत पावती जनरेट झाली आहे.`,
          'SUCCESS'
        ]
      );
    } catch (notifErr) {
      console.warn('Could not insert notification:', notifErr.message);
    }

    const [rows] = await pool.query(`${PAY_SELECT} WHERE p.id = ?`, [result.insertId]);
    const paymentData = formatPayment(rows[0]);

    // Query student's active allocation details (room, bed, hostel) for email voucher
    let emailResult = null;
    try {
      const [allocDetails] = await pool.query(`
        SELECT a.*, r.room_number, b.bed_number, h.hostel_name
        FROM allocations a
        JOIN rooms r ON a.room_id = r.id
        JOIN beds b ON a.bed_id = b.id
        JOIN hostels h ON a.hostel_id = h.id
        WHERE a.student_id = ? AND a.status = 'ACTIVE'
      `, [studentId]);

      const roomNum = allocDetails.length > 0 ? allocDetails[0].room_number : 'Allotted';
      const bedNum = allocDetails.length > 0 ? allocDetails[0].bed_number : 'Allotted';
      const hostelNm = allocDetails.length > 0 ? allocDetails[0].hostel_name : paymentData.application.hostel.hostelName;

      // Dispatch admission confirmation email to recipient student email
      emailResult = await sendAdmissionConfirmationEmail({
        toEmail: paymentData.student.email,
        studentName: paymentData.student.fullName,
        studentId: paymentData.student.studentId,
        course: paymentData.student.course,
        department: paymentData.student.department,
        hostelName: hostelNm,
        roomNumber: roomNum,
        bedNumber: bedNum,
        amount: payAmount,
        receiptNumber: receiptNum,
        transactionId: txId,
        paymentDate: paymentData.paymentDate || new Date(),
        paymentMethod: method
      });
    } catch (emailErr) {
      console.error('[PaymentRoute] Could not dispatch confirmation email:', emailErr.message);
    }

    return res.status(201).json({
      success: true,
      message: 'Razorpay payment processed & admission confirmation email sent to student',
      data: {
        ...paymentData,
        emailConfirmation: emailResult
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, data: null });
  }
});

// POST /api/payments/verify
router.post('/verify', authenticate, async (req, res) => {
  try {
    const { transactionId, status, paymentId } = req.body;
    const query = paymentId 
      ? 'UPDATE payments SET status = ? WHERE id = ?' 
      : 'UPDATE payments SET status = ? WHERE transaction_id = ?';
    const param = paymentId || transactionId;
    await pool.query(query, [status || 'SUCCESS', param]);
    return res.json({ success: true, message: 'Payment verified successfully', data: { transactionId, status: status || 'SUCCESS' } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, data: null });
  }
});

// POST /api/payments/send-confirmation-email/:receiptNumber
router.post('/send-confirmation-email/:receiptNumber', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.query(`${PAY_SELECT} WHERE p.receipt_number = ?`, [req.params.receiptNumber]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Payment receipt not found', data: null });
    }
    const paymentData = formatPayment(rows[0]);

    const [allocDetails] = await pool.query(`
      SELECT a.*, r.room_number, b.bed_number, h.hostel_name
      FROM allocations a
      JOIN rooms r ON a.room_id = r.id
      JOIN beds b ON a.bed_id = b.id
      JOIN hostels h ON a.hostel_id = h.id
      WHERE a.student_id = ? AND a.status = 'ACTIVE'
    `, [paymentData.student.id]);

    const roomNum = allocDetails.length > 0 ? allocDetails[0].room_number : 'Allotted';
    const bedNum = allocDetails.length > 0 ? allocDetails[0].bed_number : 'Allotted';
    const hostelNm = allocDetails.length > 0 ? allocDetails[0].hostel_name : paymentData.application.hostel.hostelName;

    const emailResult = await sendAdmissionConfirmationEmail({
      toEmail: paymentData.student.email,
      studentName: paymentData.student.fullName,
      studentId: paymentData.student.studentId,
      course: paymentData.student.course,
      department: paymentData.student.department,
      hostelName: hostelNm,
      roomNumber: roomNum,
      bedNumber: bedNum,
      amount: paymentData.amount,
      receiptNumber: paymentData.receiptNumber,
      transactionId: paymentData.transactionId,
      paymentDate: paymentData.paymentDate,
      paymentMethod: paymentData.paymentMethod
    });

    return res.json({
      success: true,
      message: `Admission confirmation email successfully sent to ${paymentData.student.email}`,
      data: emailResult
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, data: null });
  }
});

module.exports = router;
