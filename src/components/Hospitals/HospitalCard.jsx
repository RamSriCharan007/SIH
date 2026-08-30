import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  Hospital,
  MapPin,
  Clock,
  UserCheck,
  Bed,
  Droplet,
  ShieldCheck,
  PhoneCall,
  IndianRupee,
  Ticket,
  Activity,
  Syringe,
  Video
} from 'lucide-react';

export default function HospitalCard({
  hospital,
  onViewCost,
  onBookToken,
  onVideoCall,
  selectedBlood
}) {
  const { lang, t } = useLanguage();

  const {
    name,
    name_mr,
    type,
    tier,
    district,
    taluka,
    distance_km,
    travel_time_mins,
    contact,
    live_status,
    schemes
  } = hospital;

  const isGovt = type === 'Government';
  const doc = live_status.doctor_on_duty;
  const beds = live_status.beds;
  const blood = live_status.blood_stock;
  const med = live_status.medicines_stock;

  const hospName = lang === 'mr' ? name_mr : lang === 'hi' ? (hospital.name_hi || name) : name;
  const docName = lang === 'mr' ? doc.name_mr : doc.name;

  return (
    <div className="panel glass-card-hover" style={{ position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        {/* Top Badges */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
            <span className={`badge ${isGovt ? 'badge-green' : 'badge-amber'}`}>
              {isGovt ? t('filter_govt') : `Private • ${tier}`}
            </span>
            <span className="badge badge-blue">
              <MapPin size={11} /> {district} • {distance_km} km ({travel_time_mins} min)
            </span>
          </div>

          <span style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.72rem',
            color: '#059669',
            fontWeight: '700'
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
            {t('live_status_badge')}
          </span>
        </div>

        {/* Hospital Title */}
        <h3 style={{ fontSize: '1.18rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.2rem' }}>
          {hospName}
        </h3>
        <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '0.85rem' }}>
          {t('taluka_label')}: {taluka} • {t('service_24x7')}
        </p>

        {/* Live Doctor on Duty (PS-2 Solution) */}
        <div style={{
          background: '#f0fdfa',
          border: '1px solid #99f6e4',
          borderRadius: '10px',
          padding: '0.65rem 0.8rem',
          marginBottom: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: '#0d9488',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <UserCheck size={16} />
          </div>
          <div>
            <div style={{ fontSize: '0.74rem', color: '#0f766e', fontWeight: '700' }}>
              {t('doctor_on_duty')}
            </div>
            <div style={{ fontSize: '0.86rem', fontWeight: '800', color: '#0f172a' }}>
              {docName} ({doc.speciality})
            </div>
            <div style={{ fontSize: '0.72rem', color: doc.status === 'Available' ? '#15803d' : '#b45309', fontWeight: '600' }}>
              ● {doc.status} • {doc.next_shift}
            </div>
          </div>
        </div>

        {/* Live Beds Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.5rem',
          marginBottom: '0.75rem'
        }}>
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '0.6rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700' }}>
              {t('general_beds')}
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0d9488' }}>
              {beds.general_available} <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>/ {beds.general_total}</span>
            </div>
          </div>

          <div style={{
            background: beds.icu_available > 0 ? '#fef2f2' : '#f8fafc',
            border: `1px solid ${beds.icu_available > 0 ? '#fca5a5' : '#e2e8f0'}`,
            borderRadius: '8px',
            padding: '0.6rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.72rem', color: beds.icu_available > 0 ? '#b91c1c' : '#64748b', fontWeight: '700' }}>
              {t('icu_beds')}
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: '800', color: beds.icu_available > 0 ? '#dc2626' : '#64748b' }}>
              {beds.icu_available} <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>/ {beds.icu_total}</span>
            </div>
          </div>
        </div>

        {/* Live Blood & Critical Medicines (Anti-venom) */}
        <div style={{
          background: '#fffbeb',
          border: '1px solid #fde68a',
          borderRadius: '8px',
          padding: '0.65rem 0.75rem',
          marginBottom: '0.85rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: '700', color: '#92400e', marginBottom: '0.35rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Droplet size={13} style={{ color: '#dc2626' }} /> {t('blood_units_label')}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Syringe size={13} style={{ color: '#0d9488' }} /> {t('anti_venom_label')} <strong>{med.anti_venom_vials} {t('bottles_suffix')}</strong>
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            <span className="badge" style={{ background: 'white', border: '1px solid #fcd34d', color: '#78350f', fontSize: '0.72rem' }}>
              O+ : {blood.O_pos} {t('units_suffix')}
            </span>
            <span className="badge" style={{ background: 'white', border: '1px solid #fcd34d', color: '#78350f', fontSize: '0.72rem' }}>
              A+ : {blood.A_pos} {t('units_suffix')}
            </span>
            <span className="badge" style={{ background: 'white', border: '1px solid #fcd34d', color: '#78350f', fontSize: '0.72rem' }}>
              B+ : {blood.B_pos} {t('units_suffix')}
            </span>
            <span className="badge" style={{ background: 'white', border: '1px solid #fcd34d', color: '#78350f', fontSize: '0.72rem' }}>
              O- : {blood.O_neg} {t('units_suffix')}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ marginTop: '0.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <button
            onClick={() => onViewCost(hospital)}
            className="btn btn-secondary"
            style={{ fontSize: '0.78rem', padding: '0.5rem' }}
          >
            <IndianRupee size={14} /> {t('view_cost')}
          </button>

          <button
            onClick={() => onBookToken(hospital)}
            className="btn btn-primary"
            style={{ fontSize: '0.78rem', padding: '0.5rem' }}
          >
            <Ticket size={14} /> {t('reserve_bed')}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          <button
            onClick={() => onVideoCall && onVideoCall({
              name: hospital.doctor_on_duty?.name || 'On-Duty Medical Officer',
              speciality: hospital.doctor_on_duty?.speciality || 'General Medicine',
              hospital: hospital.name,
              status: 'Available (Emergency Ward)'
            })}
            className="btn"
            style={{
              fontSize: '0.78rem',
              padding: '0.45rem',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: 'white',
              justifyContent: 'center'
            }}
          >
            <Video size={14} /> {t('video_call_btn')}
          </button>

          <a
            href={`tel:${contact}`}
            className="btn btn-secondary"
            style={{ fontSize: '0.78rem', padding: '0.45rem', justifyContent: 'center', borderColor: '#99f6e4', color: '#0f766e' }}
          >
            <PhoneCall size={14} /> {t('call_hospital')}
          </a>
        </div>
      </div>
    </div>
  );
}
