import React, { useState, useRef, useEffect } from 'react';
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
  Camera,
  Scan,
  Shield,
  ExternalLink,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  Lock,
  Hospital
} from 'lucide-react';

export default function Header({
  onOpenEmergency,
  onOpenSmsModal,
  onOpenInstall,
  onOpenAi,
  onOpenVideoCall,
  onOpenEvaluation,
  onOpenDbViewer,
  onOpenGps,
  onOpenFaceModal
}) {
  const { lang, setLang, t } = useLanguage();
  const {
    user,
    setIsAuthModalOpen,
    logout,
    switchRole,
    setIsFaceModalOpen,
    setFaceModalMode
  } = useAuth();
  const { coordinates, gpsStatus, nearestHospital } = useGps();

  const [isProfileCardOpen, setIsProfileCardOpen] = useState(false);
  const profileRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileCardOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute User Initials
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const isAsha = user?.role === 'asha';
  const isDoctor = user?.role === 'doctor';
  const isCitizen = user?.role === 'citizen' || !user?.role;

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

          {/* CIRCULAR USER PROFILE AVATAR & HOVER CARD (TOP-RIGHT CORNER) */}
          {user ? (
            <div
              ref={profileRef}
              style={{ position: 'relative' }}
              onMouseEnter={() => setIsProfileCardOpen(true)}
              onMouseLeave={() => setIsProfileCardOpen(false)}
            >
              {/* Circular Avatar Trigger Button */}
              <button
                onClick={() => setIsProfileCardOpen(prev => !prev)}
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: isAsha
                    ? 'linear-gradient(135deg, #be185d 0%, #db2777 100%)'
                    : 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)',
                  border: `2px solid ${isAsha ? '#f472b6' : '#38bdf8'}`,
                  color: 'white',
                  fontWeight: '800',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: isAsha
                    ? '0 0 14px rgba(219, 39, 119, 0.4)'
                    : '0 0 14px rgba(13, 148, 136, 0.4)',
                  position: 'relative',
                  outline: 'none',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                title={`${user.fullName} (${user.role}) - Hover to view profile details`}
              >
                {getInitials(user.fullName)}

                {/* Online Status Dot */}
                <span style={{
                  position: 'absolute',
                  bottom: '-1px',
                  right: '-1px',
                  width: '11px',
                  height: '11px',
                  borderRadius: '50%',
                  background: '#22c55e',
                  border: '2px solid white',
                  display: 'inline-block'
                }} />
              </button>

              {/* Rich Glassmorphic Hover Profile Card Dropdown */}
              {isProfileCardOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '320px',
                    background: 'rgba(15, 23, 42, 0.96)',
                    backdropFilter: 'blur(16px)',
                    border: '1.5px solid #334155',
                    borderRadius: '16px',
                    padding: '1.25rem',
                    boxShadow: '0 20px 40px -8px rgba(0, 0, 0, 0.6)',
                    color: 'white',
                    zIndex: 1000,
                    animation: 'dropdownFade 0.2s ease-out'
                  }}
                >
                  {/* Profile Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: isAsha
                        ? 'linear-gradient(135deg, #be185d 0%, #db2777 100%)'
                        : 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '800',
                      fontSize: '1.1rem',
                      color: 'white',
                      border: '2px solid rgba(255,255,255,0.2)'
                    }}>
                      {getInitials(user.fullName)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.95rem', fontWeight: '800', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {user.fullName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        +91 {user.phone || '9822019485'}
                      </div>
                    </div>
                  </div>

                  {/* Role Badge & Location */}
                  <div style={{
                    background: isAsha ? 'rgba(236, 72, 153, 0.12)' : 'rgba(6, 182, 212, 0.12)',
                    border: `1px solid ${isAsha ? 'rgba(236, 72, 153, 0.3)' : 'rgba(6, 182, 212, 0.3)'}`,
                    borderRadius: '10px',
                    padding: '0.65rem 0.85rem',
                    marginBottom: '0.85rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                      <span style={{ fontSize: '0.74rem', fontWeight: '800', color: isAsha ? '#f472b6' : '#38bdf8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {isAsha ? <ShieldCheck size={14} /> : <User size={14} />}
                        {isAsha ? 'ASHA HEALTH WORKER' : 'RURAL CITIZEN'}
                      </span>
                      {user.asha_badge_no && (
                        <span style={{ fontSize: '0.68rem', background: '#be185d', color: 'white', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: '700' }}>
                          {user.asha_badge_no}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <MapPin size={11} style={{ color: '#0d9488' }} />
                      <span>{user.village || 'Trimbak Pada No. 3'}, {user.district || 'Nashik Rural'}</span>
                    </div>
                  </div>

                  {/* Biometric Status Row */}
                  <div style={{
                    background: '#090e1a',
                    borderRadius: '8px',
                    padding: '0.6rem 0.75rem',
                    marginBottom: '0.85rem',
                    fontSize: '0.74rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem',
                    border: '1px solid #1e293b'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Fingerprint size={13} style={{ color: '#0d9488' }} /> Biometric Passkey
                      </span>
                      <span style={{ color: '#10b981', fontWeight: '700' }}>✓ Active</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Camera size={13} style={{ color: '#38bdf8' }} /> Face Recognition ID
                      </span>
                      <span style={{ color: user.face_registered ? '#10b981' : '#f59e0b', fontWeight: '700' }}>
                        {user.face_registered ? '✓ Registered' : 'Ready to Scan'}
                      </span>
                    </div>
                  </div>

                  {/* Quick Action Buttons */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                    {/* Face ID Scanner Quick Trigger */}
                    <button
                      onClick={() => {
                        setFaceModalMode('register');
                        setIsFaceModalOpen(true);
                        setIsProfileCardOpen(false);
                      }}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        background: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        color: '#38bdf8',
                        fontSize: '0.78rem',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                        cursor: 'pointer'
                      }}
                    >
                      <Scan size={14} />
                      <span>{user.face_registered ? 'Re-scan / Test Face ID' : 'Register Face Biometrics'}</span>
                    </button>

                    {/* Logout */}
                    <button
                      onClick={() => {
                        logout();
                        setIsProfileCardOpen(false);
                      }}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        background: 'rgba(244, 63, 94, 0.12)',
                        border: '1px solid rgba(244, 63, 94, 0.3)',
                        borderRadius: '8px',
                        color: '#fb7185',
                        fontSize: '0.78rem',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                        cursor: 'pointer',
                        marginTop: '0.2rem'
                      }}
                    >
                      <LogOut size={14} />
                      <span>{t('logout') || 'लॉग आऊट (Logout)'}</span>
                    </button>
                  </div>
                </div>
              )}
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
