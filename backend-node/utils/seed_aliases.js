const pool = require('../config/db');
const bcrypt = require('bcryptjs');

async function seedAliases() {
  try {
    const hash = await bcrypt.hash('Warden@123', 10);
    
    // Check wardenboys@college.com
    const [b] = await pool.query("SELECT id FROM app_users WHERE email = 'wardenboys@college.com'");
    if (b.length === 0) {
      const [u] = await pool.query(
        "INSERT INTO app_users (name, email, password, role, status) VALUES ('Boys Hostel Warden', 'wardenboys@college.com', ?, 'BOYS_WARDEN', 'ACTIVE')",
        [hash]
      );
      await pool.query(
        "INSERT INTO hostel_heads (user_id, hostel_id, employee_id, full_name, name, mobile, email, gender, designation, status) VALUES (?, 1, 'WH001', 'Boys Hostel Warden', 'Boys Hostel Warden', '9876543210', 'wardenboys@college.com', 'MALE', 'Chief Warden (Boys)', 'ACTIVE')",
        [u.insertId]
      );
      console.log('✓ Added wardenboys@college.com / Warden@123');
    } else {
      console.log('• wardenboys@college.com already present');
    }

    // Check wardengirls@college.com
    const [g] = await pool.query("SELECT id FROM app_users WHERE email = 'wardengirls@college.com'");
    if (g.length === 0) {
      const [u2] = await pool.query(
        "INSERT INTO app_users (name, email, password, role, status) VALUES ('Girls Hostel Warden', 'wardengirls@college.com', ?, 'GIRLS_WARDEN', 'ACTIVE')",
        [hash]
      );
      await pool.query(
        "INSERT INTO hostel_heads (user_id, hostel_id, employee_id, full_name, name, mobile, email, gender, designation, status) VALUES (?, 2, 'WH002', 'Girls Hostel Warden', 'Girls Hostel Warden', '9876543211', 'wardengirls@college.com', 'FEMALE', 'Chief Warden (Girls)', 'ACTIVE')",
        [u2.insertId]
      );
      console.log('✓ Added wardengirls@college.com / Warden@123');
    } else {
      console.log('• wardengirls@college.com already present');
    }

    console.log('All warden accounts and aliases ready.');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seedAliases();
