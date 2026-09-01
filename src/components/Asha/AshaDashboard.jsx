import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useNetwork } from '../../context/NetworkContext';
import { useAuth } from '../../context/AuthContext';
import NewPatientForm from './NewPatientForm';
import VoiceAssistant from '../VoiceAssistant';
import { getAllFromStore } from '../../utils/db';
import {
  ShieldCheck,
  UserPlus,
  RefreshCw,
  Baby,
  Heart,
  AlertTriangle,
  Clock,
  CheckCircle,
  FileText,
  MapPin,
  Activity
} from 'lucide-react';

export default function AshaDashboard() {
  const { lang, t } = useLanguage();
  const { isOffline, offlineQueueCount, triggerSync, isSyncing } = useNetwork();
  const { user } = useAuth();

  const [records, setRecords] = useState([]);
  const [offlineQueue, setOfflineQueue] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    loadAshaData();
  }, [offlineQueueCount]);

  const loadAshaData = async () => {
    // 1. Load offline queue from IndexedDB
    try {
      const queue = await getAllFromStore('asha_queue');
      setOfflineQueue(queue);
    } catch (e) {
      console.warn("Queue read err:", e);
    }

    // 2. Load synced records from server if online
    try {
      if (!isOffline) {
        const res = await fetch('/api/sync/asha-records', {
          headers: {
            'x-user-role': user?.role || 'asha',
            'x-user-phone': user?.phone || '9822019485'
          }
        });
        const data = await res.json();
        if (data.success && data.records) {
          setRecords(data.records);
        }
      }
    } catch (e) {
      console.log("Server records offline fallback");
    }
  };

  const allRecords = [...offlineQueue, ...records];

  const filteredRecords = filterCategory === 'all'
    ? allRecords
    : allRecords.filter(r => r.category === filterCategory);

  return (
    <div style={{ marginTop: '1.25rem' }}>
      {/* Header Panel */}
      <div style={{
        background: 'linear-gradient(135deg, #831843 0%, #be185d 100%)',
        color: 'white',
        borderRadius: '16px',
        padding: '1.5rem',
        marginBottom: '1.25rem',
        boxShadow: '0 10px 25px -5px rgba(190, 24, 93, 0.35)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
              <span className="badge" style={{ background: '#fdf2f8', color: '#be185d' }}>
                <ShieldCheck size={13} /> {user?.asha_badge_no || 'MH-NSK-ASHA-409'}
              </span>
              <span style={{ fontSize: '0.78rem', color: '#fbcfe8' }}>
                त्र्यंबकेश्वर - नाशिक ग्रामीण कार्यक्षेत्र
              </span>
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: '800' }}>
              {t('asha_title')}
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#fbcfe8', marginTop: '0.2rem' }}>
              {t('asha_subtitle')}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setIsFormOpen(true)}
              className="btn"
              style={{ background: 'white', color: '#831843', fontWeight: '800' }}
            >
              <UserPlus size={16} /> {t('register_new_patient')}
            </button>

            <button
              onClick={triggerSync}
              disabled={isSyncing || isOffline || offlineQueue.length === 0}
              className="btn"
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                cursor: (isOffline || offlineQueue.length === 0) ? 'not-allowed' : 'pointer'
              }}
            >
              <RefreshCw size={15} className={isSyncing ? 'animate-spin' : ''} />
              {t('sync_now')} ({offlineQueue.length})
            </button>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '0.85rem',
        marginBottom: '1.25rem'
      }}>
        <div className="panel" style={{ padding: '1rem', borderLeft: '4px solid #be185d' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700' }}>{t('total_patient_logs')}</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', marginTop: '0.2rem' }}>
            {allRecords.length}
          </div>
        </div>

        <div className="panel" style={{ padding: '1rem', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700' }}>{t('pending_sync_label')}</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#d97706', marginTop: '0.2rem' }}>
            {offlineQueue.length}
          </div>
        </div>

        <div className="panel" style={{ padding: '1rem', borderLeft: '4px solid #ef4444' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700' }}>{t('high_risk_cases_stat')}</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#dc2626', marginTop: '0.2rem' }}>
            {allRecords.filter(r => r.category === 'High-Risk Pregnancy').length}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', overflowX: 'auto' }}>
        <button
          onClick={() => setFilterCategory('all')}
          className={`btn ${filterCategory === 'all' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.8rem', padding: '0.45rem 0.8rem' }}
        >
          {t('filter_all_records')} ({allRecords.length})
        </button>

        <button
          onClick={() => setFilterCategory('High-Risk Pregnancy')}
          className={`btn ${filterCategory === 'High-Risk Pregnancy' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.8rem', padding: '0.45rem 0.8rem' }}
        >
          <Baby size={14} /> {t('filter_pregnant_mothers')}
        </button>

        <button
          onClick={() => setFilterCategory('Child Immunization & Malnutrition')}
          className={`btn ${filterCategory === 'Child Immunization & Malnutrition' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.8rem', padding: '0.45rem 0.8rem' }}
        >
          <Activity size={14} /> {t('filter_children')}
        </button>
      </div>

      {/* Patient Register Cards Grid */}
      <div className="card-grid">
        {filteredRecords.map((rec) => {
          const isPending = rec.status?.includes('Pending') || rec.status?.includes('Offline');
          const isHighRisk = rec.category === 'High-Risk Pregnancy';

          return (
            <div key={rec.id} className="panel" style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                <div>
                  <span className={`badge ${isHighRisk ? 'badge-red' : 'badge-green'}`} style={{ fontSize: '0.72rem', marginBottom: '0.3rem' }}>
                    {rec.category}
                  </span>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a' }}>
                    {rec.patient_name}
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    वय: {rec.age} वर्षे • लिंग: {rec.gender} • <MapPin size={12} style={{ display: 'inline', verticalAlign: '-1px' }} /> {rec.village}
                  </div>
                </div>

                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: '700',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '6px',
                  background: isPending ? '#fef3c7' : '#dcfce7',
                  color: isPending ? '#b45309' : '#15803d'
                }}>
                  {isPending ? '⏳ Offline' : '✓ Synced'}
                </span>
              </div>

              {/* Vitals */}
              <div style={{
                background: '#f8fafc',
                borderRadius: '8px',
                padding: '0.65rem 0.75rem',
                marginBottom: '0.75rem',
                display: 'flex',
                gap: '0.75rem',
                fontSize: '0.78rem'
              }}>
                <div><strong>BP:</strong> {rec.bp || '120/80'}</div>
                <div><strong>Hb:</strong> {rec.hb_level || '11.0'}</div>
                <div><strong>वजन:</strong> {rec.weight || '52 kg'}</div>
              </div>

              {rec.notes && (
                <div style={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.4, background: '#f1f5f9', padding: '0.5rem 0.7rem', borderRadius: '6px' }}>
                  <strong>टीप:</strong> {rec.notes}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredRecords.length === 0 && (
        <div style={{ textAlign: 'center', padding: '2.5rem', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', color: '#64748b' }}>
          <p style={{ fontWeight: '700' }}>या श्रेणीत सध्या कोणत्याही नोंदी उपलब्ध नाहीत.</p>
        </div>
      )}

      {/* New Patient Modal */}
      {isFormOpen && (
        <NewPatientForm
          onClose={() => setIsFormOpen(false)}
          onPatientAdded={() => loadAshaData()}
        />
      )}
    </div>
  );
}
