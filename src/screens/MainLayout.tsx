import React, { useState } from 'react';
import { useAppStore } from '@/store';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, Home, Users, PlusSquare, Briefcase, User as UserIcon, MessageSquare, Link, Calendar, BookOpen, Activity, Radio } from 'lucide-react';
import { cn } from '@/lib/utils';

// Import Tabs
import HomeTab from '@/tabs/HomeTab';
import NetworkTab from '@/tabs/NetworkTab';
import SpotlightTab from '@/tabs/SpotlightTab';
import ProfileTab from '@/tabs/ProfileTab';
import PlannerTab from '@/tabs/PlannerTab';
import LibraryTab from '@/tabs/LibraryTab';
import MyTeamsScreen from '@/screens/MyTeamsScreen';
import AiOracle from '@/components/AiOracle';
import CreatePostModal from '@/components/CreatePostModal';
import SideDrawer from '@/components/SideDrawer';
import SettingsModal from '@/components/SettingsModal';
import GlobalSearch from '@/components/GlobalSearch';
import CampusFeed from '@/components/CampusFeed';
import ProjectShowcase from '@/components/ProjectShowcase';

const TABS = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'feed', icon: Radio, label: 'Feed' },
  { id: 'network', icon: Users, label: 'Network' },
  { id: 'create', icon: PlusSquare, label: 'Post' },
  { id: 'spotlight', icon: Briefcase, label: 'Spotlight' },
  { id: 'profile', icon: UserIcon, label: 'Profile' },
];

export default function MainLayout() {
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const { 
    user, 
    activeTab, 
    setTab, 
    setCreateModalOpen, 
    messages, 
    setNetworkTab, 
    isSettingsModalOpen, 
    setSettingsModalOpen,
    isActivityFeedOpen,
    setActivityFeedOpen
  } = useAppStore();

  const unreadMessagesCount = messages.filter(m => m.unread).length;

  const handleTabClick = (tabId: string) => {
    if (tabId === 'create') {
      setCreateModalOpen(true);
    } else {
      setTab(tabId);
    }
  };

  const openMessages = () => {
    setTab('network');
    setNetworkTab('messages');
  };

  return (
    <div className="relative w-full min-h-[100dvh] flex flex-col overflow-hidden pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      {/* Top Header */}
      <header className="glass-panel h-14 flex items-center px-4 shrink-0 z-20 m-4 rounded-2xl">
        <button onClick={() => setDrawerOpen(true)} className="flex-shrink-0 mr-3 text-gray-400 hover:text-white transition-colors" title="Menu">
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex-shrink-0 mr-3 hidden sm:flex items-center justify-center">
          <Link size={28} color="#0084FF" strokeWidth={3} />
        </div>
        <GlobalSearch />
        
        {/* Campus Feed Live Button */}
        <button
          onClick={() => setActivityFeedOpen(!isActivityFeedOpen)}
          title="Campus Feed (Live Updates & Milestones)"
          className={cn(
            "ml-3 relative flex items-center justify-center w-9 h-9 rounded-xl border transition-all shrink-0 group",
            isActivityFeedOpen || activeTab === 'feed'
              ? "bg-brand-blue/20 border-brand-blue text-brand-blue shadow-md shadow-brand-blue/20"
              : "bg-white/5 hover:bg-white/10 border-white/10 text-gray-300 hover:text-white"
          )}
        >
          <Radio className="w-4 h-4 group-hover:scale-110 transition-transform text-brand-blue animate-pulse" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full ring-2 ring-[#0B0F17] animate-pulse" />
        </button>

        {/* Messages / Profile Button */}
        <button onClick={openMessages} className="ml-2 relative text-gray-400 hover:text-white transition-colors shrink-0" title="Messages & Connections">
          <img src={user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`} alt="Messages" className="w-8 h-8 rounded-full border border-gray-600 bg-white/5 object-cover" />
          {unreadMessagesCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-blue text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-brand-dark">
              {unreadMessagesCount}
            </span>
          )}
        </button>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 w-full h-full relative z-10 overflow-hidden pb-20">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && <HomeTab key="home" />}
          {(activeTab === 'feed' || activeTab === 'campus-feed' || activeTab === 'activity') && <CampusFeed key="campus-feed" isModal={false} />}
          {activeTab === 'network' && <NetworkTab key="network" />}
          {activeTab === 'spotlight' && <SpotlightTab key="spotlight" />}
          {(activeTab === 'showcase' || activeTab === 'projects') && (
            <div key="showcase" className="w-full h-full overflow-y-auto no-scrollbar pb-8">
              <div className="max-w-xl mx-auto px-4 pt-4">
                <ProjectShowcase />
              </div>
            </div>
          )}
          {activeTab === 'library' && <LibraryTab key="library" />}
          {activeTab === 'planner' && <PlannerTab key="planner" />}
          {activeTab === 'profile' && <ProfileTab key="profile" />}
          {activeTab === 'teams' && <MyTeamsScreen key="teams" />}
        </AnimatePresence>
      </div>
      <SideDrawer isOpen={isDrawerOpen} onClose={() => setDrawerOpen(false)} />
      <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setSettingsModalOpen(false)} />

      {/* Centralized Slide-Over Campus Feed Panel */}
      <AnimatePresence>
        {isActivityFeedOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActivityFeedOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Slide-over Sheet */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="relative z-10 w-full max-w-lg h-full bg-[#0B0F17] border-l border-white/10 shadow-2xl flex flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
            >
              <CampusFeed onClose={() => setActivityFeedOpen(false)} isModal={true} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Action Button (AI) */}
      <AiOracle />
      
      {/* Modals */}
      <CreatePostModal />

      

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-40 pb-[env(safe-area-inset-bottom)]">
        <div className="glass-panel mx-4 mb-4 rounded-3xl flex items-center justify-between px-2 py-2 relative">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id && tab.id !== 'create';
            const Icon = tab.icon;
            
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className="flex flex-col items-center justify-center flex-1 h-14 transition-colors relative rounded-2xl"
              >
                {isActive && (
                  <motion.div 
                    layoutId="active-nav-bg"
                    className="absolute inset-0 bg-white/10 rounded-2xl -z-10"
                  />
                )}
                <Icon 
                  strokeWidth={isActive ? 2.5 : 2} 
                  className={cn(
                    "w-6 h-6 transition-colors", 
                    isActive ? "text-white" : "text-gray-500"
                  )} 
                />
                <span className={cn(
                  "text-[10px] mt-1 font-medium transition-colors",
                  isActive ? "text-white" : "text-gray-500"
                )}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
