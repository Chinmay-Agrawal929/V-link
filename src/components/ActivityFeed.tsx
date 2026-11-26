import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  Code2, 
  Users, 
  Calendar, 
  Sparkles, 
  Star, 
  GitFork, 
  ExternalLink, 
  MessageSquare, 
  Check, 
  X, 
  Search, 
  Send, 
  Plus, 
  Flame, 
  Clock, 
  Share2, 
  Bookmark,
  Radio,
  ArrowRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { useAppStore } from '@/store';
import { cn } from '@/lib/utils';
import { db, auth } from '@/lib/firebase';
import { collection, getDocs, query, limit, orderBy } from 'firebase/firestore';
import { useQuery } from '@tanstack/react-query';

export type ActivityType = 'all' | 'project' | 'connection' | 'event';

export interface ProjectActivity {
  id: string;
  type: 'project';
  title: string;
  author: string;
  authorAvatar?: string;
  authorRole: string;
  timestamp: string;
  description: string;
  techStack: string[];
  stars: number;
  forks?: number;
  repoUrl?: string;
  milestoneTag: string;
  isStarred?: boolean;
}

export interface ConnectionActivity {
  id: string;
  type: 'connection';
  user1: { name: string; avatar?: string; branch: string };
  user2: { name: string; avatar?: string; branch: string };
  timestamp: string;
  mutualInterest: string;
  collabTitle?: string;
  greeted?: boolean;
}

export interface EventActivity {
  id: string;
  type: 'event';
  title: string;
  organizer: string;
  date: string;
  timeRemaining: string;
  location: string;
  lookingFor: string[];
  attendeesCount: number;
  isRsvpd?: boolean;
  category: 'Hackathon' | 'Workshop' | 'Sprint' | 'Meetup';
  link?: string;
}

export type ActivityItem = ProjectActivity | ConnectionActivity | EventActivity;

