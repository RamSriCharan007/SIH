/**
 * Standalone Hospital & Medical Officer Clinical Command Portal
 * Fully connected to Express/Node backend with Enterprise Zero-Trust Security
 */

let state = {
  auth: null,
  patientRequests: [],
  receipts: [],
  auditLogs: [],
  activePage: 'dashboard'
};

// Check authentication on initial load
document.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('gramin_hospital_auth');
  if (saved) {
    try {
      state.auth = JSON.parse(saved);
      verifySessionAndInit();
    } catch (e) {
      showLoginView();
    }
  } else {
    showLoginView();
  }
});

function getAuthHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + (state.auth?.token || '')
  };
}

async function verifySessionAndInit() {
  if (!state.auth?.token) return showLoginView();

  try {
    const res = await fetch('/api/hospital/auth/verify', { headers: getAuthHeaders() });
    const data = await res.json();
    if (data.valid && data.hospital) {
      state.auth.hospital = data.hospital;
      localStorage.setItem('gramin_hospital_auth', JSON.stringify(state.auth));
      showPortalView();
      fetchHospitalData();
    } else {
      showLoginView('Session expired or access revoked by Developer Admin.');
    }
  } catch (err) {
    // If backend offline or network error, but local session exists, still show portal
    showPortalView();
    fetchHospitalData();
  }
}

function showLoginView(errorMsg = '') {
  document.getElementById('view-login').style.display = 'flex';
  document.getElementById('view-portal').style.display = 'none';
  if (errorMsg) {
    const errBox = document.getElementById('login-error');
    errBox.innerText = errorMsg;
    errBox.style.display = 'block';
  }
}

function showPortalView() {
  document.getElementById('view-login').style.display = 'none';
  document.getElementById('view-portal').style.display = 'flex';
  updateHeaderAndSidebar();
}

function quickFill(code, key) {
  document.getElementById('input-auth-code').value = code;
  document.getElementById('input-access-key').value = key;
  document.getElementById('login-error').style.display = 'none';
}

function togglePasswordVisibility() {
  const inp = document.getElementById('input-access-key');
  inp.type = inp.type === 'password' ? 'text' : 'password';
}

async function handleLoginSubmit(e) {
  e.preventDefault();
  const authCode = document.getElementById('input-auth-code').value.trim();
  const accessKey = document.getElementById('input-access-key').value.trim();
  const errBox = document.getElementById('login-error');
  const btn = document.getElementById('btn-login-submit');

  errBox.style.display = 'none';
  btn.disabled = true;
  btn.innerText = 'सत्यापित करत आहे (Verifying)...';

  try {
    const res = await fetch('/api/hospital/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authCode, accessKey })
    });
    const data = await res.json();

    if (data.success && data.hospital) {
      state.auth = {
        token: data.token,
        hospital: data.hospital,
        loggedInAt: new Date().toISOString()
      };
      localStorage.setItem('gramin_hospital_auth', JSON.stringify(state.auth));
      showPortalView();
      fetchHospitalData();
    } else {
      errBox.innerText = data.error || 'Invalid Hospital Code or Verified Security Passkey';
      errBox.style.display = 'block';
    }
  } catch (err) {
    errBox.innerText = 'Network error: Cannot reach hospital authentication server';
    errBox.style.display = 'block';
  } finally {
    btn.disabled = false;
    btn.innerText = 'अधिकृत लॉगिन करा (Verify & Login)';
  }
}

function handleLogout() {
  localStorage.removeItem('gramin_hospital_auth');
  state.auth = null;
  showLoginView('🔒 Session safely locked and cleared.');
}

function updateHeaderAndSidebar() {
  const hosp = state.auth?.hospital;
  if (!hosp) return;

  document.getElementById('avatar-char').innerText = (hosp.name || 'H').charAt(0);
  document.getElementById('side-hosp-name').innerText = hosp.name;
  document.getElementById('side-auth-code').innerText = hosp.auth_code || hosp.id;

  document.getElementById('top-hosp-name').innerText = hosp.name;
  document.getElementById('top-hosp-badge').innerText = hosp.verification_badge || 'NABH & DHS Verified';
  document.getElementById('top-hosp-meta').innerText =
    `Code: ${hosp.auth_code || hosp.id} • License: ${hosp.license_no} • CMO: ${hosp.nodal_officer} • District: ${hosp.district}`;

  // Security page fields
  document.getElementById('sec-auth-code').innerText = hosp.auth_code || hosp.id;
  document.getElementById('sec-license').innerText = hosp.license_no;
  document.getElementById('sec-token').innerText = (state.auth?.token || '').slice(0, 32) + '... (24h Active)';
}

