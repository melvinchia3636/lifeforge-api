const stuff = `.bg-slate {
    --color-bg-50: '#f8fafc';
    --color-bg-100: '#f1f5f9';
    --color-bg-200: '#e2e8f0';
    --color-bg-300: '#cbd5e1';
    --color-bg-400: '#94a3b8';
    --color-bg-500: '#64748b';
    --color-bg-600: '#475569';
    --color-bg-700: '#334155';
    --color-bg-800: '#1e293b';
    --color-bg-900: '#0f172a';
    --color-bg-950: '#020617';
  }
  
  .bg-gray {
    --color-bg-50: '#f9fafb';
    --color-bg-100: '#f3f4f6';
    --color-bg-200: '#e5e7eb';
    --color-bg-300: '#d1d5db';
    --color-bg-400: '#9ca3af';
    --color-bg-500: '#6b7280';
    --color-bg-600: '#4b5563';
    --color-bg-700: '#374151';
    --color-bg-800: '#1f2937';
    --color-bg-900: '#111827';
    --color-bg-950: '#030712';
  }
  
  .bg-zinc {
    --color-bg-50: '#fafafa';
    --color-bg-100: '#f4f4f5';
    --color-bg-200: '#e4e4e7';
    --color-bg-300: '#d4d4d8';
    --color-bg-400: '#a1a1aa';
    --color-bg-500: '#71717a';
    --color-bg-600: '#52525b';
    --color-bg-700: '#3f3f46';
    --color-bg-800: '#27272a';
    --color-bg-900: '#18181b';
    --color-bg-950: '#09090b';
  }
  
  .bg-neutral {
    --color-bg-50: '#fafafa';
    --color-bg-100: '#f5f5f5';
    --color-bg-200: '#e5e5e5';
    --color-bg-300: '#d4d4d4';
    --color-bg-400: '#a3a3a3';
    --color-bg-500: '#737373';
    --color-bg-600: '#525252';
    --color-bg-700: '#404040';
    --color-bg-800: '#262626';
    --color-bg-900: '#171717';
    --color-bg-950: '#0a0a0a';
  }
  
  .bg-stone {
    --color-bg-50: '#fafaf9';
    --color-bg-100: '#f5f5f4';
    --color-bg-200: '#e7e5e4';
    --color-bg-300: '#d6d3d1';
    --color-bg-400: '#a8a29e';
    --color-bg-500: '#78716c';
    --color-bg-600: '#57534e';
    --color-bg-700: '#44403c';
    --color-bg-800: '#292524';
    --color-bg-900: '#1c1917';
    --color-bg-950: '#0c0a09';
  }`

const regex = /(--color-bg-)(\d{2,3}): '#(\w{6})';/g;
const matches = stuff.match(regex);

function hexToRGB(hex) {
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `${r}, ${g}, ${b}`;
}

const result = matches.map(match => {
    const [_, prefix, number, hex] = match.match(/(--color-bg-)(\d{2,3}): '#(\w{6})';/);
    return `${prefix}${number}: ${hexToRGB(hex)};`;
});

console.log(result.join("\n"))