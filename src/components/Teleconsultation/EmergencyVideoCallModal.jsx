import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { saveToStore } from '../../utils/db';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  RefreshCw,
  Activity,
  HeartPulse,
  Clock,
  ShieldCheck,
  Download,
  Printer,
  X,
  FileText,
  UserCheck,
  AlertTriangle,
  Stethoscope,
  Sparkles,
  Camera
} from 'lucide-react';

export default function EmergencyVideoCallModal({
  doctor,
  onClose,
  emergencyType = "Emergency Triage & Consultation"
}) {
  const { lang, t } = useLanguage();
  const { user } = useAuth();

  // Call status: 'connecting', 'connected', 'ended'
  const [callStatus, setCallStatus] = useState('connecting');
  const [callDuration, setCallDuration] = useState(0);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [facingMode, setFacingMode] = useState('user'); // 'user' or 'environment'
  const [doctorSpeaking, setDoctorSpeaking] = useState(false);
  const [prescription, setPrescription] = useState(null);

  // Live Telemetry simulation
  const [heartRate, setHeartRate] = useState(76);
  const [spO2, setSpO2] = useState(98);

  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);

  const activeDoctor = doctor || {
    id: 'doc-01',
    name: 'Dr. Anand Kulkarni',
    name_mr: 'डॉ. आनंद कुलकर्णी',
    speciality: 'Emergency Medicine / MD Physician',
    hospital: 'Trimbakeshwar Rural Hospital',
    reg_no: 'MMC-2012-08-3948',
    status: 'On Duty (Emergency ICU)'
  };

  const docDisplayName = lang === 'mr' ? (activeDoctor.name_mr || activeDoctor.name) : activeDoctor.name;

  // Initialize WebRTC / Camera
  useEffect(() => {
    startCamera();

    // Simulate connection delay
    const connectTimer = setTimeout(() => {
      setCallStatus('connected');
    }, 2000);

    return () => {
      clearTimeout(connectTimer);
      stopCamera();
    };
  }, [facingMode]);

  // Call timer and simulated vitals fluctuation
  useEffect(() => {
    let interval = null;
    if (callStatus === 'connected') {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);

        // Subtly fluctuate vitals
        setHeartRate((prev) => Math.min(105, Math.max(68, prev + (Math.random() > 0.5 ? 1 : -1))));
        setDoctorSpeaking(Math.random() > 0.4);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callStatus]);

  const startCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facingMode },
          audio: true
        });
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      }
    } catch (err) {
      console.warn("Camera access fallback (virtual simulator active):", err);
    }
  };

  const stopCamera = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }
  };

  const toggleMic = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = isMicMuted;
      });
    }
    setIsMicMuted(!isMicMuted);
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = isVideoOff;
      });
    }
    setIsVideoOff(!isVideoOff);
  };

  const flipCamera = () => {
    stopCamera();
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  const handleEndCall = () => {
    stopCamera();
    setCallStatus('ended');

    // Generate Official Digital Prescription
    const rx = {
      rxId: 'RX-MH-' + Math.floor(100000 + Math.random() * 900000),
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      patientName: user ? user.fullName : 'Ramesh Vasant Patil',
      patientAge: '32 Y / Male',
      vitals: {
        bp: '120/80 mmHg',
        pulse: `${heartRate} bpm`,
        spo2: `${spO2}%`,
        temp: '98.6 °F'
      },
      doctorName: activeDoctor.name,
      doctorReg: activeDoctor.reg_no,
      hospital: activeDoctor.hospital,
      diagnosis: emergencyType.includes('Snake')
        ? 'Suspected Venomous Snakebite (Neurotoxic/Hemotoxic)'
        : emergencyType.includes('Cardiac')
        ? 'Acute Chest Pain / Angina Protocol'
        : 'Acute Febrile Illness / Emergency Stabilization',
      medicines: [
        { name: 'Inj. Polyvalent Anti-Snake Venom (ASV)', dose: '10 Vials in 500ml Normal Saline IV', timing: 'STAT / Immediate' },
        { name: 'Tab. Paracetamol 650 mg', dose: '1 Tablet after food', timing: 'TDS (3 times/day) for 3 days' },
        { name: 'ORS (Oral Rehydration Salts)', dose: '1 sachet dissolved in 1L boiled water', timing: 'Sip continuously' },
        { name: 'Inj. Tetanus Toxoid (TT 0.5ml IM)', dose: 'Single dose', timing: 'STAT' }
      ],
      advice: 'Keep patient calm. Do not tie tight tourniquets. Immediate transfer to nearest PHC/RH with functional ventilator.',
      digitalSigned: true
    };

    setPrescription(rx);
    saveToStore('prescriptions', rx);
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${remaining < 10 ? '0' : ''}${remaining}`;
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000, background: 'rgba(15, 23, 42, 0.95)' }}>
      <div
        className="modal-content"
        style={{
          maxWidth: '920px',
          width: '95vw',
          height: '90vh',
          padding: 0,
          background: '#0f172a',
          color: 'white',
          borderRadius: '20px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Video Header */}
        <div style={{
          padding: '0.85rem 1.25rem',
          background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.6) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          zIndex: 20
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #0d9488 0%, #10b981 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Stethoscope size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '800', margin: 0 }}>
                  {docDisplayName}
                </h3>
                <span className="badge badge-green" style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem' }}>
                  {activeDoctor.speciality}
                </span>
              </div>
              <p style={{ fontSize: '0.74rem', color: '#94a3b8', margin: 0 }}>
                {activeDoctor.hospital} • {t('call_in_progress')}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {callStatus === 'connected' && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid #ef4444',
                color: '#f87171',
                padding: '0.3rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.8rem',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 1s infinite' }} />
                <span>REC • {formatTime(callDuration)}</span>
              </div>
            )}

            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: '#e2e8f0',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Main Consultation Stage */}
        {callStatus !== 'ended' ? (
          <div style={{ flex: 1, position: 'relative', background: '#020617', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            
            {/* Remote Doctor Video Feed Canvas */}
            <div style={{
              width: '100%',
              height: '100%',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)'
            }}>
              {/* Doctor Avatar / Realistic Video Simulation Feed */}
              <div style={{
                width: '180px',
                height: '180px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0d9488 0%, #065f46 100%)',
                border: doctorSpeaking ? '4px solid #10b981' : '3px solid rgba(255, 255, 255, 0.2)',
                boxShadow: doctorSpeaking ? '0 0 30px rgba(16, 185, 129, 0.6)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                position: 'relative'
              }}>
                <UserCheck size={90} style={{ color: 'white' }} />
                {doctorSpeaking && (
                  <span style={{
                    position: 'absolute',
                    bottom: '-10px',
                    background: '#10b981',
                    color: 'white',
                    fontSize: '0.72rem',
                    fontWeight: '800',
                    padding: '0.15rem 0.6rem',
                    borderRadius: '9999px'
                  }}>
                    Speaking...
                  </span>
                )}
              </div>

              <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
                <h4 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'white', margin: 0 }}>
                  {docDisplayName}
                </h4>
                <p style={{ fontSize: '0.84rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                  {callStatus === 'connecting' ? t('connecting_doctor') : 'On-Duty Emergency Medical Officer (Live)'}
                </p>
              </div>

              {/* Live Golden Hour HUD / Emergency Advice Overlay */}
              <div style={{
                position: 'absolute',
                top: '1.25rem',
                left: '1.25rem',
                background: 'rgba(15, 23, 42, 0.85)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '12px',
                padding: '0.75rem 1rem',
                backdropFilter: 'blur(10px)',
                maxWidth: '280px'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#f87171', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '0.3rem' }}>
                  <AlertTriangle size={14} /> {t('golden_hour_timer')} <strong>&lt; 45 mins</strong>
                </div>
                <p style={{ fontSize: '0.76rem', color: '#e2e8f0', lineHeight: 1.4, margin: 0 }}>
                  रुग्णाला हालचाल करू देऊ नका. सर्पदंश असल्यास जखम धुवा, आवळपट्टी बांधू नका.
                </p>
              </div>

              {/* Telemetry Vitals Overlay (Bottom Left) */}
              <div style={{
                position: 'absolute',
                bottom: '1.25rem',
                left: '1.25rem',
                background: 'rgba(15, 23, 42, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '12px',
                padding: '0.65rem 0.9rem',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                gap: '1rem',
                fontSize: '0.8rem'
              }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Heart Rate</div>
                  <div style={{ fontSize: '1rem', fontWeight: '800', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <HeartPulse size={14} /> {heartRate} <span style={{ fontSize: '0.7rem' }}>bpm</span>
                  </div>
                </div>
                <div style={{ width: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>SpO2 Level</div>
                  <div style={{ fontSize: '1rem', fontWeight: '800', color: '#10b981', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Activity size={14} /> {spO2}%
                  </div>
                </div>
                <div style={{ width: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Est. BP</div>
                  <div style={{ fontSize: '1rem', fontWeight: '800', color: '#38bdf8' }}>
                    120/80
                  </div>
                </div>
              </div>
            </div>

            {/* Local Patient PIP Camera View (Top Right) */}
            <div style={{
              position: 'absolute',
              top: '1.25rem',
              right: '1.25rem',
              width: '160px',
              height: '120px',
              borderRadius: '14px',
              overflow: 'hidden',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              background: '#020617',
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
              zIndex: 30
            }}>
              {!isVideoOff ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                  <VideoOff size={24} />
                </div>
              )}

              <div style={{
                position: 'absolute',
                bottom: '4px',
                left: '6px',
                fontSize: '0.65rem',
                fontWeight: '700',
                background: 'rgba(0,0,0,0.6)',
                padding: '1px 5px',
                borderRadius: '4px'
              }}>
                You (Patient)
              </div>
            </div>

            {/* Call Action Bar (Bottom Floating) */}
            <div style={{
              position: 'absolute',
              bottom: '1.25rem',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(30, 41, 59, 0.9)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '9999px',
              padding: '0.5rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              zIndex: 40
            }}>
              {/* Mic toggle */}
              <button
                onClick={toggleMic}
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  border: 'none',
                  background: isMicMuted ? '#ef4444' : 'rgba(255, 255, 255, 0.15)',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
                title={t('toggle_mic')}
              >
                {isMicMuted ? <MicOff size={20} /> : <Mic size={20} />}
              </button>

              {/* Video toggle */}
              <button
                onClick={toggleVideo}
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  border: 'none',
                  background: isVideoOff ? '#ef4444' : 'rgba(255, 255, 255, 0.15)',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
                title={t('toggle_cam')}
              >
                {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
              </button>

              {/* Flip camera */}
              <button
                onClick={flipCamera}
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  border: 'none',
                  background: 'rgba(255, 255, 255, 0.15)',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title={t('flip_cam')}
              >
                <Camera size={20} />
              </button>

              {/* End Call Button */}
              <button
                onClick={handleEndCall}
                style={{
                  padding: '0.65rem 1.4rem',
                  borderRadius: '9999px',
                  border: 'none',
                  background: '#dc2626',
                  color: 'white',
                  fontWeight: '800',
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 15px rgba(220, 38, 38, 0.5)'
                }}
              >
                <PhoneOff size={18} />
                <span>{t('end_call')}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Post-Call Generated Digital Prescription & Clinical Record */
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.5rem',
            background: '#f8fafc',
            color: '#0f172a'
          }}>
            <div style={{ maxWidth: '680px', margin: '0 auto' }}>
              <div style={{
                background: 'white',
                border: '2px solid #0d9488',
                borderRadius: '16px',
                padding: '1.75rem',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08)'
              }}>
                {/* Official Prescription Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0d9488', paddingBottom: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f766e' }}>
                      {prescription.hospital}
                    </h2>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                      {t('prescription_sub')} • Reg: {prescription.doctorReg}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="badge badge-green" style={{ fontSize: '0.78rem' }}>
                      {prescription.rxId}
                    </span>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                      Date: {prescription.date} ({prescription.time})
                    </div>
                  </div>
                </div>

                {/* Patient Info Bar */}
                <div style={{
                  background: '#f0fdfa',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '1rem',
                  fontSize: '0.85rem'
                }}>
                  <div>
                    <strong>Patient:</strong> {prescription.patientName} ({prescription.patientAge})
                  </div>
                  <div>
                    <strong>BP:</strong> {prescription.vitals.bp} | <strong>Pulse:</strong> {prescription.vitals.pulse} | <strong>SpO2:</strong> {prescription.vitals.spo2}
                  </div>
                </div>

                {/* Diagnosis */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b' }}>
                    PROVISIONAL DIAGNOSIS:
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: '800', color: '#991b1b', marginTop: '0.2rem' }}>
                    {prescription.diagnosis}
                  </div>
                </div>

                {/* Medications Table (Rx) */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0d9488', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Stethoscope size={18} /> Rx (Prescribed Medications):
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ background: '#f1f5f9', textAlign: 'left', borderBottom: '1px solid #cbd5e1' }}>
                        <th style={{ padding: '0.5rem 0.75rem' }}>Medicine & Strength</th>
                        <th style={{ padding: '0.5rem 0.75rem' }}>Dosage & Route</th>
                        <th style={{ padding: '0.5rem 0.75rem' }}>Timing</th>
                      </tr>
                    </thead>
                    <tbody>
                      {prescription.medicines.map((med, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '0.6rem 0.75rem', fontWeight: '700', color: '#0f172a' }}>{med.name}</td>
                          <td style={{ padding: '0.6rem 0.75rem', color: '#334155' }}>{med.dose}</td>
                          <td style={{ padding: '0.6rem 0.75rem', color: '#0f766e', fontWeight: '600' }}>{med.timing}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Clinical Advice */}
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.82rem', color: '#92400e', marginBottom: '1.5rem' }}>
                  <strong>Doctor's Advice:</strong> {prescription.advice}
                </div>

                {/* Digital Signature & Footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    ✓ Saved to local offline storage on device.<br />
                    Govt Hospital Emergency Telemedicine Network
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      fontFamily: 'cursive',
                      fontSize: '1.2rem',
                      color: '#0f766e',
                      borderBottom: '1px dashed #0d9488',
                      paddingBottom: '2px',
                      marginBottom: '3px'
                    }}>
                      {prescription.doctorName}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '700' }}>
                      {t('doctor_signature')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button
                  onClick={() => window.print()}
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '0.75rem', justifyContent: 'center' }}
                >
                  <Printer size={16} /> {t('download_rx_btn')}
                </button>

                <button
                  onClick={onClose}
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '0.75rem', justifyContent: 'center' }}
                >
                  {t('close_btn')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
