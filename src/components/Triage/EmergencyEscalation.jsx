import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useNetwork } from '../../context/NetworkContext';
import VoiceAssistant from '../VoiceAssistant';
import {
  AlertTriangle,
  PhoneCall,
  Clock,
  ShieldAlert,
  Hospital,
  ArrowRight,
  MessageSquare,
  Activity
} from 'lucide-react';
import { saveToStore, getAllFromStore } from '../../utils/db';

export default function EmergencyEscalation({ onSelectHospitalFilter, onOpenSmsFallback }) {
  const { lang, t } = useLanguage();
  const { isOffline } = useNetwork();
  const [complications, setComplications] = useState([]);
  const [activeSOSModal, setActiveSOSModal] = useState(null);

  useEffect(() => {
    loadComplications();
  }, []);

  const loadComplications = async () => {
    try {
      if (!isOffline) {
        const res = await fetch('/api/complications');
        const data = await res.json();
        if (data.success && data.complications) {
          setComplications(data.complications);
          await saveToStore('complications', data.complications);
          return;
        }
      }
    } catch (e) {
      console.log("Complications offline fallback...");
    }

    try {
      const cached = await getAllFromStore('complications');
      if (cached && cached.length > 0) {
        setComplications(cached);
      }
    } catch (err) {
      console.warn("DB read err:", err);
    }
  };

  return (
    <div style={{ marginTop: '1.25rem' }}>
      <div style={{
        background: 'linear-gradient(135deg, #991b1b 0%, #b91c1c 100%)',
        color: 'white',
        borderRadius: '16px',
        padding: '1.5rem',
        marginBottom: '1.25rem',
        boxShadow: '0 10px 25px -5px rgba(185, 28, 28, 0.35)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <span className="badge" style={{ background: '#fee2e2', color: '#991b1b', marginBottom: '0.4rem' }}>
              <AlertTriangle size={13} /> {t('comp_title')}
            </span>
            <h2 style={{ fontSize: '1.35rem', fontWeight: '800', marginTop: '0.3rem' }}>
              {t('tab_complications_60')}
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#fecaca', marginTop: '0.2rem' }}>
              {t('comp_desc')}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <VoiceAssistant
              textToSpeak="६० टक्के गंभीर आजार आणि आपत्कालीन मार्गदर्शक. सर्पदंश, हृदयविकार, गरोदरपणातील अतिरक्तस्त्राव किंवा डोक्याला जबर मार लागल्यास गोल्डन अवर मध्ये तात्काळ १०८ रुग्णवाहिका बोलवा."
              label="आपत्कालीन सूचना ऐका"
            />
          </div>
        </div>
      </div>

      <div className="card-grid">
        {complications.map((comp) => {
          const title = lang === 'mr' ? comp.title_mr : lang === 'hi' ? comp.title_hi : comp.title_en;
          const protocols = comp.pre_hospital_protocol[lang] || comp.pre_hospital_protocol.mr || comp.pre_hospital_protocol.en;

          return (
            <div key={comp.id} className="panel panel-emergency" style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div>
                  <span className="badge badge-red" style={{ fontSize: '0.72rem', marginBottom: '0.3rem' }}>
                    <ShieldAlert size={12} /> {comp.severity_tier}
                  </span>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#991b1b' }}>
                    {title}
                  </h3>
                </div>

                <span style={{
                  background: '#fee2e2',
                  color: '#991b1b',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontWeight: '800',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Clock size={12} /> {comp.escalation_urgency}
                </span>
              </div>

              {/* Pre-Hospital Step-by-Step Protocol */}
              <div style={{
                background: '#ffffff',
                border: '1.5px solid #fecaca',
                borderRadius: '10px',
                padding: '0.85rem',
                marginBottom: '0.85rem'
              }}>
                <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#b91c1c', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertTriangle size={15} /> {t('pre_hospital_care')}
                </div>
                <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.85rem', color: '#1e293b', lineHeight: 1.5 }}>
                  {protocols.map((step, idx) => (
                    <li key={idx} style={{ marginBottom: '0.35rem' }}>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Facility Requirements */}
              <div style={{
                background: '#f8fafc',
                borderRadius: '8px',
                padding: '0.65rem 0.75rem',
                marginBottom: '1rem',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#334155' }}>
                  {t('critical_facility_needed')}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#0d9488', fontWeight: '700', marginTop: '0.2rem' }}>
                  {comp.required_specialty}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <a
                  href={`tel:${comp.ambulance_code}`}
                  className="btn btn-emergency"
                  style={{ fontSize: '0.82rem', padding: '0.55rem', justifyContent: 'center' }}
                >
                  <PhoneCall size={15} /> {t('call_108_btn')}
                </a>

                <button
                  onClick={() => {
                    if (onSelectHospitalFilter) {
                      onSelectHospitalFilter({ emergencyOnly: true, specialty: comp.required_specialty });
                    }
                  }}
                  className="btn btn-primary"
                  style={{ fontSize: '0.82rem', padding: '0.55rem', justifyContent: 'center' }}
                >
                  <Hospital size={15} /> {t('reserve_bed')}
                </button>
              </div>

              {/* Zero-Internet SMS trigger */}
              <button
                onClick={() => {
                  if (onOpenSmsFallback) {
                    onOpenSmsFallback(comp.offline_sms_format);
                  }
                }}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  color: '#64748b',
                  fontSize: '0.76rem',
                  fontWeight: '700',
                  marginTop: '0.6rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}
              >
                <MessageSquare size={13} /> इंटरनेट नसेल तर SMS कोड पाठवा (Zero Data SMS)
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
