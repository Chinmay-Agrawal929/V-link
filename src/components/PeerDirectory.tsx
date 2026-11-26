import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  X, 
  Filter, 
  Send, 
  UserPlus, 
  Clock, 
  Check, 
  ThumbsUp, 
  Sparkles, 
  Users, 
  GraduationCap, 
  BookOpen, 
  Briefcase, 
  Github, 
  ChevronRight, 
  SlidersHorizontal,
  Flame,
  RotateCcw,
  Edit3,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store';
import { auth, db } from '@/lib/firebase';
import { collection, doc, getDoc, updateDoc, getDocs, query, limit, where, addDoc, serverTimestamp } from 'firebase/firestore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PeerProfileModal, { PeerStudent } from './PeerProfileModal';
import EditNetworkingProfileModal from './EditNetworkingProfileModal';

// Rich default student peers from VIT Chennai across departments, skill sets, and interests
export const CURATED_VIT_PEERS: PeerStudent[] = [
  {
    id: 'vit_peer_1',
    name: 'Vikram Singh',
    role: 'Student',
    branch: 'CSE Core',
    year: '3rd Year',
    graduationYear: '2026',
    regNo: '22BCE1402',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=VikramSingh',
    headline: 'Full-Stack Developer · React, Node.js, Go · Building for DevJams',
    about: 'Competitive programmer and full-stack engineer. Won 2nd place in DevJams 2025. Currently building high-performance APIs in Go and exploring distributed systems.',
    skills: ['React', 'Node.js', 'Go', 'TypeScript', 'PostgreSQL', 'Docker', 'GraphQL'],
    interests: ['Hackathons', 'Open Source', 'DevJams', 'Competitive Programming', 'System Design'],
    collaborationStatus: 'Looking for Hackathon Team',
    githubConnected: true,
    githubUsername: 'vikram-codes',
    projects: [
      { title: 'CampusPulse', tech: 'React, Node.js, Redis', description: 'Real-time anonymous Q&A board for college students during tech symposiums.' },
      { title: 'GoCache', tech: 'Golang', description: 'In-memory distributed key-value store with LRU eviction.' }
    ],
    certifications: ['AWS Cloud Practitioner', 'LeetCode 100 Days Badge'],
    skillEndorsements: {
      'React': ['u1', 'u2', 'u3', 'u4'],
      'Go': ['u1', 'u2'],
      'Node.js': ['u1', 'u3']
    },
    isOnline: true
  },
  {
    id: 'vit_peer_2',
    name: 'Sneha Reddy',
    role: 'Student',
    branch: 'AI & Data Science',
    year: '3rd Year',
    graduationYear: '2026',
    regNo: '22BAI1088',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SnehaReddy',
    headline: 'ML Engineer & Researcher · PyTorch, LLMs, Computer Vision · Seeking paper co-author',
    about: 'Passionate about Generative AI, RAG architectures, and multimodal perception. Looking for peers interested in publishing research in IEEE conferences or building AI agents.',
    skills: ['Python', 'Machine Learning', 'PyTorch', 'TensorFlow', 'FastAPI', 'HuggingFace', 'LangChain'],
    interests: ['AI / GenAI', 'Research Papers', 'Hackathons', 'Kaggle', 'Computer Vision'],
    collaborationStatus: 'Seeking Project Partner',
    githubConnected: true,
    githubUsername: 'sneha-ai',
    projects: [
      { title: 'DocuQuery AI', tech: 'Python, LangChain, FAISS', description: 'Interactive multi-document retrieval augmented generation system with zero hallucinations.' },
      { title: 'SkinLesionDetect', tech: 'PyTorch, ResNet50', description: 'Medical imaging classifier with 94.2% validation accuracy on ISIC dataset.' }
    ],
    certifications: ['DeepLearning.AI TensorFlow Specialization', 'Kaggle Competition Expert'],
    skillEndorsements: {
      'Python': ['u1', 'u2', 'u5'],
      'Machine Learning': ['u1', 'u3', 'u4', 'u5'],
      'PyTorch': ['u2', 'u4']
    },
    isOnline: true
  },
  {
    id: 'vit_peer_3',
    name: 'Rohan Verma',
    role: 'Student',
    branch: 'Information Technology',
    year: '2nd Year',
    graduationYear: '2027',
    regNo: '23BIT1045',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=RohanVerma',
    headline: 'Product Designer & Frontend Dev · Figma, Three.js, Tailwind · UI/UX Lead at GDG',
    about: 'I bridge the gap between design systems and pixel-perfect web animations. Love Three.js shader experiments and fluid mobile experiences.',
    skills: ['Figma', 'UI/UX', 'Three.js', 'React', 'Tailwind CSS', 'Framer Motion', 'Blender'],
    interests: ['UI/UX Design', 'Hackathons', 'Creative Coding', 'Design Systems', 'App Development'],
    collaborationStatus: 'Looking for Hackathon Team',
    githubConnected: true,
    githubUsername: 'rohan-designs',
    projects: [
      { title: 'V-Sphere 3D', tech: 'Three.js, GLSL, WebGL', description: 'Interactive 3D virtual tour of the VIT Chennai campus.' }
    ],
    certifications: ['Google UX Design Professional Certificate'],
    skillEndorsements: {
      'Figma': ['u1', 'u2', 'u3', 'u6'],
      'UI/UX': ['u2', 'u4', 'u5'],
      'Three.js': ['u1', 'u5']
    },
    isOnline: false
  },
  {
    id: 'vit_peer_4',
    name: 'Aisha Khan',
    role: 'Student',
    branch: 'CSE (Cyber Security)',
    year: '4th Year',
    graduationYear: '2025',
    regNo: '21BCE1984',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AishaKhan',
    headline: 'Security Researcher · Penetration Testing, Linux, Rust, Cloud Security',
    about: 'Capture The Flag (CTF) competitor and offensive security enthusiast. Placed top 50 in CSAW CTF. Open to mentoring juniors in Linux internals and web pentesting.',
    skills: ['Cybersecurity', 'Rust', 'Linux', 'Python', 'Docker', 'Wireshark', 'Burp Suite', 'C++'],
    interests: ['Cybersecurity', 'CTFs', 'Open Source', 'Available to Mentor', 'Systems Programming'],
    collaborationStatus: 'Available to Mentor',
    githubConnected: true,
    githubUsername: 'aisha-sec',
    projects: [
      { title: 'RustyPacket', tech: 'Rust, pcap', description: 'High-speed packet sniffer and anomalies detector written in pure Rust.' }
    ],
    certifications: ['Certified Ethical Hacker (CEH)', 'eJPTv2'],
    skillEndorsements: {
      'Cybersecurity': ['u1', 'u2', 'u3', 'u4', 'u7'],
      'Rust': ['u1', 'u3'],
      'Linux': ['u2', 'u4', 'u5']
    },
    isOnline: true
  },
  {
    id: 'vit_peer_5',
    name: 'Aditya Nair',
    role: 'Student',
    branch: 'ECE (Electronics)',
    year: '3rd Year',
    graduationYear: '2026',
    regNo: '22BEC1120',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AdityaNair',
    headline: 'Embedded Systems & IoT Developer · ESP32, ROS, C++, Hardware Prototyping',
    about: 'Hardware hacker bridging microcontroller firmware with real-time web dashboards. Building autonomous drones and smart agricultural robotics for Smart India Hackathon.',
    skills: ['C++', 'IoT', 'Embedded Systems', 'Python', 'ROS', 'MQTT', 'Hardware Prototyping'],
    interests: ['Robotics & IoT', 'Hackathons', 'Hardware Prototyping', 'Smart India Hackathon'],
    collaborationStatus: 'Looking for Hackathon Team',
    githubConnected: false,
    projects: [
      { title: 'AgriSense Drone', tech: 'ESP32, ROS2, LoRa', description: 'Autonomous multispectral crop stress inspection drone platform.' }
    ],
    certifications: ['Arm Cortex Microcontroller Specialization'],
    skillEndorsements: {
      'C++': ['u1', 'u2'],
      'IoT': ['u1', 'u3', 'u4']
    },
    isOnline: false
  },
  {
    id: 'vit_peer_6',
    name: 'Ananya Sharma',
    role: 'Student',
    branch: 'CSE Core',
    year: '2nd Year',
    graduationYear: '2027',
    regNo: '23BCE1890',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AnanyaSharma',
    headline: 'Cross-Platform Mobile Developer · Flutter, Dart, Firebase, Supabase',
    about: 'I build sleek mobile apps with 60fps animations. Looking for backend developers to collaborate on student productivity and campus ride-sharing apps.',
    skills: ['Flutter', 'Dart', 'Firebase', 'REST APIs', 'State Management (Bloc)', 'Figma'],
    interests: ['App Development', 'Startup / Side Project', 'Open Source', 'Hackathons'],
    collaborationStatus: 'Seeking Project Partner',
    githubConnected: true,
    githubUsername: 'ananya-dev',
    projects: [
      { title: 'StudySync', tech: 'Flutter, Firebase', description: 'Real-time Pomodoro and collaborative virtual study rooms with over 1,200 active student users.' }
    ],
    certifications: ['Google Associate Android Developer (Kotlin/Flutter)'],
    skillEndorsements: {
      'Flutter': ['u1', 'u2', 'u3', 'u5'],
      'Dart': ['u2', 'u4']
    },
    isOnline: true
  },
  {
    id: 'vit_peer_7',
    name: 'Karthik Balaji',
    role: 'Student',
    branch: 'CSE (Blockchains)',
    year: '4th Year',
    graduationYear: '2025',
    regNo: '21BCE1342',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=KarthikBalaji',
    headline: 'Web3 & Smart Contract Developer · Solidity, Hardhat, Ethereum, Next.js',
    about: 'Building decentralized finance protocols and zero-knowledge identity verifiers. Ethereum India Hackathon finalist. Excited to team up for upcoming global web3 hackathons.',
    skills: ['Solidity', 'Web3', 'TypeScript', 'Next.js', 'Ethers.js', 'Rust', 'Hardhat'],
    interests: ['Web3 / Blockchain', 'Hackathons', 'DeFi', 'Open Source'],
    collaborationStatus: 'Building Startup',
    githubConnected: true,
    githubUsername: 'karthik-balaji-eth',
    projects: [
      { title: 'ZK-CampusID', tech: 'Solidity, Circom, Next.js', description: 'Zero-knowledge credential verification proof for student discounts without leaking identity.' }
    ],
    certifications: ['Chainlink Certified Developer'],
    skillEndorsements: {
      'Solidity': ['u1', 'u3', 'u4'],
      'Web3': ['u1', 'u2', 'u4']
    },
    isOnline: false
  },
  {
    id: 'vit_peer_8',
    name: 'Pooja Iyer',
    role: 'Student',
    branch: 'Mechanical & Robotics',
    year: '3rd Year',
    graduationYear: '2026',
    regNo: '22BME1055',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=PoojaIyer',
    headline: 'Robotics Software & Computer Vision · ROS, Python, C++, Autonomous Navigation',
    about: 'Leading the software subteam for the University Rover Challenge. Looking for SLAM enthusiasts and deep learning researchers to team up on robotic perception.',
    skills: ['ROS', 'Python', 'C++', 'Computer Vision', 'OpenCV', 'Gazebo Simulation'],
    interests: ['Robotics & IoT', 'Research Papers', 'Autonomous Vehicles', 'Hackathons'],
    collaborationStatus: 'Seeking Project Partner',
    githubConnected: true,
    githubUsername: 'pooja-robotics',
    projects: [
      { title: 'RoverSLAM', tech: 'ROS Noetic, RTAB-Map, OpenCV', description: 'Visual SLAM mapping and autonomous waypoint navigation in GPS-denied environments.' }
    ],
    certifications: ['NVIDIA DLI Computer Vision Certificate'],
    skillEndorsements: {
      'Python': ['u1', 'u2', 'u4'],
      'ROS': ['u1', 'u3']
    },
    isOnline: true
  }
];

