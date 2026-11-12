// Generates themed SVG scene illustrations as data URLs when no external photo_url is provided.
// Client can replace any visual at any time by setting `"photo_url": "/photos/filename.jpg"` in cianjur-data.json.

export type SceneTheme =
  | 'mosque'
  | 'pillar'
  | 'music'
  | 'leuit'
  | 'colosseum'
  | 'tower'
  | 'grass'
  | 'pendopo'
  | 'bell'
  | 'colonial'
  | 'station'
  | 'bomero'
  | 'culinary'
  | 'souvenir'
  | 'hotel'
  | 'toilet'
  | 'event';

function pickTheme(id: string, title: string, category?: string): SceneTheme {
  const t = `${id} ${title} ${category ?? ''}`.toLowerCase();
  if (t.includes('al-qur') || t.includes('masjid')) return 'mosque';
  if (t.includes('asmaul') || t.includes('tiang')) return 'pillar';
  if (t.includes('suling') || t.includes('kecapi') || t.includes('mamaos')) return 'music';
  if (t.includes('leuit') || t.includes('pelung') || t.includes('pandanwangi')) return 'leuit';
  if (t.includes('koloseum') || t.includes('maenpo')) return 'colosseum';
  if (t.includes('menara')) return 'tower';
  if (t.includes('rumput') || t.includes('bermain')) return 'grass';
  if (t.includes('lonceng')) return 'bell';
  if (t.includes('pendopo') || t.includes('bumi ageung')) return 'pendopo';
  if (t.includes('stasiun') || t.includes('kereta')) return 'station';
  if (t.includes('bomero') || t.includes('bojong meron')) return 'bomero';
  if (t.includes('kantor pos') || t.includes('vihara') || t.includes('tugu')) return 'colonial';
  if (t.includes('toilet') || t.includes('wudhu')) return 'toilet';
  if (t.includes('event') || t.includes('night') || t.includes('pentas')) return 'event';
  if (t.includes('oleh') || t.includes('tauco') || t.includes('roti') || t.includes('manisan') || t.includes('souvenir'))
    return 'souvenir';
  if (t.includes('htl-') || t.includes('hotel') || t.includes('guest') || t.includes('suites'))
    return 'hotel';
  return 'culinary';
}

const PALETTES: Record<SceneTheme, { bg1: string; bg2: string; accent: string; badge: string }> = {
  mosque: { bg1: '#0f3d23', bg2: '#1E5631', accent: '#E5B842', badge: 'Wisata Religi & Ngaos' },
  pillar: { bg1: '#1b4332', bg2: '#2d6a4f', accent: '#F4D58D', badge: '99 Tiang Asmaul Husna' },
  music: { bg1: '#3E2723', bg2: '#6D4C41', accent: '#E5B842', badge: 'Seni Mamaos Cianjuran' },
  leuit: { bg1: '#4A3219', bg2: '#7F5539', accent: '#F3C663', badge: 'Warisan Agraris Cianjur' },
  colosseum: { bg1: '#2A1B12', bg2: '#5C3A21', accent: '#E5B842', badge: 'Amfiteater & Maenpo' },
  tower: { bg1: '#1E3A5F', bg2: '#2E5A88', accent: '#F4D58D', badge: 'Lanskap Alun-Alun' },
  grass: { bg1: '#14532d', bg2: '#16a34a', accent: '#fef08a', badge: 'Zona Keluarga & Taman' },
  pendopo: { bg1: '#3E2723', bg2: '#5C3A21', accent: '#D4AF37', badge: 'Cagar Budaya Tatar Cianjur' },
  bell: { bg1: '#422006', bg2: '#713f12', accent: '#facc15', badge: 'Artefak Kolonial 1774' },
  colonial: { bg1: '#451a03', bg2: '#78350f', accent: '#fde68a', badge: 'Jejak Sejarah Kota' },
  station: { bg1: '#1e293b', bg2: '#334155', accent: '#38bdf8', badge: 'Akses Kereta Siliwangi' },
  bomero: { bg1: '#31102F', bg2: '#581c87', accent: '#fbbf24', badge: 'Bomero City Walk' },
  culinary: { bg1: '#7c2d12', bg2: '#c2410c', accent: '#fde047', badge: 'Kuliner Legendaris' },
  souvenir: { bg1: '#78350f', bg2: '#b45309', accent: '#fef08a', badge: 'Oleh-Oleh Khas Cianjur' },
  hotel: { bg1: '#2e1065', bg2: '#4c1d95', accent: '#e9d5ff', badge: 'Akomodasi & Penginapan' },
  toilet: { bg1: '#0c4a6e', bg2: '#0284c7', accent: '#bae6fd', badge: 'Fasilitas Toilet & Wudhu' },
  event: { bg1: '#3b0764', bg2: '#6b21a8', accent: '#facc15', badge: 'Agenda & Keramaian Kota' },
};

