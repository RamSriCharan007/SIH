import React, { useState, useRef, useEffect } from 'react';
import Header from './components/Header';
import NetworkBanner from './components/NetworkBanner';
import SmsHeadsUp from './components/SmsHeadsUp';
import AuthModal from './components/AuthModal';
import InstallAppModal from './components/InstallAppModal';
import AarogyaAiModal from './components/AiAssistant/AarogyaAiModal';
import SymptomChecker from './components/Triage/SymptomChecker';
import OfflineRemedies from './components/Triage/OfflineRemedies';
import EmergencyEscalation from './components/Triage/EmergencyEscalation';
import HospitalList from './components/Hospitals/HospitalList';
import AshaDashboard from './components/Asha/AshaDashboard';
import AshaAccessDeniedModal from './components/Asha/AshaAccessDeniedModal';
import FaceRecognitionModal from './components/Biometrics/FaceRecognitionModal';
import SmsGatewayModal from './components/Fallback/SmsGatewayModal';
import VoiceAssistant from './components/VoiceAssistant';

import EmergencyVideoCallModal from './components/Teleconsultation/EmergencyVideoCallModal';
import DoctorDirectoryModal from './components/Teleconsultation/DoctorDirectoryModal';
import JuryEvaluationModal from './components/Evaluation/JuryEvaluationModal';
import SqlDatabaseViewerModal from './components/Database/SqlDatabaseViewerModal';
import GpsTrackingModal from './components/Gps/GpsTrackingModal';

import { useLanguage } from './context/LanguageContext';
import { useAuth } from './context/AuthContext';
import { useNetwork } from './context/NetworkContext';

import {
  Activity,
  Hospital,
  Sparkles,
  AlertTriangle,
  ShieldCheck,
  MessageSquare,
  PhoneCall,
  Bed,
  Droplet,
  HeartPulse,
  X,
  Volume2,
  Download,
  Bot,
  Mic,
  Award,
  Database,
  Lock
} from 'lucide-react';

