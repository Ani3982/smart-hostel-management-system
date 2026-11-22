const bcrypt = require('bcryptjs');
const pool = require('../config/db');

async function seedInitialData() {
  try {
    // 1. Hostels
    const [hostels] = await pool.query('SELECT COUNT(*) AS count FROM hostels');
    if (hostels[0].count === 0) {
      console.log('Seeding initial hostels...');
      await pool.query(`
        INSERT INTO hostels (id, hostel_name, hostel_type, address, total_rooms, status) VALUES
        (1, 'Boys Hostel (छत्रपती शिवाजी महाराज वसतिगृह)', 'BOYS', 'North Campus, New Arts, Commerce and Science College, Lal Taki Road, Ahilyanagar, Maharashtra 414001', 10, 'ACTIVE'),
        (2, 'Girls Hostel (सावित्रीबाई फुले वसतिगृह)', 'GIRLS', 'South Campus, New Arts, Commerce and Science College, Lal Taki Road, Ahilyanagar, Maharashtra 414001', 10, 'ACTIVE')
      `);
    }

    // 2. Boys Hostel Warden
    const [boysHeadRows] = await pool.query('SELECT id FROM app_users WHERE email = ?', ['boyshead@hostel.com']);
    if (boysHeadRows.length === 0) {
      const wardenPass = await bcrypt.hash('Warden@123', 10);
      const [uRes] = await pool.query(
        'INSERT INTO app_users (name, email, password, role, hostel_type, status) VALUES (?, ?, ?, ?, ?, ?)',
        ['Prof. Suresh Patil (Boys Warden)', 'boyshead@hostel.com', wardenPass, 'BOYS_WARDEN', 'BOYS', 'ACTIVE']
      );
      await pool.query(
        'INSERT INTO hostel_heads (user_id, hostel_id, name, mobile, email) VALUES (?, 1, ?, ?, ?)',
        [uRes.insertId, 'Prof. Suresh Patil', '9876543210', 'boyshead@hostel.com']
      );
      console.log('Created Boys Warden: boyshead@hostel.com / Warden@123');
    }

    // 3. Girls Hostel Warden
    const [girlsHeadRows] = await pool.query('SELECT id FROM app_users WHERE email = ?', ['girlshead@hostel.com']);
    if (girlsHeadRows.length === 0) {
      const wardenPass = await bcrypt.hash('Warden@123', 10);
      const [uRes] = await pool.query(
        'INSERT INTO app_users (name, email, password, role, hostel_type, status) VALUES (?, ?, ?, ?, ?, ?)',
        ['Dr. Sunita Deshmukh (Girls Warden)', 'girlshead@hostel.com', wardenPass, 'GIRLS_WARDEN', 'GIRLS', 'ACTIVE']
      );
      await pool.query(
        'INSERT INTO hostel_heads (user_id, hostel_id, name, mobile, email) VALUES (?, 2, ?, ?, ?)',
        [uRes.insertId, 'Dr. Sunita Deshmukh', '9876543211', 'girlshead@hostel.com']
      );
      console.log('Created Girls Warden: girlshead@hostel.com / Warden@123');
    }

    // 4. Rooms and Beds
    const [roomRows] = await pool.query('SELECT COUNT(*) AS count FROM rooms');
    if (roomRows[0].count === 0) {
      console.log('Generating rooms and beds...');
      // Boys Hostel: 10 rooms (B-101 to B-110)
      for (let i = 1; i <= 10; i++) {
        const roomNum = `B-${String(100 + i)}`;
        const floor = i <= 5 ? 1 : 2;
        const [rRes] = await pool.query(
          'INSERT INTO rooms (hostel_id, room_number, floor, capacity, room_type, status) VALUES (1, ?, ?, 4, "Standard 4-Sharing", "AVAILABLE")',
          [roomNum, floor]
        );
        for (let b = 1; b <= 4; b++) {
          const bedNum = `${roomNum}-${String(b).padStart(2, '0')}`;
          await pool.query('INSERT INTO beds (room_id, bed_number, status) VALUES (?, ?, "AVAILABLE")', [rRes.insertId, bedNum]);
        }
      }
      // Girls Hostel: 10 rooms (G-101 to G-110)
      for (let i = 1; i <= 10; i++) {
        const roomNum = `G-${String(100 + i)}`;
        const floor = i <= 5 ? 1 : 2;
        const [rRes] = await pool.query(
          'INSERT INTO rooms (hostel_id, room_number, floor, capacity, room_type, status) VALUES (2, ?, ?, 4, "Standard 4-Sharing", "AVAILABLE")',
          [roomNum, floor]
        );
        for (let b = 1; b <= 4; b++) {
          const bedNum = `${roomNum}-${String(b).padStart(2, '0')}`;
          await pool.query('INSERT INTO beds (room_id, bed_number, status) VALUES (?, ?, "AVAILABLE")', [rRes.insertId, bedNum]);
        }
      }
    }

    // 5. Sample Student 1 (Male - Allocated & Paid): student@hostel.com
    const [s1Rows] = await pool.query('SELECT id FROM app_users WHERE email = ?', ['student@hostel.com']);
    if (s1Rows.length === 0) {
      const studentPass = await bcrypt.hash('Student@123', 10);
      const [uRes] = await pool.query(
        'INSERT INTO app_users (name, email, password, role, status) VALUES (?, ?, ?, "STUDENT", "ACTIVE")',
        ['Rahul Shinde', 'student@hostel.com', studentPass]
      );
      const userId = uRes.insertId;

      const [sRes] = await pool.query(`
        INSERT INTO students (
          user_id, student_id, full_name, dob, gender, mobile, email, address,
          city, state, pincode, college_name, course, department, academic_year,
          roll_number, parent_name, parent_mobile, emergency_contact
        ) VALUES (?, 'NACSC-2026-001', 'Rahul Ashok Shinde', '2003-05-14', 'MALE', '9822334455', 'student@hostel.com',
          'Shivaji Nagar, Pipeline Road', 'Ahilyanagar', 'Maharashtra', '414003',
          'New Arts, Commerce and Science College, Ahilyanagar (Autonomous)',
          'M.Sc. Computer Science', 'Computer Science', 'First Year (Part I)', 'MCS-24',
          'Ashok Shinde', '9822334450', '9822334451')
      `, [userId]);
      const studentId = sRes.insertId;

      // Approved application
      const [appRes] = await pool.query(`
        INSERT INTO applications (student_id, hostel_id, preferred_room_type, remarks, status, approved_by, approved_date)
        VALUES (?, 1, 'Standard 4-Sharing', 'Resident of rural Ahilyanagar district', 'APPROVED', 'Prof. Suresh Patil (Boys Warden)', NOW())
      `, [studentId]);
      const appId = appRes.insertId;

      // Find Bed B-101-01
      const [beds] = await pool.query(`
        SELECT b.id AS bed_id, r.id AS room_id 
        FROM beds b 
        JOIN rooms r ON b.room_id = r.id 
        WHERE r.hostel_id = 1 AND r.room_number = 'B-101' AND b.bed_number = 'B-101-01'
        LIMIT 1
      `);
      if (beds.length > 0) {
        const { bed_id, room_id } = beds[0];
        await pool.query('UPDATE beds SET status = "OCCUPIED" WHERE id = ?', [bed_id]);
        await pool.query('UPDATE rooms SET status = "PARTIALLY_OCCUPIED" WHERE id = ?', [room_id]);
        await pool.query(`
          INSERT INTO allocations (student_id, hostel_id, room_id, bed_id, allocated_by)
          VALUES (?, 1, ?, ?, 'Prof. Suresh Patil')
        `, [studentId, room_id, bed_id]);

        await pool.query(`
          INSERT INTO payments (student_id, application_id, amount, payment_method, transaction_id, status, receipt_number)
          VALUES (?, ?, 15000.00, 'UPI', 'TXN-NACSC-2026-9812', 'SUCCESS', 'REC-20260928-8421')
        `, [studentId, appId]);
      }
      console.log('Created Student 1 (Male - Allocated & Paid): student@hostel.com / Student@123');
    }

    // 6. Sample Student 2 (Female - Pending): priya@hostel.com
    const [s2Rows] = await pool.query('SELECT id FROM app_users WHERE email = ?', ['priya@hostel.com']);
    if (s2Rows.length === 0) {
      const studentPass = await bcrypt.hash('Student@123', 10);
      const [uRes] = await pool.query(
        'INSERT INTO app_users (name, email, password, role, status) VALUES (?, ?, ?, "STUDENT", "ACTIVE")',
        ['Priya Kulkarni', 'priya@hostel.com', studentPass]
      );
      const userId = uRes.insertId;

      const [sRes] = await pool.query(`
        INSERT INTO students (
          user_id, student_id, full_name, dob, gender, mobile, email, address,
          city, state, pincode, college_name, course, department, academic_year,
          roll_number, parent_name, parent_mobile, emergency_contact
        ) VALUES (?, 'NACSC-2026-002', 'Priya Sunil Kulkarni', '2004-08-22', 'FEMALE', '9890112233', 'priya@hostel.com',
          'Court Road, Savedi', 'Ahilyanagar', 'Maharashtra', '414002',
          'New Arts, Commerce and Science College, Ahilyanagar (Autonomous)',
          'M.Sc. Information Technology', 'Information Technology', 'First Year', 'MIT-12',
          'Sunil Kulkarni', '9890112230', '9890112231')
      `, [userId]);
      const studentId = sRes.insertId;

      await pool.query(`
        INSERT INTO applications (student_id, hostel_id, preferred_room_type, remarks, status)
        VALUES (?, 2, 'Standard 4-Sharing', 'Merit student, need accommodation near college library', 'PENDING')
      `, [studentId]);
      console.log('Created Student 2 (Female - Pending): priya@hostel.com / Student@123');
    }

    // 7. Sample Student 3 (Male - Pending): amit@hostel.com
    const [s3Rows] = await pool.query('SELECT id FROM app_users WHERE email = ?', ['amit@hostel.com']);
    if (s3Rows.length === 0) {
      const studentPass = await bcrypt.hash('Student@123', 10);
      const [uRes] = await pool.query(
        'INSERT INTO app_users (name, email, password, role, status) VALUES (?, ?, ?, "STUDENT", "ACTIVE")',
        ['Amit Deshmukh', 'amit@hostel.com', studentPass]
      );
      const userId = uRes.insertId;

      const [sRes] = await pool.query(`
        INSERT INTO students (
          user_id, student_id, full_name, dob, gender, mobile, email, address,
          city, state, pincode, college_name, course, department, academic_year,
          roll_number, parent_name, parent_mobile, emergency_contact
        ) VALUES (?, 'NACSC-2026-003', 'Amit Ramesh Deshmukh', '2003-11-10', 'MALE', '9860223344', 'amit@hostel.com',
          'Station Road, Near Railway Station', 'Ahilyanagar', 'Maharashtra', '414001',
          'New Arts, Commerce and Science College, Ahilyanagar (Autonomous)',
          'B.Sc. Computer Science', 'Computer Science', 'Third Year', 'BCS-55',
          'Ramesh Deshmukh', '9860223340', '9860223341')
      `, [userId]);
      const studentId = sRes.insertId;

      await pool.query(`
        INSERT INTO applications (student_id, hostel_id, preferred_room_type, remarks, status)
        VALUES (?, 1, 'Standard 4-Sharing', 'Final year project work', 'PENDING')
      `, [studentId]);
      console.log('Created Student 3 (Male - Pending): amit@hostel.com / Student@123');
    }

    // 8. Complaints Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS complaints (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        student_id BIGINT NOT NULL,
        student_name VARCHAR(150),
        student_prn VARCHAR(100),
        hostel_id BIGINT NOT NULL DEFAULT 1,
        room_number VARCHAR(50) DEFAULT 'General',
        bed_number VARCHAR(50) DEFAULT '—',
        category VARCHAR(50) NOT NULL,
        title VARCHAR(200),
        description TEXT NOT NULL,
        status ENUM('PENDING', 'IN_PROGRESS', 'RESOLVED') DEFAULT 'PENDING',
        urgency ENUM('LOW', 'MEDIUM', 'HIGH', 'EMERGENCY') DEFAULT 'MEDIUM',
        warden_remarks TEXT,
        resolved_at DATETIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (hostel_id) REFERENCES hostels(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    const [cCount] = await pool.query('SELECT COUNT(*) AS c FROM complaints');
    if (cCount[0].c === 0) {
      // Find students
      const [stus] = await pool.query('SELECT id, full_name, student_id FROM students ORDER BY id ASC');
      if (stus.length > 0) {
        const s1 = stus[0];
        await pool.query(`
          INSERT INTO complaints (student_id, student_name, student_prn, hostel_id, room_number, bed_number, category, title, description, status, urgency, warden_remarks, created_at)
          VALUES (?, ?, ?, 1, 'B-101', 'B-101-01', 'Plumbing', 'Bathroom shower tap leakage', 'Bathroom shower tap is continuously leaking and low water pressure.', 'PENDING', 'MEDIUM', 'Maintenance plumber informed', NOW())
        `, [s1.id, s1.full_name, s1.student_id]);
      }
    }

    console.log('Database verification and seed check completed successfully.');
  } catch (err) {
    console.error('Error during data seed check:', err);
  }
}

module.exports = { seedInitialData };
