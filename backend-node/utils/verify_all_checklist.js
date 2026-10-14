const http = require('http');

function post(path, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request({
      hostname: 'localhost',
      port: 8080,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        ...headers
      }
    }, (res) => {
      let resBody = '';
      res.on('data', chunk => resBody += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(resBody) });
        } catch {
          resolve({ status: res.statusCode, body: resBody });
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function get(path, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 8080,
      path: path,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    }, (res) => {
      let resBody = '';
      res.on('data', chunk => resBody += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(resBody) });
        } catch {
          resolve({ status: res.statusCode, body: resBody });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function runChecklist() {
  console.log('====================================================');
  console.log('STARTING AUTOMATED VERIFICATION OF 11 CHECKLIST TESTS');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  function assert(testNum, testName, condition, details = '') {
    total++;
    if (condition) {
      console.log(`[PASS] TEST ${testNum}: ${testName}`);
      if (details) console.log(`       ${details}`);
      passed++;
    } else {
      console.error(`[FAIL] TEST ${testNum}: ${testName}`);
      if (details) console.error(`       Failure details: ${details}`);
    }
  }

  // TEST 1: Boys Warden Login -> Boys Warden Dashboard
  const boysLogin = await post('/api/auth/login', {
    email: 'wardenboys@college.com',
    password: 'Warden@123'
  });
  const boysRole = boysLogin.body?.user?.role;
  const boysDashboard = boysLogin.body?.user?.dashboardUrl;
  const boysToken = boysLogin.body?.token;
  assert(1, 'Boys Warden Login', 
    boysLogin.status === 200 && boysRole === 'BOYS_WARDEN' && boysDashboard === '/warden/boys/dashboard',
    `Role: ${boysRole}, Redirect: ${boysDashboard}`);

  // TEST 2: Girls Warden Login -> Girls Warden Dashboard
  const girlsLogin = await post('/api/auth/login', {
    email: 'wardengirls@college.com',
    password: 'Warden@123'
  });
  const girlsRole = girlsLogin.body?.user?.role;
  const girlsDashboard = girlsLogin.body?.user?.dashboardUrl;
  const girlsToken = girlsLogin.body?.token;
  assert(2, 'Girls Warden Login',
    girlsLogin.status === 200 && girlsRole === 'GIRLS_WARDEN' && girlsDashboard === '/warden/girls/dashboard',
    `Role: ${girlsRole}, Redirect: ${girlsDashboard}`);

  // TEST 3: Student Login -> Student Dashboard
  const studentLogin = await post('/api/auth/login', {
    email: 'student@hostel.com',
    password: 'password123'
  });
  const studentRole = studentLogin.body?.user?.role;
  const studentDashboard = studentLogin.body?.user?.dashboardUrl;
  const studentToken = studentLogin.body?.token;
  assert(3, 'Student Login',
    studentLogin.status === 200 && studentRole === 'STUDENT' && studentDashboard === '/student/dashboard',
    `Role: ${studentRole}, Redirect: ${studentDashboard}`);

  // TEST 4: Wrong password -> "Invalid email or password."
  const wrongPass = await post('/api/auth/login', {
    email: 'wardenboys@college.com',
    password: 'WrongPassword999'
  });
  assert(4, 'Wrong Password Authentication Error',
    wrongPass.status === 401 && wrongPass.body?.message === 'Invalid email or password.',
    `Status: ${wrongPass.status}, Message: "${wrongPass.body?.message}"`);

  // TEST 5: Boys Warden attempts to access Girls Hostel resource (Hostel 2)
  const boysAccessGirls = await get('/api/allocations/hostel/2', {
    Authorization: `Bearer ${boysToken}`
  });
  assert(5, 'Boys Warden accesses Girls Hostel (Hostel 2) -> Access Denied',
    boysAccessGirls.status === 403,
    `Status: ${boysAccessGirls.status}, Message: "${boysAccessGirls.body?.message}"`);

  // TEST 6: Girls Warden attempts to access Boys Hostel resource (Hostel 1)
  const girlsAccessBoys = await get('/api/allocations/hostel/1', {
    Authorization: `Bearer ${girlsToken}`
  });
  assert(6, 'Girls Warden accesses Boys Hostel (Hostel 1) -> Access Denied',
    girlsAccessBoys.status === 403,
    `Status: ${girlsAccessBoys.status}, Message: "${girlsAccessBoys.body?.message}"`);

  // TEST 7: Student attempts to access Warden dashboard / API
  const studentAccessWarden = await get('/api/warden/dashboard', {
    Authorization: `Bearer ${studentToken}`
  });
  assert(7, 'Student accesses Warden API -> Access Denied (403)',
    studentAccessWarden.status === 403,
    `Status: ${studentAccessWarden.status}, Message: "${studentAccessWarden.body?.message}"`);

  // TEST 8: Logged-out user accesses protected route -> 401
  const unauthAccess = await get('/api/warden/dashboard');
  assert(8, 'Logged-out user accesses protected route -> 401 Unauthorized',
    unauthAccess.status === 401,
    `Status: ${unauthAccess.status}, Message: "${unauthAccess.body?.message}"`);

  // TEST 9: Super Admin Login attempt is completely rejected
  const adminLogin = await post('/api/auth/login', {
    email: 'admin@hostel.com',
    password: 'password123'
  });
  assert(9, 'Super Admin login attempt is permanently blocked',
    adminLogin.status === 401 || adminLogin.status === 403,
    `Status: ${adminLogin.status}, Message: "${adminLogin.body?.message}"`);

  // TEST 10: Boys Warden Dashboard stats live data check
  const boysStats = await get('/api/warden/dashboard', {
    Authorization: `Bearer ${boysToken}`
  });
  const data = boysStats.body?.data;
  assert(10, 'Boys Warden Dashboard Data from MySQL',
    boysStats.status === 200 && data?.hostelType === 'BOYS' && typeof data?.totalStudents === 'number' && typeof data?.pendingRequests === 'number',
    `Hostel: ${data?.hostelName}, Students: ${data?.totalStudents}, Beds: ${data?.totalBeds}, Pending Apps: ${data?.pendingApplications}`);

  // TEST 11: Girls Warden Dashboard stats live data check
  const girlsStats = await get('/api/warden/dashboard', {
    Authorization: `Bearer ${girlsToken}`
  });
  const gdata = girlsStats.body?.data;
  assert(11, 'Girls Warden Dashboard Data from MySQL',
    girlsStats.status === 200 && gdata?.hostelType === 'GIRLS' && typeof gdata?.totalStudents === 'number' && typeof gdata?.pendingRequests === 'number',
    `Hostel: ${gdata?.hostelName}, Students: ${gdata?.totalStudents}, Beds: ${gdata?.totalBeds}, Pending Apps: ${gdata?.pendingApplications}`);

  console.log('\n====================================================');
  console.log(`VERIFICATION SUMMARY: ${passed}/${total} TESTS PASSED`);
  console.log('====================================================');

  if (passed === total) {
    console.log('ALL 11 CHECKLIST TESTS PASSED SUCCESSFULLY!');
    process.exit(0);
  } else {
    console.error('SOME TESTS FAILED');
    process.exit(1);
  }
}

runChecklist().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