export default function App() {
  const { lang, t } = useLanguage();
  const {
    user,
    canAccessAsha,
    isFaceModalOpen,
    setIsFaceModalOpen,
    faceModalMode,
    isAshaDeniedModalOpen,
    setIsAshaDeniedModalOpen,
    setIsAuthModalOpen
  } = useAuth();
  const { isOffline } = useNetwork();

  // Active Tab: 'triage' | 'hospitals' | 'remedies_40' | 'complications_60' | 'asha_suite' | 'sms_fallback'
  const [activeTab, setActiveTab] = useState('triage');
  const [selectedTriageResult, setSelectedTriageResult] = useState(null);
  const [hospitalFilterState, setHospitalFilterState] = useState(null);

  // Modals
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isSmsModalOpen, setIsSmsModalOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isDoctorDirectoryOpen, setIsDoctorDirectoryOpen] = useState(false);
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);
  const [isEvaluationModalOpen, setIsEvaluationModalOpen] = useState(false);
  const [isDbViewerOpen, setIsDbViewerOpen] = useState(false);
  const [isGpsModalOpen, setIsGpsModalOpen] = useState(false);
  const [highlightConsultationId, setHighlightConsultationId] = useState(null);
  const [activeVideoCallDoc, setActiveVideoCallDoc] = useState(null);
  const [smsDefaultQuery, setSmsDefaultQuery] = useState('BEDS');
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  const handleAshaTabClick = () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    if (!canAccessAsha()) {
      setIsAshaDeniedModalOpen(true);
      return;
    }
    setActiveTab('asha_suite');
  };

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  // Ref to trigger autofill directly inside AuthModal
  const autofillRef = useRef(null);

  const handleTriageResult = (result) => {
    setSelectedTriageResult(result);
    if (result && result.tier === '60_complication') {
      setActiveTab('complications_60');
    } else if (result && result.tier === '40_remedy') {
      setActiveTab('remedies_40');
    }
  };

  const handleHospitalFilterFromEmergency = (filters) => {
    setHospitalFilterState(filters);
    setActiveTab('hospitals');
  };

  const handleOpenSmsWithCode = (code) => {
    setSmsDefaultQuery(code);
    setIsSmsModalOpen(true);
  };

  const handleStartDirectVideoCall = (doc) => {
    setActiveVideoCallDoc(doc);
    setIsVideoCallOpen(true);
  };

  return (
    <div>
      {/* Network Simulator Banner (Online, 2G, Offline) */}
      <NetworkBanner />

      {/* Heads-up Mobile SMS Banner with 1-tap OTP Autofill */}
      <SmsHeadsUp
        onAutofill={(otp) => {
          if (autofillRef.current) {
            autofillRef.current(otp);
          }
        }}
      />

      {/* Sticky Main Header */}
      <Header
        onOpenEmergency={() => setIsEmergencyModalOpen(true)}
        onOpenSmsModal={() => setIsSmsModalOpen(true)}
        onOpenInstall={() => setIsInstallModalOpen(true)}
        onOpenAi={() => setIsAiModalOpen(true)}
        onOpenVideoCall={() => setIsDoctorDirectoryOpen(true)}
        onOpenEvaluation={() => setIsEvaluationModalOpen(true)}
        onOpenGps={() => setIsGpsModalOpen(true)}
        onOpenDbViewer={() => {
          setHighlightConsultationId(null);
          setIsDbViewerOpen(true);
        }}
      />

      {/* Main Content Area */}
      <main className="app-container">
        {/* Hero Section */}
        <div className="hero-card">
          <div style={{ maxWidth: '780px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
              <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.2)', color: '#ccfbf1', border: '1px solid rgba(255,255,255,0.3)' }}>
                <HeartPulse size={13} /> {t('hero_badge')}
              </span>
              <button
                onClick={() => setIsAiModalOpen(true)}
                className="badge"
                style={{ background: '#10b981', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Bot size={13} /> {t('hero_ai_copilot_badge')}
              </button>
              {user && (
                <span className="badge" style={{ background: '#ec4899', color: 'white' }}>
                  {user.role === 'asha' ? t('asha_portal') : t('citizen_portal')}
                </span>
              )}
            </div>

            <h1 style={{ fontSize: '1.75rem', fontWeight: '800', lineHeight: 1.25 }}>
              {t('hero_title')}
            </h1>

            <p style={{ fontSize: '0.92rem', color: '#ccfbf1', marginTop: '0.6rem', lineHeight: 1.5 }}>
              {t('hero_desc')}
            </p>
          </div>

          {/* Key Metrics / Problem Solvers */}
          <div className="hero-stats">
            <div className="hero-stat-box">
              <div style={{ fontSize: '0.74rem', color: '#a7f3d0', fontWeight: '700' }}>
                {t('stat_ps1_title')}
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: '800', marginTop: '0.2rem' }}>
                {t('stat_ps1_value')}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#e2e8f0', marginTop: '0.15rem' }}>
                {t('stat_ps1_sub')}
              </div>
            </div>

            <div className="hero-stat-box">
              <div style={{ fontSize: '0.74rem', color: '#a7f3d0', fontWeight: '700' }}>
                {t('stat_ps2_title')}
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: '800', marginTop: '0.2rem' }}>
                {t('stat_ps2_value')}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#e2e8f0', marginTop: '0.15rem' }}>
                {t('stat_ps2_sub')}
              </div>
            </div>

            <div className="hero-stat-box">
              <div style={{ fontSize: '0.74rem', color: '#a7f3d0', fontWeight: '700' }}>
                {t('stat_ai_title')}
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: '800', marginTop: '0.2rem' }}>
                {t('stat_ai_value')}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#e2e8f0', marginTop: '0.15rem' }}>
                {t('stat_ai_sub')}
              </div>
            </div>

            <div className="hero-stat-box">
              <div style={{ fontSize: '0.74rem', color: '#a7f3d0', fontWeight: '700' }}>
                {t('stat_asha_title')}
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: '800', marginTop: '0.2rem' }}>
                {t('stat_asha_value')}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#e2e8f0', marginTop: '0.15rem' }}>
                {t('stat_asha_sub')}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="nav-tabs">
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="nav-tab-btn"
            style={{
              background: 'linear-gradient(135deg, #0d9488 0%, #065f46 100%)',
              color: 'white',
              border: 'none',
              boxShadow: '0 4px 12px rgba(13, 148, 136, 0.3)'
            }}
          >
            <Bot size={17} /> {t('tab_ai_copilot')}
          </button>

          <button
            onClick={() => setActiveTab('triage')}
            className={`nav-tab-btn ${activeTab === 'triage' ? 'active' : ''}`}
          >
            <Activity size={17} /> {t('tab_triage')}
          </button>

          <button
            onClick={() => setActiveTab('hospitals')}
            className={`nav-tab-btn ${activeTab === 'hospitals' ? 'active' : ''}`}
          >
            <Hospital size={17} /> {t('tab_hospitals')}
          </button>

          <button
            onClick={() => setActiveTab('remedies_40')}
            className={`nav-tab-btn ${activeTab === 'remedies_40' ? 'active' : ''}`}
          >
            <Sparkles size={17} /> {t('tab_remedies_40')}
          </button>

          <button
            onClick={() => setActiveTab('complications_60')}
            className={`nav-tab-btn ${activeTab === 'complications_60' ? 'active' : ''}`}
          >
            <AlertTriangle size={17} /> {t('tab_complications_60')}
          </button>

          <button
            onClick={handleAshaTabClick}
            className={`nav-tab-btn ${activeTab === 'asha_suite' ? 'active' : ''}`}
            style={{
              position: 'relative',
              borderColor: activeTab === 'asha_suite' ? '#ec4899' : undefined
            }}
          >
            <ShieldCheck size={17} style={{ color: '#ec4899' }} />
            <span>{t('tab_asha_suite')}</span>
            {!canAccessAsha() && (
              <span style={{
                fontSize: '0.62rem',
                background: '#fee2e2',
                color: '#b91c1c',
                padding: '0.1rem 0.35rem',
                borderRadius: '4px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2px',
                fontWeight: '800'
              }}>
                <Lock size={9} /> {user ? 'CITIZEN' : 'AUTH'}
              </span>
            )}
          </button>

          <button
            onClick={() => setIsSmsModalOpen(true)}
            className="nav-tab-btn"
            style={{ borderColor: '#38bdf8', color: '#0369a1' }}
          >
            <MessageSquare size={17} /> {t('tab_sms_fallback')}
          </button>
        </div>

        {/* Tab View Contents */}
        {activeTab === 'triage' && (
          <div>
            <SymptomChecker onSelectResult={handleTriageResult} />
            <OfflineRemedies />
          </div>
        )}

        {activeTab === 'hospitals' && (
          <HospitalList
            initialFilter={hospitalFilterState}
            onVideoCall={handleStartDirectVideoCall}
          />
        )}

        {activeTab === 'remedies_40' && (
          <OfflineRemedies />
        )}

        {activeTab === 'complications_60' && (
          <EmergencyEscalation
            onSelectHospitalFilter={handleHospitalFilterFromEmergency}
            onOpenSmsFallback={handleOpenSmsWithCode}
          />
        )}

        {activeTab === 'asha_suite' && (
          <AshaDashboard />
        )}
      </main>

      {/* Emergency 108 SOS Quick Call Dialog */}
      {isEmergencyModalOpen && (
        <div className="modal-overlay" onClick={() => setIsEmergencyModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: '#fee2e2',
                  color: '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <PhoneCall size={18} />
                </div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#991b1b' }}>
                  {t('emergency_modal_title')}
                </h2>
              </div>

              <button
                onClick={() => setIsEmergencyModalOpen(false)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.25rem' }}>
              {/* Direct Doctor Video Call Button inside Emergency SOS */}
              <button
                onClick={() => {
                  setIsEmergencyModalOpen(false);
                  setIsDoctorDirectoryOpen(true);
                }}
                className="btn"
                style={{
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  color: 'white',
                  padding: '0.85rem',
                  fontSize: '1rem',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(2, 132, 199, 0.4)'
                }}
              >
                {t('video_call_btn')} (Telemedicine)
              </button>

              <a
                href="tel:108"
                className="btn btn-emergency"
                style={{ padding: '0.85rem', fontSize: '1rem', justifyContent: 'center' }}
              >
                <PhoneCall size={20} /> {t('call_108_btn')}
              </a>

              <a
                href="tel:102"
                className="btn"
                style={{ background: '#db2777', color: 'white', padding: '0.85rem', fontSize: '1rem', justifyContent: 'center' }}
              >
                <HeartPulse size={20} /> {t('call_102_btn')}
              </a>

              <a
                href="tel:104"
                className="btn btn-secondary"
                style={{ padding: '0.85rem', fontSize: '0.95rem', justifyContent: 'center' }}
              >
                <Activity size={18} /> {t('call_104_btn')}
              </a>
            </div>

            <button
              onClick={() => {
                setIsEmergencyModalOpen(false);
                setIsSmsModalOpen(true);
              }}
              style={{
                width: '100%',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                padding: '0.65rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: '700',
                color: '#334155',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}
            >
              <MessageSquare size={14} /> {t('sms_emergency_hint')}
            </button>
          </div>
        </div>
      )}

      {/* Doctor Directory Modal for Video Calls */}
      {isDoctorDirectoryOpen && (
        <DoctorDirectoryModal
          onClose={() => setIsDoctorDirectoryOpen(false)}
          onStartCall={(doc) => handleStartDirectVideoCall(doc)}
        />
      )}

      {/* Live Emergency Doctor Video Consultation Modal */}
      {isVideoCallOpen && (
        <EmergencyVideoCallModal
          doctor={activeVideoCallDoc}
          onClose={() => setIsVideoCallOpen(false)}
        />
      )}

      {/* Zero-Internet SMS Gateway Modal */}
      {isSmsModalOpen && (
        <SmsGatewayModal
          onClose={() => setIsSmsModalOpen(false)}
          defaultQuery={smsDefaultQuery}
        />
      )}

      {/* Download & Install App Modal */}
      {isInstallModalOpen && (
        <InstallAppModal
          onClose={() => setIsInstallModalOpen(false)}
          deferredPrompt={deferredPrompt}
          isInstallable={!!deferredPrompt}
        />
      )}

      {/* Aarogya AI Conversational Voice Assistant Modal */}
      {isAiModalOpen && (
        <AarogyaAiModal
          onClose={() => setIsAiModalOpen(false)}
          onTriggerAction={(tabName) => {
            setActiveTab(tabName);
            setIsAiModalOpen(false);
          }}
          onOpenDbViewer={(consultId) => {
            setHighlightConsultationId(consultId);
            setIsDbViewerOpen(true);
          }}
        />
      )}

      {/* PostgreSQL Live Database Inspector Modal */}
      {isDbViewerOpen && (
        <SqlDatabaseViewerModal
          onClose={() => setIsDbViewerOpen(false)}
          highlightConsultationId={highlightConsultationId}
        />
      )}

      {/* GPS Live Telemetry & Proximity Tracker Modal */}
      {isGpsModalOpen && (
        <GpsTrackingModal
          onClose={() => setIsGpsModalOpen(false)}
          onOpenEmergencySOS={() => {
            setIsGpsModalOpen(false);
            setIsEmergencyModalOpen(true);
          }}
        />
      )}

      {/* SIH 2024 Jury Evaluation Showcase Hub Modal */}
      {isEvaluationModalOpen && (
        <JuryEvaluationModal
          onClose={() => setIsEvaluationModalOpen(false)}
          onOpenVideoCall={() => {
            setIsEvaluationModalOpen(false);
            setIsDoctorDirectoryOpen(true);
          }}
          onOpenAi={() => {
            setIsEvaluationModalOpen(false);
            setIsAiModalOpen(true);
          }}
          onOpenEmergency={() => {
            setIsEvaluationModalOpen(false);
            setIsEmergencyModalOpen(true);
          }}
          onOpenInstall={() => {
            setIsEvaluationModalOpen(false);
            setIsInstallModalOpen(true);
          }}
          onOpenSmsModal={() => {
            setIsEvaluationModalOpen(false);
            setIsSmsModalOpen(true);
          }}
          onSelectTab={(tabName) => {
            setIsEvaluationModalOpen(false);
            setActiveTab(tabName);
          }}
        />
      )}

      {/* Floating AI Assistant Trigger Button (Bottom Right) */}
      <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 50, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
        <button
          onClick={() => setIsAiModalOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            background: 'linear-gradient(135deg, #0d9488 0%, #065f46 100%)',
            color: 'white',
            border: '2px solid rgba(255, 255, 255, 0.4)',
            borderRadius: '9999px',
            padding: '0.75rem 1.25rem',
            fontSize: '0.92rem',
            fontWeight: '800',
            cursor: 'pointer',
            boxShadow: '0 10px 25px -5px rgba(13, 148, 136, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.2)',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          className="pulse-live"
          title="Aarogya AI Voice Assistant"
        >
          <Bot size={22} />
          <span>{t('ai_voice_btn')}</span>
        </button>
      </div>

      {/* Auth & Biometric Login Modal */}
      <AuthModal onAutofillOtpRef={autofillRef} />

      {/* ASHA Access Denied Barrier Modal (Strict Role Enforcement) */}
      <AshaAccessDeniedModal
        isOpen={isAshaDeniedModalOpen}
        onClose={() => setIsAshaDeniedModalOpen(false)}
        onSwitchToAshaLogin={() => {
          setIsAshaDeniedModalOpen(false);
          setIsAuthModalOpen(true);
        }}
      />

      {/* AI Face Recognition Camera Modal */}
      <FaceRecognitionModal
        isOpen={isFaceModalOpen}
        onClose={() => setIsFaceModalOpen(false)}
        mode={faceModalMode}
        onAuthenticated={(u) => {
          if (u?.role === 'asha') {
            setActiveTab('asha_suite');
          }
        }}
      />
    </div>
  );
}
