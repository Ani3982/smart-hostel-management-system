const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function migrate() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Surajsonawane2004',
    database: 'hostel_management_db'
  });

  console.log('Connected to MySQL');

  // 1. Add missing columns to hostel_heads if not exist
  const [cols] = await conn.query('DESCRIBE hostel_heads');
  const colNames = cols.map(c => c.Field);

  if (!colNames.includes('employee_id')) {
    await conn.query("ALTER TABLE hostel_heads ADD COLUMN employee_id VARCHAR(50) DEFAULT NULL AFTER hostel_id");
  }
  if (!colNames.includes('full_name')) {
    await conn.query("ALTER TABLE hostel_heads ADD COLUMN full_name VARCHAR(150) DEFAULT NULL AFTER employee_id");
  }
  if (!colNames.includes('gender')) {
    await conn.query("ALTER TABLE hostel_heads ADD COLUMN gender VARCHAR(20) DEFAULT 'MALE' AFTER email");
  }
  if (!colNames.includes('designation')) {
    await conn.query("ALTER TABLE hostel_heads ADD COLUMN designation VARCHAR(100) DEFAULT 'Hostel Warden' AFTER gender");
  }
  if (!colNames.includes('joining_date')) {
    await conn.query("ALTER TABLE hostel_heads ADD COLUMN joining_date DATE DEFAULT '2024-01-01' AFTER designation");
  }
  if (!colNames.includes('status')) {
    await conn.query("ALTER TABLE hostel_heads ADD COLUMN status VARCHAR(20) DEFAULT 'ACTIVE' AFTER joining_date");
  }
  if (!colNames.includes('updated_at')) {
    await conn.query("ALTER TABLE hostel_heads ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
  }

  console.log('✓ Columns in hostel_heads verified');

  // 2. Ensure password hash for Warden@123
  const hash = await bcrypt.hash('Warden@123', 10);

  // Boys Warden User
  let [bUser] = await conn.query("SELECT * FROM app_users WHERE email = 'boyswarden@college.com'");
  let bUserId;
  if (bUser.length === 0) {
    const [ins] = await conn.query(
      "INSERT INTO app_users (name, email, password, role, status) VALUES (?, ?, ?, 'HOSTEL_HEAD', 'ACTIVE')",
      ['Boys Hostel Warden', 'boyswarden@college.com', hash]
    );
    bUserId = ins.insertId;
  } else {
    bUserId = bUser[0].id;
    await conn.query("UPDATE app_users SET role = 'HOSTEL_HEAD', password = ?, status = 'ACTIVE' WHERE id = ?", [hash, bUserId]);
  }

  // Update or insert Boys Warden into hostel_heads
  const [bHead] = await conn.query("SELECT * FROM hostel_heads WHERE hostel_id = 1");
  if (bHead.length === 0) {
    await conn.query(
      `INSERT INTO hostel_heads (user_id, hostel_id, employee_id, full_name, name, mobile, email, gender, designation, joining_date, status)
       VALUES (?, 1, 'WH001', 'Boys Hostel Warden', 'Boys Hostel Warden', '9876543210', 'boyswarden@college.com', 'MALE', 'Chief Warden (Boys)', '2024-01-15', 'ACTIVE')`,
      [bUserId]
    );
  } else {
    await conn.query(
      `UPDATE hostel_heads 
       SET user_id = ?, employee_id = 'WH001', full_name = 'Boys Hostel Warden', name = 'Boys Hostel Warden', 
           email = 'boyswarden@college.com', mobile = '9876543210', gender = 'MALE', 
           designation = 'Chief Warden (Boys)', joining_date = '2024-01-15', status = 'ACTIVE' 
       WHERE hostel_id = 1`,
      [bUserId]
    );
  }

  // Also sync password for boyshead@hostel.com alias
  await conn.query("UPDATE app_users SET password = ? WHERE email = 'boyshead@hostel.com'", [hash]);

  // Girls Warden User
  let [gUser] = await conn.query("SELECT * FROM app_users WHERE email = 'girlswarden@college.com'");
  let gUserId;
  if (gUser.length === 0) {
    const [ins] = await conn.query(
      "INSERT INTO app_users (name, email, password, role, status) VALUES (?, ?, ?, 'HOSTEL_HEAD', 'ACTIVE')",
      ['Girls Hostel Warden', 'girlswarden@college.com', hash]
    );
    gUserId = ins.insertId;
  } else {
    gUserId = gUser[0].id;
    await conn.query("UPDATE app_users SET role = 'HOSTEL_HEAD', password = ?, status = 'ACTIVE' WHERE id = ?", [hash, gUserId]);
  }

  // Update or insert Girls Warden into hostel_heads
  const [gHead] = await conn.query("SELECT * FROM hostel_heads WHERE hostel_id = 2");
  if (gHead.length === 0) {
    await conn.query(
      `INSERT INTO hostel_heads (user_id, hostel_id, employee_id, full_name, name, mobile, email, gender, designation, joining_date, status)
       VALUES (?, 2, 'WH002', 'Girls Hostel Warden', 'Girls Hostel Warden', '9876543211', 'girlswarden@college.com', 'FEMALE', 'Chief Warden (Girls)', '2024-02-01', 'ACTIVE')`,
      [gUserId]
    );
  } else {
    await conn.query(
      `UPDATE hostel_heads 
       SET user_id = ?, employee_id = 'WH002', full_name = 'Girls Hostel Warden', name = 'Girls Hostel Warden', 
           email = 'girlswarden@college.com', mobile = '9876543211', gender = 'FEMALE', 
           designation = 'Chief Warden (Girls)', joining_date = '2024-02-01', status = 'ACTIVE' 
       WHERE hostel_id = 2`,
      [gUserId]
    );
  }

  // Also sync password for girlshead@hostel.com alias
  await conn.query("UPDATE app_users SET password = ? WHERE email = 'girlshead@hostel.com'", [hash]);

  // Verify
  const [heads] = await conn.query(`
    SELECT hh.id, hh.employee_id, hh.full_name, hh.email, hh.hostel_id, h.hostel_name, hh.status, u.role
    FROM hostel_heads hh
    JOIN hostels h ON hh.hostel_id = h.id
    JOIN app_users u ON hh.user_id = u.id
  `);
  console.log('✓ Verified Wardens in Database:', heads);

  await conn.end();
}

migrate().catch(console.error);
