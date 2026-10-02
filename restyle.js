const fs = require('fs');
let html = fs.readFileSync('soc_triage_dashboard.html', 'utf8');

// 1. Google Fonts Link
html = html.replace(
  /<link href="https:\/\/fonts\.googleapis\.com\/css2\?family=Inter.*?rel="stylesheet"\/>/s,
  `<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet"/>`
);

// 2. Tailwind Config (Colors and Fonts)
html = html.replace(
  /fontFamily: \{.*?\}/s,
  `fontFamily: {
          serif: ['Fraunces', 'serif'],
          mono: ['"IBM Plex Mono"', 'monospace']
        }`
);

// 3. CSS Overrides (Paper grain, pulse-glow)
html = html.replace(
  /<\/style>/,
  `  .paper-grain {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    pointer-events: none; z-index: 9999; opacity: 0.04;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  }
</style>`
);

// 4. Update pulse-glow animation colors
html = html.replace(
  /@keyframes pulse-glow \{.*?\}/s,
  `@keyframes pulse-glow {
    0%   { box-shadow: inset 0 0 0 0 rgba(201,138,44,0); border-color: #3A332B; background-color: #1E1A16; }
    15%  { box-shadow: inset 0 0 20px 2px rgba(201,138,44,0.15); border-color: #C98A2C; background-color: rgba(201,138,44,0.05); }
    100% { box-shadow: inset 0 0 0 0 rgba(201,138,44,0); border-color: #3A332B; background-color: #1E1A16; }
  }`
);

