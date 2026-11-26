export interface ProjectTeamMember {
  name: string;
  role?: string;
  branch?: string;
  avatarUrl?: string;
  userId?: string;
  peerId?: string;
  githubUsername?: string;
}

export interface CampusProject {
  id: string;
  title: string;
  tagline?: string;
  description: string;
  technologies: string[];
  teamMembers: ProjectTeamMember[];
  category: string;
  status: 'Active' | 'Recruiting' | 'Hackathon Finalist' | 'Published' | 'Open Source';
  lookingFor?: string[];
  keywords: string[];
  stars?: number;
  forks?: number;
  repoUrl?: string;
  demoUrl?: string;
  milestone?: string;
  avatarUrl?: string;
  createdAt?: string;
}

export const CAMPUS_PROJECTS: CampusProject[] = [
  {
    id: 'proj_campuspulse',
    title: 'CampusPulse',
    tagline: 'Real-time anonymous Q&A and interactive student polling during campus symposiums',
    description: 'Real-time anonymous Q&A board and interactive live-poll system for college students during tech symposiums, hackathons, and guest lectures. Features live sentiment tracking and automated moderation.',
    technologies: ['React', 'Node.js', 'Redis', 'Tailwind CSS', 'WebSockets', 'TypeScript'],
    teamMembers: [
      {
        name: 'Vikram Singh',
        role: 'Lead Full-Stack',
        branch: 'CSE Core (3rd Year)',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=VikramSingh',
        peerId: 'vit_peer_1',
        githubUsername: 'vikram-codes'
      },
      {
        name: 'Sneha Reddy',
        role: 'Backend & Caching',
        branch: 'AI & Data Science (3rd Year)',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SnehaReddy',
        peerId: 'vit_peer_2',
        githubUsername: 'sneha-ai'
      }
    ],
    category: 'Web & Collaboration',
    status: 'Recruiting',
    lookingFor: ['UI/UX Designer', 'Redis Performance Tester'],
    keywords: ['q&a', 'polling', 'symposium', 'anonymous', 'live board', 'realtime', 'websockets', 'campus', 'forum', 'moderation', 'questions'],
    stars: 42,
    forks: 9,
    repoUrl: 'https://github.com/vit-devs/campuspulse',
    demoUrl: 'https://campuspulse.vit.ac.in',
    milestone: 'v1.2 Released · 500+ active users at DevJams'
  },
  {
    id: 'proj_docuquery',
    title: 'DocuQuery AI',
    tagline: 'Interactive multi-document RAG system with zero hallucinations for academic research',
    description: 'Interactive multi-document retrieval-augmented generation (RAG) system with zero hallucinations for engineering research papers, syllabi, and IEEE references. Uses vector similarity search with hybrid keyword retrieval.',
    technologies: ['Python', 'LangChain', 'FAISS', 'FastAPI', 'PyTorch', 'HuggingFace', 'Docker'],
    teamMembers: [
      {
        name: 'Sneha Reddy',
        role: 'ML Engineer & Lead',
        branch: 'AI & Data Science (3rd Year)',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SnehaReddy',
        peerId: 'vit_peer_2',
        githubUsername: 'sneha-ai'
      },
      {
        name: 'Vikram Singh',
        role: 'FastAPI Architect',
        branch: 'CSE Core (3rd Year)',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=VikramSingh',
        peerId: 'vit_peer_1',
        githubUsername: 'vikram-codes'
      }
    ],
    category: 'AI / Machine Learning',
    status: 'Recruiting',
    lookingFor: ['Research Paper Co-author', 'Frontend UI Engineer'],
    keywords: ['rag', 'llm', 'retrieval', 'vector database', 'faiss', 'langchain', 'zero hallucination', 'research papers', 'ieee', 'nlp', 'generative ai', 'documents'],
    stars: 68,
    forks: 14,
    repoUrl: 'https://github.com/sneha-ai/docuquery-rag',
    demoUrl: 'https://docuquery.preview.dev',
    milestone: 'Accepted for IEEE Student Research Track 2026'
  },
  {
    id: 'proj_vsphere',
    title: 'V-Sphere 3D Campus Tour',
    tagline: 'Interactive 3D virtual tour of VIT Chennai campus with custom GLSL shaders',
    description: 'Photorealistic, interactive 3D virtual tour of the VIT Chennai campus with custom GLSL shaders, camera waypoints, and real-time landmark pins across Delta, Academic Blocks, and sports arena.',
    technologies: ['Three.js', 'WebGL', 'GLSL', 'React', 'Tailwind CSS', 'Blender', 'TypeScript'],
    teamMembers: [
      {
        name: 'Rohan Verma',
        role: 'Product Designer & 3D Dev',
        branch: 'Information Technology (2nd Year)',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=RohanVerma',
        peerId: 'vit_peer_3',
        githubUsername: 'rohan-designs'
      }
    ],
    category: '3D & Creative Web',
    status: 'Recruiting',
    lookingFor: ['Three.js Shader Specialist', 'Blender 3D Asset Artist'],
    keywords: ['3d', 'threejs', 'webgl', 'virtual tour', 'campus', 'shaders', 'digital twin', 'delta block', 'ab1', 'ab2', 'blender', 'interactive'],
    stars: 95,
    forks: 22,
    repoUrl: 'https://github.com/rohan-designs/vsphere-3d',
    demoUrl: 'https://vsphere.vit.ac.in',
    milestone: 'GDG Showcase Project 2025'
  },
  {
    id: 'proj_rustypacket',
    title: 'RustyPacket Sniffer',
    tagline: 'High-speed packet sniffer and anomalies detector written in pure Rust',
    description: 'High-speed packet sniffer and network anomalies detector written in pure Rust with zero memory overhead. Analyzes PCAP streams, flags abnormal DNS exfiltration, and exports metrics to Prometheus.',
    technologies: ['Rust', 'Linux', 'pcap', 'Wireshark', 'Docker', 'C++', 'Systems'],
    teamMembers: [
      {
        name: 'Aisha Khan',
        role: 'Security Researcher & Lead',
        branch: 'CSE (Cyber Security) (4th Year)',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AishaKhan',
        peerId: 'vit_peer_4',
        githubUsername: 'aisha-sec'
      },
      {
        name: 'Aditya Nair',
        role: 'Hardware & Protocol Advisor',
        branch: 'ECE (Electronics) (3rd Year)',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AdityaNair',
        peerId: 'vit_peer_5',
        githubUsername: 'aditya-iot'
      }
    ],
    category: 'Cybersecurity & Systems',
    status: 'Active',
    lookingFor: ['Offensive Security Tester', 'Rust Core Contributor'],
    keywords: ['cybersecurity', 'rust', 'packet sniffer', 'pcap', 'firewall', 'intrusion detection', 'network', 'ctf', 'security', 'dns', 'linux', 'wireshark'],
    stars: 114,
    forks: 29,
    repoUrl: 'https://github.com/aisha-sec/rustypacket',
    milestone: 'Ranked Top 50 in CSAW CTF Tool Showcase'
  },
  {
    id: 'proj_agrisense',
    title: 'AgriSense Drone',
    tagline: 'Autonomous multispectral crop stress inspection drone platform',
    description: 'Autonomous multispectral crop stress inspection drone platform built for Smart India Hackathon. Combines edge computer vision on ESP32/Jetson with LoRa long-range telemetry to detect crop diseases.',
    technologies: ['ESP32', 'ROS2', 'LoRa', 'Python', 'C++', 'Hardware Prototyping', 'OpenCV'],
    teamMembers: [
      {
        name: 'Aditya Nair',
        role: 'Embedded Systems & IoT Lead',
        branch: 'ECE (Electronics) (3rd Year)',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AdityaNair',
        peerId: 'vit_peer_5',
        githubUsername: 'aditya-iot'
      },
      {
        name: 'Pooja Iyer',
        role: 'Robotics Perception Lead',
        branch: 'Mechanical & Robotics (3rd Year)',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=PoojaIyer',
        peerId: 'vit_peer_8',
        githubUsername: 'pooja-robotics'
      }
    ],
    category: 'Robotics & Hardware',
    status: 'Hackathon Finalist',
    lookingFor: ['Computer Vision Specialist', 'Flight Dynamics Pilot'],
    keywords: ['drone', 'autonomous', 'esp32', 'ros', 'crop inspection', 'smart agriculture', 'hardware', 'iot', 'lora', 'robotics', 'sih', 'smart india hackathon'],
    stars: 78,
    forks: 18,
    repoUrl: 'https://github.com/vit-robotics/agrisense-drone',
    milestone: 'Smart India Hackathon Finalist'
  },
  {
    id: 'proj_studysync',
    title: 'StudySync',
    tagline: 'Real-time Pomodoro and collaborative virtual study rooms with 1,200+ active students',
    description: 'Cross-platform mobile app featuring synced Pomodoro study rooms, ambient campus background sounds, shared task checklists, and streak leaderboards for VIT exam preparation.',
    technologies: ['Flutter', 'Dart', 'Firebase', 'State Management (Bloc)', 'REST APIs', 'Cloud Functions'],
    teamMembers: [
      {
        name: 'Ananya Sharma',
        role: 'Mobile Dev & Lead',
        branch: 'CSE Core (2nd Year)',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AnanyaSharma',
        peerId: 'vit_peer_6',
        githubUsername: 'ananya-dev'
      },
      {
        name: 'Sneha Reddy',
        role: 'Cloud Data Sync',
        branch: 'AI & Data Science (3rd Year)',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SnehaReddy',
        peerId: 'vit_peer_2',
        githubUsername: 'sneha-ai'
      }
    ],
    category: 'Mobile Applications',
    status: 'Published',
    lookingFor: ['Backend Microservices Dev', 'UI/UX Polish'],
    keywords: ['flutter', 'mobile app', 'pomodoro', 'study rooms', 'virtual study', 'productivity', 'timer', 'exams', 'collaboration', 'students', 'dart'],
    stars: 132,
    forks: 31,
    repoUrl: 'https://github.com/ananya-dev/studysync',
    demoUrl: 'https://studysync-vit.web.app',
    milestone: '1,200+ Active Students on Campus'
  },
  {
    id: 'proj_zkcampusid',
    title: 'ZK-CampusID',
    tagline: 'Zero-knowledge credential verification proof for student discounts without leaking identity',
    description: 'Zero-knowledge cryptographic protocol enabling students to prove valid college enrollment for discounts, voting, and library access without disclosing their registration number, name, or GPA.',
    technologies: ['Solidity', 'Circom', 'Next.js', 'Web3', 'Ethereum', 'Hardhat', 'TypeScript', 'Rust'],
    teamMembers: [
      {
        name: 'Karthik Balaji',
        role: 'Smart Contract Dev & Lead',
        branch: 'CSE (Blockchains) (4th Year)',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=KarthikBalaji',
        peerId: 'vit_peer_7',
        githubUsername: 'karthik-balaji-eth'
      },
      {
        name: 'Rohan Verma',
        role: 'Web3 UX Designer',
        branch: 'Information Technology (2nd Year)',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=RohanVerma',
        peerId: 'vit_peer_3',
        githubUsername: 'rohan-designs'
      }
    ],
    category: 'Web3 & Cryptography',
    status: 'Hackathon Finalist',
    lookingFor: ['Circom / ZK-SNARKs Auditor', 'Next.js Frontend Contributor'],
    keywords: ['solidity', 'zk', 'zero-knowledge', 'blockchain', 'ethereum', 'web3', 'identity', 'privacy', 'circom', 'student id', 'discounts', 'smart contracts'],
    stars: 87,
    forks: 16,
    repoUrl: 'https://github.com/karthik-balaji-eth/zk-campusid',
    milestone: 'ETHIndia Finalist Project'
  },
  {
    id: 'proj_roverslam',
    title: 'RoverSLAM Autonomous Navigation',
    tagline: 'Visual SLAM mapping and waypoint navigation in GPS-denied environments',
    description: 'Visual SLAM mapping and autonomous waypoint navigation in GPS-denied environments built for the University Rover Challenge. Integrates RTAB-Map, stereo vision depth cameras, and obstacle avoidance.',
    technologies: ['ROS', 'Python', 'OpenCV', 'C++', 'RTAB-Map', 'Gazebo', 'Linux'],
    teamMembers: [
      {
        name: 'Pooja Iyer',
        role: 'Robotics Perception Lead',
        branch: 'Mechanical & Robotics (3rd Year)',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=PoojaIyer',
        peerId: 'vit_peer_8',
        githubUsername: 'pooja-robotics'
      },
      {
        name: 'Aditya Nair',
        role: 'Sensor Fusion Contributor',
        branch: 'ECE (Electronics) (3rd Year)',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AdityaNair',
        peerId: 'vit_peer_5',
        githubUsername: 'aditya-iot'
      }
    ],
    category: 'Robotics & AI',
    status: 'Active',
    lookingFor: ['Deep Learning Perception Researcher', 'Gazebo Simulation Engineer'],
    keywords: ['slam', 'ros', 'robotics', 'autonomous', 'rover', 'point cloud', 'lidar', 'opencv', 'navigation', 'stereo vision', 'mapping', 'path planning'],
    stars: 105,
    forks: 26,
    repoUrl: 'https://github.com/pooja-robotics/rover-slam',
    milestone: 'Selected for University Rover Challenge 2026'
  },
  {
    id: 'proj_campuscopilot',
    title: 'Campus Copilot VIT',
    tagline: 'Offline timetables sync, automated classroom wayfinding across AB-1 to AB-3, and attendance alerts',
    description: 'Mobile campus companion providing offline timetable sync, automated classroom wayfinding, teacher venue alerts, and smart notifications before each lecture starts.',
    technologies: ['React Native', 'TypeScript', 'FastAPI', 'SQLite', 'Python', 'Tailwind CSS'],
    teamMembers: [
      {
        name: 'Vikram Singh',
        role: 'Lead Architect',
        branch: 'CSE Core (3rd Year)',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=VikramSingh',
        peerId: 'vit_peer_1',
        githubUsername: 'vikram-codes'
      },
      {
        name: 'Ananya Sharma',
        role: 'Mobile UI Dev',
        branch: 'CSE Core (2nd Year)',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AnanyaSharma',
        peerId: 'vit_peer_6',
        githubUsername: 'ananya-dev'
      }
    ],
    category: 'Mobile & Campus Tools',
    status: 'Recruiting',
    lookingFor: ['1 React Native developer for iOS widgets', 'Campus Map Digitizer'],
    keywords: ['timetables', 'classroom', 'wayfinding', 'offline', 'attendance', 'react native', 'fastapi', 'ab1', 'ab2', 'ab3', 'campus navigation', 'schedule'],
    stars: 54,
    forks: 11,
    repoUrl: 'https://github.com/vit-devs/campus-copilot',
    milestone: 'v1.4 Shipped with offline sync'
  },
  {
    id: 'proj_attendance_matrix',
    title: 'VIT Attendance Matrix API',
    tagline: 'Zero-trust encrypted API that calculates exact attendance thresholds before debarment',
    description: 'Calculates exact number of permissible leaves, multi-slot lab combinations, and holiday projections to guarantee students stay safely above the mandatory 75% threshold.',
    technologies: ['Python', 'Docker', 'Redis', 'Tailwind CSS', 'FastAPI'],
    teamMembers: [
      {
        name: 'Ananya Sharma',
        role: 'Backend Lead',
        branch: 'CSE Core (2nd Year)',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AnanyaSharma',
        peerId: 'vit_peer_6',
        githubUsername: 'ananya-dev'
      },
      {
        name: 'Vikram Singh',
        role: 'DevOps & Redis Cache',
        branch: 'CSE Core (3rd Year)',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=VikramSingh',
        peerId: 'vit_peer_1',
        githubUsername: 'vikram-codes'
      }
    ],
    category: 'Developer Tools',
    status: 'Active',
    lookingFor: ['Frontend Dashboard Developer'],
    keywords: ['attendance', 'threshold', 'debarment', 'calculator', 'leaves', '75 percent', 'lab slots', 'fastapi', 'python', 'vtop'],
    stars: 61,
    forks: 15,
    repoUrl: 'https://github.com/ananya-vit/attendance-matrix',
    milestone: 'Processed 5,000+ student projections'
  },
  {
    id: 'proj_vtop_api',
    title: 'VTOP Automation API',
    tagline: 'Reverse-engineered student portal API for grade syncing and attendance monitoring',
    description: 'Reverse-engineered high-reliability API for VIT student portal synchronization, attendance updates, course registration alerts, and digital ID card validation with session keepalive.',
    technologies: ['TypeScript', 'Node.js', 'Express', 'Puppeteer', 'PostgreSQL', 'Docker'],
    teamMembers: [
      {
        name: 'Karthik Balaji',
        role: 'Reverse Engineering Lead',
        branch: 'CSE (Blockchains) (4th Year)',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=KarthikBalaji',
        peerId: 'vit_peer_7',
        githubUsername: 'karthik-balaji-eth'
      },
      {
        name: 'Vikram Singh',
        role: 'API Maintainer',
        branch: 'CSE Core (3rd Year)',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=VikramSingh',
        peerId: 'vit_peer_1',
        githubUsername: 'vikram-codes'
      }
    ],
    category: 'Developer APIs',
    status: 'Open Source',
    lookingFor: ['SDK Maintainers for Kotlin & Swift', 'Security Auditor'],
    keywords: ['vtop', 'portal', 'api', 'automation', 'puppeteer', 'grades', 'attendance', 'scraper', 'typescript', 'captcha solver'],
    stars: 124,
    forks: 38,
    repoUrl: 'https://github.com/manchikanti/vtop-automation-api',
    milestone: 'Over 120 GitHub stars'
  },
  {
    id: 'proj_campus_navigator',
    title: 'Campus Navigator AI',
    tagline: 'Indoor campus localization and navigation using AR markers and Bluetooth beacons',
    description: 'Indoor campus localization and augmented reality navigation using camera-based AR markers and low-energy Bluetooth beacons for accessible routing across multi-floor academic buildings.',
    technologies: ['Python', 'PyTorch', 'Computer Vision', 'ARKit', 'Bluetooth Beacons', 'OpenCV'],
    teamMembers: [
      {
        name: 'Sneha Reddy',
        role: 'Computer Vision Lead',
        branch: 'AI & Data Science (3rd Year)',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SnehaReddy',
        peerId: 'vit_peer_2',
        githubUsername: 'sneha-ai'
      },
      {
        name: 'Rohan Verma',
        role: 'AR UI/UX Lead',
        branch: 'Information Technology (2nd Year)',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=RohanVerma',
        peerId: 'vit_peer_3',
        githubUsername: 'rohan-designs'
      },
      {
        name: 'Aditya Nair',
        role: 'Beacon Hardware Telemetry',
        branch: 'ECE (Electronics) (3rd Year)',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AdityaNair',
        peerId: 'vit_peer_5',
        githubUsername: 'aditya-iot'
      }
    ],
    category: 'AI & AR Navigation',
    status: 'Active',
    lookingFor: ['Unity / AR Developer', 'Hardware Tester'],
    keywords: ['indoor navigation', 'ar', 'augmented reality', 'bluetooth beacons', 'localization', 'accessibility', 'computer vision', 'opencv', 'arkit', 'routing'],
    stars: 89,
    forks: 20,
    repoUrl: 'https://github.com/vit-devs/campus-navigator-ai',
    milestone: 'Deployed pilot test in AB-1 floor 3'
  },
  {
    id: 'proj_gocache',
    title: 'GoCache Distributed Store',
    tagline: 'In-memory distributed key-value store with LRU eviction and Raft consensus',
    description: 'High-throughput in-memory distributed key-value store with LRU eviction, Raft consensus algorithm, and gRPC communication for distributed systems education and benchmarks.',
    technologies: ['Golang', 'Distributed Systems', 'Raft', 'gRPC', 'Docker', 'Linux'],
    teamMembers: [
      {
        name: 'Vikram Singh',
        role: 'Systems Engineer',
        branch: 'CSE Core (3rd Year)',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=VikramSingh',
        peerId: 'vit_peer_1',
        githubUsername: 'vikram-codes'
      }
    ],
    category: 'Systems & Cloud',
    status: 'Open Source',
    lookingFor: ['Go benchmarking contributor'],
    keywords: ['golang', 'go', 'distributed systems', 'cache', 'key-value', 'raft', 'consensus', 'grpc', 'lru', 'redis alternative'],
    stars: 33,
    forks: 7,
    repoUrl: 'https://github.com/vikram-codes/gocache',
    milestone: 'Sub-millisecond P99 latency benchmark'
  },
  {
    id: 'proj_skinlesion',
    title: 'SkinLesionDetect AI',
    tagline: 'Medical imaging classifier with 94.2% validation accuracy on ISIC dataset',
    description: 'Medical imaging classifier with 94.2% validation accuracy on ISIC dataset for early dermatology triage. Employs ResNet50 with attention heads and grad-CAM interpretability.',
    technologies: ['PyTorch', 'ResNet50', 'Python', 'FastAPI', 'OpenCV', 'Docker'],
    teamMembers: [
      {
        name: 'Sneha Reddy',
        role: 'ML Researcher & Lead',
        branch: 'AI & Data Science (3rd Year)',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SnehaReddy',
        peerId: 'vit_peer_2',
        githubUsername: 'sneha-ai'
      }
    ],
    category: 'Healthcare & AI',
    status: 'Active',
    lookingFor: ['Clinical validation advisor', 'FastAPI UI Dev'],
    keywords: ['medical imaging', 'pytorch', 'deep learning', 'dermatology', 'skin lesion', 'resnet', 'computer vision', 'healthcare', 'grad-cam', 'cancer detection'],
    stars: 47,
    forks: 12,
    repoUrl: 'https://github.com/sneha-ai/skin-lesion-detect',
    milestone: '94.2% Accuracy on ISIC test split'
  }
];

