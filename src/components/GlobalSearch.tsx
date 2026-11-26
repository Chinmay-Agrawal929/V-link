import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  X, 
  User as UserIcon, 
  FileText, 
  Code2, 
  Users, 
  Briefcase, 
  Sparkles, 
  ExternalLink, 
  Github, 
  ChevronRight,
  Filter,
  Star,
  CheckCircle2,
  Tag,
  ArrowRight,
  MessageSquare
} from 'lucide-react';
import { collection, query, getDocs, limit, orderBy } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store';
import { 
  CAMPUS_PROJECTS, 
  CampusProject, 
  searchProjects, 
  ProjectSearchResult, 
  ProjectTeamMember 
} from '@/data/projectsData';
import { CURATED_VIT_PEERS } from '@/components/PeerDirectory';
import PeerProfileModal, { PeerStudent } from './PeerProfileModal';
import ProjectDetailsModal from './ProjectDetailsModal';
import ProjectAvatar from './ProjectAvatar';

type SearchFilterTab = 'all' | 'technology' | 'teamMember' | 'keyword' | 'people';

const POPULAR_TECHS = [
  'React',
  'Python',
  'Rust',
  'Flutter',
  'Three.js',
  'Solidity',
  'Go',
  'ESP32',
  'FastAPI',
  'Docker'
];

const POPULAR_KEYWORDS = [
  'Drone',
  'Timetables',
  '3D Tour',
  'RAG & AI',
  'Attendance',
  'Visual SLAM',
  'Cybersecurity',
  'Q&A'
];

const POPULAR_LEADS = [
  'Vikram Singh',
  'Sneha Reddy',
  'Rohan Verma',
  'Aisha Khan',
  'Aditya Nair',
  'Ananya Sharma'
];

