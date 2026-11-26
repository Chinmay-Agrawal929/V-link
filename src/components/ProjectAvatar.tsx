import React from 'react';
import { generateProjectStackAvatarSvg, getProjectBranding } from '@/utils/projectBranding';
import { cn } from '@/lib/utils';

interface ProjectAvatarProps {
  title: string;
  technologies?: string[];
  avatarUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showGlow?: boolean;
}

const SIZE_MAP = {
  sm: { px: 36, class: 'w-9 h-9 rounded-xl text-xs' },
  md: { px: 48, class: 'w-12 h-12 rounded-2xl text-sm' },
  lg: { px: 64, class: 'w-16 h-16 rounded-2xl text-base' },
  xl: { px: 88, class: 'w-22 h-22 rounded-3xl text-lg' },
};

export default function ProjectAvatar({
  title,
  technologies = [],
  avatarUrl,
  size = 'md',
  className,
  showGlow = false,
}: ProjectAvatarProps) {
  const sizeConfig = SIZE_MAP[size] || SIZE_MAP.md;
  const branding = getProjectBranding(technologies, title);
  
  // Use custom avatarUrl if provided, otherwise dynamically generate stack avatar SVG
  const src = avatarUrl || generateProjectStackAvatarSvg(technologies, title, sizeConfig.px * 2);

  return (
    <div className={cn("relative shrink-0 flex items-center justify-center select-none", className)}>
      {showGlow && (
        <div 
          className="absolute inset-0 rounded-2xl blur-md opacity-40 transition-opacity pointer-events-none"
          style={{ backgroundColor: branding.primaryColor }}
        />
      )}
      <img
        src={src}
        alt={`${title} avatar`}
        referrerPolicy="no-referrer"
        className={cn(
          sizeConfig.class,
          "object-cover border shadow-sm relative z-10 transition-transform group-hover:scale-105",
          "border-white/10 hover:border-white/25"
        )}
      />
    </div>
  );
}
