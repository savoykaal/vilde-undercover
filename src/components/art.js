// Hand-drawn inline SVG: logo, icons, agent emblems and case-file illustrations.
// Colours come from CSS classes (see "Art" in main.css):
//   s = line, d = dashed line, a = glowing accent line, af = accent fill,
//   soft = accent haze, panel = dark fill, dim = faded, thick = heavy stroke.

const art = (viewBox, body) =>
  `<svg class="art" viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">${body}</svg>`;

const icon = (body) =>
  `<svg class="ico" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;

function gearPath(cx, cy, r, teeth) {
  const steps = teeth * 4;
  const points = [];
  for (let i = 0; i < steps; i++) {
    const angle = (i / steps) * Math.PI * 2;
    const radius = i % 4 < 2 ? r : r * 0.74;
    points.push(`${(cx + radius * Math.cos(angle)).toFixed(1)} ${(cy + radius * Math.sin(angle)).toFixed(1)}`);
  }
  return `M${points.join('L')}Z`;
}

export const logo = `<svg class="logo" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
  <path d="M20 2.5 35.2 11.25v17.5L20 37.5 4.8 28.75v-17.5z" fill="none" stroke="currentColor" stroke-width="2"/>
  <path d="M20 7.5 30.8 13.75v12.5L20 32.5 9.2 26.25v-12.5z" fill="currentColor" opacity=".14"/>
  <circle cx="20" cy="17" r="4.2" fill="currentColor"/>
  <path d="M17.6 19.5h4.8l1.6 9h-8z" fill="currentColor"/>