export default function GlobalSearch() {
  const [isFocused, setIsFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<SearchFilterTab>('all');
  const [dbProjects, setDbProjects] = useState<CampusProject[]>([]);
  const [dbUsers, setDbUsers] = useState<any[]>([]);
  const [dbPosts, setDbPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Modals state
  const [selectedProject, setSelectedProject] = useState<CampusProject | null>(null);
  const [selectedPeer, setSelectedPeer] = useState<PeerStudent | null>(null);
  const [pendingConnects, setPendingConnects] = useState<string[]>([]);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { setTab, setNetworkTab, showGlobalToast } = useAppStore();

  // Global Keyboard Shortcut: ⌘K or Ctrl+K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsFocused(true);
      } else if (e.key === 'Escape' && isFocused) {
        setIsFocused(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFocused]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch Firestore projects & users once on mount
  useEffect(() => {
    let isMounted = true;
    async function fetchDatabaseItems() {
      try {
        const [projSnap, userSnap, postSnap] = await Promise.all([
          getDocs(query(collection(db, 'projects'), limit(50))).catch(() => ({ docs: [] })),
          getDocs(query(collection(db, 'users'), limit(50))).catch(() => ({ docs: [] })),
          getDocs(query(collection(db, 'posts'), orderBy('timestamp', 'desc'), limit(30))).catch(() => ({ docs: [] }))
        ]);

        if (!isMounted) return;

        // Process Firestore projects
        const loadedProjects: CampusProject[] = projSnap.docs.map(d => {
          const data = d.data();
          return {
            id: d.id,
            title: data.title || 'Campus Project',
            tagline: data.tagline || data.description?.slice(0, 80),
            description: data.description || '',
            technologies: Array.isArray(data.technologies) ? data.technologies : ['General'],
            teamMembers: Array.isArray(data.teamMembers) ? data.teamMembers : [
              { name: data.authorName || 'Student', role: 'Lead', avatarUrl: data.authorAvatar }
            ],
            category: data.category || 'General',
            status: data.status || 'Active',
            keywords: Array.isArray(data.keywords) ? data.keywords : [],
            stars: data.stars || 0,
            repoUrl: data.repoUrl,
            demoUrl: data.demoUrl,
            lookingFor: data.lookingFor || []
          };
        });

        // Also extract projects listed directly on user profiles
        const userProjects: CampusProject[] = [];
        userSnap.docs.forEach(docSnap => {
          const u = docSnap.data();
          if (Array.isArray(u.projects) && u.projects.length > 0) {
            u.projects.forEach((projItem: any, idx: number) => {
              const title = typeof projItem === 'string' ? projItem : (projItem.title || 'Student Project');
              const tech = typeof projItem === 'object' && projItem.tech ? projItem.tech : (u.skills?.join(', ') || 'Various');
              const desc = typeof projItem === 'object' && projItem.description ? projItem.description : `Project developed by ${u.name || 'VITian'}`;
              
              userProjects.push({
                id: `user_proj_${docSnap.id}_${idx}`,
                title,
                tagline: `${u.name}'s Project`,
                description: desc,
                technologies: tech.split(',').map((t: string) => t.trim()).filter(Boolean),
                teamMembers: [
                  {
                    name: u.name || 'VIT Student',
                    role: 'Project Creator',
                    branch: u.branch || 'VIT Chennai',
                    avatarUrl: u.avatarUrl,
                    userId: docSnap.id
                  }
                ],
                category: 'Student Initiative',
                status: 'Active',
                keywords: [title.toLowerCase(), ...(u.skills || [])],
                stars: 1,
                lookingFor: ['Contributors']
              });
            });
          }
        });

        setDbProjects([...loadedProjects, ...userProjects]);
        setDbUsers(userSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setDbPosts(postSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.warn('Search data load note:', e);
      }
    }

    fetchDatabaseItems();
    return () => { isMounted = false; };
  }, []);

  // Merge default campus projects with Firestore projects (deduplicating by title)
  const allProjects = useMemo(() => {
    const map = new Map<string, CampusProject>();
    CAMPUS_PROJECTS.forEach(p => map.set(p.title.toLowerCase(), p));
    dbProjects.forEach(p => {
      const key = p.title.toLowerCase();
      if (!map.has(key)) map.set(key, p);
    });
    return Array.from(map.values());
  }, [dbProjects]);

  // Combined search results
  const projectResults: ProjectSearchResult[] = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return searchProjects(
      searchQuery,
      allProjects,
      activeTab === 'people' ? 'all' : (activeTab as any)
    );
  }, [searchQuery, allProjects, activeTab]);

  // People results
  const matchedUsers = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();

    // Search curated peers + Firestore users
    const matchedCurated = CURATED_VIT_PEERS.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.branch.toLowerCase().includes(q) ||
      (p.headline && p.headline.toLowerCase().includes(q)) ||
      p.skills.some(s => s.toLowerCase().includes(q))
    );

    const matchedDb = dbUsers.filter(u =>
      u.name?.toLowerCase().includes(q) ||
      u.branch?.toLowerCase().includes(q) ||
      u.headline?.toLowerCase().includes(q) ||
      (Array.isArray(u.skills) && u.skills.some((s: string) => s.toLowerCase().includes(q)))
    );

    // Merge by name
    const seen = new Set<string>();
    const result: any[] = [];
    [...matchedCurated, ...matchedDb].forEach(u => {
      if (!seen.has(u.name)) {
        seen.add(u.name);
        result.push(u);
      }
    });

    return result.slice(0, 6);
  }, [searchQuery, dbUsers]);

  // Posts results
  const matchedPosts = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return dbPosts.filter(p =>
      p.content?.toLowerCase().includes(q) ||
      p.authorName?.toLowerCase().includes(q)
    ).slice(0, 4);
  }, [searchQuery, dbPosts]);

  const handleOpenPeer = (peerOrMember: any) => {
    // If it's a team member, find corresponding peer or format as PeerStudent
    const peerMatch = CURATED_VIT_PEERS.find(p => 
      p.name.toLowerCase() === peerOrMember.name.toLowerCase() ||
      p.id === peerOrMember.peerId
    );

    if (peerMatch) {
      setSelectedPeer(peerMatch);
    } else {
      setSelectedPeer({
        id: peerOrMember.userId || `peer_${peerOrMember.name.replace(/\s+/g, '_')}`,
        name: peerOrMember.name,
        role: peerOrMember.role || 'Student',
        branch: peerOrMember.branch || 'VIT Chennai',
        avatarUrl: peerOrMember.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${peerOrMember.name}`,
        skills: [],
        interests: ['Collaboration', 'Projects']
      });
    }
  };

  const handleConnectPeer = (peerId: string) => {
    if (pendingConnects.includes(peerId)) return;
    setPendingConnects(prev => [...prev, peerId]);
    showGlobalToast('Connection request sent!');
    setTimeout(() => {
      setPendingConnects(prev => prev.filter(id => id !== peerId));
    }, 1500);
  };

  const handleMessagePeer = (peer: PeerStudent) => {
    setSelectedPeer(null);
    setIsFocused(false);
    setTab('network');
    setNetworkTab('messages');
    showGlobalToast(`Opening chat with ${peer.name}`);
  };

  const totalResultsCount = projectResults.length + (activeTab === 'all' ? matchedUsers.length + matchedPosts.length : 0);

  return (
    <div className="flex-1 relative max-w-2xl mx-auto" ref={wrapperRef}>
      {/* Search Input Bar */}
      <div className="relative group">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
          <Search className={cn(
            "w-4 h-4 transition-colors",
            isFocused ? "text-brand-blue" : "text-gray-400 group-hover:text-gray-300"
          )} />
        </div>

        <input 
          ref={inputRef}
          type="text" 
          placeholder="Search projects by keyword, tech, or member..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          className={cn(
            "w-full bg-white/[0.07] border text-white placeholder-gray-400 text-sm rounded-2xl flex items-center pl-10 pr-20 py-2.5 transition-all shadow-inner",
            isFocused 
              ? "border-brand-blue/60 bg-black/60 ring-2 ring-brand-blue/20 shadow-lg shadow-brand-blue/10" 
              : "border-white/10 hover:border-white/20 hover:bg-white/[0.09]"
          )}
        />

        {/* Right side controls: Clear or Keyboard shortcut */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {searchQuery ? (
            <button 
              onClick={() => {
                setSearchQuery('');
                inputRef.current?.focus();
              }}
              className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <div className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-gray-400 font-mono">
              <span>⌘</span>
              <span>K</span>
            </div>
          )}
        </div>
      </div>

      {/* Dropdown Results Overlay */}
      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.99 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute top-full left-0 right-0 mt-2 bg-[#0B0F19]/95 backdrop-blur-xl border border-white/15 rounded-3xl shadow-2xl overflow-hidden z-[100] max-h-[75vh] flex flex-col"
          >
            {/* Filter Tabs Header */}
            <div className="p-3 bg-white/[0.03] border-b border-white/10 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
              <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider pl-1 pr-2 flex items-center gap-1 shrink-0">
                <Filter className="w-3 h-3 text-brand-blue" />
                Find By:
              </span>

              <button
                onClick={() => setActiveTab('all')}
                className={cn(
                  "px-3 py-1 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5",
                  activeTab === 'all'
                    ? "bg-brand-blue text-white shadow-md shadow-brand-blue/30"
                    : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                )}
              >
                <span>All Projects</span>
                {searchQuery.trim() && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white">
                    {projectResults.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('technology')}
                className={cn(
                  "px-3 py-1 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5",
                  activeTab === 'technology'
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                    : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                )}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Technologies</span>
              </button>

              <button
                onClick={() => setActiveTab('teamMember')}
                className={cn(
                  "px-3 py-1 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5",
                  activeTab === 'teamMember'
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                    : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                )}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Team Members</span>
              </button>

              <button
                onClick={() => setActiveTab('keyword')}
                className={cn(
                  "px-3 py-1 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5",
                  activeTab === 'keyword'
                    ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                    : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                )}
              >
                <Tag className="w-3.5 h-3.5" />
                <span>Keywords</span>
              </button>

              <button
                onClick={() => setActiveTab('people')}
                className={cn(
                  "px-3 py-1 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 ml-auto",
                  activeTab === 'people'
                    ? "bg-blue-600 text-white"
                    : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                )}
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Students</span>
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-4">
              {/* Empty query: Show Quick Discovery Pills & Highlights */}
              {!searchQuery.trim() ? (
                <div className="space-y-4 py-2 px-1">
                  {/* Quick Discovery Header */}
                  <div className="flex items-center justify-between text-xs text-gray-400 px-1">
                    <span className="font-semibold text-gray-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Quick Discover Campus Projects
                    </span>
                    <span className="text-[11px] text-gray-500">Click any tag to search</span>
                  </div>

                  {/* Popular Technologies */}
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-1 flex items-center gap-1">
                      <Code2 className="w-3 h-3 text-emerald-400" />
                      Popular Technologies
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {POPULAR_TECHS.map(tech => (
                        <button
                          key={tech}
                          onClick={() => {
                            setSearchQuery(tech);
                            setActiveTab('technology');
                          }}
                          className="px-2.5 py-1 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-mono border border-emerald-500/20 transition-all hover:scale-105"
                        >
                          {tech}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Hot Keywords */}
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-1 flex items-center gap-1">
                      <Tag className="w-3 h-3 text-amber-400" />
                      Keywords & Project Domains
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {POPULAR_KEYWORDS.map(kw => (
                        <button
                          key={kw}
                          onClick={() => {
                            setSearchQuery(kw);
                            setActiveTab('keyword');
                          }}
                          className="px-2.5 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs border border-amber-500/20 transition-all hover:scale-105"
                        >
                          #{kw}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Team Members */}
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-1 flex items-center gap-1">
                      <Users className="w-3 h-3 text-purple-400" />
                      Student Team Leads
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {POPULAR_LEADS.map(lead => (
                        <button
                          key={lead}
                          onClick={() => {
                            setSearchQuery(lead);
                            setActiveTab('teamMember');
                          }}
                          className="px-2.5 py-1 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-xs border border-purple-500/20 transition-all hover:scale-105 flex items-center gap-1"
                        >
                          <UserIcon className="w-3 h-3" />
                          <span>{lead}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Featured Projects Preview */}
                  <div className="pt-2 border-t border-white/5 space-y-2">
                    <div className="flex items-center justify-between text-xs px-1">
                      <span className="font-semibold text-gray-300">Featured Campus Projects</span>
                      <span className="text-[11px] text-gray-500">14 Active Projects</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {CAMPUS_PROJECTS.slice(0, 4).map(p => (
                        <div
                          key={p.id}
                          onClick={() => setSelectedProject(p)}
                          className="p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-brand-blue/40 cursor-pointer transition-all group flex items-start gap-3"
                        >
                          <ProjectAvatar
                            title={p.title}
                            technologies={p.technologies}
                            avatarUrl={p.avatarUrl}
                            size="sm"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-bold text-white group-hover:text-brand-blue transition-colors truncate">
                                {p.title}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-gray-300">
                                {p.category}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 line-clamp-1">{p.tagline || p.description}</p>
                            <div className="flex items-center gap-1.5 mt-2 text-[11px] text-gray-400 font-mono">
                              <Code2 className="w-3 h-3 text-emerald-400" />
                              <span className="truncate">{p.technologies.slice(0, 3).join(', ')}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Search Results List */
                <div className="space-y-4">
                  {/* Summary bar */}
                  <div className="flex items-center justify-between px-2 text-xs text-gray-400">
                    <span>
                      Found <strong className="text-white">{projectResults.length}</strong> project{projectResults.length === 1 ? '' : 's'} matching "{searchQuery}"
                    </span>
                    {activeTab !== 'all' && (
                      <button
                        onClick={() => setActiveTab('all')}
                        className="text-brand-blue hover:underline text-[11px]"
                      >
                        Show all matches
                      </button>
                    )}
                  </div>

                  {/* Project Results */}
                  {projectResults.length > 0 ? (
                    <div className="space-y-2.5">
                      {projectResults.map(({ project, matchReasons }) => (
                        <div
                          key={project.id}
                          className="p-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-brand-blue/50 transition-all flex flex-col gap-3 group relative overflow-hidden"
                        >
                          {/* Accent glow on hover */}
                          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/5 rounded-full blur-2xl group-hover:bg-brand-blue/15 transition-all pointer-events-none" />

                          {/* Top Row: Avatar, Title, Category, Status */}
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <ProjectAvatar
                                title={project.title}
                                technologies={project.technologies}
                                avatarUrl={project.avatarUrl}
                                size="sm"
                              />
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 
                                    onClick={() => setSelectedProject(project)}
                                    className="text-base font-bold text-white group-hover:text-brand-blue transition-colors cursor-pointer"
                                  >
                                    {project.title}
                                  </h3>
                                  <span className={cn(
                                    "px-2 py-0.5 text-[10px] font-semibold rounded-full border",
                                    project.status === 'Recruiting' && "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                                    project.status === 'Hackathon Finalist' && "bg-purple-500/10 text-purple-400 border-purple-500/20",
                                    project.status === 'Active' && "bg-blue-500/10 text-blue-400 border-blue-500/20",
                                    project.status === 'Published' && "bg-amber-500/10 text-amber-400 border-amber-500/20",
                                    project.status === 'Open Source' && "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
                                  )}>
                                    {project.status === 'Recruiting' ? '⚡ Open for Collab' : project.status}
                                  </span>
                                </div>
                                <span className="text-xs text-gray-400 mt-0.5 block">{project.category}</span>
                              </div>
                            </div>

                            {/* Match Reason Tag */}
                            <div className="flex flex-wrap gap-1">
                              {matchReasons.slice(0, 2).map((reason, rIdx) => (
                                <span
                                  key={rIdx}
                                  className={cn(
                                    "px-2 py-0.5 rounded-lg text-[10px] font-semibold border flex items-center gap-1",
                                    reason.type === 'technology' && "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
                                    reason.type === 'teamMember' && "bg-purple-500/15 text-purple-300 border-purple-500/30",
                                    reason.type === 'keyword' && "bg-amber-500/15 text-amber-300 border-amber-500/30"
                                  )}
                                >
                                  {reason.type === 'technology' && <Code2 className="w-2.5 h-2.5" />}
                                  {reason.type === 'teamMember' && <Users className="w-2.5 h-2.5" />}
                                  {reason.type === 'keyword' && <Tag className="w-2.5 h-2.5" />}
                                  <span>{reason.label}</span>
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Description */}
                          <p className="text-xs text-gray-300 leading-relaxed line-clamp-2">
                            {project.description}
                          </p>

                          {/* Technologies Tags */}
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[11px] text-gray-400 font-semibold mr-1">Tech:</span>
                            {project.technologies.map((t, idx) => {
                              const isMatched = t.toLowerCase().includes(searchQuery.toLowerCase());
                              return (
                                <button
                                  key={idx}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSearchQuery(t);
                                    setActiveTab('technology');
                                  }}
                                  className={cn(
                                    "px-2 py-0.5 rounded-lg text-[11px] font-mono border transition-all",
                                    isMatched
                                      ? "bg-emerald-500/25 text-emerald-200 border-emerald-400 font-bold scale-105"
                                      : "bg-white/5 hover:bg-white/10 text-gray-300 border-white/10"
                                  )}
                                >
                                  {t}
                                </button>
                              );
                            })}
                          </div>

                          {/* Team Members & Action Bar */}
                          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5 text-xs">
                            {/* Team Member Avatars */}
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-gray-400 font-semibold">Team:</span>
                              <div className="flex items-center -space-x-1.5">
                                {project.teamMembers.map((member, mIdx) => (
                                  <img
                                    key={mIdx}
                                    src={member.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`}
                                    alt={member.name}
                                    title={`${member.name} (${member.role || 'Member'})`}
                                    onClick={() => handleOpenPeer(member)}
                                    className="w-6 h-6 rounded-full border border-black object-cover cursor-pointer hover:scale-125 transition-transform"
                                  />
                                ))}
                              </div>
                              <span className="text-[11px] text-gray-300 truncate max-w-[150px]">
                                {project.teamMembers.map(m => m.name.split(' ')[0]).join(', ')}
                              </span>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 ml-auto">
                              <button
                                onClick={() => setSelectedProject(project)}
                                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs border border-white/10 transition-colors flex items-center gap-1"
                              >
                                <span>View Details</span>
                                <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                              </button>

                              {project.teamMembers[0] && (
                                <button
                                  onClick={() => handleOpenPeer(project.teamMembers[0])}
                                  className="px-3 py-1.5 rounded-xl bg-brand-blue/20 hover:bg-brand-blue/30 text-brand-blue font-semibold text-xs border border-brand-blue/30 transition-colors flex items-center gap-1"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                  <span>Contact</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* No Projects Found */
                    <div className="p-8 text-center bg-white/[0.02] border border-white/5 rounded-2xl">
                      <Briefcase className="w-8 h-8 text-gray-500 mx-auto mb-2 opacity-60" />
                      <h4 className="text-sm font-semibold text-white mb-1">
                        No projects found for "{searchQuery}"
                      </h4>
                      <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
                        Try searching for a technology like <button onClick={() => setSearchQuery('Python')} className="text-emerald-400 underline">Python</button>, <button onClick={() => setSearchQuery('React')} className="text-emerald-400 underline">React</button>, or <button onClick={() => setSearchQuery('Rust')} className="text-emerald-400 underline">Rust</button>, or a student lead like <button onClick={() => setSearchQuery('Vikram')} className="text-purple-400 underline">Vikram</button> or <button onClick={() => setSearchQuery('Sneha')} className="text-purple-400 underline">Sneha</button>.
                      </p>
                    </div>
                  )}

                  {/* Matching Students (if on 'all' or 'people' tab) */}
                  {(activeTab === 'all' || activeTab === 'people') && matchedUsers.length > 0 && (
                    <div className="pt-3 border-t border-white/10 space-y-2">
                      <div className="flex items-center justify-between text-xs px-1">
                        <span className="font-semibold text-gray-300 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-brand-blue" />
                          Matching Students ({matchedUsers.length})
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {matchedUsers.map((u: any) => (
                          <div
                            key={u.id || u.name}
                            onClick={() => handleOpenPeer(u)}
                            className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 cursor-pointer flex items-center justify-between transition-all"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <img
                                src={u.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`}
                                alt={u.name}
                                className="w-8 h-8 rounded-full bg-white/10 object-cover border border-white/10 shrink-0"
                              />
                              <div className="min-w-0">
                                <h4 className="text-xs font-semibold text-white truncate">{u.name}</h4>
                                <p className="text-[11px] text-gray-400 truncate">{u.branch || u.headline}</p>
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenPeer(u);
                              }}
                              className="text-xs text-brand-blue hover:underline pl-2 shrink-0"
                            >
                              Profile
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Matching Posts (if on 'all' tab) */}
                  {activeTab === 'all' && matchedPosts.length > 0 && (
                    <div className="pt-3 border-t border-white/10 space-y-2">
                      <span className="text-xs font-semibold text-gray-300 flex items-center gap-1.5 px-1">
                        <FileText className="w-3.5 h-3.5 text-emerald-400" />
                        Related Campus Posts ({matchedPosts.length})
                      </span>

                      <div className="space-y-1.5">
                        {matchedPosts.map((p: any) => (
                          <button
                            key={p.id}
                            onClick={() => {
                              setIsFocused(false);
                              setTab('home');
                            }}
                            className="w-full text-left p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 transition-colors flex items-start gap-2.5"
                          >
                            <FileText className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-300 line-clamp-1">{p.content}</p>
                              <span className="text-[10px] text-gray-500 mt-0.5 block">by {p.authorName}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer with summary and hint */}
            <div className="p-2.5 bg-white/[0.02] border-t border-white/10 flex items-center justify-between text-[11px] text-gray-400 px-4 shrink-0">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Search by project keyword, technology, or team member name</span>
              </span>
              <button
                onClick={() => setIsFocused(false)}
                className="hover:text-white transition-colors"
              >
                Press <kbd className="px-1 py-0.5 bg-white/10 rounded text-[10px]">ESC</kbd> to close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Project Details Modal */}
      <ProjectDetailsModal
        project={selectedProject}
        isOpen={!!selectedProject}
        onClose={() => setSelectedProject(null)}
        onSelectTechnology={(tech) => {
          setSearchQuery(tech);
          setActiveTab('technology');
          setIsFocused(true);
        }}
        onSelectMember={(member) => handleOpenPeer(member)}
      />

      {/* Peer Profile Modal */}
      <PeerProfileModal
        peer={selectedPeer}
        isOpen={!!selectedPeer}
        onClose={() => setSelectedPeer(null)}
        onConnect={(peerId) => handleConnectPeer(peerId)}
        onMessage={(peer) => handleMessagePeer(peer)}
        onEndorse={() => {}}
        isPending={selectedPeer ? pendingConnects.includes(selectedPeer.id) : false}
      />
    </div>
  );
}
