export interface DomainTag {
  name: string;
  category: 'Frontend' | 'Backend' | 'AI & Data' | 'Design' | 'Mobile' | 'Cloud & DevOps' | 'Security & Web3';
  color: string; // Tailwind accent theme
  bgClass: string;
  borderClass: string;
  textClass: string;
  dotColor: string;
  popular?: boolean;
}

export interface InterestTag {
  name: string;
  category: 'Competition' | 'Development' | 'Academics' | 'Career' | 'Creative';
  bgClass: string;
  borderClass: string;
  textClass: string;
  popular?: boolean;
}

export const TECHNICAL_DOMAINS: DomainTag[] = [
  // Frontend
  { name: 'React', category: 'Frontend', color: 'cyan', bgClass: 'bg-cyan-500/15', borderClass: 'border-cyan-500/30', textClass: 'text-cyan-300', dotColor: 'bg-cyan-400', popular: true },
  { name: 'Next.js', category: 'Frontend', color: 'sky', bgClass: 'bg-sky-500/15', borderClass: 'border-sky-500/30', textClass: 'text-sky-300', dotColor: 'bg-sky-400', popular: true },
  { name: 'TypeScript', category: 'Frontend', color: 'blue', bgClass: 'bg-blue-500/15', borderClass: 'border-blue-500/30', textClass: 'text-blue-300', dotColor: 'bg-blue-400', popular: true },
  { name: 'JavaScript', category: 'Frontend', color: 'yellow', bgClass: 'bg-yellow-500/15', borderClass: 'border-yellow-500/30', textClass: 'text-yellow-300', dotColor: 'bg-yellow-400' },
  { name: 'Tailwind CSS', category: 'Frontend', color: 'teal', bgClass: 'bg-teal-500/15', borderClass: 'border-teal-500/30', textClass: 'text-teal-300', dotColor: 'bg-teal-400', popular: true },
  { name: 'Vue.js', category: 'Frontend', color: 'emerald', bgClass: 'bg-emerald-500/15', borderClass: 'border-emerald-500/30', textClass: 'text-emerald-300', dotColor: 'bg-emerald-400' },
  { name: 'Three.js', category: 'Frontend', color: 'violet', bgClass: 'bg-violet-500/15', borderClass: 'border-violet-500/30', textClass: 'text-violet-300', dotColor: 'bg-violet-400', popular: true },
  { name: 'HTML5 / CSS3', category: 'Frontend', color: 'orange', bgClass: 'bg-orange-500/15', borderClass: 'border-orange-500/30', textClass: 'text-orange-300', dotColor: 'bg-orange-400' },
  { name: 'Svelte', category: 'Frontend', color: 'orange', bgClass: 'bg-orange-500/15', borderClass: 'border-orange-500/30', textClass: 'text-orange-300', dotColor: 'bg-orange-400' },

  // AI & Data Science
  { name: 'Python', category: 'AI & Data', color: 'amber', bgClass: 'bg-amber-500/15', borderClass: 'border-amber-500/30', textClass: 'text-amber-300', dotColor: 'bg-amber-400', popular: true },
  { name: 'Machine Learning', category: 'AI & Data', color: 'purple', bgClass: 'bg-purple-500/15', borderClass: 'border-purple-500/30', textClass: 'text-purple-300', dotColor: 'bg-purple-400', popular: true },
  { name: 'PyTorch', category: 'AI & Data', color: 'rose', bgClass: 'bg-rose-500/15', borderClass: 'border-rose-500/30', textClass: 'text-rose-300', dotColor: 'bg-rose-400', popular: true },
  { name: 'TensorFlow', category: 'AI & Data', color: 'orange', bgClass: 'bg-orange-500/15', borderClass: 'border-orange-500/30', textClass: 'text-orange-300', dotColor: 'bg-orange-400' },
  { name: 'Generative AI', category: 'AI & Data', color: 'indigo', bgClass: 'bg-indigo-500/15', borderClass: 'border-indigo-500/30', textClass: 'text-indigo-300', dotColor: 'bg-indigo-400', popular: true },
  { name: 'LLMs & RAG', category: 'AI & Data', color: 'indigo', bgClass: 'bg-indigo-500/15', borderClass: 'border-indigo-500/30', textClass: 'text-indigo-300', dotColor: 'bg-indigo-400' },
  { name: 'LangChain', category: 'AI & Data', color: 'teal', bgClass: 'bg-teal-500/15', borderClass: 'border-teal-500/30', textClass: 'text-teal-300', dotColor: 'bg-teal-400' },
  { name: 'Computer Vision', category: 'AI & Data', color: 'fuchsia', bgClass: 'bg-fuchsia-500/15', borderClass: 'border-fuchsia-500/30', textClass: 'text-fuchsia-300', dotColor: 'bg-fuchsia-400' },
  { name: 'Data Analytics', category: 'AI & Data', color: 'emerald', bgClass: 'bg-emerald-500/15', borderClass: 'border-emerald-500/30', textClass: 'text-emerald-300', dotColor: 'bg-emerald-400' },
  { name: 'NLP', category: 'AI & Data', color: 'violet', bgClass: 'bg-violet-500/15', borderClass: 'border-violet-500/30', textClass: 'text-violet-300', dotColor: 'bg-violet-400' },

  // Design & Creative
  { name: 'UI Design', category: 'Design', color: 'pink', bgClass: 'bg-pink-500/15', borderClass: 'border-pink-500/30', textClass: 'text-pink-300', dotColor: 'bg-pink-400', popular: true },
  { name: 'UX Research', category: 'Design', color: 'rose', bgClass: 'bg-rose-500/15', borderClass: 'border-rose-500/30', textClass: 'text-rose-300', dotColor: 'bg-rose-400' },
  { name: 'Figma', category: 'Design', color: 'purple', bgClass: 'bg-purple-500/15', borderClass: 'border-purple-500/30', textClass: 'text-purple-300', dotColor: 'bg-purple-400', popular: true },
  { name: 'Framer', category: 'Design', color: 'blue', bgClass: 'bg-blue-500/15', borderClass: 'border-blue-500/30', textClass: 'text-blue-300', dotColor: 'bg-blue-400' },
  { name: 'Design Systems', category: 'Design', color: 'amber', bgClass: 'bg-amber-500/15', borderClass: 'border-amber-500/30', textClass: 'text-amber-300', dotColor: 'bg-amber-400' },
  { name: 'Blender 3D', category: 'Design', color: 'orange', bgClass: 'bg-orange-500/15', borderClass: 'border-orange-500/30', textClass: 'text-orange-300', dotColor: 'bg-orange-400' },
  { name: 'Wireframing', category: 'Design', color: 'pink', bgClass: 'bg-pink-500/15', borderClass: 'border-pink-500/30', textClass: 'text-pink-300', dotColor: 'bg-pink-400' },

  // Backend & Systems
  { name: 'Node.js', category: 'Backend', color: 'green', bgClass: 'bg-emerald-500/15', borderClass: 'border-emerald-500/30', textClass: 'text-emerald-300', dotColor: 'bg-emerald-400', popular: true },
  { name: 'Go (Golang)', category: 'Backend', color: 'cyan', bgClass: 'bg-cyan-500/15', borderClass: 'border-cyan-500/30', textClass: 'text-cyan-300', dotColor: 'bg-cyan-400', popular: true },
  { name: 'Java', category: 'Backend', color: 'orange', bgClass: 'bg-orange-500/15', borderClass: 'border-orange-500/30', textClass: 'text-orange-300', dotColor: 'bg-orange-400', popular: true },
  { name: 'Spring Boot', category: 'Backend', color: 'emerald', bgClass: 'bg-emerald-500/15', borderClass: 'border-emerald-500/30', textClass: 'text-emerald-300', dotColor: 'bg-emerald-400' },
  { name: 'C++', category: 'Backend', color: 'blue', bgClass: 'bg-blue-500/15', borderClass: 'border-blue-500/30', textClass: 'text-blue-300', dotColor: 'bg-blue-400', popular: true },
  { name: 'Rust', category: 'Backend', color: 'amber', bgClass: 'bg-amber-500/15', borderClass: 'border-amber-500/30', textClass: 'text-amber-300', dotColor: 'bg-amber-400', popular: true },
  { name: 'PostgreSQL', category: 'Backend', color: 'sky', bgClass: 'bg-sky-500/15', borderClass: 'border-sky-500/30', textClass: 'text-sky-300', dotColor: 'bg-sky-400' },
  { name: 'SQL', category: 'Backend', color: 'blue', bgClass: 'bg-blue-500/15', borderClass: 'border-blue-500/30', textClass: 'text-blue-300', dotColor: 'bg-blue-400' },
  { name: 'MongoDB', category: 'Backend', color: 'emerald', bgClass: 'bg-emerald-500/15', borderClass: 'border-emerald-500/30', textClass: 'text-emerald-300', dotColor: 'bg-emerald-400' },
  { name: 'GraphQL', category: 'Backend', color: 'pink', bgClass: 'bg-pink-500/15', borderClass: 'border-pink-500/30', textClass: 'text-pink-300', dotColor: 'bg-pink-400' },
  { name: 'FastAPI', category: 'Backend', color: 'teal', bgClass: 'bg-teal-500/15', borderClass: 'border-teal-500/30', textClass: 'text-teal-300', dotColor: 'bg-teal-400' },

  // Mobile
  { name: 'React Native', category: 'Mobile', color: 'cyan', bgClass: 'bg-cyan-500/15', borderClass: 'border-cyan-500/30', textClass: 'text-cyan-300', dotColor: 'bg-cyan-400', popular: true },
  { name: 'Flutter', category: 'Mobile', color: 'sky', bgClass: 'bg-sky-500/15', borderClass: 'border-sky-500/30', textClass: 'text-sky-300', dotColor: 'bg-sky-400', popular: true },
  { name: 'Kotlin', category: 'Mobile', color: 'purple', bgClass: 'bg-purple-500/15', borderClass: 'border-purple-500/30', textClass: 'text-purple-300', dotColor: 'bg-purple-400' },
  { name: 'Swift / iOS', category: 'Mobile', color: 'orange', bgClass: 'bg-orange-500/15', borderClass: 'border-orange-500/30', textClass: 'text-orange-300', dotColor: 'bg-orange-400' },

  // Cloud & DevOps
  { name: 'Docker', category: 'Cloud & DevOps', color: 'blue', bgClass: 'bg-blue-500/15', borderClass: 'border-blue-500/30', textClass: 'text-blue-300', dotColor: 'bg-blue-400', popular: true },
  { name: 'Kubernetes', category: 'Cloud & DevOps', color: 'indigo', bgClass: 'bg-indigo-500/15', borderClass: 'border-indigo-500/30', textClass: 'text-indigo-300', dotColor: 'bg-indigo-400' },
  { name: 'AWS', category: 'Cloud & DevOps', color: 'amber', bgClass: 'bg-amber-500/15', borderClass: 'border-amber-500/30', textClass: 'text-amber-300', dotColor: 'bg-amber-400', popular: true },
  { name: 'GCP / Cloud', category: 'Cloud & DevOps', color: 'blue', bgClass: 'bg-blue-500/15', borderClass: 'border-blue-500/30', textClass: 'text-blue-300', dotColor: 'bg-blue-400' },
  { name: 'Linux', category: 'Cloud & DevOps', color: 'yellow', bgClass: 'bg-yellow-500/15', borderClass: 'border-yellow-500/30', textClass: 'text-yellow-300', dotColor: 'bg-yellow-400' },
  { name: 'Git & GitHub', category: 'Cloud & DevOps', color: 'gray', bgClass: 'bg-gray-500/15', borderClass: 'border-gray-500/30', textClass: 'text-gray-300', dotColor: 'bg-gray-400', popular: true },

  // Security & Web3
  { name: 'Cybersecurity', category: 'Security & Web3', color: 'rose', bgClass: 'bg-rose-500/15', borderClass: 'border-rose-500/30', textClass: 'text-rose-300', dotColor: 'bg-rose-400', popular: true },
  { name: 'Ethical Hacking', category: 'Security & Web3', color: 'red', bgClass: 'bg-red-500/15', borderClass: 'border-red-500/30', textClass: 'text-red-300', dotColor: 'bg-red-400' },
  { name: 'Solidity', category: 'Security & Web3', color: 'violet', bgClass: 'bg-violet-500/15', borderClass: 'border-violet-500/30', textClass: 'text-violet-300', dotColor: 'bg-violet-400' },
  { name: 'Web3 / DeFi', category: 'Security & Web3', color: 'indigo', bgClass: 'bg-indigo-500/15', borderClass: 'border-indigo-500/30', textClass: 'text-indigo-300', dotColor: 'bg-indigo-400' },
];

