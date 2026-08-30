import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useNetwork } from '../../context/NetworkContext';
import VoiceAssistant from '../VoiceAssistant';
import {
  Sparkles,
  ShieldCheck,
  AlertOctagon,
  Clock,
  Pill,
  Leaf,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { saveToStore, getAllFromStore } from '../../utils/db';

export default function OfflineRemedies({ filterSymptom }) {
  const { lang, t } = useLanguage();
  const { isOffline } = useNetwork();
  const [remedies, setRemedies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRemedies();
  }, []);

  const loadRemedies = async () => {
    try {
      // First try fetching from API if online
      if (!isOffline) {
        const res = await fetch('/api/remedies');
        const data = await res.json();
        if (data.success && data.remedies) {
          setRemedies(data.remedies);
          await saveToStore('remedies', data.remedies);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.log("Fetching remedies offline fallback...");
    }

    // Load from IndexedDB
    try {
      const cached = await getAllFromStore('remedies');
      if (cached && cached.length > 0) {
        setRemedies(cached);
      }
    } catch (err) {
      console.warn("DB read err:", err);
    } finally {
      setLoading(false);
    }
  };

  const displayedRemedies = filterSymptom
    ? remedies.filter((r) => r.symptoms.includes(filterSymptom))
    : remedies;

  return (
    <div style={{ marginTop: '1.25rem' }}>
      <div style={{
        background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)',
        color: 'white',
        borderRadius: '16px',
        padding: '1.5rem',
        marginBottom: '1.25rem',
        boxShadow: '0 10px 25px -5px rgba(6, 95, 70, 0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <span className="badge" style={{ background: '#d1fae5', color: '#065f46', marginBottom: '0.4rem' }}>
              <Sparkles size={13} /> {t('remedy_title')}
            </span>
            <h2 style={{ fontSize: '1.35rem', fontWeight: '800', marginTop: '0.3rem' }}>
              {t('tab_remedies_40')}
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#a7f3d0', marginTop: '0.2rem' }}>
              {t('remedy_desc')}
            </p>
          </div>

          <VoiceAssistant
            textToSpeak="४० टक्के सामान्य आजारांवर घरगुती काढे व प्रथमोपचार. ताप, जुलाब, डिहायड्रेशन, उन्हाचा झटका आणि किरकोळ जखमांवर संपूर्ण माहिती येथे उपलब्ध आहे."
            label="सर्व उपचार ऐका"
          />
        </div>
      </div>

      <div className="card-grid">
        {displayedRemedies.map((rem) => {
          const title = lang === 'mr' ? rem.title_mr : lang === 'hi' ? rem.title_hi : rem.title_en;
          const firstAid = rem.immediate_first_aid[lang] || rem.immediate_first_aid.mr;
          const warningSign = lang === 'mr' ? rem.warning_signs_mr : rem.warning_signs_en;
          const audioSpeech = `${title}. तातडीचा प्रथमोपचार: ${firstAid}. खबरदारी: ${warningSign}`;

          return (
            <div key={rem.id} className="panel panel-remedy" style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div>
                  <span className="badge badge-green" style={{ fontSize: '0.72rem', marginBottom: '0.3rem' }}>
                    <CheckCircle size={12} /> {rem.severity_tier}
                  </span>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#065f46' }}>
                    {title}
                  </h3>
                </div>

                <VoiceAssistant textToSpeak={audioSpeech} label="ऐका" />
              </div>

              {/* Immediate First Aid */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #bbf7d0',
                borderRadius: '10px',
                padding: '0.85rem',
                marginBottom: '0.85rem'
              }}>
                <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#15803d', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '0.25rem' }}>
                  <ShieldCheck size={15} /> {t('first_aid_immediate')}
                </div>
                <p style={{ fontSize: '0.88rem', color: '#1e293b', lineHeight: 1.45 }}>
                  {firstAid}
                </p>
              </div>

              {/* Ayurvedic / Herbal Kadha */}
              {rem.ayurvedic_home_remedies && (
                <div style={{ marginBottom: '0.85rem' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#047857', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '0.4rem' }}>
                    <Leaf size={15} /> {t('kadha_prep')}
                  </div>
                  {rem.ayurvedic_home_remedies.map((herb, idx) => (
                    <div key={idx} style={{
                      background: '#f8fafc',
                      borderRadius: '8px',
                      padding: '0.65rem 0.75rem',
                      marginBottom: '0.4rem',
                      border: '1px solid #e2e8f0'
                    }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0f172a' }}>
                        {lang === 'mr' ? herb.name_mr : herb.name_en}
                      </div>
                      <p style={{ fontSize: '0.82rem', color: '#334155', marginTop: '0.2rem' }}>
                        {lang === 'mr' ? herb.instructions_mr : herb.instructions_en}
                      </p>
                      <div style={{ fontSize: '0.74rem', color: '#0d9488', fontWeight: '600', marginTop: '0.25rem' }}>
                        {t('dosage_label')} {herb.dosage}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Safe OTC Medicines */}
              <div style={{
                background: '#f1f5f9',
                borderRadius: '8px',
                padding: '0.65rem 0.75rem',
                marginBottom: '0.85rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem'
              }}>
                <Pill size={16} style={{ color: '#0284c7', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#0369a1' }}>
                    {t('otc_dose')}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#1e293b' }}>
                    {rem.otc_guidance}
                  </div>
                </div>
              </div>

              {/* Red Flag Warning */}
              <div style={{
                background: '#fff1f2',
                border: '1px solid #fecdd3',
                borderRadius: '8px',
                padding: '0.65rem 0.75rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem'
              }}>
                <AlertOctagon size={16} style={{ color: '#e11d48', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#be123c' }}>
                    {t('red_flag')}
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#881337', marginTop: '0.15rem' }}>
                    {warningSign}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
