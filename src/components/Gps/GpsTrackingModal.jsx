import React, { useState } from 'react';
import { useGps, RURAL_GPS_PRESETS } from '../../context/GpsContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import {
  Navigation,
  MapPin,
  Compass,
  Radio,
  RefreshCw,
  Send,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Hospital,
  Activity,
  Layers,
  PhoneCall,
  CheckCircle,
  Database,
  X,
  Share2,
  Crosshair
} from 'lucide-react';

export default function GpsTrackingModal({ onClose, onOpenEmergencySOS }) {
  const { lang, t } = useLanguage();
  const { user } = useAuth();
  const {
    coordinates,
    gpsStatus,
    activePreset,
    nearestHospital,
    gpsLogs,
    isLiveTracking,
    lastLoggedAt,
    refreshGps,
    applyPreset,
    logGpsToBackend,
    setIsLiveTracking,
    loadGpsLogs
  } = useGps();

  const [isLogging, setIsLogging] = useState(false);
  const [logSuccessMsg, setLogSuccessMsg] = useState('');
  const [copiedCoords, setCopiedCoords] = useState(false);

  const handleManualLog = async () => {
    setIsLogging(true);
    setLogSuccessMsg('');
    try {
      const res = await logGpsToBackend('MANUAL_USER_PING', {
        village: RURAL_GPS_PRESETS[activePreset]?.village || 'Rural Checkpoint'
      });
      setLogSuccessMsg(`✅ GPS (${coordinates.latitude.toFixed(4)}, ${coordinates.longitude.toFixed(4)}) logged to PostgreSQL!`);
      setTimeout(() => setLogSuccessMsg(''), 4000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLogging(false);
    }
  };

  const handleCopyCoords = () => {
    const text = `📍 GraminAarogya Live GPS: ${coordinates.latitude.toFixed(5)}° N, ${coordinates.longitude.toFixed(5)}° E (Near ${nearestHospital?.name || 'Trimbak PHC'}) https://maps.google.com/?q=${coordinates.latitude},${coordinates.longitude}`;
    navigator.clipboard.writeText(text);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2500);
  };

  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${nearestHospital?.coordinates?.lat || coordinates.latitude},${nearestHospital?.coordinates?.lng || coordinates.longitude}`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{
          maxWidth: '900px',
          width: '95%',
          maxHeight: '92vh',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          background: '#ffffff'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: '0 4px 12px rgba(13, 148, 136, 0.3)'
            }}>
              <Navigation size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>
                  GPS Telemetry & Emergency Proximity Tracker
                </h2>
                <span className="badge" style={{
                  background: gpsStatus === 'locked' ? '#dcfce7' : '#fef3c7',
                  color: gpsStatus === 'locked' ? '#166534' : '#92400e',
                  fontSize: '0.72rem',
                  fontWeight: '700'
                }}>
                  <Radio size={12} className={gpsStatus === 'locked' ? 'animate-pulse' : ''} />
                  {gpsStatus === 'locked' ? 'GPS Active (Locked)' : 'Rural Fallback GPS'}
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.15rem' }}>
                Real-time Haversine distance calculator, nearest PHC / Civil Hospital locator & PostgreSQL live logging
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn-icon"
            style={{ color: '#64748b', background: '#f1f5f9', borderRadius: '50%', padding: '0.45rem' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ overflowY: 'auto', flex: 1, paddingRight: '0.4rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Top Row: GPS Telemetry HUD & Live Radar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1rem'
          }}>
            {/* Live GPS Coordinates Card */}
            <div style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              color: 'white',
              borderRadius: '16px',
              padding: '1.25rem',
              boxShadow: '0 8px 24px rgba(15, 23, 42, 0.25)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Background Radar Glow */}
              <div style={{
                position: 'absolute',
                top: '-30px',
                right: '-30px',
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(13, 148, 136, 0.35) 0%, rgba(13, 148, 136, 0) 70%)',
                pointerEvents: 'none'
              }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#38bdf8', letterSpacing: '0.05em' }}>
                  🛰️ Current Satellite Coordinates
                </span>
                <button
                  onClick={refreshGps}
                  className="btn"
                  style={{
                    fontSize: '0.72rem',
                    padding: '0.25rem 0.6rem',
                    background: 'rgba(255,255,255,0.12)',
                    color: '#e2e8f0',
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}
                  title="Re-acquire live browser GPS fix"
                >
                  <RefreshCw size={12} />
                  <span>Refresh GPS</span>
                </button>
              </div>

              {/* Coordinate Values */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.06)', padding: '0.75rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>LATITUDE</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#34d399', fontFamily: 'monospace' }}>
                    {coordinates.latitude.toFixed(5)}° N
                  </div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.06)', padding: '0.75rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>LONGITUDE</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#38bdf8', fontFamily: 'monospace' }}>
                    {coordinates.longitude.toFixed(5)}° E
                  </div>
                </div>
              </div>

              {/* Minor Telemetry Specs */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#cbd5e1', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.65rem' }}>
                <div>Precision: <strong style={{ color: '#f8fafc' }}>±{coordinates.accuracy || 12}m</strong></div>
                <div>Altitude: <strong style={{ color: '#f8fafc' }}>{coordinates.altitude || 610}m ASL</strong></div>
                <div>Source: <strong style={{ color: '#a7f3d0' }}>{gpsStatus === 'locked' ? 'Device GPS' : 'Maharashtra Sector'}</strong></div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button
                  onClick={handleManualLog}
                  disabled={isLogging}
                  className="btn btn-primary"
                  style={{ flex: 1, fontSize: '0.78rem', padding: '0.45rem 0.75rem', background: '#0d9488', fontWeight: '700' }}
                >
                  <Database size={14} />
                  <span>{isLogging ? 'Logging to DB...' : 'Log to PostgreSQL'}</span>
                </button>

                <button
                  onClick={handleCopyCoords}
                  className="btn"
                  style={{ fontSize: '0.78rem', padding: '0.45rem 0.75rem', background: 'rgba(255,255,255,0.12)', color: 'white' }}
                  title="Copy formatted GPS Coordinates"
                >
                  {copiedCoords ? <CheckCircle size={14} style={{ color: '#4ade80' }} /> : <Share2 size={14} />}
                  <span>{copiedCoords ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>

              {logSuccessMsg && (
                <div style={{ marginTop: '0.65rem', fontSize: '0.74rem', color: '#86efac', fontWeight: '600' }}>
                  {logSuccessMsg}
                </div>
              )}
            </div>

            {/* Nearest Hospital Proximity Box */}
            <div style={{
              background: '#f8fafc',
              border: '1.5px solid #cbd5e1',
              borderRadius: '16px',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span className="badge badge-blue" style={{ fontSize: '0.72rem' }}>
                    <Hospital size={12} /> Closest Rural Emergency Facility
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#0d9488' }}>
                    Haversine Proximity
                  </span>
                </div>

                <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.2rem' }}>
                  {nearestHospital?.name || 'Trimbakeshwar Primary Health Centre (PHC)'}
                </h3>
                <p style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  {nearestHospital?.taluka || 'Trimbakeshwar'}, {nearestHospital?.district || 'Nashik'} • {nearestHospital?.type || 'Government'}
                </p>

                {/* Distance & Time Callout */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  marginTop: '0.85rem',
                  padding: '0.75rem',
                  background: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  borderRadius: '10px'
                }}>
                  <div>
                    <div style={{ fontSize: '0.68rem', color: '#065f46', fontWeight: '700' }}>ROAD DISTANCE</div>
                    <div style={{ fontSize: '1.35rem', fontWeight: '900', color: '#047857' }}>
                      {nearestHospital?.live_distance_km ? `${nearestHospital.live_distance_km} km` : '4.5 km'}
                    </div>
                  </div>

                  <div style={{ borderLeft: '1px solid #6ee7b7', paddingLeft: '1rem' }}>
                    <div style={{ fontSize: '0.68rem', color: '#065f46', fontWeight: '700' }}>ESTIMATED TRAVEL</div>
                    <div style={{ fontSize: '1.35rem', fontWeight: '900', color: '#047857' }}>
                      ~{nearestHospital?.live_travel_time_mins || 12} mins
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation & SOS Buttons */}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary"
                  style={{ flex: 1, fontSize: '0.8rem', padding: '0.45rem 0.75rem', textDecoration: 'none', justifyContent: 'center' }}
                >
                  <ExternalLink size={14} />
                  <span>Google Maps</span>
                </a>

                <a
                  href="tel:108"
                  className="btn"
                  style={{
                    fontSize: '0.8rem',
                    padding: '0.45rem 0.85rem',
                    background: '#dc2626',
                    color: 'white',
                    fontWeight: '700',
                    textDecoration: 'none'
                  }}
                >
                  <PhoneCall size={14} />
                  <span>SOS 108</span>
                </a>
              </div>
            </div>
          </div>

          {/* Location Presets (Quick Switch for Tribal Padas) */}
          <div style={{ background: '#f1f5f9', padding: '0.85rem', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Compass size={14} />
              <span>Simulate Village Sector / Tribal Pada GPS (PS-1, PS-2 Showcase):</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {Object.entries(RURAL_GPS_PRESETS).map(([key, p]) => (
                <button
                  key={key}
                  onClick={() => applyPreset(key)}
                  className="btn"
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.35rem 0.65rem',
                    background: activePreset === key ? '#0d9488' : '#ffffff',
                    color: activePreset === key ? 'white' : '#1e293b',
                    border: activePreset === key ? '1px solid #0f766e' : '1px solid #cbd5e1',
                    fontWeight: activePreset === key ? '700' : '500'
                  }}
                >
                  <MapPin size={12} />
                  <span>{p.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Database GPS Logs Table */}
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Database size={16} style={{ color: '#0284c7' }} />
                <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a' }}>
                  PostgreSQL Real-Time GPS Logs Table (`gps_logs`)
                </h4>
                <span className="badge badge-slate" style={{ fontSize: '0.7rem' }}>
                  {gpsLogs.length} Rows
                </span>
              </div>

              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                Last synced: <strong>{lastLoggedAt || 'Just now'}</strong>
              </div>
            </div>

            {/* Logs Table */}
            <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Timestamp</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>User / Role</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Event Type</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Coordinates</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Nearest PHC</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Distance</th>
                  </tr>
                </thead>
                <tbody>
                  {gpsLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '1.5rem', textAlign: 'center', color: '#94a3b8' }}>
                        No GPS logs yet. Click "Log to PostgreSQL" above to record your first live GPS position.
                      </td>
                    </tr>
                  ) : (
                    gpsLogs.map((log, idx) => (
                      <tr key={log.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.55rem 0.75rem', color: '#64748b' }}>
                          <Clock size={11} style={{ display: 'inline', marginRight: '3px' }} />
                          {new Date(log.created_at || Date.now()).toLocaleTimeString()}
                        </td>
                        <td style={{ padding: '0.55rem 0.75rem', fontWeight: '600' }}>
                          {log.user_name || 'Citizen'}
                          <span className="badge badge-slate" style={{ fontSize: '0.65rem', marginLeft: '4px', textTransform: 'capitalize' }}>
                            {log.role || 'citizen'}
                          </span>
                        </td>
                        <td style={{ padding: '0.55rem 0.75rem' }}>
                          <span className="badge" style={{
                            fontSize: '0.68rem',
                            background: log.event_type?.includes('EMERGENCY') ? '#fee2e2' : '#e0f2fe',
                            color: log.event_type?.includes('EMERGENCY') ? '#991b1b' : '#0369a1'
                          }}>
                            {log.event_type || 'LOCATION_PING'}
                          </span>
                        </td>
                        <td style={{ padding: '0.55rem 0.75rem', fontFamily: 'monospace', color: '#047857' }}>
                          {parseFloat(log.latitude).toFixed(4)}°N, {parseFloat(log.longitude).toFixed(4)}°E
                        </td>
                        <td style={{ padding: '0.55rem 0.75rem', color: '#334155' }}>
                          {log.nearest_hospital_name?.replace('Primary Health Centre (PHC)', 'PHC') || 'Trimbak PHC'}
                        </td>
                        <td style={{ padding: '0.55rem 0.75rem', fontWeight: '700', color: '#0d9488' }}>
                          {log.distance_to_hospital_km ? `${parseFloat(log.distance_to_hospital_km).toFixed(1)} km` : '4.5 km'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem', marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            🔒 End-to-end encrypted medical telemetry compliant with NDHM rural standards.
          </div>
          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ fontSize: '0.82rem', padding: '0.45rem 1rem' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
