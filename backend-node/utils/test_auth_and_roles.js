const http = require('http');

const post = (path, body, token = null) => {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request({
      hostname: 'localhost',
      port: 8080,
      path: path,
      method: 'POST',
      headers: headers
    }, (res) => {
      let resBody = '';
      res.on('data', chunk => resBody += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(resBody) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: resBody });
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
};

const get = (path, token = null) => {
  return new Promise((resolve, reject) => {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request({
      hostname: 'localhost',
      port: 8080,
      path: path,
      method: 'GET',
      headers: headers
    }, (res) => {
      let resBody = '';
      res.on('data', chunk => resBody += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(resBody) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: resBody });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
};

async function runTests() {
  console.log('====================================================');
  console.log('🧪 TESTING AUTHENTICATION & ROLE-BASED FLOWS');
  console.log('====================================================\n');

  // Test 1: Student Login
  console.log('1. Testing Student Login...');
  const studentRes = await post('/api/auth/login', {
    email: 'student@hostel.com',
    password: 'password123'
  });
  console.log('Status:', studentRes.status);
  console.log('Success:', studentRes.body.success);
  console.log('Role:', studentRes.body.user?.role);
  console.log('Redirect Destination:', studentRes.body.user?.role === 'STUDENT' ? '/student/dashboard' : 'FAILED');
  if (studentRes.body.user?.role !== 'STUDENT') throw new Error('Student role mismatch');
  console.log('✅ Student Login Flow Passed\n');

  // Test 2: Boys Warden Login
  console.log('2. Testing Boys Warden Login (wardenboys@college.com)...');
  const boysRes = await post('/api/auth/login', {
    email: 'wardenboys@college.com',
    password: 'Warden@123'
  });
  console.log('Status:', boysRes.status);
  console.log('Success:', boysRes.body.success);
  console.log('Role:', boysRes.body.user?.role);
  console.log('Hostel Type:', boysRes.body.user?.hostelType);
  console.log('Redirect Destination:', boysRes.body.user?.role === 'BOYS_WARDEN' ? '/warden/boys/dashboard' : 'FAILED');
  if (boysRes.body.user?.role !== 'BOYS_WARDEN' || boysRes.body.user?.hostelType !== 'BOYS') {
    throw new Error('Boys Warden role/hostelType mismatch');
  }
  
  // Verify Boys Warden backend dashboard isolation
  const boysToken = boysRes.body.token;
  const boysDash = await get('/api/warden/dashboard', boysToken);
  console.log('Boys Warden Hostel Name:', boysDash.body.data?.hostelName);
  console.log('Boys Warden Hostel ID:', boysDash.body.data?.hostelId);
  if (boysDash.body.data?.hostelId !== 1) throw new Error('Boys Warden isolation failed');
  console.log('✅ Boys Warden Login Flow & Hostel Isolation Passed\n');

  // Test 3: Girls Warden Login
  console.log('3. Testing Girls Warden Login (wardengirls@college.com)...');
  const girlsRes = await post('/api/auth/login', {
    email: 'wardengirls@college.com',
    password: 'Warden@123'
  });
  console.log('Status:', girlsRes.status);
  console.log('Success:', girlsRes.body.success);
  console.log('Role:', girlsRes.body.user?.role);
  console.log('Hostel Type:', girlsRes.body.user?.hostelType);
  console.log('Redirect Destination:', girlsRes.body.user?.role === 'GIRLS_WARDEN' ? '/warden/girls/dashboard' : 'FAILED');
  if (girlsRes.body.user?.role !== 'GIRLS_WARDEN' || girlsRes.body.user?.hostelType !== 'GIRLS') {
    throw new Error('Girls Warden role/hostelType mismatch');
  }

  // Verify Girls Warden backend dashboard isolation
  const girlsToken = girlsRes.body.token;
  const girlsDash = await get('/api/warden/dashboard', girlsToken);
  console.log('Girls Warden Hostel Name:', girlsDash.body.data?.hostelName);
  console.log('Girls Warden Hostel ID:', girlsDash.body.data?.hostelId);
  if (girlsDash.body.data?.hostelId !== 2) throw new Error('Girls Warden isolation failed');
  console.log('✅ Girls Warden Login Flow & Hostel Isolation Passed\n');

  // Test 4: Super Admin Login
  console.log('4. Testing Super Admin Login (admin@hostel.com)...');
  const adminRes = await post('/api/auth/login', {
    email: 'admin@hostel.com',
    password: 'Admin@123'
  });
  console.log('Status:', adminRes.status);
  console.log('Success:', adminRes.body.success);
  console.log('Role:', adminRes.body.user?.role);
  console.log('Redirect Destination:', adminRes.body.user?.role === 'SUPER_ADMIN' ? '/admin/dashboard' : 'FAILED');
  if (adminRes.body.user?.role !== 'SUPER_ADMIN') throw new Error('Admin role mismatch');
  console.log('✅ Super Admin Login Flow Passed\n');

  // Test 5: Invalid Password
  console.log('5. Testing Wrong Password...');
  const wrongPassRes = await post('/api/auth/login', {
    email: 'admin@hostel.com',
    password: 'IncorrectPassword999'
  });
  console.log('Status:', wrongPassRes.status);
  console.log('Error Message:', wrongPassRes.body.message);
  if (wrongPassRes.body.message !== 'Invalid email or password.') {
    throw new Error('Incorrect error message for wrong password: ' + wrongPassRes.body.message);
  }
  console.log('✅ Wrong Password Error Handling Passed\n');

  // Test 6: Invalid Email
  console.log('6. Testing Non-existent Email...');
  const wrongEmailRes = await post('/api/auth/login', {
    email: 'nonexistent.user9999@college.com',
    password: 'SomePassword@123'
  });
  console.log('Status:', wrongEmailRes.status);
  console.log('Error Message:', wrongEmailRes.body.message);
  if (wrongEmailRes.body.message !== 'Invalid email or password.') {
    throw new Error('Incorrect error message for wrong email: ' + wrongEmailRes.body.message);
  }
  console.log('✅ Non-existent Email Error Handling Passed\n');

  // Test 7: Inactive Account Test
  console.log('7. Testing Inactive Account Status...');
  const pool = require('../config/db');
  await pool.query("UPDATE app_users SET status = 'INACTIVE' WHERE email = 'test_inactive_user@college.com' OR (id = 9999)");
  // Ensure a test inactive user exists
  await pool.query(`
    INSERT INTO app_users (id, name, email, password, role, status)
    VALUES (9999, 'Inactive User', 'inactive@college.com', '$2a$10$wT7sU8r6Lp61JcmmXy5e0OqgQG.Vn1G1G1G1G1G1G1G1G1G1G1G1G', 'STUDENT', 'INACTIVE')
    ON DUPLICATE KEY UPDATE status = 'INACTIVE'
  `);
  const inactiveRes = await post('/api/auth/login', {
    email: 'inactive@college.com',
    password: 'password123'
  });
  console.log('Status:', inactiveRes.status);
  console.log('Error Message:', inactiveRes.body.message);
  if (inactiveRes.body.message !== 'Your account is inactive. Please contact the administrator.') {
    throw new Error('Incorrect inactive account message: ' + inactiveRes.body.message);
  }
  console.log('✅ Inactive Account Handling Passed\n');

  // Cleanup test inactive user
  await pool.query('DELETE FROM app_users WHERE id = 9999');

  console.log('====================================================');
  console.log('🎉 ALL 7 AUTHENTICATION & ROLE-BASED TESTS PASSED!');
  console.log('====================================================');
  process.exit(0);
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
