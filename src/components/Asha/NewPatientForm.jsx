import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useNetwork } from '../../context/NetworkContext';
import {
  UserPlus,
  Heart,
  Baby,
  Activity,
  AlertTriangle,
  X,
  CheckCircle,
  Save
} from 'lucide-react';

export default function NewPatientForm({ onClose, onPatientAdded }) {
  const { lang, t } = useLanguage();
  const { queueOfflineAshaRecord } = useNetwork();

  const [village, setVillage] = useState('Trimbak Pada No. 3');
  const [patientName, setPatientName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Female');
  const [category, setCategory] = useState('High-Risk Pregnancy');
  const [gestationalWeek, setGestationalWeek] = useState('28');
  const [hbLevel, setHbLevel] = useState('8.8 gm/dL');
  const [bp, setBp] = useState('130/90 mmHg');
  const [weight, setWeight] = useState('48 kg');
  const [notes, setNotes] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!patientName || !age) return;

    setLoading(true);
    const newRecord = {
      id: 'asha-rec-' + Date.now(),
      village,
      patient_name: patientName,
      age: parseInt(age),
      gender,
      category,
      gestational_week: category === 'High-Risk Pregnancy' ? parseInt(gestationalWeek) : null,
      hb_level: hbLevel,
      bp: bp,
      weight: weight,
      notes,
      created_at: new Date().toISOString(),
      status: 'Pending Sync (Offline)'
    };

    await queueOfflineAshaRecord(newRecord);
    setLoading(false);
    setSavedSuccess(true);

    if (onPatientAdded) {
      onPatientAdded(newRecord);
    }

    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <span className="badge" style={{ background: '#fdf2f8', color: '#db2777', border: '1px solid #fbcfe8', marginBottom: '0.35rem' }}>
              <UserPlus size={12} /> आशा सेविका डिजिटल नोंद (ASHA Intake)
            </span>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>
              {t('register_new_patient')}
            </h2>
            <p style={{ fontSize: '0.78rem', color: '#64748b' }}>
              इंटरनेट नसले तरी डेटा स्थानिक मेमरीमध्ये सुरक्षित राहतो.
            </p>
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

        {savedSuccess ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: '#dcfce7',
              color: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto'
            }}>
              <CheckCircle size={30} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a' }}>
              {t('save_success_title')}
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#047857', marginTop: '0.3rem' }}>
              {t('save_success_desc')}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginBottom: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.25rem' }}>
                  {t('village_pada_label')}
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.25rem' }}>
                  {t('patient_category_label')}
                </label>
                <select
                  className="input-field"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="High-Risk Pregnancy">{t('cat_high_risk_preg')}</option>
                  <option value="Child Immunization & Malnutrition">{t('cat_child_health')}</option>
                  <option value="Elderly Chronic Illness">{t('cat_elderly_chronic')}</option>
                  <option value="General Health Survey">{t('cat_general_survey')}</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.65rem', marginBottom: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.25rem' }}>
                  {t('patient_name_label')}
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.25rem' }}>
                  {t('age_label')}
                </label>
                <input
                  type="number"
                  className="input-field"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="24"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.25rem' }}>
                  {t('gender_label')}
                </label>
                <select
                  className="input-field"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="Female">{t('gender_female')}</option>
                  <option value="Male">{t('gender_male')}</option>
                  <option value="Child">{t('gender_child')}</option>
                </select>
              </div>
            </div>

            {/* Health Vitals */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '0.75rem',
              marginBottom: '0.85rem'
            }}>
              <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#0d9488', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Activity size={14} /> {t('clinical_vitals_title')}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.5rem' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{t('bp_label')}</span>
                  <input
                    type="text"
                    className="input-field"
                    value={bp}
                    onChange={(e) => setBp(e.target.value)}
                    style={{ padding: '0.4rem 0.6rem', fontSize: '0.82rem' }}
                  />
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{t('hb_label')}</span>
                  <input
                    type="text"
                    className="input-field"
                    value={hbLevel}
                    onChange={(e) => setHbLevel(e.target.value)}
                    style={{ padding: '0.4rem 0.6rem', fontSize: '0.82rem' }}
                  />
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{t('weight_label')}</span>
                  <input
                    type="text"
                    className="input-field"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    style={{ padding: '0.4rem 0.6rem', fontSize: '0.82rem' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.25rem' }}>
                {t('clinical_notes_label')}
              </label>
              <textarea
                className="input-field"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-asha"
              style={{ width: '100%', padding: '0.75rem' }}
            >
              <Save size={16} />
              {loading ? '...' : t('save_offline_btn')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
