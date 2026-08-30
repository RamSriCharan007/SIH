import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { X, CheckCircle, ShieldCheck, IndianRupee, Info } from 'lucide-react';

export default function CostBreakdownModal({ hospital, onClose }) {
  const { lang, t } = useLanguage();

  if (!hospital) return null;

  const { cost_range, schemes, type, tier } = hospital;
  const isGovt = type === 'Government';
  const hospName = lang === 'mr' ? hospital.name_mr : lang === 'hi' ? (hospital.name_hi || hospital.name) : hospital.name;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <span className={`badge ${isGovt ? 'badge-green' : 'badge-amber'}`} style={{ marginBottom: '0.35rem' }}>
              {isGovt ? t('filter_govt') : `Private • ${tier}`}
            </span>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>
              {hospName}
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
              {t('cost_modal_subtitle')}
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

        {/* Cost Table */}
        <div style={{
          background: '#f8fafc',
          border: '1.5px solid #e2e8f0',
          borderRadius: '12px',
          overflow: 'hidden',
          marginBottom: '1.25rem'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1', textAlign: 'left' }}>
                <th style={{ padding: '0.75rem 1rem', color: '#334155', fontWeight: '700' }}>{t('table_service_col')}</th>
                <th style={{ padding: '0.75rem 1rem', color: '#0d9488', fontWeight: '800', textAlign: 'right' }}>{t('table_cost_col')}</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '0.75rem 1rem', color: '#1e293b' }}>{t('opd_consultation')}</td>
                <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: '800', color: isGovt ? '#15803d' : '#0f172a' }}>
                  {cost_range.opd === 0 ? t('free_govt_scheme') : `₹${cost_range.opd}`}
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '0.75rem 1rem', color: '#1e293b' }}>{t('general_bed_daily')}</td>
                <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: '800', color: isGovt ? '#15803d' : '#0f172a' }}>
                  {cost_range.general_bed_day === 0 ? t('free_govt_scheme') : `₹${cost_range.general_bed_day}${t('per_day_suffix')}`}
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '0.75rem 1rem', color: '#1e293b' }}>{t('icu_bed_daily')}</td>
                <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: '800', color: isGovt ? '#15803d' : '#0f172a' }}>
                  {cost_range.icu_bed_day === 0 ? t('free_govt_scheme') : `₹${cost_range.icu_bed_day}${t('per_day_suffix')}`}
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '0.75rem 1rem', color: '#1e293b' }}>{t('normal_delivery_cost')}</td>
                <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: '800', color: isGovt ? '#15803d' : '#0f172a' }}>
                  {cost_range.delivery_normal === 0 ? t('janani_scheme_free') : `₹${cost_range.delivery_normal}`}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '0.75rem 1rem', color: '#1e293b' }}>{t('csection_delivery_cost')}</td>
                <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: '800', color: isGovt ? '#15803d' : '#0f172a' }}>
                  {cost_range.delivery_csection === 0 ? t('mjpjay_free') : `₹${cost_range.delivery_csection}`}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Accepted Schemes */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={15} style={{ color: '#0d9488' }} /> {t('schemes_applicable_title')}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {schemes.map((s, idx) => (
              <span key={idx} className="badge badge-green" style={{ fontSize: '0.78rem' }}>
                <CheckCircle size={12} /> {s}
              </span>
            ))}
          </div>
        </div>

        <div style={{
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '10px',
          padding: '0.75rem 0.9rem',
          fontSize: '0.82rem',
          color: '#1e40af',
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'flex-start'
        }}>
          <Info size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>
            {t('ration_card_benefit_note')}
          </span>
        </div>

        <div style={{ marginTop: '1.25rem', textAlign: 'right' }}>
          <button onClick={onClose} className="btn btn-primary" style={{ width: '100%' }}>
            {t('close_btn')}
          </button>
        </div>
      </div>
    </div>
  );
}
