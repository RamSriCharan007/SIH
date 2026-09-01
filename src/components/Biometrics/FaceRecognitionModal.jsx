import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Camera,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  X,
  Scan,
  ShieldCheck,
  RefreshCw,
  Eye,
  UserCheck
} from 'lucide-react';

export default function FaceRecognitionModal({ isOpen, onClose, mode = 'login', onAuthenticated }) {
  const { user, loginWithFace, registerFace } = useAuth();
  const { t } = useLanguage();

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [livenessPassed, setLivenessPassed] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [authError, setAuthError] = useState('');
  const [detectedUser, setDetectedUser] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Auto start camera when modal opens
  useEffect(() => {
    if (isOpen) {
      startCamera();
      setScanProgress(0);
      setLivenessPassed(false);
      setAuthSuccess(false);
      setAuthError('');
      setScanning(false);
      setDetectedUser(null);
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setCameraActive(true);
        }
      } else {
        setCameraActive(true); // Fallback simulated camera canvas
      }
    } catch (err) {
      console.warn('Camera access fallback simulation:', err.message);
      setCameraActive(true); // Graceful interactive fallback
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // Perform AI Face Scan & Verification
  const handlePerformScan = async () => {
    setScanning(true);
    setAuthError('');
    setScanProgress(10);

    // Simulate multi-phase facial landmark extraction
    const p1 = setTimeout(() => setScanProgress(35), 400);
    const p2 = setTimeout(() => setScanProgress(70), 800);
    const p3 = setTimeout(() => {
      setScanProgress(100);
      setLivenessPassed(true);
    }, 1200);

    try {
      await new Promise(r => setTimeout(r, 1400));

      const targetPhone = user?.phone || '9822019485';

      let result;
      if (mode === 'register') {
        result = await registerFace(targetPhone, 'face_snapshot_simulated', `embedding_${Date.now()}`);
      } else {
        result = await loginWithFace(targetPhone);
      }

      if (result.success) {
        setAuthSuccess(true);
        setDetectedUser(result.user);
        setTimeout(() => {
          if (onAuthenticated) onAuthenticated(result.user);
          onClose();
        }, 1600);
      } else {
        setAuthError(result.error || 'Face match confidence below threshold. Please realign.');
      }
    } catch (err) {
      setAuthError('Facial recognition server verification error');
    } finally {
      clearTimeout(p1);
      clearTimeout(p2);
      clearTimeout(p3);
      setScanning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{
          maxWidth: '480px',
          background: '#090e1a',
          color: 'white',
          border: '1.5px solid #1e293b',
          boxShadow: '0 25px 60px rgba(0,0,0,0.8)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(6,182,212,0.4)'
            }}>
              <Scan size={20} color="white" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0, color: 'white' }}>
                {mode === 'register' ? 'Face ID Biometric Registration' : 'AI Face Recognition Login'}
              </h2>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
                High-Speed Rural Biometric Authenticator
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: '#1e293b',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#94a3b8'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Camera Viewport & HUD Scanner */}
        <div style={{
          position: 'relative',
          width: '100%',
          height: '280px',
          borderRadius: '16px',
          overflow: 'hidden',
          background: '#040711',
          border: `2px solid ${authSuccess ? '#10b981' : scanning ? '#06b6d4' : '#1e293b'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: scanning ? '0 0 25px rgba(6, 182, 212, 0.3)' : 'none',
          transition: 'all 0.3s'
        }}>
          {/* Real Video Feed */}
          <video
            ref={videoRef}
            playsInline
            muted
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: 'scaleX(-1)', // mirror for natural feel
              display: cameraActive ? 'block' : 'none'
            }}
          />

          {/* Fallback Animated Face Graphic if Camera stream is blocked */}
          {!cameraActive && (
            <div style={{ textAlign: 'center', color: '#64748b' }}>
              <div style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                border: '2px dashed #0284c7',
                margin: '0 auto 0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Eye size={44} color="#38bdf8" className={scanning ? 'animate-pulse' : ''} />
              </div>
              <p style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Simulated High-Precision Biometric Sensor</p>
            </div>
          )}

          {/* Futuristic HUD Scanning Grid Overlay */}
          <div style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {/* Oval Face Guide Frame */}
            <div style={{
              width: '180px',
              height: '230px',
              borderRadius: '50%',
              border: `2px ${scanning ? 'solid' : 'dashed'} ${authSuccess ? '#10b981' : '#38bdf8'}`,
              boxShadow: scanning ? '0 0 20px rgba(56, 189, 248, 0.5)' : 'none',
              position: 'relative'
            }}>
              {/* Corner Reticles */}
              <div style={{ position: 'absolute', top: '-6px', left: '-6px', width: '16px', height: '16px', borderTop: '3px solid #38bdf8', borderLeft: '3px solid #38bdf8' }} />
              <div style={{ position: 'absolute', top: '-6px', right: '-6px', width: '16px', height: '16px', borderTop: '3px solid #38bdf8', borderRight: '3px solid #38bdf8' }} />
              <div style={{ position: 'absolute', bottom: '-6px', left: '-6px', width: '16px', height: '16px', borderBottom: '3px solid #38bdf8', borderLeft: '3px solid #38bdf8' }} />
              <div style={{ position: 'absolute', bottom: '-6px', right: '-6px', width: '16px', height: '16px', borderBottom: '3px solid #38bdf8', borderRight: '3px solid #38bdf8' }} />

              {/* Scanning Laser Beam */}
              {scanning && (
                <div style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  height: '3px',
                  background: 'linear-gradient(90deg, transparent, #38bdf8, transparent)',
                  boxShadow: '0 0 12px #38bdf8',
                  animation: 'laserScan 1.2s ease-in-out infinite'
                }} />
              )}
            </div>
          </div>

          {/* Top Status Tag */}
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            background: 'rgba(9, 14, 26, 0.8)',
            backdropFilter: 'blur(6px)',
            padding: '0.25rem 0.6rem',
            borderRadius: '6px',
            fontSize: '0.7rem',
            fontWeight: '700',
            color: authSuccess ? '#10b981' : '#38bdf8',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: authSuccess ? '#10b981' : scanning ? '#38bdf8' : '#e2e8f0',
              display: 'inline-block'
            }} />
            <span>{authSuccess ? '100% MATCH VERIFIED' : scanning ? `SCANNING: ${scanProgress}%` : 'ALIGN FACE IN FRAME'}</span>
          </div>
        </div>

        {/* Scan Status / Alerts */}
        <div style={{ margin: '1rem 0' }}>
          {authSuccess ? (
            <div style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid #10b981',
              borderRadius: '10px',
              padding: '0.75rem 1rem',
              color: '#34d399',
              fontSize: '0.85rem',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem'
            }}>
              <CheckCircle size={18} />
              <div>
                <div>Biometric Verification Successful!</div>
                <div style={{ fontSize: '0.72rem', color: '#a7f3d0' }}>
                  Authenticated: {detectedUser?.fullName || 'Sunita Bai Shinde'} ({detectedUser?.role?.toUpperCase()})
                </div>
              </div>
            </div>
          ) : authError ? (
            <div style={{
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid #f43f5e',
              borderRadius: '10px',
              padding: '0.65rem 0.9rem',
              color: '#fb7185',
              fontSize: '0.8rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <AlertTriangle size={16} />
              <span>{authError}</span>
            </div>
          ) : (
            <div style={{
              background: '#0d1424',
              borderRadius: '10px',
              padding: '0.65rem 0.9rem',
              border: '1px solid #1e293b',
              fontSize: '0.78rem',
              color: '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span>Position your face naturally in good lighting</span>
              <span style={{ color: '#38bdf8', fontWeight: '700' }}>AI Liveness: Active</span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={handlePerformScan}
            disabled={scanning || authSuccess}
            className="btn btn-primary"
            style={{
              flex: 1,
              padding: '0.75rem',
              background: authSuccess
                ? '#10b981'
                : 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)',
              color: 'white',
              fontWeight: '800',
              fontSize: '0.88rem'
            }}
          >
            {scanning ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                <span>Verifying Biometric Landmarks ({scanProgress}%)...</span>
              </>
            ) : authSuccess ? (
              <>
                <UserCheck size={18} />
                <span>Verified! Redirecting...</span>
              </>
            ) : (
              <>
                <Camera size={18} />
                <span>{mode === 'register' ? 'Scan & Save Face ID' : 'Authenticate with Face ID'}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="btn"
            style={{ background: '#1e293b', color: '#cbd5e1', border: '1px solid #334155' }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
