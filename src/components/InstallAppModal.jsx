import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  Download,
  Smartphone,
  CheckCircle,
  X,
  FileArchive,
  Database,
  ArrowDownToLine,
  Sparkles
} from 'lucide-react';

export default function InstallAppModal({ onClose, deferredPrompt, isInstallable }) {
  const { t } = useLanguage();
  const [installSuccess, setInstallSuccess] = useState(false);

  const handleNativeInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstallSuccess(true);
      }
    } else {
      alert("तुमच्या फोनच्या ब्राउझर मेनूमध्ये (३ ठिपके) जाऊन 'Install app' किंवा 'Add to Home screen' वर क्लिक करा.");
    }
  };

  const handleDownloadZip = () => {
    window.location.href = '/api/download/offline-package';
  };

  const handleDownloadDb = () => {
    window.location.href = '/api/download/offline-database';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0d9488 0%, #10b981 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(13, 148, 136, 0.3)'
            }}>
              <Download size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                {t('install_modal_title')}
              </h2>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>
                {t('install_modal_sub')}
              </p>
            </div>
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

        {/* Primary Action 1: Install to Home Screen (PWA Native) */}
        <div style={{
          background: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)',
          border: '1.5px solid #5eead4',
          borderRadius: '14px',
          padding: '1.15rem',
          marginBottom: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <Smartphone size={20} style={{ color: '#0d9488' }} />
            <span style={{ fontWeight: '800', fontSize: '0.95rem', color: '#0f766e' }}>
              {t('install_pwa_title')}
            </span>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#134e4a', marginBottom: '0.85rem' }}>
            {t('install_pwa_desc')}
          </p>

          <button
            onClick={handleNativeInstall}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.7rem', justifyContent: 'center' }}
          >
            {installSuccess ? (
              <>
                <CheckCircle size={18} /> {t('installed_success')}
              </>
            ) : (
              <>
                <Smartphone size={18} /> {t('install_pwa_btn')}
              </>
            )}
          </button>
        </div>

        {/* Action 2: Download Full Project ZIP Package */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '0.9rem',
          marginBottom: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: '#e0f2fe',
              color: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <FileArchive size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.86rem', fontWeight: '700', color: '#0f172a' }}>
                {t('download_zip_title')}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                {t('download_zip_sub')}
              </div>
            </div>
          </div>

          <button
            onClick={handleDownloadZip}
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem', padding: '0.45rem 0.8rem', flexShrink: 0 }}
          >
            <ArrowDownToLine size={15} /> {t('download_zip_btn')}
          </button>
        </div>

        {/* Action 3: Download Offline JSON Database */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '0.9rem',
          marginBottom: '1.1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: '#fef3c7',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Database size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.86rem', fontWeight: '700', color: '#0f172a' }}>
                {t('download_db_title')}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                {t('download_db_sub')}
              </div>
            </div>
          </div>

          <button
            onClick={handleDownloadDb}
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem', padding: '0.45rem 0.8rem', flexShrink: 0 }}
          >
            <ArrowDownToLine size={15} /> {t('download_db_btn')}
          </button>
        </div>

        {/* Manual Instructions */}
        <div style={{
          background: '#f1f5f9',
          borderRadius: '10px',
          padding: '0.85rem',
          fontSize: '0.78rem',
          color: '#475569',
          lineHeight: 1.45
        }}>
          <div style={{ fontWeight: '700', color: '#1e293b', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Sparkles size={13} style={{ color: '#0d9488' }} /> {t('how_to_install_title')}
          </div>
          <div>
            {t('how_to_install_desc')}
          </div>
        </div>
      </div>
    </div>
  );
}
