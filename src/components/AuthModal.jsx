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
  ArrowRight
} from 'lucide-react';

export default function AuthModal({ onAutofillOtpRef }) {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    requestOtp,
    verifyOtp,
    loginWithBiometrics
  } = useAuth();
  const { t } = useLanguage();

  const [phone, setPhone] = useState('9822019485');
  const [fullName, setFullName] = useState('Sunita Bai Shinde');
  const [role, setRole] = useState('asha'); // 'citizen' or 'asha'

  const [otpStep, setOtpStep] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [timer, setTimer] = useState(60);

  const [loading, setLoading] = useState(false);
  const [bioScanning, setBioScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

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
        setSuccessMsg(t('bio_verified_text'));
      } else {
        setErrorMsg(res.error || 'Biometric verification failed.');
      }
    } catch (err) {
      setErrorMsg('Biometric sensor error');
    } finally {
      setBioScanning(false);
    }
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
      <div className="modal-content" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
              {t('auth_modal_title')}
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
              {t('auth_modal_sub')}
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

        {/* Biometric Quick Login Card */}
        <div style={{
          background: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)',
          border: '1.5px solid #5eead4',
          borderRadius: '14px',
          padding: '1.1rem',
          marginBottom: '1.25rem',
          textAlign: 'center'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 0.6rem auto',
            color: '#0d9488',
            boxShadow: '0 4px 10px rgba(13, 148, 136, 0.2)'
          }}>
            <Fingerprint size={30} className={bioScanning ? 'animate-pulse' : ''} />
          </div>

          <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f766e', marginBottom: '0.25rem' }}>
            {t('bio_quick_title')}
          </h3>
          <p style={{ fontSize: '0.78rem', color: '#134e4a', marginBottom: '0.85rem' }}>
            {t('bio_quick_desc')}
          </p>

          <button
            onClick={handleBiometricLogin}
            disabled={bioScanning}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.65rem', justifyContent: 'center' }}
          >
            {bioScanning ? (
              <>
                <Sparkles size={16} className="animate-spin" />
                <span>{t('bio_scanning_text')}</span>
              </>
            ) : (
              <>
                <Fingerprint size={18} />
                <span>{t('bio_scan_btn')}</span>
              </>
            )}
          </button>
        </div>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '1.1rem',
          color: '#94a3b8',
          fontSize: '0.78rem',
          fontWeight: '700'
        }}>
          <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
          <span>{t('or_mobile_otp')}</span>
          <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
        </div>

        {/* Role Switcher */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem' }}>
            {t('select_role_label')}
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setRole('citizen')}
              style={{
                padding: '0.6rem',
                borderRadius: '10px',
                border: `2px solid ${role === 'citizen' ? '#0d9488' : '#e2e8f0'}`,
                background: role === 'citizen' ? '#f0fdfa' : 'white',
                fontWeight: '700',
                fontSize: '0.85rem',
                color: role === 'citizen' ? '#0d9488' : '#475569',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                cursor: 'pointer'
              }}
            >
              <User size={16} /> {t('role_citizen_btn')}
            </button>

            <button
              type="button"
              onClick={() => setRole('asha')}
              style={{
                padding: '0.6rem',
                borderRadius: '10px',
                border: `2px solid ${role === 'asha' ? '#ec4899' : '#e2e8f0'}`,
                background: role === 'asha' ? '#fdf2f8' : 'white',
                fontWeight: '700',
                fontSize: '0.85rem',
                color: role === 'asha' ? '#ec4899' : '#475569',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                cursor: 'pointer'
              }}
            >
              <Shield size={16} /> {t('role_asha_btn')}
            </button>
          </div>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div style={{
            background: '#fee2e2',
            color: '#b91c1c',
            border: '1px solid #fca5a5',
            padding: '0.65rem 0.85rem',
            borderRadius: '8px',
            fontSize: '0.82rem',
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
            padding: '0.65rem 0.85rem',
            borderRadius: '8px',
            fontSize: '0.82rem',
            marginBottom: '1rem',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <CheckCircle size={16} /> {successMsg}
          </div>
        )}

        {/* Mobile + OTP Flow */}
        {!otpStep ? (
          <form onSubmit={handleSendOtp}>
            <div style={{ marginBottom: '0.9rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                {t('full_name_label')}
              </label>
              <input
                type="text"
                className="input-field"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                {t('mobile_num_label')}
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
              {loading ? '...' : t('send_otp_btn')}
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
              <p style={{ fontSize: '0.85rem', color: '#475569' }}>
                {t('otp_sent_to_label')} <strong>+91 {phone}</strong>
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
                  marginTop: '0.25rem'
                }}
              >
                {t('change_num_btn')}
              </button>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem' }}>
                {t('enter_otp_label')}
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
                <Clock size={14} /> {t('otp_timer_label')} <strong>{timer} s</strong>
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
                  {t('resend_otp_btn')}
                </button>
              ) : (
                <span style={{ color: '#94a3b8' }}>{t('resend_otp_btn')} ({timer}s)</span>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || otpValue.length < 4}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem', justifyContent: 'center' }}
            >
              {loading ? '...' : t('verify_and_enter_btn')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
