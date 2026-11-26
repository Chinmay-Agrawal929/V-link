export interface ProjectBrandingTheme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  gradient: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  glowColor: string;
  symbol: string;
  styleCategory: string;
}

// Map tech tags to color palettes and visual accents
export const TECH_PALETTES: Record<string, {
  color: string;
  accent: string;
  symbol: string;
  domain: string;
}> = {
  // Frontend
  react: { color: '#00d8ff', accent: '#005f73', symbol: '⚛️', domain: 'Frontend' },
  vue: { color: '#42b883', accent: '#35495e', symbol: '🟢', domain: 'Frontend' },
  angular: { color: '#dd0031', accent: '#c3002f', symbol: '🅰️', domain: 'Frontend' },
  'next.js': { color: '#ffffff', accent: '#111827', symbol: '▲', domain: 'Frontend' },
  typescript: { color: '#3178c6', accent: '#235a97', symbol: 'TS', domain: 'Languages' },
  javascript: { color: '#f7df1e', accent: '#e5a00d', symbol: 'JS', domain: 'Languages' },
  tailwind: { color: '#38bdf8', accent: '#0369a1', symbol: '🌊', domain: 'Design & UI' },
  'tailwind css': { color: '#38bdf8', accent: '#0369a1', symbol: '🌊', domain: 'Design & UI' },
  'ui design': { color: '#f43f5e', accent: '#be123c', symbol: '🎨', domain: 'Design & UI' },
  figma: { color: '#a259ff', accent: '#1abcfe', symbol: '❖', domain: 'Design & UI' },
  'three.js': { color: '#ec4899', accent: '#8b5cf6', symbol: '🧊', domain: '3D & Graphics' },
  webgl: { color: '#990000', accent: '#cc0000', symbol: '🔺', domain: '3D & Graphics' },

  // Backend & Cloud
  python: { color: '#3776ab', accent: '#ffd43b', symbol: '🐍', domain: 'AI & Backend' },
  'node.js': { color: '#22c55e', accent: '#15803d', symbol: '🟢', domain: 'Backend' },
  express: { color: '#9ca3af', accent: '#4b5563', symbol: '⚡', domain: 'Backend' },
  fastapi: { color: '#059669', accent: '#047857', symbol: '⚡', domain: 'Backend' },
  go: { color: '#00add8', accent: '#007d9c', symbol: '🐹', domain: 'Backend & Systems' },
  rust: { color: '#f97316', accent: '#c2410c', symbol: '⚙️', domain: 'Systems & Core' },
  'c++': { color: '#00599c', accent: '#004482', symbol: '🔷', domain: 'Systems & Embedded' },
  c: { color: '#a8b9cc', accent: '#5c6f84', symbol: '🔲', domain: 'Embedded Systems' },
  java: { color: '#f89820', accent: '#5382a1', symbol: '☕', domain: 'Backend & Enterprise' },
  kotlin: { color: '#7f52ff', accent: '#c711e1', symbol: '🟣', domain: 'Mobile' },
  flutter: { color: '#02569b', accent: '#0175c2', symbol: '🦋', domain: 'Mobile' },
  'react native': { color: '#61dafb', accent: '#282c34', symbol: '📱', domain: 'Mobile' },

  // AI & Data
  pytorch: { color: '#ee4c2c', accent: '#ff6f00', symbol: '🔥', domain: 'AI / Machine Learning' },
  tensorflow: { color: '#ff6f00', accent: '#e65100', symbol: '🧠', domain: 'AI / Machine Learning' },
  langchain: { color: '#10b981', accent: '#047857', symbol: '🦜', domain: 'GenAI & RAG' },
  faiss: { color: '#6366f1', accent: '#4338ca', symbol: '🔍', domain: 'Vector Search' },
  huggingface: { color: '#ffd21e', accent: '#ff9d00', symbol: '🤗', domain: 'GenAI & NLP' },
  'machine learning': { color: '#a855f7', accent: '#7e22ce', symbol: '🧠', domain: 'AI / Machine Learning' },
  nlp: { color: '#ec4899', accent: '#be185d', symbol: '💬', domain: 'GenAI & NLP' },
  rag: { color: '#38bdf8', accent: '#0284c7', symbol: '⚡', domain: 'GenAI & RAG' },

  // Databases & Infrastructure
  redis: { color: '#dc2626', accent: '#991b1b', symbol: '⚡', domain: 'Caching & Queues' },
  postgres: { color: '#336791', accent: '#204a6e', symbol: '🐘', domain: 'Database' },
  postgresql: { color: '#336791', accent: '#204a6e', symbol: '🐘', domain: 'Database' },
  mongodb: { color: '#10b981', accent: '#047857', symbol: '🍃', domain: 'Database' },
  sql: { color: '#0284c7', accent: '#0369a1', symbol: '💾', domain: 'Database' },
  docker: { color: '#2496ed', accent: '#1d63ed', symbol: '🐳', domain: 'DevOps & Containers' },
  kubernetes: { color: '#326ce5', accent: '#2244a0', symbol: '☸️', domain: 'Cloud Orchestration' },
  aws: { color: '#ff9900', accent: '#232f3e', symbol: '☁️', domain: 'Cloud' },
  firebase: { color: '#f59e0b', accent: '#d97706', symbol: '🔥', domain: 'Serverless' },

  // Web3 & Cybersecurity
  solidity: { color: '#6366f1', accent: '#4338ca', symbol: '💎', domain: 'Web3 & Blockchain' },
  ethereum: { color: '#8c8c8c', accent: '#3c3c3d', symbol: '⟠', domain: 'Web3 & Blockchain' },
  cybersecurity: { color: '#ef4444', accent: '#b91c1c', symbol: '🛡️', domain: 'Security' },

  // Hardware & IoT
  esp32: { color: '#e11d48', accent: '#9f1239', symbol: '⚡', domain: 'IoT & Embedded' },
  arduino: { color: '#00979d', accent: '#006468', symbol: '♾️', domain: 'IoT & Hardware' },
  ros: { color: '#225577', accent: '#113355', symbol: '🤖', domain: 'Robotics' },
  opencv: { color: '#5c3d99', accent: '#ff0000', symbol: '👁️', domain: 'Computer Vision' },
  websockets: { color: '#f43f5e', accent: '#9f1239', symbol: '🔌', domain: 'Real-time' },
};

