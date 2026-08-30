import React from 'react';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, CheckCircle, X, Sparkles } from 'lucide-react';

export default function SmsHeadsUp({ onAutofill }) {
  const { activeSmsPopup, setActiveSmsPopup } = useAuth();

  if (!activeSmsPopup) return null;

  return (
    <div className="sms-popup-banner sms-banner-anim">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            background: '#0d9488',
            color: 'white',
            borderRadius: '8px',
            padding: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <MessageSquare size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#5eead4', letterSpacing: '0.05em' }}>
              MESSAGES • {activeSmsPopup.sender}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              {activeSmsPopup.timestamp || 'Just now'}
            </div>
          </div>
        </div>

        <button
          onClick={() => setActiveSmsPopup(null)}
          style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
          title="Close SMS banner"
        >
          <X size={16} />
        </button>
      </div>

      <div style={{
        marginTop: '0.6rem',
        fontSize: '0.88rem',
        background: 'rgba(255, 255, 255, 0.07)',
        padding: '0.6rem 0.75rem',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        lineHeight: 1.4
      }}>
        {activeSmsPopup.text}
      </div>

      <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
          OTP Detected: <strong style={{ color: '#38bdf8', fontSize: '1rem' }}>{activeSmsPopup.otp}</strong>
        </span>

        <button
          onClick={() => {
            if (onAutofill) {
              onAutofill(activeSmsPopup.otp);
            }
          }}
          className="btn btn-primary"
          style={{ padding: '0.35rem 0.8rem', fontSize: '0.82rem', background: '#0d9488' }}
        >
          <Sparkles size={14} /> Auto-fill OTP
        </button>
      </div>
    </div>
  );
}