</svg>`;

export const icons = {
  back: icon('<path d="M15 5l-7 7 7 7"/>'),
  fingerprint: icon(
    '<path d="M12 3a9 9 0 0 0-9 9v1"/><path d="M21 13v-1a9 9 0 0 0-4.5-7.8"/><path d="M7 12a5 5 0 0 1 10 0c0 3-.4 5.6-1.8 8.2"/><path d="M12 12c0 3.6-.9 6.4-3 9"/><path d="M5 17c.7-1.4 1-3 1-5"/><path d="M18.4 17.6c.2-.9.4-1.9.5-3"/>',
  ),
  plus: icon('<path d="M12 5v14M5 12h14"/>'),
};

export const emblems = {
  bolt: icon('<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>'),
  star: icon('<path d="m12 2.8 2.8 5.8 6.4.9-4.6 4.5 1.1 6.3L12 17.3l-5.7 3 1.1-6.3-4.6-4.5 6.4-.9z"/>'),
  eye: icon('<path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="3.2"/>'),
  key: icon('<circle cx="7.5" cy="12" r="4"/><path d="M11.5 12H22M18.5 12v3.5M21.5 12v2.5"/>'),
  diamond: icon('<path d="M6.5 3.5h11L22 9.5 12 21 2 9.5z"/><path d="M2 9.5h20M9.5 3.5 8 9.5 12 21l4-11.5-1.5-6"/>'),
  moon: icon('<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z"/><path d="M17 3.5v3M15.5 5h3"/>'),
};

function vaultWindows() {
  const lit = new Set([1, 5, 6, 9, 13, 16]);
  let out = '';
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 3; col++) {
      const i = row * 3 + col;
      const x = 34 + col * 14;
      const y = 16 + row * 14;
      out += lit.has(i)
        ? `<rect class="af" x="${x}" y="${y}" width="8" height="8" rx="1" opacity=".85"/>`
        : `<rect class="s dim" x="${x}" y="${y}" width="8" height="8" rx="1"/>`;
    }
  }
  return out;
}

export const missionArt = {
  hq: art(
    '0 0 160 110',
    `<path class="d" d="M14 62h12M134 62h14M20 104h12M128 104h16"/>
     <path class="panel" d="M50 30h60v26H50z"/>
     <path class="s" d="M44 32 80 10l36 22M50 30v26M110 30v26M98 21v-9"/>
     <circle class="af" cx="98" cy="11" r="2"/>
     <rect class="soft" x="58" y="36" width="10" height="9" rx="1"/>
     <rect class="s" x="58" y="36" width="10" height="9" rx="1"/>
     <rect class="s dim" x="92" y="36" width="10" height="9" rx="1"/>
     <path class="s" d="M74 56V43h12v13"/>
     <path class="s" d="M6 56h148"/>
     <path class="d" d="M80 57v6"/>
     <rect class="soft" x="34" y="64" width="92" height="38" rx="4"/>
     <rect class="a" x="34" y="64" width="92" height="38" rx="4"/>
     <rect class="panel" x="44" y="71" width="20" height="14" rx="2"/>
     <rect class="panel" x="70" y="71" width="20" height="14" rx="2"/>
     <rect class="panel" x="96" y="71" width="20" height="14" rx="2"/>
     <rect class="a" x="44" y="71" width="20" height="14" rx="2"/>
     <rect class="a" x="70" y="71" width="20" height="14" rx="2"/>
     <rect class="a" x="96" y="71" width="20" height="14" rx="2"/>
     <path class="s" d="M48 76h8M48 80h12M74 80l4-4 4 3 4-4M100 76h12M100 80h6"/>
     <path class="s" d="M40 94h80"/>
     <circle class="af" cx="119" cy="69" r="1.6"/>`,
  ),

  vault: art(
    '0 0 160 110',
    `<circle class="s dim" cx="136" cy="16" r="8"/>
     <rect class="panel" x="26" y="8" width="54" height="96" rx="2"/>
     <rect class="s" x="26" y="8" width="54" height="96" rx="2"/>
     ${vaultWindows()}
     <path class="s" d="M6 104h148"/>
     <path class="a" d="M87 84V24m-5 6 5-6 5 6"/>
     <rect class="panel" x="96" y="30" width="48" height="66" rx="7"/>
     <rect class="a" x="96" y="30" width="48" height="66" rx="7"/>
     <rect class="s" x="103" y="37" width="34" height="13" rx="2"/>
     <text class="code" x="120" y="47">•••</text>
     <circle class="s" cx="108" cy="60" r="3.4"/><circle class="s" cx="120" cy="60" r="3.4"/><circle class="s" cx="132" cy="60" r="3.4"/>
     <circle class="s" cx="108" cy="71" r="3.4"/><circle class="af" cx="120" cy="71" r="3.4"/><circle class="s" cx="132" cy="71" r="3.4"/>
     <circle class="s" cx="108" cy="82" r="3.4"/><circle class="s" cx="120" cy="82" r="3.4"/><circle class="s" cx="132" cy="82" r="3.4"/>`,
  ),

  mole: art(
    '0 0 160 110',
    `<rect class="panel" x="8" y="10" width="72" height="90" rx="3"/>
     <rect class="s" x="8" y="10" width="72" height="90" rx="3"/>
     <rect class="s" x="16" y="18" width="24" height="28" rx="1"/>
     <circle class="s" cx="28" cy="28" r="4.5"/>
     <path class="s" d="M20 44c1.5-5 4.5-7.5 8-7.5s6.5 2.5 8 7.5"/>
     <rect class="s" x="48" y="18" width="24" height="28" rx="1"/>
     <text class="code big" x="60" y="39">?</text>
     <rect class="s" x="24" y="62" width="40" height="22" rx="1"/>
     <path class="s dim" d="M30 69h28M30 75h18"/>
     <path class="d" d="M28 46l10 16M60 46 50 62"/>
     <circle class="af" cx="28" cy="18" r="2"/><circle class="af" cx="60" cy="18" r="2"/><circle class="af" cx="44" cy="62" r="2"/>
     <circle class="soft" cx="114" cy="50" r="27"/>
     <circle class="a thick-a" cx="114" cy="50" r="27"/>
     <ellipse class="a" cx="114" cy="44" rx="7" ry="11"/>
     <ellipse class="a" cx="114" cy="63" rx="5" ry="4.5"/>
     <path class="s thick" d="M134 70 150 90"/>`,
  ),

  lab: art(
    '0 0 160 110',
    `<ellipse class="a" cx="40" cy="28" rx="21" ry="4"/>
     <ellipse class="a" cx="120" cy="28" rx="21" ry="4"/>
     <path class="s" d="M40 28v8M120 28v8M40 36l20 10M120 36l-20 10"/>
     <path class="soft" d="M74 66 56 100h48L86 66z"/>
     <rect class="panel" x="56" y="38" width="48" height="22" rx="11"/>
     <rect class="s" x="56" y="38" width="48" height="22" rx="11"/>
     <circle class="af" cx="68" cy="49" r="1.8"/><circle class="af" cx="92" cy="49" r="1.8"/>
     <circle class="panel" cx="80" cy="62" r="6.5"/>
     <circle class="a" cx="80" cy="62" r="6.5"/>
     <circle class="af" cx="80" cy="62" r="2.2"/>
     <path class="s" d="${gearPath(28, 88, 14, 8)}"/>
     <circle class="s" cx="28" cy="88" r="4.5"/>
     <path class="s dim" d="${gearPath(50, 100, 7, 6)}"/>
     <path class="s" d="M116 102 130 88"/>
     <circle class="s" cx="133" cy="85" r="4.5"/>
     <path class="a" d="M142 64v10M137 69h10M126 50v6M123 53h6"/>`,
  ),
};
