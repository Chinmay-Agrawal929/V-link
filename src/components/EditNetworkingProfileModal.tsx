import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Sparkles, Check, Loader2, Tag, BookOpen, GraduationCap } from 'lucide-react';
import { useAppStore } from '@/store';
import { db, auth } from '@/lib/firebase';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import SkillTag from './SkillTag';

interface EditNetworkingProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

const POPULAR_SKILLS = [
  'React', 'Python', 'UI Design', 'Node.js', 'TypeScript', 'Java', 'C++',
  'Rust', 'Go', 'Machine Learning', 'Figma', 'Docker',
  'Flutter', 'Cybersecurity', 'Solidity', 'SQL', 'Three.js'
];

const POPULAR_INTERESTS = [
  'Hackathons', 'Open Source', 'Competitive Programming', 'Research Papers',
  'AI / GenAI', 'App Development', 'UI/UX Design', 'Robotics & IoT',
  'Startup / Side Project', 'DevJams', 'Internship Prep'
];

const COLLAB_OPTIONS = [
  'Looking for Hackathon Team',
  'Seeking Project Partner',
  'Open to Collab',
  'Available to Mentor',
  'Building Startup'
];

export default function EditNetworkingProfileModal({
  isOpen,
  onClose,
  onSaved
}: EditNetworkingProfileModalProps) {
  const { user, showGlobalToast } = useAppStore();

  const [headline, setHeadline] = useState(user?.headline || '');
  const [collabStatus, setCollabStatus] = useState(user?.collaborationStatus || 'Open to Collab');
  const [skills, setSkills] = useState<string[]>(user?.skills || []);
  const [interests, setInterests] = useState<string[]>(user?.interests || []);
  const [skillInput, setSkillInput] = useState('');
  const [interestInput, setInterestInput] = useState('');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleAddSkill = (skillToAdd?: string) => {
    const val = (skillToAdd || skillInput).trim();
    if (val && !skills.includes(val)) {
      setSkills(prev => [...prev, val]);
      if (!skillToAdd) setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(prev => prev.filter(s => s !== skillToRemove));
  };

  const handleAddInterest = (interestToAdd?: string) => {
    const val = (interestToAdd || interestInput).trim();
    if (val && !interests.includes(val)) {
      setInterests(prev => [...prev, val]);
      if (!interestToAdd) setInterestInput('');
    }
  };

  const handleRemoveInterest = (interestToRemove: string) => {
    setInterests(prev => prev.filter(i => i !== interestToRemove));
  };

  const handleSave = async () => {
    if (!auth.currentUser) return;
    setSaving(true);
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await setDoc(userRef, {
        headline,
        collaborationStatus: collabStatus,
        skills,
        interests,
      }, { merge: true });

      // Update state
      useAppStore.setState(state => ({
        user: state.user ? {
          ...state.user,
          headline,
          collaborationStatus: collabStatus,
          skills,
          interests
        } : null
      }));

      showGlobalToast('Networking profile updated!');
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      console.error('Failed to update networking profile:', err);
      showGlobalToast('Error saving profile changes');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/75 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg max-h-[85vh] bg-zinc-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between shrink-0 bg-zinc-900/90 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-400" />
              <div>
                <h3 className="font-bold text-white text-base">My Networking Card</h3>
                <p className="text-xs text-gray-400">Let peers find you for projects and hackathons</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto space-y-5 flex-1">
            {/* Headline */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                Headline / Role Brief
              </label>
              <input
                type="text"
                value={headline}
                onChange={e => setHeadline(e.target.value)}
                placeholder="e.g. 2nd Year CSE · Fullstack Dev · Preparing for DevJams"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Collaboration Status */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                Collaboration Availability
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {COLLAB_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setCollabStatus(opt)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium text-left border transition-colors flex items-center justify-between ${
                      collabStatus === opt
                        ? 'bg-blue-600/20 border-blue-500/50 text-blue-300'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span>{opt}</span>
                    {collabStatus === opt && <Check className="w-3.5 h-3.5 text-blue-400" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                  My Skills
                </label>
                <span className="text-[11px] text-gray-500">{skills.length} selected</span>
              </div>

              {/* Add Custom Skill Input */}
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                  placeholder="Type a skill and hit Enter..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => handleAddSkill()}
                  className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>

              {/* Active Skills */}
              <div className="flex flex-wrap gap-1.5 mb-2.5 min-h-[32px]">
                {skills.map(s => (
                  <SkillTag
                    key={s}
                    name={s}
                    type="skill"
                    size="sm"
                    showCategory={true}
                    onRemove={() => handleRemoveSkill(s)}
                  />
                ))}
              </div>

              {/* Popular Skill Suggestions */}
              <div>
                <p className="text-[11px] text-gray-500 mb-1.5">Quick add common skills:</p>
                <div className="flex flex-wrap gap-1">
                  {POPULAR_SKILLS.filter(s => !skills.includes(s)).slice(0, 10).map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleAddSkill(s)}
                      className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 text-[11px] transition-colors"
                    >
                      + {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Interests & Goals */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                  Interests & Goals
                </label>
                <span className="text-[11px] text-gray-500">{interests.length} selected</span>
              </div>

              {/* Add Custom Interest Input */}
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={interestInput}
                  onChange={e => setInterestInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddInterest())}
                  placeholder="e.g. Hackathons, Open Source..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => handleAddInterest()}
                  className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>

              {/* Active Interests */}
              <div className="flex flex-wrap gap-1.5 mb-2.5 min-h-[32px]">
                {interests.map(i => (
                  <SkillTag
                    key={i}
                    name={i}
                    type="interest"
                    size="sm"
                    onRemove={() => handleRemoveInterest(i)}
                  />
                ))}
              </div>

              {/* Popular Interest Suggestions */}
              <div>
                <p className="text-[11px] text-gray-500 mb-1.5">Quick add common interests:</p>
                <div className="flex flex-wrap gap-1">
                  {POPULAR_INTERESTS.filter(i => !interests.includes(i)).slice(0, 8).map(i => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleAddInterest(i)}
                      className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 text-[11px] transition-colors"
                    >
                      + {i}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-white/10 bg-zinc-950/70 flex items-center justify-end gap-3 shrink-0">
            <button
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Card</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
