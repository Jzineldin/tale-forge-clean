
import React from 'react';
import { ChevronDown, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EnhancedScrollIndicatorProps {
  targetId?: string;
  className?: string;
}

const EnhancedScrollIndicator: React.FC<EnhancedScrollIndicatorProps> = ({ 
  targetId = 'main-content',
  className = ''
}) => {
  const scrollToContent = () => {
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    } else {
      // Fallback: scroll by viewport height
      const viewportHeight = window.innerHeight;
      window.scrollTo({
        top: viewportHeight,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <Button
        onClick={scrollToContent}
        variant="ghost"
        size="lg"
        className="group flex flex-col items-center gap-2 text-white/90 hover:text-white hover:bg-white/10 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-transparent rounded-2xl px-6 py-4 backdrop-blur-sm border border-white/20 hover:border-white/30"
      >
        <span className="text-sm font-medium tracking-wide">Start Your Adventure</span>
        <div className="flex items-center gap-1">
          <ArrowDown className="h-4 w-4 group-hover:translate-y-1 transition-transform duration-300" />
          <ChevronDown className="h-5 w-5 animate-bounce group-hover:animate-pulse" />
        </div>
      </Button>
      
      <div className="text-xs text-white/60 animate-pulse">
        Scroll to explore features
      </div>
    </div>
  );
};

export default EnhancedScrollIndicator;