// 5. Global text colors and background
html = html.replace(/bg-\[#0E1117\]/g, 'bg-[#14110F]');
html = html.replace(/bg-\[#161B22\]/g, 'bg-[#1E1A16]');
html = html.replace(/border-\[#21262D\]/g, 'border-[#3A332B]');
html = html.replace(/border-\[#30363D\]/g, 'border-[#3A332B]');
html = html.replace(/text-white/g, 'text-[#EDE6D6]');
html = html.replace(/text-\[#C9D1D9\]/g, 'text-[#EDE6D6]');
html = html.replace(/bg-\[#21262D\]/g, 'bg-[#14110F]');
html = html.replace(/hover:bg-\[#30363D\]/g, 'hover:bg-[#1E1A16]');
html = html.replace(/bg-\[#1F2630\]/g, 'bg-[#14110F]');

// 6. Typography mapping
html = html.replace(/font-headline-sm text-headline-sm/g, 'font-serif text-[16px]');
html = html.replace(/font-headline-md text-headline-md/g, 'font-serif text-[20px]');
html = html.replace(/font-headline-lg text-headline-lg/g, 'font-serif text-[24px]');
html = html.replace(/font-headline-xl text-headline-xl/g, 'font-serif text-[42px]');

html = html.replace(/font-label-sm text-label-sm/g, 'font-mono text-[10px]');
html = html.replace(/font-label-md text-label-md/g, 'font-mono text-[11px]');
html = html.replace(/font-label-lg text-label-lg/g, 'font-mono text-[13px]');

html = html.replace(/font-body-sm text-body-sm/g, 'font-mono text-[12px]');
html = html.replace(/font-body-md text-body-md/g, 'font-mono text-[14px]');
html = html.replace(/font-body-lg text-body-lg/g, 'font-mono text-[16px]');

// 7. Remove tracking and uppercase
html = html.replace(/ tracking-tight/g, '');
html = html.replace(/ tracking-wider/g, '');
html = html.replace(/ tracking-widest/g, '');
html = html.replace(/ tracking-wide/g, '');
html = html.replace(/ uppercase/g, '');

// 8. Remove rounded corners
html = html.replace(/rounded-xl/g, 'rounded-sm');
html = html.replace(/rounded-lg/g, 'rounded-sm');
html = html.replace(/rounded-full/g, 'rounded-sm');
html = html.replace(/rounded-md/g, 'rounded-sm');

// 9. Remove shadows
html = html.replace(/shadow-\[inset.*?\]/g, '');
html = html.replace(/shadow-xl/g, 'shadow-none');

// 10. Colors (Critical, Medium, Low)
html = html.replace(/bg-\[#E5484D\]/g, 'bg-[#C1442E]');
html = html.replace(/text-\[#E5484D\]/g, 'text-[#C1442E]');
html = html.replace(/border-\[#E5484D\]/g, 'border-[#C1442E]');
html = html.replace(/shadow-\[0_0_8px_#E5484D\]/g, '');
html = html.replace(/accent-\[#E5484D\]/g, 'accent-[#C1442E]');
html = html.replace(/focus:ring-\[#E5484D\]/g, 'focus:ring-[#C1442E]');

html = html.replace(/bg-\[#F5A623\]/g, 'bg-[#C98A2C]');
html = html.replace(/text-\[#F5A623\]/g, 'text-[#C98A2C]');
html = html.replace(/border-\[#F5A623\]/g, 'border-[#C98A2C]');
html = html.replace(/shadow-\[0_0_8px_#F5A623\]/g, '');
html = html.replace(/accent-\[#D29922\]/g, 'accent-[#C98A2C]');
html = html.replace(/focus:ring-\[#D29922\]/g, 'focus:ring-[#C98A2C]');

html = html.replace(/bg-\[#3DD68C\]/g, 'bg-[#4C7A6B]');
html = html.replace(/text-\[#3DD68C\]/g, 'text-[#4C7A6B]');
html = html.replace(/border-\[#3DD68C\]/g, 'border-[#4C7A6B]');
html = html.replace(/shadow-\[0_0_8px_#3DD68C\]/g, '');
html = html.replace(/accent-\[#3FB950\]/g, 'accent-[#4C7A6B]');
html = html.replace(/focus:ring-\[#3FB950\]/g, 'focus:ring-[#4C7A6B]');

html = html.replace(/text-\[#4D9EFF\]/g, 'text-[#EDE6D6]');
html = html.replace(/text-\[#58A6FF\]/g, 'text-[#C98A2C]');
html = html.replace(/bg-\[#58A6FF\]/g, 'bg-[#C98A2C]');
html = html.replace(/accent-\[#58A6FF\]/g, 'accent-[#C98A2C]');
html = html.replace(/focus:ring-\[#58A6FF\]/g, 'focus:ring-[#C98A2C]');

// 11. Header Changes
const newHeader = `
<header class="w-full bg-[#1E1A16] border-b border-[#3A332B] px-margin py-4 sticky top-0 z-50 flex items-center justify-between">
  <div class="flex flex-col">
    <span class="font-mono text-[10px] text-[#8B949E] mb-1">// FIELD INTELLIGENCE BRIEFING</span>
    <h1 class="font-serif text-[24px] font-bold text-[#EDE6D6]">Incident Log</h1>
  </div>
  <div class="flex items-center space-x-5">
    <div class="flex items-center space-x-2 px-2.5 py-1 bg-[#14110F] border border-[#3A332B] rounded-sm">
      <span class="relative flex h-2 w-2">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4C7A6B] opacity-75"></span>
        <span class="relative inline-flex h-2 w-2 rounded-full bg-[#4C7A6B]"></span>
      </span>
      <span class="font-mono text-[11px] text-[#4C7A6B] font-semibold">Monitoring</span>
    </div>
    <div class="flex items-center space-x-1.5 text-[#8B949E] border-l border-[#3A332B] pl-4">
      <span class="material-symbols-outlined text-[15px]">schedule</span>
      <span class="font-mono text-[11px] text-[#EDE6D6]" id="live-utc">--:--:--</span>
      <span class="font-mono text-[9px]">UTC</span>
    </div>
  </div>
</header>`;

html = html.replace(/<header.*?<\/header>/s, newHeader);

// 12. Modify renderCard
html = html.replace(/<span class="w-2\.5 h-2\.5.*?flex-shrink-0"><\/span>/g, '<span class="w-1 h-5 ${s.dot} flex-shrink-0"></span>');
html = html.replace(/<span class="\$\{s\.badge\}[^"]*?">\$\{escHtml\(inc\.mitre_id\)\}<\/span>/g, '<span class="${s.badge} font-mono text-[11px] px-2 py-0.5 border border-current rounded-none flex-shrink-0">${escHtml(inc.mitre_id)}</span>');

// 13. Add paper grain to body
html = html.replace(/<body class="/, '<div class="paper-grain"></div>\n<body class="');

// 14. Fix D3 colors in JS
html = html.replace(/const COLOR_HIGH\s*=\s*'.*?'/, "const COLOR_HIGH = '#C1442E'");
html = html.replace(/const COLOR_MED\s*=\s*'.*?'/, "const COLOR_MED = '#C98A2C'");
html = html.replace(/const COLOR_LOW\s*=\s*'.*?'/, "const COLOR_LOW = '#4C7A6B'");
html = html.replace(/const COLOR_BG\s*=\s*'.*?'/, "const COLOR_BG = '#1E1A16'");
html = html.replace(/const COLOR_STROKE\s*=\s*'.*?'/, "const COLOR_STROKE = '#3A332B'");

// 15. SEV tokens badge update
html = html.replace(/const SEV = \\{.*?\\};/s, `const SEV = {
  High:   { dot: 'bg-[#C1442E]', badge: 'text-[#C1442E] border border-[#C1442E]', alert: 'text-[#C1442E]' },
  Medium: { dot: 'bg-[#C98A2C]', badge: 'text-[#C98A2C] border border-[#C98A2C]', alert: 'text-[#C98A2C]' },
  Low:    { dot: 'bg-[#4C7A6B]', badge: 'text-[#4C7A6B] border border-[#4C7A6B]', alert: 'text-[#4C7A6B]' }
};`);

// 16. Remove opacity from filter icon to match requested flat aesthetic
html = html.replace(/opacity-40/g, 'opacity-100');

fs.writeFileSync('soc_triage_dashboard.html', html);
console.log('Restyling complete.');
