import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useNetwork } from '../../context/NetworkContext';
import HospitalCard from './HospitalCard';
import CostBreakdownModal from './CostBreakdownModal';
import TokenBookingModal from './TokenBookingModal';
import { saveToStore, getAllFromStore } from '../../utils/db';
import {
  Hospital,
  Filter,
  ShieldCheck,
  Building2,
  Droplet,
  AlertTriangle,
  Search,
  Sparkles
} from 'lucide-react';

export default function HospitalList({ initialFilter, onVideoCall }) {
  const { lang, t } = useLanguage();
  const { isOffline } = useNetwork();

  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [typeFilter, setTypeFilter] = useState(initialFilter?.type || 'all'); // 'all', 'Government', 'Private'
  const [tierFilter, setTierFilter] = useState('all'); // 'all', 'budget', 'moderate', 'advanced'
  const [bloodFilter, setBloodFilter] = useState('all'); // 'all', 'O_pos', 'A_pos', 'B_pos', 'O_neg'
  const [emergencyOnly, setEmergencyOnly] = useState(initialFilter?.emergencyOnly || false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [selectedCostHosp, setSelectedCostHosp] = useState(null);
  const [selectedTokenHosp, setSelectedTokenHosp] = useState(null);

  useEffect(() => {
    loadHospitals();
  }, [typeFilter, tierFilter, bloodFilter, emergencyOnly]);

  const loadHospitals = async () => {
    try {
      if (!isOffline) {
        const queryParams = new URLSearchParams();
        if (typeFilter !== 'all') queryParams.append('type', typeFilter);
        if (emergencyOnly) queryParams.append('emergency_only', 'true');

        const res = await fetch(`/api/hospitals?${queryParams.toString()}`);
        const data = await res.json();
        if (data.success && data.hospitals) {
          setHospitals(data.hospitals);
          await saveToStore('hospitals', data.hospitals);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.log("Using cached hospital directory...");
    }

    // Offline IndexedDB load
    try {
      const cached = await getAllFromStore('hospitals');
      if (cached && cached.length > 0) {
        let filtered = [...cached];
        if (typeFilter !== 'all') {
          filtered = filtered.filter(h => h.type.toLowerCase() === typeFilter.toLowerCase());
        }
        if (emergencyOnly) {
          filtered = filtered.filter(h => h.live_status.beds.icu_available > 0);
        }
        setHospitals(filtered);
      }
    } catch (err) {
      console.warn("DB read error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter logic for tier and blood
  const filteredHospitals = hospitals.filter(h => {
    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = h.name.toLowerCase().includes(q) || (h.name_mr && h.name_mr.includes(q)) || h.district.toLowerCase().includes(q);
      if (!matchName) return false;
    }

    // Private tier filter
    if (typeFilter === 'Private' && tierFilter !== 'all') {
      if (tierFilter === 'budget' && !h.tier.includes('Budget')) return false;
      if (tierFilter === 'moderate' && !h.tier.includes('Moderate')) return false;
      if (tierFilter === 'advanced' && !h.tier.includes('Advanced')) return false;
    }

    // Blood filter
    if (bloodFilter !== 'all') {
      const stock = h.live_status.blood_stock[bloodFilter] || 0;
      if (stock === 0) return false;
    }

    return true;
  });

  return (
    <div style={{ marginTop: '1.25rem' }}>
      {/* Heading */}
      <div style={{ marginBottom: '1.2rem' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a' }}>
          {t('hosp_heading')}
        </h2>
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>
          {t('hosp_subheading')}
        </p>
      </div>

      {/* Filter Bar */}
      <div style={{
        background: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '1.1rem',
        marginBottom: '1.25rem',
        boxShadow: '0 4px 15px -3px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '0.75rem',
          alignItems: 'center'
        }}>
          {/* Search bar */}
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder={t('search_hosp_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '2.4rem', fontSize: '0.86rem' }}
            />
          </div>

          {/* Govt vs Private Filter */}
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <button
              onClick={() => { setTypeFilter('all'); setTierFilter('all'); }}
              className={`btn ${typeFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.8rem', padding: '0.5rem 0.8rem' }}
            >
              {t('filter_all')}
            </button>

            <button
              onClick={() => { setTypeFilter('Government'); setTierFilter('all'); }}
              className={`btn ${typeFilter === 'Government' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.8rem', padding: '0.5rem 0.8rem' }}
            >
              <ShieldCheck size={14} /> {t('filter_govt')}
            </button>

            <button
              onClick={() => setTypeFilter('Private')}
              className={`btn ${typeFilter === 'Private' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.8rem', padding: '0.5rem 0.8rem' }}
            >
              <Building2 size={14} /> {t('filter_private')}
            </button>
          </div>

          {/* Blood group selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Droplet size={16} style={{ color: '#dc2626' }} />
            <select
              value={bloodFilter}
              onChange={(e) => setBloodFilter(e.target.value)}
              className="input-field"
              style={{ padding: '0.5rem 0.75rem', fontSize: '0.82rem' }}
            >
              <option value="all">All Blood Groups</option>
              <option value="O_pos">O+ Blood</option>
              <option value="A_pos">A+ Blood</option>
              <option value="B_pos">B+ Blood</option>
              <option value="O_neg">O- Blood (Rare)</option>
            </select>
          </div>

          {/* Emergency ICU toggle */}
          <button
            onClick={() => setEmergencyOnly(!emergencyOnly)}
            className={`btn ${emergencyOnly ? 'btn-emergency' : 'btn-secondary'}`}
            style={{ fontSize: '0.8rem', padding: '0.5rem 0.8rem' }}
          >
            <AlertTriangle size={14} /> {t('filter_emergency_only')}
          </button>
        </div>

        {/* Private Cost Tier Sub-Filter (when Private is selected) */}
        {typeFilter === 'Private' && (
          <div style={{
            marginTop: '0.85rem',
            paddingTop: '0.85rem',
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            flexWrap: 'wrap'
          }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>
              {t('private_cost_range_label')}
            </span>

            <button
              onClick={() => setTierFilter('all')}
              className={`btn ${tierFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.76rem', padding: '0.35rem 0.7rem' }}
            >
              {t('all_private_btn')}
            </button>

            <button
              onClick={() => setTierFilter('budget')}
              className={`btn ${tierFilter === 'budget' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.76rem', padding: '0.35rem 0.7rem' }}
            >
              {t('filter_budget')} (₹150 - ₹2,500)
            </button>

            <button
              onClick={() => setTierFilter('moderate')}
              className={`btn ${tierFilter === 'moderate' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.76rem', padding: '0.35rem 0.7rem' }}
            >
              {t('filter_moderate')} (₹450 - ₹6,500)
            </button>

            <button
              onClick={() => setTierFilter('advanced')}
              className={`btn ${tierFilter === 'advanced' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.76rem', padding: '0.35rem 0.7rem' }}
            >
              {t('filter_advanced')} (₹800+)
            </button>
          </div>
        )}
      </div>

      {/* Hospital Cards Grid */}
      <div className="card-grid">
        {filteredHospitals.map((hospital) => (
          <HospitalCard
            key={hospital.id}
            hospital={hospital}
            onViewCost={(h) => setSelectedCostHosp(h)}
            onBookToken={(h) => setSelectedTokenHosp(h)}
            onVideoCall={onVideoCall}
            selectedBlood={bloodFilter}
          />
        ))}
      </div>

      {filteredHospitals.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '3rem 1rem',
          background: 'white',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          color: '#64748b'
        }}>
          <p style={{ fontSize: '1rem', fontWeight: '700' }}>
            {t('no_hosp_found')}
          </p>
          <p style={{ fontSize: '0.85rem', marginTop: '0.3rem' }}>
            {t('change_filter_hint')}
          </p>
        </div>
      )}

      {/* Modals */}
      {selectedCostHosp && (
        <CostBreakdownModal
          hospital={selectedCostHosp}
          onClose={() => setSelectedCostHosp(null)}
        />
      )}

      {selectedTokenHosp && (
        <TokenBookingModal
          hospital={selectedTokenHosp}
          onClose={() => setSelectedTokenHosp(null)}
        />
      )}
    </div>
  );
}
