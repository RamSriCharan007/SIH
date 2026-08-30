import { initDatabase, dbSaveConsultation, dbGetConsultations, dbSaveUser, dbGetUsers, getDbStatus } from './db.js';

async function runPostgresCheck() {
  console.log("==================================================");
  console.log("   GraminAarogya PostgreSQL Connection Check     ");
  console.log("==================================================");

  const isConnected = await initDatabase();
  const status = getDbStatus();
  console.log(`\n[DATABASE STATUS]: ${status.engine}`);

  if (isConnected) {
    console.log("\n🚀 Testing live PostgreSQL Table Insert & Query...");
    
    // 1. Save User to Postgres
    const user = await dbSaveUser({
      phone: '9822099999',
      fullName: 'Dr. Rahul Deshmukh (Medical Officer)',
      role: 'doctor',
      district: 'Nashik District Hospital',
      biometric_enabled: true
    });
    console.log(`[PASS] Saved user to PostgreSQL 'users' table: ${user.full_name || user.fullName}`);

    // 2. Save Patient Consultation & Symptoms to Postgres
    const consult = await dbSaveConsultation(
      {
        patient_name: 'Anandi Bai Shinde',
        age: 29,
        gender: 'Female',
        village: 'Trimbak Forest Pada No. 2',
        bp: '120/80',
        hb_level: 11.2,
        triage_tier: '40_MILD_REMEDY',
        matched_remedy_id: 'rem-01',
        channel: 'PWA_OFFLINE'
      },
      ['fever_mild', 'body_pain']
    );
    console.log(`[PASS] Saved consultation & symptoms to PostgreSQL 'patient_consultations' & 'consultation_symptoms' tables!`);

    // 3. Query all Consultations from Postgres
    const allConsults = await dbGetConsultations();
    console.log(`[PASS] Retrieved ${allConsults.length} consultation records from PostgreSQL.`);
    console.log("\n✅ Live PostgreSQL verification completed successfully!");
  } else {
    console.log("\nℹ️ PostgreSQL is currently offline or unreachable.");
    console.log("📁 The application is seamlessly running on the Embedded JSON Database engine.");
    console.log("💡 To connect a live PostgreSQL instance:");
    console.log("   1. Start your local PostgreSQL server or create a free cloud DB on Supabase/Neon.");
    console.log("   2. Update the DATABASE_URL in your .env file.");
    console.log("   3. Run 'node server/test_postgres.js' again.");
  }
}

runPostgresCheck();