const POPULAR_SKILLS = [
  'All Skills',
  'React',
  'Python',
  'UI Design',
  'Machine Learning',
  'Node.js',
  'TypeScript',
  'Figma',
  'C++',
  'Rust',
  'Go',
  'Flutter',
  'Cybersecurity',
  'Solidity',
  'Three.js',
  'IoT'
];

const POPULAR_INTERESTS = [
  'All Interests',
  'Hackathons',
  'Open Source',
  'Competitive Programming',
  'Research Papers',
  'AI / GenAI',
  'App Development',
  'UI/UX Design',
  'Robotics & IoT',
  'Startup / Side Project',
  'DevJams'
];

const BRANCH_OPTIONS = [
  'All Branches',
  'CSE Core',
  'AI & Data Science',
  'Information Technology',
  'ECE (Electronics)',
  'Cyber Security',
  'Mechanical'
];

const YEAR_OPTIONS = [
  'All Years',
  '1st Year',
  '2nd Year',
  '3rd Year',
  '4th Year'
];

interface PeerDirectoryProps {
  onOpenMessage: (chatData: any) => void;
}

export default function PeerDirectory({ onOpenMessage }: PeerDirectoryProps) {
  const { user, showGlobalToast } = useAppStore();
  const queryClient = useQueryClient();

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('All Skills');
  const [selectedInterest, setSelectedInterest] = useState('All Interests');
  const [selectedBranch, setSelectedBranch] = useState('All Branches');
  const [selectedYear, setSelectedYear] = useState('All Years');
  const [filterMode, setFilterMode] = useState<'all' | 'team' | 'hackathon' | 'ai'>('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Connection & Endorsement local state
  const [pendingConnects, setPendingConnects] = useState<string[]>([]);
  const [connectedIds, setConnectedIds] = useState<string[]>([]);

  // Modals state
  const [selectedPeerForModal, setSelectedPeerForModal] = useState<PeerStudent | null>(null);
  const [isEditCardModalOpen, setIsEditCardModalOpen] = useState(false);

  // Fetch Firestore registered users
  const { data: dbUsers = [] } = useQuery({
    queryKey: ['users_directory'],
    queryFn: async () => {
      try {
        const q = query(collection(db, 'users'), limit(50));
        const snapshot = await getDocs(q);
        return snapshot.docs
          .map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              name: data.name || 'VITian',
              role: data.role || 'Student',
              branch: data.branch || 'CSE Core',
              year: data.graduationYear ? `Class of ${data.graduationYear}` : 'Student',
              graduationYear: data.graduationYear,
              regNo: data.regNo,
              avatarUrl: data.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name || doc.id}`,
              headline: data.headline || `${data.branch || 'Student'} at VIT Chennai`,
              about: data.about || '',
              skills: Array.isArray(data.skills) ? data.skills : [],
              interests: Array.isArray(data.interests) ? data.interests : ['Hackathons', 'Open Source'],
              collaborationStatus: data.collaborationStatus || 'Open to Collab',
              githubConnected: !!data.githubConnected,
              githubUsername: data.githubUsername,
              skillEndorsements: data.skillEndorsements || {},
              isOnline: true
            } as PeerStudent;
          })
          .filter(u => u.id !== auth.currentUser?.uid && u.id !== user?.regNo && u.id !== user?.email);
      } catch (err) {
        console.error('Error fetching directory users:', err);
        return [];
      }
    },
    staleTime: 1000 * 60 * 3
  });

  // Combine live users and rich curated peers (avoiding duplicate IDs)
  const allPeers: PeerStudent[] = useMemo(() => {
    const existingIds = new Set(dbUsers.map(u => u.id));
    const curatedFiltered = CURATED_VIT_PEERS.filter(p => !existingIds.has(p.id));
    return [...dbUsers, ...curatedFiltered];
  }, [dbUsers]);

  // Connect Mutation
  const handleConnect = (peerId: string) => {
    if (pendingConnects.includes(peerId) || connectedIds.includes(peerId)) return;
    setPendingConnects(prev => [...prev, peerId]);
    showGlobalToast('Connection request sent!');
    setTimeout(() => {
      setPendingConnects(prev => prev.filter(id => id !== peerId));
      setConnectedIds(prev => [...prev, peerId]);
    }, 1200);
  };

  // Endorse Mutation
  const endorseMutation = useMutation({
    mutationFn: async ({ userId, skill, action }: { userId: string; skill: string; action: 'add' | 'remove' }) => {
      const currentUid = auth.currentUser?.uid || 'guest-user';
      try {
        const docRef = doc(db, 'users', userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const endorsements = data.skillEndorsements || {};
          let skillList = endorsements[skill] || [];
          if (action === 'add') {
            if (!skillList.includes(currentUid)) skillList.push(currentUid);
          } else {
            skillList = skillList.filter((id: string) => id !== currentUid);
          }
          await updateDoc(docRef, {
            [`skillEndorsements.${skill}`]: skillList
          });
        }
      } catch (err) {
        console.warn('Local peer endorsement updated (offline/curated):', err);
      }
      return { userId, skill, action };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users_directory'] });
    }
  });

  const handleEndorseSkill = (peerId: string, skill: string, isEndorsed: boolean) => {
    endorseMutation.mutate({
      userId: peerId,
      skill,
      action: isEndorsed ? 'remove' : 'add'
    });
    showGlobalToast(isEndorsed ? `Removed endorsement for ${skill}` : `Endorsed for ${skill}!`);
  };

  // Direct Message handling
  const handleDirectMessage = async (peer: PeerStudent) => {
    if (!auth.currentUser) {
      showGlobalToast('Please sign in to message peers');
      return;
    }
    const currentUid = auth.currentUser.uid;
    const targetUid = peer.id;

    try {
      // Look for existing chat
      const q = query(
        collection(db, 'chats'),
        where('participants', 'array-contains', currentUid)
      );
      const snap = await getDocs(q);
      let existingChat: any = null;
      snap.forEach(d => {
        const data = d.data();
        if (data.participants && data.participants.includes(targetUid)) {
          existingChat = { id: d.id, ...data };
        }
      });

      if (existingChat) {
        onOpenMessage({
          id: existingChat.id,
          sender: peer.name,
          lastMessage: existingChat.lastMessage || 'Connected',
          timestamp: 'Recently',
          isOfficial: false,
          unread: false
        });
      } else {
        const newChatRef = await addDoc(collection(db, 'chats'), {
          participants: [currentUid, targetUid],
          participantNames: [user?.name || 'VITian', peer.name],
          lastMessage: '👋 Hi! I found your profile in the Peer Directory.',
          lastUpdated: serverTimestamp()
        });
        onOpenMessage({
          id: newChatRef.id,
          sender: peer.name,
          lastMessage: 'Chat started',
          timestamp: 'Just now',
          isOfficial: false,
          unread: false
        });
      }
    } catch (err) {
      console.error('Error starting chat:', err);
      // Fallback for simulated/curated peers
      onOpenMessage({
        id: `chat_${peer.id}`,
        sender: peer.name,
        lastMessage: 'Chat session started',
        timestamp: 'Just now',
        isOfficial: false,
        unread: false
      });
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedSkill('All Skills');
    setSelectedInterest('All Interests');
    setSelectedBranch('All Branches');
    setSelectedYear('All Years');
    setFilterMode('all');
  };

  const hasActiveFilters = 
    searchQuery.trim().length > 0 ||
    selectedSkill !== 'All Skills' ||
    selectedInterest !== 'All Interests' ||
    selectedBranch !== 'All Branches' ||
    selectedYear !== 'All Years' ||
    filterMode !== 'all';

  // Filtering Logic
  const filteredPeers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return allPeers.filter(peer => {
      // Quick Mode filter
      if (filterMode === 'team' && !peer.collaborationStatus?.toLowerCase().includes('team') && !peer.collaborationStatus?.toLowerCase().includes('partner')) {
        return false;
      }
      if (filterMode === 'hackathon' && !peer.interests?.some(i => i.toLowerCase().includes('hackathon')) && !peer.headline?.toLowerCase().includes('hackathon')) {
        return false;
      }
      if (filterMode === 'ai' && !peer.skills?.some(s => ['python', 'machine learning', 'pytorch', 'tensorflow', 'langchain'].includes(s.toLowerCase())) && !peer.interests?.some(i => i.toLowerCase().includes('ai'))) {
        return false;
      }

      // Skill Filter
      if (selectedSkill !== 'All Skills') {
        const matchesSkill = peer.skills?.some(s => s.toLowerCase() === selectedSkill.toLowerCase());
        if (!matchesSkill) return false;
      }

      // Interest Filter
      if (selectedInterest !== 'All Interests') {
        const matchesInterest = peer.interests?.some(i => i.toLowerCase().includes(selectedInterest.toLowerCase()));
        if (!matchesInterest) return false;
      }

      // Branch Filter
      if (selectedBranch !== 'All Branches') {
        if (!peer.branch?.toLowerCase().includes(selectedBranch.toLowerCase().replace('all branches', ''))) {
          return false;
        }
      }

      // Year Filter
      if (selectedYear !== 'All Years') {
        const targetYear = selectedYear.toLowerCase();
        const peerYear = (peer.year || peer.graduationYear || '').toLowerCase();
        if (!peerYear.includes(targetYear.replace(' year', ''))) {
          return false;
        }
      }

      // Text Query Search across Name, Skills, Interests, Branch, Headline, and About
      if (q) {
        const matchName = peer.name.toLowerCase().includes(q);
        const matchBranch = peer.branch.toLowerCase().includes(q);
        const matchHeadline = peer.headline?.toLowerCase().includes(q);
        const matchAbout = peer.about?.toLowerCase().includes(q);
        const matchSkill = peer.skills?.some(s => s.toLowerCase().includes(q));
        const matchInterest = peer.interests?.some(i => i.toLowerCase().includes(q));
        const matchReg = peer.regNo?.toLowerCase().includes(q);

        return matchName || matchBranch || matchHeadline || matchAbout || matchSkill || matchInterest || matchReg;
      }

      return true;
    });
  }, [allPeers, searchQuery, selectedSkill, selectedInterest, selectedBranch, selectedYear, filterMode]);

  return (
    <div className="space-y-4">
      {/* Search Bar & Advanced Toggle */}
      <div className="space-y-2">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by name, skill (e.g. React, Python), or interest..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-10 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white/[0.08] transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-white"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Filter Segments */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <button
              onClick={() => setFilterMode('all')}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap",
                filterMode === 'all'
                  ? "bg-white text-zinc-950 font-semibold shadow-sm"
                  : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
              )}
            >
              All Peers
            </button>
            <button
              onClick={() => setFilterMode('team')}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-1.5",
                filterMode === 'team'
                  ? "bg-blue-600 text-white font-semibold shadow-sm"
                  : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
              )}
            >
              <Users className="w-3.5 h-3.5" />
              Looking for Team
            </button>
            <button
              onClick={() => setFilterMode('hackathon')}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-1.5",
                filterMode === 'hackathon'
                  ? "bg-amber-600 text-white font-semibold shadow-sm"
                  : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
              )}
            >
              <Flame className="w-3.5 h-3.5" />
              Hackathon Devs
            </button>
            <button
              onClick={() => setFilterMode('ai')}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-1.5",
                filterMode === 'ai'
                  ? "bg-emerald-600 text-white font-semibold shadow-sm"
                  : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
              )}
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI & ML
            </button>
          </div>

          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={cn(
              "px-2.5 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-colors shrink-0",
              showAdvancedFilters
                ? "bg-white/15 border-white/20 text-white"
                : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
            )}
            title="Toggle skill & interest filter bars"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>
      </div>

      {/* Advanced Filter Drawer / Multi-Select Pill Bars */}
      <AnimatePresence>
        {showAdvancedFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden space-y-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/10"
          >
            {/* Filter by Specific Skill */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <BookOpen className="w-3 h-3 text-blue-400" /> Filter by Skill
                </span>
                {selectedSkill !== 'All Skills' && (
                  <button onClick={() => setSelectedSkill('All Skills')} className="text-[10px] text-blue-400 hover:underline">
                    Reset
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {POPULAR_SKILLS.map(skill => (
                  <button
                    key={skill}
                    onClick={() => setSelectedSkill(skill)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap border",
                      selectedSkill === skill
                        ? "bg-blue-600/30 text-blue-300 border-blue-500/50"
                        : "bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-gray-200"
                    )}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter by Specific Interest */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <GraduationCap className="w-3 h-3 text-emerald-400" /> Filter by Interest / Goal
                </span>
                {selectedInterest !== 'All Interests' && (
                  <button onClick={() => setSelectedInterest('All Interests')} className="text-[10px] text-emerald-400 hover:underline">
                    Reset
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {POPULAR_INTERESTS.map(interest => (
                  <button
                    key={interest}
                    onClick={() => setSelectedInterest(interest)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap border",
                      selectedInterest === interest
                        ? "bg-emerald-600/30 text-emerald-300 border-emerald-500/50"
                        : "bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-gray-200"
                    )}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>

            {/* Dropdowns: Branch & Year */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/5">
              <div>
                <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  Department
                </label>
                <select
                  value={selectedBranch}
                  onChange={e => setSelectedBranch(e.target.value)}
                  className="w-full bg-zinc-800 border border-white/10 text-white rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-blue-500"
                >
                  {BRANCH_OPTIONS.map(b => (
                    <option key={b} value={b} className="bg-zinc-900 text-white">{b}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  Academic Year
                </label>
                <select
                  value={selectedYear}
                  onChange={e => setSelectedYear(e.target.value)}
                  className="w-full bg-zinc-800 border border-white/10 text-white rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-blue-500"
                >
                  {YEAR_OPTIONS.map(y => (
                    <option key={y} value={y} className="bg-zinc-900 text-white">{y}</option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Directory Stats & "My Card" Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-1 py-1">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span className="font-semibold text-white">{filteredPeers.length}</span>
          <span>{filteredPeers.length === 1 ? 'peer' : 'peers'} in directory</span>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="ml-2 inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset filters</span>
            </button>
          )}
        </div>

        {/* My Networking Card Quick Action */}
        <button
          onClick={() => setIsEditCardModalOpen(true)}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-300 hover:text-white transition-colors"
        >
          <Edit3 className="w-3.5 h-3.5 text-blue-400" />
          <span>Edit My Networking Card</span>
        </button>
      </div>

      {/* Peers Cards Grid */}
      {filteredPeers.length === 0 ? (
        <div className="glass-panel p-8 rounded-3xl text-center space-y-3 my-4">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-gray-400">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-white text-base">No peers match your filters</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Try searching for a different skill (like Python, React, Go), relaxing your department filters, or resetting your search.
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset all filters</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredPeers.map(peer => {
            const isPending = pendingConnects.includes(peer.id);
            const isConnected = connectedIds.includes(peer.id);

            return (
              <div
                key={peer.id}
                className="group relative bg-zinc-900/80 hover:bg-zinc-800/80 border border-white/10 hover:border-white/20 rounded-2xl p-4 flex flex-col justify-between transition-all duration-200 shadow-sm"
              >
                <div>
                  {/* Card Header: Avatar & Core Info */}
                  <div className="flex items-start gap-3">
                    <div 
                      onClick={() => setSelectedPeerForModal(peer)}
                      className="relative cursor-pointer shrink-0"
                    >
                      <img
                        src={peer.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${peer.name}`}
                        alt={peer.name}
                        className="w-12 h-12 rounded-xl bg-zinc-800 border border-white/10 object-cover"
                      />
                      {peer.isOnline && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-zinc-900 rounded-full" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <h4 
                          onClick={() => setSelectedPeerForModal(peer)}
                          className="font-bold text-white text-sm hover:text-blue-400 cursor-pointer truncate transition-colors flex items-center gap-1.5"
                        >
                          <span>{peer.name}</span>
                          {peer.githubConnected && (
                            <Github className="w-3 h-3 text-gray-400 shrink-0" />
                          )}
                        </h4>
                        
                        {/* Collab status badge */}
                        {peer.collaborationStatus && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium shrink-0">
                            {peer.collaborationStatus.includes('Hackathon') ? '🏆 Hackathons' : peer.collaborationStatus}
                          </span>
                        )}
                      </div>

                      {/* Zero-Pill Static Metadata */}
                      <p className="text-[11px] text-gray-400 flex items-center gap-1.5 truncate mt-0.5">
                        <span>{peer.branch}</span>
                        <span aria-hidden="true">·</span>
                        <span>{peer.year || peer.graduationYear || 'Student'}</span>
                      </p>
                    </div>
                  </div>

                  {/* Headline */}
                  {peer.headline && (
                    <p className="text-xs text-gray-300 mt-2.5 line-clamp-2 leading-relaxed">
                      {peer.headline}
                    </p>
                  )}

                  {/* Skills Section with Endorsements */}
                  <div className="mt-3">
                    <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                      Skills
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(peer.skills || []).slice(0, 4).map(skill => {
                        const isHighlighted = 
                          (selectedSkill !== 'All Skills' && skill.toLowerCase() === selectedSkill.toLowerCase()) ||
                          (searchQuery && skill.toLowerCase().includes(searchQuery.toLowerCase().trim()));
                        const isEndorsed = auth.currentUser ? peer.skillEndorsements?.[skill]?.includes(auth.currentUser.uid) : false;
                        const endorseCount = peer.skillEndorsements?.[skill]?.length || 0;

                        return (
                          <button
                            key={skill}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEndorseSkill(peer.id, skill, !!isEndorsed);
                            }}
                            className={cn(
                              "text-[10px] font-medium px-2 py-0.5 rounded-md border flex items-center gap-1 transition-colors",
                              isHighlighted
                                ? "bg-blue-600/30 text-blue-300 border-blue-500/50"
                                : isEndorsed
                                ? "bg-blue-600/15 text-blue-300 border-blue-500/30"
                                : "bg-white/5 text-gray-300 border-white/10 hover:bg-white/10 hover:text-white"
                            )}
                            title="Click to endorse this skill"
                          >
                            <span>{skill}</span>
                            {endorseCount > 0 && (
                              <span className="text-[9px] text-blue-400 flex items-center gap-0.5">
                                <ThumbsUp className="w-2 h-2" />
                                {endorseCount}
                              </span>
                            )}
                          </button>
                        );
                      })}
                      {(peer.skills?.length || 0) > 4 && (
                        <span 
                          onClick={() => setSelectedPeerForModal(peer)}
                          className="text-[10px] text-gray-400 hover:text-white cursor-pointer px-1 py-0.5 flex items-center"
                        >
                          +{peer.skills.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Interests Section */}
                  {peer.interests && peer.interests.length > 0 && (
                    <div className="mt-2.5">
                      <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                        Interests
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {peer.interests.slice(0, 3).map(interest => {
                          const isHighlighted = 
                            (selectedInterest !== 'All Interests' && interest.toLowerCase().includes(selectedInterest.toLowerCase())) ||
                            (searchQuery && interest.toLowerCase().includes(searchQuery.toLowerCase().trim()));

                          return (
                            <span
                              key={interest}
                              className={cn(
                                "text-[10px] font-medium px-2 py-0.5 rounded-md border",
                                isHighlighted
                                  ? "bg-emerald-600/30 text-emerald-300 border-emerald-500/50 font-semibold"
                                  : "bg-emerald-500/10 text-emerald-400/90 border-emerald-500/20"
                              )}
                            >
                              {interest}
                            </span>
                          );
                        })}
                        {peer.interests.length > 3 && (
                          <span 
                            onClick={() => setSelectedPeerForModal(peer)}
                            className="text-[10px] text-gray-400 hover:text-white cursor-pointer px-1 py-0.5 flex items-center"
                          >
                            +{peer.interests.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Action Buttons */}
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-2">
                  <button
                    onClick={() => handleDirectMessage(peer)}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Message</span>
                  </button>

                  <button
                    onClick={() => handleConnect(peer.id)}
                    disabled={isPending || isConnected}
                    className={cn(
                      "py-1.5 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-1 transition-colors border",
                      isConnected
                        ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-300"
                        : isPending
                        ? "bg-white/5 border-white/10 text-gray-400"
                        : "bg-white/5 hover:bg-white/10 border-white/10 text-gray-200 hover:text-white"
                    )}
                  >
                    {isConnected ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Connected</span>
                      </>
                    ) : isPending ? (
                      <>
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>Pending</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Connect</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setSelectedPeerForModal(peer)}
                    className="p-1.5 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                    title="View Full Profile"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Peer Profile Detail Modal */}
      <PeerProfileModal
        peer={selectedPeerForModal}
        isOpen={!!selectedPeerForModal}
        onClose={() => setSelectedPeerForModal(null)}
        onMessage={(peer) => {
          setSelectedPeerForModal(null);
          handleDirectMessage(peer);
        }}
        onConnect={handleConnect}
        onEndorse={handleEndorseSkill}
        isPending={selectedPeerForModal ? pendingConnects.includes(selectedPeerForModal.id) : false}
      />

      {/* Edit Networking Profile Modal */}
      <EditNetworkingProfileModal
        isOpen={isEditCardModalOpen}
        onClose={() => setIsEditCardModalOpen(false)}
        onSaved={() => {
          queryClient.invalidateQueries({ queryKey: ['users_directory'] });
        }}
      />
    </div>
  );
}
