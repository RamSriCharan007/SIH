import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useNetwork } from '../../context/NetworkContext';
import { useAuth } from '../../context/AuthContext';
import { processOfflineAiQuery } from '../../utils/offlineAiEngine';
import {
  Bot,
  Mic,
  MicOff,
  Send,
  Sparkles,
  Volume2,
  VolumeX,
  X,
  PhoneCall,
  Activity,
  Hospital,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  AlertTriangle,
  Database
} from 'lucide-react';

export default function AarogyaAiModal({ onClose, onTriggerAction, onOpenDbViewer }) {
  const { lang, t, speakText, stopSpeaking, isSpeaking } = useLanguage();
  const { isOffline } = useNetwork();
  const { user } = useAuth();

  const [inputQuery, setInputQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      sender: 'ai',
      text: lang === 'mr'
        ? "नमस्ते! मी **आरोग्य AI साथी (Aarogya AI)** आहे. 🌿\nमी ग्रामीण आरोग्य, लक्षण तपासणी, ४०% घरगुती काढे, रुग्णालयातील बेड्स, रक्त साठा आणि १०८ आपत्कालीन सेवेमध्ये तुम्हाला मदत करू शकतो. तुम्ही **माईकवर बोलून** किंवा **टाइप करून** प्रश्न विचारू शकता!"
        : lang === 'hi'
        ? "नमस्ते! मैं **आरोग्य AI साथी** हूँ। मैं ग्रामीण स्वास्थ्य, प्राथमिक उपचार, अस्पताल बेड्स और 108 आपातकालीन सहायता में आपकी मदद कर सकता हूँ। आप बोलकर या लिखकर पूछ सकते हैं!"
        : "Hello! I am **Aarogya AI**, your rural healthcare copilot for Maharashtra. Ask me about symptoms, 40% Kadha remedies, live hospital beds, blood units, or 108 emergency triage by voice or text!",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      quickSuggestions: ['ताप आला आहे काय करू?', 'सर्पदंश तातडीची मदत', 'जवळचे ICU बेड्स', 'गरोदरपण काळजी']
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      
      // Set language code based on selected lang
      if (lang === 'mr') recognition.lang = 'mr-IN';
      else if (lang === 'hi') recognition.lang = 'hi-IN';
      else recognition.lang = 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputQuery(transcript);
        setIsListening(false);
        // Automatically submit voice query
        handleSendQuery(transcript);
      };

      recognition.onerror = (err) => {
        console.warn('Speech recognition error:', err);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [lang]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const toggleSpeechRecognition = () => {
    if (!recognitionRef.current) {
      alert("Speech Recognition is not supported on this browser. Please use Chrome, Edge, or Brave.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      stopSpeaking();
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.warn(e);
      }
    }
  };

  const handleSendQuery = async (queryText) => {
    const text = (queryText || inputQuery).trim();
    if (!text) return;

    const userMsg = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    try {
      let aiResult;

      if (isOffline) {
        // Run Local Offline NLP AI Engine
        await new Promise(r => setTimeout(r, 400));
        aiResult = processOfflineAiQuery(text, lang);
      } else {
        // Run Online Backend Medical AI API (Persists directly into PostgreSQL)
        const res = await fetch('/api/ai-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: text,
            lang,
            patientName: user?.fullName || 'Aarogya AI Patient',
            phone: user?.phone || '9822019485'
          })
        });
        aiResult = await res.json();
      }

      const aiMsg = {
        id: 'ai-' + Date.now(),
        sender: 'ai',
        text: aiResult.reply,
        action: aiResult.action,
        quickSuggestions: aiResult.quickSuggestions,
        consultationId: aiResult.consultationId,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);

      // Automatically speak out the response for rural audio accessibility
      speakText(aiResult.reply.replace(/[*#_]/g, ''));

    } catch (err) {
      // Offline fallback
      const fallback = processOfflineAiQuery(text, lang);
      setMessages(prev => [
        ...prev,
        {
          id: 'ai-' + Date.now(),
          sender: 'ai',
          text: fallback.reply,
          action: fallback.action,
          quickSuggestions: fallback.quickSuggestions,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '620px', height: '88vh', display: 'flex', flexDirection: 'column', padding: '1.25rem' }} onClick={(e) => e.stopPropagation()}>
        
        {/* Top Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '0.85rem',
          borderBottom: '1px solid #e2e8f0',
          marginBottom: '0.85rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0d9488 0%, #10b981 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(13, 148, 136, 0.3)'
            }}>
              <Bot size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a' }}>
                  {t('ai_modal_title')}
                </h2>
                <span className={`badge ${isOffline ? 'badge-amber' : 'badge-green'}`} style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem' }}>
                  {isOffline ? 'Offline AI Engine' : 'Online Copilot'}
                </span>
              </div>
              <p style={{ fontSize: '0.74rem', color: '#64748b' }}>
                {t('ai_modal_sub')}
              </p>
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

        {/* Chat History Area */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          {messages.map((m) => {
            const isAi = m.sender === 'ai';
            return (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isAi ? 'flex-start' : 'flex-end',
                  gap: '0.35rem'
                }}
              >
                <div style={{
                  maxWidth: '88%',
                  background: isAi ? 'white' : 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
                  color: isAi ? '#0f172a' : 'white',
                  padding: '0.9rem 1.1rem',
                  borderRadius: isAi ? '16px 16px 16px 4px' : '16px 16px 4px 16px',
                  boxShadow: isAi ? '0 4px 15px rgba(0,0,0,0.05)' : '0 4px 12px rgba(13, 148, 136, 0.25)',
                  border: isAi ? '1px solid #e2e8f0' : 'none',
                  fontSize: '0.9rem',
                  lineHeight: 1.5,
                  whiteSpace: 'pre-line'
                }}>
                  {m.text}

                  {/* Interactive Action Button inside AI reply */}
                  {m.action && (
                    <div style={{ marginTop: '0.75rem', paddingTop: '0.65rem', borderTop: isAi ? '1px solid #f1f5f9' : '1px solid rgba(255,255,255,0.2)' }}>
                      {m.action.type === 'call_108' && (
                        <a
                          href="tel:108"
                          className="btn btn-emergency"
                          style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}
                        >
                          <PhoneCall size={15} /> {t('call_108_btn')}
                        </a>
                      )}
                      {m.action.type === 'call_102' && (
                        <a
                          href="tel:102"
                          className="btn"
                          style={{ background: '#db2777', color: 'white', padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}
                        >
                          <PhoneCall size={15} /> {t('call_102_btn')}
                        </a>
                      )}
                      {m.action.type === 'view_hospitals' && (
                        <button
                          onClick={() => {
                            if (onTriggerAction) onTriggerAction('hospitals');
                            onClose();
                          }}
                          className="btn btn-primary"
                          style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}
                        >
                          <Hospital size={15} /> {m.action.label}
                        </button>
                      )}
                      {m.action.type === 'view_remedies' && (
                        <button
                          onClick={() => {
                            if (onTriggerAction) onTriggerAction('remedies_40');
                            onClose();
                          }}
                          className="btn btn-primary"
                          style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem', background: '#059669' }}
                        >
                          <Sparkles size={15} /> {m.action.label}
                        </button>
                      )}
                      {m.action.type === 'view_triage' && (
                        <button
                          onClick={() => {
                            if (onTriggerAction) onTriggerAction('triage');
                            onClose();
                          }}
                          className="btn btn-primary"
                          style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}
                        >
                          <Activity size={15} /> {m.action.label}
                        </button>
                      )}
                      {m.action.type === 'view_asha' && (
                        <button
                          onClick={() => {
                            if (onTriggerAction) onTriggerAction('asha_suite');
                            onClose();
                          }}
                          className="btn"
                          style={{ background: '#be185d', color: 'white', padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}
                        >
                          <ShieldCheck size={15} /> {m.action.label}
                        </button>
                      )}
                    </div>
                  )}

                  {/* PostgreSQL Database Persistence Indicator */}
                  {isAi && m.consultationId && (
                    <div
                      onClick={() => {
                        if (onOpenDbViewer) onOpenDbViewer(m.consultationId);
                      }}
                      style={{
                        marginTop: '0.45rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontSize: '0.72rem',
                        color: '#0d9488',
                        fontWeight: '700',
                        background: '#f0fdf4',
                        padding: '0.25rem 0.6rem',
                        borderRadius: '6px',
                        width: 'fit-content',
                        border: '1px solid #bbf7d0',
                        cursor: onOpenDbViewer ? 'pointer' : 'default',
                        transition: 'all 0.15s ease'
                      }}
                      title="Click to view this record in PostgreSQL Database Inspector"
                    >
                      <Database size={13} />
                      <span>PostgreSQL DB Recorded: <strong>{m.consultationId}</strong></span>
                      <ExternalLink size={11} style={{ opacity: 0.7 }} />
                    </div>
                  )}
                </div>

                {/* Bubble Footer & Audio Speaker */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', color: '#94a3b8', padding: '0 0.4rem' }}>
                  <span>{m.time}</span>
                  {isAi && (
                    <button
                      onClick={() => speakText(m.text.replace(/[*#_]/g, ''))}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#0d9488',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px',
                        fontWeight: '700'
                      }}
                      title="Read out response"
                    >
                      <Volume2 size={13} /> {t('ai_listen_btn')}
                    </button>
                  )}
                </div>

                {/* Quick Follow-up Suggestions */}
                {isAi && m.quickSuggestions && m.quickSuggestions.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.2rem' }}>
                    {m.quickSuggestions.map((sug, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendQuery(sug)}
                        style={{
                          background: '#f1f5f9',
                          border: '1px solid #cbd5e1',
                          borderRadius: '8px',
                          padding: '0.3rem 0.65rem',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          color: '#334155',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {isTyping && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f8fafc', padding: '0.6rem 1rem', borderRadius: '12px', width: 'fit-content', border: '1px solid #e2e8f0' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0d9488', animation: 'ping 1s infinite' }} />
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>
                {t('ai_thinking')}
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Voice Input Active Banner */}
        {isListening && (
          <div style={{
            background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
            border: '1.5px solid #ef4444',
            borderRadius: '12px',
            padding: '0.65rem 1rem',
            marginBottom: '0.65rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            animation: 'pulseEmergency 1.5s infinite'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#991b1b' }}>
                {t('ai_mic_active_alert')}
              </span>
            </div>
            <button
              onClick={toggleSpeechRecognition}
              style={{ background: 'transparent', border: 'none', color: '#991b1b', fontWeight: '800', cursor: 'pointer', fontSize: '0.8rem' }}
            >
              {t('ai_stop_mic')}
            </button>
          </div>
        )}

        {/* Input Bar with Speech Recognition Mic */}
        <div style={{
          paddingTop: '0.75rem',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'center'
        }}>
          {/* Speech Mic Button */}
          <button
            onClick={toggleSpeechRecognition}
            className={`btn ${isListening ? 'btn-emergency' : 'btn-secondary'}`}
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              padding: 0,
              flexShrink: 0,
              borderColor: isListening ? '#ef4444' : '#0d9488',
              color: isListening ? 'white' : '#0d9488',
              background: isListening ? '#ef4444' : '#f0fdfa'
            }}
            title="Voice Commands"
          >
            {isListening ? <MicOff size={22} /> : <Mic size={22} />}
          </button>

          <input
            type="text"
            className="input-field"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendQuery();
            }}
            placeholder={t('ai_input_placeholder')}
            style={{ fontSize: '0.9rem' }}
          />

          <button
            onClick={() => handleSendQuery()}
            disabled={!inputQuery.trim()}
            className="btn btn-primary"
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              padding: 0,
              flexShrink: 0,
              opacity: inputQuery.trim() ? 1 : 0.6
            }}
          >
            <Send size={20} />
          </button>
        </div>

      </div>
    </div>
  );
}
