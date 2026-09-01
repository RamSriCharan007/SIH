import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  ShieldCheck,
  Lock,
  Hospital,
  KeyRound,
  AlertCircle,
  X,
  Building2,
  Eye,
  EyeOff,
  ExternalLink,
  ShieldAlert,
  Sparkles
} from 'lucide-react';

export default function HospitalLoginModal({ isOpen, onClose, onLoginSuccess }) {
  const { t } = useLanguage();
  const [authCode, setAuthCode] = useState('hosp-01');
  const [accessKey, setAccessKey] = useState('Trimbak@PHC2026');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/hospital/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authCode: authCode.trim(), accessKey: accessKey.trim() })
      });
      const data = await res.json();

      if (data.success && data.hospital) {
        localStorage.setItem('gramin_hospital_auth', JSON.stringify({
          token: data.token,
          hospital: data.hospital,
          loggedInAt: new Date().toISOString()
        }));
        onLoginSuccess(data.hospital);
        onClose();
      } else {
        setErrorMsg(data.error || 'Invalid Hospital Code or Verified Security Passkey');
      }
    } catch (err) {
      setErrorMsg('Network error: Unable to connect to Hospital Authentication server');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = (code, key) => {
    setAuthCode(code);
    setAccessKey(key);
    setErrorMsg('');
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div
        className="modal-content"
        style={{ maxWidth: '540px', padding: '2rem', borderRadius: '22px', border: '1.5px solid #e2e8f0', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 18px rgba(2, 132, 199, 0.35)'
            }}>
              <Hospital size={26} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                {t('hospital_login_title') || 'रुग्णालय अधिकृत प्रवेश (Hospital Login)'}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}>
                <span className="badge badge-teal" style={{ fontSize: '0.68rem', padding: '0.12rem 0.45rem' }}>
                  <ShieldCheck size={11} /> Directorate of Health Services • Verified Entry
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
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

        {/* Security Disclosure Notice */}
        <div style={{
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
          border: '1.5px solid #bae6fd',
          borderRadius: '14px',
          padding: '0.85rem 1rem',
          fontSize: '0.78rem',
          color: '#0369a1',
          marginBottom: '1.25rem',
          display: 'flex',
          gap: '0.65rem',
          lineHeight: '1.45'
        }}>
          <Lock size={18} style={{ flexShrink: 0, marginTop: '2px', color: '#0284c7' }} />
          <div>
            <strong>Developer Provisioned Access Only:</strong> Under Maharashtra Digital Health Guidelines, hospitals cannot publicly self-register. Only facilities verified & issued passkeys by Master Developer Ram Sri Charan can log in.
          </div>
        </div>

        {/* Quick Demo Credentials */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: '700', color: '#64748b' }}>
              त्वरित चाचणी निवडा (Developer Verified Quick Credentials):
            </span>
            <a
              href="/developer-portal"
              target="_blank"
              rel="noreferrer"
              style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: '700', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '3px' }}
            >
              <span>Dev Console</span> <ExternalLink size={10} />
            </a>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.45rem' }}>
            <button
              type="button"
              onClick={() => handleQuickDemo('hosp-01', 'Trimbak@PHC2026')}
              style={{
                fontSize: '0.72rem',
                padding: '0.4rem 0.6rem',
                borderRadius: '8px',
                border: authCode === 'hosp-01' ? '1.5px solid #0284c7' : '1px solid #cbd5e1',
                background: authCode === 'hosp-01' ? '#e0f2fe' : '#ffffff',
                color: authCode === 'hosp-01' ? '#0369a1' : '#334155',
                fontWeight: '700',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              🏥 Trimbak PHC (Govt Free)
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('hosp-02', 'Junnar@Gov2026')}
              style={{
                fontSize: '0.72rem',
                padding: '0.4rem 0.6rem',
                borderRadius: '8px',
                border: authCode === 'hosp-02' ? '1.5px solid #0284c7' : '1px solid #cbd5e1',
                background: authCode === 'hosp-02' ? '#e0f2fe' : '#ffffff',
                color: authCode === 'hosp-02' ? '#0369a1' : '#334155',
                fontWeight: '700',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              🏥 Junnar Rural Trauma
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('hosp-03', 'Sanjeevani@Care2026')}
              style={{
                fontSize: '0.72rem',
                padding: '0.4rem 0.6rem',
                borderRadius: '8px',
                border: authCode === 'hosp-03' ? '1.5px solid #0284c7' : '1px solid #cbd5e1',
                background: authCode === 'hosp-03' ? '#e0f2fe' : '#ffffff',
                color: authCode === 'hosp-03' ? '#0369a1' : '#334155',
                fontWeight: '700',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              🏥 Sanjeevani Charitable Trust
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('hosp-04', 'Sahyadri@Nashik2026')}
              style={{
                fontSize: '0.72rem',
                padding: '0.4rem 0.6rem',
                borderRadius: '8px',
                border: authCode === 'hosp-04' ? '1.5px solid #0284c7' : '1px solid #cbd5e1',
                background: authCode === 'hosp-04' ? '#e0f2fe' : '#ffffff',
                color: authCode === 'hosp-04' ? '#0369a1' : '#334155',
                fontWeight: '700',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              🏥 Sahyadri Super-Speciality
            </button>
          </div>
        </div>

        <form onSubmit={handleLogin}>
          {errorMsg && (
            <div style={{
              background: '#fef2f2',
              border: '1.5px solid #fecaca',
              color: '#dc2626',
              padding: '0.75rem 0.95rem',
              borderRadius: '12px',
              fontSize: '0.82rem',
              fontWeight: '600',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              lineHeight: 1.4
            }}>
              <AlertCircle size={17} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
              रुग्णालय अधिकृत कोड / Hospital Auth Code *
            </label>
            <div style={{ position: 'relative' }}>
              <Building2 size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                className="input-field"
                value={authCode}
                onChange={(e) => setAuthCode(e.target.value)}
                placeholder="e.g. hosp-01"
                style={{ paddingLeft: '2.4rem' }}
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
              प्रमाणित सुरक्षा पासकी / Verified Security Passkey *
            </label>
            <div style={{ position: 'relative' }}>
              <KeyRound size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                className="input-field"
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value)}
                placeholder="Enter developer-issued passkey"
                style={{ paddingLeft: '2.4rem', paddingRight: '2.4rem' }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94a3b8'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={12} style={{ color: '#16a34a' }} /> Protected by 256-Bit TLS & Rate-Limiting Anti-Brute-Force Guard
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '0.85rem',
              fontSize: '0.95rem',
              fontWeight: '800',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 15px rgba(2, 132, 199, 0.4)'
            }}
          >
            <ShieldCheck size={18} />
            <span>{isLoading ? 'सत्यापित करत आहे...' : 'अधिकृत लॉगिन करा (Verify & Login)'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
