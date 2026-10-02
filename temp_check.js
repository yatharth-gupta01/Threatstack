
// ─────────────────────────────────────────────
// LIVE CLOCK
// ─────────────────────────────────────────────
function updateClock() {
  const now = new Date();
  const pad = n => String(n).padStart(2,'0');
  const el = document.getElementById('live-utc');
  if (el) el.textContent = `${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}:${pad(now.getUTCSeconds())}`;
}
setInterval(updateClock, 1000);
updateClock();

// ─────────────────────────────────────────────
// ACCORDION
// ─────────────────────────────────────────────
let _openCard = null;
function toggleCard(id) {
  const card = document.getElementById(id);
  const body = document.getElementById(id + '-body');
  if (!card || !body) return;
  const isOpen = card.classList.contains('open');
  if (_openCard && _openCard !== id) {
    const pc = document.getElementById(_openCard);
    const pb = document.getElementById(_openCard + '-body');
    if (pc && pb) { pc.classList.remove('open'); pb.classList.remove('open'); }
    _openCard = null;
  }
  if (isOpen) {
    card.classList.remove('open'); body.classList.remove('open'); _openCard = null;
  } else {
    card.classList.add('open'); body.classList.add('open'); _openCard = id;
  }
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
function fmtNum(n) { return Number(n).toLocaleString(); }

function escHtml(s) {
  return String(s ?? '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.max(0, Math.floor(diff / 60000));
  if (mins < 60)  return `${mins} min ago`;
  const h = Math.floor(mins / 60);
  if (h  < 24)   return `${h}h ${mins % 60}m ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// Severity colour tokens
const SEV = {
  High:   { dot: 'bg-[#E5484D] shadow-[0_0_8px_#E5484D]', badge: 'bg-[#E5484D]/15 text-[#E5484D] border border-[#E5484D]/30', alert: 'text-[#E5484D]' },
  Medium: { dot: 'bg-[#F5A623] shadow-[0_0_8px_#F5A623]', badge: 'bg-[#F5A623]/15 text-[#F5A623] border border-[#F5A623]/30', alert: 'text-[#F5A623]' },
  Low:    { dot: 'bg-[#3DD68C] shadow-[0_0_8px_#3DD68C]', badge: 'bg-[#3DD68C]/15 text-[#3DD68C] border border-[#3DD68C]/30', alert: 'text-[#3DD68C]' }
};

// ─────────────────────────────────────────────
// RENDER: single incident card
// ─────────────────────────────────────────────
function renderCard(inc) {
  const s   = SEV[inc.severity] || SEV.Low;
  const cid = 'card-' + escHtml(inc.incident_id);
  const rows = (inc.raw_alerts || []).map(a => `
    <div class="raw-alert-row">
      <span class="text-[#8B949E] w-28 flex-shrink-0">${escHtml(a.timestamp)}</span>
      <span class="${s.alert} font-medium">${escHtml(a.alert_type)}</span>
      <span class="text-[#C9D1D9]">${escHtml(a.description)}</span>
    </div>`).join('');

  return `
  <div id="${cid}" class="incident-card bg-[#161B22] border border-[#21262D] rounded-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)] transition-all duration-200 overflow-hidden ${inc._isNew ? 'new-incident' : ''}" onclick="toggleCard('${cid}')">
    <div class="flex items-start justify-between gap-3 p-4 cursor-pointer select-none">
      <div class="flex items-center space-x-3 min-w-0">
        <span class="w-2.5 h-2.5 rounded-full ${s.dot} flex-shrink-0"></span>
        <span class="font-headline-sm text-headline-sm font-semibold text-white tracking-tight truncate">${escHtml(inc.title)}</span>
      </div>
      <div class="flex items-center gap-2 flex-shrink-0">
        <span class="${s.badge} font-label-md text-label-md px-2.5 py-0.5 rounded-full uppercase">${escHtml(inc.mitre_id)}</span>
        <svg class="chevron w-4 h-4 text-[#8B949E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
        </svg>
      </div>
    </div>
    <div class="px-4 pb-3 -mt-1 flex flex-wrap items-center gap-x-2 text-[#8B949E] font-body-sm text-body-sm">
      <span>Asset: <code class="font-label-sm text-label-sm bg-[#0E1117] text-[#C9D1D9] px-1.5 py-0.5 rounded border border-[#30363D]">${escHtml(inc.asset)}</code></span>
      <span>·</span><span class="text-white font-medium">${fmtNum(inc.alert_count)} alerts grouped</span>
      <span>·</span><span>${timeAgo(inc.timestamp)}</span>
    </div>
    <div class="incident-body" id="${cid}-body">
      <div class="mx-4 mb-4 mt-1 border-t border-[#21262D] pt-4 flex flex-col gap-4">
        <div>
          <div class="flex items-center gap-2 mb-2">
            <span class="material-symbols-outlined text-[14px] text-[#4D9EFF]">auto_awesome</span>
            <span class="font-label-md text-label-md text-[#4D9EFF] tracking-widest uppercase">AI Summary</span>
          </div>
          <p class="font-body-sm text-body-sm text-[#C9D1D9] leading-relaxed">${escHtml(inc.ai_summary)}</p>
        </div>
        <div>
          <span class="font-label-md text-label-md text-[#8B949E] tracking-widest uppercase">Grouped Raw Alerts</span>
          <div class="mt-2 bg-[#0D1117] rounded-lg border border-[#21262D] px-3 py-1 font-label-sm text-label-sm">${rows}</div>
        </div>
        <p class="font-body-sm text-body-sm">
          <span class="text-[#4D9EFF] font-semibold">Recommended Action:</span>
          <span class="text-[#C9D1D9]"> ${escHtml(inc.recommended_action)}</span>
        </p>
      </div>
    </div>
  </div>`;
}

// ─────────────────────────────────────────────
// RENDER: bar chart
// ─────────────────────────────────────────────
function renderBarChart(totalAlerts, totalIncidents) {
  const pct = totalAlerts > 0
    ? ((1 - totalIncidents / totalAlerts) * 100).toFixed(1)
    : '0.0';
  const incH = totalAlerts > 0
    ? Math.max(5, (totalIncidents / totalAlerts) * 95).toFixed(1)
    : 5;

  document.getElementById('bar-badge').textContent    = `-${pct}%`;
  document.getElementById('bar-raw-val').textContent  = fmtNum(totalAlerts);
  document.getElementById('bar-inc-val').textContent  = fmtNum(totalIncidents);
  document.getElementById('bar-raw-lbl').textContent  = fmtNum(totalAlerts);
  document.getElementById('bar-inc-lbl').textContent  = `${totalIncidents} Triaged`;

  // Animate bars on next paint
  requestAnimationFrame(() => setTimeout(() => {
    document.getElementById('bar-raw').style.height = '95%';
    document.getElementById('bar-inc').style.height = `${incH}%`;
  }, 80));
}

// ─────────────────────────────────────────────
// RENDER: donut chart
// ─────────────────────────────────────────────
function renderDonut(highN, medN, lowN) {
  const total = highN + medN + lowN;
  const C = 2 * Math.PI * 38; // circumference ≈ 238.76
  const GAP = 2;

  document.getElementById('donut-center').textContent = total;

  function seg(id, count, offset) {
    const arc = total > 0 ? (count / total) * C : 0;
    const el  = document.getElementById(id);
    el.setAttribute('stroke-dasharray',  `${arc.toFixed(2)} ${(C - arc).toFixed(2)}`);
    el.setAttribute('stroke-dashoffset', offset.toFixed(2));
  }

  const highArc = total > 0 ? (highN / total) * C : 0;
  const medArc  = total > 0 ? (medN  / total) * C : 0;

  setTimeout(() => {
    seg('donut-high', highN, 0);
    seg('donut-med',  medN,  -(highArc + GAP));
    seg('donut-low',  lowN,  -(highArc + medArc + GAP * 2));
  }, 150);

  function pct(n) { return total > 0 ? `(${Math.round(n / total * 100)}%)` : '(0%)'; }
  document.getElementById('leg-high-n').textContent = highN;
  document.getElementById('leg-high-p').textContent = pct(highN);
  document.getElementById('leg-med-n').textContent  = medN;
  document.getElementById('leg-med-p').textContent  = pct(medN);
  document.getElementById('leg-low-n').textContent  = lowN;
  document.getElementById('leg-low-p').textContent  = pct(lowN);
}

// ─────────────────────────────────────────────
// RENDER: full dashboard from incidents array
// ─────────────────────────────────────────────
function renderDashboard(incidents) {
  document.getElementById('state-loading').style.display = 'none';

  if (!incidents || incidents.length === 0) {
    document.getElementById('state-empty').style.display = '';
    return;
  }

  document.getElementById('state-dashboard').style.display = '';

  // ── Derived values ────────────────────────
  const totalAlerts    = incidents.reduce((s, i) => s + (i.alert_count || 0), 0);
  const totalIncidents = incidents.length;
  const highN = incidents.filter(i => i.severity === 'High').length;
  const medN  = incidents.filter(i => i.severity === 'Medium').length;
  const lowN  = incidents.filter(i => i.severity === 'Low').length;
  const savePct = totalAlerts > 0
    ? ((1 - totalIncidents / totalAlerts) * 100).toFixed(1)
    : '0.0';
  const density = totalIncidents > 0
    ? (totalAlerts / totalIncidents).toFixed(1)
    : '—';
  // Rough MTTR estimate: 0.1 hr saved per reduced alert
  const mttr = (((totalAlerts - totalIncidents) * 0.1) / 60).toFixed(1);

  // ── Hero ──────────────────────────────────
  document.getElementById('hero-alerts').textContent    = `${fmtNum(totalAlerts)} Alerts`;
  document.getElementById('hero-incidents').textContent = `${totalIncidents} Incidents`;
  document.getElementById('hero-subtitle').innerHTML    =
    `AI clustering reduced alert noise by <span class="text-white font-medium">${savePct}%</span> across edge telemetry gateways.`;

  // ── KPI tiles ─────────────────────────────
  document.getElementById('kpi-alerts').textContent   = fmtNum(totalAlerts);
  document.getElementById('kpi-incidents').textContent= totalIncidents;
  document.getElementById('kpi-density').textContent  = `-${density}x density`;
  document.getElementById('kpi-high').textContent     = highN;
  document.getElementById('kpi-saved').textContent    = `${savePct}%`;
  document.getElementById('kpi-mttr').textContent     = `~${mttr} hrs MTTR`;

  // Feed rendering is now handled by renderFeed() based on active filters


  // ── Charts ────────────────────────────────
  renderBarChart(totalAlerts, totalIncidents);
  renderDonut(highN, medN, lowN);
}

// ─────────────────────────────────────────────
// DATA LOADING
// Reads the inline <script id="dashboard-data"> block.
// Works on file:// and over HTTP with no server needed.
// To update data: edit the JSON block near the bottom of this file.
// ─────────────────────────────────────────────
function loadDashboard() {
  // Reset state
  document.getElementById('state-loading').style.display   = '';
  document.getElementById('state-empty').style.display     = 'none';
  document.getElementById('state-dashboard').style.display = 'none';
  _openCard = null;

  try {
    const el = document.getElementById('dashboard-data');
    if (!el) throw new Error('Inline data block not found');
    const data = JSON.parse(el.textContent);
    window.allIncidents = data.incidents || [];
    // Small delay so the loading spinner is visible briefly
    setTimeout(() => {
      renderDashboard(window.allIncidents);
      populateMitreFilter(window.allIncidents);
      applyFilters();
    }, 300);
  } catch (err) {
    console.error('[SOC Dashboard] Failed to parse data:', err.message);
    setTimeout(() => renderDashboard([]), 300);
  }
}

// ─────────────────────────────────────────────
// FILTER LOGIC
// ─────────────────────────────────────────────
document.addEventListener('click', (event) => {
  if (!event.target.closest('#dropdown-sev')) {
    const el = document.getElementById('menu-sev');
    if (el) el.classList.add('hidden');
  }
  if (!event.target.closest('#dropdown-mitre')) {
    const el = document.getElementById('menu-mitre');
    if (el) el.classList.add('hidden');
  }
});

function toggleDropdown(id) {
  document.getElementById(id).classList.toggle('hidden');
}

function populateMitreFilter(incidents) {
  const mitreSet = new Map();
  incidents.forEach(inc => {
    if (inc.mitre_id) mitreSet.set(inc.mitre_id, inc.mitre_name || inc.mitre_id);
  });
  
  let html = '';
  mitreSet.forEach((name, id) => {
    html += `
      <label class="flex items-center px-4 py-2 text-sm text-[#C9D1D9] hover:bg-[#21262D] cursor-pointer transition-colors">
        <input type="checkbox" value="${id}" class="mr-3 rounded border-[#30363D] bg-[#0D1117] accent-[#58A6FF] focus:ring-[#58A6FF] filter-mitre" onchange="applyFilters()">
        <span class="truncate block w-full" title="${id} - ${name}">${id} - ${name}</span>
      </label>
    `;
  });
  document.getElementById('mitre-options').innerHTML = html;
}

function applyFilters() {
  const sevBoxes = document.querySelectorAll('.filter-sev:checked');
  const selectedSevs = Array.from(sevBoxes).map(cb => cb.value);
  
  const mitreBoxes = document.querySelectorAll('.filter-mitre:checked');
  const selectedMitres = Array.from(mitreBoxes).map(cb => cb.value);

  // Update button counts
  document.getElementById('sev-count').textContent = selectedSevs.length > 0 ? `(${selectedSevs.length})` : '';
  document.getElementById('mitre-count').textContent = selectedMitres.length > 0 ? `(${selectedMitres.length})` : '';

  const filtered = (window.allIncidents || []).filter(inc => {
    const sevMatch = selectedSevs.length === 0 || selectedSevs.includes(inc.severity);
    const mitreMatch = selectedMitres.length === 0 || selectedMitres.includes(inc.mitre_id);
    return sevMatch && mitreMatch;
  });

  renderFeed(filtered);
}

function renderFeed(incidents) {
  document.getElementById('feed-badge').textContent = `${incidents.length} Queued`;
  
  const container = document.getElementById('incident-cards');
  if (incidents.length === 0) {
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center p-12 bg-[#161B22] rounded-xl border border-[#21262D] text-[#8B949E] my-4 shadow-sm">
        <span class="material-symbols-outlined text-[48px] mb-4 opacity-40">filter_list_off</span>
        <h3 class="text-white font-headline-sm text-headline-sm font-semibold mb-1 tracking-tight">No incidents match</h3>
        <p class="font-body-md text-body-md text-center max-w-sm">Adjust your severity or MITRE technique filters to see more results.</p>
        <button onclick="clearFilters()" class="mt-5 px-4 py-2 bg-[#21262D] hover:bg-[#30363D] text-white rounded-lg border border-[#30363D] text-sm font-medium transition-colors shadow-sm">
          Clear all filters
        </button>
      </div>`;
  } else {
    container.innerHTML = incidents.map(renderCard).join('');
  }
}

function clearFilters() {
  document.querySelectorAll('.filter-sev, .filter-mitre').forEach(cb => cb.checked = false);
  applyFilters();
}

// Wait for the full document to parse before reading the inline data block.
// Without this, <script id="dashboard-data"> hasn't been added to the DOM yet
// when loadDashboard() runs, so getElementById returns null.
document.addEventListener('DOMContentLoaded', loadDashboard);

// ─────────────────────────────────────────────
// POLLING (Auto-refresh)
// ─────────────────────────────────────────────
async function pollData() {
  try {
    const res = await fetch('./dashboard_data.json?_=' + Date.now());
    if (!res.ok) return; // fail silently to avoid console spam on file://
    const data = await res.json();
    if (!data.incidents) return;
    
    // Check if data actually changed to avoid unnecessary re-renders
    const oldStr = JSON.stringify((window.allIncidents || []).map(i => { const { _isNew, ...rest } = i; return rest; }));
    const newStr = JSON.stringify(data.incidents);
    
    if (oldStr !== newStr) {
      const oldIds = new Set((window.allIncidents || []).map(i => i.incident_id));
      
      data.incidents.forEach(inc => {
        if (!oldIds.has(inc.incident_id)) {
          inc._isNew = true;
          // clear the flag after animation finishes so it doesn't replay on filter changes
          setTimeout(() => { inc._isNew = false; }, 3500);
        }
      });
      
      window.allIncidents = data.incidents;
      
      // Preserve accordion state
      const currentlyOpen = _openCard;
      
      renderDashboard(window.allIncidents);
      populateMitreFilter(window.allIncidents);
      applyFilters();
      
      if (currentlyOpen) {
        // Re-open the previously opened card without transition if possible
        const card = document.getElementById(currentlyOpen);
        const body = document.getElementById(currentlyOpen + '-body');
        if (card && body) {
          card.classList.add('open');
          body.classList.add('open');
          _openCard = currentlyOpen;
        }
      }
    }
  } catch (e) {
    // silent catch for file:// CORS errors
  }
}
setInterval(pollData, 5000);

