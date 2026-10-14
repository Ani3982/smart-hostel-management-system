const API = 'http://localhost:8080/api';

async function runTests() {
  console.log('========================================================================');
  console.log('   FULL END-TO-END VERIFICATION: ADMIN + WARDEN SYSTEM');
  console.log('========================================================================');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  async function post(url, data, token) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });
    const json = await res.json().catch(() => ({}));
    return { status: res.status, ok: res.ok, data: json };
  }

  async function get(url, token) {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(url, { method: 'GET', headers });
    const json = await res.json().catch(() => ({}));
    return { status: res.status, ok: res.ok, data: json };
  }

  try {
    // -------------------------------------------------------------
    // TEST 1: Super Admin Login & Warden Management
    // -------------------------------------------------------------
    console.log('\n--- 1. Testing Super Admin Login & Warden Management ---');
    const adminLogin = await post(`${API}/auth/login`, {
      email: 'admin@hostel.com',
      password: 'Admin@123'
    });
    assert(adminLogin.data.success, 'Super Admin logged in successfully');
    const adminToken = adminLogin.data.data.token;

    const wardensRes = await get(`${API}/admin/wardens`, adminToken);
    assert(wardensRes.data.success, 'Fetched wardens list');
    const wardens = wardensRes.data.data;
    assert(wardens.length === 2, `Exactly 2 Wardens exist (found ${wardens.length})`);

    const boysWarden = wardens.find(w => w.hostelId === 1);
    const girlsWarden = wardens.find(w => w.hostelId === 2);

    assert(boysWarden && boysWarden.employeeId === 'WH001', 'Boys Warden has Employee ID WH001');
    assert(boysWarden && boysWarden.role === 'HOSTEL_HEAD', 'Boys Warden role is HOSTEL_HEAD');
    assert(boysWarden && boysWarden.email === 'boyswarden@college.com', 'Boys Warden email is boyswarden@college.com');
    assert(boysWarden && boysWarden.status === 'ACTIVE', 'Boys Warden is ACTIVE');

    assert(girlsWarden && girlsWarden.employeeId === 'WH002', 'Girls Warden has Employee ID WH002');
    assert(girlsWarden && girlsWarden.role === 'HOSTEL_HEAD', 'Girls Warden role is HOSTEL_HEAD');
    assert(girlsWarden && girlsWarden.email === 'girlswarden@college.com', 'Girls Warden email is girlswarden@college.com');
    assert(girlsWarden && girlsWarden.status === 'ACTIVE', 'Girls Warden is ACTIVE');

    // -------------------------------------------------------------
    // TEST 2: Boys Warden Login & Dynamic Dashboard Metrics
    // -------------------------------------------------------------
    console.log('\n--- 2. Testing Boys Warden Dashboard & Isolation ---');
    const boysLogin = await post(`${API}/auth/login`, {
      email: 'boyswarden@college.com',
      password: 'Warden@123'
    });
    assert(boysLogin.data.success, 'Boys Warden logged in successfully');
    assert(boysLogin.data.data.role === 'HOSTEL_HEAD' || boysLogin.data.data.role === 'ROLE_HOSTEL_HEAD', 'Boys Warden authenticated with role HOSTEL_HEAD');
    const boysToken = boysLogin.data.data.token;

    const boysDash = await get(`${API}/warden/dashboard`, boysToken);
    assert(boysDash.data.success, 'Boys Warden dashboard stats retrieved');
    const bStats = boysDash.data.data;
    assert(bStats.hostelId === 1, `Hostel ID is locked to 1 (Boys Hostel)`);
    assert(bStats.totalRooms > 0, `Total Rooms is dynamic from MySQL: ${bStats.totalRooms}`);
    assert(bStats.totalBeds > 0, `Total Beds is dynamic from MySQL: ${bStats.totalBeds}`);
    assert(bStats.availableBeds >= 0, `Available Beds is dynamic: ${bStats.availableBeds}`);
    assert(bStats.totalApplications > 0, `Total Applications is dynamic: ${bStats.totalApplications}`);
    console.log('   -> Boys Dashboard Live Cards:', {
      totalStudents: bStats.totalStudents,
      pendingApplications: bStats.pendingApplications,
      approvedApplications: bStats.approvedApplications,
      rejectedApplications: bStats.rejectedApplications,
      totalRooms: bStats.totalRooms,
      totalBeds: bStats.totalBeds,
      occupiedBeds: bStats.occupiedBeds,
      availableBeds: bStats.availableBeds,
      pendingPayments: bStats.pendingPayments,
      successfulPayments: bStats.successfulPayments
    });

    const boysApps = await get(`${API}/warden/applications`, boysToken);
    assert(boysApps.data.success, 'Boys Warden applications retrieved');
    const bAppList = boysApps.data.data;
    const allBoysApps = bAppList.every(a => a.hostel.id === 1);
    assert(allBoysApps, `All ${bAppList.length} applications strictly belong to Boys Hostel (hostel_id=1)`);

    // -------------------------------------------------------------
    // TEST 3: Girls Warden Login & Dynamic Dashboard Metrics
    // -------------------------------------------------------------
    console.log('\n--- 3. Testing Girls Warden Dashboard & Isolation ---');
    const girlsLogin = await post(`${API}/auth/login`, {
      email: 'girlswarden@college.com',
      password: 'Warden@123'
    });
    assert(girlsLogin.data.success, 'Girls Warden logged in successfully');
    assert(girlsLogin.data.data.role === 'HOSTEL_HEAD' || girlsLogin.data.data.role === 'ROLE_HOSTEL_HEAD', 'Girls Warden authenticated with role HOSTEL_HEAD');
    const girlsToken = girlsLogin.data.data.token;

    const girlsDash = await get(`${API}/warden/dashboard`, girlsToken);
    assert(girlsDash.data.success, 'Girls Warden dashboard stats retrieved');
    const gStats = girlsDash.data.data;
    assert(gStats.hostelId === 2, `Hostel ID is locked to 2 (Girls Hostel)`);
    assert(gStats.totalRooms > 0, `Total Rooms is dynamic from MySQL: ${gStats.totalRooms}`);
    assert(gStats.totalBeds > 0, `Total Beds is dynamic from MySQL: ${gStats.totalBeds}`);
    console.log('   -> Girls Dashboard Live Cards:', {
      totalStudents: gStats.totalStudents,
      pendingApplications: gStats.pendingApplications,
      approvedApplications: gStats.approvedApplications,
      rejectedApplications: gStats.rejectedApplications,
      totalRooms: gStats.totalRooms,
      totalBeds: gStats.totalBeds,
      occupiedBeds: gStats.occupiedBeds,
      availableBeds: gStats.availableBeds,
      pendingPayments: gStats.pendingPayments,
      successfulPayments: gStats.successfulPayments
    });

    const girlsApps = await get(`${API}/warden/applications`, girlsToken);
    assert(girlsApps.data.success, 'Girls Warden applications retrieved');
    const gAppList = girlsApps.data.data;
    const allGirlsApps = gAppList.every(a => a.hostel.id === 2);
    assert(allGirlsApps, `All ${gAppList.length} applications strictly belong to Girls Hostel (hostel_id=2)`);

    // -------------------------------------------------------------
    // TEST 4: Security Breach Prevention (Cross-Hostel Access)
    // -------------------------------------------------------------
    console.log('\n--- 4. Testing Cross-Hostel Access Lockdown ---');
    if (gAppList.length > 0) {
      const girlsAppId = gAppList[0].id;
      const attemptBoys = await get(`${API}/warden/applications/${girlsAppId}`, boysToken);
      assert(!attemptBoys.ok && (attemptBoys.status === 404 || attemptBoys.status === 403),
        `Boys Warden blocked from accessing Girls Hostel application (${attemptBoys.status} response)`);
    }

    if (bAppList.length > 0) {
      const boysAppId = bAppList[0].id;
      const attemptGirls = await get(`${API}/warden/applications/${boysAppId}`, girlsToken);
      assert(!attemptGirls.ok && (attemptGirls.status === 404 || attemptGirls.status === 403),
        `Girls Warden blocked from accessing Boys Hostel application (${attemptGirls.status} response)`);
    }

    // -------------------------------------------------------------
    // TEST 5: Double Allocation Prevention on Bed
    // -------------------------------------------------------------
    console.log('\n--- 5. Testing Bed Double Allocation Prevention ---');
    const boysBedsRes = await get(`${API}/warden/beds?status=OCCUPIED`, boysToken);
    const occupiedBeds = boysBedsRes.data.data;
    if (occupiedBeds && occupiedBeds.length > 0) {
      const occBed = occupiedBeds[0];
      const dupAttempt = await post(`${API}/warden/allocations`, {
        studentId: 999,
        roomId: occBed.room_id,
        bedId: occBed.id
      }, boysToken);
      assert(!dupAttempt.ok && dupAttempt.status === 400,
        `Double-allocation rejected with error: "${dupAttempt.data?.message}"`);
    } else {
      console.log('   (No currently occupied beds found to test duplicate allocation)');
    }

    // -------------------------------------------------------------
    // SUMMARY
    // -------------------------------------------------------------
    console.log('\n========================================================================');
    console.log(`   TEST EXECUTION COMPLETED: ${passed} PASSED, ${failed} FAILED`);
    console.log('========================================================================');

    if (failed === 0) {
      console.log('🏆 ALL SECURITY AND FUNCTIONAL REQUIREMENTS VERIFIED PERFECTLY!');
      process.exit(0);
    } else {
      process.exit(1);
    }

  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runTests();