const INITIAL_ACTIVITIES: ActivityItem[] = [
  {
    id: 'proj-1',
    type: 'project',
    title: 'campus-copilot-vit',
    author: 'Vikram Singh',
    authorRole: '3rd Year B.Tech CSE',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram',
    timestamp: '15m ago',
    description: '🚀 Shipped v1.4 with offline timetables sync & automated classroom wayfinding! Looking for 1 React Native dev to build iOS widgets.',
    techStack: ['React Native', 'TypeScript', 'FastAPI', 'SQLite'],
    stars: 38,
    forks: 7,
    repoUrl: 'https://github.com/vit-devs/campus-copilot',
    milestoneTag: 'Feature Release'
  },
  {
    id: 'conn-1',
    type: 'connection',
    user1: { name: 'Sneha Reddy', branch: '3rd Year IT', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha' },
    user2: { name: 'Rohan Verma', branch: 'Design Lead (ECE)', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan' },
    timestamp: '42m ago',
    mutualInterest: 'Three.js & UI/UX Systems',
    collabTitle: 'Team formed for DevJams 2027 🎨⚡'
  },
  {
    id: 'event-1',
    type: 'event',
    title: 'DevJams 2027 - 36hr Campus Hackathon',
    organizer: 'GDSC VIT Chennai',
    date: 'Oct 18-20, 2027',
    timeRemaining: 'Starts in 4 days',
    location: 'Netaji Subhash Tech Tower (AB-3)',
    lookingFor: ['Frontend (React)', 'Fullstack Python', 'UI/UX Designer'],
    attendeesCount: 142,
    category: 'Hackathon',
    link: 'https://vitcc.ac.in/events'
  },
  {
    id: 'proj-2',
    type: 'project',
    title: 'vit-attendance-matrix-api',
    author: 'Ananya Sharma',
    authorRole: '2nd Year AI & Data Science',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya',
    timestamp: '2h ago',
    description: '📊 Benchmarked a zero-trust encrypted API that calculates exact attendance thresholds before debarment. Now supporting multi-slot lab practicals.',
    techStack: ['Python', 'Docker', 'Redis', 'Tailwind'],
    stars: 56,
    forks: 14,
    repoUrl: 'https://github.com/ananya-vit/attendance-matrix',
    milestoneTag: 'Benchmark Milestone'
  },
  {
    id: 'conn-2',
    type: 'connection',
    user1: { name: 'Aarav Patel', branch: '4th Year EEE', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav' },
    user2: { name: 'Kavya Pillai', branch: '2nd Year CSE (CyberSec)', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kavya' },
    timestamp: '3h ago',
    mutualInterest: 'Embedded Rust & IoT Hardware Security',
    collabTitle: 'Collaborating on Smart Lab Sensors'
  },
  {
    id: 'event-2',
    type: 'event',
    title: 'Open Source Chennai: Kernel & WebAssembly Sprint',
    organizer: 'ACM Student Chapter',
    date: 'Tomorrow, 5:30 PM',
    timeRemaining: 'Tomorrow',
    location: 'Smart Classroom 408 (Delta Block)',
    lookingFor: ['C / C++', 'Rust Beginners', 'Wasm Curious'],
    attendeesCount: 88,
    category: 'Sprint',
    link: 'https://acmvit.in'
  },
  {
    id: 'proj-3',
    type: 'project',
    title: 'vtop-exam-scheduler-extension',
    author: 'Karthik Raja',
    authorRole: '3rd Year CSE Core',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Karthik',
    timestamp: '5h ago',
    description: '✨ Chrome Extension update: auto-generates iCal & Google Calendar alerts for CAT-1 & CAT-2 seating arrangements. 400+ active campus installs!',
    techStack: ['TypeScript', 'Chrome API', 'Vite', 'Tailwind'],
    stars: 92,
    forks: 21,
    repoUrl: 'https://github.com/karthik-vit/vtop-exam-scheduler',
    milestoneTag: 'Store Update'
  },
  {
    id: 'conn-3',
    type: 'connection',
    user1: { name: 'Meera Iyer', branch: '1st Year CSE', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Meera' },
    user2: { name: 'Vikram Singh', branch: '3rd Year CSE', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram' },
    timestamp: '6h ago',
    mutualInterest: 'Competitive Programming & DSA Mentorship',
    collabTitle: 'Mentorship connection established'
  },
  {
    id: 'event-3',
    type: 'event',
    title: 'VIT AI Lab: Fine-Tuning LLMs on Campus Notes',
    organizer: 'Centre for Cognitive Computing',
    date: 'Friday, 4:00 PM',
    timeRemaining: 'In 3 days',
    location: 'Auditorium 2 & Hybrid Stream',
    lookingFor: ['PyTorch', 'Hugging Face', 'Data Curators'],
    attendeesCount: 115,
    category: 'Workshop',
    link: 'https://vitcc.ac.in/c3'
  }
];

interface ActivityFeedProps {
  onClose?: () => void;
  isModal?: boolean;
}

export default function ActivityFeed({ onClose, isModal = false }: ActivityFeedProps) {
  const { user, addNotification, addMessage, setTab, setNetworkTab } = useAppStore();
  const [filter, setFilter] = useState<ActivityType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activities, setActivities] = useState<ActivityItem[]>(INITIAL_ACTIVITIES);
  const [isQuickPostOpen, setQuickPostOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newTech, setNewTech] = useState('');
  const [newType, setNewType] = useState<'project' | 'event'>('project');

  // Query live events from firestore to merge if available
  const { data: remoteEvents = [] } = useQuery({
    queryKey: ['vit_events_feed'],
    queryFn: async () => {
      try {
        const snap = await getDocs(query(collection(db, 'vit_events'), limit(6)));
        return snap.docs.map(doc => {
          const d = doc.data();
          return {
            id: doc.id,
            type: 'event' as const,
            title: d.title || 'Campus Collaboration Event',
            organizer: d.organizer || d.club || 'VIT Student Council',
            date: d.date || 'Upcoming',
            timeRemaining: 'Coming soon',
            location: d.venue || d.location || 'VIT Chennai Campus',
            lookingFor: d.tags || ['Students', 'Collaborators'],
            attendeesCount: d.attendees || 45,
            category: (d.category || 'Event') as any,
            link: d.link || '#'
          };
        });
      } catch (err) {
        return [];
      }
    },
    staleTime: 1000 * 60 * 5,
  });

  // Combine and deduplicate
  const combinedActivities = useMemo(() => {
    const list = [...activities];
    if (remoteEvents.length > 0) {
      remoteEvents.forEach(re => {
        if (!list.some(a => a.id === re.id || (a.type !== 'connection' && a.title === re.title))) {
          list.push(re);
        }
      });
    }
    return list;
  }, [activities, remoteEvents]);

  // Filtered activities
  const filteredList = useMemo(() => {
    return combinedActivities.filter(item => {
      if (filter !== 'all' && item.type !== filter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      if (item.type === 'project') {
        return (
          item.title.toLowerCase().includes(q) ||
          item.author.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.techStack.some(t => t.toLowerCase().includes(q))
        );
      }
      if (item.type === 'connection') {
        return (
          item.user1.name.toLowerCase().includes(q) ||
          item.user2.name.toLowerCase().includes(q) ||
          item.mutualInterest.toLowerCase().includes(q) ||
          (item.collabTitle && item.collabTitle.toLowerCase().includes(q))
        );
      }
      if (item.type === 'event') {
        return (
          item.title.toLowerCase().includes(q) ||
          item.organizer.toLowerCase().includes(q) ||
          item.location.toLowerCase().includes(q) ||
          item.lookingFor.some(t => t.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [combinedActivities, filter, searchQuery]);

  // Counts for tabs
  const counts = useMemo(() => {
    return {
      all: combinedActivities.length,
      project: combinedActivities.filter(a => a.type === 'project').length,
      connection: combinedActivities.filter(a => a.type === 'connection').length,
      event: combinedActivities.filter(a => a.type === 'event').length,
    };
  }, [combinedActivities]);

  // Actions
  const handleToggleStar = (projectId: string) => {
    setActivities(prev =>
      prev.map(item => {
        if (item.id === projectId && item.type === 'project') {
          const isStarred = !item.isStarred;
          const stars = item.stars + (isStarred ? 1 : -1);
          if (isStarred) {
            addNotification(`Starred project: ${item.title}`);
          }
          return { ...item, isStarred, stars };
        }
        return item;
      })
    );
  };

  const handleToggleRsvp = (eventId: string) => {
    setActivities(prev =>
      prev.map(item => {
        if (item.id === eventId && item.type === 'event') {
          const isRsvpd = !item.isRsvpd;
          const attendeesCount = item.attendeesCount + (isRsvpd ? 1 : -1);
          if (isRsvpd) {
            addNotification(`RSVP confirmed for "${item.title}"! Saved to your schedule.`);
          }
          return { ...item, isRsvpd, attendeesCount };
        }
        return item;
      })
    );
  };

  const handleWave = (conn: ConnectionActivity) => {
    setActivities(prev =>
      prev.map(item => {
        if (item.id === conn.id && item.type === 'connection') {
          return { ...item, greeted: true };
        }
        return item;
      })
    );
    addNotification(`Sent a collaborative wave to ${conn.user1.name} and ${conn.user2.name}! 👋`);
    addMessage({
      id: Date.now().toString(),
      sender: conn.user1.name,
      isOfficial: false,
      unread: false,
      timestamp: 'Just now',
      content: `Hey! Saw your wave on the Activity Feed regarding our collaboration on "${conn.collabTitle || conn.mutualInterest}". Happy to connect!`
    });
  };

  const handleCollabRequest = (proj: ProjectActivity) => {
    addNotification(`Collaboration interest sent to ${proj.author} for "${proj.title}"! 🚀`);
    addMessage({
      id: Date.now().toString(),
      sender: proj.author,
      isOfficial: false,
      unread: false,
      timestamp: 'Just now',
      content: `Thanks for checking out ${proj.title}! We are currently working on ${proj.techStack.join(', ')}. What would you like to build together?`
    });
    if (onClose) onClose();
    setTab('network');
    setNetworkTab('messages');
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    if (newType === 'project') {
      const newProj: ProjectActivity = {
        id: `custom-proj-${Date.now()}`,
        type: 'project',
        title: newTitle.trim(),
        author: user?.name || 'VIT Developer',
        authorRole: user?.branch ? `${user.branch} • ${user.regNo || 'Student'}` : 'VIT Student',
        authorAvatar: user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Dev'}`,
        timestamp: 'Just now',
        description: newDesc.trim() || 'Working on this new project. Looking for peers to collaborate and test!',
        techStack: newTech ? newTech.split(',').map(s => s.trim()).filter(Boolean) : ['React', 'TypeScript'],
        stars: 1,
        forks: 0,
        milestoneTag: 'New Project',
        isStarred: true
      };
      setActivities(prev => [newProj, ...prev]);
      addNotification(`Project update "${newProj.title}" posted to the Activity Feed!`);
    } else {
      const newEvt: EventActivity = {
        id: `custom-evt-${Date.now()}`,
        type: 'event',
        title: newTitle.trim(),
        organizer: user?.name || 'Student Initiative',
        date: 'This Weekend',
        timeRemaining: 'Upcoming',
        location: 'VIT Chennai Campus / Online',
        lookingFor: newTech ? newTech.split(',').map(s => s.trim()).filter(Boolean) : ['Developers', 'Designers'],
        attendeesCount: 1,
        category: 'Sprint',
        isRsvpd: true
      };
      setActivities(prev => [newEvt, ...prev]);
      addNotification(`Collaboration event "${newEvt.title}" broadcasted!`);
    }

    setNewTitle('');
    setNewDesc('');
    setNewTech('');
    setQuickPostOpen(false);
  };

  return (
    <div className={cn(
      "flex flex-col h-full bg-[#0B0F17]/95 backdrop-blur-xl text-white select-none",
      isModal ? "p-4 sm:p-6" : "p-3 sm:p-5"
    )}>
      {/* Top Bar Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-blue/30 via-indigo-500/20 to-purple-500/30 border border-brand-blue/30 shadow-lg shadow-brand-blue/10">
            <Activity className="w-5 h-5 text-brand-blue animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-[#0B0F17] animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-[#0B0F17]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                Campus Activity Feed
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-brand-blue/15 text-brand-blue rounded-full border border-brand-blue/20">
                LIVE
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Recent student projects, peer connections & collaboration events
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setQuickPostOpen(!isQuickPostOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-brand-blue text-white hover:bg-brand-blue/90 active:scale-95 transition-all shadow-md shadow-brand-blue/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Broadcast</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close Activity Feed"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Quick Broadcast Panel Drawer (Collapsible) */}
      <AnimatePresence>
        {isQuickPostOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-white/10 pb-4 pt-3 shrink-0"
          >
            <form onSubmit={handleCreatePost} className="glass-panel p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-blue" />
                  Broadcast to Campus Feed
                </span>
                <div className="flex gap-1 bg-black/40 p-1 rounded-xl border border-white/5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setNewType('project')}
                    className={cn(
                      "px-2.5 py-1 rounded-lg transition-colors font-medium",
                      newType === 'project' ? "bg-brand-blue text-white" : "text-gray-400 hover:text-white"
                    )}
                  >
                    💻 Project Update
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewType('event')}
                    className={cn(
                      "px-2.5 py-1 rounded-lg transition-colors font-medium",
                      newType === 'event' ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"
                    )}
                  >
                    🚀 Collab Event
                  </button>
                </div>
              </div>

              <input
                type="text"
                placeholder={newType === 'project' ? "Project title (e.g. campus-mesh-network)" : "Event title (e.g. HackVIT Hackathon Prep)"}
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-blue"
              />

              {newType === 'project' && (
                <textarea
                  placeholder="What did you build or release? Mention roles you need..."
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-blue resize-none"
                />
              )}

              <input
                type="text"
                placeholder="Tech tags or roles needed (comma separated: React, Python, UI/UX)"
                value={newTech}
                onChange={e => setNewTech(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-blue"
              />

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setQuickPostOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-xs text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500 text-white hover:bg-emerald-600 active:scale-95 transition-all"
                >
                  Post to Feed
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Tabs & Search Bar */}
      <div className="pt-3 pb-2 space-y-2 shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setFilter('all')}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all",
              filter === 'all'
                ? "bg-brand-blue text-white shadow-sm shadow-brand-blue/30"
                : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
            )}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>All Updates</span>
            <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-black/30">
              {counts.all}
            </span>
          </button>

          <button
            onClick={() => setFilter('project')}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all",
              filter === 'project'
                ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
            )}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Projects</span>
            <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-black/30">
              {counts.project}
            </span>
          </button>

          <button
            onClick={() => setFilter('connection')}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all",
              filter === 'connection'
                ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30"
                : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
            )}
          >
            <Users className="w-3.5 h-3.5" />
            <span>New Connections</span>
            <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-black/30">
              {counts.connection}
            </span>
          </button>

          <button
            onClick={() => setFilter('event')}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all",
              filter === 'event'
                ? "bg-purple-600 text-white shadow-sm shadow-purple-600/30"
                : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
            )}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Collab Events</span>
            <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-black/30">
              {counts.event}
            </span>
          </button>
        </div>

        {/* Search Filter Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects, skills, students, or hackathons..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-blue transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Stream Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pt-2 pb-6">
        {filteredList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <Activity className="w-10 h-10 text-gray-600 mb-3" />
            <h3 className="text-sm font-semibold text-gray-300">No activity matching your search</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-xs">
              Try adjusting your filter or search query to explore student projects, connections, and events.
            </p>
            <button
              onClick={() => { setFilter('all'); setSearchQuery(''); }}
              className="mt-3 px-3 py-1.5 rounded-xl text-xs bg-white/10 text-white hover:bg-white/15"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredList.map(item => {
            if (item.type === 'project') {
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="glass-panel p-4 rounded-2xl border border-white/10 hover:border-indigo-500/30 transition-all bg-white/[0.02]"
                >
                  {/* Project Header */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={item.authorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.author}`}
                        alt={item.author}
                        className="w-9 h-9 rounded-full bg-black/40 border border-white/10 object-cover"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white hover:underline cursor-pointer">
                            {item.author}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
                            {item.milestoneTag}
                          </span>
                        </div>
                        <span className="text-[11px] text-gray-400 block">
                          {item.authorRole} • <Clock className="w-2.5 h-2.5 inline mr-0.5 text-gray-500" />{item.timestamp}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleStar(item.id)}
                      className={cn(
                        "flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium transition-colors border",
                        item.isStarred
                          ? "bg-amber-400/15 text-amber-300 border-amber-400/30"
                          : "bg-white/5 text-gray-400 hover:text-white border-white/10"
                      )}
                    >
                      <Star className={cn("w-3.5 h-3.5", item.isStarred && "fill-amber-400 text-amber-400")} />
                      <span>{item.stars}</span>
                    </button>
                  </div>

                  {/* Project Title & Description */}
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Code2 className="w-4 h-4 text-brand-blue shrink-0" />
                      <h4 className="font-mono text-xs font-semibold text-brand-blue tracking-tight hover:underline cursor-pointer">
                        {item.title}
                      </h4>
                      {item.repoUrl && (
                        <a
                          href={item.repoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed pl-6">
                      {item.description}
                    </p>
                  </div>

                  {/* Tech Stack Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 pl-6 mb-3">
                    {item.techStack.map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-lg text-[10px] font-mono bg-white/5 text-gray-300 border border-white/5"
                      >
                        {tech}
                      </span>
                    ))}
                    {item.forks !== undefined && (
                      <span className="flex items-center gap-1 text-[10px] text-gray-400 ml-auto font-mono">
                        <GitFork className="w-3 h-3 text-gray-500" />
                        {item.forks} forks
                      </span>
                    )}
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs pl-6">
                    <button
                      onClick={() => handleCollabRequest(item)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-brand-blue hover:text-brand-blue/80 transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Request to Collab
                    </button>
                    <button
                      onClick={() => {
                        addNotification(`Copied link to ${item.title}`);
                        if (navigator.clipboard) {
                          navigator.clipboard.writeText(`https://github.com/vit-devs/${item.title}`);
                        }
                      }}
                      className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-white transition-colors"
                    >
                      <Share2 className="w-3 h-3" />
                      Share
                    </button>
                  </div>
                </motion.div>
              );
            }

            if (item.type === 'connection') {
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="glass-panel p-4 rounded-2xl border border-white/10 hover:border-emerald-500/30 transition-all bg-white/[0.02]"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="p-1 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                        <Users className="w-3.5 h-3.5" />
                      </span>
                      <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
                        New Campus Connection
                      </span>
                    </div>
                    <span className="text-[11px] text-gray-400 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5 text-gray-500" />
                      {item.timestamp}
                    </span>
                  </div>

                  {/* Connected Avatars */}
                  <div className="flex items-center gap-3 bg-black/20 p-3 rounded-xl border border-white/5 mb-3">
                    <div className="flex items-center -space-x-2">
                      <img
                        src={item.user1.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.user1.name}`}
                        alt={item.user1.name}
                        className="w-9 h-9 rounded-full bg-brand-dark border-2 border-[#0B0F17] object-cover"
                      />
                      <img
                        src={item.user2.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.user2.name}`}
                        alt={item.user2.name}
                        className="w-9 h-9 rounded-full bg-brand-dark border-2 border-[#0B0F17] object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-white truncate">
                        <span className="text-emerald-300">{item.user1.name}</span> &{' '}
                        <span className="text-emerald-300">{item.user2.name}</span>
                      </div>
                      <p className="text-[11px] text-gray-400 truncate">
                        {item.user1.branch} ⇄ {item.user2.branch}
                      </p>
                    </div>
                  </div>

                  {/* Mutual Context / Collab info */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <div className="text-[11px] text-gray-300">
                      <span className="text-gray-500">Shared focus:</span>{' '}
                      <span className="font-medium text-gray-200">{item.mutualInterest}</span>
                    </div>

                    <button
                      onClick={() => handleWave(item)}
                      disabled={item.greeted}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all",
                        item.greeted
                          ? "bg-white/5 text-gray-400 cursor-default"
                          : "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 active:scale-95"
                      )}
                    >
                      {item.greeted ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Waved</span>
                        </>
                      ) : (
                        <>
                          <span>Wave 👋</span>
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            }

            if (item.type === 'event') {
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="glass-panel p-4 rounded-2xl border border-white/10 hover:border-purple-500/30 transition-all bg-white/[0.02]"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="p-1 rounded-lg bg-purple-500/15 text-purple-400 border border-purple-500/20">
                        <Calendar className="w-3.5 h-3.5" />
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/20">
                        {item.category}
                      </span>
                      <span className="text-[11px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                        {item.timeRemaining}
                      </span>
                    </div>

                    <span className="text-[11px] text-gray-400">
                      {item.date}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white mb-1 hover:text-purple-300 transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-xs text-gray-400 mb-2">
                    Hosted by <span className="text-gray-200 font-medium">{item.organizer}</span> • {item.location}
                  </p>

                  {/* Looking for roles */}
                  <div className="bg-black/30 p-2.5 rounded-xl border border-white/5 mb-3">
                    <div className="text-[10px] uppercase font-bold text-purple-300 tracking-wider mb-1.5 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Looking For Teammates:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {item.lookingFor.map((role, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-purple-500/10 text-purple-200 border border-purple-500/20"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* RSVP & Action Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                    <span className="text-[11px] text-gray-400">
                      <strong className="text-white">{item.attendeesCount}</strong> students interested
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setTab('teams');
                          if (onClose) onClose();
                        }}
                        className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        Find Team
                      </button>
                      <button
                        onClick={() => handleToggleRsvp(item.id)}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all",
                          item.isRsvpd
                            ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                            : "bg-white/10 text-gray-300 hover:text-white hover:bg-white/15"
                        )}
                      >
                        {item.isRsvpd ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>RSVP'd</span>
                          </>
                        ) : (
                          <>
                            <span>RSVP / Join</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            }

            return null;
          })
        )}
      </div>
    </div>
  );
}