export interface ProjectSearchResult {
  project: CampusProject;
  matchReasons: {
    type: 'keyword' | 'technology' | 'teamMember';
    label: string;
    detail: string;
  }[];
  score: number;
}

/**
 * Searches projects by keywords, technologies, or team member names
 */
export function searchProjects(
  query: string,
  projectsList: CampusProject[] = CAMPUS_PROJECTS,
  filterType: 'all' | 'keyword' | 'technology' | 'teamMember' = 'all'
): ProjectSearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const results: ProjectSearchResult[] = [];

  for (const proj of projectsList) {
    const reasons: { type: 'keyword' | 'technology' | 'teamMember'; label: string; detail: string }[] = [];
    let score = 0;

    // 1. Search by Technologies
    if (filterType === 'all' || filterType === 'technology') {
      for (const tech of proj.technologies) {
        const lowerTech = tech.toLowerCase();
        if (lowerTech === q) {
          reasons.push({ type: 'technology', label: `Tech: ${tech}`, detail: `Exact technology match` });
          score += 100;
        } else if (lowerTech.includes(q)) {
          reasons.push({ type: 'technology', label: `Tech: ${tech}`, detail: `Technology contains "${q}"` });
          score += 60;
        }
      }
    }

    // 2. Search by Team Member Names
    if (filterType === 'all' || filterType === 'teamMember') {
      for (const member of proj.teamMembers) {
        const lowerName = member.name.toLowerCase();
        const lowerRole = (member.role || '').toLowerCase();
        if (lowerName.includes(q)) {
          reasons.push({
            type: 'teamMember',
            label: `Team Member: ${member.name}`,
            detail: `${member.role || 'Member'} (${member.branch || 'VIT'})`
          });
          score += 80;
        } else if (lowerRole.includes(q)) {
          reasons.push({
            type: 'teamMember',
            label: `Role: ${member.role}`,
            detail: `${member.name}`
          });
          score += 40;
        }
      }
    }

    // 3. Search by Keywords (Title, Description, Keywords array, Category, LookingFor)
    if (filterType === 'all' || filterType === 'keyword') {
      const lowerTitle = proj.title.toLowerCase();
      const lowerDesc = proj.description.toLowerCase();
      const lowerCategory = proj.category.toLowerCase();

      if (lowerTitle === q) {
        reasons.push({ type: 'keyword', label: `Title: ${proj.title}`, detail: 'Exact title match' });
        score += 90;
      } else if (lowerTitle.includes(q)) {
        reasons.push({ type: 'keyword', label: `Title: ${proj.title}`, detail: 'Project title keyword match' });
        score += 70;
      }

      if (lowerCategory.includes(q)) {
        reasons.push({ type: 'keyword', label: `Category: ${proj.category}`, detail: 'Domain category match' });
        score += 35;
      }

      // Check keywords list
      for (const kw of proj.keywords) {
        const lowerKw = kw.toLowerCase();
        if (lowerKw === q) {
          reasons.push({ type: 'keyword', label: `Keyword: ${kw}`, detail: 'Key topic match' });
          score += 50;
        } else if (lowerKw.includes(q)) {
          reasons.push({ type: 'keyword', label: `Keyword: ${kw}`, detail: 'Topic keyword match' });
          score += 30;
        }
      }

      // Check lookingFor roles
      if (proj.lookingFor) {
        for (const role of proj.lookingFor) {
          if (role.toLowerCase().includes(q)) {
            reasons.push({ type: 'keyword', label: `Looking For: ${role}`, detail: 'Open team role match' });
            score += 45;
          }
        }
      }

      // Check description text
      if (lowerDesc.includes(q) && !reasons.some(r => r.type === 'keyword')) {
        reasons.push({ type: 'keyword', label: 'Keyword Match', detail: `Found in project description` });
        score += 25;
      }
    }

    if (score > 0) {
      results.push({
        project: proj,
        matchReasons: reasons,
        score
      });
    }
  }

  // Sort descending by relevance score
  return results.sort((a, b) => b.score - a.score);
}