export const INTEREST_DOMAINS: InterestTag[] = [
  { name: 'Hackathons & DevJams', category: 'Competition', bgClass: 'bg-emerald-500/15', borderClass: 'border-emerald-500/30', textClass: 'text-emerald-300', popular: true },
  { name: 'Open Source Contributing', category: 'Development', bgClass: 'bg-blue-500/15', borderClass: 'border-blue-500/30', textClass: 'text-blue-300', popular: true },
  { name: 'Competitive Programming', category: 'Competition', bgClass: 'bg-amber-500/15', borderClass: 'border-amber-500/30', textClass: 'text-amber-300', popular: true },
  { name: 'AI / GenAI Agents', category: 'Development', bgClass: 'bg-purple-500/15', borderClass: 'border-purple-500/30', textClass: 'text-purple-300', popular: true },
  { name: 'Startup & Side Projects', category: 'Development', bgClass: 'bg-pink-500/15', borderClass: 'border-pink-500/30', textClass: 'text-pink-300', popular: true },
  { name: 'Research Paper Publishing', category: 'Academics', bgClass: 'bg-indigo-500/15', borderClass: 'border-indigo-500/30', textClass: 'text-indigo-300', popular: true },
  { name: 'UI/UX Redesigns', category: 'Creative', bgClass: 'bg-rose-500/15', borderClass: 'border-rose-500/30', textClass: 'text-rose-300', popular: true },
  { name: 'Mentorship & Peer Learning', category: 'Career', bgClass: 'bg-teal-500/15', borderClass: 'border-teal-500/30', textClass: 'text-teal-300' },
  { name: 'Internship Prep & LeetCode', category: 'Career', bgClass: 'bg-amber-500/15', borderClass: 'border-amber-500/30', textClass: 'text-amber-300', popular: true },
  { name: 'Robotics & IoT', category: 'Development', bgClass: 'bg-cyan-500/15', borderClass: 'border-cyan-500/30', textClass: 'text-cyan-300' },
  { name: 'Web3 & Decentralized Apps', category: 'Development', bgClass: 'bg-violet-500/15', borderClass: 'border-violet-500/30', textClass: 'text-violet-300' },
  { name: 'Game Development', category: 'Creative', bgClass: 'bg-fuchsia-500/15', borderClass: 'border-fuchsia-500/30', textClass: 'text-fuchsia-300' },
];

