const BASE_URL = 'http://localhost:5000';

async function runTests() {
  console.log('====================================================');
  console.log('🧪 VERIFYING ROLE RESTRICTIONS, BIOMETRICS & DEV PORTAL');
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
    // 1. Test Citizen OTP Verification & Role Lock
    console.log('--- 1. Testing Citizen Auth & Role Enforcement ---');
    const otpRes = await fetch(`${BASE_URL}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '9876543210', otp: '123456', role: 'citizen', fullName: 'Ramesh Shantaram Patil' })
    });
    const otpData = await otpRes.json();
    assert('Citizen OTP Login', otpData.success === true);
    assert('Role is locked to Citizen', otpData.user?.role === 'citizen');

    // 2. Test ASHA Route Restriction (Citizens MUST be blocked with 403)
    console.log('\n--- 2. Testing ASHA Route Guard for Citizen ---');
    const ashaBlockRes = await fetch(`${BASE_URL}/api/sync/asha-records`, {
      headers: { 'x-user-role': 'citizen', 'x-user-phone': '9876543210' }
    });
    assert('Citizen is BLOCKED from ASHA endpoint (403 Forbidden)', ashaBlockRes.status === 403);

    // 3. Test ASHA Login & Route Access
    console.log('\n--- 3. Testing ASHA Worker Auth & Route Access ---');
    const ashaLoginRes = await fetch(`${BASE_URL}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '9822019485', otp: '123456', role: 'asha', fullName: 'Sunita Bai Shinde' })
    });
    const ashaLoginData = await ashaLoginRes.json();
    assert('ASHA Login Success', ashaLoginData.success === true);
    assert('ASHA Role Verified', ashaLoginData.user?.role === 'asha');

    const ashaAllowRes = await fetch(`${BASE_URL}/api/sync/asha-records`, {
      headers: { 'x-user-role': 'asha', 'x-user-phone': '9822019485' }
    });
    assert('ASHA Worker is GRANTED access (200 OK)', ashaAllowRes.status === 200);

    // 4. Test Face Recognition Endpoints
    console.log('\n--- 4. Testing AI Face Recognition Biometrics ---');
    const faceRegRes = await fetch(`${BASE_URL}/api/auth/face-register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: '9822019485',
        fullName: 'Sunita Bai Shinde (ASHA)',
        role: 'asha',
        faceDescriptor: 'descriptor_vec_68_points_test'
      })
    });
    const faceRegData = await faceRegRes.json();
    assert('Face Registration Endpoint', faceRegData.success === true);

    const faceLoginRes = await fetch(`${BASE_URL}/api/auth/face-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '9822019485', livenessScore: 0.994 })
    });
    const faceLoginData = await faceLoginRes.json();
    assert('Face Login Endpoint Match', faceLoginData.success === true);
    assert('Face Match High Confidence', faceLoginData.matchConfidence > 0.95);

    // 5. Test WebAuthn Fingerprint Endpoint
    console.log('\n--- 5. Testing WebAuthn Fingerprint Biometrics ---');
    const bioLoginRes = await fetch(`${BASE_URL}/api/auth/biometric-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '9822019485', role: 'asha', fullName: 'Sunita Bai Shinde' })
    });
    const bioLoginData = await bioLoginRes.json();
    assert('Biometric Fingerprint Login', bioLoginData.success === true);
    assert('Fingerprint AuthMethod Assigned', bioLoginData.user?.authMethod?.includes('Biometric'));

    // 6. Test Developer Portal APIs (Authenticated as Ram Sri Charan)
    console.log('\n--- 6. Testing Developer Portal Management APIs ---');
    const devLoginRes = await fetch(`${BASE_URL}/api/dev/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'Ram Sri Charan', password: 'Ram001301@' })
    });
    const devLoginData = await devLoginRes.json();
    const devToken = devLoginData.token;
    assert('Developer Master Login Success', devLoginData.success === true && !!devToken);

    const devStatsRes = await fetch(`${BASE_URL}/api/dev/stats`, {
      headers: { 'Authorization': `Bearer ${devToken}` }
    });
    const devStatsData = await devStatsRes.json();
    assert('Dev Portal Stats Endpoint', devStatsData.success === true && devStatsData.stats?.totalHospitals > 0);

    // Add Hospital via Dev Portal
    const testHospPayload = {
      name: "Test Developer PHC",
      name_mr: "चाचणी प्राथमिक आरोग्य केंद्र",
      type: "Primary Health Centre (PHC)",
      district: "Nashik Rural",
      taluka: "Trimbakeshwar",
      latitude: 19.95,
      longitude: 73.55,
      contact: "0253-999999",
      general_beds: 25,
      icu_beds: 4,
      anti_venom: 30,
      blood_O_pos: 20
    };

    const addHospRes = await fetch(`${BASE_URL}/api/dev/hospitals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${devToken}` },
      body: JSON.stringify(testHospPayload)
    });
    const addHospData = await addHospRes.json();
    assert('Dev Portal Add Hospital', addHospData.success === true);
    const testHospId = addHospData.hospital?.id;

    // Update Blood Stock for the Hospital
    const updateBloodRes = await fetch(`${BASE_URL}/api/dev/hospitals/${testHospId}/blood-stock`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${devToken}` },
      body: JSON.stringify({ O_pos: 45, A_pos: 18 })
    });
    const updateBloodData = await updateBloodRes.json();
    assert('Dev Portal Update Blood Stock Live', updateBloodData.success === true && updateBloodData.blood_stock?.O_pos === 45);

    // Update Beds for the Hospital
    const updateBedsRes = await fetch(`${BASE_URL}/api/dev/hospitals/${testHospId}/beds`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${devToken}` },
      body: JSON.stringify({ general_available: 30, icu_available: 6 })
    });
    const updateBedsData = await updateBedsRes.json();
    assert('Dev Portal Update Beds Live', updateBedsData.success === true && updateBedsData.beds?.icu_available === 6);

    // Update Medicine Supplies
    const updateMedsRes = await fetch(`${BASE_URL}/api/dev/hospitals/${testHospId}/medicines`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${devToken}` },
      body: JSON.stringify({ anti_venom_vials: 50, oxygen_cylinders: 12 })
    });
    const updateMedsData = await updateMedsRes.json();
    assert('Dev Portal Update Medicine Supplies', updateMedsData.success === true && updateMedsData.medicines_stock?.anti_venom_vials === 50);

    // Clean up test hospital
    const delHospRes = await fetch(`${BASE_URL}/api/dev/hospitals/${testHospId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${devToken}` }
    });
    const delHospData = await delHospRes.json();
    assert('Dev Portal Delete Hospital Clean-up', delHospData.success === true);

    // 7. Developer Portal Static Route
    console.log('\n--- 7. Testing Developer Portal Route ---');
    const devStaticRes = await fetch(`${BASE_URL}/developer-portal/`);
    assert('Developer Portal Route is Accessible (200 OK)', devStaticRes.status === 200);

    // 8. Hospital & Medical Officer Clinical Console
    console.log('\n--- 8. Testing Hospital Verified Login & Clinical Console ---');
    const hospLoginRes = await fetch(`${BASE_URL}/api/hospital/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authCode: 'hosp-01', accessKey: 'Trimbak@PHC2026' })
    });
    const hospLoginData = await hospLoginRes.json();
    assert('Hospital Verified Login', hospLoginData.success === true && !!hospLoginData.token);
    assert('Hospital Verified DHS Badge', hospLoginData.hospital?.is_verified === true);

    // 8b. Requested Patient Queue
    const requestsRes = await fetch(`${BASE_URL}/api/hospital/requests?hospId=hosp-01`, {
      headers: { 'x-hosp-id': 'hosp-01' }
    });
    const requestsData = await requestsRes.json();
    assert('Hospital Requested Patients Queue', requestsData.success === true && Array.isArray(requestsData.requests));

    // 8c. Doctor Video Toggle
    const docToggleRes = await fetch(`${BASE_URL}/api/hospital/doctors/doc-01/toggle-video`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hospitalId: 'hosp-01', isAvailable: true })
    });
    const docToggleData = await docToggleRes.json();
    assert('Doctor Video Availability Toggle', docToggleData.success === true && docToggleData.doctor?.is_available_for_video === true);

    // 8d. Patient Admission & Bed Allocation
    const admitRes = await fetch(`${BASE_URL}/api/hospital/requests/req-101/admit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ allocatedBed: 'Maternity Ward - Bed #04', assignedDoctor: 'Dr. Anand Kulkarni', status: 'ADMITTED' })
    });
    const admitData = await admitRes.json();
    assert('Patient Admission & Bed Allocation', admitData.success === true && admitData.request?.status === 'ADMITTED');

    // 8e. Issue Official Consultation Receipt
    const receiptRes = await fetch(`${BASE_URL}/api/consultations/issue-receipt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hospitalId: 'hosp-01',
        hospitalName: 'Trimbakeshwar Primary Health Centre (PHC)',
        doctorName: 'Dr. Anand Kulkarni',
        patientName: 'Savita Dnyaneshwar Jadhav',
        patientPhone: '9822019485',
        diagnosis: 'High-Risk Pregnancy Clinical Stabilization',
        medicines: [{ name: 'Tab. Labetalol 100mg', dosage: '1 Tab BD', duration: '14 Days' }],
        billing: { opdFee: 0, totalAmount: 0, subsidyScheme: 'MJPJAY 100% Free' }
      })
    });
    const receiptData = await receiptRes.json();
    assert('Issue Consultation Receipt Endpoint', receiptData.success === true && !!receiptData.receipt?.receiptId);

    // 8f. Retrieve Hospital Receipts
    const receiptsListRes = await fetch(`${BASE_URL}/api/consultations/receipts?hospitalId=hosp-01`);
    const receiptsListData = await receiptsListRes.json();
    assert('Hospital Receipts List Retrieval', receiptsListData.success === true && Array.isArray(receiptsListData.receipts));

    console.log(`\n====================================================`);
    console.log(`🎯 TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
    console.log(`====================================================\n`);
  } catch (err) {
    console.error('Test execution error:', err);
  }
}

runTests();
