import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, UserPlus, Check, Clock, ThumbsUp, Github, Award, BookOpen, Briefcase, GraduationCap, Sparkles, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { auth } from '@/lib/firebase';
import SkillTag from './SkillTag';

export interface PeerStudent {
  id: string;
  name: string;
  role?: string;
  branch: string;
  year?: string;
  graduationYear?: string;
  regNo?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  headline?: string;
  about?: string;
  skills: string[];
  interests: string[];
  collaborationStatus?: string;
  githubUsername?: string;
  githubConnected?: boolean;
  projects?: { title: string; tech: string; description?: string }[];
  certifications?: string[];
  skillEndorsements?: Record<string, string[]>;
  isOnline?: boolean;
  connectionsCount?: number;
}

interface PeerProfileModalProps {
  peer: PeerStudent | null;
  isOpen: boolean;
  onClose: () => void;
  onMessage: (peer: PeerStudent) => void;
  onConnect: (peerId: string) => void;
  onEndorse: (peerId: string, skill: string, isEndorsed: boolean) => void;
  isPending: boolean;
}

export default function PeerProfileModal({
  peer,
  isOpen,
  onClose,
  onMessage,
  onConnect,
  onEndorse,
  isPending
}: PeerProfileModalProps) {
  if (!isOpen || !peer) return null;

  const currentUid = auth.currentUser?.uid;
  const avatar = peer.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${peer.name}`;

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
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg max-h-[90vh] bg-zinc-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10"
        >
          {/* Header Banner */}
          <div className="relative h-28 bg-gradient-to-r from-blue-600/30 via-indigo-600/20 to-emerald-600/30 border-b border-white/10 shrink-0">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-gray-300 hover:text-white flex items-center justify-center backdrop-blur-sm transition-colors border border-white/10 z-10"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Profile Overview (Overlapping Banner) */}
          <div className="px-6 -mt-12 flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
            <div className="flex items-end gap-4">
              <div className="relative">
                <img
                  src={avatar}
                  alt={peer.name}
                  className="w-20 h-20 rounded-2xl bg-zinc-800 border-4 border-zinc-900 object-cover shadow-lg"
                />
                {peer.isOnline && (
                  <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-zinc-900 rounded-full" title="Online now" />
                )}
              </div>
              <div className="pt-2">
                <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  {peer.name}
                  {peer.githubConnected && (
                    <Github className="w-4 h-4 text-gray-400" />
                  )}
                </h3>
                <p className="text-xs text-gray-400 flex items-center gap-1.5 flex-wrap mt-0.5">
                  <span>{peer.branch}</span>
                  <span aria-hidden="true">·</span>
                  <span>{peer.year || peer.graduationYear || 'Student'}</span>
                  {peer.regNo && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono text-gray-400">{peer.regNo}</span>
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Quick Header Actions */}
            <div className="flex items-center gap-2 self-start sm:self-end">
              <button
                onClick={() => onMessage(peer)}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Message</span>
              </button>
              <button
                onClick={() => onConnect(peer.id)}
                disabled={isPending}
                className={cn(
                  "px-3.5 py-2 rounded-xl font-medium text-xs flex items-center gap-1.5 transition-colors border",
                  isPending
                    ? "bg-white/5 border-white/10 text-gray-400"
                    : "bg-white/10 hover:bg-white/15 border-white/15 text-white"
                )}
              >
                {isPending ? (
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
            </div>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5 divide-y divide-white/5">
            {/* Status / Headline */}
            <div className="space-y-2 pt-1">
              {peer.collaborationStatus && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                  <Sparkles className="w-3 h-3" />
                  <span>{peer.collaborationStatus}</span>
                </div>
              )}
              {peer.headline && (
                <p className="text-sm font-medium text-gray-200">
                  {peer.headline}
                </p>
              )}
              {peer.about && (
                <p className="text-xs text-gray-400 leading-relaxed whitespace-pre-line">
                  {peer.about}
                </p>
              )}
            </div>

            {/* Skills & Endorsements */}
            <div className="pt-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                  Technical Skills & Endorsements
                </h4>
                <span className="text-[11px] text-gray-500">Tap to endorse</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {peer.skills && peer.skills.length > 0 ? (
                  peer.skills.map((skill) => {
                    const isEndorsed = currentUid ? peer.skillEndorsements?.[skill]?.includes(currentUid) : false;
                    const count = peer.skillEndorsements?.[skill]?.length || 0;
                    return (
                      <SkillTag
                        key={skill}
                        name={skill}
                        type="skill"
                        size="sm"
                        showCategory={true}
                        endorsementsCount={count}
                        isEndorsed={isEndorsed}
                        onEndorse={() => onEndorse(peer.id, skill, !!isEndorsed)}
                        interactive={true}
                      />
                    );
                  })
                ) : (
                  <p className="text-xs text-gray-500 italic">No skills listed yet.</p>
                )}
              </div>
            </div>

            {/* Areas of Interest / Goals */}
            <div className="pt-4 space-y-2.5">
              <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                Areas of Interest & Collab Goals
              </h4>
              <div className="flex flex-wrap gap-2">
                {peer.interests && peer.interests.length > 0 ? (
                  peer.interests.map((interest) => (
                    <SkillTag
                      key={interest}
                      name={interest}
                      type="interest"
                      size="sm"
                    />
                  ))
                ) : (
                  <p className="text-xs text-gray-500 italic">No specific interests listed.</p>
                )}
              </div>
            </div>

            {/* Projects / Highlights (if available) */}
            {peer.projects && peer.projects.length > 0 && (
              <div className="pt-4 space-y-2.5">
                <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-purple-400" />
                  Featured Projects
                </h4>
                <div className="space-y-2">
                  {peer.projects.map((proj, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white">{proj.title}</span>
                        <span className="text-[11px] text-gray-400 font-mono">{proj.tech}</span>
                      </div>
                      {proj.description && (
                        <p className="text-gray-400 mt-1 line-clamp-2">{proj.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications (if available) */}
            {peer.certifications && peer.certifications.length > 0 && (
              <div className="pt-4 space-y-2.5">
                <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  Certifications & Badges
                </h4>
                <div className="flex flex-wrap gap-2">
                  {peer.certifications.map((cert, idx) => (
                    <div key={idx} className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-1.5">
                      <Award className="w-3 h-3 text-amber-400" />
                      <span>{cert}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Action Bar */}
          <div className="px-6 py-4 bg-zinc-950/70 border-t border-white/10 flex items-center justify-between gap-3 shrink-0">
            <span className="text-xs text-gray-400">
              Campus Peer Directory · VIT Chennai
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => onMessage(peer)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Start Chat
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
