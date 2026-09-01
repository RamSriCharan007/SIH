import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import IssueReceiptModal from './IssueReceiptModal';
import HospitalLoginModal from './HospitalLoginModal';
import {
  Hospital,
  ShieldCheck,
  Lock,
  LogOut,
  Users,
  Video,
  Bed,
  Droplet,
  HeartPulse,
  Activity,
  FileText,
  Clock,
  Phone,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Plus,
  QrCode,
  MapPin,
  ChevronRight,
  Stethoscope,
  Sparkles,
  Search,
  Printer,
  ShieldAlert,
  Send,
  Eye,
  ArrowUpRight,
  ExternalLink,
  Pill,
  UserCheck
} from 'lucide-react';

export default function HospitalPortalView({ onStartVideoCall }) {
  const { lang, t } = useLanguage();

  const [authData, setAuthData] = useState(() => {
    const saved = localStorage.getItem('gramin_hospital_auth');
    return saved ? JSON.parse(saved) : null;
  });

  const activeHospital = authData?.hospital || null;
  const token = authData?.token || null;

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('requests'); // 'requests' | 'resources' | 'doctors' | 'receipts' | 'security'
  const [patientRequests, setPatientRequests] = useState([]);
  const [receiptsList, setReceiptsList] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTier, setFilterTier] = useState('ALL'); // 'ALL' | 'CRITICAL' | 'MILD' | 'PENDING' | 'ADMITTED'

  // Modals
  const [selectedPatientForReceipt, setSelectedPatientForReceipt] = useState(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [viewingReceipt, setViewingReceipt] = useState(null);

  // Admission Modal
  const [admitTargetPatient, setAdmitTargetPatient] = useState(null);
  const [selectedBedType, setSelectedBedType] = useState('General Ward Bed #03');
  const [selectedDoctorAssign, setSelectedDoctorAssign] = useState('');

  // Referral Modal
  const [referTargetPatient, setReferTargetPatient] = useState(null);
  const [referralCenter, setReferralCenter] = useState('Nashik Civil District General Hospital');
  const [referralReason, setReferralReason] = useState('Requires advanced emergency surgical trauma ICU care');

  // Direct Walk-In Patient Modal
  const [isWalkinModalOpen, setIsWalkinModalOpen] = useState(false);
  const [walkinName, setWalkinName] = useState('');
  const [walkinPhone, setWalkinPhone] = useState('');
  const [walkinAge, setWalkinAge] = useState('32');
  const [walkinGender, setWalkinGender] = useState('Female');
  const [walkinEmergency, setWalkinEmergency] = useState('Snakebite Emergency (Viper bite)');
  const [walkinTier, setWalkinTier] = useState('60_CRITICAL_EMERGENCY');

  // Status Notification Banner
  const [notification, setNotification] = useState('');

  const triggerNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4000);
  };

  useEffect(() => {
    if (activeHospital && token) {
      fetchHospitalData();
    }
  }, [activeHospital?.id, token]);

  const handleLogout = () => {
    localStorage.removeItem('gramin_hospital_auth');
    setAuthData(null);
    triggerNotification('🔒 Session safely locked and cleared.');
  };

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token,
    'x-hosp-id': activeHospital?.id || ''
  });

  const fetchHospitalData = async () => {
    if (!activeHospital || !token) return;
    setIsLoadingRequests(true);

    try {
      // 1. Fetch live requests
      const resReq = await fetch('/api/hospital/requests', { headers: getAuthHeaders() });
      if (resReq.status === 401 || resReq.status === 403) {
        handleLogout();
        alert('Hospital session expired or access was revoked by Developer Admin.');
        return;
      }
      const dataReq = await resReq.json();
      if (dataReq.success && Array.isArray(dataReq.requests)) {
        setPatientRequests(dataReq.requests);
      }

      // 2. Fetch receipts
      const resRcp = await fetch('/api/consultations/receipts', { headers: getAuthHeaders() });
      const dataRcp = await resRcp.json();
      if (dataRcp.success && Array.isArray(dataRcp.receipts)) {
        setReceiptsList(dataRcp.receipts);
      }

      // 3. Fetch audit logs
      const resLogs = await fetch('/api/hospital/auth/audit-logs', { headers: getAuthHeaders() });
      const dataLogs = await resLogs.json();
      if (dataLogs.success && Array.isArray(dataLogs.logs)) {
        setAuditLogs(dataLogs.logs);
      }

      // 4. Fetch updated profile & live telemetry
      const resProf = await fetch('/api/hospital/profile', { headers: getAuthHeaders() });
      const dataProf = await resProf.json();
      if (dataProf.success && dataProf.hospital) {
        setAuthData(prev => ({ ...prev, hospital: dataProf.hospital }));
        localStorage.setItem('gramin_hospital_auth', JSON.stringify({ ...authData, hospital: dataProf.hospital }));
      }
    } catch (err) {
      console.warn('Hospital fetch warning:', err);
    } finally {
      setIsLoadingRequests(false);
    }
  };

  // Toggle Doctor Video Status
  const handleToggleDoctorVideo = async (docId, currentVal) => {
    try {
      const res = await fetch('/api/hospital/doctors/' + docId + '/toggle-video', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ isAvailable: !currentVal })
      });
      const data = await res.json();
      if (data.success && data.doctor) {
        setAuthData(prev => {
          const updatedDocs = (prev.hospital.doctors || []).map(d => d.id === docId ? data.doctor : d);
          const updatedHospital = { ...prev.hospital, doctors: updatedDocs };
          const updated = { ...prev, hospital: updatedHospital };
          localStorage.setItem('gramin_hospital_auth', JSON.stringify(updated));
          return updated;
        });
        triggerNotification(`📹 Doctor video status updated: ${data.doctor.name} is now ${data.doctor.is_available_for_video ? 'ONLINE (Ready for Video)' : 'OFFLINE'}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Admit Patient with Bed Allocation & Auto Bed Deduction
  const handleAdmitSubmit = async () => {
    if (!admitTargetPatient) return;
    try {
      const res = await fetch('/api/hospital/requests/' + admitTargetPatient.id + '/admit', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          allocatedBed: selectedBedType,
          assignedDoctor: selectedDoctorAssign || activeHospital?.doctors?.[0]?.name || activeHospital.nodal_officer || 'Dr. On-Duty MO',
          status: 'ADMITTED'
        })
      });
      const data = await res.json();
      if (data.success && data.request) {
        setPatientRequests(prev => prev.map(r => r.id === admitTargetPatient.id ? data.request : r));
        if (data.live_status) {
          setAuthData(prev => {
            const updatedHosp = { ...prev.hospital, live_status: data.live_status };
            const updated = { ...prev, hospital: updatedHosp };
            localStorage.setItem('gramin_hospital_auth', JSON.stringify(updated));
            return updated;
          });
        }
        triggerNotification(`✅ Patient ${admitTargetPatient.patientName} admitted to ${selectedBedType}. Ward bed capacity updated.`);
        setAdmitTargetPatient(null);
        fetchHospitalData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Discharge Patient & Release Bed
  const handleDischargePatient = async (patientReq) => {
    if (!confirm(`Confirm discharge for ${patientReq.patientName}? This will release the allocated bed back to hospital capacity.`)) return;

    try {
      const res = await fetch('/api/hospital/requests/' + patientReq.id + '/discharge', {
        method: 'POST',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.success && data.request) {
        setPatientRequests(prev => prev.map(r => r.id === patientReq.id ? data.request : r));
        if (data.live_status) {
          setAuthData(prev => {
            const updatedHosp = { ...prev.hospital, live_status: data.live_status };
            const updated = { ...prev, hospital: updatedHosp };
            localStorage.setItem('gramin_hospital_auth', JSON.stringify(updated));
            return updated;
          });
        }
        triggerNotification(`🚪 Patient ${patientReq.patientName} discharged. Bed capacity restored.`);
        fetchHospitalData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Refer Patient to Tertiary Center
  const handleReferSubmit = async () => {
    if (!referTargetPatient) return;
    try {
      const res = await fetch('/api/hospital/requests/' + referTargetPatient.id + '/refer', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          tertiaryHospital: referralCenter,
          referralReason: referralReason
        })
      });
      const data = await res.json();
      if (data.success && data.request) {
        setPatientRequests(prev => prev.map(r => r.id === referTargetPatient.id ? data.request : r));
        triggerNotification(`🚑 Emergency referral created for ${referTargetPatient.patientName} to ${referralCenter}`);
        setReferTargetPatient(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Register Direct Walk-In Emergency Patient
  const handleWalkinSubmit = async (e) => {
    e.preventDefault();
    if (!walkinName.trim()) return;

    try {
      const res = await fetch('/api/hospital/requests', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          patientName: walkinName.trim(),
          phone: walkinPhone.trim() || '9876543210',
          age: parseInt(walkinAge) || 35,
          gender: walkinGender,
          emergencyType: walkinEmergency,
          triageTier: walkinTier,
          assignedDoctor: activeHospital?.doctors?.[0]?.name || activeHospital.nodal_officer || 'On-Duty Medical Officer'
        })
      });
      const data = await res.json();
      if (data.success && data.request) {
        setPatientRequests(prev => [data.request, ...prev]);
        triggerNotification(`➕ Registered direct emergency walk-in: ${walkinName} (${data.request.tokenId})`);
        setIsWalkinModalOpen(false);
        setWalkinName('');
        setWalkinPhone('');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Bed & Resource Adjusters
  const adjustLiveBed = async (field, delta) => {
    const current = activeHospital?.live_status?.beds?.[field] || 0;
    const updatedVal = Math.max(0, current + delta);

    try {
      const res = await fetch('/api/hospital/resources/beds', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ [field]: updatedVal })
      });
      const data = await res.json();
      if (data.success && data.beds) {
        setAuthData(prev => {
          const updatedHosp = { ...prev.hospital, live_status: { ...prev.hospital.live_status, beds: data.beds } };
          const updated = { ...prev, hospital: updatedHosp };
          localStorage.setItem('gramin_hospital_auth', JSON.stringify(updated));
          return updated;
        });
        triggerNotification(`🛏️ Live bed count updated: ${field} = ${updatedVal}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const adjustLiveBlood = async (bloodType, delta) => {
    const current = activeHospital?.live_status?.blood_stock?.[bloodType] || 0;
    const updatedVal = Math.max(0, current + delta);

    try {
      const res = await fetch('/api/hospital/resources/blood', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ [bloodType]: updatedVal })
      });
      const data = await res.json();
      if (data.success && data.blood_stock) {
        setAuthData(prev => {
          const updatedHosp = { ...prev.hospital, live_status: { ...prev.hospital.live_status, blood_stock: data.blood_stock } };
          const updated = { ...prev, hospital: updatedHosp };
          localStorage.setItem('gramin_hospital_auth', JSON.stringify(updated));
          return updated;
        });
        triggerNotification(`🩸 Blood bank unit updated: ${bloodType} = ${updatedVal} units`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const adjustLiveMedicine = async (medKey, delta) => {
    const current = activeHospital?.live_status?.medicines_stock?.[medKey] || 0;
    const updatedVal = Math.max(0, current + delta);

    try {
      const res = await fetch('/api/hospital/resources/medicines', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ [medKey]: updatedVal })
      });
      const data = await res.json();
      if (data.success && data.medicines_stock) {
        setAuthData(prev => {
          const updatedHosp = { ...prev.hospital, live_status: { ...prev.hospital.live_status, medicines_stock: data.medicines_stock } };
          const updated = { ...prev, hospital: updatedHosp };
          localStorage.setItem('gramin_hospital_auth', JSON.stringify(updated));
          return updated;
        });
        triggerNotification(`💊 Medicine stock updated: ${medKey} = ${updatedVal}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Unauthenticated Welcome Card
  if (!activeHospital || !token) {
    return (
      <div className="glass-card" style={{ padding: '3.5rem 2rem', textAlign: 'center', maxWidth: '740px', margin: '2rem auto', borderRadius: '26px', border: '1.5px solid #bae6fd', boxShadow: '0 20px 50px rgba(2, 132, 199, 0.12)' }}>
        <div style={{
          width: '76px',
          height: '76px',
          borderRadius: '22px',
          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
          boxShadow: '0 10px 25px rgba(2, 132, 199, 0.4)'
        }}>
          <Hospital size={40} />
        </div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#e0f2fe', color: '#0369a1', padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '800', marginBottom: '1rem', letterSpacing: '0.04em' }}>
          <ShieldCheck size={14} /> STATE HEALTH DIRECTORATE • DEVELOPER PROVISIONED ACCESS ONLY
        </div>

        <h2 style={{ fontSize: '1.95rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.65rem', letterSpacing: '-0.02em' }}>
          रुग्णालय व वैद्यकीय अधिकारी पोर्टल (Hospital Portal)
        </h2>

        <p style={{ color: '#64748b', fontSize: '0.96rem', maxWidth: '560px', margin: '0 auto 1.85rem', lineHeight: 1.65 }}>
          या पोर्टलद्वारे आपल्या रुग्णालयासाठी विनंती केलेल्या रुग्णांचे लाइव्ह बेड वाटप, इमर्जन्सी व्हिडिओ टेलिकन्सल्टेशन, औषध साठा व डिजिटल कन्सल्टेशन पावती नियंत्रित करता येईल. प्रवेश केवळ <strong>Master Developer Ram Sri Charan</strong> यांनी प्रमाणित केलेल्या पासकीद्वारेच शक्य आहे.
        </p>

        <div style={{ display: 'flex', gap: '0.85rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => setIsLoginModalOpen(true)}
            className="btn btn-primary"
            style={{
              padding: '0.9rem 2rem',
              fontSize: '1.02rem',
              fontWeight: '800',
              display: 'flex',
              alignItems: 'center',
              gap: '0.55rem',
              boxShadow: '0 6px 20px rgba(2, 132, 199, 0.45)'
            }}
          >
            <ShieldCheck size={20} />
            <span>प्रमाणित रुग्णालय लॉगिन (Verified Login)</span>
          </button>

          <a
            href="/developer-portal"
            target="_blank"
            rel="noreferrer"
            className="btn btn-secondary"
            style={{
              padding: '0.9rem 1.4rem',
              fontSize: '0.92rem',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              color: '#0284c7'
            }}
          >
            <span>डेव्हलपर क्रेडेंशियल्स पोर्टल</span>
            <ExternalLink size={15} />
          </a>
        </div>

        <HospitalLoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onLoginSuccess={(h) => {
            const saved = localStorage.getItem('gramin_hospital_auth');
            if (saved) setAuthData(JSON.parse(saved));
            triggerNotification(`🎉 Welcome, ${h.name}! Synchronized with State Health Directorate.`);
          }}
        />
      </div>
    );
  }

  // Filtered requests
  const filteredRequests = patientRequests.filter(r => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = (r.patientName || '').toLowerCase().includes(q) ||
      (r.phone && r.phone.includes(q)) ||
      (r.tokenId && r.tokenId.toLowerCase().includes(q)) ||
      (r.village && r.village.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    if (filterTier === 'CRITICAL') return r.triageTier === '60_CRITICAL_EMERGENCY';
    if (filterTier === 'MILD') return r.triageTier !== '60_CRITICAL_EMERGENCY';
    if (filterTier === 'PENDING') return r.status === 'PENDING_TRIAGE' || r.status === 'CONFIRMED_ENROUTE';
    if (filterTier === 'ADMITTED') return r.status === 'ADMITTED';
    return true;
  });

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Toast Notification */}
      {notification && (
        <div style={{
          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
          color: 'white',
          padding: '0.75rem 1.25rem',
          borderRadius: '12px',
          fontSize: '0.86rem',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          boxShadow: '0 8px 20px rgba(2, 132, 199, 0.35)',
          animation: 'fadeIn 0.3s ease'
        }}>
          <CheckCircle2 size={18} />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        borderRadius: '22px',
        padding: '1.5rem 1.75rem',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.25rem',
        border: '1.5px solid #334155',
        boxShadow: '0 16px 36px rgba(0,0,0,0.25)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.15rem' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.75rem',
            boxShadow: '0 8px 20px rgba(2, 132, 199, 0.4)'
          }}>
            🏥
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.45rem', fontWeight: '800', margin: 0, color: '#f8fafc', letterSpacing: '-0.02em' }}>
                {lang === 'mr' ? (activeHospital.name_mr || activeHospital.name) : activeHospital.name}
              </h2>
              <span className="badge badge-teal" style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem', fontWeight: '800' }}>
                <ShieldCheck size={12} /> {activeHospital.verification_badge || 'NABH & DHS Verified'}
              </span>
            </div>
            <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '0.35rem', display: 'flex', gap: '1.15rem', flexWrap: 'wrap' }}>
              <span>Code: <strong style={{ color: '#38bdf8', fontFamily: 'JetBrains Mono, monospace' }}>{activeHospital.auth_code || activeHospital.id}</strong></span>
              <span>License: <strong style={{ color: '#cbd5e1' }}>{activeHospital.license_no}</strong></span>
              <span>Nodal CMO: <strong style={{ color: '#cbd5e1' }}>{activeHospital.nodal_officer}</strong></span>
              <span>District: <strong style={{ color: '#cbd5e1' }}>{activeHospital.district}</strong></span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setIsWalkinModalOpen(true)}
            className="btn btn-primary"
            style={{ fontSize: '0.82rem', padding: '0.5rem 0.95rem', display: 'flex', alignItems: 'center', gap: '5px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }}
          >
            <Plus size={15} /> <span>+ Walk-in Patient</span>
          </button>
          <button
            onClick={fetchHospitalData}
            className="btn btn-secondary"
            style={{ fontSize: '0.82rem', padding: '0.5rem 0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <RefreshCw size={14} className={isLoadingRequests ? 'spin' : ''} />
            <span>Sync Live</span>
          </button>
          <button
            onClick={handleLogout}
            className="btn btn-danger"
            style={{ fontSize: '0.82rem', padding: '0.5rem 0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <LogOut size={14} />
            <span>Lock & Logout</span>
          </button>
        </div>
      </div>

      {/* Real-time KPI Statistics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '0.85rem' }}>
        <div className="glass-card" style={{ padding: '1rem 1.25rem', borderLeft: '4px solid #0284c7', background: 'white' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#64748b' }}>REQUESTED PATIENTS</div>
          <div style={{ fontSize: '1.45rem', fontWeight: '800', color: '#0284c7', marginTop: '0.2rem' }}>
            {patientRequests.length} Patients
          </div>
          <div style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: '700' }}>
            ✓ Privacy Isolated for {activeHospital.auth_code}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1rem 1.25rem', borderLeft: '4px solid #10b981', background: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#64748b' }}>LIVE GENERAL BEDS</span>
            <div style={{ display: 'flex', gap: '2px' }}>
              <button onClick={() => adjustLiveBed('general_available', -1)} style={{ width: '20px', height: '20px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#f8fafc', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '800' }}>-</button>
              <button onClick={() => adjustLiveBed('general_available', 1)} style={{ width: '20px', height: '20px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#f8fafc', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '800' }}>+</button>
            </div>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: '800', color: '#10b981', marginTop: '0.2rem' }}>
            {activeHospital.live_status?.beds?.general_available ?? 12} / {activeHospital.live_status?.beds?.general_total ?? 30}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Available in general wards</div>
        </div>

        <div className="glass-card" style={{ padding: '1rem 1.25rem', borderLeft: '4px solid #ef4444', background: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#64748b' }}>LIVE ICU BEDS</span>
            <div style={{ display: 'flex', gap: '2px' }}>
              <button onClick={() => adjustLiveBed('icu_available', -1)} style={{ width: '20px', height: '20px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#f8fafc', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '800' }}>-</button>
              <button onClick={() => adjustLiveBed('icu_available', 1)} style={{ width: '20px', height: '20px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#f8fafc', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '800' }}>+</button>
            </div>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: '800', color: '#ef4444', marginTop: '0.2rem' }}>
            {activeHospital.live_status?.beds?.icu_available ?? 1} / {activeHospital.live_status?.beds?.icu_total ?? 4}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Critical care capacity</div>
        </div>

        <div className="glass-card" style={{ padding: '1rem 1.25rem', borderLeft: '4px solid #8b5cf6', background: 'white' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#64748b' }}>VIDEO-READY DOCTORS</div>
          <div style={{ fontSize: '1.45rem', fontWeight: '800', color: '#8b5cf6', marginTop: '0.2rem' }}>
            {(activeHospital.doctors || []).filter(d => d.is_available_for_video).length} Active
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Online for citizen teleconsult</div>
        </div>

        <div className="glass-card" style={{ padding: '1rem 1.25rem', borderLeft: '4px solid #f59e0b', background: 'white' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#64748b' }}>EMERGENCY SUPPLIES</div>
          <div style={{ fontSize: '1.45rem', fontWeight: '800', color: '#f59e0b', marginTop: '0.2rem' }}>
            {activeHospital.live_status?.medicines_stock?.anti_venom_vials ?? 18} Vials
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Anti-Venom stock on-site</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.2rem', overflowX: 'auto' }}>
        <button
          onClick={() => setActiveTab('requests')}
          style={{
            padding: '0.7rem 1.25rem',
            borderRadius: '10px 10px 0 0',
            border: 'none',
            background: activeTab === 'requests' ? '#0284c7' : 'transparent',
            color: activeTab === 'requests' ? 'white' : '#64748b',
            fontWeight: '800',
            fontSize: '0.88rem',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          👥 विनंती केलेले रुग्ण / Triage Queue ({patientRequests.length})
        </button>

        <button
          onClick={() => setActiveTab('resources')}
          style={{
            padding: '0.7rem 1.25rem',
            borderRadius: '10px 10px 0 0',
            border: 'none',
            background: activeTab === 'resources' ? '#0284c7' : 'transparent',
            color: activeTab === 'resources' ? 'white' : '#64748b',
            fontWeight: '800',
            fontSize: '0.88rem',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          🛏️ बेड्स व रक्त साठा / Resource Console
        </button>

        <button
          onClick={() => setActiveTab('doctors')}
          style={{
            padding: '0.7rem 1.25rem',
            borderRadius: '10px 10px 0 0',
            border: 'none',
            background: activeTab === 'doctors' ? '#0284c7' : 'transparent',
            color: activeTab === 'doctors' ? 'white' : '#64748b',
            fontWeight: '800',
            fontSize: '0.88rem',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          📹 डॉक्टर व्हिडिओ रोस्टर / Teleconsult Roster
        </button>

        <button
          onClick={() => setActiveTab('receipts')}
          style={{
            padding: '0.7rem 1.25rem',
            borderRadius: '10px 10px 0 0',
            border: 'none',
            background: activeTab === 'receipts' ? '#0284c7' : 'transparent',
            color: activeTab === 'receipts' ? 'white' : '#64748b',
            fontWeight: '800',
            fontSize: '0.88rem',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          🧾 डिजिटल पावत्या / Prescriptions ({receiptsList.length})
        </button>

        <button
          onClick={() => setActiveTab('security')}
          style={{
            padding: '0.7rem 1.25rem',
            borderRadius: '10px 10px 0 0',
            border: 'none',
            background: activeTab === 'security' ? '#0284c7' : 'transparent',
            color: activeTab === 'security' ? 'white' : '#64748b',
            fontWeight: '800',
            fontSize: '0.88rem',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          🔒 सुरक्षा व ऑडिट लॉग्स / Security Audit
        </button>
      </div>

      {/* TAB 1: REQUESTED PATIENTS & LIVE TRIAGE QUEUE */}
      {activeTab === 'requests' && (
        <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '20px', background: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.85rem' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                आपल्या रुग्णालयासाठी विनंती केलेली रुग्ण यादी (Requested Patients)
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0.25rem 0 0' }}>
                🔒 <strong>Zero-Trust Privacy Enforced:</strong> Strictly displaying patients allocated to {activeHospital.name} ({activeHospital.auth_code}).
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', width: '260px' }}>
                <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  placeholder="रुग्ण नाव / फोन / टोकन शोधा..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '2.1rem', fontSize: '0.82rem' }}
                />
              </div>

              <select
                className="input-field"
                style={{ width: '150px', fontSize: '0.82rem' }}
                value={filterTier}
                onChange={(e) => setFilterTier(e.target.value)}
              >
                <option value="ALL">All Categories</option>
                <option value="CRITICAL">🔴 60% Critical</option>
                <option value="MILD">🌿 40% Mild</option>
                <option value="PENDING">⏳ Pending / En Route</option>
                <option value="ADMITTED">🛏️ Admitted Wards</option>
              </select>
            </div>
          </div>

          {filteredRequests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
              <Users size={36} style={{ color: '#cbd5e1', marginBottom: '0.5rem' }} />
              <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>कोणतीही रुग्ण विनंती सापडली नाही (No matching patient requests)</div>
              <p style={{ fontSize: '0.8rem', marginTop: '0.3rem' }}>Click "+ Walk-in Patient" above to register an emergency arrival directly.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {filteredRequests.map(req => {
                const isCritical = req.triageTier === '60_CRITICAL_EMERGENCY';
                const isAdmitted = req.status === 'ADMITTED';
                const isDischarged = req.status === 'DISCHARGED';
                const isReferred = req.status === 'REFERRED_TERTIARY';

                return (
                  <div
                    key={req.id}
                    style={{
                      background: isDischarged ? '#f8fafc' : '#ffffff',
                      borderLeft: isCritical ? '6px solid #ef4444' : '6px solid #10b981',
                      border: '1.5px solid #e2e8f0',
                      borderRadius: '16px',
                      padding: '1.25rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '1rem',
                      opacity: isDischarged ? 0.75 : 1
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flexWrap: 'wrap' }}>
                        <span className="badge" style={{ background: '#0f172a', color: '#38bdf8', fontWeight: '800', fontFamily: 'JetBrains Mono, monospace' }}>
                          {req.tokenId}
                        </span>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                          {req.patientName}
                        </h4>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>({req.age} Y / {req.gender})</span>
                        <span className={isCritical ? 'badge badge-emergency' : 'badge badge-green'}>
                          {isCritical ? '🔴 60% Critical Emergency' : '🌿 40% Mild Category'}
                        </span>
                        <span className="badge" style={{
                          background: isAdmitted ? '#dcfce7' : isDischarged ? '#f1f5f9' : '#e0f2fe',
                          color: isAdmitted ? '#166534' : isDischarged ? '#64748b' : '#0369a1',
                          fontWeight: '800'
                        }}>
                          {req.status}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.85rem', color: '#334155', marginTop: '0.35rem' }}>
                        🚨 Emergency: <strong>{req.emergencyType}</strong> • Village: <strong>{req.village}</strong> • Phone: <strong>+91 {req.phone}</strong>
                      </div>

                      {req.vitals && (
                        <div style={{ display: 'flex', gap: '0.85rem', marginTop: '0.4rem', fontSize: '0.78rem', color: '#475569', flexWrap: 'wrap' }}>
                          <span>BP: <strong>{req.vitals.bp}</strong></span>
                          <span>Pulse: <strong>{req.vitals.pulse}</strong></span>
                          <span>SpO2: <strong>{req.vitals.spo2}</strong></span>
                          <span>Temp: <strong>{req.vitals.temp}</strong></span>
                          {req.allocatedBed && req.allocatedBed !== 'Unassigned' && (
                            <span style={{ color: '#0284c7', fontWeight: '800', background: '#e0f2fe', padding: '0.1rem 0.4rem', borderRadius: '6px' }}>
                              🛏️ {req.allocatedBed}
                            </span>
                          )}
                          {req.assignedDoctor && (
                            <span style={{ color: '#059669', fontWeight: '700' }}>
                              👨‍⚕️ {req.assignedDoctor}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                      {!isAdmitted && !isDischarged && (
                        <button
                          onClick={() => {
                            setAdmitTargetPatient(req);
                            setSelectedBedType(isCritical ? 'ICU Ventilator Bed #01' : 'General Ward Bed #03');
                          }}
                          className="btn btn-secondary"
                          style={{ fontSize: '0.8rem', padding: '0.45rem 0.75rem', background: '#f0fdf4', color: '#166534', fontWeight: '700' }}
                        >
                          <Bed size={14} /> <span>Admit Bed</span>
                        </button>
                      )}

                      {isAdmitted && (
                        <button
                          onClick={() => handleDischargePatient(req)}
                          className="btn btn-secondary"
                          style={{ fontSize: '0.8rem', padding: '0.45rem 0.75rem', background: '#fef2f2', color: '#b91c1c', fontWeight: '700' }}
                        >
                          <span>Discharge Bed</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          if (onStartVideoCall) {
                            onStartVideoCall({
                              name: activeHospital?.doctors?.[0]?.name || activeHospital.nodal_officer,
                              hospital: activeHospital.name,
                              reg_no: activeHospital?.doctors?.[0]?.reg_no || 'MMC-ACTIVE',
                              patientName: req.patientName,
                              patientPhone: req.phone,
                              emergencyType: req.emergencyType
                            });
                          }
                        }}
                        className="btn btn-primary"
                        style={{ fontSize: '0.8rem', padding: '0.45rem 0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Video size={14} /> <span>Start Video Call</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedPatientForReceipt(req);
                          setIsReceiptModalOpen(true);
                        }}
                        className="btn btn-primary"
                        style={{ fontSize: '0.8rem', padding: '0.45rem 0.75rem', background: 'linear-gradient(135deg, #0d9488 0%, #065f46 100%)', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <FileText size={14} /> <span>Issue Receipt</span>
                      </button>

                      {!isDischarged && !isReferred && (
                        <button
                          onClick={() => setReferTargetPatient(req)}
                          className="btn btn-secondary"
                          style={{ fontSize: '0.8rem', padding: '0.45rem 0.65rem' }}
                          title="Refer to Tertiary Hospital"
                        >
                          <span>Referral</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: LIVE BEDS & RESOURCE CONSOLE */}
      {activeTab === 'resources' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Beds Console */}
          <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '20px', background: 'white' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                🛏️ रुग्णालय वॉर्ड बेड्स थेट व्यवस्थापन (Live Beds Telemetry)
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0.25rem 0 0' }}>
                येथे केलेले बदल थेट नागरिक ॲप आणि १०८ रुग्णवाहिका रूटिंग सिस्टिममध्ये तात्काळ परावर्तित होतात.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#0284c7' }}>GENERAL WARD BEDS</div>
                <div style={{ fontSize: '2.2rem', fontWeight: '800', color: '#0f172a', margin: '0.35rem 0' }}>
                  {activeHospital.live_status?.beds?.general_available ?? 12}
                  <span style={{ fontSize: '1rem', color: '#94a3b8', fontWeight: '500' }}> / {activeHospital.live_status?.beds?.general_total ?? 30}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                  <button onClick={() => adjustLiveBed('general_available', -1)} className="btn btn-secondary" style={{ flex: 1, padding: '0.4rem' }}>-1</button>
                  <button onClick={() => adjustLiveBed('general_available', 1)} className="btn btn-primary" style={{ flex: 1, padding: '0.4rem' }}>+1</button>
                  <button onClick={() => adjustLiveBed('general_available', 5)} className="btn btn-primary" style={{ flex: 1, padding: '0.4rem' }}>+5</button>
                </div>
              </div>

              <div style={{ background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: '16px', padding: '1.25rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#dc2626' }}>ICU VENTILATOR BEDS</div>
                <div style={{ fontSize: '2.2rem', fontWeight: '800', color: '#991b1b', margin: '0.35rem 0' }}>
                  {activeHospital.live_status?.beds?.icu_available ?? 1}
                  <span style={{ fontSize: '1rem', color: '#f87171', fontWeight: '500' }}> / {activeHospital.live_status?.beds?.icu_total ?? 4}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                  <button onClick={() => adjustLiveBed('icu_available', -1)} className="btn btn-secondary" style={{ flex: 1, padding: '0.4rem' }}>-1</button>
                  <button onClick={() => adjustLiveBed('icu_available', 1)} className="btn btn-primary" style={{ flex: 1, padding: '0.4rem', background: '#dc2626' }}>+1</button>
                </div>
              </div>

              <div style={{ background: '#fdf4ff', border: '1.5px solid #f0abfc', borderRadius: '16px', padding: '1.25rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#c026d3' }}>OXYGEN & MATERNITY BEDS</div>
                <div style={{ fontSize: '2.2rem', fontWeight: '800', color: '#86198f', margin: '0.35rem 0' }}>
                  {activeHospital.live_status?.beds?.oxygen_beds_available ?? 8}
                  <span style={{ fontSize: '1rem', color: '#d946ef', fontWeight: '500' }}> Available</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                  <button onClick={() => adjustLiveBed('oxygen_beds_available', -1)} className="btn btn-secondary" style={{ flex: 1, padding: '0.4rem' }}>-1</button>
                  <button onClick={() => adjustLiveBed('oxygen_beds_available', 1)} className="btn btn-primary" style={{ flex: 1, padding: '0.4rem', background: '#c026d3' }}>+1</button>
                </div>
              </div>
            </div>
          </div>

          {/* Blood Stock Console */}
          <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '20px', background: 'white' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                🩸 रक्तपेढी थेट साठा (Live Blood Bank Units)
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0.25rem 0 0' }}>
                Last updated: {activeHospital.live_status?.blood_stock?.last_updated || 'Just now'}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
              {['A_pos', 'B_pos', 'O_pos', 'AB_pos', 'O_neg'].map(bt => {
                const label = bt.replace('_pos', '+').replace('_neg', '-');
                const units = activeHospital.live_status?.blood_stock?.[bt] ?? 0;
                return (
                  <div key={bt} style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '14px', padding: '1rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '1rem', fontWeight: '800', color: '#ef4444' }}>{label}</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', margin: '0.2rem 0' }}>{units}</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '0.5rem' }}>Units Available</div>
                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                      <button onClick={() => adjustLiveBlood(bt, -1)} style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white', fontWeight: '800', cursor: 'pointer' }}>-</button>
                      <button onClick={() => adjustLiveBlood(bt, 1)} style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #0284c7', background: '#0284c7', color: 'white', fontWeight: '800', cursor: 'pointer' }}>+</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Emergency Medicine Console */}
          <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '20px', background: 'white' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                💊 आपत्कालीन औषध व सर्पदंश साठा (Emergency Medicines Inventory)
              </h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
              <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: '14px', padding: '1rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#166534' }}>🐍 Anti-Venom Vials</div>
                <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#15803d', margin: '0.25rem 0' }}>
                  {activeHospital.live_status?.medicines_stock?.anti_venom_vials ?? 18} Vials
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button onClick={() => adjustLiveMedicine('anti_venom_vials', -1)} className="btn btn-secondary" style={{ flex: 1, padding: '0.3rem' }}>-1</button>
                  <button onClick={() => adjustLiveMedicine('anti_venom_vials', 5)} className="btn btn-primary" style={{ flex: 1, padding: '0.3rem' }}>+5</button>
                </div>
              </div>

              <div style={{ background: '#f0f9ff', border: '1.5px solid #bae6fd', borderRadius: '14px', padding: '1rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#0369a1' }}>💧 ORS Packets</div>
                <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0284c7', margin: '0.25rem 0' }}>
                  {activeHospital.live_status?.medicines_stock?.ors_packets ?? 350} Pkts
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button onClick={() => adjustLiveMedicine('ors_packets', -10)} className="btn btn-secondary" style={{ flex: 1, padding: '0.3rem' }}>-10</button>
                  <button onClick={() => adjustLiveMedicine('ors_packets', 50)} className="btn btn-primary" style={{ flex: 1, padding: '0.3rem' }}>+50</button>
                </div>
              </div>

              <div style={{ background: '#faf5ff', border: '1.5px solid #e9d5ff', borderRadius: '14px', padding: '1rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#6b21a8' }}>🫁 Oxygen Cylinders</div>
                <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#7e22ce', margin: '0.25rem 0' }}>
                  {activeHospital.live_status?.medicines_stock?.iv_fluids ?? 120} Units
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button onClick={() => adjustLiveMedicine('iv_fluids', -5)} className="btn btn-secondary" style={{ flex: 1, padding: '0.3rem' }}>-5</button>
                  <button onClick={() => adjustLiveMedicine('iv_fluids', 10)} className="btn btn-primary" style={{ flex: 1, padding: '0.3rem' }}>+10</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DOCTOR VIDEO ROSTER */}
      {activeTab === 'doctors' && (
        <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '20px', background: 'white' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
              👨‍⚕️ डॉक्टर ऑन-ड्युटी व थेट टेलिकन्सल्टेशन व्हिडिओ उपलब्धता
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0.25rem 0 0' }}>
              💡 ज्या डॉक्टरांचे बटण <strong>"Available for Video"</strong> असेल, तेच डॉक्टर ग्रामीण नागरिकांच्या टेलिकन्सल्टेशन यादीत दिसतील.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
            {(activeHospital.doctors || []).map(doc => (
              <div
                key={doc.id}
                style={{
                  background: 'white',
                  border: doc.is_available_for_video ? '2px solid #0d9488' : '1.5px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                  boxShadow: doc.is_available_for_video ? '0 8px 20px rgba(13, 148, 136, 0.12)' : 'none'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>
                      {lang === 'mr' ? (doc.name_mr || doc.name) : doc.name}
                    </h4>
                    <div style={{ fontSize: '0.78rem', color: '#0d9488', fontWeight: '700', marginTop: '2px' }}>
                      {lang === 'mr' ? (doc.speciality_mr || doc.speciality) : doc.speciality}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                      Reg No: <strong>{doc.reg_no}</strong> • Experience: {doc.experience}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      Phone: <strong>{doc.phone}</strong>
                    </div>
                  </div>
                  <span className={doc.is_available_for_video ? 'badge badge-green' : 'badge'}>
                    {doc.is_available_for_video ? '🟢 Video Ready' : '🔴 In Ward / Offline'}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
                  <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                    Shift: <strong>{doc.opd_timing}</strong>
                  </span>
                  <button
                    onClick={() => handleToggleDoctorVideo(doc.id, doc.is_available_for_video)}
                    className={doc.is_available_for_video ? 'btn btn-danger' : 'btn btn-primary'}
                    style={{ fontSize: '0.76rem', padding: '0.4rem 0.85rem', fontWeight: '800' }}
                  >
                    {doc.is_available_for_video ? 'व्हिडिओ बंद करा (Offline)' : 'व्हिडिओ सुरू करा (Available)'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ISSUED RECEIPTS & PRESCRIPTIONS */}
      {activeTab === 'receipts' && (
        <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '20px', background: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.85rem' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                या रुग्णालयाने जारी केलेल्या अधिकृत कन्सल्टेशन पावत्या ({receiptsList.length})
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0.25rem 0 0' }}>
                All generated clinical receipts are digitally sealed with State Health Directorate QR verification.
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedPatientForReceipt({
                  patientName: 'Walk-in Rural Patient',
                  phone: '9876543210',
                  age: 35,
                  gender: 'Female',
                  emergencyType: 'Routine OPD Examination'
                });
                setIsReceiptModalOpen(true);
              }}
              className="btn btn-primary"
              style={{ fontSize: '0.82rem', padding: '0.5rem 0.95rem', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Plus size={15} /> <span>+ Issue New Receipt</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {receiptsList.map(rcp => (
              <div
                key={rcp.receiptId}
                style={{
                  background: '#f8fafc',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '14px',
                  padding: '1.15rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.85rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flexWrap: 'wrap' }}>
                    <span className="badge badge-teal" style={{ fontWeight: '800', fontFamily: 'JetBrains Mono, monospace' }}>
                      {rcp.receiptId}
                    </span>
                    <h4 style={{ fontSize: '1.02rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>
                      {rcp.patientName}
                    </h4>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      ({rcp.patientAge} Y / {rcp.patientGender}) • +91 {rcp.patientPhone}
                    </span>
                    <span className="badge badge-green" style={{ fontSize: '0.68rem' }}>
                      ✓ Digitally Sealed
                    </span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#334155', marginTop: '0.35rem' }}>
                    <strong>Diagnosis:</strong> {rcp.diagnosis} • Doctor: <strong>{rcp.doctorName}</strong> ({rcp.doctorRegNo})
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.2rem' }}>
                    Date: {rcp.consultationDate} {rcp.consultationTime} • Scheme: {rcp.billing?.subsidyScheme || '100% Free Govt Healthcare'}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: '800', color: '#16a34a' }}>
                    {rcp.billing?.totalAmount === 0 ? 'FREE (₹0)' : '₹' + rcp.billing?.totalAmount}
                  </span>
                  <button
                    onClick={() => setViewingReceipt(rcp)}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.78rem', padding: '0.4rem 0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Eye size={14} /> <span>View & Print</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: DEVELOPER SECURITY & ACCESS AUDIT */}
      {activeTab === 'security' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Security Credential Card */}
          <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '20px', background: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <span className="badge badge-cyber" style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem' }}>
                  STATE HEALTH DIRECTORATE • DEVELOPER PROVISIONED
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', margin: '0.4rem 0 0' }}>
                  अधिकृत सुरक्षा प्रमाणपत्र व क्रेडेंशियल्स माहिती
                </h3>
              </div>
              <a
                href="/developer-portal"
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary"
                style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem', color: '#0284c7', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <span>Master Developer Console</span>
                <ExternalLink size={14} />
              </a>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#64748b' }}>HOSPITAL AUTH CODE</div>
                <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0284c7', fontFamily: 'JetBrains Mono, monospace', marginTop: '0.2rem' }}>
                  {activeHospital.auth_code || activeHospital.id}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#16a34a', marginTop: '0.2rem' }}>✓ Developer Verified & Active</div>
              </div>

              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#64748b' }}>SECURITY PASSKEY STATUS</div>
                <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', marginTop: '0.2rem' }}>
                  ••••••••••••
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.2rem' }}>Rotatable by Developer Ram Sri Charan</div>
              </div>

              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#64748b' }}>STATE ACCREDITATION LICENSE</div>
                <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#a855f7', fontFamily: 'JetBrains Mono, monospace', marginTop: '0.2rem' }}>
                  {activeHospital.license_no}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.2rem' }}>DHS Maharashtra Verified</div>
              </div>

              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#64748b' }}>ACTIVE BEARER TOKEN</div>
                <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#059669', fontFamily: 'JetBrains Mono, monospace', marginTop: '0.3rem', wordBreak: 'break-all' }}>
                  {token ? token.slice(0, 24) + '...' : 'ACTIVE'}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#16a34a', marginTop: '0.2rem' }}>256-Bit TLS Guarded • 24h Expiry</div>
              </div>
            </div>
          </div>

          {/* Audit Logs Stream */}
          <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '20px', background: 'white' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.85rem' }}>
              🛡️ थेट ॲक्सेस व सुरक्षा ऑडिट लॉग्स (Live Security Audit Stream)
            </h3>

            {auditLogs.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                No recent security incidents logged for this facility.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {auditLogs.map(l => (
                  <div
                    key={l.id}
                    style={{
                      background: '#f8fafc',
                      borderLeft: l.status === 'SUCCESS' ? '4px solid #10b981' : '4px solid #ef4444',
                      padding: '0.75rem 1rem',
                      borderRadius: '10px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.8rem'
                    }}
                  >
                    <div>
                      <strong style={{ color: '#0f172a' }}>{l.action}</strong> • <span style={{ color: '#64748b' }}>{l.details}</span>
                    </div>
                    <div style={{ color: '#94a3b8', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.74rem' }}>
                      {new Date(l.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: Admit Patient Bed Allocation */}
      {admitTargetPatient && (
        <div className="modal-overlay" onClick={() => setAdmitTargetPatient(null)} style={{ zIndex: 9999 }}>
          <div className="modal-content" style={{ maxWidth: '500px', padding: '2rem', borderRadius: '20px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.4rem' }}>
              बेड वाटप व भरती निश्चित करा
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '1.25rem' }}>
              Patient: <strong>{admitTargetPatient.patientName}</strong> ({admitTargetPatient.emergencyType})
            </p>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '0.35rem' }}>
                बेड प्रकार व वॉर्ड निवडा (Ward & Bed Type) *
              </label>
              <select
                className="input-field"
                value={selectedBedType}
                onChange={e => setSelectedBedType(e.target.value)}
              >
                <option value="General Ward - Bed #01">General Ward - Bed #01</option>
                <option value="General Ward - Bed #03">General Ward - Bed #03</option>
                <option value="ICU Ventilator Bed #01">ICU Ventilator Bed #01 (Emergency Critical)</option>
                <option value="Oxygen Ward Bed #05">Oxygen Ward Bed #05</option>
                <option value="Maternity Labor Ward Bed #02">Maternity Labor Ward Bed #02</option>
              </select>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '0.35rem' }}>
                तपासणी डॉक्टर / Assigned Duty Doctor
              </label>
              <select
                className="input-field"
                value={selectedDoctorAssign}
                onChange={e => setSelectedDoctorAssign(e.target.value)}
              >
                {(activeHospital.doctors || []).map(d => (
                  <option key={d.id} value={d.name}>{d.name} ({d.speciality})</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.65rem' }}>
              <button
                onClick={handleAdmitSubmit}
                className="btn btn-primary"
                style={{ flex: 1, padding: '0.8rem', fontWeight: '800' }}
              >
                भरती निश्चित करा (Confirm Bed Admission)
              </button>
              <button onClick={() => setAdmitTargetPatient(null)} className="btn btn-secondary">
                रद्द करा
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Emergency Referral */}
      {referTargetPatient && (
        <div className="modal-overlay" onClick={() => setReferTargetPatient(null)} style={{ zIndex: 9999 }}>
          <div className="modal-content" style={{ maxWidth: '480px', padding: '1.75rem', borderRadius: '18px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#991b1b', marginBottom: '0.4rem' }}>
              🚑 आपत्कालीन रुग्ण रेफरल (Emergency Referral)
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem' }}>
              Patient: <strong>{referTargetPatient.patientName}</strong> ({referTargetPatient.emergencyType})
            </p>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.3rem' }}>
                रेफरल रुग्णालय (Destination Tertiary Hospital) *
              </label>
              <select
                className="input-field"
                value={referralCenter}
                onChange={e => setReferralCenter(e.target.value)}
              >
                <option value="Nashik Civil District General Hospital">Nashik Civil District General Hospital</option>
                <option value="Sahyadri Multi-Speciality Trauma Center">Sahyadri Multi-Speciality Trauma Center</option>
                <option value="Pune Sassoon Government General Hospital">Pune Sassoon Government General Hospital</option>
              </select>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.3rem' }}>
                रेफरल कारण / Clinical Reason *
              </label>
              <textarea
                className="input-field"
                rows={3}
                value={referralReason}
                onChange={e => setReferralReason(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.65rem' }}>
              <button
                onClick={handleReferSubmit}
                className="btn btn-primary"
                style={{ flex: 1, padding: '0.75rem', fontWeight: '800', background: '#dc2626' }}
              >
                रेफरल जारी करा (Confirm Referral)
              </button>
              <button onClick={() => setReferTargetPatient(null)} className="btn btn-secondary">
                रद्द करा
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Direct Walk-In Patient Registration */}
      {isWalkinModalOpen && (
        <div className="modal-overlay" onClick={() => setIsWalkinModalOpen(false)} style={{ zIndex: 9999 }}>
          <div className="modal-content" style={{ maxWidth: '500px', padding: '2rem', borderRadius: '20px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.35rem' }}>
              ➕ थेट आपत्कालीन रुग्ण नोंदणी (Direct Walk-in Patient)
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '1.25rem' }}>
              Register direct emergency arrival into this hospital's active triage queue.
            </p>

            <form onSubmit={handleWalkinSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.3rem' }}>
                  रुग्णाचे नाव / Patient Full Name *
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={walkinName}
                  onChange={e => setWalkinName(e.target.value)}
                  placeholder="e.g. Dnyaneshwar Ramchandra More"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.3rem' }}>
                    फोन नंबर / Phone
                  </label>
                  <input
                    type="tel"
                    className="input-field"
                    value={walkinPhone}
                    onChange={e => setWalkinPhone(e.target.value)}
                    placeholder="9822012345"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.3rem' }}>
                    वय / Age
                  </label>
                  <input
                    type="number"
                    className="input-field"
                    value={walkinAge}
                    onChange={e => setWalkinAge(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.3rem' }}>
                  आपत्कालीन स्थिती / Emergency Chief Complaint *
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={walkinEmergency}
                  onChange={e => setWalkinEmergency(e.target.value)}
                  placeholder="e.g. Snakebite Viper bite / Acute Chest Pain"
                  required
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.3rem' }}>
                  ट्रायज प्राधान्य / Triage Tier
                </label>
                <select
                  className="input-field"
                  value={walkinTier}
                  onChange={e => setWalkinTier(e.target.value)}
                >
                  <option value="60_CRITICAL_EMERGENCY">🔴 60% Critical Emergency (Immediate OT / ICU)</option>
                  <option value="40_MILD_REMEDY">🌿 40% Mild Stabilization (General OPD)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.65rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '0.8rem', fontWeight: '800' }}>
                  नोंदणी करा व रांगेत जोडा (Register Patient)
                </button>
                <button type="button" onClick={() => setIsWalkinModalOpen(false)} className="btn btn-secondary">
                  रद्द करा
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Printable Receipt View */}
      {viewingReceipt && (
        <div className="modal-overlay" onClick={() => setViewingReceipt(null)} style={{ zIndex: 9999 }}>
          <div
            className="modal-content"
            style={{ maxWidth: '620px', padding: '2rem', borderRadius: '20px', background: '#ffffff' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ border: '2px solid #0f172a', borderRadius: '16px', padding: '1.5rem' }}>
              {/* Header */}
              <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '0.85rem', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: '800', letterSpacing: '0.08em', color: '#64748b' }}>
                  GOVERNMENT OF MAHARASHTRA • PUBLIC HEALTH DEPARTMENT
                </div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0f172a', margin: '0.25rem 0' }}>
                  {viewingReceipt.hospitalName}
                </h3>
                <div style={{ fontSize: '0.76rem', color: '#475569' }}>
                  License: <strong>{viewingReceipt.hospitalLicense}</strong> • Address: {viewingReceipt.hospitalAddress}
                </div>
              </div>

              {/* Receipt Metadata */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
                <div>
                  <div>Receipt ID: <strong style={{ color: '#0284c7', fontFamily: 'JetBrains Mono, monospace' }}>{viewingReceipt.receiptId}</strong></div>
                  <div>Date: <strong>{viewingReceipt.consultationDate} {viewingReceipt.consultationTime}</strong></div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div>Doctor: <strong>{viewingReceipt.doctorName}</strong></div>
                  <div>Reg: <strong>{viewingReceipt.doctorRegNo}</strong></div>
                </div>
              </div>

              {/* Patient Info */}
              <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '0.75rem 1rem', fontSize: '0.82rem', marginBottom: '1rem' }}>
                <div style={{ fontWeight: '800', fontSize: '0.92rem', color: '#0f172a' }}>
                  {viewingReceipt.patientName} ({viewingReceipt.patientAge} Y / {viewingReceipt.patientGender})
                </div>
                <div style={{ color: '#475569', marginTop: '2px' }}>
                  Phone: +91 {viewingReceipt.patientPhone} • Village: {viewingReceipt.patientVillage}
                </div>
                <div style={{ color: '#0f172a', marginTop: '4px' }}>
                  <strong>Diagnosis:</strong> {viewingReceipt.diagnosis}
                </div>
              </div>

              {/* Rx Medicines List */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.4rem' }}>
                  💊 औषधोपचार / Prescribed Medications (Rx):
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {(viewingReceipt.medicines || []).map((m, i) => (
                    <div key={i} style={{ background: '#f1f5f9', padding: '0.45rem 0.75rem', borderRadius: '8px', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between' }}>
                      <strong>{m.name}</strong>
                      <span style={{ color: '#64748b' }}>{m.dosage} ({m.duration})</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Diet Advice */}
              <div style={{ fontSize: '0.78rem', color: '#475569', marginBottom: '1rem' }}>
                <strong>पथ्य / Advice:</strong> {viewingReceipt.dietAdvice}
              </div>

              {/* Seal and QR */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px solid #0f172a', paddingTop: '0.85rem' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#16a34a' }}>
                    ✓ 100% FREE GOVT HEALTHCARE SUBSIDY
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', fontFamily: 'JetBrains Mono, monospace' }}>
                    {viewingReceipt.qrVerificationHash}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#0f172a' }}>
                    {viewingReceipt.digitalSeal}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.65rem', marginTop: '1.25rem' }}>
              <button
                onClick={() => window.print()}
                className="btn btn-primary"
                style={{ flex: 1, padding: '0.75rem', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
              >
                <Printer size={16} /> <span>Print Official Receipt</span>
              </button>
              <button onClick={() => setViewingReceipt(null)} className="btn btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Issue Receipt Modal */}
      {isReceiptModalOpen && selectedPatientForReceipt && (
        <IssueReceiptModal
          isOpen={isReceiptModalOpen}
          onClose={() => {
            setIsReceiptModalOpen(false);
            setSelectedPatientForReceipt(null);
          }}
          hospital={activeHospital}
          patient={selectedPatientForReceipt}
          onReceiptIssued={(rcp) => {
            setReceiptsList(prev => [rcp, ...prev]);
            triggerNotification(`🧾 Generated official prescription receipt ${rcp.receiptId} for ${rcp.patientName}`);
            fetchHospitalData();
          }}
        />
      )}
    </div>
  );
}
