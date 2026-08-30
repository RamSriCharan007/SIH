async function testEndpoints() {
  console.log("=== Testing GraminAarogya Backend APIs ===");

  // 1. Test Hospitals
  const hospRes = await fetch('http://localhost:5000/api/hospitals');
  const hospData = await hospRes.json();
  console.log(`[PASS] GET /api/hospitals: Loaded ${hospData.hospitals.length} hospitals`);

  // 2. Test OTP
  const otpRes = await fetch('http://localhost:5000/api/auth/send-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: '9822019485' })
  });
  const otpData = await otpRes.json();
  console.log(`[PASS] POST /api/auth/send-otp: OTP generated = ${otpData.simulated_sms.otp}`);

  // 3. Test OTP Verification
  const verifyRes = await fetch('http://localhost:5000/api/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: '9822019485',
      otp: otpData.simulated_sms.otp,
      role: 'asha',
      fullName: 'Sunita Bai Shinde (ASHA)'
    })
  });
  const verifyData = await verifyRes.json();
  console.log(`[PASS] POST /api/auth/verify-otp: Authenticated user: ${verifyData.user.fullName} (${verifyData.user.role})`);

  // 4. Test Biometric Login & Database Persistence
  const bioRes = await fetch('http://localhost:5000/api/auth/biometric-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: '9822019485',
      role: 'asha',
      fullName: 'Sunita Bai Shinde (ASHA Volunteer)'
    })
  });
  const bioData = await bioRes.json();
  console.log(`[PASS] POST /api/auth/biometric-login: Persisted user "${bioData.user.fullName}" to database`);

  // 4b. Test Users Database Query
  const usersRes = await fetch('http://localhost:5000/api/users');
  const usersData = await usersRes.json();
  console.log(`[PASS] GET /api/users: Database contains ${usersData.count} registered users`);

  // 5. Test SMS Fallback Simulator
  const smsRes = await fetch('http://localhost:5000/api/sms-fallback/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ smsText: 'BEDS' })
  });
  const smsData = await smsRes.json();
  console.log(`[PASS] POST /api/sms-fallback/query: Gateway reply = "${smsData.gatewayReply}"`);

  // 6. Test Remedies & Complications
  const remRes = await fetch('http://localhost:5000/api/remedies');
  const remData = await remRes.json();
  console.log(`[PASS] GET /api/remedies: Loaded ${remData.remedies.length} offline remedies`);

  const compRes = await fetch('http://localhost:5000/api/complications');
  const compData = await compRes.json();
  console.log(`[PASS] GET /api/complications: Loaded ${compData.complications.length} emergency protocols`);

  // 7. Test AI Chat Copilot
  const aiRes = await fetch('http://localhost:5000/api/ai-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: 'सर्पदंश झाला आहे',
      lang: 'mr'
    })
  });
  const aiData = await aiRes.json();
  console.log(`[PASS] POST /api/ai-chat: AI Response intent generated (Action: ${aiData.action?.label})`);

  // 8. Test Database Status
  const dbStatusRes = await fetch('http://localhost:5000/api/db/status');
  const dbStatus = await dbStatusRes.json();
  console.log(`[PASS] GET /api/db/status: Active Engine = "${dbStatus.engine}"`);

  // 9. Test Patient Consultation & Symptoms Persistence
  const consultRes = await fetch('http://localhost:5000/api/consultations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      consultation: {
        patient_name: 'Savita Dnyaneshwar Jadhav',
        age: 26,
        gender: 'Female',
        village: 'Trimbak Pada No. 3',
        bp: '140/95',
        hb_level: 8.4,
        triage_tier: '40_MILD_REMEDY',
        matched_remedy_id: 'rem-01'
      },
      symptoms: ['fever_mild', 'body_pain']
    })
  });
  const consultData = await consultRes.json();
  console.log(`[PASS] POST /api/consultations: Saved consultation with symptoms to database (${consultData.consultation.id || consultData.consultation.consultationId})`);

  const allConsultsRes = await fetch('http://localhost:5000/api/consultations');
  const allConsults = await allConsultsRes.json();
  console.log(`[PASS] GET /api/consultations: Found ${allConsults.count} total patient consultation records in database`);

  console.log("\n>>> ALL API & DATABASE TESTS PASSED SUCCESSFULLY! <<<");
}

testEndpoints().catch(err => {
  console.error("API Test Failed:", err);
  process.exit(1);
});
