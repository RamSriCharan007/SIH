import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldAlert,
  Lock,
  User,
  ShieldCheck,
  X,
  Phone,
  ArrowRight,
  LogOut
} from 'lucide-react';

export default function AshaAccessDeniedModal({ isOpen, onClose, onSwitchToAshaLogin }) {
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{
          maxWidth: '460px',
          padding: '1.75rem',
          borderRadius: '18px',
          boxShadow: '0 20px 45px rgba(185, 28, 28, 0.25)',
          border: '2px solid #fca5a5'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Icon */}
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
            color: '#dc2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 0.75rem',
            boxShadow: '0 8px 20px rgba(220, 38, 38, 0.2)'
          }}>
            <ShieldAlert size={34} />
          </div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#991b1b', margin: '0 0 0.35rem 0' }}>
            {t('access_denied_title') || 'प्रवेश प्रतिबंधित (Access Restricted)'}
          </h2>
          <p style={{ fontSize: '0.82rem', color: '#b91c1c', fontWeight: '600', margin: 0 }}>
            {t('access_denied_sub') || 'ASHA Worker Portal Requires Official Authorization'}
          </p>
        </div>

        {/* Reason Card */}
        <div style={{
          background: '#fff5f5',
          border: '1.5px solid #fecaca',
          borderRadius: '12px',
          padding: '1rem 1.1rem',
          marginBottom: '1.25rem',
          fontSize: '0.82rem',
          color: '#7f1d1d',
          lineHeight: 1.5
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', marginBottom: '0.4rem', color: '#991b1b' }}>
            <Lock size={16} />
            <span>नागरिक मोबाईल क्रमांकावर बंदी (Citizen Phone Locked)</span>
          </div>
          <p style={{ margin: 0 }}>
            तुम्ही सध्या <strong>+91 {user?.phone || 'नागरिक खात्यावर'}</strong> द्वारे <strong>नागरिक (Citizen)</strong> म्हणून लॉग इन आहात. आरोग्य नियमांनुसार, ग्रामीण रुग्णांचा अधिकृत डेटा व ASHA नोंदवही केवळ मान्यताप्राप्त <strong>ASHA सेविका व आरोग्य कर्मचाऱ्यांनाच</strong> उपलब्ध आहे.
          </p>
        </div>

        {/* Current User Card */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          padding: '0.75rem 1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#e0f2fe',
              color: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <User size={16} />
            </div>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#0f172a' }}>
                {user?.fullName || 'ग्रामीण नागरिक'}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                भूमिका: ग्रामीण नागरिक (Citizen Tier)
              </div>
            </div>
          </div>

          <span className="badge badge-cyber" style={{ fontSize: '0.68rem' }}>
            नागरिक
          </span>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <button
            onClick={() => {
              onClose();
              if (onSwitchToAshaLogin) onSwitchToAshaLogin();
            }}
            className="btn"
            style={{
              background: 'linear-gradient(135deg, #be185d 0%, #831843 100%)',
              color: 'white',
              padding: '0.75rem',
              fontWeight: '800',
              fontSize: '0.85rem',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 12px rgba(190, 24, 93, 0.3)'
            }}
          >
            <ShieldCheck size={18} />
            <span>ASHA बॅज क्रमांकाने लॉग इन करा</span>
            <ArrowRight size={15} />
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="btn btn-secondary"
              style={{
                fontSize: '0.8rem',
                padding: '0.6rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem'
              }}
            >
              <LogOut size={15} /> {t('logout') || 'लॉग आऊट'}
            </button>

            <button
              onClick={onClose}
              className="btn btn-secondary"
              style={{
                fontSize: '0.8rem',
                padding: '0.6rem',
                background: '#f1f5f9',
                color: '#334155',
                borderColor: '#cbd5e1'
              }}
            >
              नागरिक पोर्टलवर रहा
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
