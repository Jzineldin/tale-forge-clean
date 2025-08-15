
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import InlineStoryCreation from '@/components/story-creation/InlineStoryCreation';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const StoryCreation: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  
  const prompt = searchParams.get('prompt');
  const mode = searchParams.get('mode') || searchParams.get('genre'); // Accept both mode and genre
  
  // Check for resume state from location
  const resumeStoryId = location.state?.resumeStoryId;
  const resumeStoryTitle = location.state?.resumeStoryTitle;

  const handleExit = () => {
    // Clear URL parameters when exiting to prevent auto-generation on return
    setSearchParams({});
    // Go back to home instead of creating new routes
    navigate('/', { replace: true });
  };

  // Clear parameters if user navigates back after completing a story
  useEffect(() => {
    const handlePopState = () => {
      // Clear parameters when user uses browser back button
      if (searchParams.has('prompt') || searchParams.has('mode') || searchParams.has('genre')) {
        setSearchParams({});
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [searchParams, setSearchParams]);

  // Redirect to genre selection if no parameters and not resuming
  useEffect(() => {
    if (!prompt && !mode && !resumeStoryId) {
      navigate('/create/genre', { replace: true });
    }
  }, [prompt, mode, resumeStoryId, navigate]);

  // If we have prompt and mode, or are resuming a story, show inline creation
  if ((prompt && mode) || resumeStoryId) {
    return (
      <InlineStoryCreation 
        onExit={handleExit} 
        resumeStoryId={resumeStoryId}
        resumeStoryTitle={resumeStoryTitle}
      />
    );
  }

  // Fallback - show loading while redirecting
  if (!prompt || !mode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-white">Loading your story creation...</p>
        </div>
      </div>
    );
  }

  // Show loading while redirecting
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <p className="text-white">Loading your story creation...</p>
      </div>
    </div>
  );
};

export default StoryCreation;
