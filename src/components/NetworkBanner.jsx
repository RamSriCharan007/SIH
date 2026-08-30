import React from 'react';
import { useNetwork } from '../context/NetworkContext';
import { useLanguage } from '../context/LanguageContext';
import { Wifi, WifiOff, SignalHigh, RefreshCw, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function NetworkBanner() {
  const {
    networkMode,
    setNetworkMode,
    isOnline,
    is2G,
    isOffline,
    offlineQueueCount,
    triggerSync,
    isSyncing,
    syncSuccessMsg
  } = useNetwork();
  const { t } = useLanguage();

  return (
    <div>
      <div className="sim-banner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '700', fontSize: '0.82rem' }}>
            <span style={{ color: '#94a3b8' }}>{t('net_simulation_label')}</span>
          </div>

          <div className="sim-modes">
            <button
              onClick={() => setNetworkMode('online')}
              className={`sim-btn ${networkMode === 'online' ? 'active-online' : ''}`}
            >
              <Wifi size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
              {t('net_mode_online')}
            </button>

            <button
              onClick={() => setNetworkMode('weak_2g')}
              className={`sim-btn ${networkMode === 'weak_2g' ? 'active-2g' : ''}`}
            >
              <SignalHigh size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
              {t('net_mode_2g')}
            </button>

            <button
              onClick={() => setNetworkMode('offline')}
              className={`sim-btn ${networkMode === 'offline' ? 'active-offline' : ''}`}
            >
              <WifiOff size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
              {t('net_mode_offline')}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {isOffline && (
            <span style={{
              background: '#ef4444',
              color: 'white',
              fontSize: '0.75rem',
              fontWeight: '700',
              padding: '0.2rem 0.55rem',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <WifiOff size={12} /> {t('offline_badge')} (IndexedDB Ready)
            </span>
          )}

          {is2G && (
            <span style={{
              background: '#f59e0b',
              color: '#000',
              fontSize: '0.75rem',
              fontWeight: '700',
              padding: '0.2rem 0.55rem',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <SignalHigh size={12} /> {t('weak_2g_badge')}
            </span>
          )}

          {offlineQueueCount > 0 && (
            <button
              onClick={triggerSync}
              disabled={isSyncing || isOffline}
              style={{
                background: isOffline ? '#475569' : '#0d9488',
                color: 'white',
                border: 'none',
                padding: '0.25rem 0.65rem',
                fontSize: '0.78rem',
                fontWeight: '700',
                borderRadius: '6px',
                cursor: isOffline ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
              title={isOffline ? "Switch to Online mode to sync" : "Sync offline records now"}
            >
              <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
              {offlineQueueCount} {t('offline_queue_count')} {isOffline ? '(Offline)' : 'Sync Now'}
            </button>
          )}
        </div>
      </div>

      {syncSuccessMsg && (
        <div style={{
          background: '#dcfce7',
          color: '#15803d',
          borderBottom: '1px solid #86efac',
          padding: '0.5rem 1rem',
          fontSize: '0.85rem',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          justifyContent: 'center'
        }}>
          <CheckCircle2 size={16} />
          {syncSuccessMsg}
        </div>
      )}
    </div>
  );
}
