import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  Thermometer,
  Droplets,
  Sun,
  Bandage,
  Activity,
  AlertTriangle,
  HeartCrack,
  Baby,
  CheckCircle2,
  Sparkles,
  RefreshCw
} from 'lucide-react';

const SYMPTOM_OPTIONS = [
  // 40% Offline Common / Mild
  { id: 'fever_mild', icon: Thermometer, type: 'mild', titleKey: 'fever_mild', tag: '४०% घरगुती उपचार' },
  { id: 'loose_motion', icon: Droplets, type: 'mild', titleKey: 'loose_motion', tag: '४०% ओआरएस/पेज' },
  { id: 'heat_stroke', icon: Sun, type: 'mild', titleKey: 'heat_stroke', tag: '४०% कैरी पन्हे' },
  { id: 'cut_minor', icon: Bandage, type: 'mild', titleKey: 'cut_minor', tag: '४०% हळद/मलम' },
  { id: 'acidity', icon: Activity, type: 'mild', titleKey: 'acidity', tag: '४०% ओवा-हिंग' },

  // 60% Severe / Major Complications
  { id: 'snake_bite', icon: AlertTriangle, type: 'severe', titleKey: 'snake_bite', tag: '६०% तातडीचा धोका (RED)' },
  { id: 'chest_pain_severe', icon: HeartCrack, type: 'severe', titleKey: 'chest_pain_severe', tag: '६०% हृदयविकार (RED)' },
  { id: 'maternal_bleeding', icon: Baby, type: 'severe', titleKey: 'maternal_bleeding', tag: '६०% प्रसूती धोका (ORANGE)' },
  { id: 'head_injury', icon: AlertTriangle, type: 'severe', titleKey: 'head_injury', tag: '६०% डोक्याला मार (RED)' },
];

export default function SymptomChecker({ onSelectResult }) {
  const { t } = useLanguage();
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [triageResult, setTriageResult] = useState(null);

  const toggleSymptom = (id) => {
    if (selectedSymptoms.includes(id)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== id));
    } else {
      setSelectedSymptoms([...selectedSymptoms, id]);
    }
  };

  const handleEvaluate = () => {
    if (selectedSymptoms.length === 0) return;

    // Check if any severe symptoms are picked
    const hasSevere = selectedSymptoms.some((s) =>
      SYMPTOM_OPTIONS.find((opt) => opt.id === s && opt.type === 'severe')
    );

    if (hasSevere) {
      // 60% Major Complication Triage
      const result = {
        tier: '60_complication',
        severity: 'Critical Emergency (६०% गंभीर आजार)',
        action: 'Immediate Hospital Referral & Pre-Hospital Protocol',
        symptoms: selectedSymptoms
      };
      setTriageResult(result);
      if (onSelectResult) onSelectResult(result);
    } else {
      // 40% Mild Offline Remedy
      const result = {
        tier: '40_remedy',
        severity: 'Mild / Manageable (४०% घरगुती उपचार)',
        action: 'Offline Verified Kadha & Safe OTC Guidance',
        symptoms: selectedSymptoms
      };
      setTriageResult(result);
      if (onSelectResult) onSelectResult(result);
    }
  };

  const resetAll = () => {
    setSelectedSymptoms([]);
    setTriageResult(null);
    if (onSelectResult) onSelectResult(null);
  };

  return (
    <div className="panel" style={{ marginTop: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>
            {t('triage_heading')}
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>
            {t('triage_subheading')}
          </p>
        </div>

        {selectedSymptoms.length > 0 && (
          <button
            onClick={resetAll}
            className="btn btn-secondary"
            style={{ fontSize: '0.78rem', padding: '0.35rem 0.65rem' }}
          >
            <RefreshCw size={13} /> {t('clear_btn')}
          </button>
        )}
      </div>

      <div style={{ marginBottom: '1.25rem' }}>
        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '0.6rem' }}>
          {t('select_symptoms')}
        </label>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '0.75rem'
        }}>
          {SYMPTOM_OPTIONS.map((opt) => {
            const isSelected = selectedSymptoms.includes(opt.id);
            const Icon = opt.icon;
            const isSevere = opt.type === 'severe';

            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => toggleSymptom(opt.id)}
                style={{
                  padding: '0.85rem',
                  borderRadius: '12px',
                  border: isSelected
                    ? isSevere
                      ? '2px solid #ef4444'
                      : '2px solid #0d9488'
                    : '1.5px solid #e2e8f0',
                  background: isSelected
                    ? isSevere
                      ? '#fef2f2'
                      : '#f0fdfa'
                    : 'white',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.06)' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: isSevere ? '#fee2e2' : '#ccfbf1',
                    color: isSevere ? '#dc2626' : '#0d9488',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Icon size={18} />
                  </div>

                  {isSelected && (
                    <CheckCircle2 size={18} style={{ color: isSevere ? '#dc2626' : '#0d9488' }} />
                  )}
                </div>

                <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#1e293b' }}>
                  {t(opt.titleKey)}
                </div>

                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: '600',
                  color: isSevere ? '#b91c1c' : '#047857',
                  background: isSevere ? '#fee2e2' : '#d1fae5',
                  padding: '0.15rem 0.45rem',
                  borderRadius: '6px',
                  display: 'inline-block',
                  marginTop: '0.35rem'
                }}>
                  {opt.tag}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <button
          onClick={handleEvaluate}
          disabled={selectedSymptoms.length === 0}
          className="btn btn-primary"
          style={{
            padding: '0.7rem 1.4rem',
            fontSize: '0.95rem',
            opacity: selectedSymptoms.length === 0 ? 0.6 : 1,
            cursor: selectedSymptoms.length === 0 ? 'not-allowed' : 'pointer'
          }}
        >
          <Sparkles size={18} /> {t('check_btn')} ({selectedSymptoms.length} निवडले)
        </button>
      </div>

      {triageResult && (
        <div style={{
          marginTop: '1.25rem',
          padding: '1rem 1.25rem',
          borderRadius: '14px',
          background: triageResult.tier === '60_complication' ? '#fef2f2' : '#f0fdf4',
          border: `1.5px solid ${triageResult.tier === '60_complication' ? '#fca5a5' : '#86efac'}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span className={`badge ${triageResult.tier === '60_complication' ? 'badge-red' : 'badge-green'}`} style={{ fontSize: '0.82rem' }}>
              {triageResult.severity}
            </span>
            <span style={{ fontSize: '0.88rem', fontWeight: '700', color: '#1e293b' }}>
              {triageResult.action}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
