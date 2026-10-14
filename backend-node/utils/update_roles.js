const pool = require('../config/db');

async function updateRoles() {
  try {
    await pool.query("UPDATE app_users SET role = 'SUPER_ADMIN', hostel_type = NULL WHERE email = 'admin@hostel.com'");
    await pool.query("UPDATE app_users SET role = 'BOYS_WARDEN', hostel_type = 'BOYS' WHERE email IN ('boyswarden@college.com', 'wardenboys@college.com', 'boyshead@hostel.com')");
    await pool.query("UPDATE app_users SET role = 'GIRLS_WARDEN', hostel_type = 'GIRLS' WHERE email IN ('girlswarden@college.com', 'wardengirls@college.com', 'girlshead@hostel.com')");
    await pool.query("UPDATE app_users SET role = 'STUDENT' WHERE role NOT IN ('SUPER_ADMIN', 'BOYS_WARDEN', 'GIRLS_WARDEN')");
    
    const [rows] = await pool.query('SELECT id, name, email, role, hostel_type, status FROM app_users');
    console.table(rows);
    process.exit(0);
  } catch (err) {
    console.error('Update error:', err);
    process.exit(1);
  }
}

updateRoles();
