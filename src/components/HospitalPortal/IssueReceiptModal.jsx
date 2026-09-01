import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  FileText,
  CheckCircle2,
  X,
  Plus,
  Trash2,
  Printer,
  ShieldCheck,
  Stethoscope,
  Building2,
  QrCode,
  DollarSign
} from 'lucide-react';

export default function IssueReceiptModal({
  isOpen,
  onClose,
  hospital,
  patient,
  onReceiptIssued
}) {
  const { lang, t } = useLanguage();

  const [doctorName, setDoctorName] = useState(
    hospital?.doctors?.[0]?.name || hospital?.nodal_officer || 'Dr. Anand Kulkarni'
  );
  const [doctorRegNo, setDoctorRegNo] = useState(
    hospital?.doctors?.[0]?.reg_no || 'MMC-2012-08-3948'
  );
  const [diagnosis, setDiagnosis] = useState(
    patient?.emergencyType || 'Acute Viral Syndrome / Stabilization'
  );
  const [medicines, setMedicines] = useState([
    { name: 'Tab. Paracetamol 650 mg', dosage: '1 Tab TDS (Thrice Daily) after food', duration: '3 Days' },
    { name: 'ORS (Oral Rehydration Salts)', dosage: '1 Sachet in 1L water, sip throughout day', duration: '3 Days' }
  ]);
  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('');
  const [newMedDuration, setNewMedDuration] = useState('3 Days');

  const [dietAdvice, setDietAdvice] = useState('Drink boiled lukewarm water. Take light nutritious khichdi/soup.');
  const [followUpDate, setFollowUpDate] = useState('2026-09-05');
  const [opdFee, setOpdFee] = useState(hospital?.cost_range?.opd || 0);
  const [subsidyScheme, setSubsidyScheme] = useState(
    hospital?.schemes?.[0] || '100% Free Govt Healthcare Scheme'
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [issuedReceipt, setIssuedReceipt] = useState(null);

  if (!isOpen) return null;

  const handleAddMedicine = () => {
    if (!newMedName.trim()) return;
    setMedicines([...medicines, {
      name: newMedName.trim(),
      dosage: newMedDosage.trim() || '1 Tablet daily after food',
      duration: newMedDuration
    }]);
    setNewMedName('');
    setNewMedDosage('');
  };

  const handleRemoveMedicine = (idx) => {
    setMedicines(medicines.filter((_, i) => i !== idx));
  };

  const handleGenerateReceipt = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      hospitalId: hospital?.id || 'hosp-01',
      hospitalName: hospital?.name || 'Primary Health Centre',
      hospitalLicense: hospital?.license_no || 'MH-DHS-2024-PHC-011',
      hospitalAddress: hospital?.address || `${hospital?.district || 'Nashik'}, Maharashtra`,
      doctorName,
      doctorRegNo,
      doctorSpeciality: hospital?.doctors?.[0]?.speciality || 'General & Emergency Medicine',
      patientName: patient?.patientName || 'Rural Citizen Patient',
      patientPhone: patient?.phone || '9876543210',
      patientAge: patient?.age || 30,
      patientGender: patient?.gender || 'Female',
      patientVillage: patient?.village || 'Rural Village',
      triageCategory: patient?.emergencyType || 'Clinical OPD Triage',
      vitals: patient?.vitals || { bp: '120/80 mmHg', pulse: '76 bpm', spo2: '98%', temp: '98.6 F', hb: '12.0 gm/dL' },
      diagnosis,
      medicines,
      dietAdvice,
      followUpDate,
      billing: {
        opdFee: Number(opdFee),
        medicineFee: 0,
        testingFee: 0,
        totalAmount: Number(opdFee),
        subsidyScheme,
        paymentStatus: Number(opdFee) === 0 ? 'PAID_GOVT_SUBSIDY' : 'PAID_CASH_RECEIPT'
      }
    };

    try {
      const savedAuth = localStorage.getItem('gramin_hospital_auth');
      const token = savedAuth ? JSON.parse(savedAuth).token : null;
      const res = await fetch('/api/consultations/issue-receipt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': 'Bearer ' + token } : {})
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success && data.receipt) {
        setIssuedReceipt(data.receipt);
        if (onReceiptIssued) onReceiptIssued(data.receipt);
      }
    } catch (err) {
      console.error('Error generating receipt:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='modal-overlay' onClick={onClose} style={{ zIndex: 9999 }}>
      <div
        className='modal-content'
        style={{ maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto', padding: '1.75rem', borderRadius: '20px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0d9488 0%, #065f46 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(13, 148, 136, 0.3)'
            }}>
              <FileText size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                {issuedReceipt ? 'अधिकृत कन्सल्टेशन पावती (Official Receipt Issued)' : 'कन्सल्टेशन पावती व प्रिस्क्रिप्शन तयार करा'}
              </h2>
              <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                {hospital?.name} • License: {hospital?.license_no}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748b'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {issuedReceipt ? (
          /* SUCCESS VIEW: Official Digital Receipt with QR & Print */
          <div>
            <div style={{
              background: '#f8fafc',
              border: '2px solid #0d9488',
              borderRadius: '16px',
              padding: '1.5rem',
              color: '#0f172a',
              marginBottom: '1.25rem',
              boxShadow: '0 8px 24px rgba(13, 148, 136, 0.12)'
            }}>
              {/* Receipt Top Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px dashed #cbd5e1', paddingBottom: '1rem', marginBottom: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#0d9488', letterSpacing: '0.05em' }}>
                    GOVERNMENT OF MAHARASHTRA • PUBLIC HEALTH DEPARTMENT
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: '0.2rem 0', color: '#0f172a' }}>
                    {issuedReceipt.hospitalName}
                  </h3>
                  <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                    Registration No: <strong>{issuedReceipt.hospitalLicense}</strong>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>RECEIPT NO:</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0284c7' }}>
                    {issuedReceipt.receiptId}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                    {issuedReceipt.consultationDate} | {issuedReceipt.consultationTime}
                  </div>
                </div>
              </div>

              {/* Patient & Doctor Dossier Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: '#f1f5f9', padding: '0.85rem', borderRadius: '10px', marginBottom: '1rem', fontSize: '0.78rem' }}>
                <div>
                  <div style={{ color: '#64748b', fontSize: '0.7rem' }}>PATIENT DETAILS:</div>
                  <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '0.9rem' }}>{issuedReceipt.patientName}</div>
                  <div>{issuedReceipt.patientAge} Y / {issuedReceipt.patientGender} • +91 {issuedReceipt.patientPhone}</div>
                  <div style={{ color: '#475569' }}>📍 {issuedReceipt.patientVillage}</div>
                </div>

                <div>
                  <div style={{ color: '#64748b', fontSize: '0.7rem' }}>ATTENDING DOCTOR:</div>
                  <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '0.9rem' }}>{issuedReceipt.doctorName}</div>
                  <div style={{ color: '#0d9488', fontWeight: '700' }}>{issuedReceipt.doctorSpeciality}</div>
                  <div style={{ color: '#64748b' }}>Reg: {issuedReceipt.doctorRegNo}</div>
                </div>
              </div>

              {/* Clinical Vitals */}
              {issuedReceipt.vitals && (
                <div style={{ display: 'flex', gap: '1rem', background: '#e0f2fe', padding: '0.6rem 0.85rem', borderRadius: '8px', fontSize: '0.74rem', marginBottom: '1rem', color: '#0369a1', flexWrap: 'wrap' }}>
                  <span><strong>BP:</strong> {issuedReceipt.vitals.bp}</span>
                  <span><strong>Pulse:</strong> {issuedReceipt.vitals.pulse}</span>
                  <span><strong>SpO2:</strong> {issuedReceipt.vitals.spo2}</span>
                  <span><strong>Temp:</strong> {issuedReceipt.vitals.temp}</span>
                </div>
              )}

              {/* Diagnosis */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>Clinical Diagnosis:</div>
                <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0f172a', marginTop: '2px' }}>
                  {issuedReceipt.diagnosis}
                </div>
              </div>

              {/* Prescribed Medicines Table */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Rx - Prescribed Medicines:</div>
                <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.76rem' }}>
                    <thead style={{ background: '#e2e8f0', color: '#334155' }}>
                      <tr>
                        <th style={{ padding: '6px 10px', textAlign: 'left' }}>Medicine</th>
                        <th style={{ padding: '6px 10px', textAlign: 'left' }}>Dosage & Timing</th>
                        <th style={{ padding: '6px 10px', textAlign: 'left' }}>Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {issuedReceipt.medicines.map((m, i) => (
                        <tr key={i} style={{ borderTop: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '6px 10px', fontWeight: '700' }}>{m.name}</td>
                          <td style={{ padding: '6px 10px' }}>{m.dosage}</td>
                          <td style={{ padding: '6px 10px', color: '#0d9488', fontWeight: '700' }}>{m.duration}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Advice */}
              <div style={{ fontSize: '0.74rem', color: '#475569', marginBottom: '1rem' }}>
                <strong>Doctor's Advice:</strong> {issuedReceipt.dietAdvice}
              </div>

              {/* Billing & QR Verification Stamp */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px dashed #cbd5e1', paddingTop: '1rem', marginTop: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>FEE / PAYMENT STATUS:</div>
                  <div style={{ fontSize: '1rem', fontWeight: '800', color: '#15803d' }}>
                    {issuedReceipt.billing.totalAmount === 0 ? '100% FREE GOVT BENEFIT (₹0.00)' : '₹' + issuedReceipt.billing.totalAmount}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#0d9488', fontWeight: '700' }}>
                    {issuedReceipt.billing.subsidyScheme}
                  </div>
                </div>

                <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: '800', color: '#15803d' }}>✓ DIGITAL STAMP VERIFIED</div>
                    <div style={{ fontSize: '0.6rem', color: '#64748b' }}>Govt Health Portal Maharashtra</div>
                  </div>
                  <div style={{ width: '44px', height: '44px', background: '#0f172a', color: 'white', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <QrCode size={28} />
                  </div>
                </div>
              </div>
            </div>

            {/* Print & Close Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => window.print()}
                className='btn btn-primary'
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <Printer size={16} />
                <span>पावती प्रिंट करा / डाउनलोड (Print Receipt)</span>
              </button>
              <button
                onClick={onClose}
                className='btn btn-secondary'
                style={{ padding: '0.65rem 1.25rem' }}
              >
                बंद करा (Close)
              </button>
            </div>
          </div>
        ) : (
          /* FORM VIEW */
          <form onSubmit={handleGenerateReceipt}>
            {/* Patient Header Box */}
            <div style={{ background: '#f0fdfa', border: '1.5px solid #99f6e4', padding: '0.75rem 1rem', borderRadius: '12px', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#0d9488' }}>PATIENT CONTEXT:</div>
                <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a' }}>
                  {patient?.patientName || 'Rural Citizen'} ({patient?.age || 30} Y / {patient?.gender || 'Female'})
                </div>
                <div style={{ fontSize: '0.72rem', color: '#475569' }}>
                  Village: {patient?.village || 'Trimbak'} • Emergency: {patient?.emergencyType || 'OPD'}
                </div>
              </div>
              <span className='badge badge-green' style={{ fontSize: '0.7rem' }}>
                Consent Verified
              </span>
            </div>

            {/* Doctor Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#334155', marginBottom: '0.25rem' }}>
                  डॉक्टरांचे नाव / Doctor Name
                </label>
                <input
                  type='text'
                  className='input-field'
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#334155', marginBottom: '0.25rem' }}>
                  नोंदणी क्रमांक / Medical Reg No.
                </label>
                <input
                  type='text'
                  className='input-field'
                  value={doctorRegNo}
                  onChange={(e) => setDoctorRegNo(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Diagnosis */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#334155', marginBottom: '0.25rem' }}>
                तपासणी निष्कर्ष / Clinical Diagnosis
              </label>
              <textarea
                className='input-field'
                rows='2'
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder='Enter detailed clinical diagnosis'
                required
              />
            </div>

            {/* Medicines List Builder */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem' }}>
                प्रिस्क्रिप्शन औषधे / Prescribed Medicines ({medicines.length}):
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.6rem' }}>
                {medicines.map((med, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', border: '1px solid #cbd5e1', padding: '0.45rem 0.75rem', borderRadius: '8px', fontSize: '0.78rem' }}>
                    <div>
                      <strong>{med.name}</strong> • <span style={{ color: '#64748b' }}>{med.dosage}</span> ({med.duration})
                    </div>
                    <button
                      type='button'
                      onClick={() => handleRemoveMedicine(idx)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Med Row */}
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <input
                  type='text'
                  placeholder='औषध (e.g. Tab. Cetirizine 10mg)'
                  value={newMedName}
                  onChange={(e) => setNewMedName(e.target.value)}
                  className='input-field'
                  style={{ flex: 2, fontSize: '0.78rem' }}
                />
                <input
                  type='text'
                  placeholder='डोस (e.g. 1 Tab at bedtime)'
                  value={newMedDosage}
                  onChange={(e) => setNewMedDosage(e.target.value)}
                  className='input-field'
                  style={{ flex: 2, fontSize: '0.78rem' }}
                />
                <button
                  type='button'
                  onClick={handleAddMedicine}
                  className='btn btn-secondary'
                  style={{ fontSize: '0.78rem', padding: '0.4rem 0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Plus size={14} /> Add
                </button>
              </div>
            </div>

            {/* Diet Advice & Billing */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#334155', marginBottom: '0.25rem' }}>
                  पथ्य व आहार सल्ला / Diet & Follow-up Advice
                </label>
                <input
                  type='text'
                  className='input-field'
                  value={dietAdvice}
                  onChange={(e) => setDietAdvice(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#334155', marginBottom: '0.25rem' }}>
                  फी / OPD Fee (₹)
                </label>
                <input
                  type='number'
                  className='input-field'
                  value={opdFee}
                  onChange={(e) => setOpdFee(e.target.value)}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type='submit'
              disabled={isSubmitting}
              className='btn btn-primary'
              style={{
                width: '100%',
                padding: '0.85rem',
                fontSize: '0.95rem',
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 15px rgba(13, 148, 136, 0.4)'
              }}
            >
              <FileText size={18} />
              <span>{isSubmitting ? 'पावती तयार करत आहे...' : 'डिजिटल कन्सल्टेशन पावती जारी करा (Issue Official Receipt)'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