function renderForegroundArt(theme: SceneTheme, accent: string): string {
  switch (theme) {
    case 'mosque':
      return `
        <path d="M180 185 Q240 105 300 185 Z" fill="${accent}" fill-opacity="0.88"/>
        <circle cx="240" cy="102" r="7" fill="#fff"/>
        <rect x="135" y="120" width="18" height="95" rx="4" fill="#fff" fill-opacity="0.82"/>
        <polygon points="135,120 144,95 153,120" fill="${accent}"/>
        <rect x="327" y="120" width="18" height="95" rx="4" fill="#fff" fill-opacity="0.82"/>
        <polygon points="327,120 336,95 345,120" fill="${accent}"/>
        <rect x="160" y="185" width="160" height="35" rx="4" fill="#ffffff" fill-opacity="0.22"/>
        <path d="M190 232 Q240 250 290 232" stroke="#38bdf8" stroke-width="5" fill="none" stroke-linecap="round"/>
      `;
    case 'pillar':
      return `
        <g fill="#ffffff" fill-opacity="0.88">
          <rect x="115" y="110" width="16" height="105" rx="3"/>
          <rect x="155" y="102" width="16" height="113" rx="3"/>
          <rect x="195" y="95" width="18" height="120" rx="3"/>
          <rect x="267" y="95" width="18" height="120" rx="3"/>
          <rect x="309" y="102" width="16" height="113" rx="3"/>
          <rect x="349" y="110" width="16" height="105" rx="3"/>
        </g>
        <path d="M105 110 L240 72 L375 110" stroke="${accent}" stroke-width="5" fill="none"/>
        <circle cx="240" cy="145" r="24" fill="${accent}" fill-opacity="0.9"/>
      `;
    case 'music':
      return `
        <path d="M140 190 L320 150 L335 182 L155 210 Z" fill="${accent}" fill-opacity="0.85"/>
        <line x1="160" y1="184" x2="315" y2="156" stroke="#fff" stroke-width="2"/>
        <line x1="163" y1="192" x2="318" y2="164" stroke="#fff" stroke-width="2"/>
        <rect x="175" y="112" width="145" height="14" rx="7" transform="rotate(-14 240 120)" fill="#fff" fill-opacity="0.9"/>
        <circle cx="215" cy="116" r="3" fill="#3E2723"/>
        <circle cx="235" cy="111" r="3" fill="#3E2723"/>
        <circle cx="255" cy="107" r="3" fill="#3E2723"/>
      `;
    case 'leuit':
      return `
        <polygon points="175,185 240,95 305,185" fill="${accent}" fill-opacity="0.9"/>
        <rect x="190" y="185" width="100" height="42" fill="#fff" fill-opacity="0.28"/>
        <line x1="198" y1="227" x2="198" y2="242" stroke="#fff" stroke-width="5"/>
        <line x1="282" y1="227" x2="282" y2="242" stroke="#fff" stroke-width="5"/>
      `;
    case 'colosseum':
      return `
        <ellipse cx="240" cy="195" rx="115" ry="32" fill="none" stroke="${accent}" stroke-width="5" stroke-dasharray="14 6"/>
        <ellipse cx="240" cy="195" rx="78" ry="20" fill="#ffffff" fill-opacity="0.18"/>
        <circle cx="240" cy="122" r="14" fill="${accent}"/>
        <path d="M215 152 L240 138 L268 146 M240 138 L240 172 L222 195 M240 172 L258 195" stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none"/>
      `;
    case 'station':
      return `
        <rect x="145" y="118" width="190" height="88" rx="14" fill="#fff" fill-opacity="0.9"/>
        <rect x="162" y="134" width="68" height="36" rx="6" fill="#0f172a"/>
        <rect x="250" y="134" width="68" height="36" rx="6" fill="#0f172a"/>
        <circle cx="185" cy="190" r="8" fill="${accent}"/>
        <circle cx="295" cy="190" r="8" fill="${accent}"/>
        <line x1="110" y1="218" x2="370" y2="218" stroke="${accent}" stroke-width="5" stroke-dasharray="16 8"/>
      `;
    case 'bomero':
      return `
        <circle cx="155" cy="120" r="16" fill="${accent}" fill-opacity="0.9"/>
        <line x1="155" y1="136" x2="155" y2="215" stroke="#fff" stroke-width="4"/>
        <circle cx="325" cy="120" r="16" fill="${accent}" fill-opacity="0.9"/>
        <line x1="325" y1="136" x2="325" y2="215" stroke="#fff" stroke-width="4"/>
        <circle cx="205" cy="202" r="14" fill="#e2e8f0" fill-opacity="0.85"/>
        <circle cx="275" cy="202" r="14" fill="#e2e8f0" fill-opacity="0.85"/>
        <rect x="215" y="155" width="50" height="32" rx="6" fill="${accent}" fill-opacity="0.35" stroke="#fff" stroke-width="2"/>
      `;
    case 'souvenir':
      return `
        <rect x="175" y="122" width="54" height="86" rx="10" fill="#fff" fill-opacity="0.9"/>
        <rect x="185" y="108" width="34" height="14" rx="4" fill="${accent}"/>
        <rect x="183" y="148" width="38" height="34" rx="4" fill="${accent}" fill-opacity="0.85"/>
        <path d="M250 155 Q285 130 320 155 L312 206 L258 206 Z" fill="${accent}" fill-opacity="0.88"/>
      `;
    case 'culinary':
      return `
        <path d="M165 168 A75 52 0 0 0 315 168 Z" fill="#fff" fill-opacity="0.92"/>
        <ellipse cx="240" cy="168" rx="75" ry="14" fill="${accent}"/>
        <path d="M210 135 Q218 115 210 98 M240 130 Q248 110 240 92 M270 135 Q278 115 270 98" stroke="#fff" stroke-width="3.5" stroke-linecap="round" fill="none" stroke-opacity="0.75"/>
      `;
    case 'hotel':
      return `
        <rect x="175" y="96" width="130" height="118" rx="8" fill="#fff" fill-opacity="0.88"/>
        <g fill="#4c1d95" fill-opacity="0.75">
          <rect x="192" y="114" width="22" height="20" rx="3"/><rect x="229" y="114" width="22" height="20" rx="3"/><rect x="266" y="114" width="22" height="20" rx="3"/>
          <rect x="192" y="146" width="22" height="20" rx="3"/><rect x="229" y="146" width="22" height="20" rx="3"/><rect x="266" y="146" width="22" height="20" rx="3"/>
        </g>
        <rect x="224" y="180" width="32" height="34" rx="4" fill="${accent}"/>
      `;
    case 'toilet':
      return `
        <circle cx="205" cy="122" r="14" fill="#fff"/>
        <rect x="188" y="142" width="34" height="58" rx="8" fill="#fff" fill-opacity="0.9"/>
        <line x1="240" y1="108" x2="240" y2="205" stroke="${accent}" stroke-width="3"/>
        <circle cx="275" cy="122" r="14" fill="${accent}"/>
        <polygon points="275,142 254,200 296,200" fill="${accent}" fill-opacity="0.9"/>
      `;
    default:
      return `
        <polygon points="150,195 240,105 330,195" fill="${accent}" fill-opacity="0.82"/>
        <rect x="175" y="195" width="130" height="28" rx="4" fill="#fff" fill-opacity="0.3"/>
        <circle cx="240" cy="148" r="18" fill="#fff" fill-opacity="0.9"/>
      `;
  }
}

