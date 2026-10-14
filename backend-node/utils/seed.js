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

    // 5. Rooms and Beds
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

    console.log('Database verification and seed check completed successfully.');
  } catch (err) {
    console.error('Error during data seed check:', err);
  }
}

module.exports = { seedInitialData };
