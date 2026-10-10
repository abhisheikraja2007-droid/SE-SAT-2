// Warehouse Dispatch System - Executive Terminal Controller
// Full Dynamic Engine matching Reference Telemetry Console

// Core DOM Elements
const roleSelect = document.getElementById('roleSelect');
const userPortal = document.getElementById('user-portal');
const adminPortal = document.getElementById('admin-portal');
const currentUserLabel = document.getElementById('currentUserLabel');
const createRequestForm = document.getElementById('createRequestForm');
const resourceSelect = document.getElementById('resourceSelect');
const destinationHubSelect = document.getElementById('destinationHubSelect');
const requestsTableBody = document.querySelector('#requestsTable tbody');
const queueCardsContainer = document.getElementById('queueCardsContainer');
const queueTableContainer = document.getElementById('queueTableContainer');
const errorContainer = document.getElementById('error-container');
const successContainer = document.getElementById('success-container');
const refreshBtn = document.getElementById('refreshBtn');

// Form Inputs
const nameInput = document.getElementById('nameInput');
const phoneInput = document.getElementById('phoneInput');
const descriptionInput = document.getElementById('descriptionInput');
const baseValueInput = document.getElementById('baseValue');
const palletCountInput = document.getElementById('palletCountInput');
const calculatedChargeSpan = document.getElementById('calculatedCharge');
const previewBaseSpan = document.getElementById('previewBase');
const previewTotalSpan = document.getElementById('previewTotal');
const submitRequestBtn = document.getElementById('submitRequestBtn');
const tokenDisplay = document.getElementById('tokenDisplay');
const rateLockTimer = document.getElementById('rateLockTimer');
const estimatedSurchargeDisplay = document.getElementById('estimatedSurchargeDisplay');
const turnaroundWindowDisplay = document.getElementById('turnaroundWindowDisplay');
const bayLockSlotDisplay = document.getElementById('bayLockSlotDisplay');
const palletWeightEst = document.getElementById('palletWeightEst');

// Metric Displays
const metricActiveQueue = document.getElementById('metricActiveQueue');
const metricTurnaround = document.getElementById('metricTurnaround');
const metricFleetCapacity = document.getElementById('metricFleetCapacity');
const metricLatency = document.getElementById('metricLatency');
const activeTasksCountPill = document.getElementById('activeTasksCountPill');
const liveUtcClock = document.getElementById('liveUtcClock');

// Profile Displays
const displayUserName = document.getElementById('displayUserName');
const displayUserConsole = document.getElementById('displayUserConsole');
const userAvatar = document.getElementById('userAvatar');

// Active State
let currentUser = JSON.parse(roleSelect.value);
window.currentUser = currentUser;

let cachedRequests = [];
let cachedResources = [];
let currentFilter = 'all';
let currentSearchQuery = '';
let currentViewMode = 'cards'; // 'cards' | 'table'
let isStreaming = true;
let isAllocatorActive = true;
let selectedPriority = 'expedited';
let rateLockSeconds = 900; // 15 mins

// Tracking duplicate submissions
let lastSubmittedPayload = null;
let lastSubmittedTime = 0;

// Operational Simulation Data
let dockDoors = [
  { id: 1, name: 'Bay Door 01', status: 'occupied', trailer: 'TR-904', carrier: 'Swift Logistics', temp: '4.1°C', seal: '#99812', pallets: 14 },
  { id: 2, name: 'Bay Door 02', status: 'occupied', trailer: 'TR-412', carrier: 'Penske Freight', temp: 'Ambient', seal: '#88319', pallets: 8 },
  { id: 3, name: 'Bay Door 03', status: 'occupied', trailer: 'TR-188', carrier: 'JB Hunt Intermodal', temp: '3.8°C', seal: '#77123', pallets: 12 },
  { id: 4, name: 'Bay Door 04', status: 'occupied', trailer: 'TR-771', carrier: 'Cold Rx Pharma', temp: '2.4°C', seal: '#44901', pallets: 6 },
  { id: 5, name: 'Bay Door 05', status: 'occupied', trailer: 'TR-230', carrier: 'Ryder Logistics', temp: 'Ambient', seal: '#11849', pallets: 16 },
  { id: 6, name: 'Bay Door 06', status: 'occupied', trailer: 'TR-881', carrier: 'Bulk Raw Minerals', temp: 'Ambient', seal: '#33291', pallets: 20 },
  { id: 7, name: 'Bay Door 07', status: 'maint', trailer: 'None (Cleaning)', carrier: 'Facility Ops', temp: '--', seal: '--', pallets: 0 },
  { id: 8, name: 'Bay Door 08', status: 'staging', trailer: 'TR-502', carrier: 'Knight Transport', temp: '4.8°C', seal: '#99120', pallets: 10 },
  { id: 9, name: 'Bay Door 09', status: 'occupied', trailer: 'TR-339', carrier: 'Old Dominion', temp: 'Ambient', seal: '#88412', pallets: 18 },
  { id: 10, name: 'Bay Door 10', status: 'occupied', trailer: 'TR-614', carrier: 'XPO Intermodal', temp: 'Ambient', seal: '#77412', pallets: 14 },
  { id: 11, name: 'Bay Door 11', status: 'staging', trailer: 'TR-719', carrier: 'Schneider Bulk', temp: '3.6°C', seal: '#66129', pallets: 12 },
  { id: 12, name: 'Bay Door 12', status: 'available', trailer: 'Open Gate', carrier: 'Unassigned', temp: 'Nominal', seal: 'Gate Ready', pallets: 0 }
];

let yardAlerts = [
  { id: 1, title: 'Cold Chain Warning', desc: 'Bay B-12 reading +4.8°C (Threshold +5.0°C). Sensor probe A-1 active.', level: 'danger', time: '2m ago' },
  { id: 2, title: 'Trailer Seal Verification', desc: 'Seal Tag #88194 at Gate 03 verified by OCR inspection camera.', level: 'warning', time: '6m ago' },
  { id: 3, title: 'AMR Battery Induction', desc: 'Autonomous Pallet Unit #14 docking for rapid inductive charging.', level: 'warning', time: '12m ago' },
  { id: 4, title: 'Bay 07 Maintenance Window', desc: 'Scheduled terminal cleaning & HVAC sanitization cycle (14:30 - 15:00).', level: 'warning', time: '18m ago' }
];

