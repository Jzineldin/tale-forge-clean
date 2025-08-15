import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface FeatureSlide {
  id: string;
  title: string;
  description: string;
  badge?: string;
  order_index: number;
  is_active: boolean;
}

const LatestFeaturesShowcase: React.FC = () => {
  const [slides, setSlides] = useState<FeatureSlide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  // Get badge styling based on badge type
  const getBadgeStyle = (badge: string) => {
    switch (badge) {
      case 'NEW':
        return 'bg-emerald-500 text-white border-0';
      case 'UPDATE':
        return 'bg-blue-500 text-white border-0';
      case 'FEATURE':
        return 'bg-purple-500 text-white border-0';
      case 'IMPROVEMENT':
        return 'bg-amber-500 text-white border-0';
      case 'FIX':
        return 'bg-red-500 text-white border-0';
      case 'BETA':
        return 'bg-orange-500 text-white border-0';
      case 'COMING SOON':
        return 'bg-slate-500 text-white border-0';
      case 'HOT':
        return 'bg-pink-500 text-white border-0';
      case 'POPULAR':
        return 'bg-indigo-500 text-white border-0';
      default:
        return 'bg-gray-500 text-white border-0';
    }
  };

  useEffect(() => {
    loadFeatures();
  }, []); // Only run once on mount

  useEffect(() => {
    // Auto-advance slides every 5 seconds, but only if not paused
    if (!isPaused) {
      const interval = setInterval(() => {
        setCurrentSlide(prev => {
          const activeSlides = slides.filter(s => s.is_active);
          if (activeSlides.length === 0) return 0;
          return (prev + 1) % activeSlides.length;
        });
      }, 5000);

      return () => clearInterval(interval);
    }
    return () => {}; // Return empty cleanup function when paused
  }, [slides, isPaused]); // Depend on both slides and isPaused

  const loadFeatures = async () => {
    try {
      // Load active slides with proper type casting
      const { data: slidesData, error: slidesError } = await supabase
        .from('latest_features')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (slidesError) throw slidesError;
      
      // Properly cast and set the slides data
      setSlides((slidesData as FeatureSlide[]) || []);

      // Load visibility setting
      const { data: settingData } = await supabase
        .from('admin_settings')
        .select('value')
        .eq('key', 'latest_features_visible')
        .single();
      
      setIsVisible(settingData?.value === 'true');
    } catch (error) {
      console.error('Error loading features:', error);
      // Default to visible if no setting found and set empty slides
      setIsVisible(true);
      setSlides([]);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Don't render if still loading
  if (loading) {
    return (
      <section className="px-4 pb-8">
        <div className="max-w-5xl mx-auto">
          <div className="glass-enhanced rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12 transition-all duration-300">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <h2 className="text-lg font-bold text-white">
                Latest Features
              </h2>
            </div>
            <div className="text-center text-slate-400 py-8">
              Loading latest features...
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Always render the card, but show different content based on state
  const renderContent = () => {
    if (!isVisible) {
      return (
        <div className="text-center">
          <h3 className="text-lg font-bold text-white mb-2">
            Features showcase is currently disabled
          </h3>
        </div>
      );
    }
    
    if (slides.length === 0) {
      return (
        <div className="text-center">
          <h3 className="text-lg font-bold text-white mb-2">
            No new features to announce
          </h3>
        </div>
      );
    }

    // Render actual slides
    const currentFeature = slides[currentSlide];
    return (
      <div className="relative flex items-center">
        {/* Navigation buttons */}
        {slides.length > 1 && (
          <>
            <Button
              size="sm"
              variant="ghost"
              onClick={prevSlide}
              className="absolute left-0 z-10 bg-black/20 hover:bg-black/40 text-white border-white/20"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={nextSlide}
              className="absolute right-0 z-10 bg-black/20 hover:bg-black/40 text-white border-white/20"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}

        {/* Slide content */}
        <div className="flex-1 text-center px-12">
          <div className="flex items-center justify-center gap-2">
            <h3 className="text-lg font-bold text-white">
              {currentFeature.title}
            </h3>
            {currentFeature.badge && (
              <Badge 
                className={`${getBadgeStyle(currentFeature.badge)} font-medium text-xs px-2 py-0.5 shadow-sm opacity-90`}
              >
                {currentFeature.badge}
              </Badge>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="px-4 pb-8">
      <div className="max-w-5xl mx-auto">
        <div 
          className="glass-enhanced rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12 transition-all duration-300"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Content - always show container, much more compact */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-2 bg-slate-900/50 rounded-full border border-white/10">
              <Sparkles className="h-5 w-5 text-amber-400" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.8))' }} />
            </div>
            <h2 className="fantasy-heading text-2xl sm:text-3xl md:text-4xl">
              Latest Features
            </h2>
          </div>

          {renderContent()}

          {/* Dots indicator - only show if we have multiple slides and they're visible */}
          {isVisible && slides.length > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-4">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`rounded-full transition-all duration-300 ${
                    index === currentSlide
                      ? 'w-3 h-3 bg-amber-500'
                      : 'w-2 h-2 bg-slate-600 hover:bg-slate-500'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default LatestFeaturesShowcase;