export const DOMAIN_CATEGORIES = [
  'All',
  'Frontend',
  'AI & Data',
  'Design',
  'Backend',
  'Mobile',
  'Cloud & DevOps',
  'Security & Web3',
] as const;

export type DomainCategory = typeof DOMAIN_CATEGORIES[number];

/**
 * Returns matching domain metadata or auto-generates consistent stylish styling
 * for arbitrary or custom skill tags entered by the user.
 */
export function getDomainMeta(skillName: string): DomainTag {
  const normalized = skillName.trim().toLowerCase();
  
  const found = TECHNICAL_DOMAINS.find(d => 
    d.name.toLowerCase() === normalized || 
    normalized.includes(d.name.toLowerCase()) || 
    d.name.toLowerCase().includes(normalized)
  );

  if (found) return found;

  // Domain categorization fallbacks based on keyword matches
  if (/react|vue|front|web|html|css|svelte|angular|tailwind|bootstrap|next|nuxt/i.test(normalized)) {
    return {
      name: skillName,
      category: 'Frontend',
      color: 'cyan',
      bgClass: 'bg-cyan-500/15',
      borderClass: 'border-cyan-500/30',
      textClass: 'text-cyan-300',
      dotColor: 'bg-cyan-400',
    };
  }

  if (/python|ai|ml|data|torch|tensor|deep|learn|vision|nlp|nlp|rag|llm|hugging/i.test(normalized)) {
    return {
      name: skillName,
      category: 'AI & Data',
      color: 'amber',
      bgClass: 'bg-amber-500/15',
      borderClass: 'border-amber-500/30',
      textClass: 'text-amber-300',
      dotColor: 'bg-amber-400',
    };
  }

  if (/design|ui|ux|figma|framer|adobe|xd|sketch|3d|blend|render|graphic/i.test(normalized)) {
    return {
      name: skillName,
      category: 'Design',
      color: 'pink',
      bgClass: 'bg-pink-500/15',
      borderClass: 'border-pink-500/30',
      textClass: 'text-pink-300',
      dotColor: 'bg-pink-400',
    };
  }

  if (/node|back|api|sql|mongo|postgre|db|server|java|spring|c\+\+|rust|golang|go|express/i.test(normalized)) {
    return {
      name: skillName,
      category: 'Backend',
      color: 'green',
      bgClass: 'bg-emerald-500/15',
      borderClass: 'border-emerald-500/30',
      textClass: 'text-emerald-300',
      dotColor: 'bg-emerald-400',
    };
  }

  if (/mobile|android|ios|swift|flutter|kotlin|app/i.test(normalized)) {
    return {
      name: skillName,
      category: 'Mobile',
      color: 'sky',
      bgClass: 'bg-sky-500/15',
      borderClass: 'border-sky-500/30',
      textClass: 'text-sky-300',
      dotColor: 'bg-sky-400',
    };
  }

  if (/cloud|docker|k8s|aws|azure|gcp|devops|linux|ci|cd/i.test(normalized)) {
    return {
      name: skillName,
      category: 'Cloud & DevOps',
      color: 'blue',
      bgClass: 'bg-blue-500/15',
      borderClass: 'border-blue-500/30',
      textClass: 'text-blue-300',
      dotColor: 'bg-blue-400',
    };
  }

  if (/security|crypto|hack|ctf|block|solidity|web3/i.test(normalized)) {
    return {
      name: skillName,
      category: 'Security & Web3',
      color: 'rose',
      bgClass: 'bg-rose-500/15',
      borderClass: 'border-rose-500/30',
      textClass: 'text-rose-300',
      dotColor: 'bg-rose-400',
    };
  }

  // Default vibrant badge for custom technical skills
  return {
    name: skillName,
    category: 'Backend',
    color: 'blue',
    bgClass: 'bg-white/10',
    borderClass: 'border-white/15',
    textClass: 'text-gray-200',
    dotColor: 'bg-brand-blue',
  };
}

export function getInterestMeta(interestName: string): InterestTag {
  const normalized = interestName.trim().toLowerCase();
  const found = INTEREST_DOMAINS.find(i => 
    i.name.toLowerCase() === normalized ||
    normalized.includes(i.name.toLowerCase()) ||
    i.name.toLowerCase().includes(normalized)
  );

  if (found) return found;

  return {
    name: interestName,
    category: 'Development',
    bgClass: 'bg-emerald-500/10',
    borderClass: 'border-emerald-500/25',
    textClass: 'text-emerald-300',
  };
}