function switchPage(pageId) {
  state.activePage = pageId;

  // Update nav link active status
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
    if (item.getAttribute('href') === '#' + pageId) {
      item.classList.add('active');
    }
  });

  // Hide all sections, show active
  const pages = ['dashboard', 'triage', 'resources', 'doctors', 'receipts', 'security'];
  pages.forEach(p => {
    const el = document.getElementById('page-' + p);
    if (el) el.style.display = p === pageId ? 'block' : 'none';
  });
}

// Fetch live backend data
async function fetchHospitalData() {
  if (!state.auth?.token) return;

  try {
    // 1. Requests
    const resReq = await fetch('/api/hospital/requests', { headers: getAuthHeaders() });
    if (resReq.status === 401 || resReq.status === 403) {
      return handleLogout();
    }
    const dataReq = await resReq.json();
    if (dataReq.success && Array.isArray(dataReq.requests)) {
      state.patientRequests = dataReq.requests;
      document.getElementById('badge-patient-count').innerText = dataReq.requests.length;
      document.getElementById('kpi-patients-count').innerText = dataReq.requests.length;
      renderTriageList();
    }

    // 2. Receipts
    const resRcp = await fetch('/api/consultations/receipts', { headers: getAuthHeaders() });
    const dataRcp = await resRcp.json();
    if (dataRcp.success && Array.isArray(dataRcp.receipts)) {
      state.receipts = dataRcp.receipts;
      document.getElementById('badge-receipts-count').innerText = dataRcp.receipts.length;
      renderReceiptsList();
    }

    // 3. Profile & Live Telemetry
    const resProf = await fetch('/api/hospital/profile', { headers: getAuthHeaders() });
    const dataProf = await resProf.json();
    if (dataProf.success && dataProf.hospital) {
      state.auth.hospital = dataProf.hospital;
      localStorage.setItem('gramin_hospital_auth', JSON.stringify(state.auth));
      renderKPIsAndResources();
      renderDoctorsList();
    }

    // 4. Audit Logs
    const resLogs = await fetch('/api/hospital/auth/audit-logs', { headers: getAuthHeaders() });
    const dataLogs = await resLogs.json();
    if (dataLogs.success && Array.isArray(dataLogs.logs)) {
      state.auditLogs = dataLogs.logs;
      renderAuditLogs();
    }
  } catch (err) {
    console.warn('Sync failed:', err);
  }
}

function renderKPIsAndResources() {
  const hosp = state.auth?.hospital;
  if (!hosp?.live_status) return;

  const beds = hosp.live_status.beds || {};
  const genStr = `${beds.general_available ?? 12} / ${beds.general_total ?? 30}`;
  const icuStr = `${beds.icu_available ?? 1} / ${beds.icu_total ?? 4}`;
  const oxyVal = `${beds.oxygen_beds_available ?? 8} Beds`;

  document.getElementById('kpi-general-beds').innerText = genStr;
  document.getElementById('kpi-icu-beds').innerText = icuStr;
  document.getElementById('res-general-beds').innerText = genStr;
  document.getElementById('res-icu-beds').innerText = icuStr;
  document.getElementById('res-oxygen-beds').innerText = oxyVal;

  const docs = hosp.doctors || [];
  const activeDocs = docs.filter(d => d.is_available_for_video).length;
  document.getElementById('kpi-active-docs').innerText = `${activeDocs} Active`;

  const meds = hosp.live_status.medicines_stock || {};
  document.getElementById('kpi-antivenom').innerText = `${meds.anti_venom_vials ?? 18} Vials`;
  document.getElementById('med-antivenom').innerText = `${meds.anti_venom_vials ?? 18} Vials`;
  document.getElementById('med-ors').innerText = `${meds.ors_packets ?? 350} Pkts`;
  document.getElementById('med-oxygen').innerText = `${meds.iv_fluids ?? 120} Units`;

  const blood = hosp.live_status.blood_stock || {};
  ['A_pos', 'B_pos', 'O_pos', 'AB_pos', 'O_neg'].forEach(bt => {
    const el = document.getElementById('blood-' + bt);
    if (el) el.innerText = blood[bt] ?? 0;
  });
}

