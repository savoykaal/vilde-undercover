// Small SVG faces for the radio bubble. Same colours as the characters in the world.

const FACES = {
  janni: { bg: '#f2c14e', skin: '#f0c6a4', hair: '#2d1f1a', style: 'long' },
  soeren: { bg: '#6fb3d2', skin: '#e9bd98', hair: '#5b4636', style: 'short', glasses: true, beard: true },
  frej: { bg: '#f08a5d', skin: '#efc19e', hair: '#c9a060', style: 'messy' },
  mynthe: { bg: '#8bd17c', skin: '#f3cdb0', hair: '#3a2340', style: 'bun', streak: '#b98bff' },
  vilde: { bg: '#ff3f9e', skin: '#f1c7a5', hair: '#7a5230', style: 'ponytail' },
  kureren: { bg: '#8d8998', skin: '#e5b894', hair: '#333', style: 'hat' },
  holm: { bg: '#e0566b', skin: '#efc6a8', hair: '#b8b8c4', style: 'bun', glasses: true },
  kasper: { bg: '#4c86e8', skin: '#e8b996', hair: '#5a3b22', style: 'cap', cap: '#27447a' },
  nora: { bg: '#e0566b', skin: '#c98e68', hair: '#1c1412', style: 'long' },
  ib: { bg: '#4c86e8', skin: '#f0c8a8', hair: '#8b5a2b', style: 'cap', cap: '#c0392b' },
  vagt: { bg: '#2c4a7a', skin: '#e6b995', hair: '#2a2a2a', style: 'cap', cap: '#1a2c4d' },
};

export function portrait(who) {
  const f = FACES[who] ?? FACES.vagt;
  let hair = '';
  switch (f.style) {
    case 'long':
      hair = `<path d="M9 22c0-10 5-15 11-15s11 5 11 15v12h-4V22c-3-2-11-2-14 0v12H9z" fill="${f.hair}"/>`;
      break;
    case 'short':
      hair = `<path d="M10 19c0-7 4-11 10-11s10 4 10 11c-3-3-6-4-10-4s-7 1-10 4z" fill="${f.hair}"/>`;
      break;
    case 'messy':
      hair = `<path d="M9 20c-1-8 5-13 11-13 7 0 12 5 11 13l-3-4-2 3-3-4-3 4-3-4-2 4z" fill="${f.hair}"/>`;
      break;
    case 'bun':
      hair = `<circle cx="20" cy="6" r="4.5" fill="${f.hair}"/><path d="M10 19c0-7 4-11 10-11s10 4 10 11c-3-3-6-4-10-4s-7 1-10 4z" fill="${f.hair}"/>${
        f.streak ? `<path d="M23 9c3 1 5 4 5 7l-2-1c0-2-1-4-4-5z" fill="${f.streak}"/>` : ''
      }`;
      break;
    case 'ponytail':
      hair = `<path d="M29 14c6 2 7 10 4 16-1-5-3-8-6-10z" fill="${f.hair}"/><path d="M10 19c0-7 4-11 10-11s10 4 10 11c-3-3-7-4-11-3-4 1-6 2-9 3z" fill="${f.hair}"/>`;
      break;
    case 'hat':
      hair = `<ellipse cx="20" cy="13" rx="15" ry="3.5" fill="#6d6a78"/><path d="M12 13c0-6 3-8 8-8s8 2 8 8z" fill="#8d8998"/><rect x="12" y="10.5" width="16" height="2.5" fill="#2a2830"/>`;
      break;
    case 'cap':
      hair = `<path d="M10 17c0-7 4-10 10-10s10 3 10 10z" fill="${f.cap}"/><path d="M20 15h14c0 2-2 3-4 3H20z" fill="${f.cap}"/>`;
      break;
    default:
      break;
  }
  return `<svg viewBox="0 0 40 40" aria-hidden="true" focusable="false">
    <circle cx="20" cy="20" r="20" fill="${f.bg}"/>
    <path d="M6 40c1-8 7-12 14-12s13 4 14 12z" fill="rgba(0,0,0,.28)"/>
    <ellipse cx="20" cy="20" rx="9" ry="10" fill="${f.skin}"/>
    ${hair}
    <circle cx="16.5" cy="21" r="1.3" fill="#1b1730"/><circle cx="23.5" cy="21" r="1.3" fill="#1b1730"/>
    <path d="M17 26c2 1.5 4 1.5 6 0" stroke="#1b1730" stroke-width="1.3" fill="none" stroke-linecap="round"/>
    ${f.glasses ? '<g fill="none" stroke="#1b1730" stroke-width="1.1"><circle cx="16.5" cy="21" r="2.8"/><circle cx="23.5" cy="21" r="2.8"/><path d="M19.3 21h1.4"/></g>' : ''}
    ${f.beard ? `<path d="M12 23c1 6 4 8 8 8s7-2 8-8c-2 3-5 3-8 3s-6 0-8-3z" fill="${f.hair}" opacity=".85"/>` : ''}
  </svg>`;
}
