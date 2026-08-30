import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../utils/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  // Default to Marathi for Maharashtra rural context
  const [lang, setLang] = useState(() => localStorage.getItem('gramin_lang') || 'mr');
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    localStorage.setItem('gramin_lang', lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (key) => {
    const dict = translations[lang] || translations.mr;
    return dict[key] || translations.en[key] || key;
  };

  const speakText = (text) => {
    if (!('speechSynthesis' in window)) {
      alert("Text-to-Speech not supported in this browser.");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Choose appropriate voice
    const voices = window.speechSynthesis.getVoices();
    if (lang === 'mr') {
      const mrVoice = voices.find(v => v.lang.includes('mr') || v.lang.includes('hi'));
      if (mrVoice) utterance.voice = mrVoice;
      utterance.lang = 'mr-IN';
    } else if (lang === 'hi') {
      const hiVoice = voices.find(v => v.lang.includes('hi'));
      if (hiVoice) utterance.voice = hiVoice;
      utterance.lang = 'hi-IN';
    } else {
      utterance.lang = 'en-IN';
    }

    utterance.rate = 0.95; // Slightly slower for clear rural comprehension
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, speakText, stopSpeaking, isSpeaking }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