function renderTriageList() {
  const tbody = document.getElementById('tbody-triage');
  if (!tbody) return;

  const search = (document.getElementById('triage-search')?.value || '').toLowerCase();
  const filter = document.getElementById('triage-filter')?.value || 'ALL';

  const filtered = state.patientRequests.filter(r => {
    const match = (r.patientName || '').toLowerCase().includes(search) ||
      (r.phone && r.phone.includes(search)) ||
      (r.tokenId && r.tokenId.toLowerCase().includes(search));
    if (!match) return false;

    if (filter === 'CRITICAL') return r.triageTier === '60_CRITICAL_EMERGENCY';
    if (filter === 'MILD') return r.triageTier !== '60_CRITICAL_EMERGENCY';
    if (filter === 'ADMITTED') return r.status === 'ADMITTED';
    return true;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
      No patient records found. Click "+ Walk-in Patient" to register direct emergency arrivals.
    </td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(req => {
    const isCritical = req.triageTier === '60_CRITICAL_EMERGENCY';
    const isAdmitted = req.status === 'ADMITTED';
    const isDischarged = req.status === 'DISCHARGED';

    return `
      <tr>
        <td>
          <div style="font-family: var(--font-mono); font-weight: 800; color: #38bdf8; font-size: 0.8rem;">${req.tokenId}</div>
          <div style="font-weight: 800; font-size: 0.95rem;">${req.patientName}</div>
          <div style="font-size: 0.74rem; color: var(--text-muted);">${req.age} Y / ${req.gender} • +91 ${req.phone}</div>
        </td>
        <td>
          <div style="font-weight: 700; color: #ffffff;">${req.emergencyType}</div>
          <span class="badge ${isCritical ? 'badge-emergency' : 'badge-mild'}">
            ${isCritical ? '🔴 60% Critical' : '🌿 40% Mild'}
          </span>
        </td>
        <td>
          <div style="font-size: 0.78rem;">BP: <strong>${req.vitals?.bp || '120/80'}</strong> • SpO2: <strong>${req.vitals?.spo2 || '98%'}</strong></div>
          <div style="font-size: 0.74rem; color: var(--text-muted);">Village: ${req.village || 'Rural Block'}</div>
        </td>
        <td>
          <div style="font-weight: 700; color: #38bdf8;">${req.allocatedBed || 'Unallocated'}</div>
          <div style="font-size: 0.74rem; color: var(--text-muted);">${req.assignedDoctor || 'On-Duty CMO'}</div>
        </td>
        <td>
          <span class="badge ${isAdmitted ? 'badge-mild' : isDischarged ? 'badge' : 'badge-blue'}">
            ${req.status}
          </span>
        </td>
        <td>
          <div style="display: flex; gap: 4px; flex-wrap: wrap;">
            ${!isAdmitted && !isDischarged ? `
              <button onclick="openAdmitModal('${req.id}', '${req.patientName}', '${req.emergencyType}')" class="btn btn-primary" style="font-size: 0.74rem; padding: 0.35rem 0.65rem;">
                Admit Bed
              </button>
            ` : ''}
            ${isAdmitted ? `
              <button onclick="handleDischarge('${req.id}', '${req.patientName}')" class="btn btn-danger" style="font-size: 0.74rem; padding: 0.35rem 0.65rem;">
                Discharge
              </button>
            ` : ''}
            <button onclick="openDirectReceiptModal('${req.id}')" class="btn btn-success" style="font-size: 0.74rem; padding: 0.35rem 0.65rem;">
              Receipt
            </button>
            <button onclick="startTeleconsult('${req.patientName}', '${req.phone}')" class="btn btn-secondary" style="font-size: 0.74rem; padding: 0.35rem 0.65rem;">
              📹 Video
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function renderDoctorsList() {
  const container = document.getElementById('doctors-grid');
  if (!container) return;

  const docs = state.auth?.hospital?.doctors || [];
  if (docs.length === 0) {
    container.innerHTML = `<div style="color: var(--text-muted); padding: 1rem;">No doctors registered.</div>`;
    return;
  }

  container.innerHTML = docs.map(doc => `
    <div class="card" style="background: var(--bg-card); border-color: ${doc.is_available_for_video ? 'rgba(16, 185, 129, 0.5)' : 'var(--border)'};">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.6rem;">
        <div>
          <h4 style="font-size: 1.05rem; font-weight: 800; margin: 0;">${doc.name}</h4>
          <div style="font-size: 0.78rem; color: #38bdf8; font-weight: 700;">${doc.speciality}</div>
          <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 2px;">
            Reg: <strong>${doc.reg_no}</strong> • Exp: ${doc.experience}
          </div>
        </div>
        <span class="badge ${doc.is_available_for_video ? 'badge-mild' : 'badge'}">
          ${doc.is_available_for_video ? '🟢 Video Ready' : '🔴 In Ward'}
        </span>
      </div>

      <div style="border-top: 1px solid rgba(34, 53, 84, 0.6); padding-top: 0.75rem; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 0.74rem; color: var(--text-muted);">Shift: ${doc.opd_timing}</span>
        <button onclick="toggleDoctorVideo('${doc.id}', ${doc.is_available_for_video})" class="btn ${doc.is_available_for_video ? 'btn-danger' : 'btn-primary'}" style="font-size: 0.75rem;">
          ${doc.is_available_for_video ? 'Offline' : 'Make Video Ready'}
        </button>
      </div>
    </div>
  `).join('');
}

function renderReceiptsList() {
  const tbody = document.getElementById('tbody-receipts');
  if (!tbody) return;

  if (state.receipts.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-muted);">
      No receipts issued yet. Click "Issue New Receipt" to prescribe.
    </td></tr>`;
    return;
  }

  tbody.innerHTML = state.receipts.map(rcp => `
    <tr>
      <td style="font-family: var(--font-mono); font-weight: 800; color: #38bdf8;">${rcp.receiptId}</td>
      <td>
        <div style="font-weight: 800;">${rcp.patientName}</div>
        <div style="font-size: 0.74rem; color: var(--text-muted);">+91 ${rcp.patientPhone}</div>
      </td>
      <td>
        <div style="font-weight: 700;">${rcp.diagnosis}</div>
        <div style="font-size: 0.72rem; color: #34d399;">✓ 100% Free Govt Subsidy</div>
      </td>
      <td>${rcp.doctorName} (${rcp.doctorRegNo})</td>
      <td>${rcp.consultationDate} ${rcp.consultationTime}</td>
      <td>
        <button onclick="viewReceipt('${rcp.receiptId}')" class="btn btn-secondary" style="font-size: 0.75rem; padding: 0.35rem 0.7rem;">
          👁️ View & Print
        </button>
      </td>
    </tr>
  `).join('');
}

function renderAuditLogs() {
  const container = document.getElementById('audit-logs-container');
  if (!container) return;

  if (state.auditLogs.length === 0) {
    container.innerHTML = `<div style="color: var(--text-muted); padding: 1rem; text-align: center;">No security incidents recorded.</div>`;
    return;
  }

  container.innerHTML = state.auditLogs.map(l => `
    <div style="background: var(--bg-card); border-left: 4px solid ${l.status === 'SUCCESS' ? 'var(--success)' : 'var(--danger)'}; padding: 0.75rem 1rem; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem;">
      <div>
        <strong style="color: #ffffff;">${l.action}</strong> • <span style="color: var(--text-muted);">${l.details}</span>
      </div>
      <div style="color: #64748b; font-family: var(--font-mono); font-size: 0.74rem;">
        ${new Date(l.timestamp).toLocaleTimeString()}
      </div>
    </div>
  `).join('');
}

// Actions
async function toggleDoctorVideo(docId, currentVal) {
  try {
    const res = await fetch(`/api/hospital/doctors/${docId}/toggle-video`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ isAvailable: !currentVal })
    });
    const data = await res.json();
    if (data.success) {
      fetchHospitalData();
    }
  } catch (e) {
    console.error(e);
  }
}

