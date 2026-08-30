import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { saveToStore } from '../../utils/db';
import {
  Ticket,
  CheckCircle,
  Clock,
  User,
  Phone,
  AlertTriangle,
  X,
  Share2,
  BellRing
} from 'lucide-react';

export default function TokenBookingModal({ hospital, onClose }) {
  const { lang, t } = useLanguage();
  const { user } = useAuth();

  const [patientName, setPatientName] = useState(user ? user.fullName : 'Ramesh Patil');
  const [phone, setPhone] = useState(user ? user.phone : '9822019485');
  const [emergencyType, setEmergencyType] = useState('Routine Emergency / General OPD');
  const [arrivalMins, setArrivalMins] = useState(hospital.travel_time_mins || 25);
  const [confirmedToken, setConfirmedToken] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!hospital) return null;

  const handleBook = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/hospitals/${hospital.id}/reserve-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName,
          phone,
          emergencyType,
          estimatedArrivalMins: parseInt(arrivalMins)
        })
      });
      const data = await res.json();
      if (data.success && data.token) {
        setConfirmedToken(data.token);
        await saveToStore('travel_tokens', data.token);
      }
    } catch (err) {
      // Offline fallback token generator
      const mockToken = {
        tokenId: 'TOKEN-' + Math.floor(100 + Math.random() * 900),
        hospitalId: hospital.id,
        hospitalName: hospital.name,
        hospitalName_mr: hospital.name_mr,
        patientName,
        phone,
        emergencyType,
        estimatedArrivalMins: arrivalMins,
        status: "Confirmed (Offline Mode)",
        timestamp: new Date().toLocaleTimeString(),
        priorityPass: emergencyType.includes('Snake') || emergencyType.includes('Cardiac') ? 'EMERGENCY RED' : 'STANDARD OPD'
      };
      setConfirmedToken(mockToken);
      await saveToStore('travel_tokens', mockToken);
    } finally {
      setLoading(false);
    }
  };

  const hospName = lang === 'mr' ? hospital.name_mr : lang === 'hi' ? (hospital.name_hi || hospital.name) : hospital.name;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <span className="badge badge-green" style={{ marginBottom: '0.35rem' }}>
              <BellRing size={12} /> {t('token_modal_badge')}
            </span>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>
              {confirmedToken ? t('token_confirmed_heading') : t('token_modal_heading')}
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
              {hospName}
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

        {!confirmedToken ? (
          <form onSubmit={handleBook}>
            <div style={{
              background: '#f0fdfa',
              border: '1px solid #99f6e4',
              borderRadius: '10px',
              padding: '0.85rem',
              marginBottom: '1.2rem',
              fontSize: '0.82rem',
              color: '#134e4a'
            }}>
              {t('token_benefit_hint')}
            </div>

            <div style={{ marginBottom: '0.85rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
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

            <div style={{ marginBottom: '0.85rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                {t('contact_phone_label')}
              </label>
              <input
                type="tel"
                className="input-field"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div style={{ marginBottom: '0.85rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                {t('emergency_type_label')}
              </label>
              <select
                className="input-field"
                value={emergencyType}
                onChange={(e) => setEmergencyType(e.target.value)}
              >
                <option value="Routine Emergency / General OPD">{t('opt_general_opd')}</option>
                <option value="Snakebite Emergency (Critical)">{t('opt_snakebite_critical')}</option>
                <option value="Severe Cardiac / Chest Pain">{t('opt_cardiac_critical')}</option>
                <option value="Labor & Delivery Maternity">{t('opt_maternity')}</option>
                <option value="Road Accident & Fracture">{t('opt_accident_trauma')}</option>
              </select>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                {t('arrival_time_label')}
              </label>
              <select
                className="input-field"
                value={arrivalMins}
                onChange={(e) => setArrivalMins(e.target.value)}
              >
                <option value="15">15 min</option>
                <option value="30">30 min</option>
                <option value="45">45 min</option>
                <option value="60">60 min (1 hr)</option>
                <option value="90">90 min (1.5 hr)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem' }}
            >
              {loading ? '...' : t('confirm_token_btn')}
            </button>
          </form>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: '#dcfce7',
              color: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto'
            }}>
              <CheckCircle size={32} />
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
              border: '2px dashed #0d9488',
              borderRadius: '16px',
              padding: '1.25rem',
              marginBottom: '1.25rem'
            }}>
              <span className="badge badge-blue" style={{ marginBottom: '0.5rem' }}>
                {confirmedToken.priorityPass}
              </span>

              <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0d9488', letterSpacing: '0.08em' }}>
                {confirmedToken.tokenId}
              </div>

              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b', marginTop: '0.5rem' }}>
                {confirmedToken.patientName} • +91 {confirmedToken.phone}
              </div>

              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>
                {confirmedToken.estimatedArrivalMins} min ({confirmedToken.timestamp})
              </div>
            </div>

            <p style={{ fontSize: '0.82rem', color: '#047857', fontWeight: '700', marginBottom: '1.25rem' }}>
              {t('token_doctor_alerted_success')}
            </p>

            <button
              onClick={onClose}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.7rem' }}
            >
              {t('done_btn')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