let fleetTractors = [
  { id: 'Tractor #809', driver: 'M. Vance', speed: '54 mph', fuel: '82%', temp: '4.2°C', dest: 'Regional Yard West 1', status: 'In Transit', lat: '28.5383° N', lng: '81.3792° W' },
  { id: 'Tractor #412', driver: 'K. Chen', speed: '0 mph', fuel: '94%', temp: 'Ambient', dest: 'Dock Door A-04', status: 'Staged Buffer', lat: '28.5410° N', lng: '81.3815° W' },
  { id: 'Tractor #339', driver: 'D. Ramos', speed: '38 mph', fuel: '68%', temp: '3.9°C', dest: 'Zone C Cold Vault 1', status: 'Inbound Gate', lat: '28.5290° N', lng: '81.3650° W' },
  { id: 'Tractor #771', driver: 'S. Al-Mansoor', speed: '62 mph', fuel: '75%', temp: '2.4°C', dest: 'Regional Hub 09', status: 'In Transit', lat: '28.5550° N', lng: '81.3990° W' }
];

// UI Messaging
function showMessage(msg, isError = false) {
  const el = isError ? errorContainer : successContainer;
  const hideEl = isError ? successContainer : errorContainer;
  el.textContent = msg;
  el.classList.remove('hidden');
  hideEl.classList.add('hidden');
}

function clearMessages() {
  errorContainer.classList.add('hidden');
  successContainer.classList.add('hidden');
}

// Live UTC Clock
function updateClock() {
  const now = new Date();
  const hrs = String(now.getUTCHours()).padStart(2, '0');
  const mins = String(now.getUTCMinutes()).padStart(2, '0');
  const secs = String(now.getUTCSeconds()).padStart(2, '0');
  if (liveUtcClock) {
    liveUtcClock.textContent = `${hrs}:${mins}:${secs} UTC`;
  }
}
setInterval(updateClock, 1000);
updateClock();

// Token Generator (FORM-04)
window.generateToken = () => {
  const randNum = Math.floor(1000 + Math.random() * 9000);
  const chars = ['A', 'B', 'C', 'X', 'Z'];
  const char = chars[Math.floor(Math.random() * chars.length)];
  const token = `DSP-2025-${randNum}-${char}`;
  if (tokenDisplay) tokenDisplay.value = token;
};

// Priority Pills
window.setPriority = (tier, el) => {
  selectedPriority = tier;
  document.querySelectorAll('.priority-pill').forEach(p => p.classList.remove('active'));
  if (el) el.classList.add('active');
  updateRateMatrix();
};

// Pallet Stepper
window.stepPallets = (delta) => {
  let val = parseInt(palletCountInput.value, 10) || 8;
  val = Math.max(1, Math.min(50, val + delta));
  palletCountInput.value = val;
  updateRateMatrix();
};

// Rate Lock Countdown
setInterval(() => {
  if (rateLockSeconds > 0) {
    rateLockSeconds--;
    const m = Math.floor(rateLockSeconds / 60);
    const s = String(rateLockSeconds % 60).padStart(2, '0');
    if (rateLockTimer) rateLockTimer.textContent = `RATE LOCKED (${m}:${s})`;
  } else {
    rateLockSeconds = 900;
  }
}, 1000);

// Dynamic Tariff & Window Matrix (BR4 + Reference Screen)
function updateRateMatrix() {
  const base = parseFloat(baseValueInput.value);
  const pallets = parseInt(palletCountInput.value, 10) || 8;
  const isCold = document.getElementById('protCold')?.checked || false;
  const isHazmat = document.getElementById('protHazmat')?.checked || false;
  const isSecurity = document.getElementById('protSec')?.checked || false;

  // Weight Calculation
  if (palletWeightEst) {
    palletWeightEst.textContent = `~${(pallets * 800).toLocaleString()} KG`;
  }

  // Turnaround Window based on pallets & priority
  let turnaroundMins = 15 + Math.round(pallets * 1.8);
  if (selectedPriority === 'standard') turnaroundMins += 15;
  if (selectedPriority === 'critical') turnaroundMins = Math.max(15, turnaroundMins - 10);
  if (turnaroundWindowDisplay) {
    turnaroundWindowDisplay.textContent = `${turnaroundMins} min`;
  }

  // Bay Lock Slot
  const resText = resourceSelect.options[resourceSelect.selectedIndex]?.text || 'Dock Door A-04';
  const bayName = resText.split(' ')[0] || 'Dock Door A-04';
  if (bayLockSlotDisplay) {
    bayLockSlotDisplay.textContent = bayName.startsWith('S') ? `Bay ${bayName}` : bayName;
  }

  // Estimated Surcharge calculation
  let fuelBase = 42.00;
  let surcharge = fuelBase + (pallets * 28.5) + (isCold ? 85.00 : 0) + (isHazmat ? 110.00 : 0) + (isSecurity ? 75.00 : 0);
  if (selectedPriority === 'expedited') surcharge *= 1.15;
  if (selectedPriority === 'critical') surcharge *= 1.40;
  if (estimatedSurchargeDisplay) {
    estimatedSurchargeDisplay.textContent = `$${surcharge.toFixed(2)}`;
  }

  // Mandatory Tariff calculation (BR4)
  if (!isNaN(base) && base >= 0) {
    const charge = base < 1000 ? 50 : 0;
    calculatedChargeSpan.textContent = `Rs. ${charge}`;
    previewBaseSpan.textContent = `Rs. ${base}`;
    previewTotalSpan.textContent = `Rs. ${base + charge}`;
  } else {
    calculatedChargeSpan.textContent = 'Rs. 0';
    previewBaseSpan.textContent = 'Rs. 0';
    previewTotalSpan.textContent = 'Rs. 0';
  }
}
window.updateRateMatrix = updateRateMatrix;
baseValueInput.addEventListener('input', updateRateMatrix);

// Autonomous Load Allocator Engine Toggle
window.toggleAllocatorEngine = () => {
  isAllocatorActive = !isAllocatorActive;
  const btn = document.getElementById('allocatorEngineBtn');
  if (btn) {
    btn.classList.toggle('active', isAllocatorActive);
    btn.innerHTML = isAllocatorActive 
      ? '<span class="material-symbols-outlined" style="font-size:14px;">bolt</span> Active Engine'
      : '<span class="material-symbols-outlined" style="font-size:14px;">pause</span> Standby';
  }
  showMessage(`Autonomous Allocator Engine: ${isAllocatorActive ? 'Online & polling 150m radius' : 'Paused'}`);
};

// API Fetch with simulated authentication headers
async function fetchAPI(endpoint, options = {}) {
  options.headers = {
    ...options.headers,
    'Content-Type': 'application/json',
    'X-User-Id': currentUser.id,
    'X-Role': currentUser.role
  };
  const res = await fetch(`/api${endpoint}`, options);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'API Error');
  }
  return data;
}
window.fetchAPI = fetchAPI;

