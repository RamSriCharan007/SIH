const BASE_URL = 'http://localhost:5000';

async function testDevSecurity() {
  console.log('====================================================');
  console.log('🔐 TESTING DEVELOPER PORTAL SECURITY & AUTHENTICATION');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(name, condition, extra = '') {
    if (condition) {
      console.log(`✅ [PASS] ${name} ${extra}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${name} ${extra}`);
      failed++;
    }
  }

  try {
    // 1. Unauthorized request without credentials MUST be rejected
    console.log('--- 1. Unauthenticated Request Rejection ---');
    const unauthRes = await fetch(`${BASE_URL}/api/dev/stats`);
    assert('Unauthenticated access to /api/dev/stats rejected (401)', unauthRes.status === 401);

    // 2. ASHA Worker credentials trying to access Dev Portal MUST be rejected
    console.log('\n--- 2. ASHA Worker / Citizen Blocked from Dev Portal ---');
    const ashaAttemptRes = await fetch(`${BASE_URL}/api/dev/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'Sunita Bai Shinde (ASHA)', password: 'password123' })
    });
    assert('ASHA Worker access rejected (401)', ashaAttemptRes.status === 401);

    // 3. Wrong password for Ram Sri Charan MUST be rejected
    console.log('\n--- 3. Incorrect Password Rejection ---');
    const wrongPassRes = await fetch(`${BASE_URL}/api/dev/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'Ram Sri Charan', password: 'WrongPassword999' })
    });
    assert('Incorrect password rejected (401)', wrongPassRes.status === 401);

    // 4. Valid Master Developer Login (Ram Sri Charan / Ram001301@)
    console.log('\n--- 4. Master Developer Authentication ---');
    const validLoginRes = await fetch(`${BASE_URL}/api/dev/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'Ram Sri Charan', password: 'Ram001301@' })
    });
    const loginData = await validLoginRes.json();
    assert('Master Developer Login Success (200)', validLoginRes.status === 200 && loginData.success === true);
    assert('Admin User is Ram Sri Charan', loginData.user?.fullName === 'Ram Sri Charan');
    const devToken = loginData.token;

    // 5. Verify Token API
    console.log('\n--- 5. Token Verification API ---');
    const verifyRes = await fetch(`${BASE_URL}/api/dev/auth/verify`, {
      headers: { 'Authorization': `Bearer ${devToken}` }
    });
    const verifyData = await verifyRes.json();
    assert('Dev Token Validated', verifyRes.status === 200 && verifyData.valid === true);

    // 6. Accessing Protected Dev APIs with Valid Token
    console.log('\n--- 6. Accessing Protected Dev APIs with Token ---');
    const authStatsRes = await fetch(`${BASE_URL}/api/dev/stats`, {
      headers: { 'Authorization': `Bearer ${devToken}` }
    });
    const statsData = await authStatsRes.json();
    assert('Protected /api/dev/stats accessible with Admin Token', authStatsRes.status === 200 && statsData.stats?.totalHospitals > 0);

    const authHospRes = await fetch(`${BASE_URL}/api/dev/hospitals`, {
      headers: { 'Authorization': `Bearer ${devToken}` }
    });
    assert('Protected /api/dev/hospitals accessible with Admin Token', authHospRes.status === 200);

    console.log(`\n====================================================`);
    console.log(`🎯 DEV SECURITY TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
    console.log(`====================================================\n`);
  } catch (err) {
    console.error('Dev auth test error:', err);
  }
}

testDevSecurity();
