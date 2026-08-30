import React, { useState, useEffect } from 'react';
import {
  Database,
  Table,
  CheckCircle,
  RefreshCw,
  X,
  Layers,
  Search,
  Activity,
  User,
  Clock,
  Sparkles,
  ExternalLink,
  Code
} from 'lucide-react';

export default function SqlDatabaseViewerModal({ onClose, highlightConsultationId }) {
  const [activeTable, setActiveTable] = useState('patient_consultations'); // 'patient_consultations' | 'users' | 'symptoms_master' | 'remedies_master'
  const [consultations, setConsultations] = useState([]);
  const [users, setUsers] = useState([]);
  const [dbStatus, setDbStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');

  const fetchDatabaseData = async () => {
    setLoading(true);
    try {
      const [statusRes, consultRes, usersRes] = await Promise.all([
        fetch('/api/db/status'),
        fetch('/api/consultations'),
        fetch('/api/users')
      ]);

      const statusData = await statusRes.json();
      const consultData = await consultRes.json();
      const usersData = await usersRes.json();

      setDbStatus(statusData);
      setConsultations(consultData.consultations || []);
      setUsers(usersData.users || []);
    } catch (err) {
      console.error('Failed to load database records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatabaseData();
  }, []);

  const filteredConsultations = consultations.filter(c => {
    if (!searchFilter) return true;
    const query = searchFilter.toLowerCase();
    return (
      (c.patient_name || '').toLowerCase().includes(query) ||
      (c.consultation_id || c.id || '').toLowerCase().includes(query) ||
      (c.triage_tier || '').toLowerCase().includes(query) ||
      (c.channel || '').toLowerCase().includes(query)
    );
  });

  const filteredUsers = users.filter(u => {
    if (!searchFilter) return true;
    const query = searchFilter.toLowerCase();
    return (
      (u.full_name || u.fullName || '').toLowerCase().includes(query) ||
      (u.phone_number || u.phone || '').includes(query) ||
      (u.role || '').toLowerCase().includes(query)
    );
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '920px', width: '95%', maxHeight: '92vh', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 18px rgba(2, 132, 199, 0.3)'
            }}>
              <Database size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                  PostgreSQL Live Database Inspector
                </h2>
                <span className="badge badge-green" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem' }}>
                  <CheckCircle size={12} /> Live Connected
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>
                {dbStatus?.engine || 'PostgreSQL Engine (Active)'} • Schema: <code>server/schema.sql</code>
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={fetchDatabaseData}
              className="btn btn-secondary"
              style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              title="Refresh Live SQL Records"
            >
              <RefreshCw size={14} className={loading ? 'spin' : ''} />
              <span>Refresh</span>
            </button>

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
        </div>

        {/* Status Bar */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          padding: '0.75rem 1rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
          fontSize: '0.8rem',
          color: '#334155'
        }}>
          <div>
            <strong>Active SQL Engine:</strong> <span style={{ color: '#0284c7', fontWeight: '700' }}>{dbStatus?.engine}</span>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <span><strong>Consultations Recorded:</strong> <span style={{ color: '#0d9488', fontWeight: '800' }}>{consultations.length}</span></span>
            <span><strong>Registered Users:</strong> <span style={{ color: '#ec4899', fontWeight: '800' }}>{users.length}</span></span>
          </div>
        </div>

        {/* Table Selector Tabs & Search */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.85rem' }}>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              onClick={() => setActiveTable('patient_consultations')}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                border: `1.5px solid ${activeTable === 'patient_consultations' ? '#0284c7' : '#e2e8f0'}`,
                background: activeTable === 'patient_consultations' ? '#f0f9ff' : 'white',
                color: activeTable === 'patient_consultations' ? '#0284c7' : '#475569',
                fontWeight: '700',
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <Table size={15} />
              <span>patient_consultations ({consultations.length})</span>
            </button>

            <button
              onClick={() => setActiveTable('users')}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                border: `1.5px solid ${activeTable === 'users' ? '#0284c7' : '#e2e8f0'}`,
                background: activeTable === 'users' ? '#f0f9ff' : 'white',
                color: activeTable === 'users' ? '#0284c7' : '#475569',
                fontWeight: '700',
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <User size={15} />
              <span>users ({users.length})</span>
            </button>
          </div>

          {/* Search bar */}
          <div style={{ position: 'relative', width: '220px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search SQL records..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '2rem', paddingRight: '0.5rem', paddingTop: '0.4rem', paddingBottom: '0.4rem', fontSize: '0.8rem' }}
            />
          </div>
        </div>

        {/* Data Table Container */}
        <div style={{ flex: 1, overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '10px', background: 'white' }}>
          {activeTable === 'patient_consultations' && (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', color: '#475569', borderBottom: '1.5px solid #cbd5e1' }}>
                  <th style={{ padding: '0.65rem 0.75rem', fontWeight: '800' }}>Consultation ID</th>
                  <th style={{ padding: '0.65rem 0.75rem', fontWeight: '800' }}>Patient Name</th>
                  <th style={{ padding: '0.65rem 0.75rem', fontWeight: '800' }}>Triage Tier</th>
                  <th style={{ padding: '0.65rem 0.75rem', fontWeight: '800' }}>Channel</th>
                  <th style={{ padding: '0.65rem 0.75rem', fontWeight: '800' }}>Recorded Symptoms</th>
                  <th style={{ padding: '0.65rem 0.75rem', fontWeight: '800' }}>Notes / Query</th>
                </tr>
              </thead>
              <tbody>
                {filteredConsultations.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                      No consultation records found in database.
                    </td>
                  </tr>
                ) : (
                  filteredConsultations.map((c, idx) => {
                    const id = c.consultation_id || c.id;
                    const isHighlighted = highlightConsultationId && id === highlightConsultationId;
                    const isEmergency = c.triage_tier === '60_CRITICAL_EMERGENCY' || (c.triage_tier || '').includes('60');

                    return (
                      <tr
                        key={idx}
                        style={{
                          borderBottom: '1px solid #f1f5f9',
                          background: isHighlighted ? '#fef9c3' : (idx % 2 === 0 ? 'white' : '#fafafa'),
                          transition: 'background 0.15s ease'
                        }}
                      >
                        <td style={{ padding: '0.65rem 0.75rem', fontFamily: 'monospace', fontWeight: '700', color: '#0284c7' }}>
                          {id}
                          {isHighlighted && <span className="badge badge-amber" style={{ marginLeft: '4px', fontSize: '0.65rem' }}>Just Added</span>}
                        </td>
                        <td style={{ padding: '0.65rem 0.75rem', fontWeight: '700', color: '#0f172a' }}>
                          {c.patient_name}
                        </td>
                        <td style={{ padding: '0.65rem 0.75rem' }}>
                          <span className={`badge ${isEmergency ? 'badge-red' : 'badge-green'}`} style={{ fontSize: '0.72rem' }}>
                            {c.triage_tier}
                          </span>
                        </td>
                        <td style={{ padding: '0.65rem 0.75rem' }}>
                          <span className="badge" style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.72rem' }}>
                            {c.channel || 'AI_VOICE_ASSISTANT'}
                          </span>
                        </td>
                        <td style={{ padding: '0.65rem 0.75rem', color: '#0d9488', fontWeight: '600' }}>
                          {Array.isArray(c.symptoms) ? c.symptoms.join(', ') : (c.symptoms || 'fever_mild')}
                        </td>
                        <td style={{ padding: '0.65rem 0.75rem', color: '#64748b', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {c.patient_notes || c.notes || '-'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}

          {activeTable === 'users' && (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', color: '#475569', borderBottom: '1.5px solid #cbd5e1' }}>
                  <th style={{ padding: '0.65rem 0.75rem', fontWeight: '800' }}>Phone Number</th>
                  <th style={{ padding: '0.65rem 0.75rem', fontWeight: '800' }}>Full Name</th>
                  <th style={{ padding: '0.65rem 0.75rem', fontWeight: '800' }}>Role</th>
                  <th style={{ padding: '0.65rem 0.75rem', fontWeight: '800' }}>District / Village</th>
                  <th style={{ padding: '0.65rem 0.75rem', fontWeight: '800' }}>Biometric Auth</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? 'white' : '#fafafa' }}>
                    <td style={{ padding: '0.65rem 0.75rem', fontFamily: 'monospace', fontWeight: '700', color: '#0f172a' }}>
                      {u.phone_number || u.phone}
                    </td>
                    <td style={{ padding: '0.65rem 0.75rem', fontWeight: '700', color: '#0f172a' }}>
                      {u.full_name || u.fullName}
                    </td>
                    <td style={{ padding: '0.65rem 0.75rem' }}>
                      <span className={`badge ${u.role === 'asha' ? 'badge-pink' : 'badge-blue'}`} style={{ fontSize: '0.72rem' }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '0.65rem 0.75rem', color: '#475569' }}>
                      {u.district || 'Nashik Rural'} • {u.village || 'Trimbak Pada'}
                    </td>
                    <td style={{ padding: '0.65rem 0.75rem' }}>
                      <span className="badge badge-green" style={{ fontSize: '0.72rem' }}>
                        {u.biometric_enabled ? '✓ Enabled' : 'OTP Active'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer info & Direct API link */}
        <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Code size={14} />
            <span>Direct JSON API: <code>/api/consultations</code> • <code>/api/users</code> • <code>/api/db/status</code></span>
          </div>
          <a
            href="/api/consultations"
            target="_blank"
            rel="noreferrer"
            style={{ color: '#0284c7', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
          >
            <span>Open Raw API Feed</span> <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </div>
  );
}