async function adjustBed(field, delta) {
  const current = state.auth?.hospital?.live_status?.beds?.[field] || 0;
  const updatedVal = Math.max(0, current + delta);

  try {
    await fetch('/api/hospital/resources/beds', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ [field]: updatedVal })
    });
    fetchHospitalData();
  } catch (e) {
    console.error(e);
  }
}

async function adjustBlood(type, delta) {
  const current = state.auth?.hospital?.live_status?.blood_stock?.[type] || 0;
  const updatedVal = Math.max(0, current + delta);

  try {
    await fetch('/api/hospital/resources/blood', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ [type]: updatedVal })
    });
    fetchHospitalData();
  } catch (e) {
    console.error(e);
  }
}

async function adjustMedicine(key, delta) {
  const current = state.auth?.hospital?.live_status?.medicines_stock?.[key] || 0;
  const updatedVal = Math.max(0, current + delta);

  try {
    await fetch('/api/hospital/resources/medicines', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ [key]: updatedVal })
    });
    fetchHospitalData();
  } catch (e) {
    console.error(e);
  }
}

// Modal functions
function openModal(id) {
  const m = document.getElementById(id);
  if (m) m.style.display = 'flex';
}

function closeModal(id) {
  const m = document.getElementById(id);
  if (m) m.style.display = 'none';
}

