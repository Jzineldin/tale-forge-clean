
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Home, ChevronLeft, ChevronRight, Volume2 } from 'lucide-react';
import EnhancedAudioPlayer from '@/components/story-display/EnhancedAudioPlayer';

interface CompleteStoryViewerProps {
  storyHistory: any[];
  fullStoryAudioUrl: string;
  onExit: () => void;
}

const CompleteStoryViewer: React.FC<CompleteStoryViewerProps> = ({
  storyHistory,
  fullStoryAudioUrl,
  onExit
}) => {
  const [currentChapter, setCurrentChapter] = useState(0);
  const [showAllChapters, setShowAllChapters] = useState(false);

  const totalWords = storyHistory.reduce((acc, segment) => 
    acc + (segment.text?.split(' ').length || 0), 0
  );

  const goToPreviousChapter = () => {
    setCurrentChapter(prev => Math.max(0, prev - 1));
  };

  const goToNextChapter = () => {
    setCurrentChapter(prev => Math.min(storyHistory.length - 1, prev + 1));
  };

  const currentSegment = storyHistory[currentChapter];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Story Header */}
      <Card className="bg-gradient-to-r from-amber-900/30 to-purple-900/30 border-amber-500/30">
        <CardHeader className="text-center">
          <CardTitle className="text-amber-300 text-3xl font-serif flex items-center justify-center gap-3">
            <BookOpen className="h-8 w-8" />
            🎉 Your Complete Story
          </CardTitle>
          <p className="text-slate-300 text-lg">
            <strong>{storyHistory.length} chapters</strong> • <strong>{totalWords} words</strong> • Complete with voice narration
          </p>
        </CardHeader>
      </Card>

      {/* Audio Player */}
      <Card className="bg-slate-800/80 border-amber-500/20">
        <CardHeader>
          <CardTitle className="text-amber-300 text-xl flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Full Story Audio
          </CardTitle>
          <p className="text-slate-400 text-sm">
            Listen to your complete adventure while following along with the chapters below
          </p>
        </CardHeader>
        <CardContent>
          <EnhancedAudioPlayer
            audioUrl={fullStoryAudioUrl}
            storyTitle="Your Complete Adventure"
          />
        </CardContent>
      </Card>

      {/* View Toggle */}
      <div className="flex justify-center gap-4">
        <Button
          onClick={() => setShowAllChapters(false)}
          variant={!showAllChapters ? "default" : "outline"}
          className={!showAllChapters ? "bg-amber-500 text-slate-900" : "border-amber-500/40 text-amber-300"}
        >
          Chapter View
        </Button>
        <Button
          onClick={() => setShowAllChapters(true)}
          variant={showAllChapters ? "default" : "outline"}
          className={showAllChapters ? "bg-amber-500 text-slate-900" : "border-amber-500/40 text-amber-300"}
        >
          Full Story View
        </Button>
      </div>

      {/* Chapter Navigation (when in chapter view) */}
      {!showAllChapters && storyHistory.length > 1 && (
        <div className="flex items-center justify-between bg-slate-800/60 border border-amber-500/30 rounded-lg p-4">
          <Button
            onClick={goToPreviousChapter}
            disabled={currentChapter === 0}
            variant="ghost"
            className="text-amber-400 hover:text-amber-300 disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous Chapter
          </Button>

          <div className="text-center">
            <p className="text-amber-300 font-medium">
              Chapter {currentChapter + 1} of {storyHistory.length}
            </p>
          </div>

          <Button
            onClick={goToNextChapter}
            disabled={currentChapter >= storyHistory.length - 1}
            variant="ghost"
            className="text-amber-400 hover:text-amber-300 disabled:opacity-50"
          >
            Next Chapter
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}

      {/* Story Content */}
      {showAllChapters ? (
        // Show all chapters
        <div className="space-y-8">
          {storyHistory.map((segment, index) => (
            <Card key={index} className="bg-slate-900/80 border-amber-500/20">
              <CardHeader>
                <CardTitle className="text-amber-300 text-xl font-serif">
                  Chapter {index + 1}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Image */}
                  <div className="lg:col-span-1">
                    {segment.imageUrl && segment.imageUrl !== '/placeholder.svg' ? (
                      <img
                        src={segment.imageUrl}
                        alt={`Chapter ${index + 1}`}
                        className="w-full h-64 object-cover rounded-lg border border-amber-500/20 shadow-lg"
                      />
                    ) : (
                      <div className="w-full h-64 bg-slate-700/50 border-2 border-dashed border-amber-500/30 rounded-lg flex items-center justify-center">
                        <p className="text-amber-300/70 text-sm">Chapter {index + 1}</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Text */}
                  <div className="lg:col-span-2">
                    <div className="prose prose-invert max-w-none">
                      <p className="text-gray-100 text-lg leading-relaxed font-serif whitespace-pre-wrap">
                        {segment.text}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        // Show single chapter
        <Card className="bg-slate-900/80 border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-amber-300 text-2xl font-serif">
              Chapter {currentChapter + 1}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Current Chapter Image */}
            <div className="story-image-section w-full">
              {currentSegment.imageUrl && currentSegment.imageUrl !== '/placeholder.svg' ? (
                <img
                  src={currentSegment.imageUrl}
                  alt={`Chapter ${currentChapter + 1}`}
                  className="w-full max-w-4xl h-80 md:h-96 rounded-lg border border-amber-500/20 object-cover shadow-lg mx-auto"
                />
              ) : (
                <div className="w-full max-w-4xl h-80 md:h-96 rounded-lg border-2 border-dashed border-amber-500/30 bg-slate-800/50 flex items-center justify-center mx-auto">
                  <p className="text-amber-300/70 text-lg">Chapter {currentChapter + 1}</p>
                </div>
              )}
            </div>

            {/* Current Chapter Text */}
            <div className="story-text-section w-full">
              <Card className="bg-slate-800/80 border-amber-500/20 shadow-inner">
                <CardContent className="p-8">
                  <div className="prose prose-invert max-w-none">
                    <div 
                      className="text-gray-100 text-lg leading-relaxed font-serif whitespace-pre-wrap"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {currentSegment.text}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Exit Button */}
      <div className="text-center py-8">
        <Button
          onClick={onExit}
          className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold px-8 py-3 text-lg transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          <Home className="mr-2 h-5 w-5" />
          Start New Adventure
        </Button>
      </div>
    </div>
  );
};

export default CompleteStoryViewer;
