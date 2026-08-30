import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useGps } from '../context/GpsContext';
import {
  HeartPulse,
  PhoneCall,
  User,
  Fingerprint,
  Languages,
  LogOut,
  ShieldCheck,
  Activity,
  Download,
  Bot,
  Video,
  Award,
  Database,
  Navigation,
  MapPin,
  Radio
} from 'lucide-react';

export default function Header({
  onOpenEmergency,
  onOpenSmsModal,
  onOpenInstall,
  onOpenAi,
  onOpenVideoCall,
  onOpenEvaluation,
  onOpenDbViewer,
  onOpenGps
}) {
  const { lang, setLang, t } = useLanguage();
  const { user, setIsAuthModalOpen, logout, switchRole } = useAuth();
  const { coordinates, gpsStatus, nearestHospital } = useGps();

  return (
    <header className="top-header">
      <div className="header-inner">
        {/* Logo and Brand */}
        <div className="logo-wrap" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="logo-badge">
            <HeartPulse size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.02em', color: '#0f172a' }}>
                {t('app_title')}
              </h1>
              <span className="badge badge-green" style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem' }}>
                {t('gov_health_badge')}
              </span>
            </div>
            <p style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: '500' }}>
              {t('app_tagline')}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="header-actions">
          {/* GPS Live Telemetry & Hospital Proximity Tracker */}
          <button
            onClick={onOpenGps}
            className="btn"
            style={{
              fontSize: '0.82rem',
              padding: '0.45rem 0.85rem',
              background: '#f0fdf4',
              border: '1.5px solid #86efac',
              color: '#166534',
              boxShadow: '0 2px 6px rgba(22, 101, 52, 0.08)',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
            title="Live GPS Telemetry, Nearest Hospital & DB Logging"
          >
            <Navigation size={15} style={{ color: '#16a34a' }} />
            <span>GPS: {coordinates.latitude.toFixed(3)}°, {coordinates.longitude.toFixed(3)}°</span>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
          </button>

          {/* SQL Live Database Inspector Trigger */}
          <button
            onClick={onOpenDbViewer}
            className="btn"
            style={{
              fontSize: '0.82rem',
              padding: '0.45rem 0.85rem',
              background: '#f8fafc',
              border: '1.5px solid #cbd5e1',
              color: '#0f172a',
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
              fontWeight: '700'
            }}
            title="Live PostgreSQL Database Inspector"
          >
            <Database size={15} style={{ color: '#0284c7' }} />
            <span>SQL DB</span>
          </button>

          {/* SIH Evaluation Showcase Button */}
          <button
            onClick={onOpenEvaluation}
            className="btn"
            style={{
              fontSize: '0.82rem',
              padding: '0.45rem 0.85rem',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: 'white',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.35)',
              fontWeight: '700'
            }}
            title="SIH 2024 Jury Evaluation Showcase"
          >
            <Award size={16} />
            <span>{t('sih_eval_btn')}</span>
          </button>

          {/* Doctor Video Call Trigger */}
          <button
            onClick={onOpenVideoCall}
            className="btn"
            style={{
              fontSize: '0.82rem',
              padding: '0.45rem 0.85rem',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: 'white',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)'
            }}
            title="Emergency Doctor Video Call"
          >
            <Video size={16} />
            <span>{t('video_call_btn')}</span>
          </button>

          {/* AI Voice Assistant Trigger */}
          <button
            onClick={onOpenAi}
            className="btn"
            style={{
              fontSize: '0.82rem',
              padding: '0.45rem 0.85rem',
              background: 'linear-gradient(135deg, #0d9488 0%, #065f46 100%)',
              color: 'white',
              boxShadow: '0 4px 12px rgba(13, 148, 136, 0.3)',
              position: 'relative'
            }}
            title="Aarogya AI Voice Assistant"
          >
            <Bot size={16} />
            <span>{t('ai_voice_btn')}</span>
          </button>

          {/* Language Selector */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '0.3rem 0.55rem',
              fontSize: '0.82rem',
              fontWeight: '600',
              color: '#334155'
            }}>
              <Languages size={15} style={{ marginRight: '5px', color: '#0d9488' }} />
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  cursor: 'pointer',
                  fontWeight: '600',
                  color: '#1e293b'
                }}
              >
                <option value="mr">मराठी (Marathi)</option>
                <option value="hi">हिंदी (Hindi)</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>

          {/* Download & Install App Button */}
          <button
            onClick={onOpenInstall}
            className="btn btn-secondary"
            style={{
              fontSize: '0.82rem',
              padding: '0.45rem 0.8rem',
              borderColor: '#0d9488',
              color: '#0f766e',
              background: '#f0fdfa'
            }}
            title="Download & Install Offline App"
          >
            <Download size={15} style={{ color: '#0d9488' }} />
            <span>{t('install_app_btn')}</span>
          </button>

          {/* Emergency SOS Button */}
          <button
            onClick={onOpenEmergency}
            className="btn btn-emergency"
            style={{ fontSize: '0.85rem', padding: '0.45rem 0.9rem' }}
            title="Call 108 Ambulance / Emergency SOS"
          >
            <PhoneCall size={16} />
            <span>{t('emergency_sos')}</span>
          </button>

          {/* User Auth or Profile Section */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                background: user.role === 'asha' ? '#fdf2f8' : '#f0fdfa',
                border: `1px solid ${user.role === 'asha' ? '#fbcfe8' : '#99f6e4'}`,
                padding: '0.3rem 0.65rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem'
              }}>
                {user.role === 'asha' ? (
                  <ShieldCheck size={16} style={{ color: '#db2777' }} />
                ) : (
                  <User size={16} style={{ color: '#0d9488' }} />
                )}
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#0f172a' }}>
                    {user.fullName}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>{user.role === 'asha' ? t('role_asha_btn') : t('role_citizen_btn')}</span>
                    {user.authMethod && (
                      <span style={{ color: '#059669', fontWeight: '600' }}>• Biometric</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Role switch toggle */}
              <button
                onClick={() => switchRole(user.role === 'asha' ? 'citizen' : 'asha')}
                className="btn btn-secondary"
                style={{ fontSize: '0.74rem', padding: '0.35rem 0.55rem' }}
                title="Switch between Citizen and ASHA Worker portal"
              >
                {user.role === 'asha' ? t('switch_to_citizen') : t('switch_to_asha')}
              </button>

              <button
                onClick={logout}
                className="btn btn-secondary"
                style={{ padding: '0.35rem 0.55rem' }}
                title={t('logout')}
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="btn btn-primary"
                style={{ fontSize: '0.85rem', padding: '0.45rem 0.95rem' }}
              >
                <Fingerprint size={16} />
                <span>{t('login_signup')}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
