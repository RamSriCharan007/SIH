-- ============================================================================
-- GraminAarogya (ग्रामीण आरोग्य साथी) - PostgreSQL Database Schema
-- Architecture for Rural Patient Symptom Logging, 40/60 Triage & Referrals
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. USERS TABLE (ASHA Workers, Rural Citizens, Doctors)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number VARCHAR(15) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role VARCHAR(30) NOT NULL CHECK (role IN ('citizen', 'asha', 'doctor', 'admin')),
    district VARCHAR(100) NOT NULL,
    taluka VARCHAR(100),
    village VARCHAR(100),
    asha_badge_no VARCHAR(50),
    biometric_enabled BOOLEAN DEFAULT FALSE,
    biometric_credential_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. SYMPTOMS MASTER TABLE (Standardized Clinical Dictionary)
CREATE TABLE IF NOT EXISTS symptoms_master (
    symptom_code VARCHAR(50) PRIMARY KEY, -- e.g. 'fever_mild', 'snake_bite'
    category VARCHAR(50) NOT NULL,        -- 'mild_40', 'emergency_60'
    name_mr VARCHAR(100) NOT NULL,        -- Marathi Name (e.g. 'सौम्य ताप')
    name_hi VARCHAR(100) NOT NULL,        -- Hindi Name (e.g. 'हल्का बुखार')
    name_en VARCHAR(100) NOT NULL,        -- English Name (e.g. 'Mild Fever')
    severity_level VARCHAR(20) NOT NULL CHECK (severity_level IN ('LOW', 'MODERATE', 'SEVERE', 'CRITICAL_RED')),
    keywords TEXT[]                       -- Search keywords for Voice NLP AI
);

-- 4. REMEDIES MASTER TABLE (40% Verified Ayurvedic Kadhas & First-Aid)
CREATE TABLE IF NOT EXISTS remedies_master (
    remedy_id VARCHAR(50) PRIMARY KEY,
    title_mr VARCHAR(200) NOT NULL,
    title_hi VARCHAR(200) NOT NULL,
    title_en VARCHAR(200) NOT NULL,
    symptoms_covered VARCHAR(50)[] NOT NULL,
    immediate_first_aid_mr TEXT NOT NULL,
    immediate_first_aid_en TEXT NOT NULL,
    kadha_recipe_mr TEXT NOT NULL,
    kadha_recipe_en TEXT NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    otc_guidance TEXT,
    warning_threshold TEXT NOT NULL
);

-- 5. COMPLICATIONS MASTER TABLE (60% Emergency Red-Alert Protocols)
CREATE TABLE IF NOT EXISTS complications_master (
    complication_id VARCHAR(50) PRIMARY KEY,
    title_mr VARCHAR(200) NOT NULL,
    title_en VARCHAR(200) NOT NULL,
    symptoms_triggers VARCHAR(50)[] NOT NULL,
    triage_color VARCHAR(20) DEFAULT 'RED',
    golden_hour_minutes INT DEFAULT 60,
    pre_hospital_protocol_mr TEXT[] NOT NULL,
    required_facilities TEXT[] NOT NULL,  -- e.g. ARRAY['Anti-Venom', 'Ventilator ICU']
    emergency_ambulance_code VARCHAR(10) DEFAULT '108'
);

-- 6. PATIENT CONSULTATIONS TABLE (Each Patient Symptom Visit / Triage Event)
CREATE TABLE IF NOT EXISTS patient_consultations (
    consultation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    patient_name VARCHAR(150) NOT NULL,
    age INT NOT NULL,
    gender VARCHAR(20) NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
    village VARCHAR(100) NOT NULL,
    
    -- Clinical Vitals (Logged by ASHA or Patient)
    blood_pressure VARCHAR(20),          -- e.g. '130/85'
    heart_rate_bpm INT,                  -- e.g. 78
    spo2_percentage INT,                 -- e.g. 98
    hemoglobin_level NUMERIC(4,1),       -- e.g. 10.5
    gestational_week INT,                -- For Maternal Tracking
    patient_notes TEXT,
    
    -- Triage Outcome
    triage_tier VARCHAR(30) NOT NULL CHECK (triage_tier IN ('40_MILD_REMEDY', '60_CRITICAL_EMERGENCY')),
    matched_remedy_id VARCHAR(50) REFERENCES remedies_master(remedy_id),
    matched_complication_id VARCHAR(50) REFERENCES complications_master(complication_id),
    
    -- Sync & Network State
    channel VARCHAR(30) DEFAULT 'PWA_OFFLINE', -- 'PWA_OFFLINE', 'ONLINE_APP', 'SMS_GATEWAY'
    is_synced BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. CONSULTATION SYMPTOMS JUNCTION TABLE (Many-to-Many: Patient <-> Symptoms)
CREATE TABLE IF NOT EXISTS consultation_symptoms (
    id BIGSERIAL PRIMARY KEY,
    consultation_id UUID NOT NULL REFERENCES patient_consultations(consultation_id) ON DELETE CASCADE,
    symptom_code VARCHAR(50) NOT NULL REFERENCES symptoms_master(symptom_code),
    duration_days INT DEFAULT 1,
    severity_reported VARCHAR(20) DEFAULT 'MILD'
);

-- 8. INDEXES FOR HIGH-SPEED QUERY PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_consultation_user ON patient_consultations(user_id);
CREATE INDEX IF NOT EXISTS idx_consultation_tier ON patient_consultations(triage_tier);
CREATE INDEX IF NOT EXISTS idx_consultation_created ON patient_consultations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_consultation_symptoms ON consultation_symptoms(symptom_code);

-- ============================================================================
-- SAMPLE INSERT QUERY (When a Patient Reports Symptoms in GraminAarogya):
-- ============================================================================

-- Step A: Insert Consultation Header
-- INSERT INTO patient_consultations (
--     patient_name, age, gender, village, triage_tier, matched_remedy_id, channel
-- ) VALUES (
--     'Tanaji Kisan Bhoye', 34, 'Male', 'Karanjali Pada', '40_MILD_REMEDY', 'rem-01', 'PWA_OFFLINE'
-- ) RETURNING consultation_id;

-- Step B: Insert Individual Reported Symptoms
-- INSERT INTO consultation_symptoms (consultation_id, symptom_code, duration_days)
-- VALUES 
--   ('<consultation_uuid>', 'fever_mild', 2),
--   ('<consultation_uuid>', 'body_pain', 2);
