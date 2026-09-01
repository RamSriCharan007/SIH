// ============================================================================
// GraminAarogya Developer & Admin Portal Controller
// Master Administrator: Ram Sri Charan
// ============================================================================

const API_BASE = '';

let state = {
  stats: null,
  hospitals: [],
  credentials: [],
  users: [],
  remedies: [],
  complications: [],
  gpsLogs: []
};

// -------------------------------------------------------------
// AUTHENTICATION & SECURITY GATE HELPERS
// -------------------------------------------------------------
function getDevToken() {
  return sessionStorage.getItem('gramin_dev_token') || 'dev_token_ram_sri_charan_master';
}

function setDevToken(token) {
  sessionStorage.setItem('gramin_dev_token', token);
}

function clearDevToken() {
  sessionStorage.removeItem('gramin_dev_token');
}

async function devFetch(url, options = {}) {
  const token = getDevToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    'Authorization': token ? `Bearer ${token}` : ''
  };

  const res = await fetch(url, { ...options, headers });
  if (res.status === 401) {
    showSecurityGate('Security Warning: Session expired or invalid. Master Administrator credentials required.');
    throw new Error('Unauthorized');
  }
  return res;
}

function showSecurityGate(errorMsg = '') {
  const gate = document.getElementById('dev-security-gate');
  const alertBox = document.getElementById('dev-login-alert');
  if (gate) {
    gate.classList.add('active');
  }
  if (alertBox && errorMsg) {
    alertBox.textContent = errorMsg;
    alertBox.style.display = 'block';
  }
}

function hideSecurityGate() {
  const gate = document.getElementById('dev-security-gate');
  if (gate) {
    gate.classList.remove('active');
  }
}

// -------------------------------------------------------------
// DOM INIT
// -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', async () => {
  initAuthGate();
  initTabs();
  initModals();

  // Check auth session
  const isAuth = await verifySession();
  if (isAuth) {
    hideSecurityGate();
    fetchAllData();
  } else {
    showSecurityGate();
  }

  // Polling every 15s for live dashboard telemetry
  setInterval(() => {
    if (getDevToken()) {
      fetchStats();
    }
  }, 15000);

  // Time badge
  updateClock();
  setInterval(updateClock, 1000);
});

async function verifySession() {
  try {
    const res = await devFetch(`${API_BASE}/api/dev/auth/verify`);
    const data = await res.json();
    return data.success && data.valid;
  } catch (e) {
    return false;
  }
}