// Persona Selection Controller
window.selectPersona = (userId) => {
  let persona;
  if (userId === 1) {
    persona = { id: 1, role: 'User', name: 'user1', displayName: 'Capt. V. Sterling', consoleId: 'DC-04', avatar: 'VS' };
  } else if (userId === 2) {
    persona = { id: 2, role: 'User', name: 'user2', displayName: 'Agent E. Rostova', consoleId: 'DC-07', avatar: 'ER' };
  } else {
    persona = { id: 3, role: 'Administrator', name: 'admin1', displayName: 'Adm. J. Kallstrom', consoleId: 'DC-01', avatar: 'JK' };
  }

  currentUser = { id: persona.id, role: persona.role, name: persona.name };
  window.currentUser = currentUser;

  // Sync hidden select for Playwright
  roleSelect.value = JSON.stringify({ id: persona.id, role: persona.role, name: persona.name });
  currentUserLabel.textContent = `Logged in as: ${persona.name} (${persona.role})`;

  // Update Visual Persona Buttons
  document.getElementById('personaUser1Btn').classList.toggle('active', persona.id === 1);
  document.getElementById('personaUser2Btn').classList.toggle('active', persona.id === 2);
  const adminBtn = document.getElementById('personaAdminBtn');
  adminBtn.classList.toggle('admin-active', persona.id === 3);

  const opToggle = document.getElementById('personaOperatorToggle');
  const admToggle = document.getElementById('personaAdminToggle');
  if (opToggle && admToggle) {
    opToggle.classList.toggle('active', persona.role === 'User');
    admToggle.classList.toggle('active', persona.role === 'Administrator');
  }

  // Update Profile Header
  displayUserName.textContent = persona.displayName;
  displayUserConsole.textContent = `Console ID: ${persona.consoleId}`;
  userAvatar.textContent = persona.avatar;

  // Toggle Admin Banner
  if (persona.role === 'Administrator') {
    adminPortal.classList.remove('hidden');
    if (window.setQueueViewMode) window.setQueueViewMode('table');
  } else {
    adminPortal.classList.add('hidden');
  }

  loadData();
};

// Native select listener for Playwright interactions
roleSelect.addEventListener('change', (e) => {
  const selected = JSON.parse(e.target.value);
  window.selectPersona(selected.id);
});

// Load Resources
async function loadResources() {
  try {
    const resources = await fetchAPI('/resources');
    cachedResources = resources;
    const selectedVal = resourceSelect.value;
    resourceSelect.innerHTML = resources.map(r => 
      `<option value="${r.id}">${r.code} (Cap: ${r.capacity}, ${r.status})</option>`
    ).join('');
    if (selectedVal) resourceSelect.value = selectedVal;

    // Populate Administrator Resource Monitor
    const mon = document.getElementById('adminResourcesMonitor');
    if (mon && resources) {
      mon.innerHTML = resources.map(r => `
        <div class="admin-resource-card">
          <div>
            <strong style="color:#0b1c30; font-size:12px;">Resource ${r.code}</strong>
            <div style="font-size:10px; color:#64748b;">Remaining Cap: ${r.capacity} units</div>
          </div>
          <span style="font-size:10px; font-weight:700; padding:2px 8px; border-radius:10px; ${r.status === 'Active' ? 'background:#dcfce7; color:#16a34a;' : 'background:#fee2e2; color:#dc2626;'}">
            ● ${r.status}
          </span>
        </div>
      `).join('');
    }

    updateRateMatrix();
  } catch (err) {
    showMessage(err.message, true);
  }
}

// Load Requests Table & Queue
async function loadData() {
  clearMessages();
  await loadResources();
  try {
    const requests = await fetchAPI('/requests');
    cachedRequests = requests;

    // Ensure admin portal visibility state matches role
    if (adminPortal) {
      adminPortal.classList.toggle('hidden', currentUser.role !== 'Administrator');
    }

    renderRequests(requests);
    renderDockDoors();
  } catch (err) {
    showMessage(err.message, true);
  }
}
window.loadData = loadData;

if (refreshBtn) {
  refreshBtn.addEventListener('click', loadData);
}

// Queue Filtering
window.filterQueue = (status, el) => {
  currentFilter = status;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  if (el) el.classList.add('active');
  renderRequests(cachedRequests);
};

// Search Handlers
window.onSearchQueueInput = (val) => {
  currentSearchQuery = (val || '').toLowerCase().trim();
  renderRequests(cachedRequests);
};

window.onSearchGlobalInput = (val) => {
  currentSearchQuery = (val || '').toLowerCase().trim();
  renderRequests(cachedRequests);
};

window.focusSearch = () => {
  const s = document.getElementById('searchQueueInput') || document.getElementById('searchInput');
  if (s) s.focus();
};

window.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    window.focusSearch();
  }
});

// Toggle Queue View Mode (Cards vs Table)
window.setQueueViewMode = (mode) => {
  currentViewMode = mode;
  document.getElementById('viewModeCardsBtn').classList.toggle('active', mode === 'cards');
  document.getElementById('viewModeTableBtn').classList.toggle('active', mode === 'table');
  
  if (mode === 'cards') {
    queueCardsContainer.classList.remove('hidden');
    // Keep table in DOM for test assertions
    queueTableContainer.style.opacity = '0.9';
  } else {
    queueCardsContainer.classList.add('hidden');
    queueTableContainer.style.opacity = '1';
  }
};

