import React from 'react';
import { motion } from 'motion/react';
import { X, ThumbsUp, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getDomainMeta, getInterestMeta } from '@/data/technicalDomains';

interface SkillTagProps {
  name: string;
  type?: 'skill' | 'interest';
  size?: 'sm' | 'md' | 'lg';
  showCategory?: boolean;
  endorsementsCount?: number;
  isEndorsed?: boolean;
  onEndorse?: (e: React.MouseEvent) => void;
  onRemove?: () => void;
  onClick?: () => void;
  interactive?: boolean;
  className?: string;
}

export default function SkillTag({
  name,
  type = 'skill',
  size = 'md',
  showCategory = false,
  endorsementsCount = 0,
  isEndorsed = false,
  onEndorse,
  onRemove,
  onClick,
  interactive = false,
  className,
}: SkillTagProps) {
  const domain = type === 'skill' ? getDomainMeta(name) : null;
  const interest = type === 'interest' ? getInterestMeta(name) : null;

  const bgClass = domain ? domain.bgClass : interest ? interest.bgClass : 'bg-white/5';
  const borderClass = domain ? domain.borderClass : interest ? interest.borderClass : 'border-white/10';
  const textClass = domain ? domain.textClass : interest ? interest.textClass : 'text-gray-200';
  const dotColor = domain?.dotColor || 'bg-brand-blue';

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1 gap-1.5',
    md: 'text-xs px-3 py-1.5 gap-2',
    lg: 'text-sm px-4 py-2 gap-2.5',
  }[size];

  return (
    <motion.span
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileHover={interactive || onClick ? { scale: 1.03 } : undefined}
      whileTap={interactive || onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={cn(
        'inline-flex items-center rounded-xl border font-medium transition-all shadow-sm select-none',
        bgClass,
        borderClass,
        textClass,
        sizeClasses,
        (interactive || onClick) && 'cursor-pointer hover:shadow-md hover:brightness-110',
        className
      )}
    >
      {/* Domain Category Color Indicator */}
      <span className={cn('w-2 h-2 rounded-full shrink-0', dotColor)} />

      {/* Tag Label */}
      <span className="font-semibold tracking-tight">{name}</span>

      {/* Optional Category Pill */}
      {showCategory && domain && (
        <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-black/30 border border-white/5 opacity-80">
          {domain.category}
        </span>
      )}

      {/* Endorsements Button / Badge */}
      {endorsementsCount > 0 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onEndorse) onEndorse(e);
          }}
          title={isEndorsed ? 'You endorsed this skill (tap to revoke)' : 'Endorse this skill'}
          className={cn(
            'flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[11px] transition-colors border',
            isEndorsed
              ? 'bg-brand-blue/30 text-white border-brand-blue/50'
              : 'bg-black/30 text-gray-300 border-white/10 hover:text-white hover:bg-black/50'
          )}
        >
          <ThumbsUp className={cn('w-2.5 h-2.5', isEndorsed && 'fill-brand-blue')} />
          <span>{endorsementsCount}</span>
        </button>
      )}

      {/* Remove Button ('x') */}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          aria-label={`Remove ${name}`}
          className="p-0.5 rounded-full hover:bg-black/40 text-current opacity-70 hover:opacity-100 transition-opacity ml-0.5"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </motion.span>
  );
}
