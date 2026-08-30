import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  MessageSquare,
  Send,
  Sparkles,
  X,
  Phone,
  Signal,
  CheckCheck,
  HelpCircle
} from 'lucide-react';

const QUICK_COMMANDS = [
  { label: 'बेड स्थिती (BEDS)', text: 'BEDS' },
  { label: 'O+ रक्तसाठा (BLOOD O+)', text: 'BLOOD O+' },
  { label: 'सर्पदंश मदत (SNAKE)', text: 'SNAKE' },
  { label: 'ताप काढा (FEVER)', text: 'FEVER' },
  { label: 'प्रसूती मदत (MATERNAL)', text: 'MATERNAL' },
];

export default function SmsGatewayModal({ onClose, defaultQuery }) {
  const { lang, t } = useLanguage();
  const [inputText, setInputText] = useState(defaultQuery || 'BEDS');
  const [messages, setMessages] = useState([
    {
      sender: 'gateway',
      text: '[MH-GOV-HLTH SMS] 24x7 शून्य इंटरनेट आपत्कालीन हेल्पलाइन (Toll-Free 56161). बेड, रक्त किंवा प्रथमोपचारासाठी संदेश पाठवा.',
      time: '10:00 AM'
    }
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = {
      sender: 'user',
      text: inputText,
      time: new Date().toLocaleTimeString()
    };

    setMessages((prev) => [...prev, userMsg]);
    const queryToSend = inputText;
    setInputText('');
    setLoading(true);

    try {
      const res = await fetch('/api/sms-fallback/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ smsText: queryToSend, senderPhone: '9822019485' })
      });
      const data = await res.json();
      if (data.success) {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'gateway',
            text: data.gatewayReply,
            time: data.timestamp
          }
        ]);
      }
    } catch (err) {
      // Offline fallback
      setMessages((prev) => [
        ...prev,
        {
          sender: 'gateway',
          text: `[MH-GOV-SMS OFFLINE] त्र्यंबकेश्वर PHC (ICU: 1, Gen: 12), जुन्नर RH (ICU: 3, Gen: 18). आपत्कालीन: 108.`,
          time: new Date().toLocaleTimeString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: '#0f172a',
              color: '#38bdf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <MessageSquare size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a' }}>
                शून्य इंटरनेट SMS गेटवे सिम्युलेटर
              </h2>
              <p style={{ fontSize: '0.74rem', color: '#64748b' }}>
                Toll-Free SMS Shortcode: <strong>56161</strong> (PS-1, PS-3 निवारण)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748b'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Quick prompt suggestions */}
        <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', marginBottom: '0.85rem', paddingBottom: '0.2rem' }}>
          {QUICK_COMMANDS.map((cmd, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setInputText(cmd.text)}
              style={{
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '0.25rem 0.55rem',
                fontSize: '0.72rem',
                fontWeight: '700',
                color: '#334155',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {cmd.label}
            </button>
          ))}
        </div>

        {/* SMS Chat Screen */}
        <div style={{
          background: '#0f172a',
          borderRadius: '14px',
          padding: '1rem',
          height: '280px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.65rem',
          marginBottom: '0.85rem'
        }}>
          {messages.map((m, idx) => {
            const isUser = m.sender === 'user';
            return (
              <div
                key={idx}
                style={{
                  alignSelf: isUser ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  background: isUser ? '#0d9488' : '#1e293b',
                  color: isUser ? 'white' : '#f8fafc',
                  padding: '0.6rem 0.8rem',
                  borderRadius: isUser ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                  fontSize: '0.82rem',
                  lineHeight: 1.4,
                  border: isUser ? 'none' : '1px solid rgba(255,255,255,0.1)'
                }}
              >
                <div>{m.text}</div>
                <div style={{ fontSize: '0.65rem', color: isUser ? '#99f6e4' : '#94a3b8', textAlign: 'right', marginTop: '0.25rem' }}>
                  {m.time} {isUser && <CheckCheck size={10} style={{ display: 'inline', verticalAlign: '-1px' }} />}
                </div>
              </div>
            );
          })}

          {loading && (
            <div style={{
              alignSelf: 'flex-start',
              background: '#1e293b',
              color: '#94a3b8',
              padding: '0.5rem 0.8rem',
              borderRadius: '12px',
              fontSize: '0.78rem'
            }}>
              SMS पाठवत आहे... (Sending SMS...)
            </div>
          )}
        </div>

        {/* Send Input */}
        <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            className="input-field"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="उदा. BEDS किंवा BLOOD O+"
            style={{ fontSize: '0.85rem' }}
          />
          <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem 1rem' }}>
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