function initAuthGate() {
  const loginForm = document.getElementById('form-dev-login');
  const alertBox = document.getElementById('dev-login-alert');
  const togglePwdBtn = document.getElementById('btn-toggle-pwd');
  const pwdInput = document.getElementById('dev-password');
  const logoutBtn = document.getElementById('btn-dev-logout');

  if (togglePwdBtn && pwdInput) {
    togglePwdBtn.addEventListener('click', () => {
      if (pwdInput.type === 'password') {
        pwdInput.type = 'text';
        togglePwdBtn.textContent = '🔒';
      } else {
        pwdInput.type = 'password';
        togglePwdBtn.textContent = '👁️';
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      clearDevToken();
      showSecurityGate('Developer session locked. Please re-authenticate.');
      showToast('🔒 Master Console Locked');
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('dev-username').value;
      const password = document.getElementById('dev-password').value;
      const submitBtn = document.getElementById('btn-submit-dev-login');

      if (alertBox) alertBox.style.display = 'none';
      submitBtn.disabled = true;
      submitBtn.textContent = 'Verifying Master Credentials...';

      try {
        const res = await fetch(`${API_BASE}/api/dev/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        const data = await res.json();

        if (data.success && data.token) {
          setDevToken(data.token);
          hideSecurityGate();
          showToast(`👑 Welcome Master Administrator ${data.user?.fullName || 'Ram Sri Charan'}!`);
          fetchAllData();
        } else {
          if (alertBox) {
            alertBox.textContent = data.error || 'Access Denied: Invalid Developer Credentials.';
            alertBox.style.display = 'block';
          }
        }
      } catch (err) {
        if (alertBox) {
          alertBox.textContent = 'Authentication server connection error. Please try again.';
          alertBox.style.display = 'block';
        }
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>🔓 Authenticate & Unlock Master Console</span>';
      }
    });
  }
}

function updateClock() {
  const badge = document.getElementById('live-time-badge');
  if (badge) {
    badge.textContent = 'Live • ' + new Date().toLocaleTimeString();
  }
}

// -------------------------------------------------------------
// TAB NAVIGATION
// -------------------------------------------------------------
function initTabs() {
  const navBtns = document.querySelectorAll('.dev-nav-item');
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      navBtns.forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const tabId = btn.getAttribute('data-tab');
      const targetPane = document.getElementById('tab-' + tabId);
      if (targetPane) {
        targetPane.classList.add('active');
        document.getElementById('page-title').textContent = btn.textContent.trim();
      }
    });
  });

  document.getElementById('btn-refresh-all')?.addEventListener('click', () => {
    fetchAllData();
    showToast('🔄 Synchronized latest platform telemetry!');
  });

  document.getElementById('btn-quick-add-hospital')?.addEventListener('click', () => {
    openAddHospitalModal();
  });

  document.getElementById('btn-add-hospital-tab')?.addEventListener('click', () => {
    openAddHospitalModal();
  });

  document.getElementById('btn-refresh-gps')?.addEventListener('click', () => {
    fetchGpsLogs();
    showToast('📍 Live GPS logs refreshed');
  });
}

// -------------------------------------------------------------
// FETCH ALL PLATFORM DATA
// -------------------------------------------------------------
async function fetchAllData() {
  await Promise.all([
    fetchStats(),
    fetchHospitals(),
    fetchHospitalCredentials(),
    fetchUsers(),
    fetchRemedies(),
    fetchComplications(),
    fetchGpsLogs(),
    fetchDbStatus()
  ]);
}

// 1. Stats
async function fetchStats() {
  try {
    const res = await devFetch(`${API_BASE}/api/dev/stats`);
    const data = await res.json();
    if (data.success && data.stats) {
      state.stats = data.stats;
      renderStats(data.stats);
    }
  } catch (e) {
    console.warn('Failed to fetch stats:', e);
  }
}

function renderStats(s) {
  const el = (id, val) => {
    const d = document.getElementById(id);
    if (d) d.textContent = val !== undefined ? val : '--';
  };

  el('kpi-hospitals', s.totalHospitals || 0);
  el('kpi-gen-beds', s.totalGeneralBeds || 0);
  el('kpi-icu-beds', s.totalIcuBeds || 0);
  el('kpi-blood-units', s.totalBloodUnits || 0);
  el('kpi-anti-venom', s.totalAntiVenomVials || 0);
  el('kpi-users', s.totalRegisteredUsers || 0);
  el('kpi-citizens', s.citizensCount || 0);
  el('kpi-ashas', s.ashaCount || 0);
}

// 2. Hospitals
async function fetchHospitals() {
  try {
    const res = await devFetch(`${API_BASE}/api/dev/hospitals`);
    const data = await res.json();
    if (data.success && data.hospitals) {
      state.hospitals = data.hospitals;
      renderHospitalsTable(data.hospitals);
      renderBloodBankCards(data.hospitals);
      renderBedsCards(data.hospitals);
      renderMedicinesCards(data.hospitals);
    }
  } catch (e) {
    console.warn('Failed to fetch hospitals:', e);
  }
}

function renderHospitalsTable(list) {
  const tbody = document.getElementById('tbody-hospitals');
  if (!tbody) return;

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 2rem; color: #94a3b8;">No hospitals registered in network. Click "+ Add Hospital" to register one.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(h => `
    <tr>
      <td>
        <strong style="color: white; font-size: 0.9rem;">${h.name}</strong><br>
        <span style="font-size: 0.75rem; color: #94a3b8;">${h.name_mr || ''}</span>
      </td>
      <td>
        <span class="badge ${h.type.includes('Charitable') ? 'badge-amber' : h.type.includes('District') ? 'badge-pink' : 'badge-green'}" style="font-size: 0.7rem;">
          ${h.type}
        </span>
      </td>
      <td>
        <div style="font-size: 0.8rem;">${h.taluka || ''}, ${h.district}</div>
        <div style="font-size: 0.7rem; color: #64748b;">GPS: ${h.coordinates?.lat?.toFixed(3)}, ${h.coordinates?.lng?.toFixed(3)}</div>
      </td>
      <td>
        <span style="color: #38bdf8; font-weight: 700;">${h.live_status?.beds?.general_available || 0}</span> / 
        <span style="color: #f43f5e; font-weight: 700;">${h.live_status?.beds?.icu_available || 0} ICU</span>
      </td>
      <td>
        <span class="badge ${Object.values(h.live_status?.blood_stock || {}).some(v => v > 0) ? 'badge-green' : 'badge-amber'}" style="font-size: 0.7rem;">
          ${Object.values(h.live_status?.blood_stock || {}).reduce((a, b) => a + (parseInt(b) || 0), 0)} Units
        </span>
      </td>
      <td>
        <div style="font-size: 0.8rem;">${h.contact}</div>
        <div style="font-size: 0.7rem; color: #10b981;">SOS: ${h.emergency_sos || '108'}</div>
      </td>
      <td>
        <div style="display: flex; gap: 0.4rem;">
          <button class="btn btn-secondary" style="padding: 0.3rem 0.55rem; font-size: 0.75rem;" onclick="openEditHospitalModal('${h.id}')">✏️ Edit</button>
          <button class="btn btn-danger" style="padding: 0.3rem 0.55rem; font-size: 0.75rem;" onclick="deleteHospital('${h.id}', '${h.name}')">🗑️</button>
        </div>
      </td>
    </tr>
  `).join('');

  const overviewTbody = document.querySelector('#overview-hospitals-table tbody');
  if (overviewTbody) {
    overviewTbody.innerHTML = list.slice(0, 6).map(h => `
      <tr>
        <td><strong style="color: white; font-size: 0.85rem;">${h.name}</strong></td>
        <td><span class="badge badge-teal" style="font-size: 0.68rem;">${h.type}</span></td>
        <td><span style="color: #f43f5e; font-weight: 800;">${h.live_status?.beds?.icu_available || 0}</span></td>
        <td><span style="color: #38bdf8; font-weight: 800;">${h.live_status?.beds?.general_available || 0}</span></td>
        <td><span class="badge badge-green" style="font-size: 0.68rem;">${h.live_status?.medicines_stock?.anti_venom_vials || 0} vials</span></td>
        <td><button class="btn btn-secondary" style="padding: 0.2rem 0.45rem; font-size: 0.7rem;" onclick="openEditHospitalModal('${h.id}')">Manage</button></td>
      </tr>
    `).join('');
  }
}


// 2b. Hospital Credentials Authority (Developer Master Control)
async function fetchHospitalCredentials() {
  try {
    const res = await devFetch(`${API_BASE}/api/dev/hospitals/credentials`);
    const data = await res.json();
    if (data.success && data.hospitals) {
      state.credentials = data.hospitals;
      renderCredentialsTable(data.hospitals);
      const countEl = document.getElementById('badge-credentials-count');
      if (countEl) countEl.textContent = `${data.hospitals.length} Facilities Provisioned`;
    }
  } catch (e) {
    console.warn('Failed to fetch hospital credentials:', e);
  }
}

function renderCredentialsTable(list) {
  const tbody = document.getElementById('tbody-credentials');
  if (!tbody) return;

  if (list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem; color: #94a3b8;">No hospital credentials provisioned. Click "+ Provision New Hospital" above.</td></tr>';
    return;
  }

  tbody.innerHTML = list.map(h => {
    const isAct = h.is_verified && h.verification_status !== 'SUSPENDED_REVOKED';
    return `
      <tr>
        <td>
          <div style="font-weight: 700; color: #f8fafc; font-size: 0.92rem;">${h.name}</div>
          <div style="font-size: 0.74rem; color: #94a3b8;">${h.name_mr || ''} • ${h.taluka || ''}, ${h.district || ''}</div>
          <div style="font-size: 0.7rem; color: #38bdf8; font-family: 'JetBrains Mono', monospace;">ID: ${h.id}</div>
        </td>
        <td>
          <span class="badge badge-cyber" style="font-family: 'JetBrains Mono', monospace; font-size: 0.78rem; font-weight: 800; cursor: pointer;" onclick="copyDevText('${h.auth_code}', 'Auth Code')" title="Click to copy">
            ${h.auth_code} 📋
          </span>
        </td>
        <td>
          <div style="display: flex; align-items: center; gap: 0.4rem;">
            <input type="password" id="passkey-disp-${h.id}" value="${h.access_key}" readonly style="width: 140px; background: #090e1a; border: 1px solid #1e293b; color: #38bdf8; font-family: 'JetBrains Mono', monospace; font-size: 0.76rem; padding: 0.25rem 0.45rem; border-radius: 6px;">
            <button type="button" class="btn-qty" onclick="togglePasskeyView('${h.id}')" title="Show/Hide Passkey" style="font-size: 0.7rem; padding: 0.2rem 0.45rem;">👁️</button>
            <button type="button" class="btn-qty" onclick="copyDevText('${h.access_key}', 'Security Passkey')" title="Copy Passkey" style="font-size: 0.7rem; padding: 0.2rem 0.45rem;">📋</button>
          </div>
        </td>
        <td>
          <span class="badge ${isAct ? 'badge-green' : 'badge-danger'}" style="font-size: 0.72rem; font-weight: 800;">
            ${isAct ? '🟢 ACTIVE & VERIFIED' : '🔴 ACCESS REVOKED'}
          </span>
        </td>
        <td>
          <div style="font-size: 0.8rem; font-weight: 600; color: #cbd5e1;">${h.nodal_officer || 'Chief Medical Officer'}</div>
          <div style="font-size: 0.72rem; color: #94a3b8;">📞 ${h.nodal_phone || h.contact}</div>
          <div style="font-size: 0.7rem; color: #a855f7; font-family: 'JetBrains Mono', monospace;">Lic: ${h.license_no}</div>
        </td>
        <td>
          <div style="display: flex; gap: 0.35rem; flex-wrap: wrap;">
            <button class="btn btn-secondary" style="padding: 0.28rem 0.55rem; font-size: 0.72rem;" onclick="openHandoverLetterModal('${h.id}')" title="View & Copy Credential Handover Letter">📋 Letter</button>
            <button class="btn btn-secondary" style="padding: 0.28rem 0.55rem; font-size: 0.72rem; color: #f59e0b;" onclick="regenerateHospitalPasskey('${h.id}', '${h.name}')" title="Regenerate Security Passkey">🔑 Rotate</button>
            <button class="btn ${isAct ? 'btn-danger' : 'btn-primary'}" style="padding: 0.28rem 0.55rem; font-size: 0.72rem;" onclick="toggleHospitalAccess('${h.id}', ${isAct}, '${h.name}')">
              ${isAct ? '⛔ Revoke' : '✅ Restore'}
            </button>
            <button class="btn btn-secondary" style="padding: 0.28rem 0.55rem; font-size: 0.72rem;" onclick="openEditHospitalModal('${h.id}')">✏️</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

window.togglePasskeyView = function(id) {
  const input = document.getElementById('passkey-disp-' + id);
  if (input) {
    input.type = input.type === 'password' ? 'text' : 'password';
  }
};

window.copyDevText = function(text, label) {
  navigator.clipboard.writeText(text).then(() => {
    showToast(`📋 Copied ${label} to clipboard!`);
  }).catch(() => {
    prompt('Copy to clipboard:', text);
  });
};

window.openHandoverLetterModal = function(id) {
  const h = (state.credentials || []).find(item => item.id === id) || (state.hospitals || []).find(item => item.id === id);
  if (!h) return;

  const letterText = `========================================================================
GOVERNMENT OF MAHARASHTRA • PUBLIC HEALTH DEPARTMENT
STATE RURAL HEALTH NETWORK - OFFICIAL CREDENTIAL AUTHORIZATION DOSSIER
========================================================================
ISSUED BY: Master Developer Ram Sri Charan (Root Authority)
ISSUED TO: ${h.name} (${h.name_mr || ''})
DISTRICT:  ${h.district || 'Nashik'} | TALUKA: ${h.taluka || 'Trimbakeshwar'}
STATE REG: ${h.license_no || 'MH-DHS-2026-ACTIVE'}
OFFICER:   ${h.nodal_officer || 'Chief Medical Officer'} (${h.nodal_phone || h.contact || 'N/A'})
ISSUED AT: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}

------------------------------------------------------------------------
OFFICIAL HOSPITAL & MO PORTAL ACCESS CREDENTIALS
------------------------------------------------------------------------
PORTAL URL:       https://graminaarogya.gov.in (Hospital & MO Portal Tab)
HOSPITAL CODE:    ${h.auth_code || h.id}
SECURITY PASSKEY: ${h.access_key || 'Trimbak@PHC2026'}
SECURITY STATUS:  ${h.is_verified ? 'VERIFIED & ACTIVE (256-BIT TLS GUARDED)' : 'SUSPENDED'}

------------------------------------------------------------------------
CLINICAL PORTAL CAPABILITIES
------------------------------------------------------------------------
1. Live Patient Triage Queue: Real-time 108 SOS & Token travel bookings
2. In-Patient Admission & Bed Allocation (General, ICU, Oxygen Wards)
3. Direct Doctor Video Teleconsultation Calling & Video Status Toggle
4. Digital Prescription & Official Receipt Generation (QR Code Sealed)
5. Hospital Resource Telemetry: Real-time Blood Stock & Anti-Venom Sync

------------------------------------------------------------------------
SECURITY DIRECTIVE FOR NODAL MEDICAL SUPERINTENDENTS
------------------------------------------------------------------------
- This passkey is strictly restricted to authorized hospital personnel.
- Public self-registration is disabled under State Digital Health policy.
- For emergency passkey rotation or access revocation, contact Master Developer.
========================================================================`;

  const previewEl = document.getElementById('credential-letter-preview');
  if (previewEl) previewEl.textContent = letterText;

  const btnCopy = document.getElementById('btn-copy-handover-letter');
  if (btnCopy) {
    btnCopy.onclick = () => {
      copyDevText(letterText, 'Official Handover Letter');
      closeDevModal('modal-credential-letter');
    };
  }

  openDevModal('modal-credential-letter');
};

window.regenerateHospitalPasskey = async function(id, name) {
  if (!confirm(`Rotate security passkey for ${name}? This will invalidate all currently active login sessions for this hospital.`)) return;

  try {
    const res = await devFetch(`${API_BASE}/api/dev/hospitals/${id}/regenerate-key`, { method: 'PUT' });
    const data = await res.json();
    if (data.success) {
      showToast(`🔑 Rotated passkey for ${name}: ${data.newPasskey}`);
      fetchHospitalCredentials();
      fetchHospitals();
    } else {
      alert(data.error || 'Failed to rotate passkey');
    }
  } catch (e) {
    showToast('Failed to connect to backend');
  }
};

window.toggleHospitalAccess = async function(id, currentIsActive, name) {
  const newStatus = !currentIsActive;
  const actionName = newStatus ? 'Restore Access' : 'Revoke & Suspend Access';
  if (!confirm(`${actionName} for ${name}? ${newStatus ? 'Hospital staff will be able to log in.' : 'Active sessions will be immediately terminated and login will be denied.'}`)) return;

  try {
    const res = await devFetch(`${API_BASE}/api/dev/hospitals/${id}/toggle-access`, {
      method: 'PUT',
      body: JSON.stringify({ is_verified: newStatus })
    });
    const data = await res.json();
    if (data.success) {
      showToast(`⚡ Hospital access is now ${newStatus ? 'ACTIVE' : 'SUSPENDED'}`);
      fetchHospitalCredentials();
      fetchHospitals();
      fetchStats();
    } else {
      alert(data.error || 'Failed to toggle access');
    }
  } catch (e) {
    showToast('Failed to connect to backend');
  }
};

// 3. Blood Bank Cards
function renderBloodBankCards(list) {
  const container = document.getElementById('grid-blood-bank');
  if (!container) return;

  container.innerHTML = list.map(h => {
    const bs = h.live_status?.blood_stock || {};
    const types = ['A_pos', 'A_neg', 'B_pos', 'B_neg', 'O_pos', 'O_neg', 'AB_pos', 'AB_neg'];
    const labels = {
      A_pos: 'A+', A_neg: 'A-', B_pos: 'B+', B_neg: 'B-',
      O_pos: 'O+', O_neg: 'O-', AB_pos: 'AB+', AB_neg: 'AB-'
    };

    return `
      <div class="hospital-ctrl-card">
        <div class="hosp-card-header">
          <div>
            <div class="hosp-title">${h.name}</div>
            <div class="hosp-loc">📍 ${h.taluka}, ${h.district} • Contact: ${h.contact}</div>
          </div>
          <span class="badge badge-cyber" style="font-size: 0.7rem;">Blood Bank Active</span>
        </div>

        <div class="blood-types-grid">
          ${types.map(t => `
            <div class="blood-type-box">
              <div class="blood-type-name">${labels[t]}</div>
              <div class="blood-type-val" id="val-blood-${h.id}-${t}">${bs[t] || 0}</div>
              <div class="blood-qty-btns">
                <button class="btn-qty" onclick="adjustBloodStock('${h.id}', '${t}', -1)">-</button>
                <button class="btn-qty" onclick="adjustBloodStock('${h.id}', '${t}', 1)">+</button>
              </div>
            </div>
          `).join('')}
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 0.5rem;">
          <button class="btn btn-primary" style="font-size: 0.75rem; padding: 0.4rem 0.8rem;" onclick="replenishBloodStockAll('${h.id}')">
            ⚡ Quick Replenish +5 Units
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// 4. Live Beds Cards
function renderBedsCards(list) {
  const container = document.getElementById('grid-beds');
  if (!container) return;

  container.innerHTML = list.map(h => {
    const beds = h.live_status?.beds || {};

    return `
      <div class="hospital-ctrl-card">
        <div class="hosp-card-header">
          <div>
            <div class="hosp-title">${h.name}</div>
            <div class="hosp-loc">📍 ${h.taluka}, ${h.district}</div>
          </div>
          <span class="badge ${beds.icu_available > 0 ? 'badge-green' : 'badge-danger'}" style="font-size: 0.7rem;">
            ${beds.icu_available > 0 ? 'ICU Available' : 'ICU Full'}
          </span>
        </div>

        <div class="beds-ctrl-grid">
          <div class="bed-item-card">
            <div class="bed-type-title">General Ward Beds</div>
            <div class="bed-counter-val" id="val-gen-bed-${h.id}" style="color: #38bdf8;">${beds.general_available || 0}</div>
            <div style="font-size: 0.7rem; color: #94a3b8; margin-bottom: 0.5rem;">Total Capacity: ${beds.general_total || 20}</div>
            <div class="bed-stepper-btns">
              <button class="btn-step" onclick="adjustBeds('${h.id}', 'general_available', -1)">-1</button>
              <button class="btn-step" onclick="adjustBeds('${h.id}', 'general_available', 1)">+1</button>
              <button class="btn-step" onclick="adjustBeds('${h.id}', 'general_available', 5)">+5</button>
            </div>
          </div>

          <div class="bed-item-card">
            <div class="bed-type-title" style="color: #f43f5e;">ICU / Ventilator Beds</div>
            <div class="bed-counter-val" id="val-icu-bed-${h.id}" style="color: #f43f5e;">${beds.icu_available || 0}</div>
            <div style="font-size: 0.7rem; color: #94a3b8; margin-bottom: 0.5rem;">Total Capacity: ${beds.icu_total || 5}</div>
            <div class="bed-stepper-btns">
              <button class="btn-step" onclick="adjustBeds('${h.id}', 'icu_available', -1)">-1</button>
              <button class="btn-step" onclick="adjustBeds('${h.id}', 'icu_available', 1)">+1</button>
            </div>
          </div>

          <div class="bed-item-card">
            <div class="bed-type-title" style="color: #ec4899;">Maternity Delivery Beds</div>
            <div class="bed-counter-val" id="val-mat-bed-${h.id}" style="color: #ec4899;">${beds.maternity_available || 0}</div>
            <div style="font-size: 0.7rem; color: #94a3b8; margin-bottom: 0.5rem;">Labor Ward</div>
            <div class="bed-stepper-btns">
              <button class="btn-step" onclick="adjustBeds('${h.id}', 'maternity_available', -1)">-1</button>
              <button class="btn-step" onclick="adjustBeds('${h.id}', 'maternity_available', 1)">+1</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// 5. Medicines Cards
function renderMedicinesCards(list) {
  const container = document.getElementById('grid-medicines');
  if (!container) return;

  container.innerHTML = list.map(h => {
    const med = h.live_status?.medicines_stock || {};

    return `
      <div class="hospital-ctrl-card">
        <div class="hosp-card-header">
          <div>
            <div class="hosp-title">${h.name}</div>
            <div class="hosp-loc">📍 ${h.taluka}, ${h.district} • Duty Doctor: ${h.live_status?.duty_doctor?.name || 'On Duty'}</div>
          </div>
          <span class="badge ${med.anti_venom_vials > 5 ? 'badge-green' : 'badge-danger'}" style="font-size: 0.7rem;">
            ${med.anti_venom_vials > 5 ? 'Anti-Venom Stocked' : 'Low Anti-Venom Alert!'}
          </span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem;">
          <div class="med-item-card">
            <div class="med-name">🐍 Anti-Venom Vials</div>
            <div class="med-val" id="val-med-av-${h.id}" style="color: #f43f5e;">${med.anti_venom_vials || 0}</div>
            <div class="med-btns">
              <button class="btn-qty" onclick="adjustMedicine('${h.id}', 'anti_venom_vials', -1)">-</button>
              <button class="btn-qty" onclick="adjustMedicine('${h.id}', 'anti_venom_vials', 5)">+5</button>
            </div>
          </div>

          <div class="med-item-card">
            <div class="med-name">💧 ORS Packets</div>
            <div class="med-val" id="val-med-ors-${h.id}" style="color: #0d9488;">${med.ors_packets || 0}</div>
            <div class="med-btns">
              <button class="btn-qty" onclick="adjustMedicine('${h.id}', 'ors_packets', -10)">-10</button>
              <button class="btn-qty" onclick="adjustMedicine('${h.id}', 'ors_packets', 50)">+50</button>
            </div>
          </div>

          <div class="med-item-card">
            <div class="med-name">💊 Paracetamol Strips</div>
            <div class="med-val" id="val-med-pcm-${h.id}" style="color: #38bdf8;">${med.paracetamol_strips || 0}</div>
            <div class="med-btns">
              <button class="btn-qty" onclick="adjustMedicine('${h.id}', 'paracetamol_strips', -20)">-20</button>
              <button class="btn-qty" onclick="adjustMedicine('${h.id}', 'paracetamol_strips', 50)">+50</button>
            </div>
          </div>

          <div class="med-item-card">
            <div class="med-name">🫁 Oxygen Cylinders</div>
            <div class="med-val" id="val-med-o2-${h.id}" style="color: #a855f7;">${med.oxygen_cylinders || 0}</div>
            <div class="med-btns">
              <button class="btn-qty" onclick="adjustMedicine('${h.id}', 'oxygen_cylinders', -1)">-</button>
              <button class="btn-qty" onclick="adjustMedicine('${h.id}', 'oxygen_cylinders', 2)">+2</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// 6. Users & ASHA Role Management
async function fetchUsers() {
  try {
    const res = await devFetch(`${API_BASE}/api/dev/users`);
    const data = await res.json();
    if (data.success && data.users) {
      state.users = data.users;
      renderUsersTable(data.users);
    }
  } catch (e) {
    console.warn('Failed to fetch users:', e);
  }
}

function renderUsersTable(list) {
  const tbody = document.getElementById('tbody-users');
  if (!tbody) return;

  tbody.innerHTML = list.map(u => `
    <tr>
      <td>
        <strong style="color: white; font-size: 0.9rem;">${u.fullName || u.full_name || 'Anonymous User'}</strong>
      </td>
      <td>
        <span style="font-family: 'JetBrains Mono', monospace; color: #38bdf8;">+91 ${u.phone || u.phone_number}</span>
      </td>
      <td>
        <span class="badge ${u.role === 'asha' ? 'badge-pink' : u.role === 'doctor' ? 'badge-amber' : 'badge-green'}" style="font-size: 0.72rem;">
          ${u.role === 'asha' ? '🩺 ASHA WORKER' : u.role === 'doctor' ? '👨‍⚕️ DOCTOR' : '🌾 CITIZEN'}
        </span>
      </td>
      <td>
        ${u.asha_badge_no ? `<span class="badge badge-cyber" style="font-size: 0.7rem;">${u.asha_badge_no}</span>` : '<span style="color:#64748b;">N/A</span>'}
      </td>
      <td>
        <div style="font-size: 0.8rem;">${u.village || 'Trimbak Pada'}, ${u.district || 'Nashik Rural'}</div>
      </td>
      <td>
        <span style="color: ${u.biometric_enabled ? '#10b981' : '#f59e0b'}; font-weight: 700; font-size: 0.75rem;">
          ${u.biometric_enabled ? '✓ Passkey Active' : 'OTP Only'}
        </span>
      </td>
      <td>
        <button class="btn btn-secondary" style="font-size: 0.75rem; padding: 0.3rem 0.6rem;" onclick="openEditUserRoleModal('${u.phone || u.phone_number}', '${u.fullName || u.full_name || ''}', '${u.role}', '${u.asha_badge_no || ''}')">
          ⚙️ Manage Role
        </button>
      </td>
    </tr>
  `).join('');
}

// 7. Remedies (40%)
async function fetchRemedies() {
  try {
    const res = await devFetch(`${API_BASE}/api/remedies`);
    const data = await res.json();
    if (data.success && data.remedies) {
      state.remedies = data.remedies;
      renderRemediesGrid(data.remedies);
    }
  } catch (e) {
    console.warn('Failed to fetch remedies:', e);
  }
}

function renderRemediesGrid(list) {
  const container = document.getElementById('grid-remedies');
  if (!container) return;

  container.innerHTML = list.map(r => `
    <div class="remedy-ctrl-card">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
        <div>
          <h4 style="color: white; font-size: 0.95rem; margin: 0;">${r.title}</h4>
          <span style="font-size: 0.75rem; color: #10b981;">${r.title_mr || ''}</span>
        </div>
        <span class="badge badge-green" style="font-size: 0.68rem;">40% Remedy</span>
      </div>

      <div style="font-size: 0.8rem; color: #cbd5e1; margin-bottom: 0.75rem; line-height: 1.4;">
        <strong>First Aid:</strong> ${r.firstAid}
      </div>

      <div style="background: #090e1a; padding: 0.6rem; border-radius: 8px; font-size: 0.75rem; color: #94a3b8; margin-bottom: 0.75rem;">
        🍵 <strong>Kadha / Method:</strong> ${r.kadha}
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.72rem; color: #f87171;">
        <span>🚨 Red Flag: ${r.redFlag}</span>
      </div>
    </div>
  `).join('');
}

// 8. Complications (60%)
async function fetchComplications() {
  try {
    const res = await devFetch(`${API_BASE}/api/complications`);
    const data = await res.json();
    if (data.success && data.complications) {
      state.complications = data.complications;
      renderComplicationsGrid(data.complications);
    }
  } catch (e) {
    console.warn('Failed to fetch complications:', e);
  }
}

function renderComplicationsGrid(list) {
  const container = document.getElementById('grid-complications');
  if (!container) return;

  container.innerHTML = list.map(c => `
    <div class="complication-ctrl-card">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
        <div>
          <h4 style="color: #fca5a5; font-size: 0.95rem; margin: 0;">${c.title}</h4>
          <span style="font-size: 0.75rem; color: #f87171;">${c.title_mr || ''}</span>
        </div>
        <span class="badge badge-danger" style="font-size: 0.68rem;">🚨 60% Critical</span>
      </div>

      <div style="font-size: 0.8rem; color: #cbd5e1; margin-bottom: 0.6rem;">
        <strong>Golden Hour Protocol:</strong> ${c.actionRequired}
      </div>

      <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); padding: 0.6rem; border-radius: 8px; font-size: 0.75rem; color: #fca5a5; margin-bottom: 0.75rem;">
        ⏱️ <strong>Golden Window:</strong> ${c.goldenHourWindow} • Mandatory: ${c.requiredFacility}
      </div>

      <div style="font-size: 0.72rem; color: #38bdf8;">
        📞 Recommended SOS: ${c.emergencyHelpline || '108'}
      </div>
    </div>
  `).join('');
}

// 9. GPS Telemetry Stream
async function fetchGpsLogs() {
  try {
    const res = await devFetch(`${API_BASE}/api/dev/gps-stream`);
    const data = await res.json();
    if (data.success && data.gpsLogs) {
      state.gpsLogs = data.gpsLogs;
      renderGpsLogs(data.gpsLogs);
    }
  } catch (e) {
    console.warn('Failed to fetch GPS logs:', e);
  }
}

function renderGpsLogs(logs) {
  const container = document.getElementById('gps-logs-list');
  if (!container) return;

  if (logs.length === 0) {
    container.innerHTML = `<div style="text-align: center; padding: 2rem; color: #94a3b8;">No live GPS pings received yet. Move around or change presets in the main citizen app.</div>`;
    return;
  }

  container.innerHTML = logs.slice(0, 15).map(g => `
    <div class="gps-stream-item">
      <div style="display: flex; align-items: center; gap: 0.6rem;">
        <span style="font-size: 1.2rem;">📍</span>
        <div>
          <div style="font-size: 0.85rem; font-weight: 700; color: white;">
            ${g.preset_name || 'Live Citizen Position'} (${g.latitude?.toFixed(4)}°, ${g.longitude?.toFixed(4)}°)
          </div>
          <div style="font-size: 0.72rem; color: #94a3b8;">
            Accuracy: ±${g.accuracy_m || 15}m • Nearest Facility: <strong style="color: #38bdf8;">${g.nearest_hospital_name || 'Trimbakeshwar PHC'}</strong> (${g.distance_km || 4.2} km)
          </div>
        </div>
      </div>
      <div style="font-size: 0.72rem; color: #64748b; font-family: 'JetBrains Mono', monospace;">
        ${new Date(g.created_at || g.timestamp).toLocaleTimeString()}
      </div>
    </div>
  `).join('');
}

// 10. PostgreSQL Status
async function fetchDbStatus() {
  try {
    const res = await devFetch(`${API_BASE}/api/dev/stats`);
    const data = await res.json();
    if (data.success) {
      document.getElementById('db-status-engine').textContent = data.stats.dbEngine || 'PostgreSQL Live SQL Engine';
      document.getElementById('db-status-uptime').textContent = (data.stats.serverUptimeSec || 0) + 's';
      document.getElementById('db-status-consultations').textContent = data.stats.totalConsultations || 0;
      document.getElementById('db-status-pings').textContent = data.stats.totalGpsPings || 0;
    }
  } catch (e) {
    console.warn('Failed to fetch DB status:', e);
  }
}

// -------------------------------------------------------------
// LIVE MUTATIONS (AJAX TO /api/dev/*)
// -------------------------------------------------------------

// Blood Stock Adjuster
window.adjustBloodStock = async function(hospitalId, bloodType, delta) {
  const currentVal = parseInt(document.getElementById(`val-blood-${hospitalId}-${bloodType}`)?.textContent) || 0;
  const newVal = Math.max(0, currentVal + delta);

  try {
    const res = await devFetch(`${API_BASE}/api/dev/hospitals/${hospitalId}/blood-stock`, {
      method: 'PUT',
      body: JSON.stringify({ [bloodType]: newVal })
    });
    const data = await res.json();
    if (data.success) {
      document.getElementById(`val-blood-${hospitalId}-${bloodType}`).textContent = newVal;
      showToast(`🩸 Blood stock updated for ${hospitalId}: ${bloodType} = ${newVal}`);
      fetchStats();
    }
  } catch (e) {
    showToast('Failed to update blood stock');
  }
};

window.replenishBloodStockAll = async function(hospitalId) {
  try {
    const res = await devFetch(`${API_BASE}/api/dev/hospitals/${hospitalId}/blood-stock`, {
      method: 'PUT',
      body: JSON.stringify({ A_pos: 15, B_pos: 15, O_pos: 20, AB_pos: 10 })
    });
    const data = await res.json();
    if (data.success) {
      showToast(`⚡ Fully replenished blood stock for hospital!`);
      fetchHospitals();
      fetchStats();
    }
  } catch (e) {
    showToast('Replenish failed');
  }
};

// Beds Adjuster
window.adjustBeds = async function(hospitalId, bedKey, delta) {
  const elemId = bedKey === 'general_available' ? `val-gen-bed-${hospitalId}` : bedKey === 'icu_available' ? `val-icu-bed-${hospitalId}` : `val-mat-bed-${hospitalId}`;
  const currentVal = parseInt(document.getElementById(elemId)?.textContent) || 0;
  const newVal = Math.max(0, currentVal + delta);

  try {
    const res = await devFetch(`${API_BASE}/api/dev/hospitals/${hospitalId}/beds`, {
      method: 'PUT',
      body: JSON.stringify({ [bedKey]: newVal })
    });
    const data = await res.json();
    if (data.success) {
      document.getElementById(elemId).textContent = newVal;
      showToast(`🛏️ Beds updated for ${hospitalId}: ${bedKey} = ${newVal}`);
      fetchStats();
    }
  } catch (e) {
    showToast('Failed to update bed counters');
  }
};

// Medicines Adjuster
window.adjustMedicine = async function(hospitalId, medKey, delta) {
  const hosp = state.hospitals.find(h => h.id === hospitalId);
  const currentVal = hosp?.live_status?.medicines_stock?.[medKey] || 0;
  const newVal = Math.max(0, currentVal + delta);

  try {
    const res = await devFetch(`${API_BASE}/api/dev/hospitals/${hospitalId}/medicines`, {
      method: 'PUT',
      body: JSON.stringify({ [medKey]: newVal })
    });
    const data = await res.json();
    if (data.success) {
      showToast(`💊 Medicine supply updated: ${medKey} = ${newVal}`);
      fetchHospitals();
      fetchStats();
    }
  } catch (e) {
    showToast('Failed to update supplies');
  }
};

// Delete Hospital
window.deleteHospital = async function(id, name) {
  if (!confirm(`Are you sure you want to remove ${name} (${id}) from the active healthcare registry?`)) return;

  try {
    const res = await devFetch(`${API_BASE}/api/dev/hospitals/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      showToast(`🗑️ Removed ${name} from registry`);
      fetchHospitals();
      fetchStats();
    }
  } catch (e) {
    showToast('Delete failed');
  }
};

// User Role Management Modal
window.openEditUserRoleModal = function(phone, fullName, currentRole, ashaBadge) {
  document.getElementById('user-role-phone').value = phone;
  document.getElementById('user-role-phone-display').value = phone;
  document.getElementById('user-role-fullname').value = fullName;
  document.getElementById('user-role-select').value = currentRole;
  document.getElementById('user-role-badge').value = ashaBadge || '';

  const badgeGroup = document.getElementById('asha-badge-group');
  if (badgeGroup) {
    badgeGroup.style.display = currentRole === 'asha' ? 'block' : 'none';
  }

  document.getElementById('user-role-select').onchange = (e) => {
    if (badgeGroup) {
      badgeGroup.style.display = e.target.value === 'asha' ? 'block' : 'none';
    }
  };

  openDevModal('modal-user-role');
};

// -------------------------------------------------------------
// MODALS MANAGEMENT
// -------------------------------------------------------------
function initModals() {
  // Form add hospital
  document.getElementById('form-add-hospital')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      name: document.getElementById('hosp-name').value,
      name_mr: document.getElementById('hosp-name-mr').value,
      type: document.getElementById('hosp-type').value,
      district: document.getElementById('hosp-district').value,
      taluka: document.getElementById('hosp-taluka').value,
      contact: document.getElementById('hosp-contact').value,
      emergency_sos: document.getElementById('hosp-sos').value,
      latitude: parseFloat(document.getElementById('hosp-lat').value) || 19.9381,
      longitude: parseFloat(document.getElementById('hosp-lng').value) || 73.5312,
      general_beds: parseInt(document.getElementById('hosp-gen-beds').value) || 10,
      icu_beds: parseInt(document.getElementById('hosp-icu-beds').value) || 2,
      anti_venom: parseInt(document.getElementById('hosp-anti-venom').value) || 15,
      blood_O_pos: parseInt(document.getElementById('hosp-blood-o-pos').value) || 10
    };

    try {
      const res = await devFetch(`${API_BASE}/api/dev/hospitals`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        showToast(`✅ Registered ${payload.name} to healthcare network!`);
        closeDevModal('modal-add-hospital');
        fetchHospitals();
        fetchStats();
      } else {
        alert(data.error || 'Failed to add hospital');
      }
    } catch (e) {
      alert('Error connecting to backend');
    }
  });

  // Form user role
  document.getElementById('form-user-role')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const phone = document.getElementById('user-role-phone').value;
    const role = document.getElementById('user-role-select').value;
    const ashaBadgeNo = document.getElementById('user-role-badge').value;

    try {
      const res = await devFetch(`${API_BASE}/api/dev/users/${phone}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role, ashaBadgeNo })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`👥 Updated role for ${phone} to ${role.toUpperCase()}`);
        closeDevModal('modal-user-role');
        fetchUsers();
        fetchStats();
      } else {
        alert(data.error || 'Failed to update user role');
      }
    } catch (e) {
      alert('Error updating user');
    }
  });
}

window.openAddHospitalModal = function() {
  document.getElementById('modal-hosp-title').textContent = 'Provision New Hospital Facility & Credentials';
  document.getElementById('hosp-edit-id').value = '';
  document.getElementById('hosp-name').value = '';
  document.getElementById('hosp-name-mr').value = '';
  document.getElementById('hosp-type').value = 'Primary Health Centre (PHC)';
  document.getElementById('hosp-district').value = 'Nashik Rural - Trimbakeshwar Block';
  document.getElementById('hosp-lat').value = '19.9381';
  document.getElementById('hosp-lng').value = '73.5312';
  document.getElementById('hosp-contact').value = '+91 2594 233100';
  document.getElementById('hosp-sos').value = '108';

  // Auto generated credentials
  const nextNum = String((state.hospitals || []).length + 1).padStart(2, '0');
  document.getElementById('hosp-auth-code').value = 'hosp-' + nextNum;
  document.getElementById('hosp-access-key').value = 'Hosp@Nashik' + Math.floor(1000 + Math.random() * 9000);
  document.getElementById('hosp-license').value = 'MH-DHS-2026-HOSP-' + Math.floor(100 + Math.random() * 900);
  document.getElementById('hosp-nodal-officer').value = 'Dr. Rajesh Shinde (Chief Medical Officer)';
  document.getElementById('hosp-nodal-phone').value = '+91 98220 11901';
  document.getElementById('hosp-verification-status').value = 'VERIFIED_AUTHENTICATED';

  document.getElementById('hosp-icu').value = '3';
  document.getElementById('hosp-gen').value = '20';
  document.getElementById('hosp-anti-venom').value = '20';
  document.getElementById('hosp-blood-o').value = '15';

  openDevModal('modal-hospital');
};

window.openEditHospitalModal = function(id) {
  const h = (state.hospitals || []).find(item => item.id === id) || (state.credentials || []).find(item => item.id === id);
  if (!h) return;

  document.getElementById('modal-hosp-title').textContent = 'Edit Hospital & Credentials: ' + h.name;
  document.getElementById('hosp-edit-id').value = h.id;
  document.getElementById('hosp-name').value = h.name || '';
  document.getElementById('hosp-name-mr').value = h.name_mr || h.name || '';
  document.getElementById('hosp-type').value = h.type || 'Primary Health Centre (PHC)';
  document.getElementById('hosp-district').value = (h.taluka ? h.taluka + ', ' : '') + (h.district || 'Nashik');
  document.getElementById('hosp-lat').value = h.coordinates?.lat || 19.9381;
  document.getElementById('hosp-lng').value = h.coordinates?.lng || 73.5312;
  document.getElementById('hosp-contact').value = h.contact || '';
  document.getElementById('hosp-sos').value = h.emergency_sos || '108';

  document.getElementById('hosp-auth-code').value = h.auth_code || h.id;
  document.getElementById('hosp-access-key').value = h.access_key || 'Trimbak@PHC2026';
  document.getElementById('hosp-license').value = h.license_no || 'MH-DHS-2026-HOSP-001';
  document.getElementById('hosp-nodal-officer').value = h.nodal_officer || 'Chief Medical Officer';
  document.getElementById('hosp-nodal-phone').value = h.nodal_phone || h.contact || '';
  document.getElementById('hosp-verification-status').value = h.verification_status || (h.is_verified ? 'VERIFIED_AUTHENTICATED' : 'SUSPENDED_REVOKED');

  const beds = h.live_status?.beds || {};
  document.getElementById('hosp-icu').value = beds.icu_available || 3;
  document.getElementById('hosp-gen').value = beds.general_available || 15;
  document.getElementById('hosp-anti-venom').value = h.live_status?.medicines_stock?.anti_venom_vials || 20;
  document.getElementById('hosp-blood-o').value = h.live_status?.blood_stock?.O_pos || 15;

  openDevModal('modal-hospital');
};

window.autoGenerateAuthCode = function() {
  const nextNum = String((state.hospitals || []).length + 1).padStart(2, '0');
  document.getElementById('hosp-auth-code').value = 'hosp-' + nextNum;
};

window.autoGeneratePasskey = function() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
  let pass = 'Hosp@';
  for (let i = 0; i < 6; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  document.getElementById('hosp-access-key').value = pass;
};

window.openDevModal = function(id) {
  const m = document.getElementById(id);
  if (m) m.classList.add('active');
};

window.closeDevModal = function(id) {
  const m = document.getElementById(id);
  if (m) m.classList.remove('active');
};

// Toast notification helper
function showToast(msg) {
  const toast = document.getElementById('dev-toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.style.display = 'flex';
  setTimeout(() => {
    toast.style.display = 'none';
  }, 3500);
}