// Render Requests in Table & Live Queue Cards
function renderRequests(requests) {
  const activeRequests = (requests || []).filter(r => r.status !== 'COMPLETED' && r.status !== 'CANCELLED');
  if (metricActiveQueue) metricActiveQueue.textContent = `${activeRequests.length} Tasks`;
  if (activeTasksCountPill) activeTasksCountPill.textContent = `${activeRequests.length} Active`;

  // Update Tab Counters
  const countAll = (requests || []).length;
  const countPending = (requests || []).filter(r => r.status === 'SUBMITTED').length;
  const countTransit = (requests || []).filter(r => r.status === 'APPROVED/ASSIGNED' || r.status === 'IN_PROGRESS').length;
  const countCompleted = (requests || []).filter(r => r.status === 'COMPLETED').length;
  const countCancelled = (requests || []).filter(r => r.status === 'CANCELLED').length;

  if (document.getElementById('countAll')) document.getElementById('countAll').textContent = countAll;
  if (document.getElementById('countPending')) document.getElementById('countPending').textContent = countPending;
  if (document.getElementById('countTransit')) document.getElementById('countTransit').textContent = countTransit;
  if (document.getElementById('countCompleted')) document.getElementById('countCompleted').textContent = countCompleted;
  if (document.getElementById('countCancelled')) document.getElementById('countCancelled').textContent = countCancelled;

  // Filter requests
  let filtered = requests || [];
  if (currentFilter !== 'all') {
    if (currentFilter === 'APPROVED/ASSIGNED') {
      filtered = filtered.filter(r => r.status === 'APPROVED/ASSIGNED' || r.status === 'IN_PROGRESS');
    } else {
      filtered = filtered.filter(r => r.status === currentFilter);
    }
  }

  if (currentSearchQuery) {
    filtered = filtered.filter(r => {
      const q = currentSearchQuery;
      return (`REQ-${r.id}`.toLowerCase().includes(q)) ||
             (`DSP-2025-${7700 + r.id}`.toLowerCase().includes(q)) ||
             ((r.name || '').toLowerCase().includes(q)) ||
             ((r.phone || '').toLowerCase().includes(q)) ||
             ((r.resourceCode || '').toLowerCase().includes(q)) ||
             ((r.description || '').toLowerCase().includes(q));
    });
  }

  // 1. Render Table (Strictly preserves structure and IDs for Playwright test suite)
  if (filtered.length === 0) {
    requestsTableBody.innerHTML = `<tr class="empty-row"><td colspan="7" style="text-align:center; padding:24px; color:#64748b; font-weight:500;">No dispatch requests found for this filter.</td></tr>`;
  } else {
    requestsTableBody.innerHTML = filtered.map(req => {
      let actionHTML = '';
      const badgeClass = (req.status || '').replace('/', '_');

      let dotColor = '#f59e0b';
      if (req.status === 'APPROVED/ASSIGNED') dotColor = '#2563eb';
      if (req.status === 'IN_PROGRESS') dotColor = '#6366f1';
      if (req.status === 'COMPLETED') dotColor = '#16a34a';
      if (req.status === 'CANCELLED') dotColor = '#dc2626';

      if (currentUser.role === 'User') {
        // User can ONLY cancel SUBMITTED requests (BR8 & BR9)
        if (req.status === 'SUBMITTED') {
          actionHTML = `<button type="button" class="cancel-btn" onclick="updateStatus(${req.id}, 'CANCELLED')">Cancel</button>`;
        } else {
          actionHTML = `<span style="color:#94a3b8; font-size:11px; font-weight:600;">Locked</span>`;
        }
      } else if (currentUser.role === 'Administrator') {
        const allowedTransitions = {
          'SUBMITTED': ['APPROVED/ASSIGNED'],
          'APPROVED/ASSIGNED': ['IN_PROGRESS'],
          'IN_PROGRESS': ['COMPLETED'],
          'COMPLETED': [],
          'CANCELLED': []
        };
        const nextValid = allowedTransitions[req.status] || [];

        if (nextValid.length > 0) {
          const options = nextValid.map(st => `<option value="${st}">${st}</option>`).join('');
          actionHTML = `
            <select id="status_sel_${req.id}" class="status-select">
              <option value="">--Select--</option>
              ${options}
            </select>
            <button type="button" class="update-btn" onclick="adminUpdateStatus(${req.id})">Update</button>
          `;
        } else {
          actionHTML = `<span style="color:#16a34a; font-size:11px; font-weight:700;">Finalized</span>`;
        }
      }

      const requesterText = req.name ? `${req.name}` : `User ${req.userId}`;

      return `
        <tr id="req-row-${req.id}" class="req-row">
          <td>
            <div class="req-id-box">
              <span class="status-dot-sm" style="background:${dotColor};"></span>
              <strong>REQ-${req.id}</strong>
            </div>
          </td>
          <td><span class="resource-pill">${req.resourceCode}</span></td>
          <td>
            <div style="font-weight:600;">${requesterText}</div>
            <div style="font-size:10px; color:#64748b;">${req.phone || '9876543210'}</div>
          </td>
          <td>Rs. ${req.baseValue}</td>
          <td><strong style="color:#2563eb;">Rs. ${req.charge}</strong></td>
          <td><span class="status-badge status-${badgeClass}">${req.status}</span></td>
          <td>${actionHTML}</td>
        </tr>
      `;
    }).join('');
  }

  // 2. Render Rich Cards (Matching Screenshot 1)
  if (filtered.length === 0) {
    queueCardsContainer.innerHTML = `<div style="text-align:center; padding:30px; color:#64748b; font-size:12px;">No active dispatch requests matching query.</div>`;
  } else {
    queueCardsContainer.innerHTML = filtered.map(req => {
      const dspToken = `DSP-2025-${7700 + req.id}`;
      const pallets = 6 + (req.id * 2);
      
      let priorityText = 'Expedited';
      let priorityBg = '#eff6ff';
      let priorityColor = '#2563eb';
      if (req.id % 3 === 0) {
        priorityText = 'CRITICAL';
        priorityBg = '#fef2f2';
        priorityColor = '#dc2626';
      } else if (req.id % 4 === 0) {
        priorityText = 'Standard';
        priorityBg = '#f8fafc';
        priorityColor = '#64748b';
      }

      let stateText = req.status;
      let stateBg = '#eff6ff';
      let stateColor = '#2563eb';
      let etaText = 'ETA: 14m';
      let dotColor = '#2563eb';

      if (req.status === 'SUBMITTED') {
        stateText = 'Pending Dock Door';
        stateBg = '#fffbeb';
        stateColor = '#d97706';
        etaText = 'Wait: 4m';
        dotColor = '#d97706';
      } else if (req.status === 'IN_PROGRESS') {
        stateText = 'In Transit';
        stateBg = '#f5f3ff';
        stateColor = '#7c3aed';
        etaText = 'ETA: 18m';
        dotColor = '#7c3aed';
      } else if (req.status === 'COMPLETED') {
        stateText = 'Dispatched / Delivered';
        stateBg = '#f0fdf4';
        stateColor = '#16a34a';
        etaText = 'Turnaround: 18m';
        dotColor = '#16a34a';
      } else if (req.status === 'CANCELLED') {
        stateText = 'Cancelled / Void';
        stateBg = '#fef2f2';
        stateColor = '#dc2626';
        etaText = 'Archived';
        dotColor = '#dc2626';
      }

      const tractorNum = `#${800 + (req.id * 9)}`;
      const driverName = ['M. Vance', 'K. Chen', 'D. Ramos', 'S. Al-Mansoor'][req.id % 4];

      // Card action buttons
      let cardActions = '';
      if (currentUser.role === 'User' && req.status === 'SUBMITTED') {
        cardActions = `<button type="button" class="card-action-btn" style="color:#dc2626; border-color:#fca5a5;" onclick="updateStatus(${req.id}, 'CANCELLED')">Cancel Request</button>`;
      } else if (currentUser.role === 'Administrator' && req.status === 'SUBMITTED') {
        cardActions = `<button type="button" class="card-action-btn" style="color:#2563eb; font-weight:700;" onclick="updateStatus(${req.id}, 'APPROVED/ASSIGNED')">Assign Bay Door</button>`;
      } else if (currentUser.role === 'Administrator' && req.status === 'APPROVED/ASSIGNED') {
        cardActions = `<button type="button" class="card-action-btn" style="color:#7c3aed; font-weight:700;" onclick="updateStatus(${req.id}, 'IN_PROGRESS')">Depart Gate</button>`;
      } else if (currentUser.role === 'Administrator' && req.status === 'IN_PROGRESS') {
        cardActions = `<button type="button" class="card-action-btn" style="color:#16a34a; font-weight:700;" onclick="updateStatus(${req.id}, 'COMPLETED')">Confirm POD</button>`;
      }

      return `
        <div class="dispatch-card">
          <div class="dispatch-card-header">
            <div class="dispatch-card-token-box">
              <span class="status-dot-sm" style="background:${dotColor};"></span>
              <span class="dispatch-card-token">${dspToken}</span>
              <span style="font-size:11px; background:#f1f5f9; color:#475569; padding:2px 8px; border-radius:12px; font-weight:600;">${pallets} Pallets</span>
              <span style="font-size:11px; background:${priorityBg}; color:${priorityColor}; padding:2px 8px; border-radius:12px; font-weight:700;">${priorityText}</span>
              <span style="font-size:11px; background:${stateBg}; color:${stateColor}; padding:2px 8px; border-radius:12px; font-weight:700;">${stateText}</span>
            </div>
            <div style="font-size:11px; color:#64748b; font-weight:600;">${etaText}</div>
          </div>

          <div class="dispatch-card-body">
            <div class="card-detail-item">
              <span class="card-detail-label">Origin Zone</span>
              <span class="card-detail-val">${req.resourceCode} [Bay Staging]</span>
            </div>
            <div class="card-detail-item">
              <span class="card-detail-label">Destination Hub</span>
              <span class="card-detail-val">Regional Yard West 1</span>
            </div>
            <div class="card-detail-item">
              <span class="card-detail-label">Carrier / Unit</span>
              <span class="card-detail-val">Tractor ${tractorNum} (${driverName})</span>
            </div>
          </div>

          <div class="dispatch-card-footer">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="color:#16a34a; font-weight:600;">● Cold Chain: 4.2°C [OK]</span>
              <span style="color:#94a3b8;">• Locked 11m ago</span>
            </div>
            <div style="display:flex; gap:8px; align-items:center;">
              <button type="button" class="card-action-btn" onclick="openTelemetryModal(${req.id})">
                <span class="material-symbols-outlined" style="font-size:13px;">telemetry</span> Telemetry
              </button>
              <button type="button" class="card-action-btn" onclick="openManifestModal(${req.id})">
                <span class="material-symbols-outlined" style="font-size:13px;">fact_check</span> Manifest
              </button>
              ${cardActions}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }
}

// Form Submission
createRequestForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearMessages();

  const resourceId = parseInt(resourceSelect.value, 10);
  const baseValue = parseFloat(baseValueInput.value);
  const name = nameInput.value.trim();
  const phone = phoneInput.value.trim();
  const description = descriptionInput.value.trim();

  // Client Validations (BR5)
  if (!name) {
    showMessage("Name cannot be blank.", true);
    return;
  }
  if (!/^\d{10}$/.test(phone)) {
    showMessage("Phone must contain exactly 10 digits.", true);
    return;
  }
  if (!description) {
    showMessage("Description cannot be blank.", true);
    return;
  }
  if (isNaN(baseValue) || baseValue < 0) {
    showMessage("Base value must be a non-negative number.", true);
    return;
  }

  const payloadKey = `${currentUser.id}-${resourceId}-${baseValue}-${name}-${phone}`;
  const now = Date.now();

  // Duplicate Check (T1): only block if there is already an existing active request with this payload in SUBMITTED state
  const isPendingDuplicate = (cachedRequests || []).some(r => 
    r.userId === currentUser.id && 
    r.resourceId === resourceId && 
    Number(r.baseValue) === Number(baseValue) && 
    r.name === name && 
    r.status === 'SUBMITTED'
  );

  if (lastSubmittedPayload === payloadKey && isPendingDuplicate && (now - lastSubmittedTime < 30000)) {
    showMessage("Duplicate request already submitted.", true);
    return;
  }

  submitRequestBtn.disabled = true;

  try {
    await fetchAPI('/requests', {
      method: 'POST',
      body: JSON.stringify({ resourceId, baseValue, name, phone, description })
    });
    lastSubmittedPayload = payloadKey;
    lastSubmittedTime = now;

    showMessage("Request submitted successfully!");
    window.generateToken();
    loadData();
  } catch (err) {
    showMessage(err.message, true);
  } finally {
    submitRequestBtn.disabled = false;
  }
});

// Form Reset
window.resetForm = () => {
  nameInput.value = 'John Doe';
  phoneInput.value = '9876543210';
  descriptionInput.value = 'Electronics & High-Value';
  baseValueInput.value = '500';
  palletCountInput.value = '8';
  updateRateMatrix();
  window.generateToken();
  clearMessages();
};

// Status Update function
window.updateStatus = async (id, status) => {
  clearMessages();
  try {
    await fetchAPI(`/requests/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
    // Once cancelled or approved by admin, clear duplicate tracker so that submit works immediately
    lastSubmittedPayload = null;
    lastSubmittedTime = 0;
    showMessage(`Request updated to ${status}`);
    loadData();
  } catch (err) {
    showMessage(err.message, true);
  }
};

window.adminUpdateStatus = (id) => {
  const sel = document.getElementById(`status_sel_${id}`);
  if (sel && sel.value) {
    window.updateStatus(id, sel.value);
  } else {
    showMessage("Please select a valid next status.", true);
  }
};

// Live Stream Simulation Engine
window.toggleStreamLive = () => {
  isStreaming = !isStreaming;
  const btn = document.getElementById('streamLiveBtn');
  const txt = document.getElementById('streamLiveText');
  const dot = document.getElementById('livePulseDot');
  
  if (btn) btn.classList.toggle('stream-live-active', isStreaming);
  if (txt) txt.textContent = isStreaming ? 'Stream Live' : 'Stream Paused';
  if (dot) dot.style.background = isStreaming ? '#16a34a' : '#94a3b8';

  showMessage(`Central Telemetry Stream: ${isStreaming ? 'Active (real-time telemetry live)' : 'Paused'}`);
};

// Simulate sync button click
window.simulateSyncClick = () => {
  const icon = document.getElementById('syncIcon');
  if (icon) {
    icon.style.transition = 'transform 0.6s ease';
    icon.style.transform = 'rotate(360deg)';
    setTimeout(() => { icon.style.transform = 'none'; }, 600);
  }
  loadData();
  showMessage("Central Telemetry Sync: Yard staging, bay doors, and trailer telemetry synchronized.");
};

// Stream jitter interval (telemetry simulation)
setInterval(() => {
  if (!isStreaming) return;

  // Latency jitter (28ms - 36ms)
  const jitter = 28 + Math.floor(Math.random() * 9);
  if (metricLatency) {
    metricLatency.textContent = `● ${jitter} ms`;
  }

  // Capacity jitter subtle drift
  const drift = (73.8 + Math.random() * 0.8).toFixed(1);
  const yardCap = document.getElementById('yardCapacityPercent');
  const yardFill = document.getElementById('yardCapacityFill');
  if (yardCap) yardCap.textContent = `${drift}%`;
  if (yardFill) yardFill.style.width = `${drift}%`;

  // Blinking mini bays
  const b11 = document.getElementById('miniBay11');
  if (b11) b11.style.color = Math.random() > 0.3 ? '#38bdf8' : '#7dd3fc';
}, 3000);

// Dock Doors Rendering & Inspection
function renderDockDoors() {
  const grid = document.getElementById('dockDoorsGrid');
  const fullGrid = document.getElementById('fullDockDoorsGrid');

  const occupiedCount = dockDoors.filter(d => d.status === 'occupied').length;
  const stagingCount = dockDoors.filter(d => d.status === 'staging').length;
  const availCount = dockDoors.filter(d => d.status === 'available').length;

  if (document.getElementById('countBayOccupied')) document.getElementById('countBayOccupied').textContent = occupiedCount;
  if (document.getElementById('countBayStaging')) document.getElementById('countBayStaging').textContent = stagingCount;
  if (document.getElementById('countBayAvailable')) document.getElementById('countBayAvailable').textContent = availCount;

  const html = dockDoors.map(door => {
    let statusClass = 'door-occupied';
    let label = `${door.trailer} • ${door.carrier.split(' ')[0]}`;
    if (door.status === 'staging') {
      statusClass = 'door-staging';
      label = `${door.trailer} • Staging`;
    } else if (door.status === 'available') {
      statusClass = 'door-available';
      label = `● Ready Gate Lock`;
    } else if (door.status === 'maint') {
      statusClass = 'door-maint';
      label = `Maint (14:30)`;
    }

    return `
      <div class="dock-door-cell" style="cursor:pointer;" onclick="openBayInspection(${door.id})" title="Click to inspect ${door.name}">
        <span class="door-name">${door.name}</span>
        <span class="door-status ${statusClass}">${label}</span>
      </div>
    `;
  }).join('');

  if (grid) grid.innerHTML = html;
  if (fullGrid) fullGrid.innerHTML = html;
}

window.filterBays = (status) => {
  showMessage(`Filtering Bay Doors by: ${status.toUpperCase()}`);
};

window.openBayInspection = (id) => {
  const door = dockDoors.find(d => d.id === id);
  if (!door) return;

  const title = document.getElementById('bayInspectTitle');
  const content = document.getElementById('bayInspectContent');
  if (title) title.textContent = `Inspection: ${door.name}`;

  if (content) {
    content.innerHTML = `
      <div style="display:flex; justify-content:space-between; margin-bottom:14px; font-size:12px;">
        <span>Assigned Unit: <strong style="color:#2563eb;">${door.trailer}</strong></span>
        <span>Carrier: <strong>${door.carrier}</strong></span>
        <span>Temp: <strong>${door.temp}</strong></span>
      </div>
      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px; font-size:11px; margin-bottom:14px;">
        <div>Security Seal RFID: <strong>${door.seal}</strong></div>
        <div>Staged Pallet Volume: <strong>${door.pallets} Pallets</strong></div>
        <div>Gate Status: <strong style="color:#16a34a;">Cleared Sec-Ops 402</strong></div>
      </div>
      <div style="display:flex; justify-content:space-between; gap:8px;">
        <button type="button" class="btn-secondary" style="flex:1;" onclick="toggleBayDoorState(${door.id})">Toggle Bay State</button>
        <button type="button" class="btn-primary" style="flex:1;" onclick="closeBayInspectModal()">Acknowledge</button>
      </div>
    `;
  }

  const modal = document.getElementById('bayInspectModal');
  if (modal) modal.classList.remove('hidden');
};

window.closeBayInspectModal = () => {
  const modal = document.getElementById('bayInspectModal');
  if (modal) modal.classList.add('hidden');
};

window.toggleBayDoorState = (id) => {
  const door = dockDoors.find(d => d.id === id);
  if (door) {
    if (door.status === 'occupied') door.status = 'staging';
    else if (door.status === 'staging') door.status = 'available';
    else if (door.status === 'available') door.status = 'occupied';
    renderDockDoors();
    window.openBayInspection(id);
    showMessage(`Bay Door ${id} state updated to: ${door.status.toUpperCase()}`);
  }
};

// Subview Switching
window.switchNavTab = (tab) => {
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  const activeBtn = document.getElementById(`nav-${tab}`);
  if (activeBtn) activeBtn.classList.add('active');

  // Hide all subviews
  document.getElementById('view-console').classList.add('hidden');
  document.getElementById('view-docks').classList.add('hidden');
  document.getElementById('view-fleet').classList.add('hidden');
  document.getElementById('view-manifests').classList.add('hidden');
  document.getElementById('view-exceptions').classList.add('hidden');
  document.getElementById('view-kpis').classList.add('hidden');

  if (tab === 'console') {
    document.getElementById('view-console').classList.remove('hidden');
  } else if (tab === 'docks') {
    document.getElementById('view-docks').classList.remove('hidden');
    renderDockDoors();
  } else if (tab === 'fleet') {
    document.getElementById('view-fleet').classList.remove('hidden');
    renderFleetView();
  } else if (tab === 'manifests') {
    document.getElementById('view-manifests').classList.remove('hidden');
    renderManifestsView();
  } else if (tab === 'exceptions') {
    document.getElementById('view-exceptions').classList.remove('hidden');
    renderExceptionsView();
  } else if (tab === 'kpis') {
    document.getElementById('view-kpis').classList.remove('hidden');
    drawKPIChart();
  }
};
window.switchTab = window.switchNavTab;

// Subview: Fleet
function renderFleetView() {
  const container = document.getElementById('fleetGridContainer');
  if (!container) return;

  container.innerHTML = fleetTractors.map(truck => `
    <div class="fleet-card">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <strong style="color:#2563eb; font-size:14px;">${truck.id}</strong>
        <span style="font-size:10px; background:#eff6ff; color:#2563eb; font-weight:700; padding:2px 8px; border-radius:10px;">${truck.status}</span>
      </div>
      <div style="font-size:12px; color:#475569;">Driver: <strong>${truck.driver}</strong></div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; font-size:11px; background:#ffffff; padding:8px; border-radius:6px; border:1px solid #e2e8f0;">
        <div>Speed: <strong>${truck.speed}</strong></div>
        <div>Fuel: <strong>${truck.fuel}</strong></div>
        <div>Cold Temp: <strong style="color:#16a34a;">${truck.temp}</strong></div>
        <div>GPS: <strong>${truck.lat}</strong></div>
      </div>
      <div style="font-size:11px; color:#64748b;">Destination: <strong>${truck.dest}</strong></div>
      <button type="button" class="btn-secondary" style="font-size:11px; padding:4px;" onclick="openTelemetryModal(1)">
        View Live Sensor Telemetry
      </button>
    </div>
  `).join('');
}

// Subview: Manifests
function renderManifestsView() {
  const container = document.getElementById('manifestsListContainer');
  if (!container) return;

  container.innerHTML = `
    <div class="table-responsive">
      <table class="enterprise-table">
        <thead>
          <tr>
            <th>Manifest ID</th>
            <th>e-BOL Reference</th>
            <th>Carrier</th>
            <th>Consignee Hub</th>
            <th>Hazmat Class</th>
            <th>Pallet Total</th>
            <th>Sec-Ops Seal</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>MNF-2025-991</strong></td>
            <td>BOL-FL-88192-A</td>
            <td>Swift Logistics</td>
            <td>Regional Yard West 1</td>
            <td>Class 3 Flammable</td>
            <td>14 Pallets</td>
            <td><span style="color:#16a34a; font-weight:700;">● Verified RFID</span></td>
            <td><button type="button" class="btn-secondary" style="font-size:11px; padding:4px 8px;" onclick="openManifestModal(1)">Inspect</button></td>
          </tr>
          <tr>
            <td><strong>MNF-2025-992</strong></td>
            <td>BOL-FL-88193-B</td>
            <td>Penske Intermodal</td>
            <td>Outbound Bay 19</td>
            <td>Non-Hazmat</td>
            <td>8 Pallets</td>
            <td><span style="color:#16a34a; font-weight:700;">● Verified RFID</span></td>
            <td><button type="button" class="btn-secondary" style="font-size:11px; padding:4px 8px;" onclick="openManifestModal(2)">Inspect</button></td>
          </tr>
          <tr>
            <td><strong>MNF-2025-993</strong></td>
            <td>BOL-FL-88194-C</td>
            <td>Cold Rx Pharma</td>
            <td>Zone C Cold Vault 1</td>
            <td>Cold Chain Bio</td>
            <td>6 Pallets</td>
            <td><span style="color:#16a34a; font-weight:700;">● Verified RFID</span></td>
            <td><button type="button" class="btn-secondary" style="font-size:11px; padding:4px 8px;" onclick="openManifestModal(3)">Inspect</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
}

// Subview: Exceptions
function renderExceptionsView() {
  const container = document.getElementById('exceptionsListContainer');
  if (!container) return;

  container.innerHTML = yardAlerts.map(alert => `
    <div class="alert-card-item ${alert.level}">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <strong style="font-size:13px; color:#1e293b;">${alert.title}</strong>
        <span style="font-size:10px; color:#64748b;">${alert.time}</span>
      </div>
      <div style="font-size:12px; color:#475569;">${alert.desc}</div>
      <div style="margin-top:6px; display:flex; justify-content:flex-end; gap:8px;">
        <button type="button" class="btn-secondary" style="font-size:11px; padding:3px 10px;" onclick="resolveException(${alert.id})">Acknowledge</button>
        <button type="button" class="btn-primary" style="font-size:11px; padding:3px 10px;" onclick="resolveException(${alert.id})">Clear Override</button>
      </div>
    </div>
  `).join('');
}

window.resolveException = (id) => {
  yardAlerts = yardAlerts.filter(a => a.id !== id);
  renderExceptionsView();
  renderAlertsDrawer();
  const badge = document.getElementById('sidebarExceptionsBadge');
  const notif = document.getElementById('notifBadge');
  if (badge) badge.textContent = yardAlerts.length;
  if (notif) notif.textContent = yardAlerts.length;
  showMessage(`Exception #${id} resolved under Sec-Ops Protocol 402 clearance.`);
};

window.resolveAllExceptions = () => {
  yardAlerts = [];
  renderExceptionsView();
  renderAlertsDrawer();
  const badge = document.getElementById('sidebarExceptionsBadge');
  const notif = document.getElementById('notifBadge');
  if (badge) badge.textContent = '0';
  if (notif) notif.textContent = '0';
  showMessage("All active yard exceptions cleared.");
};

// Subview: KPI Canvas Chart
function drawKPIChart() {
  const canvas = document.getElementById('kpiCanvas');
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00'];
  const dispatches = [42, 68, 85, 112, 134, 148, 126];
  const max = 160;

  // Draw Grid
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  for (let y = 30; y < 180; y += 40) {
    ctx.beginPath();
    ctx.moveTo(50, y);
    ctx.lineTo(760, y);
    ctx.stroke();
  }

  // Draw Bars
  const barWidth = 40;
  dispatches.forEach((val, i) => {
    const x = 80 + i * 95;
    const barHeight = (val / max) * 120;
    const y = 170 - barHeight;

    // Gradient bar
    const grad = ctx.createLinearGradient(0, y, 0, 170);
    grad.addColorStop(0, '#2563eb');
    grad.addColorStop(1, '#93c5fd');
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, barWidth, barHeight);

    // Label
    ctx.fillStyle = '#64748b';
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(hours[i], x + barWidth / 2, 190);
    ctx.fillText(`${val}`, x + barWidth / 2, y - 6);
  });
}

// Operational Alerts Drawer
window.toggleAlertsDrawer = () => {
  const overlay = document.getElementById('alertsDrawerOverlay');
  if (overlay) {
    overlay.classList.toggle('hidden');
    if (!overlay.classList.contains('hidden')) {
      renderAlertsDrawer();
    }
  }
};

function renderAlertsDrawer() {
  const body = document.getElementById('alertsListBody');
  if (!body) return;

  if (yardAlerts.length === 0) {
    body.innerHTML = `<div style="text-align:center; padding:40px; color:#64748b; font-size:12px;">No active alerts. All systems nominal.</div>`;
    return;
  }

  body.innerHTML = yardAlerts.map(alert => `
    <div class="alert-card-item ${alert.level}">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <strong style="font-size:12px; color:#1e293b;">${alert.title}</strong>
        <span style="font-size:10px; color:#64748b;">${alert.time}</span>
      </div>
      <div style="font-size:11px; color:#475569; margin:4px 0;">${alert.desc}</div>
      <div style="display:flex; justify-content:flex-end;">
        <button type="button" class="btn-secondary" style="font-size:10px; padding:3px 8px;" onclick="resolveException(${alert.id})">Acknowledge</button>
      </div>
    </div>
  `).join('');
}

// Live Telemetry Modal Chart
window.openTelemetryModal = (reqId) => {
  const modal = document.getElementById('telemetryModal');
  if (modal) modal.classList.remove('hidden');

  const canvas = document.getElementById('telemetryCanvas');
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background Grid
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1;
  for (let y = 20; y < 160; y += 30) {
    ctx.beginPath();
    ctx.moveTo(30, y);
    ctx.lineTo(580, y);
    ctx.stroke();
  }

  // Draw Safe Zone (2°C - 8°C)
  ctx.fillStyle = 'rgba(37, 99, 235, 0.08)';
  ctx.fillRect(30, 40, 550, 70);

  // Draw Sine Curve Temperature Line
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  for (let x = 30; x <= 580; x += 10) {
    const tempY = 75 + Math.sin(x * 0.04) * 18 + (Math.random() * 2 - 1);
    if (x === 30) ctx.moveTo(x, tempY);
    else ctx.lineTo(x, tempY);
  }
  ctx.stroke();

  // Draw Current Point
  ctx.fillStyle = '#4ade80';
  ctx.beginPath();
  ctx.arc(580, 80, 5, 0, Math.PI * 2);
  ctx.fill();
};

window.closeTelemetryModal = () => {
  const modal = document.getElementById('telemetryModal');
  if (modal) modal.classList.add('hidden');
};

// Manifest Modal
window.openManifestModal = (reqId) => {
  const modal = document.getElementById('manifestModal');
  const content = document.getElementById('manifestModalContent');
  if (modal) modal.classList.remove('hidden');

  if (content) {
    content.innerHTML = `
      <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px; padding:16px; font-size:12px;">
        <div style="display:flex; justify-content:space-between; margin-bottom:12px; border-bottom:1px solid #e2e8f0; padding-bottom:8px;">
          <div>
            <strong>ELECTRONIC BILL OF LADING</strong>
            <div style="font-size:10px; color:#64748b;">REF: BOL-FL-2025-00${reqId || 1}</div>
          </div>
          <div style="font-family:'JetBrains Mono',monospace; font-size:10px; color:#2563eb;">
            SHA-256: 7f83b1657ff1...
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:12px;">
          <div>Origin: <strong>Terminal DC-04 (North Bay)</strong></div>
          <div>Destination: <strong>Regional Yard West 1</strong></div>
          <div>Carrier: <strong>Swift Intermodal Fleet</strong></div>
          <div>Consignee: <strong>Central Distribution Hub</strong></div>
        </div>

        <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:6px; padding:10px; margin-bottom:12px;">
          <div style="font-weight:700; margin-bottom:4px;">Itemized Manifest Lines:</div>
          <div style="font-size:11px; color:#475569;">• 8x Euro-Pallets: High-Density Solid-State Memory Modules</div>
          <div style="font-size:11px; color:#475569;">• Hazmat UN1993 Class 3 Packaging Certified</div>
          <div style="font-size:11px; color:#475569;">• Temperature Data Logger Serial: #LOG-88194-OK</div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="color:#16a34a; font-weight:700;">● Cryptographically Signed & Sealed</span>
          <button type="button" class="btn-primary" onclick="closeManifestModal()">Close</button>
        </div>
      </div>
    `;
  }
};

window.closeManifestModal = () => {
  const modal = document.getElementById('manifestModal');
  if (modal) modal.classList.add('hidden');
};

// System Config Modal
window.openSystemConfigModal = () => {
  const modal = document.getElementById('configModal');
  if (modal) modal.classList.remove('hidden');
};

window.closeSystemConfigModal = () => {
  const modal = document.getElementById('configModal');
  if (modal) modal.classList.add('hidden');
};

window.saveSystemConfig = () => {
  const threshold = document.getElementById('configTariffThreshold')?.value || 1000;
  showMessage(`Configuration saved: Tariff exemption threshold set to Rs. ${threshold}`);
  window.closeSystemConfigModal();
};

// Executive Terminal Auth Modal (Screenshot 2)
window.toggleAuthModal = () => {
  const modal = document.getElementById('authModal');
  if (modal) modal.classList.toggle('hidden');
};

let modalRole = 'User';
window.setModalRole = (role) => {
  modalRole = role;
  document.getElementById('modalOperatorTab').classList.toggle('btn-primary', role === 'User');
  document.getElementById('modalOperatorTab').classList.toggle('btn-secondary', role !== 'User');
  document.getElementById('modalAdminTab').classList.toggle('btn-primary', role === 'Administrator');
  document.getElementById('modalAdminTab').classList.toggle('btn-secondary', role !== 'Administrator');

  const emailInput = document.getElementById('modalUserEmail');
  const roleBadge = document.getElementById('modalRoleBadge');
  if (emailInput) {
    emailInput.value = role === 'User' ? 'sterling.v@logistics.corp' : 'kallstrom.j@logistics.corp';
  }
  if (roleBadge) {
    roleBadge.textContent = role === 'User' ? 'OP-TIER 2' : 'ADM-TIER 4';
  }
};

window.togglePasswordVisibility = () => {
  const pass = document.getElementById('modalPasscode');
  const eye = document.getElementById('passcodeEyeIcon');
  if (pass) {
    const isPass = pass.type === 'password';
    pass.type = isPass ? 'text' : 'password';
    if (eye) eye.textContent = isPass ? 'visibility_off' : 'visibility';
  }
};

window.simulateFidoHardwareKey = () => {
  const modal = document.getElementById('fidoModal');
  const status = document.getElementById('fidoStatus');
  if (modal) modal.classList.remove('hidden');
  if (status) {
    status.textContent = 'Touch your physical security key...';
    setTimeout(() => {
      status.textContent = 'Key verified! Authentication successful.';
      status.style.color = '#16a34a';
      setTimeout(() => {
        window.closeFidoModal();
        window.authenticateFromModal();
      }, 900);
    }, 1200);
  }
};

window.closeFidoModal = () => {
  const modal = document.getElementById('fidoModal');
  if (modal) modal.classList.add('hidden');
};

window.simulateFederatedLogin = (provider) => {
  showMessage(`Enterprise Federated SSO (${provider}): Clearance granted.`);
  window.authenticateFromModal();
};

window.forgotCredentialsAlert = () => {
  showMessage("Credentials Help: Contact Central Sec-Ops at extension 4022 for token reset.");
};

window.authenticateFromModal = () => {
  if (modalRole === 'Administrator') {
    window.selectPersona(3);
  } else {
    window.selectPersona(1);
  }
  window.toggleAuthModal();
  showMessage(`Terminal Clearance Granted: Welcome, ${currentUser.name}!`);
};

// Initialize on Load
loadData();
window.generateToken();
updateRateMatrix();
