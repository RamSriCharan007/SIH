import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  Video,
  UserCheck,
  Hospital,
  MapPin,
  Clock,
  ShieldCheck,
  Stethoscope,
  X,
  PhoneCall,
  Search,
  Activity,
  HeartPulse
} from 'lucide-react';

export default function DoctorDirectoryModal({ onClose, onStartCall }) {
  const { lang, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpeciality, setSelectedSpeciality] = useState('all');

  const onDutyDoctors = [
    {
      id: 'doc-01',
      name: 'Dr. Anand Kulkarni',
      name_mr: 'डॉ. आनंद कुलकर्णी',
      speciality: 'Emergency Medicine & MD Physician',
      speciality_mr: 'आपत्कालीन औषधोपचार व MD फिजिशियन',
      hospital: 'Trimbakeshwar Rural Hospital (ग्रामीण रुग्णालय)',
      district: 'Nashik',
      experience: '14 Yrs Experience',
      reg_no: 'MMC-2012-08-3948',
      status: 'Available Now',
      wait_time: '1 min',
      call_badge: '100% Free Govt Care'
    },
    {
      id: 'doc-02',
      name: 'Dr. Rohini Gaikwad',
      name_mr: 'डॉ. रोहिणी गायकवाड',
      speciality: 'High-Risk Pregnancy & Maternal Care (OBGYN)',
      speciality_mr: 'स्त्रीरोग व प्रसूती तज्ज्ञ (OBGYN)',
      hospital: 'Junnar Sub-District Hospital',
      district: 'Pune Rural',
      experience: '11 Yrs Experience',
      reg_no: 'MMC-2015-04-1102',
      status: 'Available Now',
      wait_time: '2 mins',
      call_badge: 'Janani Suraksha Govt'
    },
    {
      id: 'doc-03',
      name: 'Dr. Santosh Bhoye',
      name_mr: 'डॉ. संतोष भोये',
      speciality: 'Snakebite & Trauma Emergency Specialist',
      speciality_mr: 'सर्पदंश व अपघात आपत्कालीन तज्ज्ञ',
      hospital: 'Nashik District Civil Hospital',
      district: 'Nashik',
      experience: '16 Yrs Experience',
      reg_no: 'MMC-2009-11-7721',
      status: 'In Emergency Ward',
      wait_time: 'Instant Connect',
      call_badge: 'Anti-Venom Protocol Lead'
    },
    {
      id: 'doc-04',
      name: 'Dr. Meera Deshmukh',
      name_mr: 'डॉ. मीरा देशमुख',
      speciality: 'Pediatric Child Health & Malnutrition',
      speciality_mr: 'बालरोग व पोषण तज्ज्ञ',
      hospital: 'Igatpuri Primary Health Center',
      district: 'Nashik Rural',
      experience: '9 Yrs Experience',
      reg_no: 'MMC-2017-06-4439',
      status: 'Available Now',
      wait_time: '1 min',
      call_badge: '100% Free Govt Care'
    }
  ];

  const filteredDoctors = onDutyDoctors.filter((doc) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      doc.name.toLowerCase().includes(q) ||
      (doc.name_mr && doc.name_mr.includes(q)) ||
      doc.speciality.toLowerCase().includes(q) ||
      doc.hospital.toLowerCase().includes(q);

    if (!matchSearch) return false;

    if (selectedSpeciality !== 'all') {
      if (selectedSpeciality === 'maternal' && !doc.speciality.includes('Maternal') && !doc.speciality.includes('Pregnancy')) return false;
      if (selectedSpeciality === 'snakebite' && !doc.speciality.includes('Snakebite') && !doc.speciality.includes('Trauma')) return false;
      if (selectedSpeciality === 'child' && !doc.speciality.includes('Pediatric')) return false;
    }

    return true;
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '680px', maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0d9488 0%, #065f46 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(13, 148, 136, 0.3)'
            }}>
              <Video size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                {t('doctor_directory_title')}
              </h2>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>
                {t('doctor_directory_sub')}
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

        {/* Search & Speciality Filters */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ position: 'relative', marginBottom: '0.65rem' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              className="input-field"
              placeholder="डॉक्टर / स्पेशालिटी / रुग्णालय शोधा..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2.4rem', fontSize: '0.85rem' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', paddingBottom: '4px' }}>
            <button
              onClick={() => setSelectedSpeciality('all')}
              className={`btn ${selectedSpeciality === 'all' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.76rem', padding: '0.35rem 0.7rem' }}
            >
              सर्व डॉक्टर ({onDutyDoctors.length})
            </button>
            <button
              onClick={() => setSelectedSpeciality('snakebite')}
              className={`btn ${selectedSpeciality === 'snakebite' ? 'btn-emergency' : 'btn-secondary'}`}
              style={{ fontSize: '0.76rem', padding: '0.35rem 0.7rem' }}
            >
              🐍 सर्पदंश / Trauma
            </button>
            <button
              onClick={() => setSelectedSpeciality('maternal')}
              className={`btn ${selectedSpeciality === 'maternal' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.76rem', padding: '0.35rem 0.7rem', background: selectedSpeciality === 'maternal' ? '#db2777' : undefined }}
            >
              🤰 गरोदर माता / OBGYN
            </button>
            <button
              onClick={() => setSelectedSpeciality('child')}
              className={`btn ${selectedSpeciality === 'child' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.76rem', padding: '0.35rem 0.7rem' }}
            >
              👶 बालरोग तज्ज्ञ
            </button>
          </div>
        </div>

        {/* Doctor Cards List */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredDoctors.map((doc) => {
            const docName = lang === 'mr' ? doc.name_mr : doc.name;
            const docSpec = lang === 'mr' ? doc.speciality_mr : doc.speciality;

            return (
              <div
                key={doc.id}
                style={{
                  background: 'white',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '14px',
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  boxShadow: '0 4px 12px -2px rgba(0,0,0,0.04)',
                  transition: 'all 0.2s ease'
                }}
                className="glass-card-hover"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: '#f0fdfa',
                    border: '2px solid #99f6e4',
                    color: '#0d9488',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <UserCheck size={26} />
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                        {docName}
                      </h3>
                      <span className="badge badge-green" style={{ fontSize: '0.68rem', padding: '0.1rem 0.4rem' }}>
                        {doc.call_badge}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#0d9488', marginTop: '0.15rem' }}>
                      {docSpec}
                    </div>

                    <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.15rem' }}>
                      {doc.hospital} • {doc.experience}
                    </div>

                    <div style={{ fontSize: '0.7rem', color: '#15803d', fontWeight: '700', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                      {doc.status} (Wait: {doc.wait_time})
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onStartCall(doc);
                    onClose();
                  }}
                  className="btn btn-primary"
                  style={{
                    padding: '0.65rem 1.1rem',
                    fontSize: '0.85rem',
                    fontWeight: '800',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    boxShadow: '0 4px 15px rgba(13, 148, 136, 0.35)'
                  }}
                >
                  <Video size={16} />
                  <span>{t('start_video_call')}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
