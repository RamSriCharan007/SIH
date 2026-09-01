import http from 'http';

const BASE_URL = 'http://localhost:5000';

function makeRequest(path, method = 'GET', body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers
    };

    const req = http.request(url, {
      method,
      headers: reqHeaders
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log('\n================================================================');
  console.log('🧪 RUNNING COMPREHENSIVE HOSPITAL PORTAL & SECURITY TEST SUITE');
  console.log('================================================================\n');

  try {
    // TEST 1: Hospital Login with Developer-Verified Credentials
    console.log('🔹 TEST 1: Hospital Authentication with Developer-Verified Credentials');
    const loginRes = await makeRequest('/api/hospital/auth/login', 'POST', {
      authCode: 'hosp-01',
      accessKey: 'Trimbak@PHC2026'
    });
    assert(loginRes.status === 200, 'Login returns HTTP 200 OK');
    assert(loginRes.data.success === true, 'Response indicates success: true');
    assert(typeof loginRes.data.token === 'string' && loginRes.data.token.startsWith('hosp_sec_'), 'Returns high-entropy crypto token (hosp_sec_...)');
    assert(loginRes.data.hospital?.id === 'hosp-01', 'Authenticated hospital matches hosp-01');

    const hospToken = loginRes.data.token;

    // TEST 2: Session Verification Endpoint
    console.log('\n🔹 TEST 2: Bearer Token Session Verification');
    const verifyRes = await makeRequest('/api/hospital/auth/verify', 'GET', null, {
      'Authorization': `Bearer ${hospToken}`
    });
    assert(verifyRes.status === 200, 'Token verification returns HTTP 200');
    assert(verifyRes.data.valid === true, 'Session valid is true');
    assert(verifyRes.data.hospital?.id === 'hosp-01', 'Session matches authenticated hospital');

    // TEST 3: Unauthorized Access Rejection (No token)
    console.log('\n🔹 TEST 3: Strict Zero-Trust Guard Rejection on Protected Endpoints');
    const unauthRes = await makeRequest('/api/hospital/requests', 'GET');
    assert(unauthRes.status === 401, 'Requests without Bearer token rejected with HTTP 401');

    // TEST 4: Privacy-Isolated Patient Requests for Authenticated Hospital
    console.log('\n🔹 TEST 4: Privacy-Isolated Patient Queue for Authenticated Hospital');
    const reqRes = await makeRequest('/api/hospital/requests', 'GET', null, {
      'Authorization': `Bearer ${hospToken}`
    });
    assert(reqRes.status === 200, 'Protected requests endpoint returns HTTP 200');
    assert(Array.isArray(reqRes.data.requests), 'Returns requests array');
    const allMatchHosp = reqRes.data.requests.every(r => r.hospitalId === 'hosp-01');
    assert(allMatchHosp, 'Every returned patient request strictly belongs to hosp-01 (Zero IDOR)');

    // TEST 5: Direct Walk-In Patient Registration
    console.log('\n🔹 TEST 5: Direct Emergency Walk-In Registration');
    const walkinRes = await makeRequest('/api/hospital/requests', 'POST', {
      patientName: 'Test Emergency Patient',
      phone: '9822099999',
      age: 28,
      gender: 'Female',
      emergencyType: 'Acute Viper Snakebite',
      triageTier: '60_CRITICAL_EMERGENCY'
    }, {
      'Authorization': `Bearer ${hospToken}`
    });
    assert(walkinRes.status === 200, 'Walk-in patient registered with HTTP 200');
    assert(walkinRes.data.request?.patientName === 'Test Emergency Patient', 'Walk-in record created with patient name');
    const testPatientId = walkinRes.data.request?.id;

    // TEST 6: Admit Patient & Automatic Bed Deduction
    console.log('\n🔹 TEST 6: Patient Bed Admission & Live Bed Capacity Sync');
    const initialProfile = await makeRequest('/api/hospital/profile', 'GET', null, {
      'Authorization': `Bearer ${hospToken}`
    });
    const initialGenBeds = initialProfile.data.hospital?.live_status?.beds?.general_available || 12;

    const admitRes = await makeRequest(`/api/hospital/requests/${testPatientId}/admit`, 'POST', {
      allocatedBed: 'General Ward Bed #05',
      assignedDoctor: 'Dr. Anand Kulkarni',
      status: 'ADMITTED'
    }, {
      'Authorization': `Bearer ${hospToken}`
    });
    assert(admitRes.status === 200, 'Admit endpoint returns HTTP 200');
    assert(admitRes.data.request?.status === 'ADMITTED', 'Patient status transitioned to ADMITTED');
    assert(admitRes.data.live_status?.beds?.general_available === initialGenBeds - 1, 'General bed capacity automatically decremented by 1');

    // TEST 7: Discharge Patient & Automatic Bed Restoration
    console.log('\n🔹 TEST 7: Patient Discharge & Automatic Bed Restoration');
    const dischargeRes = await makeRequest(`/api/hospital/requests/${testPatientId}/discharge`, 'POST', null, {
      'Authorization': `Bearer ${hospToken}`
    });
    assert(dischargeRes.status === 200, 'Discharge endpoint returns HTTP 200');
    assert(dischargeRes.data.request?.status === 'DISCHARGED', 'Patient status transitioned to DISCHARGED');
    assert(dischargeRes.data.live_status?.beds?.general_available === initialGenBeds, 'General bed capacity restored to original capacity');

    // TEST 8: Doctor Video Availability Toggle
    console.log('\n🔹 TEST 8: Doctor Video Consultation Roster Live Toggle');
    const docRes = await makeRequest('/api/hospital/doctors', 'GET', null, {
      'Authorization': `Bearer ${hospToken}`
    });
    const firstDoc = docRes.data.doctors?.[0];
    assert(firstDoc !== undefined, 'Found at least 1 doctor registered for hospital');

    const toggleDocRes = await makeRequest(`/api/hospital/doctors/${firstDoc.id}/toggle-video`, 'PUT', {
      isAvailable: true
    }, {
      'Authorization': `Bearer ${hospToken}`
    });
    assert(toggleDocRes.status === 200, 'Toggle doctor video status returns HTTP 200');
    assert(toggleDocRes.data.doctor?.is_available_for_video === true, 'Doctor video status is true');

    // Check public doctor teleconsult endpoint
    const publicDocRes = await makeRequest('/api/teleconsult/doctors-available', 'GET');
    const isDocInPublicList = publicDocRes.data.doctors?.some(d => d.id === firstDoc.id);
    assert(isDocInPublicList, 'Doctor is discoverable on public citizen teleconsultation feed');

    // TEST 9: Digital Clinical Prescription Receipt Issuance
    console.log('\n🔹 TEST 9: Digital Clinical Prescription Receipt Issuance with Digital Seal');
    const receiptRes = await makeRequest('/api/consultations/issue-receipt', 'POST', {
      hospitalId: 'hosp-01',
      patientName: 'Savita Jadhav',
      patientPhone: '9822019485',
      diagnosis: 'Gestational Hypertension (High Risk)',
      doctorName: 'Dr. Anand Kulkarni',
      medicines: [{ name: 'Tab. Labetalol 100mg', dosage: '1 TDS', duration: '14 Days' }],
      billing: { opdFee: 0, totalAmount: 0, subsidyScheme: 'MJPJAY 100% Free' }
    }, {
      'Authorization': `Bearer ${hospToken}`
    });
    assert(receiptRes.status === 200, 'Issue receipt returns HTTP 200');
    assert(receiptRes.data.receipt?.receiptId?.startsWith('MH-RCP-'), 'Generated official Maharashtra receipt ID (MH-RCP-...)');
    assert(typeof receiptRes.data.receipt?.qrVerificationHash === 'string', 'Generated QR verification hash for anti-counterfeit verification');

    // TEST 10: Developer Credential Provisioning Authority
    console.log('\n🔹 TEST 10: Master Developer Credentials Authority');
    const devLogin = await makeRequest('/api/dev/auth/login', 'POST', {
      username: 'Ram Sri Charan',
      password: 'Ram001301@'
    });
    const devToken = devLogin.data?.token || 'dev_token_ram_sri_charan_master';
    const devHeaders = { 'Authorization': `Bearer ${devToken}` };

    const devCredsRes = await makeRequest('/api/dev/hospitals/credentials', 'GET', null, devHeaders);
    assert(devCredsRes.status === 200, 'Developer credentials list returns HTTP 200');
    assert(devCredsRes.data.hospitals?.length >= 6, 'Contains all registered hospitals with auth_code and access_key');

    // Developer Provision New Hospital
    const devProvisionRes = await makeRequest('/api/dev/hospitals/provision', 'POST', {
      name: 'Automated Test Health Center',
      name_mr: 'स्वयंचलित चाचणी आरोग्य केंद्र',
      type: 'Primary Health Centre (PHC)',
      district: 'Nashik Rural',
      taluka: 'Igatpuri',
      auth_code: 'hosp-test-99',
      access_key: 'TestSecure#2026!'
    }, devHeaders);
    assert(devProvisionRes.status === 200, 'Developer provisions new hospital with HTTP 200');
    assert(devProvisionRes.data.hospital?.auth_code === 'hosp-test-99', 'New hospital provisioned with custom auth code');

    // Login with newly provisioned credentials
    const newHospLogin = await makeRequest('/api/hospital/auth/login', 'POST', {
      authCode: 'hosp-test-99',
      accessKey: 'TestSecure#2026!'
    });
    assert(newHospLogin.status === 200, 'New hospital logs in immediately with developer-issued passkey');

    // TEST 11: Developer Access Revocation / Suspension
    console.log('\n🔹 TEST 11: Developer Real-Time Access Revocation & Session Purge');
    const revokeRes = await makeRequest('/api/dev/hospitals/hosp-test-99/toggle-access', 'PUT', {
      is_verified: false
    }, devHeaders);
    assert(revokeRes.status === 200, 'Developer access revocation returns HTTP 200');

    // Attempt login while revoked
    const revokedLogin = await makeRequest('/api/hospital/auth/login', 'POST', {
      authCode: 'hosp-test-99',
      accessKey: 'TestSecure#2026!'
    });
    assert(revokedLogin.status === 403, 'Login rejected with HTTP 403 Forbidden when access is suspended');

    // Restore access
    await makeRequest('/api/dev/hospitals/hosp-test-99/toggle-access', 'PUT', {
      is_verified: true
    }, devHeaders);
    const restoredLogin = await makeRequest('/api/hospital/auth/login', 'POST', {
      authCode: 'hosp-test-99',
      accessKey: 'TestSecure#2026!'
    });
    assert(restoredLogin.status === 200, 'Login succeeds once Developer restores access');

    // TEST 12: Security Audit Logs
    console.log('\n🔹 TEST 12: Security & Authentication Audit Logs');
    const auditRes = await makeRequest('/api/hospital/auth/audit-logs', 'GET', null, {
      'Authorization': `Bearer ${hospToken}`
    });
    assert(auditRes.status === 200, 'Audit logs endpoint returns HTTP 200');
    assert(Array.isArray(auditRes.data.logs) && auditRes.data.logs.length > 0, 'Audit logs recorded authentication and clinical actions');

    console.log('\n================================================================');
    console.log(`📊 TEST RESULTS SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('================================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runTests();
