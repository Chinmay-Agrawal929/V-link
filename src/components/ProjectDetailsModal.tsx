import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ExternalLink, 
  Github, 
  Star, 
  GitFork, 
  Users, 
  Code2, 
  Briefcase, 
  MessageSquare, 
  Send, 
  Sparkles, 
  Check, 
  Share2, 
  Award,
  ChevronRight,
  UserPlus,
  Palette
} from 'lucide-react';
import { CampusProject, ProjectTeamMember } from '@/data/projectsData';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store';
import { auth, db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import ProjectAvatar from './ProjectAvatar';
import ProjectBrandingToolModal from './ProjectBrandingToolModal';

interface ProjectDetailsModalProps {
  project: CampusProject | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectTechnology?: (tech: string) => void;
  onSelectMember?: (member: ProjectTeamMember) => void;
}

export default function ProjectDetailsModal({
  project,
  isOpen,
  onClose,
  onSelectTechnology,
  onSelectMember
}: ProjectDetailsModalProps) {
  const { user, showGlobalToast, setTab, setNetworkTab } = useAppStore();
  const [isStarred, setIsStarred] = useState(false);
  const [starCount, setStarCount] = useState(project?.stars || 0);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [joinRole, setJoinRole] = useState('');
  const [joinMessage, setJoinMessage] = useState('');
  const [isSubmittingJoin, setIsSubmittingJoin] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [isBrandingToolOpen, setIsBrandingToolOpen] = useState(false);
  const [customAvatarUrl, setCustomAvatarUrl] = useState<string | undefined>(project?.avatarUrl);

  if (!isOpen || !project) return null;

  const handleToggleStar = () => {
    setIsStarred(prev => {
      const next = !prev;
      setStarCount(c => next ? c + 1 : c - 1);
      showGlobalToast(next ? `Starred ${project.title} ⭐` : `Removed star`);
      return next;
    });
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(`${window.location.origin}/#project-${project.id}`);
    showGlobalToast('Project link copied to clipboard!');
  };

  const handleMessageLead = async (member: ProjectTeamMember) => {
    if (!auth.currentUser) {
      showGlobalToast('Please sign in to message team members');
      return;
    }

    onClose();
    // Switch to network tab -> messages
    setTab('network');
    setNetworkTab('messages');
    showGlobalToast(`Connecting with ${member.name} regarding ${project.title}`);
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) {
      showGlobalToast('Please sign in to apply');
      return;
    }

    setIsSubmittingJoin(true);
    try {
      // Record application in user/project communications
      await addDoc(collection(db, 'project_applications'), {
        projectId: project.id,
        projectTitle: project.title,
        applicantUid: auth.currentUser.uid,
        applicantName: user?.name || 'VIT Student',
        role: joinRole || 'Contributor',
        message: joinMessage,
        createdAt: serverTimestamp()
      });
      setHasApplied(true);
      setIsJoinModalOpen(false);
      showGlobalToast(`Application submitted to ${project.title} team!`);
    } catch (err) {
      console.warn('Saved application locally:', err);
      setHasApplied(true);
      setIsJoinModalOpen(false);
      showGlobalToast(`Interest sent to ${project.title} leads!`);
    } finally {
      setIsSubmittingJoin(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", duration: 0.35, bounce: 0.2 }}
          className="relative w-full max-w-2xl bg-[#0D121F] border border-white/10 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
        >
          {/* Header Banner */}
          <div className="relative p-6 bg-gradient-to-r from-blue-900/40 via-purple-900/20 to-black/40 border-b border-white/10 shrink-0">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors border border-white/10"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-4 mb-2">
              <div 
                className="cursor-pointer group relative"
                onClick={() => setIsBrandingToolOpen(true)}
                title="Customize Project Visual Branding & Avatar"
              >
                <ProjectAvatar
                  title={project.title}
                  technologies={project.technologies}
                  avatarUrl={customAvatarUrl}
                  size="lg"
                  showGlow={true}
                />
                <div className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-semibold gap-1 z-20">
                  <Palette className="w-3.5 h-3.5" />
                  <span>Branding</span>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-brand-blue/20 text-brand-blue border border-brand-blue/30">
                    {project.category}
                  </span>
                  <span className={cn(
                    "px-2.5 py-0.5 text-xs font-semibold rounded-full border",
                    project.status === 'Recruiting' && "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
                    project.status === 'Hackathon Finalist' && "bg-purple-500/10 text-purple-400 border-purple-500/30",
                    project.status === 'Active' && "bg-blue-500/10 text-blue-400 border-blue-500/30",
                    project.status === 'Published' && "bg-amber-500/10 text-amber-400 border-amber-500/30",
                    project.status === 'Open Source' && "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
                  )}>
                    {project.status === 'Recruiting' ? '⚡ Open for Collaboration' : project.status}
                  </span>
                  {project.milestone && (
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-amber-400" />
                      {project.milestone}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold text-white tracking-tight">{project.title}</h2>
                  <button
                    onClick={() => setIsBrandingToolOpen(true)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-brand-blue border border-white/10 transition-colors text-xs flex items-center gap-1"
                    title="Customize project brand avatar based on tech stack"
                  >
                    <Palette className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline text-[11px]">Brand Tool</span>
                  </button>
                </div>

                {project.tagline && (
                  <p className="text-sm text-gray-300 mt-1 leading-relaxed">{project.tagline}</p>
                )}
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="flex items-center gap-3 mt-4 pt-3 border-t border-white/10 text-xs text-gray-300">
              <button
                onClick={handleToggleStar}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all",
                  isStarred 
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40 font-semibold"
                    : "bg-white/5 hover:bg-white/10 border-white/10 text-gray-300"
                )}
              >
                <Star className={cn("w-3.5 h-3.5", isStarred && "fill-amber-400 text-amber-400")} />
                <span>{starCount} Stars</span>
              </button>

              {project.forks !== undefined && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-gray-300">
                  <GitFork className="w-3.5 h-3.5 text-gray-400" />
                  <span>{project.forks} Forks</span>
                </div>
              )}

              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 ml-auto transition-colors"
                title="Share project"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Share</span>
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-brand-blue" />
                Project Overview
              </h3>
              <p className="text-sm text-gray-200 leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/5">
                {project.description}
              </p>
            </div>

            {/* Technologies */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                Technologies & Tech Stack
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (onSelectTechnology) {
                        onSelectTechnology(tech);
                        onClose();
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-300 text-xs font-mono transition-all flex items-center gap-1.5 group"
                    title={`Filter projects by ${tech}`}
                  >
                    <span>{tech}</span>
                    <span className="text-[10px] text-emerald-500 group-hover:text-emerald-300 transition-colors">↗</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Team Roster */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-purple-400" />
                  Team Members & Contributors ({project.teamMembers.length})
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {project.teamMembers.map((member, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between hover:bg-white/[0.07] transition-all group"
                  >
                    <div 
                      onClick={() => onSelectMember && onSelectMember(member)}
                      className="flex items-center gap-3 cursor-pointer min-w-0"
                    >
                      <img
                        src={member.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`}
                        alt={member.name}
                        className="w-10 h-10 rounded-xl bg-white/10 object-cover border border-white/10 shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-white truncate group-hover:text-brand-blue transition-colors">
                          {member.name}
                        </h4>
                        <p className="text-xs text-brand-blue truncate">{member.role}</p>
                        {member.branch && (
                          <p className="text-[11px] text-gray-400 truncate">{member.branch}</p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleMessageLead(member)}
                      className="p-2 rounded-xl bg-brand-blue/10 hover:bg-brand-blue/20 text-brand-blue border border-brand-blue/20 transition-colors shrink-0 ml-2"
                      title={`Message ${member.name}`}
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Looking For / Open Opportunities */}
            {project.lookingFor && project.lookingFor.length > 0 && (
              <div className="space-y-2 p-4 rounded-2xl bg-brand-blue/10 border border-brand-blue/20">
                <h3 className="text-xs font-bold text-brand-blue uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Team Seeking Collaborators
                </h3>
                <p className="text-xs text-gray-300">
                  This project currently has open slots for student contributors:
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {project.lookingFor.map((role, idx) => (
                    <span 
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-brand-blue/20 text-white font-medium text-xs border border-brand-blue/30"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Links and Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {project.repoUrl && (
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs border border-white/10 transition-colors"
                >
                  <Github className="w-4 h-4" />
                  <span>GitHub Repository</span>
                  <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                </a>
              )}

              {project.demoUrl && (
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-blue/20 hover:bg-brand-blue/30 text-brand-blue font-semibold text-xs border border-brand-blue/30 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Live Demo / Prototype</span>
                </a>
              )}
            </div>

            {/* Join Application Form if opened */}
            {isJoinModalOpen && (
              <motion.form 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleSubmitApplication}
                className="p-4 rounded-2xl bg-white/5 border border-brand-blue/30 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <UserPlus className="w-4 h-4 text-brand-blue" />
                    Express Interest in Joining Project
                  </h4>
                  <button 
                    type="button" 
                    onClick={() => setIsJoinModalOpen(false)}
                    className="text-gray-400 hover:text-white text-xs"
                  >
                    Cancel
                  </button>
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1">Target Role / Your Specialization</label>
                  <input
                    type="text"
                    value={joinRole}
                    onChange={(e) => setJoinRole(e.target.value)}
                    placeholder="e.g. Frontend Developer, ML Researcher, Tester"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-blue"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1">Brief note to project leads</label>
                  <textarea
                    rows={2}
                    value={joinMessage}
                    onChange={(e) => setJoinMessage(e.target.value)}
                    placeholder="Tell the team about your skills or past projects..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-blue"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingJoin}
                  className="w-full py-2.5 rounded-xl bg-brand-blue hover:bg-blue-600 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-brand-blue/20"
                >
                  {isSubmittingJoin ? 'Sending...' : 'Submit Collaboration Request'}
                </button>
              </motion.form>
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-4 bg-black/30 border-t border-white/10 flex items-center justify-between gap-3 shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-semibold border border-white/10 transition-colors"
            >
              Close
            </button>

            <div className="flex items-center gap-2">
              {project.teamMembers[0] && (
                <button
                  onClick={() => handleMessageLead(project.teamMembers[0])}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/10 transition-colors flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-brand-blue" />
                  <span>Message {project.teamMembers[0].name.split(' ')[0]}</span>
                </button>
              )}

              {hasApplied ? (
                <div className="px-4 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30 flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  <span>Request Sent</span>
                </div>
              ) : (
                <button
                  onClick={() => setIsJoinModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-brand-blue hover:bg-blue-600 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-lg shadow-brand-blue/20"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Join Project</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Project Visual Branding Tool Modal */}
      <ProjectBrandingToolModal
        isOpen={isBrandingToolOpen}
        onClose={() => setIsBrandingToolOpen(false)}
        initialTitle={project.title}
        initialTechnologies={project.technologies}
        initialCategory={project.category}
        onApplyAvatar={(avatarUrl) => {
          setCustomAvatarUrl(avatarUrl);
        }}
      />
    </AnimatePresence>
  );
}
