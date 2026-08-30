import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Volume2, VolumeX } from 'lucide-react';

export default function VoiceAssistant({ textToSpeak, label }) {
  const { speakText, stopSpeaking, isSpeaking, lang } = useLanguage();

  const handleToggle = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speakText(textToSpeak);
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={`btn ${isSpeaking ? 'btn-emergency' : 'btn-secondary'}`}
      style={{
        padding: '0.35rem 0.65rem',
        fontSize: '0.78rem',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px'
      }}
      title="मराठी/हिंदी आवाज सहाय्यक (Read aloud)"
    >
      {isSpeaking ? (
        <>
          <VolumeX size={14} />
          <span>आवाज थांबवा</span>
        </>
      ) : (
        <>
          <Volume2 size={14} style={{ color: '#0d9488' }} />
          <span>{label || 'ऐका (Listen)'}</span>
        </>
      )}
    </button>
  );
}
