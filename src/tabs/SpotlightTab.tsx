import React, { useState, useEffect } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, onSnapshot, query, limit, orderBy, getDocs } from 'firebase/firestore';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, ExternalLink } from 'lucide-react';

import { Briefcase, Bell, Trash2, Rocket, Calendar, ChevronRight, Star, Flame, Code, Activity, Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '@/store';
import { cn } from '@/lib/utils';
import ProjectAvatar from '@/components/ProjectAvatar';
import ProjectBrandingToolModal from '@/components/ProjectBrandingToolModal';
import ProjectShowcase from '@/components/ProjectShowcase';

const MOCK_HACKATHONS = [
  { id: 1, title: 'DevFest 2027', org: 'GDSC VIT Chennai', date: 'Oct 12-14', tag: 'Open', color: 'text-brand-green', bg: 'bg-brand-green/10' },
  { id: 2, title: 'HackVIT', org: 'VIT CC', date: 'Nov 1-3', tag: 'Closing Soon', color: 'text-red-400', bg: 'bg-red-400/10' },
];

const MOCK_PROJECTS = [
  { id: 1, title: 'vtop-automation-api', stars: 124, lang: 'TypeScript', author: 'manchikanti' },
  { id: 2, title: 'campus-navigator-ai', stars: 89, lang: 'Python', author: 'vit_devs' },
];

const MOCK_RECOMMENDATIONS = [
  { id: 101, title: 'SDE Intern (Summer 2027)', company: 'Google', location: 'Bengaluru', type: 'On-site', logo: 'G' },
  { id: 102, title: 'Frontend Developer', company: 'ACM VIT Chennai', location: 'Campus', type: 'Volunteer', logo: 'A' },
];

export default function SpotlightTab() {
  const { notifications, removeNotification, user, setActivityFeedOpen } = useAppStore();
  const [spotlightSubView, setSpotlightSubView] = useState<'showcase' | 'radar'>('showcase');
  const [isBrandingModalOpen, setIsBrandingModalOpen] = useState(false);
  const [selectedProjectForBranding, setSelectedProjectForBranding] = useState({
    title: 'CampusPulse',
    technologies: ['React', 'Node.js', 'Redis', 'TypeScript'],
    category: 'Web & Collaboration'
  });
  
  const { data: curatedEvents = [], isLoading: isLoadingCurated } = useQuery({
    queryKey: ['curated_events', auth.currentUser?.uid],
    queryFn: async () => {
      if (!auth.currentUser?.uid) return [];
      const res = await fetch(`/api/curate-events?uid=${auth.currentUser.uid}`);
      if (!res.ok) throw new Error("Failed to fetch curated events");
      return res.json();
    },
    enabled: !!auth.currentUser?.uid,
    staleTime: 1000 * 60 * 60,
  });

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['vit_events'],
    queryFn: async () => {
      const snapshot = await getDocs(query(collection(db, 'vit_events'), limit(10)));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 mins
  });

  const openUrl = (url: string) => {
    if (url) window.open(url, '_blank');
  };

  return (
    <div className="w-full h-full overflow-y-auto no-scrollbar pb-8">
      <div className="max-w-xl mx-auto px-4 pt-4 space-y-5">
        
        {/* Sub-Navigation Switch: Project Showcase vs Campus Radar */}
        <div className="flex items-center gap-1.5 p-1 bg-white/5 rounded-2xl border border-white/10 shadow-sm">
          <button
            onClick={() => setSpotlightSubView('showcase')}
            className={cn(
              "flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2",
              spotlightSubView === 'showcase'
                ? "bg-brand-blue text-white shadow-md shadow-brand-blue/30"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            )}
          >
            <Rocket className="w-3.5 h-3.5" />
            <span>Project Showcase</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 font-semibold">Live</span>
          </button>

          <button
            onClick={() => setSpotlightSubView('radar')}
            className={cn(
              "flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2",
              spotlightSubView === 'radar'
                ? "bg-white/15 text-white shadow-md"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            )}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Campus Radar</span>
          </button>
        </div>

        {spotlightSubView === 'showcase' ? (
          <ProjectShowcase
            onSelectProjectForBranding={(proj) => {
              setSelectedProjectForBranding({
                title: proj.title,
                technologies: proj.technologies,
                category: proj.category
              });
              setIsBrandingModalOpen(true);
            }}
          />
        ) : (
          <div className="space-y-6">
            {/* Dashboard Header */}
            <div className="px-1">
              <h1 className="text-2xl font-bold text-white tracking-tight">Campus Radar</h1>
              <p className="text-sm text-gray-400 mt-1">Hackathons, internships, and opportunities.</p>
            </div>

        {/* Top Widgets Grid */}
        <div className="grid grid-cols-3 gap-3">
          {/* Activity Feed Widget */}
          <div 
            onClick={() => setActivityFeedOpen(true)}
            className="glass-panel rounded-[22px] p-4 relative overflow-hidden group cursor-pointer hover:bg-white/5 transition-all border border-brand-blue/20 hover:border-brand-blue/50"
          >
            <div className="w-9 h-9 rounded-xl bg-brand-blue/20 flex items-center justify-center text-brand-blue mb-2.5 shadow-sm border border-brand-blue/30 relative z-10">
              <Activity className="w-4 h-4 animate-pulse" />
            </div>
            <h3 className="text-sm font-bold text-white relative z-10">Live Feed</h3>
            <p className="text-[11px] text-gray-400 mt-0.5 relative z-10">Updates & Collabs</p>
          </div>

          {/* Hackathons Widget */}
          <div className="glass-panel rounded-[22px] p-4 relative overflow-hidden group cursor-pointer hover:bg-white/5 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 mb-2.5 shadow-sm border border-purple-500/30 relative z-10">
              <Rocket className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white relative z-10">Hackathons</h3>
            <p className="text-[11px] text-gray-400 mt-0.5 relative z-10">2 deadlines</p>
          </div>

          {/* Trending Projects Widget */}
          <div 
            onClick={() => setSpotlightSubView('showcase')}
            className="glass-panel rounded-[22px] p-4 relative overflow-hidden group cursor-pointer hover:bg-white/5 transition-colors border border-transparent hover:border-brand-green/30"
          >
            <div className="w-9 h-9 rounded-xl bg-brand-green/20 flex items-center justify-center text-brand-green mb-2.5 shadow-sm border border-brand-green/30 relative z-10">
              <Flame className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white relative z-10">Showcase</h3>
            <p className="text-[11px] text-gray-400 mt-0.5 relative z-10">Ongoing builds</p>
          </div>
        </div>

        
        
        {/* ✨ AI Top Picks For You */}
        <div className="glass-panel rounded-3xl overflow-hidden mb-6 border border-brand-blue/30 shadow-[0_0_15px_rgba(10,102,194,0.15)] relative">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <Sparkles className="w-16 h-16 text-brand-blue" />
          </div>
          <div className="p-4 border-b border-white/5 bg-brand-blue/5 flex items-center justify-between relative z-10">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-brand-blue" /> AI Top Picks For You
            </h2>
          </div>
          <div className="p-4 space-y-3 relative z-10">
            {isLoadingCurated ? (
              <>
                <div className="animate-pulse flex flex-col gap-2 bg-white/5 p-4 rounded-2xl">
                  <div className="h-4 bg-white/10 rounded w-3/4"></div>
                  <div className="h-3 bg-white/10 rounded w-full"></div>
                  <div className="h-3 bg-white/10 rounded w-5/6"></div>
                </div>
              </>
            ) : curatedEvents.length > 0 ? (
              curatedEvents.map((item: any) => (
                <div key={item.resource_id} className="bg-white/5 border border-white/10 rounded-2xl p-4 relative overflow-hidden group">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-blue"></div>
                  <h3 className="text-white font-bold text-lg mb-2">{item.resource_name}</h3>
                  <p className="text-sm text-gray-300 italic mb-4">"{item.wingman_caption}"</p>
                  <button 
                    onClick={() => window.open(item.url || 'https://vtop.vit.ac.in', '_blank')}
                    className="w-full py-2.5 rounded-xl bg-brand-blue/20 text-brand-blue font-bold text-sm hover:bg-brand-blue hover:text-white transition-colors flex items-center justify-center gap-2"
                  >
                    Register Now <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500 text-center py-2">Not enough data to curate events yet.</p>
            )}
          </div>
        </div>

        {/* Hackathon Deadlines List */}
        <div className="glass-panel rounded-3xl overflow-hidden">
          <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between border-brand-green/30">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider text-brand-green">
              <Calendar className="w-4 h-4 text-brand-green" /> Campus Events & Hackathons
            </h2>
            <button 
              onClick={() => openUrl('https://chennaievents.vit.ac.in/technovit/eventPreview')}
              className="text-xs flex items-center gap-1 text-brand-green hover:text-white transition-colors"
            >
              View All <ExternalLink className="w-3 h-3" />
            </button>
          </div>
          <div className="p-2 space-y-2">
            {events.length > 0 ? events.map((hack: any) => (
              <div key={hack.id} className="p-3 rounded-2xl hover:bg-white/5 cursor-pointer transition-colors flex items-center justify-between group border border-brand-green/40">
                <div className="flex flex-col flex-1 pr-4">
                  <span className="text-white font-bold text-base group-hover:text-brand-green transition-colors">{hack.title}</span>
                  <span className="text-xs text-gray-400 mt-0.5">{hack.organizer} • {hack.date}</span>
                </div>
                <button 
                  onClick={() => openUrl(hack.url)}
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-green hover:text-white text-gray-400 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            )) : (
               <div className="p-8 text-center text-gray-500 text-sm">
                  Waiting for events from scraper...
               </div>
            )}
          </div>
        </div>

        {/* Trending Projects List */}
        <div className="glass-panel rounded-3xl overflow-hidden">
          <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
              <Flame className="w-4 h-4 text-orange-400" /> Campus Open Source
            </h2>
            <button
              onClick={() => setIsBrandingModalOpen(true)}
              className="text-xs flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-brand-blue/10 hover:bg-brand-blue/20 text-brand-blue border border-brand-blue/20 transition-all font-semibold"
              title="Launch Visual Branding Tool for new projects"
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Brand Studio</span>
            </button>
          </div>
          <div className="p-2 space-y-2">
            {MOCK_PROJECTS.map(project => (
              <div 
                key={project.id} 
                onClick={() => {
                  setSelectedProjectForBranding({
                    title: project.title,
                    technologies: [project.lang, 'Git', 'Open Source'],
                    category: 'Engineering & Automation'
                  });
                  setIsBrandingModalOpen(true);
                }}
                className="p-3 rounded-2xl hover:bg-white/5 cursor-pointer transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <ProjectAvatar
                    title={project.title}
                    technologies={[project.lang]}
                    size="sm"
                  />
                  <div className="min-w-0">
                    <span className="text-white font-bold text-base group-hover:text-brand-green transition-colors truncate block">
                      {project.title}
                    </span>
                    <div className="flex items-center gap-2 text-xs font-mono text-gray-400 mt-0.5">
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-blue-400"></div> {project.lang}
                      </span>
                      <span>• @{project.author}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-full text-xs font-semibold shrink-0">
                  <Star className="w-3 h-3" /> {project.stars}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="glass-panel rounded-3xl overflow-hidden">
          <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
              <Briefcase className="w-4 h-4 text-brand-green" /> Recommended Internships
            </h2>
            <ChevronRight className="w-4 h-4 text-gray-500" />
          </div>
          <div>
            {MOCK_RECOMMENDATIONS.map(job => (
              <div key={job.id} className="p-4 flex gap-4 border-b border-white/5 last:border-0 hover:bg-white/5 cursor-pointer transition-colors">
                <div className="w-12 h-12 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center font-bold text-gray-300 text-lg flex-shrink-0 shadow-sm">
                  {job.logo}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-base text-white">{job.title}</h3>
                  <p className="text-sm text-gray-300 mt-0.5">{job.company}</p>
                  <p className="text-[12px] text-gray-400 mt-1.5 flex items-center gap-2">
                    {job.location} <span className="w-1 h-1 rounded-full bg-gray-500"></span> <span className="text-brand-green font-semibold">{job.type}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="glass-panel rounded-3xl overflow-hidden">
          <div className="p-4 border-b border-white/5 bg-white/5">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
              <Bell className="w-4 h-4 text-brand-blue" /> Recent Activity
            </h2>
          </div>
          <div className="flex flex-col relative overflow-hidden">
            <AnimatePresence>
              {notifications.map(notif => (
                <motion.div 
                  key={notif.id}
                  layout
                  initial={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="relative border-b border-white/5 last:border-0"
                >
                  <div className="absolute inset-y-0 right-0 w-20 bg-red-500/20 flex items-center justify-center">
                    <Trash2 className="w-5 h-5 text-red-500" />
                  </div>
                  <motion.div
                    drag="x"
                    dragConstraints={{ left: -80, right: 0 }}
                    dragElastic={0.1}
                    onDragEnd={(e, info) => {
                      if (info.offset.x < -50) {
                        removeNotification(notif.id);
                      }
                    }}
                    className="p-5 flex gap-4 bg-[#0D1117] hover:bg-white/5 cursor-pointer transition-colors relative z-10"
                  >
                    <div className="w-10 h-10 rounded-full bg-brand-blue/20 flex items-center justify-center text-brand-blue flex-shrink-0 border border-brand-blue/30 shadow-sm">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium leading-snug">{notif.text}</p>
                      <p className="text-xs text-gray-400 mt-1.5">{notif.time}</p>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
              {notifications.length === 0 && (
                <div className="p-8 text-center text-gray-500 text-sm">
                  No new activity.
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
          </div>
        )}

      </div>

      {/* Project Visual Branding Tool Modal */}
      <ProjectBrandingToolModal
        isOpen={isBrandingModalOpen}
        onClose={() => setIsBrandingModalOpen(false)}
        initialTitle={selectedProjectForBranding.title}
        initialTechnologies={selectedProjectForBranding.technologies}
        initialCategory={selectedProjectForBranding.category}
      />
    </div>
  );
}