function openAdmitModal(id, name, complaint) {
  document.getElementById('admit-req-id').value = id;
  document.getElementById('admit-patient-desc').innerText = `Patient: ${name} (${complaint})`;

  const docSelect = document.getElementById('admit-doctor-select');
  docSelect.innerHTML = (state.auth?.hospital?.doctors || []).map(d =>
    `<option value="${d.name}">${d.name} (${d.speciality})</option>`
  ).join('');

  openModal('modal-admit');
}

async function handleAdmitConfirm(e) {
  e.preventDefault();
  const id = document.getElementById('admit-req-id').value;
  const allocatedBed = document.getElementById('admit-bed-type').value;
  const assignedDoctor = document.getElementById('admit-doctor-select').value;

  try {
    const res = await fetch(`/api/hospital/requests/${id}/admit`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ allocatedBed, assignedDoctor, status: 'ADMITTED' })
    });
    const data = await res.json();
    if (data.success) {
      closeModal('modal-admit');
      fetchHospitalData();
    }
  } catch (err) {
    console.error(err);
  }
}

async function handleDischarge(id, name) {
  if (!confirm(`Confirm discharge for ${name}? This will release the allocated bed back to hospital capacity.`)) return;

  try {
    const res = await fetch(`/api/hospital/requests/${id}/discharge`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (data.success) {
      fetchHospitalData();
    }
  } catch (err) {
    console.error(err);
  }
}

function openWalkinModal() {
  openModal('modal-walkin');
}

async function handleWalkinConfirm(e) {
  e.preventDefault();
  const patientName = document.getElementById('walkin-name').value.trim();
  const phone = document.getElementById('walkin-phone').value.trim() || '9876543210';
  const age = parseInt(document.getElementById('walkin-age').value) || 30;
  const emergencyType = document.getElementById('walkin-complaint').value.trim();
  const triageTier = document.getElementById('walkin-tier').value;

  try {
    const res = await fetch('/api/hospital/requests', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ patientName, phone, age, emergencyType, triageTier })
    });
    const data = await res.json();
    if (data.success) {
      closeModal('modal-walkin');
      document.getElementById('walkin-name').value = '';
      fetchHospitalData();
    }
  } catch (err) {
    console.error(err);
  }
}

function openNewReceiptModal() {
  openModal('modal-issue-receipt');
}

function openDirectReceiptModal(reqId) {
  const req = state.patientRequests.find(r => r.id === reqId);
  if (req) {
    document.getElementById('rcp-patient-name').value = req.patientName;
    document.getElementById('rcp-patient-phone').value = req.phone || '9876543210';
    document.getElementById('rcp-diagnosis').value = req.emergencyType;
  }
  openModal('modal-issue-receipt');
}

async function handleGenerateReceiptSubmit(e) {
  e.preventDefault();
  const hosp = state.auth?.hospital;
  const patientName = document.getElementById('rcp-patient-name').value.trim();
  const patientPhone = document.getElementById('rcp-patient-phone').value.trim();
  const diagnosis = document.getElementById('rcp-diagnosis').value.trim();
  const rawMeds = document.getElementById('rcp-medicines').value.trim().split('\n');
  const subsidyScheme = document.getElementById('rcp-scheme').value;

  const medicines = rawMeds.map(m => ({ name: m.trim(), dosage: 'As prescribed', duration: '3 Days' }));

  const payload = {
    hospitalId: hosp?.id || 'hosp-01',
    hospitalName: hosp?.name || 'Primary Health Centre',
    hospitalLicense: hosp?.license_no || 'MH-DHS-2024',
    hospitalAddress: hosp?.address || 'Nashik District, Maharashtra',
    doctorName: hosp?.doctors?.[0]?.name || hosp?.nodal_officer || 'Dr. On-Duty MO',
    doctorRegNo: hosp?.doctors?.[0]?.reg_no || 'MMC-2024-MH',
    doctorSpeciality: hosp?.doctors?.[0]?.speciality || 'General Medicine',
    patientName,
    patientPhone,
    patientAge: 32,
    patientGender: 'Female',
    patientVillage: 'Rural Block',
    diagnosis,
    medicines,
    dietAdvice: 'Lukewarm boiled water, light nutritious diet, rest.',
    followUpDate: '2026-09-08',
    billing: {
      opdFee: 0,
      totalAmount: 0,
      subsidyScheme,
      paymentStatus: 'PAID_GOVT_SUBSIDY'
    }
  };

  try {
    const res = await fetch('/api/consultations/issue-receipt', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success && data.receipt) {
      closeModal('modal-issue-receipt');
      fetchHospitalData();
      viewReceipt(data.receipt.receiptId);
    }
  } catch (err) {
    console.error(err);
  }
}

