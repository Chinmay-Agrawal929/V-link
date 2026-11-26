import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Search, 
  Plus, 
  Check, 
  Sparkles, 
  BookOpen, 
  GraduationCap, 
  Loader2, 
  Filter, 
  Tag, 
  RotateCcw,
  Code2
} from 'lucide-react';
import { useAppStore } from '@/store';
import { db, auth } from '@/lib/firebase';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { 
  TECHNICAL_DOMAINS, 
  INTEREST_DOMAINS, 
  DOMAIN_CATEGORIES, 
  DomainCategory, 
  getDomainMeta 
} from '@/data/technicalDomains';
import SkillTag from './SkillTag';

interface SkillsAndInterestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'skills' | 'interests';
  onSaved?: () => void;
}

export default function SkillsAndInterestsModal({
  isOpen,
  onClose,
  initialTab = 'skills',
  onSaved,
}: SkillsAndInterestsModalProps) {
  const { user, showGlobalToast } = useAppStore();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'skills' | 'interests'>(initialTab);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(user?.skills || []);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(user?.interests || []);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DomainCategory>('All');
  const [customTagInput, setCustomTagInput] = useState('');
  const [saving, setSaving] = useState(false);

  // Sync state if user changes
  React.useEffect(() => {
    if (user) {
      setSelectedSkills(user.skills || []);
      setSelectedInterests(user.interests || []);
    }
  }, [user]);

  // Reset tab if opened with initialTab
  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setSearchQuery('');
      setCustomTagInput('');
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  // Filter skills based on search & category
  const filteredSkills = useMemo(() => {
    return TECHNICAL_DOMAINS.filter(domain => {
      const matchesSearch = domain.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            domain.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || domain.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  // Filter interests based on search
  const filteredInterests = useMemo(() => {
    return INTEREST_DOMAINS.filter(interest => {
      return interest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             interest.category.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [searchQuery]);

  const handleToggleSkill = (skillName: string) => {
    setSelectedSkills(prev => 
      prev.includes(skillName) 
        ? prev.filter(s => s !== skillName) 
        : [...prev, skillName]
    );
  };

  const handleToggleInterest = (interestName: string) => {
    setSelectedInterests(prev => 
      prev.includes(interestName) 
        ? prev.filter(i => i !== interestName) 
        : [...prev, interestName]
    );
  };

  const handleAddCustom = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = customTagInput.trim();
    if (!clean) return;

    if (activeTab === 'skills') {
      if (!selectedSkills.includes(clean)) {
        setSelectedSkills(prev => [...prev, clean]);
      }
    } else {
      if (!selectedInterests.includes(clean)) {
        setSelectedInterests(prev => [...prev, clean]);
      }
    }
    setCustomTagInput('');
  };

  const handleSave = async () => {
    if (!auth.currentUser) return;
    setSaving(true);

    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await setDoc(userRef, {
        skills: selectedSkills,
        interests: selectedInterests,
      }, { merge: true });

      // Update local zustand store
      useAppStore.setState(state => ({
        user: state.user ? {
          ...state.user,
          skills: selectedSkills,
          interests: selectedInterests,
        } : null
      }));

      // Invalidate queries so TanStack queries reload everywhere
      queryClient.invalidateQueries({ queryKey: ['profile', auth.currentUser?.uid] });
      queryClient.invalidateQueries({ queryKey: ['users'] });

      showGlobalToast('Skills & Interests updated successfully!');
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      console.error('Failed to update skills and interests:', err);
      showGlobalToast('Failed to save tags. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-2xl max-h-[90vh] bg-zinc-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between shrink-0 bg-zinc-900/90 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-blue/20 border border-brand-blue/30 flex items-center justify-center text-brand-blue">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base sm:text-lg">
                  Showcase Technical Domains
                </h3>
                <p className="text-xs text-gray-400">
                  Highlight domains like React, Python, UI Design, and collaboration goals
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-white/10 bg-zinc-950/60 px-6 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('skills')}
              className={cn(
                'flex items-center gap-2 py-3 px-4 border-b-2 text-xs sm:text-sm font-semibold transition-all -mb-px',
                activeTab === 'skills'
                  ? 'border-brand-blue text-brand-blue'
                  : 'border-transparent text-gray-400 hover:text-white'
              )}
            >
              <BookOpen className="w-4 h-4" />
              <span>Technical Skills</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] bg-white/5 border border-white/10 text-white font-mono">
                {selectedSkills.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('interests')}
              className={cn(
                'flex items-center gap-2 py-3 px-4 border-b-2 text-xs sm:text-sm font-semibold transition-all -mb-px',
                activeTab === 'interests'
                  ? 'border-brand-green text-brand-green'
                  : 'border-transparent text-gray-400 hover:text-white'
              )}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Interests & Goals</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] bg-white/5 border border-white/10 text-white font-mono">
                {selectedInterests.length}
              </span>
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 overflow-y-auto space-y-5 flex-1 divide-y divide-white/5">
            {/* Active Tags Shelf */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-brand-blue" />
                  Your Active {activeTab === 'skills' ? 'Skills' : 'Interests'} ({activeTab === 'skills' ? selectedSkills.length : selectedInterests.length})
                </span>
                {(activeTab === 'skills' ? selectedSkills.length : selectedInterests.length) > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (activeTab === 'skills') setSelectedSkills([]);
                      else setSelectedInterests([]);
                    }}
                    className="text-[11px] text-gray-400 hover:text-red-400 flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" /> Clear All
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2 min-h-[42px] p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                {(activeTab === 'skills' ? selectedSkills : selectedInterests).length === 0 ? (
                  <p className="text-xs text-gray-500 italic py-1">
                    No {activeTab === 'skills' ? 'skills' : 'interests'} selected yet. Tap from the domains below or add custom tags!
                  </p>
                ) : (
                  (activeTab === 'skills' ? selectedSkills : selectedInterests).map(tag => (
                    <SkillTag
                      key={tag}
                      name={tag}
                      type={activeTab === 'skills' ? 'skill' : 'interest'}
                      size="sm"
                      showCategory={activeTab === 'skills'}
                      onRemove={() => {
                        if (activeTab === 'skills') {
                          setSelectedSkills(prev => prev.filter(s => s !== tag));
                        } else {
                          setSelectedInterests(prev => prev.filter(i => i !== tag));
                        }
                      }}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Search & Custom Input Bar */}
            <div className="pt-4 space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder={
                      activeTab === 'skills'
                        ? "Search technical domains (React, Python, UI Design...)"
                        : "Search interests (Hackathons, Open Source, AI Agents...)"
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-blue transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white text-xs"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Custom Tag Input */}
                <form onSubmit={handleAddCustom} className="flex gap-1.5 shrink-0">
                  <input
                    type="text"
                    value={customTagInput}
                    onChange={e => setCustomTagInput(e.target.value)}
                    placeholder="Custom tag..."
                    className="w-36 sm:w-44 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-blue"
                  />
                  <button
                    type="submit"
                    disabled={!customTagInput.trim()}
                    className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1 transition-colors disabled:opacity-40"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </form>
              </div>

              {/* Technical Domain Category Filter Pills (Only on Skills tab) */}
              {activeTab === 'skills' && (
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
                  {DOMAIN_CATEGORIES.map(category => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setSelectedCategory(category)}
                      className={cn(
                        'px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors border',
                        selectedCategory === category
                          ? 'bg-brand-blue text-white border-brand-blue shadow-sm'
                          : 'bg-white/5 border-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                      )}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Domain Suggestions Grid */}
            <div className="pt-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {activeTab === 'skills' ? 'Browse Technical Domains' : 'Browse Areas of Interest'}
                </span>
                <span className="text-[11px] text-gray-500">Tap to toggle</span>
              </div>

              {activeTab === 'skills' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {filteredSkills.map(domain => {
                    const isSelected = selectedSkills.includes(domain.name);
                    return (
                      <button
                        key={domain.name}
                        type="button"
                        onClick={() => handleToggleSkill(domain.name)}
                        className={cn(
                          'p-2.5 rounded-xl border text-left transition-all flex items-center justify-between gap-2 group',
                          isSelected
                            ? 'bg-brand-blue/20 border-brand-blue/60 shadow-sm'
                            : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.08] hover:border-white/20'
                        )}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={cn('w-2 h-2 rounded-full shrink-0', domain.dotColor)} />
                          <div className="truncate">
                            <p className={cn(
                              'text-xs font-semibold truncate',
                              isSelected ? 'text-white' : 'text-gray-300 group-hover:text-white'
                            )}>
                              {domain.name}
                            </p>
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider truncate">
                              {domain.category}
                            </p>
                          </div>
                        </div>

                        <div className={cn(
                          'w-5 h-5 rounded-md flex items-center justify-center shrink-0 border transition-colors',
                          isSelected
                            ? 'bg-brand-blue border-brand-blue text-white'
                            : 'border-white/10 text-transparent group-hover:border-white/30'
                        )}>
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {filteredInterests.map(interest => {
                    const isSelected = selectedInterests.includes(interest.name);
                    return (
                      <button
                        key={interest.name}
                        type="button"
                        onClick={() => handleToggleInterest(interest.name)}
                        className={cn(
                          'p-2.5 rounded-xl border text-left transition-all flex items-center justify-between gap-2 group',
                          isSelected
                            ? 'bg-emerald-500/20 border-emerald-500/60 shadow-sm'
                            : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.08] hover:border-white/20'
                        )}
                      >
                        <div className="truncate">
                          <p className={cn(
                            'text-xs font-semibold truncate',
                            isSelected ? 'text-white' : 'text-gray-300 group-hover:text-white'
                          )}>
                            {interest.name}
                          </p>
                          <p className="text-[10px] text-emerald-400/70 uppercase tracking-wider">
                            {interest.category}
                          </p>
                        </div>

                        <div className={cn(
                          'w-5 h-5 rounded-md flex items-center justify-center shrink-0 border transition-colors',
                          isSelected
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-white/10 text-transparent group-hover:border-white/30'
                        )}>
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-white/10 bg-zinc-950/80 flex items-center justify-between gap-3 shrink-0">
            <div className="text-xs text-gray-400">
              <span className="font-semibold text-white">{selectedSkills.length}</span> skills ·{' '}
              <span className="font-semibold text-white">{selectedInterests.length}</span> interests selected
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="px-4 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-brand-blue hover:bg-brand-blue/90 text-white text-xs font-semibold flex items-center gap-2 transition-colors shadow-lg disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving tags...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Save to Profile</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
