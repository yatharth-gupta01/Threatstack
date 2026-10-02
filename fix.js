const fs = require('fs');
let html = fs.readFileSync('soc_triage_dashboard.html', 'utf8');

// 1. Fix Google Fonts
html = html.replace(
  /<link href="https:\/\/fonts\.googleapis\.com\/css2\?family=Fraunces:.*?" rel="stylesheet"\/>/s,
  `<link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@400;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet"/>`
);

// 2. Fix Tailwind config
// Ensure fontFamily is correct. The current one is:
//         fontFamily: {
//           serif: ['Fraunces', 'serif'],
//           mono: ['"IBM Plex Mono"', 'monospace']
//         },
// Which is actually correct for standard tailwind. BUT earlier I saw `font-serif text-[42px]` applied, so it should work if the font loads. Let's make sure `font-serif` exists in the config. By extending `fontFamily` with `serif`, tailwind allows `font-serif`. So it should be fine now that the URL is fixed.

// 3. Fix @keyframes pulse-glow syntax
html = html.replace(
  /  @keyframes pulse-glow \{[\s\S]*?  \}/,
  `  @keyframes pulse-glow {
    0%   { box-shadow: inset 0 0 0 0 rgba(201,138,44,0); border-color: #3A332B; background-color: #1E1A16; }
    15%  { box-shadow: inset 0 0 20px 2px rgba(201,138,44,0.15); border-color: #C98A2C; background-color: rgba(201,138,44,0.05); }
    100% { box-shadow: inset 0 0 0 0 rgba(201,138,44,0); border-color: #3A332B; background-color: #1E1A16; }
  }`
);
// And remove the rogue extra lines from the previous bad replacement
html = html.replace(
  /    15%  \{ box-shadow: inset 0 0 20px 2px rgba\(88,166,255,0\.3\); border-color: #58A6FF; background-color: rgba\(88,166,255,0\.05\); \}\n    100% \{ box-shadow: inset 0 0 0 0 rgba\(88,166,255,0\); border-color: #21262D; background-color: #161B22; \}\n  \}/,
  ''
);

// 4. Fix SEV Object (Remove bg-.../15 and border-.../30)
html = html.replace(
  /const SEV = \{[\s\S]*?\};/,
  `const SEV = {
  High:   { dot: 'bg-[#C1442E]', badge: 'text-[#C1442E] border-current', alert: 'text-[#C1442E]' },
  Medium: { dot: 'bg-[#C98A2C]', badge: 'text-[#C98A2C] border-current', alert: 'text-[#C98A2C]' },
  Low:    { dot: 'bg-[#4C7A6B]', badge: 'text-[#4C7A6B] border-current', alert: 'text-[#4C7A6B]' }
};`
);

// 5. Remove any lingering circle/dot in the "Live" header indicator
html = html.replace(
  /<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-\[#4C7A6B\] opacity-75"><\/span>/,
  '<span class="animate-ping absolute inline-flex h-full w-full bg-[#4C7A6B] opacity-75"></span>'
);
html = html.replace(
  /<span class="relative inline-flex h-2 w-2 rounded-full bg-\[#4C7A6B\]"><\/span>/,
  '<span class="relative inline-flex h-2 w-2 bg-[#4C7A6B]"></span>'
);
html = html.replace(
  /<span class="w-2\.5 h-2\.5 rounded-full.*?"><\/span>/g,
  '<span class="w-2 h-2 bg-[#4C7A6B]"></span>' // Fallback replacement for any random dots
);

// 6. Ensure MITRE tags have NO rounded corners in the HTML
html = html.replace(/px-2\.5 py-0\.5 rounded-full uppercase/g, 'px-2 py-0.5 rounded-none border border-current flex-shrink-0');
html = html.replace(/rounded-full/g, 'rounded-none'); // Nuke any other rounded-full classes globally (there shouldn't be any valid ones left)

fs.writeFileSync('soc_triage_dashboard.html', html);
console.log('Fix complete.');
