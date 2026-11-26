import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Rocket, 
  Plus, 
  Search, 
  Filter, 
  UserPlus, 
  Check, 
  Star, 
  Github, 
  ExternalLink, 
  X, 
  Sparkles, 
  Tag, 
  Clock, 
  Users, 
  Send, 
  ChevronRight, 
  FolderGit2, 
  CheckCircle2, 
  AlertCircle,
  Code2,
  Layers,
  Heart,
  Palette
} from 'lucide-react';
import { useAppStore } from '@/store';
import { db, auth } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  serverTimestamp, 
  onSnapshot, 
  doc, 
  updateDoc, 
  increment,
  where
} from 'firebase/firestore';
import { cn } from '@/lib/utils';
import ProjectAvatar from './ProjectAvatar';
import ProjectBrandingToolModal from './ProjectBrandingToolModal';

export interface ShowcaseProject {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  category: string;
  status: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  authorBranch?: string;
  lookingForRoles?: string[];
  starsCount?: number;
  collaboratorsCount?: number;
  repoUrl?: string;
  demoUrl?: string;
  customAvatarUrl?: string;
  createdAt?: any;
}

// Default initial campus projects to ensure the showcase is immediately vibrant and engaging
const DEFAULT_SHOWCASE_PROJECTS: ShowcaseProject[] = [
  {
    id: 'showcase-campusrides',
    title: 'CampusRide',
    description: 'Peer-to-peer carpooling & auto-sharing platform for VIT Chennai day scholars commuting from Tambaram, Guindy, and Kelambakkam with live route matching and split fares.',
    technologies: ['Flutter', 'Firebase', 'Google Maps', 'Dart', 'Node.js'],
    category: 'Mobile App',
    status: 'Ongoing • Looking for Contributors',
    authorId: 'vit_user_101',
    authorName: 'Aditya Narayan',
    authorBranch: 'B.Tech CSE Core (3rd Year)',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AdityaNarayan',
    lookingForRoles: ['UI/UX Designer', 'Backend Dev (Node.js)', 'Flutter Dev'],
    starsCount: 28,
    collaboratorsCount: 3,
    repoUrl: 'https://github.com/vit-devs/campus-ride',
    demoUrl: 'https://campusride.vit.ac.in',
    createdAt: '2 hours ago'
  },
  {
    id: 'showcase-neuralpaper',
    title: 'NeuralPaper AI',
    description: 'Interactive academic research engine that synthesizes complex IEEE and arXiv CS papers into visual concept graphs, key mathematical derivations, and spoken audio briefings.',
    technologies: ['Python', 'PyTorch', 'FastAPI', 'React', 'TypeScript', 'Tailwind CSS'],
    category: 'AI & Machine Learning',
    status: 'Ongoing • In Active Development',
    authorId: 'vit_user_102',
    authorName: 'Rhea Sengupta',
    authorBranch: 'B.Tech AI & Data Science (4th Year)',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=RheaSengupta',
    lookingForRoles: ['Full-Stack Dev', 'ML Prompt Engineer'],
    starsCount: 45,
    collaboratorsCount: 4,
    repoUrl: 'https://github.com/rhea-ai/neural-paper',
    createdAt: '5 hours ago'
  },
  {
    id: 'showcase-vtopnotif',
    title: 'VTOP QuickAlert',
    description: 'Lightweight Progressive Web App that provides instant attendance drops threshold alerts, exam timetable syncing with Google Calendar, and push notifications for circulars.',
    technologies: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Redis', 'Docker'],
    category: 'Web Application',
    status: 'Ongoing • Prototyping',
    authorId: 'vit_user_103',
    authorName: 'Karthik Raja',
    authorBranch: 'B.Tech IT (2nd Year)',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=KarthikRaja',
    lookingForRoles: ['Frontend Engineer', 'QA / Tester'],
    starsCount: 19,
    collaboratorsCount: 2,
    createdAt: '1 day ago'
  },
  {
    id: 'showcase-algoarena',
    title: 'AlgoArena',
    description: 'Real-time 1v1 algorithmic duel platform built for VIT coding clubs. Features live code sandboxing in isolated Docker containers, Elo ratings, and spectator chat.',
    technologies: ['Go', 'Docker', 'WebSockets', 'React', 'Tailwind CSS', 'PostgreSQL'],
    category: 'Web Application',
    status: 'Ongoing • Hackathon Sprint',
    authorId: 'vit_user_104',
    authorName: 'Tanvi Shinde',
    authorBranch: 'B.Tech CSE Core (3rd Year)',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TanviShinde',
    lookingForRoles: ['DevOps / Infrastructure', 'Frontend React'],
    starsCount: 37,
    collaboratorsCount: 3,
    repoUrl: 'https://github.com/vit-devs/algo-arena',
    createdAt: '2 days ago'
  },
  {
    id: 'showcase-labmateiot',
    title: 'LabMate IoT',
    description: 'Smart microcontroller system monitoring oscilloscope and workbench availability across TT and SJT labs with real-time web telemetry and reservation queues.',
    technologies: ['C++', 'ESP32', 'MQTT', 'Node.js', 'React'],
    category: 'IoT & Hardware',
    status: 'Ongoing • Prototyping',
    authorId: 'vit_user_105',
    authorName: 'Pranav Menon',
    authorBranch: 'B.Tech ECE (3rd Year)',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=PranavMenon',
    lookingForRoles: ['Firmware Dev', 'Full-Stack Dashboard Dev'],
    starsCount: 22,
    collaboratorsCount: 2,
    createdAt: '3 days ago'
  }
];

