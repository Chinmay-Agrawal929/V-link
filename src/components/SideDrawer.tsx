import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Bookmark, Settings, Map, LogOut, X, Globe, BookOpen, Compass, Code, Users, Calendar, Activity, Rocket } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store';

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SideDrawer({ isOpen, onClose }: SideDrawerProps) {
  const { user } = useAppStore();
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error('Logout error', e);
    }
  };

  const menuItems = [
    { icon: User, label: 'My Profile', onClick: () => { onClose(); useAppStore.getState().setTab('profile'); } },
    { icon: Rocket, label: 'Project Showcase', onClick: () => { onClose(); useAppStore.getState().setTab('showcase'); } },
    { icon: Activity, label: 'Campus Feed (Live)', onClick: () => { onClose(); useAppStore.getState().setTab('feed'); } },
    { icon: BookOpen, label: 'Library', onClick: () => { onClose(); useAppStore.getState().setTab('library'); } },
    { icon: Calendar, label: 'Planner', onClick: () => { onClose(); useAppStore.getState().setTab('planner'); } },
    { icon: Bookmark, label: 'Saved Posts', onClick: () => { onClose(); } },
    { icon: Users, label: 'My AI Teams', onClick: () => { onClose(); useAppStore.getState().setTab('teams'); } },
    { icon: Settings, label: 'Settings', onClick: () => { onClose(); useAppStore.getState().setSettingsModalOpen(true); } },
    { 
      icon: Globe, 
      label: 'VTOP', 
      onClick: () => { 
        window.open('https://vtopcc.vit.ac.in/vtop/content', '_blank'); 
        onClose(); 
      } 
    },
    { 
      icon: BookOpen, 
      label: 'VIT OL CC', 
      onClick: () => { 
        window.open('https://vitolcc1.vit.ac.in/', '_blank'); 
        onClose(); 
      } 
    },
    { 
      icon: Map, 
      label: 'Wayfinder', 
      onClick: () => { 
        window.open('https://chennaiwayfinder.vit.ac.in/', '_blank'); 
        onClose(); 
      } 
    },
    { 
      icon: Compass, 
      label: 'Campus Tour', 
      onClick: () => { 
        window.open('https://chennaicampustour.vit.ac.in/vtour/index.html', '_blank'); 
        onClose(); 
      } 
    },
    { 
      icon: Code, 
      label: 'VIT CoLab', 
      onClick: () => { 
        window.open('https://vitcolab945.examly.io/', '_blank'); 
        onClose(); 
      } 
    },
    { icon: LogOut, label: 'Logout', onClick: handleLogout, isDanger: true },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute top-0 left-0 bottom-0 z-[70] w-[280px] sm:w-[320px] bg-[rgba(13,17,23,0.85)] backdrop-blur-2xl border-r border-white/10 flex flex-col shadow-2xl pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
          >
                        {/* Header */}
            <div className="p-4 border-b border-white/10 mt-4 mx-2 flex justify-between items-start">
              <div className="overflow-hidden">
                <span className="text-white font-bold text-lg tracking-wide block truncate">{user?.name || 'Loading...'}</span>
                <span className="text-gray-400 text-sm block truncate">{user?.email || ''}</span>
              </div>
              <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors shrink-0">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <button
                    key={index}
                    onClick={item.onClick}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 active:scale-95",
                      item.isDanger 
                        ? "text-red-400 hover:bg-red-500/10" 
                        : "text-gray-200 hover:text-white hover:bg-white/10"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium text-sm">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
