const fs = require('fs');
let html = fs.readFileSync('soc_triage_dashboard.html', 'utf8');

// 1. Hover States & General cleanup
// Bar chart: remove group-hover:brightness-110
html = html.replace(/group-hover:brightness-110/g, '');
// Cards hover: change border color, remove transition-all duration-200
html = html.replace(/transition-all duration-200/g, 'transition-colors hover:border-[#8B949E]');

// 2. Accordion speed (ease-out curve ~200ms)
html = html.replace(/max-height 0.38s cubic-bezier\(0.4,0,0.2,1\),/s, 'max-height 200ms ease-out,');
html = html.replace(/opacity\s+0.28s ease,/s, 'opacity 200ms ease-out,');
html = html.replace(/padding\s+0.28s ease;/s, 'padding 200ms ease-out;');

// 3. New Animations CSS
const newCSS = `
  @media (prefers-reduced-motion: no-preference) {
    @keyframes scan-reveal {
      from { clip-path: inset(0 100% 0 0); }
      to { clip-path: inset(0 0 0 0); }
    }
    @keyframes border-flash {
      0% { border-color: var(--sev-color); }
      100% { border-color: #3A332B; }
    }
    @keyframes fast-fade {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .new-incident {
      animation: scan-reveal 450ms ease-out forwards, border-flash 2s ease-out 450ms forwards;
    }
    .animate-filter {
      animation: fast-fade 150ms ease-out forwards;
    }
    
    .bar-fill { transition: height 600ms ease-out; }
    circle.donut-seg { transition: stroke-dasharray 600ms ease-out, stroke-dashoffset 600ms ease-out; }
  }
  @media (prefers-reduced-motion: reduce) {
    .new-incident { animation: none !important; }
    .animate-filter { animation: none !important; }
    .bar-fill { transition: none !important; }
    circle.donut-seg { transition: none !important; }
  }
`;

// Replace old pulse-glow animation block entirely
html = html.replace(/@keyframes pulse-glow \{[\s\S]*?\.new-incident \{[\s\S]*?\}/, newCSS);

// Remove old bar-fill and donut-seg transitions
html = html.replace(/\.bar-fill \{ transition: height 0\.7s cubic-bezier.*? \}/, '');
html = html.replace(/circle\.donut-seg \{ transition: stroke-dasharray 0\.6s cubic-bezier.*? \}/, '');

// 4. Update SEV objects to include hex for the custom property
html = html.replace(/High:   \{ dot: 'bg-\\[#C1442E\\]', badge: 'text-\\[#C1442E\\] border-current', alert: 'text-\\[#C1442E\\]' \},/,
  "High:   { dot: 'bg-[#C1442E]', badge: 'text-[#C1442E] border-current', alert: 'text-[#C1442E]', hex: '#C1442E' },");
html = html.replace(/Medium: \{ dot: 'bg-\\[#C98A2C\\]', badge: 'text-\\[#C98A2C\\] border-current', alert: 'text-\\[#C98A2C\\]' \},/,
  "Medium: { dot: 'bg-[#C98A2C]', badge: 'text-[#C98A2C] border-current', alert: 'text-[#C98A2C]', hex: '#C98A2C' },");
html = html.replace(/Low:    \{ dot: 'bg-\\[#4C7A6B\\]', badge: 'text-\\[#4C7A6B\\] border-current', alert: 'text-\\[#4C7A6B\\]' \}/,
  "Low:    { dot: 'bg-[#4C7A6B]', badge: 'text-[#4C7A6B] border-current', alert: 'text-[#4C7A6B]', hex: '#4C7A6B' }");

// Inject --sev-color into the card
html = html.replace(/<div id=\"\$\{cid\}\" class=\"incident-card/, '<div id="${cid}" style="--sev-color: ${s.hex}" class="incident-card');

// 5. Apply animate-filter in applyFilters
const filterLogic = `
  const container = document.getElementById('incident-cards');
  container.classList.remove('animate-filter');
  void container.offsetWidth; // trigger reflow
  container.classList.add('animate-filter');
  
  renderFeed(filtered);
`;
html = html.replace(/renderFeed\(filtered\);/, filterLogic);

// 6. Chart Initial Render Flag Logic
html = html.replace(/let _openCard = null;/, 'let _openCard = null; let _initialChartRender = true;');

// update bar chart logic
const oldBarLogic = `  // Animate bars on next paint
  requestAnimationFrame(() => setTimeout(() => {
    document.getElementById('bar-raw').style.height = '95%';
    document.getElementById('bar-inc').style.height = \`\${incH}%\`;
  }, 80));`;
const newBarLogic = `  const r = document.getElementById('bar-raw');
  const i = document.getElementById('bar-inc');
  if (_initialChartRender) {
    requestAnimationFrame(() => setTimeout(() => {
      r.style.height = '95%'; i.style.height = \`\${incH}%\`;
    }, 80));
  } else {
    r.style.transition = 'none'; i.style.transition = 'none';
    r.style.height = '95%'; i.style.height = \`\${incH}%\`;
  }`;
html = html.replace(oldBarLogic, newBarLogic);

// update donut chart logic
const oldDonutLogic = `  setTimeout(() => {
    seg('donut-high', highN, 0);
    seg('donut-med',  medN,  -(highArc + GAP));
    seg('donut-low',  lowN,  -(highArc + medArc + GAP * 2));
  }, 150);`;
const newDonutLogic = `  if (_initialChartRender) {
    setTimeout(() => {
      seg('donut-high', highN, 0);
      seg('donut-med',  medN,  -(highArc + GAP));
      seg('donut-low',  lowN,  -(highArc + medArc + GAP * 2));
    }, 150);
  } else {
    document.getElementById('donut-high').style.transition = 'none';
    document.getElementById('donut-med').style.transition = 'none';
    document.getElementById('donut-low').style.transition = 'none';
    seg('donut-high', highN, 0);
    seg('donut-med',  medN,  -(highArc + GAP));
    seg('donut-low',  lowN,  -(highArc + medArc + GAP * 2));
  }`;
html = html.replace(oldDonutLogic, newDonutLogic);

// set initial chart render to false after initial load
html = html.replace(/document\.getElementById\('state-loading'\)\.style\.display = 'none';/, 
  "document.getElementById('state-loading').style.display = 'none'; setTimeout(() => _initialChartRender = false, 1000);");

fs.writeFileSync('soc_triage_dashboard.html', html);
console.log('Script processed successfully.');
