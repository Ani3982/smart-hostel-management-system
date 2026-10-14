const bcrypt = require('bcryptjs');
const pool = require('../config/db');

async function setupPendingApplications() {
  try {
    // 1. Reset applications 5 and 6 to PENDING for Boys Hostel (Hostel 1)
    await pool.query(`
      UPDATE applications 
      SET status = 'PENDING', approved_by = NULL, approved_date = NULL, rejection_reason = NULL 
      WHERE id IN (5, 6)
    `);
    console.log('Reset Boys applications 5 & 6 to PENDING');

    // 2. Check or create Girls pending applications
    const [existingGirlsApp] = await pool.query('SELECT COUNT(*) as count FROM applications WHERE hostel_id = 2 AND status = "PENDING"');
    if (existingGirlsApp[0].count === 0) {
      const pass = await bcrypt.hash('Student@123', 10);
      
      // Female Student 1: Pooja Gaikwad
      const [u1] = await pool.query(
        "INSERT INTO app_users (name, email, password, role, hostel_type, status) VALUES (?, ?, ?, 'STUDENT', 'GIRLS', 'ACTIVE') ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)",
        ['Pooja Ganesh Gaikwad', 'pooja.gaikwad@gmail.com', pass]
      );
      const userId1 = u1.insertId;
      const [st1] = await pool.query(
        `INSERT INTO students (user_id, student_id, full_name, dob, gender, mobile, email, address, city, state, pincode, college_name, course, department, academic_year, roll_number, parent_name, parent_mobile, emergency_contact)
         VALUES (?, 'NACSC-2026-G01', 'Pooja Ganesh Gaikwad', '2005-04-12', 'FEMALE', '9822114455', 'pooja.gaikwad@gmail.com', 'Near Bus Stand, Rahuri', 'Rahuri', 'Maharashtra', '413705', 'New Arts, Commerce and Science College, Ahilyanagar', 'M.Sc. Computer Science', 'Computer Science', '1st Year', 'MCS-04', 'Ganesh Gaikwad', '9822114400', '9822114401')
         ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)`,
        [userId1]
      );
      await pool.query(
        `INSERT INTO applications (student_id, hostel_id, preferred_room_type, remarks, status)
         VALUES (?, 2, 'Standard 4-Sharing', 'Seeking hostel accommodation for M.Sc. course', 'PENDING')`,
        [st1.insertId]
      );

      // Female Student 2: Sneha Jadhav
      const [u2] = await pool.query(
        "INSERT INTO app_users (name, email, password, role, hostel_type, status) VALUES (?, ?, ?, 'STUDENT', 'GIRLS', 'ACTIVE') ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)",
        ['Sneha Babasaheb Jadhav', 'sneha.jadhav@gmail.com', pass]
      );
      const userId2 = u2.insertId;
      const [st2] = await pool.query(
        `INSERT INTO students (user_id, student_id, full_name, dob, gender, mobile, email, address, city, state, pincode, college_name, course, department, academic_year, roll_number, parent_name, parent_mobile, emergency_contact)
         VALUES (?, 'NACSC-2026-G02', 'Sneha Babasaheb Jadhav', '2006-08-20', 'FEMALE', '9822336677', 'sneha.jadhav@gmail.com', 'Post Bhalawani, Parner', 'Parner', 'Maharashtra', '414103', 'New Arts, Commerce and Science College, Ahilyanagar', 'B.Sc. Biotechnology', 'Biotechnology', '1st Year', 'BT-18', 'Babasaheb Jadhav', '9822336600', '9822336601')
         ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)`,
        [userId2]
      );
      await pool.query(
        `INSERT INTO applications (student_id, hostel_id, preferred_room_type, remarks, status)
         VALUES (?, 2, 'Standard 4-Sharing', 'Admission verified, requesting hostel room', 'PENDING')`,
        [st2.insertId]
      );

      console.log('Created 2 Pending applications for Girls Hostel (Hostel 2)');
    }

    const [summary] = await pool.query(`
      SELECT h.hostel_name, a.status, COUNT(*) as count
      FROM applications a
      JOIN hostels h ON a.hostel_id = h.id
      GROUP BY h.hostel_name, a.status
    `);
    console.log('\nCurrent Applications Summary:', summary);
    process.exit(0);
  } catch (err) {
    console.error('Setup failed:', err);
    process.exit(1);
  }
}

setupPendingApplications();
