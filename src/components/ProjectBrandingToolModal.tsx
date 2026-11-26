import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  X, 
  Wand2, 
  Check, 
  Layers, 
  Palette, 
  Download, 
  RefreshCw, 
  Plus, 
  Hash, 
  Eye, 
  Copy,
  FolderKanban
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getProjectBranding, generateProjectStackAvatarSvg, TECH_PALETTES } from '@/utils/projectBranding';
import ProjectAvatar from './ProjectAvatar';
import { useAppStore } from '@/store';

interface ProjectBrandingToolModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTitle?: string;
  initialTechnologies?: string[];
  initialCategory?: string;
  onApplyAvatar?: (avatarUrl: string, branding: any) => void;
}

const PRESET_STACKS = [
  { name: 'Full-Stack Web', tags: ['React', 'Node.js', 'TypeScript', 'Tailwind CSS'] },
  { name: 'AI & Data Engine', tags: ['Python', 'PyTorch', 'LangChain', 'FastAPI'] },
  { name: 'Cross-Platform App', tags: ['Flutter', 'Firebase', 'TypeScript'] },
  { name: '3D Metaverse & Game', tags: ['Three.js', 'WebGL', 'TypeScript', 'Tailwind'] },
  { name: 'Systems & Web3', tags: ['Rust', 'Solidity', 'Docker', 'Go'] },
  { name: 'IoT & Robotics', tags: ['ESP32', 'C++', 'Python', 'OpenCV'] }
];

