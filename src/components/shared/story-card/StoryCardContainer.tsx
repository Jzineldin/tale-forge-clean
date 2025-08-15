import React from 'react';
import { StoryCardContainerProps } from './types';
import { cn } from '@/lib/utils';

/**
 * StoryCardContainer - The main wrapper component for story cards
 * 
 * This component provides the base container with proper styling and layout
 * for all story card variants using the hybrid CSS variables + Tailwind approach.
 */
const StoryCardContainer: React.FC<StoryCardContainerProps> = ({
  story,
  variant = 'landscape',
  className = '',
  children
}) => {
  // Base classes common to all story cards
  const baseClasses = "relative overflow-hidden transition-all duration-normal";
  
  // Variant-specific classes using the same glass morphism as landing page
  const variantClasses = {
    landscape: "glass-enhanced backdrop-blur-lg bg-black/40 border border-white/20 rounded-2xl shadow-lg",
    portrait: "glass-enhanced backdrop-blur-lg bg-black/40 border border-white/20 rounded-2xl shadow-lg aspect-[3/4]",
    compact: "glass-enhanced backdrop-blur-lg bg-black/40 border border-white/20 rounded-xl shadow-md p-2",
    featured: "glass-enhanced backdrop-blur-lg bg-black/50 border border-white/30 rounded-2xl shadow-xl"
  };

  // Hover effect classes with beautiful glass morphism effects
  const hoverClasses = {
    landscape: "hover:bg-black/50 hover:border-white/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300",
    portrait: "hover:bg-black/50 hover:border-white/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300",
    compact: "hover:bg-black/50 hover:border-white/30 hover:shadow-lg transition-all duration-300",
    featured: "hover:bg-black/60 hover:border-white/40 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
  };

  return (
    <div 
      className={cn(
        baseClasses,
        variantClasses[variant as keyof typeof variantClasses] || variantClasses.landscape,
        hoverClasses[variant as keyof typeof hoverClasses] || hoverClasses.landscape,
        // Keep the original class names for backward compatibility during transition
        `story-card ${variant}`,
        className
      )}
      data-story-id={story.id}
    >
      {children}
    </div>
  );
};

export default StoryCardContainer;