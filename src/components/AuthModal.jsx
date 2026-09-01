import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Fingerprint,
  Phone,
  Shield,
  User,
  Sparkles,
  X,
  CheckCircle,
  Clock,
  ArrowRight,
  Camera,
  Scan,
  Lock,
  ShieldAlert,
  Info
} from 'lucide-react';

export default function AuthModal({ onAutofillOtpRef }) {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    requestOtp,
    verifyOtp,
    checkPlatformBiometrics,
    loginWithBiometrics,
    setIsFaceModalOpen,
    setFaceModalMode
  } = useAuth();
  const { t } = useLanguage();

  const [authMethod, setAuthMethod] = useState('otp'); // 'otp' | 'fingerprint' | 'face'
  const [hasBiometricHardware, setHasBiometricHardware] = useState(null); // null | true | false
  const [phone, setPhone] = useState('9822019485');
  const [fullName, setFullName] = useState('Sunita Bai Shinde');
  const [role, setRole] = useState('asha'); // 'citizen' or 'asha'
  const [ashaBadge, setAshaBadge] = useState('MH-NSK-ASHA-409');

  const [otpStep, setOtpStep] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [timer, setTimer] = useState(60);

  const [loading, setLoading] = useState(false);
  const [bioScanning, setBioScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Hardware Biometric Sensor Detection
  useEffect(() => {
    if (typeof checkPlatformBiometrics === 'function') {
      checkPlatformBiometrics().then((available) => {
        setHasBiometricHardware(available);
      });
    }
  }, [checkPlatformBiometrics]);

  // Autofill hook for incoming SMS simulation
  useEffect(() => {
    if (onAutofillOtpRef) {
      onAutofillOtpRef.current = (code) => {
        setOtpValue(code);
        setOtpStep(true);
      };
    }
  }, [onAutofillOtpRef]);

  // Countdown timer for OTP
  useEffect(() => {
    let interval = null;
    if (otpStep && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpStep, timer]);

  if (!isAuthModalOpen) return null;

  const handleBiometricLogin = async () => {
    setBioScanning(true);
    setErrorMsg('');
    try {
      const res = await loginWithBiometrics(phone, role, fullName);
      if (res.success) {
        setSuccessMsg(t('bio_verified_text') || 'Biometric verified successfully!');
      } else {
        setErrorMsg(res.error || 'Biometric verification failed.');
      }
    } catch (err) {
      setErrorMsg('Biometric sensor error');
    } finally {
      setBioScanning(false);
    }
  };

  const handleOpenFaceScan = () => {
    setFaceModalMode('login');
    setIsFaceModalOpen(true);
    setIsAuthModalOpen(false);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (phone.length < 10) {
      setErrorMsg('कृपया वैध १० अंकी मोबाईल नंबर प्रविष्ट करा.');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    try {
      await requestOtp(phone, role, fullName);
      setOtpStep(true);
      setTimer(60);
    } catch (err) {
      setErrorMsg('OTP पाठवण्यात अडचण आली.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    if (!otpValue || otpValue.length < 4) {
      setErrorMsg('कृपया ६ अंकी OTP प्रविष्ट करा.');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    const res = await verifyOtp(phone, otpValue, role, fullName);
    if (!res.success) {
      setErrorMsg(res.error || 'अवैध OTP');
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => setIsAuthModalOpen(false)}>
      <div className="modal-content" style={{ maxWidth: '460px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
              {t('auth_modal_title') || 'GraminAarogya Authentication'}
            </h2>
            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0.15rem 0 0' }}>
              Multi-Modal Biometrics & Citizen/ASHA Login
            </p>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
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

        {/* Method Switcher Tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '0.4rem',
          background: '#f1f5f9',
          padding: '0.3rem',
          borderRadius: '10px',
          marginBottom: '1.25rem'
        }}>
          <button
            type="button"
            onClick={() => setAuthMethod('otp')}
            style={{
              padding: '0.55rem',
              borderRadius: '8px',
              border: 'none',
              background: authMethod === 'otp' ? 'white' : 'transparent',
              color: authMethod === 'otp' ? '#0f172a' : '#64748b',
              fontWeight: '700',
              fontSize: '0.78rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              boxShadow: authMethod === 'otp' ? '0 2px 5px rgba(0,0,0,0.08)' : 'none'
            }}
          >
            <Phone size={14} /> <span>Mobile OTP</span>
          </button>

          <button
            type="button"
            onClick={() => setAuthMethod('fingerprint')}
            style={{
              padding: '0.55rem',
              borderRadius: '8px',
              border: 'none',
              background: authMethod === 'fingerprint' ? 'white' : 'transparent',
              color: authMethod === 'fingerprint' ? '#0d9488' : '#64748b',
              fontWeight: '700',
              fontSize: '0.78rem',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2px',
              boxShadow: authMethod === 'fingerprint' ? '0 2px 5px rgba(0,0,0,0.08)' : 'none'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Fingerprint size={14} /> <span>Fingerprint</span>
            </div>
            {hasBiometricHardware === true && (
              <span style={{ fontSize: '0.6rem', color: '#10b981', fontWeight: '800' }}>✓ Hardware Ready</span>
            )}
            {hasBiometricHardware === false && (
              <span style={{ fontSize: '0.6rem', color: '#f59e0b', fontWeight: '700' }}>No Sensor</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setAuthMethod('face')}
            style={{
              padding: '0.55rem',
              borderRadius: '8px',
              border: 'none',
              background: authMethod === 'face' ? 'white' : 'transparent',
              color: authMethod === 'face' ? '#0284c7' : '#64748b',
              fontWeight: '700',
              fontSize: '0.78rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              boxShadow: authMethod === 'face' ? '0 2px 5px rgba(0,0,0,0.08)' : 'none'
            }}
          >
            <Camera size={14} /> <span>Face ID</span>
          </button>
        </div>

        {/* Role Separation Notice */}
        <div style={{
          background: role === 'asha' ? '#fdf2f8' : '#f0fdfa',
          border: `1px solid ${role === 'asha' ? '#fbcfe8' : '#99f6e4'}`,
          borderRadius: '10px',
          padding: '0.65rem 0.85rem',
          marginBottom: '1rem',
          fontSize: '0.74rem',
          color: role === 'asha' ? '#831843' : '#115e59',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.5rem'
        }}>
          <Info size={16} style={{ flexShrink: 0, marginTop: '2px', color: role === 'asha' ? '#be185d' : '#0d9488' }} />
          <div>
            <strong>भूमिका नियम (Role Separation Policy):</strong> नागरिक मोबाईल क्रमांकाने ASHA नोंदवहीमध्ये प्रवेश करता येत नाही. ASHA पोर्टल केवळ अधिकृत कर्मचाऱ्यांसाठीच मर्यादित आहे.
          </div>
        </div>

        {/* Role Selector */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem' }}>
            {t('select_role_label') || 'खाते प्रकार निवडा (Select Account Role)'}
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => {
                setRole('citizen');
                setFullName('Ramesh Shantaram Patil');
                setPhone('9876543210');
              }}
              style={{
                padding: '0.6rem',
                borderRadius: '10px',
                border: `2px solid ${role === 'citizen' ? '#0d9488' : '#e2e8f0'}`,
                background: role === 'citizen' ? '#f0fdfa' : 'white',
                fontWeight: '700',
                fontSize: '0.82rem',
                color: role === 'citizen' ? '#0d9488' : '#475569',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                cursor: 'pointer'
              }}
            >
              <User size={15} /> 🌾 {t('role_citizen_btn') || 'ग्रामीण नागरिक'}
            </button>

            <button
              type="button"
              onClick={() => {
                setRole('asha');
                setFullName('Sunita Bai Shinde');
                setPhone('9822019485');
              }}
              style={{
                padding: '0.6rem',
                borderRadius: '10px',
                border: `2px solid ${role === 'asha' ? '#ec4899' : '#e2e8f0'}`,
                background: role === 'asha' ? '#fdf2f8' : 'white',
                fontWeight: '700',
                fontSize: '0.82rem',
                color: role === 'asha' ? '#ec4899' : '#475569',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                cursor: 'pointer'
              }}
            >
              <Shield size={15} /> 🩺 {t('role_asha_btn') || 'ASHA सेविका'}
            </button>
          </div>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div style={{
            background: '#fee2e2',
            color: '#b91c1c',
            border: '1px solid #fca5a5',
            padding: '0.6rem 0.85rem',
            borderRadius: '8px',
            fontSize: '0.8rem',
            marginBottom: '1rem',
            fontWeight: '600'
          }}>
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div style={{
            background: '#dcfce7',
            color: '#15803d',
            border: '1px solid #86efac',
            padding: '0.6rem 0.85rem',
            borderRadius: '8px',
            fontSize: '0.8rem',
            marginBottom: '1rem',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <CheckCircle size={16} /> {successMsg}
          </div>
        )}

        {/* 1. METHOD: FINGERPRINT BIOMETRICS (GENUINE HARDWARE SENSOR ONLY) */}
        {authMethod === 'fingerprint' && (
          hasBiometricHardware === false ? (
            /* Hardware Sensor Missing Fallback View */
            <div style={{
              background: '#fffbeb',
              border: '1.5px solid #fde68a',
              borderRadius: '14px',
              padding: '1.25rem',
              textAlign: 'center',
              marginBottom: '0.75rem'
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#fef3c7',
                color: '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 0.75rem auto'
              }}>
                <ShieldAlert size={28} />
              </div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#92400e', marginBottom: '0.35rem' }}>
                फिंगरप्रिंट सेन्सर आढळले नाही (No Sensor Detected)
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#b45309', marginBottom: '1.1rem', lineHeight: 1.4 }}>
                या डिव्हाइसवर प्रत्यक्ष <strong>बायोमेट्रिक फिंगरप्रिंट हार्डवेअर (Windows Hello / Touch ID)</strong> उपलब्ध नाही. सुरक्षित लॉगिनसाठी खालील पद्धत वापरा:
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setAuthMethod('otp')}
                  className="btn btn-primary"
                  style={{ fontSize: '0.8rem', padding: '0.65rem' }}
                >
                  <Phone size={15} /> <span>मोबाईल OTP वापरा</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenFaceScan}
                  className="btn"
                  style={{
                    fontSize: '0.8rem',
                    padding: '0.65rem',
                    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                    color: 'white',
                    fontWeight: '700'
                  }}
                >
                  <Camera size={15} /> <span>Face ID कॅमेरा</span>
                </button>
              </div>
            </div>
          ) : (
            /* Genuine Hardware Sensor Active View */
            <div style={{
              background: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)',
              border: '1.5px solid #5eead4',
              borderRadius: '14px',
              padding: '1.25rem',
              textAlign: 'center',
              marginBottom: '0.75rem'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 0.75rem auto',
                color: '#0d9488',
                boxShadow: '0 4px 12px rgba(13, 148, 136, 0.25)'
              }}>
                <Fingerprint size={32} className={bioScanning ? 'animate-pulse' : ''} />
              </div>

              <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f766e', marginBottom: '0.25rem' }}>
                {t('bio_quick_title') || 'WebAuthn Fingerprint Passkey'}
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#134e4a', marginBottom: '1rem' }}>
                प्रत्यक्ष हार्डवेअर फिंगरप्रिंट सेन्सर द्वारे १-टॅप सुरक्षित लॉगिन (Windows Hello / Touch ID)
              </p>

              <button
                onClick={handleBiometricLogin}
                disabled={bioScanning}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.75rem', justifyContent: 'center' }}
              >
                {bioScanning ? (
                  <>
                    <Sparkles size={16} className="animate-spin" />
                    <span>बायोमेट्रिक सेन्सर तपासत आहे...</span>
                  </>
                ) : (
                  <>
                    <Fingerprint size={18} />
                    <span>{t('bio_scan_btn') || 'आता फिंगरप्रिंट स्कॅन करा'}</span>
                  </>
                )}
              </button>
            </div>
          )
        )}

        {/* 2. METHOD: FACE RECOGNITION ID */}
        {authMethod === 'face' && (
          <div style={{
            background: 'linear-gradient(135deg, #090e1a 0%, #0f172a 100%)',
            border: '1.5px solid #38bdf8',
            borderRadius: '14px',
            padding: '1.25rem',
            textAlign: 'center',
            color: 'white',
            marginBottom: '0.75rem'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'rgba(6, 182, 212, 0.15)',
              border: '1.5px solid #38bdf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 0.75rem auto',
              color: '#38bdf8',
              boxShadow: '0 0 15px rgba(6, 182, 212, 0.3)'
            }}>
              <Camera size={30} />
            </div>

            <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'white', marginBottom: '0.25rem' }}>
              AI Face Recognition Scanner
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '1rem' }}>
              कॅमेऱ्यासमोर चेहरा धरून सेकंदात सुरक्षित लॉगिन करा
            </p>

            <button
              onClick={handleOpenFaceScan}
              className="btn"
              style={{
                width: '100%',
                padding: '0.75rem',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)',
                color: 'white',
                fontWeight: '800'
              }}
            >
              <Scan size={18} />
              <span>कॅमेरा Face ID स्कॅनर उघडा</span>
            </button>
          </div>
        )}

        {/* 3. METHOD: MOBILE OTP */}
        {authMethod === 'otp' && (
          !otpStep ? (
            <form onSubmit={handleSendOtp}>
              <div style={{ marginBottom: '0.9rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                  {t('full_name_label') || 'पूर्ण नाव (Full Name)'}
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              {role === 'asha' && (
                <div style={{ marginBottom: '0.9rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                    ASHA नोंदणीकृत बॅज क्रमांक (Govt Badge No.)
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={ashaBadge}
                    onChange={(e) => setAshaBadge(e.target.value)}
                    placeholder="उदा. MH-NSK-ASHA-409"
                    required
                  />
                </div>
              )}

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                  {t('mobile_num_label') || 'मोबाईल क्रमांक (Mobile Number)'}
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <span style={{
                    background: '#f1f5f9',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '10px',
                    padding: '0.75rem 0.85rem',
                    fontWeight: '700',
                    fontSize: '0.92rem',
                    color: '#475569',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    +91
                  </span>
                  <input
                    type="tel"
                    className="input-field"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="98XXXXXXXX"
                    maxLength={10}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.75rem', justifyContent: 'center' }}
              >
                {loading ? '...' : (t('send_otp_btn') || 'OTP पाठवा')}
                <ArrowRight size={16} />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp}>
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '0.85rem',
                marginBottom: '1rem',
                textAlign: 'center'
              }}>
                <p style={{ fontSize: '0.85rem', color: '#475569', margin: 0 }}>
                  {t('otp_sent_to_label') || 'OTP या नंबरवर पाठवला:'} <strong>+91 {phone}</strong>
                </p>
                <button
                  type="button"
                  onClick={() => setOtpStep(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#0d9488',
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    marginTop: '0.35rem'
                  }}
                >
                  {t('change_num_btn') || 'क्रमांक बदला'}
                </button>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem' }}>
                  {t('enter_otp_label') || '६ अंकी OTP प्रविष्ट करा'}
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={otpValue}
                  onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="• • • • • •"
                  style={{
                    textAlign: 'center',
                    fontSize: '1.4rem',
                    letterSpacing: '0.4em',
                    fontWeight: '800',
                    color: '#0f172a'
                  }}
                  maxLength={6}
                  autoFocus
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', fontSize: '0.8rem' }}>
                <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={14} /> {t('otp_timer_label') || 'वेळ:'} <strong>{timer} s</strong>
                </span>

                {timer === 0 ? (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#0d9488',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    {t('resend_otp_btn') || 'पुन्हा पाठवा'}
                  </button>
                ) : (
                  <span style={{ color: '#94a3b8' }}>{t('resend_otp_btn') || 'पुन्हा पाठवा'} ({timer}s)</span>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || otpValue.length < 4}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.75rem', justifyContent: 'center' }}
              >
                {loading ? '...' : (t('verify_and_enter_btn') || 'सत्यापित करा व प्रवेश करा')}
              </button>
            </form>
          )
        )}
      </div>
    </div>
  );
}