const POPULAR_TECH_SUGGESTIONS = [
  'React', 'TypeScript', 'Python', 'Node.js', 'Tailwind CSS', 
  'Flutter', 'FastAPI', 'PyTorch', 'Next.js', 'Docker', 
  'PostgreSQL', 'Go', 'Firebase', 'Rust', 'MongoDB', 'C++'
];

const CATEGORIES = [
  'All',
  'Web Application',
  'Mobile App',
  'AI & Machine Learning',
  'IoT & Hardware',
  'Cloud & DevOps',
  'Cybersecurity',
  'Open Source Tool'
];

const ROLE_SUGGESTIONS = [
  'Frontend Engineer',
  'Backend Developer',
  'Full-Stack Developer',
  'UI/UX Designer',
  'Mobile App Developer',
  'AI/ML Specialist',
  'DevOps / Cloud',
  'QA / Tester'
];

interface ProjectShowcaseProps {
  onSelectProjectForBranding?: (project: ShowcaseProject) => void;
  className?: string;
  compact?: boolean;
}

export default function ProjectShowcase({ 
  onSelectProjectForBranding, 
  className,
  compact = false 
}: ProjectShowcaseProps) {
  const { user, showGlobalToast, addNotification } = useAppStore();
  
  // Projects state
  const [projects, setProjects] = useState<ShowcaseProject[]>(DEFAULT_SHOWCASE_PROJECTS);
  const [isLoading, setIsLoading] = useState(false);
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [onlyLookingForTeam, setOnlyLookingForTeam] = useState(false);
  const [onlyMyProjects, setOnlyMyProjects] = useState(false);
  
  // Post modal state
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postDescription, setPostDescription] = useState('');
  const [postCategory, setPostCategory] = useState('Web Application');
  const [postStatus, setPostStatus] = useState('Ongoing • Looking for Contributors');
  const [postTechnologies, setPostTechnologies] = useState<string[]>(['React', 'TypeScript', 'Tailwind CSS']);
  const [techInput, setTechInput] = useState('');
  const [postLookingForRoles, setPostLookingForRoles] = useState<string[]>(['Frontend Engineer', 'UI/UX Designer']);
  const [roleInput, setRoleInput] = useState('');
  const [postRepoUrl, setPostRepoUrl] = useState('');
  const [postDemoUrl, setPostDemoUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Collaborate modal state
  const [selectedProjectForCollab, setSelectedProjectForCollab] = useState<ShowcaseProject | null>(null);
  const [collabRole, setCollabRole] = useState('Frontend Engineer');
  const [collabMessage, setCollabMessage] = useState('');
  const [collabContact, setCollabContact] = useState('');
  const [isSubmittingCollab, setIsSubmittingCollab] = useState(false);
  const [collaboratedProjectIds, setCollaboratedProjectIds] = useState<Set<string>>(new Set());
  const [likedProjectIds, setLikedProjectIds] = useState<Set<string>>(new Set());

  // Branding tool launcher state
  const [brandingModalOpen, setBrandingModalOpen] = useState(false);
  const [brandingProject, setBrandingProject] = useState<{ title: string; technologies: string[]; category: string }>({
    title: 'New Project',
    technologies: ['React', 'TypeScript'],
    category: 'Web Application'
  });

  // Sync with Firestore project_showcases in real-time
  useEffect(() => {
    try {
      const q = query(collection(db, 'project_showcases'), orderBy('timestamp', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const remoteProjects: ShowcaseProject[] = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              title: data.title || 'Untitled Project',
              description: data.description || '',
              technologies: data.technologies || [],
              category: data.category || 'Web Application',
              status: data.status || 'Ongoing • Looking for Contributors',
              authorId: data.authorId || '',
              authorName: data.authorName || 'VIT Student',
              authorAvatar: data.authorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.authorName || 'user'}`,
              authorBranch: data.authorBranch || 'VIT Chennai',
              lookingForRoles: data.lookingForRoles || [],
              starsCount: data.starsCount || 0,
              collaboratorsCount: data.collaboratorsCount || 1,
              repoUrl: data.repoUrl,
              demoUrl: data.demoUrl,
              customAvatarUrl: data.customAvatarUrl,
              createdAt: data.timestamp?.toDate ? new Date(data.timestamp.toDate()).toLocaleDateString() : 'Recently'
            };
          });

          // Merge remote projects with default demo projects (avoiding duplicates)
          const merged = [...remoteProjects];
          const remoteTitles = new Set(remoteProjects.map(p => p.title.toLowerCase()));
          DEFAULT_SHOWCASE_PROJECTS.forEach(defProj => {
            if (!remoteTitles.has(defProj.title.toLowerCase())) {
              merged.push(defProj);
            }
          });
          setProjects(merged);
        }
      }, (err) => {
        console.warn('Firestore project_showcases snapshot error (using local state):', err);
      });

      return () => unsubscribe();
    } catch (err) {
      console.warn('Could not initialize Firestore listener for project showcases:', err);
    }
  }, []);

  // Tech tag helpers for create form
  const handleAddTech = (tech: string) => {
    const trimmed = tech.trim();
    if (!trimmed) return;
    if (!postTechnologies.includes(trimmed)) {
      setPostTechnologies(prev => [...prev, trimmed]);
    }
    setTechInput('');
  };

  const handleRemoveTech = (techToRemove: string) => {
    setPostTechnologies(prev => prev.filter(t => t !== techToRemove));
  };

  // Role tag helpers for create form
  const handleAddRole = (role: string) => {
    const trimmed = role.trim();
    if (!trimmed) return;
    if (!postLookingForRoles.includes(trimmed)) {
      setPostLookingForRoles(prev => [...prev, trimmed]);
    }
    setRoleInput('');
  };

  const handleRemoveRole = (roleToRemove: string) => {
    setPostLookingForRoles(prev => prev.filter(r => r !== roleToRemove));
  };

  // Handle post submit
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim()) {
      showGlobalToast('Please enter a project title');
      return;
    }
    if (!postDescription.trim()) {
      showGlobalToast('Please enter a brief description');
      return;
    }

    setIsSubmitting(true);
    const newProject: ShowcaseProject = {
      id: `proj_${Date.now()}`,
      title: postTitle.trim(),
      description: postDescription.trim(),
      technologies: postTechnologies.length > 0 ? postTechnologies : ['TypeScript', 'React'],
      category: postCategory,
      status: postStatus,
      authorId: auth.currentUser?.uid || user?.regNo || 'me',
      authorName: user?.name || 'VIT Innovator',
      authorAvatar: user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Innovator'}`,
      authorBranch: user?.branch || 'B.Tech Student (VIT Chennai)',
      lookingForRoles: postLookingForRoles,
      starsCount: 1,
      collaboratorsCount: 1,
      repoUrl: postRepoUrl.trim() || undefined,
      demoUrl: postDemoUrl.trim() || undefined,
      createdAt: 'Just now'
    };

    // Optimistically update local view
    setProjects(prev => [newProject, ...prev]);

    try {
      await addDoc(collection(db, 'project_showcases'), {
        title: newProject.title,
        description: newProject.description,
        technologies: newProject.technologies,
        category: newProject.category,
        status: newProject.status,
        authorId: newProject.authorId,
        authorName: newProject.authorName,
        authorAvatar: newProject.authorAvatar,
        authorBranch: newProject.authorBranch,
        lookingForRoles: newProject.lookingForRoles,
        starsCount: 1,
        collaboratorsCount: 1,
        repoUrl: newProject.repoUrl || null,
        demoUrl: newProject.demoUrl || null,
        timestamp: serverTimestamp()
      });
      showGlobalToast(`🚀 Project "${newProject.title}" posted to Showcase!`);
      addNotification(`You published ongoing project: ${newProject.title}`);
    } catch (err) {
      console.warn('Saved project locally (Firestore offline/restricted):', err);
      showGlobalToast(`Project "${newProject.title}" saved!`);
    } finally {
      setIsSubmitting(false);
      setIsPostModalOpen(false);
      // Reset form
      setPostTitle('');
      setPostDescription('');
      setPostRepoUrl('');
      setPostDemoUrl('');
    }
  };

  // Handle Collaborate Submit
  const handleOpenCollabModal = (project: ShowcaseProject) => {
    setSelectedProjectForCollab(project);
    setCollabRole(project.lookingForRoles?.[0] || 'Contributor');
    setCollabMessage(`Hi ${project.authorName}, I saw your ongoing project "${project.title}" and would love to collaborate! I have experience with ${project.technologies.slice(0, 2).join(' & ')} and can help build the MVP.`);
    setCollabContact(user?.email || '');
  };

  const handleSendCollaborationRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectForCollab) return;

    setIsSubmittingCollab(true);
    const projectId = selectedProjectForCollab.id;

    try {
      await addDoc(collection(db, 'project_collaborations'), {
        projectId,
        projectTitle: selectedProjectForCollab.title,
        authorId: selectedProjectForCollab.authorId,
        applicantUid: auth.currentUser?.uid || user?.regNo || 'guest',
        applicantName: user?.name || 'VIT Contributor',
        applicantAvatar: user?.avatarUrl || null,
        role: collabRole,
        message: collabMessage,
        contact: collabContact,
        status: 'Pending',
        timestamp: serverTimestamp()
      });

      // Mark locally as collaborated
      setCollaboratedProjectIds(prev => new Set(prev).add(projectId));
      
      // Optimistically increment collaborator count
      setProjects(prev => prev.map(p => {
        if (p.id === projectId) {
          return { ...p, collaboratorsCount: (p.collaboratorsCount || 1) + 1 };
        }
        return p;
      }));

      showGlobalToast(`Collaboration request sent to ${selectedProjectForCollab.authorName}! 🎉`);
      addNotification(`Sent collaboration request for project: ${selectedProjectForCollab.title}`);
    } catch (err) {
      console.warn('Recorded collaboration request locally:', err);
      setCollaboratedProjectIds(prev => new Set(prev).add(projectId));
      showGlobalToast(`Collaboration request submitted for ${selectedProjectForCollab.title}!`);
    } finally {
      setIsSubmittingCollab(false);
      setSelectedProjectForCollab(null);
    }
  };

  // Toggle Star / Like
  const handleToggleStar = async (project: ShowcaseProject) => {
    const isLiked = likedProjectIds.has(project.id);
    const newLiked = new Set(likedProjectIds);
    if (isLiked) {
      newLiked.delete(project.id);
    } else {
      newLiked.add(project.id);
    }
    setLikedProjectIds(newLiked);

    setProjects(prev => prev.map(p => {
      if (p.id === project.id) {
        return {
          ...p,
          starsCount: Math.max(0, (p.starsCount || 0) + (isLiked ? -1 : 1))
        };
      }
      return p;
    }));

    showGlobalToast(isLiked ? 'Removed star' : `Starred ${project.title} ⭐`);
  };

  // Filtered projects
  const filteredProjects = projects.filter(project => {
    const matchesSearch = 
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.technologies.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (project.lookingForRoles || []).some(r => r.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || project.category === selectedCategory;
    const matchesLooking = !onlyLookingForTeam || (project.lookingForRoles && project.lookingForRoles.length > 0);
    const matchesMyProjects = !onlyMyProjects || (
      project.authorId === (auth.currentUser?.uid || user?.regNo || 'me') ||
      project.authorName.toLowerCase() === (user?.name || '').toLowerCase()
    );

    return matchesSearch && matchesCategory && matchesLooking && matchesMyProjects;
  });

  return (
    <div className={cn("w-full space-y-6", className)}>
      {/* Top Banner & Action Header */}
      <div className="glass-panel rounded-3xl p-5 border border-white/10 relative overflow-hidden bg-gradient-to-br from-brand-dark via-[#0F172A] to-[#0B0F17]">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-blue/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-blue/20 text-brand-blue border border-brand-blue/30 flex items-center gap-1.5 shadow-sm">
                <Rocket className="w-3.5 h-3.5 animate-pulse" />
                Project Showcase
              </span>
              <span className="text-xs text-gray-400 font-mono">
                {projects.length} Ongoing Projects
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Campus Project Showcase
            </h1>
            <p className="text-sm text-gray-300 mt-1 max-w-xl leading-relaxed">
              Discover ongoing student projects, pitch in with your skills via the <strong className="text-brand-blue font-semibold">Collaborate</strong> button, or showcase your own build to find passionate teammates!
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => {
                setBrandingProject({
                  title: 'My Project',
                  technologies: ['React', 'TypeScript', 'Tailwind CSS'],
                  category: 'Web Application'
                });
                setBrandingModalOpen(true);
              }}
              title="Generate visual avatar branding for your tech stack"
              className="px-3.5 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-xs font-semibold flex items-center gap-2 transition-all"
            >
              <Palette className="w-4 h-4 text-purple-400" />
              <span className="hidden sm:inline">Avatar Studio</span>
            </button>

            <button
              onClick={() => setIsPostModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-blue-600/25 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Post Ongoing Project</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ongoing projects, skills (e.g. React, Flutter, AI), or titles..."
              className="w-full pl-10 pr-9 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Filter Toggles */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setOnlyLookingForTeam(prev => !prev)}
              className={cn(
                "px-3 py-2 rounded-2xl text-xs font-semibold border transition-all flex items-center gap-1.5",
                onlyLookingForTeam
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm"
                  : "bg-white/5 text-gray-400 border-white/10 hover:text-white"
              )}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Seeking Contributors</span>
            </button>

            <button
              onClick={() => setOnlyMyProjects(prev => !prev)}
              className={cn(
                "px-3 py-2 rounded-2xl text-xs font-semibold border transition-all flex items-center gap-1.5",
                onlyMyProjects
                  ? "bg-blue-500/20 text-blue-300 border-blue-500/40 shadow-sm"
                  : "bg-white/5 text-gray-400 border-white/10 hover:text-white"
              )}
            >
              <span>My Projects</span>
            </button>
          </div>
        </div>

        {/* Category Horizontal Scrolling Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {CATEGORIES.map(cat => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border shrink-0",
                  isSelected
                    ? "bg-brand-blue text-white border-brand-blue shadow-sm shadow-brand-blue/20"
                    : "bg-white/5 text-gray-400 border-white/10 hover:text-white hover:bg-white/10"
                )}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Projects Grid List */}
      {filteredProjects.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center border border-white/10 space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400">
            <FolderGit2 className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white">No projects found</h3>
          <p className="text-sm text-gray-400 max-w-sm mx-auto">
            {searchQuery 
              ? `No ongoing projects matched "${searchQuery}". Try different keywords or tech stacks.`
              : 'Be the first to post your ongoing project to the showcase!'}
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setOnlyLookingForTeam(false);
              setOnlyMyProjects(false);
            }}
            className="text-xs text-brand-blue hover:underline font-semibold"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProjects.map((project) => {
            const hasCollaborated = collaboratedProjectIds.has(project.id);
            const isStarred = likedProjectIds.has(project.id);
            const isOwner = project.authorId === (auth.currentUser?.uid || user?.regNo || 'me');

            return (
              <div
                key={project.id}
                className="glass-panel rounded-3xl p-5 border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between group relative overflow-hidden bg-gradient-to-b from-[#121824]/90 to-[#0B0F17]/90 shadow-lg hover:shadow-xl hover:shadow-brand-blue/5"
              >
                {/* Accent top stripe */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500/40 via-purple-500/30 to-emerald-500/40 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div>
                  {/* Header Row: Avatar, Title, Status */}
                  <div className="flex items-start gap-3.5 mb-3">
                    <ProjectAvatar
                      title={project.title}
                      technologies={project.technologies}
                      avatarUrl={project.customAvatarUrl}
                      size="md"
                      showGlow={true}
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-base font-bold text-white tracking-tight truncate group-hover:text-blue-300 transition-colors">
                          {project.title}
                        </h3>

                        {/* Status Badge */}
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 border",
                          project.status.includes('Looking for')
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : project.status.includes('Hackathon')
                            ? "bg-purple-500/10 text-purple-400 border-purple-500/30"
                            : "bg-blue-500/10 text-blue-400 border-blue-500/30"
                        )}>
                          {project.status.replace('Ongoing • ', '')}
                        </span>
                      </div>

                      {/* Author Info */}
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
                        <img
                          src={project.authorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${project.authorName}`}
                          alt={project.authorName}
                          className="w-4 h-4 rounded-full object-cover border border-white/10"
                        />
                        <span className="font-medium text-gray-300 truncate max-w-[120px]">{project.authorName}</span>
                        <span>•</span>
                        <span className="truncate max-w-[140px] text-gray-500">{project.authorBranch || 'VIT Chennai'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-300 leading-relaxed mb-4 line-clamp-3">
                    {project.description}
                  </p>

                  {/* Technologies Stack Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-3.5">
                    {project.technologies.map(tech => (
                      <span
                        key={tech}
                        className="px-2.5 py-0.5 rounded-lg text-xs font-mono bg-white/5 border border-white/10 text-gray-300"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Looking For Roles Section (if any) */}
                  {project.lookingForRoles && project.lookingForRoles.length > 0 && (
                    <div className="mb-4 p-2.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 text-xs">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-semibold mb-1">
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Seeking Collaborators for:</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {project.lookingForRoles.map(role => (
                          <span
                            key={role}
                            className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[11px]"
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Controls: Links, Star, and the 'Collaborate' Button */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2 mt-2">
                  {/* Left stats & repo */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleStar(project)}
                      className={cn(
                        "flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all border",
                        isStarred
                          ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                          : "bg-white/5 text-gray-400 border-white/10 hover:text-white"
                      )}
                      title="Star this project"
                    >
                      <Star className={cn("w-3.5 h-3.5", isStarred && "fill-yellow-400 text-yellow-400")} />
                      <span>{project.starsCount || 0}</span>
                    </button>

                    {project.repoUrl && (
                      <a
                        href={project.repoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 transition-colors"
                        title="View GitHub Repository"
                      >
                        <Github className="w-4 h-4" />
                      </a>
                    )}

                    {project.demoUrl && (
                      <a
                        href={project.demoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 transition-colors"
                        title="Live Demo"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>

                  {/* Prominent Collaborate Button */}
                  {isOwner ? (
                    <span className="px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-300 border border-blue-500/20 text-xs font-semibold">
                      Your Project
                    </span>
                  ) : hasCollaborated ? (
                    <button
                      disabled
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 cursor-default"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Request Sent</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpenCollabModal(project)}
                      className="px-4 py-1.5 rounded-xl bg-brand-blue hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                      title={`Request to collaborate with ${project.authorName}`}
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Collaborate</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Post Ongoing Project Modal */}
      <AnimatePresence>
        {isPostModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPostModalOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative z-10 w-full max-w-xl max-h-[90vh] bg-[#0E131F] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-white/10 flex items-center justify-between shrink-0 bg-white/5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-brand-blue/20 flex items-center justify-center text-brand-blue border border-brand-blue/30 shadow-sm">
                    <Rocket className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Post Ongoing Project</h2>
                    <p className="text-xs text-gray-400">Share your project with the VIT Chennai community & recruit teammates</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsPostModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleCreateProject} className="p-5 overflow-y-auto space-y-4 text-sm flex-1">
                {/* Live Avatar Preview */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4">
                  <ProjectAvatar
                    title={postTitle || 'New Project'}
                    technologies={postTechnologies}
                    size="lg"
                    showGlow={true}
                  />
                  <div>
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
                      Live Stack Avatar Preview
                    </div>
                    <div className="text-sm font-bold text-white">
                      {postTitle || 'Your Project Title'}
                    </div>
                    <div className="text-xs text-gray-400 font-mono mt-0.5">
                      {postTechnologies.join(' • ') || 'Select tech stacks below'}
                    </div>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Project Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    placeholder="e.g. CampusRide, NeuralPaper, AlgoArena..."
                    className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-brand-blue"
                  />
                </div>

                {/* Brief Description */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Brief Description <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={postDescription}
                    onChange={(e) => setPostDescription(e.target.value)}
                    placeholder="Describe what your ongoing project does, what problem it solves, and current progress..."
                    className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-brand-blue resize-none"
                  />
                </div>

                {/* Category & Status Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">Category</label>
                    <select
                      value={postCategory}
                      onChange={(e) => setPostCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-brand-blue text-xs"
                    >
                      <option value="Web Application">Web Application</option>
                      <option value="Mobile App">Mobile App</option>
                      <option value="AI & Machine Learning">AI & Machine Learning</option>
                      <option value="IoT & Hardware">IoT & Hardware</option>
                      <option value="Cloud & DevOps">Cloud & DevOps</option>
                      <option value="Cybersecurity">Cybersecurity</option>
                      <option value="Open Source Tool">Open Source Tool</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">Ongoing Status</label>
                    <select
                      value={postStatus}
                      onChange={(e) => setPostStatus(e.target.value)}
                      className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-brand-blue text-xs"
                    >
                      <option value="Ongoing • Looking for Contributors">Ongoing • Looking for Contributors</option>
                      <option value="Ongoing • In Active Development">Ongoing • In Active Development</option>
                      <option value="Ongoing • Prototyping">Ongoing • Prototyping</option>
                      <option value="Ongoing • Hackathon Sprint">Ongoing • Hackathon Sprint</option>
                      <option value="Ongoing • Polishing MVP">Ongoing • Polishing MVP</option>
                    </select>
                  </div>
                </div>

                {/* Tech Stack Tags Input */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Technology Stack Tags
                  </label>
                  
                  {/* Selected Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {postTechnologies.map(tech => (
                      <span
                        key={tech}
                        className="px-2.5 py-1 rounded-lg text-xs font-mono bg-brand-blue/20 text-brand-blue border border-brand-blue/30 flex items-center gap-1.5"
                      >
                        {tech}
                        <button
                          type="button"
                          onClick={() => handleRemoveTech(tech)}
                          className="hover:text-red-400"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>

                  {/* Custom Input */}
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={techInput}
                      onChange={(e) => setTechInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTech(techInput);
                        }
                      }}
                      placeholder="Add tech (e.g. Next.js, Redis, PyTorch)..."
                      className="flex-1 px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-brand-blue text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddTech(techInput)}
                      className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold"
                    >
                      Add
                    </button>
                  </div>

                  {/* Popular suggestions */}
                  <div className="flex flex-wrap gap-1 text-[11px] text-gray-400">
                    <span className="py-0.5">Quick add:</span>
                    {POPULAR_TECH_SUGGESTIONS.slice(0, 8).map(tech => (
                      <button
                        key={tech}
                        type="button"
                        onClick={() => handleAddTech(tech)}
                        className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 hover:text-white"
                      >
                        +{tech}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Seeking Collaborators for Roles */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Seeking Collaborators for Roles
                  </label>
                  
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {postLookingForRoles.map(role => (
                      <span
                        key={role}
                        className="px-2.5 py-1 rounded-lg text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5"
                      >
                        {role}
                        <button
                          type="button"
                          onClick={() => handleRemoveRole(role)}
                          className="hover:text-red-400"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-1 text-[11px] text-gray-400">
                    <span className="py-0.5">Suggestions:</span>
                    {ROLE_SUGGESTIONS.map(role => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => handleAddRole(role)}
                        className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 hover:text-white"
                      >
                        +{role}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Optional Links */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">GitHub Repository URL (Optional)</label>
                    <input
                      type="url"
                      value={postRepoUrl}
                      onChange={(e) => setPostRepoUrl(e.target.value)}
                      placeholder="https://github.com/..."
                      className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-brand-blue text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">Demo / Pitch URL (Optional)</label>
                    <input
                      type="url"
                      value={postDemoUrl}
                      onChange={(e) => setPostDemoUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-brand-blue text-xs"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsPostModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !postTitle.trim() || !postDescription.trim()}
                    className="px-5 py-2.5 rounded-xl bg-brand-blue hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-blue-500/25 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>Publishing...</span>
                    ) : (
                      <>
                        <Rocket className="w-4 h-4" />
                        <span>Publish Project</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Collaborate Modal */}
      <AnimatePresence>
        {selectedProjectForCollab && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProjectForCollab(null)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative z-10 w-full max-w-lg bg-[#0E131F] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white"
            >
              <div className="p-5 border-b border-white/10 flex items-center justify-between shrink-0 bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/30">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Collaborate on Project</h2>
                    <p className="text-xs text-gray-400">Team up with {selectedProjectForCollab.authorName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedProjectForCollab(null)}
                  className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSendCollaborationRequest} className="p-5 space-y-4 text-sm">
                {/* Target Project Summary */}
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                  <ProjectAvatar
                    title={selectedProjectForCollab.title}
                    technologies={selectedProjectForCollab.technologies}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-white text-sm truncate">{selectedProjectForCollab.title}</h4>
                    <p className="text-xs text-gray-400 truncate">{selectedProjectForCollab.status} • Led by {selectedProjectForCollab.authorName}</p>
                  </div>
                </div>

                {/* Select Your Role */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    How would you like to contribute? (Your Role)
                  </label>
                  <select
                    value={collabRole}
                    onChange={(e) => setCollabRole(e.target.value)}
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-brand-blue"
                  >
                    {selectedProjectForCollab.lookingForRoles?.map(role => (
                      <option key={role} value={role}>{role} (Project is seeking this!)</option>
                    ))}
                    <option value="Frontend Engineer">Frontend Engineer</option>
                    <option value="Backend Developer">Backend Developer</option>
                    <option value="Full-Stack Developer">Full-Stack Developer</option>
                    <option value="UI/UX Designer">UI/UX Designer</option>
                    <option value="Mobile App Developer">Mobile App Developer</option>
                    <option value="AI/ML Specialist">AI/ML Specialist</option>
                    <option value="DevOps / Cloud">DevOps / Cloud</option>
                    <option value="QA / Tester">QA / Tester</option>
                  </select>
                </div>

                {/* Collaboration Message */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Collaboration Pitch / Note
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={collabMessage}
                    onChange={(e) => setCollabMessage(e.target.value)}
                    placeholder="Tell the author what skills you bring, past hackathon projects, or what you'd like to work on..."
                    className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-brand-blue resize-none text-xs"
                  />
                </div>

                {/* Contact Email / Discord / Phone */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Your Contact Info (Email / GitHub / Telegram)
                  </label>
                  <input
                    type="text"
                    value={collabContact}
                    onChange={(e) => setCollabContact(e.target.value)}
                    placeholder="e.g. student@vit.ac.in or @github_handle"
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-brand-blue text-xs"
                  />
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedProjectForCollab(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingCollab || !collabMessage.trim()}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/25 disabled:opacity-50"
                  >
                    {isSubmittingCollab ? (
                      <span>Sending Request...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Collaboration Request</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Visual Avatar Studio Modal */}
      <ProjectBrandingToolModal
        isOpen={brandingModalOpen}
        onClose={() => setBrandingModalOpen(false)}
        initialTitle={brandingProject.title}
        initialTechnologies={brandingProject.technologies}
        initialCategory={brandingProject.category}
      />
    </div>
  );
}
