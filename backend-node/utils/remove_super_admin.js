const pool = require('../config/db');

async function removeSuperAdmin() {
  console.log('--- REMOVING SUPER ADMIN FROM DATABASE ---');
  
  // Delete Super Admin account
  const [res] = await pool.query(
    "DELETE FROM app_users WHERE email = 'admin@hostel.com' OR role IN ('ADMIN', 'SUPER_ADMIN', 'ROLE_ADMIN')"
  );
  console.log(`Deleted ${res.affectedRows} admin user(s).`);

  // Ensure any other users are strictly STUDENT, BOYS_WARDEN, or GIRLS_WARDEN
  const [users] = await pool.query(
    "SELECT id, name, email, role, hostel_type, status FROM app_users ORDER BY id ASC"
  );
  console.log('Remaining Database Users:');
  console.table(users);
  
  // Verify no active super admin exists
  const [admins] = await pool.query(
    "SELECT * FROM app_users WHERE role IN ('ADMIN', 'SUPER_ADMIN', 'ROLE_ADMIN') OR email = 'admin@hostel.com'"
  );
  if (admins.length === 0) {
    console.log('✓ Verified: Zero Super Admin users remain in the database.');
  } else {
    console.error('✗ Warning: Admin accounts still exist:', admins);
  }
}

removeSuperAdmin()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