function escapeXml(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function getVisualUrl(opts: {
  id: string;
  title: string;
  subtitle?: string;
  category?: string;
  photoUrl?: string | null;
}): string {
  if (opts.photoUrl && opts.photoUrl.trim().length > 0) {
    return opts.photoUrl;
  }
  const theme = pickTheme(opts.id, opts.title, opts.category);
  const p = PALETTES[theme];
  const art = renderForegroundArt(theme, p.accent);
  const cleanTitle = escapeXml(
    opts.title.length > 42 ? `${opts.title.slice(0, 40)}…` : opts.title,
  );
  const cleanSub = escapeXml(opts.subtitle || p.badge);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 270" width="480" height="270">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${p.bg1}"/>
        <stop offset="100%" stop-color="${p.bg2}"/>
      </linearGradient>
    </defs>
    <rect width="480" height="270" fill="url(#bg)"/>
    <circle cx="410" cy="52" r="88" fill="${p.accent}" fill-opacity="0.12"/>
    <circle cx="70" cy="220" r="110" fill="#ffffff" fill-opacity="0.06"/>
    <path d="M0 215 Q140 190 270 212 T480 202 L480 270 L0 270 Z" fill="#000000" fill-opacity="0.28"/>
    ${art}
    <rect x="16" y="14" width="176" height="24" rx="12" fill="#000000" fill-opacity="0.38"/>
    <text x="28" y="30" fill="${p.accent}" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="700">${cleanSub}</text>
    <text x="20" y="246" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="700">${cleanTitle}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
