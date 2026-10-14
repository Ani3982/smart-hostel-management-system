const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

let transporter = null;

// Initialize or get nodemailer transporter
async function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT, 10) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (user && pass) {
    // Real authenticated SMTP (e.g. Gmail App Password, College Mail Server)
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });
    console.log(`[EmailService] Configured authenticated SMTP transport for: ${user}`);
  } else {
    // Development / Test mode: Use Ethereal test account or JSON transporter
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      console.log(`[EmailService] Configured Ethereal Test Email Transport (${testAccount.user})`);
    } catch (testErr) {
      console.warn('[EmailService] Falling back to direct stream transport:', testErr.message);
      transporter = nodemailer.createTransport({
        jsonTransport: true
      });
    }
  }

  return transporter;
}

/**
 * Send official Hostel Admission Confirmation Email to student
 */
async function sendAdmissionConfirmationEmail({
  toEmail,
  studentName,
  studentId,
  course,
  department,
  hostelName,
  roomNumber,
  bedNumber,
  amount,
  receiptNumber,
  transactionId,
  paymentDate,
  paymentMethod
}) {
  try {
    const transport = await getTransporter();
    const fromAddress = process.env.EMAIL_FROM || '"New Arts College Hostel Office" <hostel@newartscollege.ac.in>';
    const formattedAmount = `₹${Number(amount || 15000).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    const formattedDate = paymentDate ? new Date(paymentDate).toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' }) : new Date().toLocaleString('en-IN');

    const subject = `🎓 Official Hostel Admission Confirmation - ${hostelName} | NACSC Ahilyanagar`;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Hostel Admission Confirmation</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f1f5f9; color: #1e293b; }
    .container { max-width: 620px; margin: 24px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #0c2340 0%, #1e3a8a 100%); color: #ffffff; padding: 32px 24px; text-align: center; }
    .header h1 { margin: 8px 0 4px 0; font-size: 20px; font-weight: 800; letter-spacing: -0.02em; }
    .header p { margin: 0; font-size: 13px; opacity: 0.85; }
    .badge { display: inline-block; background-color: #10b981; color: #ffffff; font-weight: 800; font-size: 12px; padding: 6px 16px; borderRadius: 9999px; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 16px; }
    .body { padding: 32px 28px; }
    .greeting { font-size: 17px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
    .intro { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
    .card-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
    .card-title { font-size: 13px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 16px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
    .info-table { width: 100%; border-collapse: collapse; font-size: 14px; }
    .info-table td { padding: 8px 4px; vertical-align: top; }
    .info-table td.label { color: #64748b; width: 42%; font-weight: 500; }
    .info-table td.value { color: #0f172a; font-weight: 700; }
    .highlight-row { background-color: #ecfdf5; border-radius: 8px; }
    .steps-box { background: #eff6ff; border-left: 4px solid #2563eb; padding: 16px 20px; border-radius: 0 8px 8px 0; margin-bottom: 24px; }
    .steps-box h4 { margin: 0 0 10px 0; color: #1e40af; font-size: 14px; font-weight: 800; }
    .steps-box ol { margin: 0; padding-left: 18px; color: #334155; font-size: 13px; line-height: 1.6; }
    .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 24px; text-align: center; font-size: 12px; color: #64748b; }
    .btn { display: inline-block; background-color: #2563eb; color: #ffffff !important; font-weight: 700; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; margin-top: 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #93c5fd; margin-bottom: 4px;">
        अहिल्यानगर जिल्हा मराठा विद्या प्रसारक समाज संचलित
      </div>
      <h1>New Arts, Commerce and Science College, Ahilyanagar</h1>
      <p>(Autonomous) • NAAC 'A++' Accredited • Lal Taki Road, Ahilyanagar 414001</p>
      <div class="badge">✓ Admission Confirmed & Fee Received</div>
    </div>

    <div class="body">
      <div class="greeting">Dear ${studentName || 'Student'},</div>
      <p class="intro">
        Congratulations! Your admission to the college hostel accommodation for <strong>Academic Year 2024-25</strong> has been <strong>officially confirmed</strong> upon successful verification and receipt of your annual hostel admission fee.
      </p>

      <div class="card-box">
        <div class="card-title">Allotment & Student Particulars</div>
        <table class="info-table">
          <tr>
            <td class="label">Student Name:</td>
            <td class="value">${studentName}</td>
          </tr>
          <tr>
            <td class="label">Student ID:</td>
            <td class="value">${studentId || '—'}</td>
          </tr>
          <tr>
            <td class="label">Course & Department:</td>
            <td class="value">${course || 'Degree College'} (${department || 'General'})</td>
          </tr>
          <tr>
            <td class="label">Allocated Hostel:</td>
            <td class="value" style="color: #1e40af;">${hostelName}</td>
          </tr>
          <tr>
            <td class="label">Room & Bed Number:</td>
            <td class="value" style="color: #047857; font-size: 16px;">Room ${roomNumber} • Bed ${bedNumber}</td>
          </tr>
        </table>
      </div>

      <div class="card-box" style="border-color: #a7f3d0; background-color: #f0fdf4;">
        <div class="card-title" style="color: #065f46; border-color: #bbf7d0;">Fee Payment & Receipt Voucher</div>
        <table class="info-table">
          <tr>
            <td class="label">Total Fee Paid:</td>
            <td class="value" style="color: #047857; font-size: 17px;">${formattedAmount}</td>
          </tr>
          <tr>
            <td class="label">Payment Gateway:</td>
            <td class="value">${paymentMethod || 'Razorpay Online Gateway'}</td>
          </tr>
          <tr>
            <td class="label">Transaction ID:</td>
            <td class="value" style="font-family: monospace;">${transactionId || '—'}</td>
          </tr>
          <tr>
            <td class="label">Official Receipt No:</td>
            <td class="value" style="font-family: monospace; color: #1e40af;">${receiptNumber}</td>
          </tr>
          <tr>
            <td class="label">Payment Date & Time:</td>
            <td class="value">${formattedDate}</td>
          </tr>
        </table>
      </div>

      <div class="steps-box">
        <h4>📋 Important Instructions for Check-In:</h4>
        <ol>
          <li><strong>Room Key Handover:</strong> Please visit the Hostel Rector / Warden office (North Campus for Boys / South Campus for Girls) between 10:00 AM and 5:00 PM to collect your room key and complete the physical sign-in.</li>
          <li><strong>Documents to Carry:</strong>
            <ul>
              <li>Printout of this confirmation email / official payment receipt.</li>
              <li>College Identity Card (or Admission Acknowledgement).</li>
              <li>Original Government ID (Aadhaar Card).</li>
              <li>Two recent passport-size photographs.</li>
            </ul>
          </li>
          <li><strong>Hostel Helpline:</strong> +91 7414974582 / +91 241 2324024 | Email: contact@we-intern.in | hostel@newartscollege.ac.in</li>
        </ol>
      </div>

      <div style="text-align: center; margin: 28px 0 10px 0;">
        <a href="http://localhost:5173/student/receipt/${receiptNumber}" class="btn">
          View & Print Official Receipt Voucher
        </a>
      </div>
    </div>

    <div class="footer">
      <p style="margin: 0 0 6px 0; font-weight: 700; color: #334155;">
        New Arts, Commerce and Science College, Ahilyanagar (Autonomous)
      </p>
      <p style="margin: 0 0 6px 0;">
        Lal Taki Road, Ahilyanagar, Maharashtra 414001 • Online Hostel Admission Portal
      </p>
      <p style="margin: 0; font-size: 11px; color: #94a3b8;">
        This is an official automated confirmation message sent to ${toEmail}.
      </p>
    </div>
  </div>
</body>
</html>
    `;

    const mailOptions = {
      from: fromAddress,
      to: toEmail,
      subject: subject,
      text: `Hostel Admission Confirmed! Dear ${studentName}, your room ${roomNumber} (Bed ${bedNumber}) at ${hostelName} is confirmed upon receipt of ₹${amount || 15000}. Receipt No: ${receiptNumber}. Transaction ID: ${transactionId}. Please visit the Warden office with your college ID to collect room keys.`,
      html: htmlContent
    };

    const info = await transport.sendMail(mailOptions);
    const previewUrl = nodemailer.getTestMessageUrl(info);

    console.log(`[EmailService] ✓ Admission confirmation email sent to: ${toEmail} (MessageId: ${info.messageId})`);
    if (previewUrl) {
      console.log(`[EmailService] 🌐 Ethereal Test Email Preview URL: ${previewUrl}`);
    }

    return {
      success: true,
      messageId: info.messageId,
      recipient: toEmail,
      previewUrl: previewUrl || null
    };
  } catch (err) {
    console.error(`[EmailService] ✗ Failed to send confirmation email to ${toEmail}:`, err.message);
    return {
      success: false,
      error: err.message,
      recipient: toEmail
    };
  }
}

module.exports = {
  sendAdmissionConfirmationEmail
};