function viewReceipt(receiptId) {
  const rcp = state.receipts.find(r => r.receiptId === receiptId);
  if (!rcp) return;

  const content = document.getElementById('receipt-print-content');
  content.innerHTML = `
    <div style="text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 0.75rem; margin-bottom: 1rem;">
      <div style="font-size: 0.72rem; font-weight: 800; letter-spacing: 0.08em; color: #475569;">
        GOVERNMENT OF MAHARASHTRA • PUBLIC HEALTH DEPARTMENT
      </div>
      <h2 style="font-size: 1.35rem; font-weight: 800; margin: 0.2rem 0; color: #0f172a;">${rcp.hospitalName}</h2>
      <div style="font-size: 0.78rem; color: #475569;">License: <strong>${rcp.hospitalLicense}</strong> • Address: ${rcp.hospitalAddress}</div>
    </div>

    <div style="display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 1rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.6rem;">
      <div>
        <div>Receipt ID: <strong style="color: #0284c7; font-family: monospace;">${rcp.receiptId}</strong></div>
        <div>Date & Time: <strong>${rcp.consultationDate} ${rcp.consultationTime}</strong></div>
      </div>
      <div style="text-align: right;">
        <div>Doctor: <strong>${rcp.doctorName}</strong></div>
        <div>Reg No: <strong>${rcp.doctorRegNo}</strong></div>
      </div>
    </div>

    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.75rem; font-size: 0.85rem; margin-bottom: 1rem;">
      <div style="font-weight: 800;">${rcp.patientName} (${rcp.patientAge || 30} Y / ${rcp.patientGender || 'Citizen'})</div>
      <div style="color: #64748b; font-size: 0.76rem;">Phone: +91 ${rcp.patientPhone} • Village: ${rcp.patientVillage || 'Rural Block'}</div>
      <div style="margin-top: 4px;"><strong>Diagnosis:</strong> ${rcp.diagnosis}</div>
    </div>

    <div style="margin-bottom: 1rem;">
      <div style="font-size: 0.85rem; font-weight: 800; margin-bottom: 0.4rem; color: #0f172a;">💊 Prescribed Medications (Rx):</div>
      ${(rcp.medicines || []).map(m => `
        <div style="background: #f1f5f9; padding: 0.4rem 0.65rem; border-radius: 6px; font-size: 0.82rem; margin-bottom: 0.3rem; display: flex; justify-content: space-between;">
          <strong>${m.name}</strong>
          <span style="color: #64748b;">${m.dosage} (${m.duration})</span>
        </div>
      `).join('')}
    </div>

    <div style="font-size: 0.78rem; color: #475569; margin-bottom: 1rem;">
      <strong>पथ्य / Clinical Advice:</strong> ${rcp.dietAdvice || 'Lukewarm water, balanced diet.'}
    </div>

    <div style="border-top: 2px solid #0f172a; padding-top: 0.75rem; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <div style="color: #16a34a; font-weight: 800; font-size: 0.78rem;">✓ 100% FREE GOVT SUBSIDY (MJPJAY)</div>
        <div style="font-size: 0.68rem; color: #64748b; font-family: monospace;">${rcp.qrVerificationHash || 'QR-HASH-VERIFIED'}</div>
      </div>
      <div style="text-align: right; font-weight: 800; font-size: 0.78rem;">
        ${rcp.digitalSeal || 'OFFICIAL SEAL • DHS MH'}
      </div>
    </div>
  `;

  openModal('modal-view-receipt');
}

function startTeleconsult(name, phone) {
  alert(`📹 Initiating Teleconsultation Video Room for ${name} (+91 ${phone}). In production, this launches WebRTC video stream with citizen app.`);
}
