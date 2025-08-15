import React, { useState, useMemo } from 'react';
import { DeleteStoryDialog } from '@/components/my-stories/DeleteStoryDialog';
import { StoryCard } from '@/components/shared/story-card';
import { useUnifiedStories } from '@/hooks/useUnifiedStories';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { Search, Filter, BookOpen, Grid, List, PenTool } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';


// Performance and error handling enhancements
import { usePerformanceMonitor, useDebounce as useDebouncePerf, useMemoizedCallback, useMobileOptimization } from '@/utils/performanceOptimizations';
// Enhanced error handler removed

type FilterOption = 'all' | 'completed' | 'in-progress' | 'public' | 'private' | 'with-voice' | 'without-voice';
type SortOption = 'newest' | 'oldest' | 'title' | 'length' | 'completion';
type ViewMode = 'grid' | 'list';

const MyStories: React.FC = () => {
  // Performance monitoring
  const { renderCount, timeSinceLastRender } = usePerformanceMonitor('MyStories');
  // TypeScript compilation success logged via secure logger
  // Mobile optimization
  useMobileOptimization();
  // Enhanced error handling
  // Enhanced error handling removed

  const {
    stories,
    handleRefresh,
    deleteStory,
    isOnline: _isOnline
  } = useUnifiedStories();

  // Debug log simplified for performance
  React.useEffect(() => {
    // Only log in development and only significant changes
    if (import.meta.env.MODE === 'development' && stories.length > 0) {
      console.log(`📚 MyStories loaded: ${stories.length} stories`);
    }
  }, [stories.length]);

  const [storyToDelete, setStoryToDelete] = useState<string | null>(null);
  const [storyToDeleteTitle, setStoryToDeleteTitle] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<string>('');


  const navigate = useNavigate();

  // Use performance debounce
  const debouncedSearchTermPerf = useDebouncePerf(searchTerm, 500);

  const genres = [
    { value: 'child-adapted', label: 'Child Adapted', emoji: '👶' },
    { value: 'horror-story', label: 'Horror Story', emoji: '👻' },
    { value: 'educational', label: 'Educational', emoji: '📚' },
    { value: 'epic-fantasy', label: 'Epic Fantasy', emoji: '🏰' },
    { value: 'sci-fi-thriller', label: 'Sci-Fi Thriller', emoji: '🚀' },
    { value: 'mystery', label: 'Mystery', emoji: '🕵️' },
    { value: 'romantic-drama', label: 'Romantic Drama', emoji: '💕' },
    { value: 'adventure-quest', label: 'Adventure Quest', emoji: '🗺️' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'title', label: 'Title A-Z' },
    { value: 'length', label: 'Longest First' },
    { value: 'completion', label: 'Completion Status' }
  ];

  // Memoized filtering and sorting for performance
  const filteredAndSortedStories = useMemo(() => {
    let filtered = stories;
    // Apply search filter
    if (debouncedSearchTermPerf) {
      filtered = filtered.filter(story => 
        story.title?.toLowerCase().includes(debouncedSearchTermPerf.toLowerCase()) ||
        story.story_mode?.toLowerCase().includes(debouncedSearchTermPerf.toLowerCase())
      );
    }
    // Apply status filter
    switch (filterBy) {
      case 'completed':
        filtered = filtered.filter(story => story.is_completed);
        break;
      case 'in-progress':
        filtered = filtered.filter(story => !story.is_completed);
        break;
      case 'public':
        filtered = filtered.filter(story => story.is_public);
        break;
      case 'private':
        filtered = filtered.filter(story => !story.is_public);
        break;
      case 'with-voice':
        filtered = filtered.filter(story => story.audio_generation_status === 'completed' && story.full_story_audio_url);
        break;
      case 'without-voice':
        filtered = filtered.filter(story => !story.full_story_audio_url || story.audio_generation_status !== 'completed');
        break;
    }
    // Apply genre filter
    if (selectedGenre) {
      filtered = filtered.filter(story => story.story_mode === selectedGenre);
    }
    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'title':
          return (a.title || 'Untitled').localeCompare(b.title || 'Untitled');
        case 'length':
          return b.segment_count - a.segment_count;
        case 'completion':
          if (a.is_completed !== b.is_completed) {
            return a.is_completed ? -1 : 1;
          }
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default:
          return 0;
      }
    });
    return sorted;
  }, [stories, debouncedSearchTermPerf, filterBy, sortBy, selectedGenre]);

  // Memoized stats
  useMemo(() => {
    const total = stories.length;
    const completed = stories.filter(s => s.is_completed).length;
    const inProgress = stories.filter(s => !s.is_completed).length;
    const publicStories = stories.filter(s => s.is_public).length;
    const totalSegments = stories.reduce((sum, s) => sum + s.segment_count, 0);
    return { total, completed, inProgress, publicStories, totalSegments };
  }, [stories]);

  // Group stories by progress status and voice generation
  const storyGroups = useMemo(() => {
    const completedStories = filteredAndSortedStories.filter(story => story.is_completed);
    const inProgressStories = filteredAndSortedStories.filter(story => !story.is_completed && story.segment_count > 0);
    const newStories = filteredAndSortedStories.filter(story => !story.is_completed && story.segment_count === 0);
    
    // Voice-generated stories (only show if not using voice filter)
    const voiceGeneratedStories = filterBy === 'all' ? 
      filteredAndSortedStories.filter(story => story.audio_generation_status === 'completed' && story.full_story_audio_url) : [];
    
    const groups: Record<string, { stories: any[], title: string, description: string }> = {
      completed: { stories: completedStories, title: "📚 Completed Stories", description: "Stories that have been finished" },
      inProgress: { stories: inProgressStories, title: "✍️ Stories in Progress", description: "Stories you're currently working on" },
      new: { stories: newStories, title: "🆕 New Stories", description: "Stories ready to begin" }
    };

    // Add voice-generated section if there are any and we're not already filtering by voice
    if (voiceGeneratedStories.length > 0) {
      groups.voiceGenerated = { 
        stories: voiceGeneratedStories, 
        title: "🎵 Voice Generated Stories", 
        description: "Stories with full audio narration" 
      };
    }

    return groups;
  }, [filteredAndSortedStories, filterBy]);

  // Debug: Log stories data to see what's available
  // console.log('All stories data:', stories);
  // console.log('Filtered stories:', filteredAndSortedStories);
  // console.log('Story groups:', storyGroups);

  // Memoized handlers
  const handleSetStoryToDelete = useMemoizedCallback((storyId: string) => {
    const story = stories.find(s => s.id === storyId);
    setStoryToDelete(storyId);
    setStoryToDeleteTitle(story?.title || 'Untitled Story');
  }, [stories]);

  const handleConfirmDelete = useMemoizedCallback(() => {
    if (storyToDelete) {
        deleteStory(storyToDelete);
        setStoryToDelete(null);
        setStoryToDeleteTitle('');
    }
  }, [storyToDelete, deleteStory]);

  const handleCancelDelete = useMemoizedCallback(() => {
    setStoryToDelete(null);
    setStoryToDeleteTitle('');
  }, []);

  useMemoizedCallback(() => {
    handleRefresh();
  }, [handleRefresh]);

  // Edit handler for the shared StoryCard component
  const handleStartEdit = (storyId: string, _currentTitle: string) => {
    // Navigate to the dedicated story editor page
    navigate(`/story-editor/${storyId}`);
  };

  // Helper function to render story cards
  const renderStoryCard = (story: any) => {
    return (
      <StoryCard
        key={story.id}
        story={story}
        variant="portrait"
        onView={(story) => navigate(`/story/${story.id}`)}
        onEdit={(story) => handleStartEdit(story.id, story.title || '')}
        onDelete={(story) => handleSetStoryToDelete(story.id)}
        showSecondaryActions={true}
        className="h-full"
      />
    );
  };

  // Performance monitoring - only in development and reduced frequency
  React.useEffect(() => {
    if (import.meta.env.MODE === 'development' && renderCount % 5 === 0) {
      console.log(`⚡ MyStories performance: ${renderCount} renders, ${timeSinceLastRender}ms`);
    }
  }, [renderCount, timeSinceLastRender]);

  return (
    <div className="min-h-screen w-full relative">
      {/* Same beautiful background as landing page */}
      <div className="scene-bg"></div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="container mx-auto px-4 py-16">
          {/* Hero Section - Matching landing page style */}
          <div className="hero-section relative pt-20 pb-12 flex items-center justify-center px-4">
            <div className="glass-enhanced backdrop-blur-lg bg-black/40 border border-white/20 rounded-2xl p-6 md:p-8 lg:p-10 max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto">
              <div className="text-center">
                {/* Main Title */}
                <h1 className="fantasy-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-center" style={{
                  textShadow: '0 2px 4px rgba(0,0,0,0.6)'
                }}>
                  YOUR LIBRARY
                </h1>
                {/* Subtitle */}
                <p className="fantasy-subtitle text-lg sm:text-xl md:text-2xl mb-6 leading-relaxed" style={{
                  textShadow: '0 2px 4px rgba(0,0,0,0.6)'
                }}>
                  Every adventure you've authored, here to replay or continue.
                </p>

                {/* Action Button */}
                <div className="flex justify-center">
                  <Button
                    onClick={() => navigate('/')}
                    variant="orange-amber"
                    size="lg"
                    className="font-bold text-base sm:text-lg">
                    <PenTool className="mr-2 h-5 w-5" />
                    Create New Story
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Search and Filters */}
          <div className="glass-enhanced backdrop-blur-lg bg-black/40 border border-white/20 rounded-2xl shadow-xl p-6 mb-8">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search your stories by title or genre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-white/60 focus:border-white/30 focus:outline-none transition-all duration-300"
                />
              </div>

                {/* Controls Row */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Button
                      onClick={() => setShowFilters(!showFilters)}
                      variant="secondary"
                      className="font-bold"
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                    
                    <Select value={filterBy} onValueChange={(value) => setFilterBy(value as FilterOption)}>
                      <SelectTrigger className="w-40 bg-black/20 border border-white/10 rounded-xl text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Stories</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                        <SelectItem value="with-voice">🎵 With Voice</SelectItem>
                        <SelectItem value="without-voice">🔇 Without Voice</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                      <SelectTrigger className="w-40 bg-black/20 border border-white/10 rounded-xl text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {sortOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => setViewMode('grid')}
                      variant={viewMode === 'grid' ? 'orange-amber' : 'secondary'}
                      size="sm"
                      className="px-3 py-2"
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => setViewMode('list')}
                      variant={viewMode === 'list' ? 'orange-amber' : 'secondary'}
                      size="sm"
                      className="px-3 py-2"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Genre Filters */}
                {showFilters && (
                  <div className="border-t border-white/20 pt-4">
                    <div className="flex flex-wrap justify-center gap-2">
                      <Button
                        onClick={() => setSelectedGenre('')}
                        variant={selectedGenre === '' ? 'orange-amber' : 'secondary'}
                        size="sm"
                        className="text-sm"
                      >
                        All Genres
                      </Button>
                      {genres.map((genre) => (
                        <Button
                          key={genre.value}
                          onClick={() => setSelectedGenre(genre.value)}
                          variant={selectedGenre === genre.value ? 'orange-amber' : 'secondary'}
                          size="sm"
                          className="text-sm"
                        >
                          {genre.emoji} {genre.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

          {/* Results Summary */}
          {filteredAndSortedStories.length !== stories.length && (
            <div className="mb-6 text-center">
              <Badge variant="outline" className="text-amber-300 border-amber-400/50">
                Showing {filteredAndSortedStories.length} of {stories.length} stories
              </Badge>
            </div>
          )}

          {/* Stories Content */}
          {stories.length === 0 ? (
            <div className="text-center py-20">
                <div className="max-w-lg mx-auto">
                  <div className="glass-enhanced backdrop-blur-lg bg-black/40 border border-white/20 rounded-2xl p-8 mb-8">
                    <BookOpen className="h-20 w-20 text-amber-300/60 mx-auto mb-6" />
                    <h3 className="fantasy-heading text-3xl font-semibold text-white mb-4" style={{
                      textShadow: '0 2px 4px rgba(0,0,0,0.6)'
                    }}>
                      Your Library Awaits Its First Tale
                    </h3>
                    <p className="text-white/90 text-lg mb-8 leading-relaxed" style={{
                      textShadow: '0 2px 4px rgba(0,0,0,0.6)'
                    }}>
                      Every grand library begins with a single story. Let your imagination flourish and create your first magical adventure.
                    </p>
                    <Link to="/">
                      <Button variant="orange-amber" size="lg" className="font-bold">
                        <PenTool className="h-5 w-5 mr-2" />
                        Begin Your First Story
                      </Button>
                    </Link>
                  </div>
                </div>
            </div>
          ) : (
            <>
              {filteredAndSortedStories.length === 0 ? (
                <div className="text-center py-20">
                  <div className="glass-enhanced max-w-lg mx-auto">
                    <div className="p-8">
                      <Search className="h-16 w-16 text-amber-400 mx-auto mb-6" />
                      <h3 className="fantasy-title text-2xl font-bold text-white mb-4">No Stories Found</h3>
                      <p className="text-gray-300 mb-6">
                        Try adjusting your search terms or filters to find your stories.
                      </p>
                      <Button
                        onClick={() => {
                          setSearchTerm('');
                          setFilterBy('all');
                          setSelectedGenre('');
                        }}
                        variant="secondary"
                        size="lg"
                        className="font-bold"
                      >
                        Clear Filters
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-12">
                  {Object.entries(storyGroups).map(([key, group]) => {
                    if (group.stories.length === 0) return null;
                    
                    return (
                      <div key={key}>
                        {/* Group Header */}
                        <div className="mb-8 text-center">
                          <h2 className="fantasy-heading text-2xl md:text-3xl font-bold text-white mb-2">
                            {group.title}
                          </h2>
                          <p className="fantasy-subtitle text-gray-400 text-lg mb-4">
                            {group.description}
                          </p>
                          <div className="flex items-center justify-center gap-4 text-amber-300/80">
                            <div className="flex items-center gap-2">
                              <BookOpen className="h-4 w-4" />
                              <span>{group.stories.length} {group.stories.length === 1 ? 'story' : 'stories'}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Stories Grid */}
                        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-6' : 'space-y-4'}>
                          {group.stories.map((story) => renderStoryCard(story))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <DeleteStoryDialog
        isOpen={!!storyToDelete}
        storyTitle={storyToDeleteTitle}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
};

export default MyStories;