/**
 * Returns a cohesive branding theme extracted from technologies.
 */
export function getProjectBranding(technologies: string[] = [], projectTitle = ''): ProjectBrandingTheme {
  const normTechs = technologies.map(t => t.toLowerCase().trim());
  
  // Find known techs
  const matched = normTechs
    .map(t => TECH_PALETTES[t])
    .filter(Boolean);

  let primaryColor = '#3b82f6';
  let secondaryColor = '#8b5cf6';
  let accentColor = '#06b6d4';
  let symbol = '🚀';
  let styleCategory = 'Tech & Innovation';

  if (matched.length > 0) {
    primaryColor = matched[0].color;
    symbol = matched[0].symbol;
    styleCategory = matched[0].domain;
    if (matched.length > 1) {
      secondaryColor = matched[1].color;
    } else {
      secondaryColor = matched[0].accent;
    }
    if (matched.length > 2) {
      accentColor = matched[2].color;
    }
  } else {
    // Hash title to generate distinct colors
    let hash = 0;
    for (let i = 0; i < projectTitle.length; i++) {
      hash = projectTitle.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hues = [210, 260, 160, 330, 45, 190, 280];
    const baseHue = Math.abs(hash) % 360;
    primaryColor = `hsl(${baseHue}, 80%, 55%)`;
    secondaryColor = `hsl(${(baseHue + 45) % 360}, 75%, 45%)`;
    accentColor = `hsl(${(baseHue + 90) % 360}, 90%, 65%)`;
  }

  const gradient = `linear-gradient(135deg, ${primaryColor}33 0%, ${secondaryColor}22 50%, #0D121F 100%)`;

  return {
    primaryColor,
    secondaryColor,
    accentColor,
    gradient,
    badgeBg: `${primaryColor}1a`,
    badgeBorder: `${primaryColor}40`,
    badgeText: primaryColor,
    glowColor: `${primaryColor}40`,
    symbol,
    styleCategory,
  };
}

/**
 * Generates an SVG Data URI placeholder avatar based on project tech stack and title.
 */
export function generateProjectStackAvatarSvg(
  technologies: string[] = [],
  title = '',
  size = 120
): string {
  const branding = getProjectBranding(technologies, title);
  const initials = title
    .split(/[\s_-]+/)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase())
    .join('') || 'PJ';

  // Primary tech label
  const primaryTech = technologies[0] || 'Code';
  const secondaryTech = technologies[1] || '';

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${branding.primaryColor}" stop-opacity="0.35"/>
      <stop offset="50%" stop-color="${branding.secondaryColor}" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#0a0f1d" stop-opacity="0.95"/>
    </linearGradient>
    <linearGradient id="strokeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${branding.primaryColor}" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="${branding.secondaryColor}" stop-opacity="0.4"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="40%" r="50%">
      <stop offset="0%" stop-color="${branding.primaryColor}" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="${branding.primaryColor}" stop-opacity="0"/>
    </radialGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="${branding.primaryColor}" flood-opacity="0.3"/>
    </filter>
  </defs>

  <!-- Outer Rounded Container -->
  <rect x="2" y="2" width="${size - 4}" height="${size - 4}" rx="${Math.round(size * 0.22)}" fill="url(#bgGrad)" stroke="url(#strokeGrad)" stroke-width="2"/>
  
  <!-- Subtle Glow Behind Symbol -->
  <circle cx="${size / 2}" cy="${size * 0.42}" r="${size * 0.32}" fill="url(#glow)"/>

  <!-- Circuit Grid Accents -->
  <path d="M 12 ${size * 0.5} H ${size * 0.25} L ${size * 0.35} ${size * 0.65} H ${size * 0.5}" stroke="${branding.primaryColor}" stroke-opacity="0.25" stroke-width="1.5" fill="none"/>
  <path d="M ${size - 12} ${size * 0.5} H ${size * 0.75} L ${size * 0.65} ${size * 0.35} H ${size * 0.5}" stroke="${branding.secondaryColor}" stroke-opacity="0.25" stroke-width="1.5" fill="none"/>

  <!-- Tech Symbol or Initials -->
  <g transform="translate(${size / 2}, ${size * 0.42})" text-anchor="middle" dominant-baseline="central">
    <text font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="${Math.round(size * 0.28)}" fill="#ffffff" filter="url(#shadow)">
      ${initials}
    </text>
  </g>

  <!-- Bottom Tech Pill -->
  <g transform="translate(${size / 2}, ${size * 0.82})">
    <rect x="-${Math.round(size * 0.38)}" y="-${Math.round(size * 0.11)}" width="${Math.round(size * 0.76)}" height="${Math.round(size * 0.2)}" rx="${Math.round(size * 0.1)}" fill="#0d1424" fill-opacity="0.85" stroke="${branding.primaryColor}" stroke-opacity="0.6" stroke-width="1"/>
    <text text-anchor="middle" dominant-baseline="central" y="0.5" font-family="ui-monospace, monospace" font-size="${Math.round(size * 0.095)}" font-weight="700" fill="${branding.primaryColor}">
      ${primaryTech.toUpperCase().slice(0, 10)}
    </text>
  </g>
</svg>
`.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