export default function ProjectBrandingToolModal({
  isOpen,
  onClose,
  initialTitle = 'CampusConnect',
  initialTechnologies = ['React', 'TypeScript', 'Tailwind CSS', 'Node.js'],
  initialCategory = 'Web & Collaboration',
  onApplyAvatar
}: ProjectBrandingToolModalProps) {
  const { showGlobalToast } = useAppStore();
  const [title, setTitle] = useState(initialTitle);
  const [category, setCategory] = useState(initialCategory);
  const [technologies, setTechnologies] = useState<string[]>(initialTechnologies);
  const [techInput, setTechInput] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiBranding, setAiBranding] = useState<any | null>(null);
  const [activeAvatarVersion, setActiveAvatarVersion] = useState<'svg-dynamic' | 'custom' | null>('svg-dynamic');

  if (!isOpen) return null;

  const currentBranding = getProjectBranding(technologies, title);
  const currentSvgAvatar = generateProjectStackAvatarSvg(technologies, title, 240);

  const handleAddTech = (tech: string) => {
    const trimmed = tech.trim();
    if (!trimmed) return;
    if (technologies.some(t => t.toLowerCase() === trimmed.toLowerCase())) return;
    setTechnologies(prev => [...prev, trimmed]);
    setTechInput('');
  };

  const handleRemoveTech = (techToRemove: string) => {
    setTechnologies(prev => prev.filter(t => t !== techToRemove));
  };

  const handleApplyPreset = (preset: typeof PRESET_STACKS[0]) => {
    setTechnologies(preset.tags);
    showGlobalToast(`Loaded preset: ${preset.name}`);
  };

  const handleGenerateAIBranding = async () => {
    setIsGeneratingAI(true);
    try {
      const res = await fetch('/api/generate-project-branding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          technologies,
          category
        })
      });

      if (!res.ok) throw new Error('Failed to generate visual branding');
      const data = await res.json();
      if (data.branding) {
        setAiBranding(data.branding);
        showGlobalToast(`Generated ${data.branding.themeName} palette! ✨`);
      }
    } catch (err) {
      console.warn('Fallback to local rule engine:', err);
      setAiBranding({
        themeName: `${technologies[0] || 'Modern'} Accent Theme`,
        primaryColor: currentBranding.primaryColor,
        secondaryColor: currentBranding.secondaryColor,
        tagline: `${technologies.slice(0, 2).join(' + ')} Powered Architecture`,
        visualDescription: `Futuristic brand emblem customized for ${title}`,
        recommendedSymbol: currentBranding.symbol
      });
      showGlobalToast('Generated visual branding palette!');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleDownloadSvg = () => {
    const element = document.createElement('a');
    element.setAttribute('href', currentSvgAvatar);
    element.setAttribute('download', `${title.toLowerCase().replace(/\s+/g, '_')}_avatar.svg`);
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    showGlobalToast('SVG Avatar downloaded! 🎨');
  };

  const handleSaveAndApply = () => {
    if (onApplyAvatar) {
      onApplyAvatar(currentSvgAvatar, aiBranding || currentBranding);
    }
    showGlobalToast(`Avatar applied to ${title}!`);
    onClose();
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
          className="fixed inset-0 bg-black/75 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-3xl bg-[#0D121F] border border-white/10 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10 bg-gradient-to-r from-blue-900/30 via-indigo-900/20 to-purple-900/30 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-blue/20 flex items-center justify-center border border-brand-blue/30 text-brand-blue shadow-inner">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  Project Visual Branding Tool
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Stack-Driven
                  </span>
                </h2>
                <p className="text-xs text-gray-400">
                  Generates an automated, unique brand placeholder avatar tuned to your technology stack tags.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors border border-white/10"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
            
            {/* Top Interactive Studio Area: Preview & Controls */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-white/[0.03] p-5 rounded-3xl border border-white/10">
              
              {/* Avatar Live Display */}
              <div className="md:col-span-5 flex flex-col items-center justify-center gap-3 text-center">
                <div className="relative group">
                  <div 
                    className="absolute -inset-2 rounded-3xl blur-xl opacity-50 transition duration-500 group-hover:opacity-80"
                    style={{
                      background: `linear-gradient(45deg, ${currentBranding.primaryColor}, ${currentBranding.secondaryColor})`
                    }}
                  />
                  <img
                    src={currentSvgAvatar}
                    alt={title}
                    referrerPolicy="no-referrer"
                    className="relative w-36 h-36 rounded-3xl shadow-2xl border-2 border-white/20 object-cover bg-black/60 transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">{title || 'Untitled Project'}</h3>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <span 
                      className="text-[11px] font-mono px-2 py-0.5 rounded-lg border font-semibold"
                      style={{
                        backgroundColor: currentBranding.badgeBg,
                        borderColor: currentBranding.badgeBorder,
                        color: currentBranding.primaryColor
                      }}
                    >
                      {currentBranding.styleCategory}
                    </span>
                    <span className="text-xs text-gray-400">
                      {technologies.length} Stack Tags
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={handleDownloadSvg}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-300 hover:text-white transition-all flex items-center gap-1.5"
                    title="Download SVG vector"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download SVG</span>
                  </button>

                  <button
                    onClick={handleGenerateAIBranding}
                    disabled={isGeneratingAI}
                    className="px-3 py-1.5 rounded-xl bg-brand-blue/20 hover:bg-brand-blue/30 border border-brand-blue/30 text-xs text-brand-blue transition-all flex items-center gap-1.5"
                    title="Refine brand theme with AI"
                  >
                    <Wand2 className={cn("w-3.5 h-3.5", isGeneratingAI && "animate-spin")} />
                    <span>{isGeneratingAI ? 'Styling...' : 'AI Palette'}</span>
                  </button>
                </div>
              </div>

              {/* Stack Branding Details */}
              <div className="md:col-span-7 space-y-4">
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-brand-blue" />
                    Color Palette Synergy
                  </span>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-center">
                      <div 
                        className="w-full h-5 rounded-lg mb-1.5 shadow-inner"
                        style={{ backgroundColor: currentBranding.primaryColor }}
                      />
                      <span className="text-[10px] text-gray-400 block font-mono">Primary</span>
                      <span className="text-xs font-bold text-white font-mono">{currentBranding.primaryColor}</span>
                    </div>

                    <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-center">
                      <div 
                        className="w-full h-5 rounded-lg mb-1.5 shadow-inner"
                        style={{ backgroundColor: currentBranding.secondaryColor }}
                      />
                      <span className="text-[10px] text-gray-400 block font-mono">Secondary</span>
                      <span className="text-xs font-bold text-white font-mono">{currentBranding.secondaryColor}</span>
                    </div>

                    <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-center">
                      <div 
                        className="w-full h-5 rounded-lg mb-1.5 shadow-inner"
                        style={{ backgroundColor: currentBranding.accentColor }}
                      />
                      <span className="text-[10px] text-gray-400 block font-mono">Accent</span>
                      <span className="text-xs font-bold text-white font-mono">{currentBranding.accentColor}</span>
                    </div>
                  </div>
                </div>

                {/* AI Brief if generated */}
                {aiBranding && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-brand-blue/30 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-brand-blue flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> {aiBranding.themeName}
                      </span>
                      <span className="text-xs">{aiBranding.recommendedSymbol}</span>
                    </div>
                    <p className="text-xs text-gray-300 italic">"{aiBranding.tagline}"</p>
                    <p className="text-[11px] text-gray-400 line-clamp-2">{aiBranding.visualDescription}</p>
                  </motion.div>
                )}

                {/* Size Preview Gallery */}
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Avatar Scale Previews
                  </span>
                  <div className="flex items-center gap-4 bg-white/5 p-3 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-1.5">
                      <ProjectAvatar title={title} technologies={technologies} size="sm" />
                      <span className="text-[10px] text-gray-400 font-mono">36px (Sm)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ProjectAvatar title={title} technologies={technologies} size="md" />
                      <span className="text-[10px] text-gray-400 font-mono">48px (Md)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ProjectAvatar title={title} technologies={technologies} size="lg" />
                      <span className="text-[10px] text-gray-400 font-mono">64px (Lg)</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Project Config Form */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300">Project Name</label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. DocuQuery AI"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-brand-blue"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    placeholder="e.g. AI / Machine Learning"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-brand-blue"
                  />
                </div>
              </div>

              {/* Technologies Tag Manager */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-300 flex items-center justify-between">
                  <span>Technology Stack Tags (Powers the visual avatar)</span>
                  <span className="text-[11px] text-gray-500">Press Enter or comma to add</span>
                </label>

                {/* Active Stack Tags */}
                <div className="flex flex-wrap gap-2 p-3 bg-white/5 border border-white/10 rounded-2xl min-h-[48px]">
                  {technologies.map(tech => {
                    const norm = tech.toLowerCase().trim();
                    const palette = TECH_PALETTES[norm];
                    return (
                      <span
                        key={tech}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium border transition-all"
                        style={{
                          backgroundColor: palette ? `${palette.color}18` : 'rgba(255,255,255,0.08)',
                          borderColor: palette ? `${palette.color}40` : 'rgba(255,255,255,0.15)',
                          color: palette ? palette.color : '#e2e8f0'
                        }}
                      >
                        {palette?.symbol && <span>{palette.symbol}</span>}
                        <span>{tech}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTech(tech)}
                          className="hover:text-red-400 transition-colors ml-0.5"
                          title={`Remove ${tech}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })}

                  <div className="flex-1 min-w-[140px] flex items-center">
                    <input
                      type="text"
                      value={techInput}
                      onChange={e => setTechInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ',') {
                          e.preventDefault();
                          handleAddTech(techInput);
                        }
                      }}
                      placeholder="+ Add tech tag..."
                      className="w-full bg-transparent border-none text-xs text-white placeholder-gray-500 focus:outline-none px-1"
                    />
                  </div>
                </div>

                {/* Popular Presets */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-semibold text-gray-400">Quick Stack Presets:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_STACKS.map(preset => (
                      <button
                        key={preset.name}
                        onClick={() => handleApplyPreset(preset)}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-gray-300 hover:text-white transition-colors"
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Footer Controls */}
          <div className="p-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-between shrink-0">
            <span className="text-xs text-gray-400">
              Avatar automatically adapts whenever technology stack tags change.
            </span>

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-medium transition-colors"
              >
                Close
              </button>

              <button
                onClick={handleSaveAndApply}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Apply Branding to Project</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
