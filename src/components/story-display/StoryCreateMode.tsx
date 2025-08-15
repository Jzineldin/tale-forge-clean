
import React, { useState, useEffect } from 'react';
import EnhancedStoryHistorySidebar from '@/components/story-display/EnhancedStoryHistorySidebar';
import { generateChoices } from '@/lib/story-choice-generator';
import { StorySegment } from '@/hooks/useStoryDisplay/types';
import { Button } from '@/components/ui/button';

interface StoryCreateModeProps {
  currentStorySegment: StorySegment | null;
  allStorySegments: StorySegment[];
  segmentCount: number;
  showHistory: boolean;
  isGenerating: boolean;
  prompt: string;
  currentChapterIndex: number;
  onChoiceSelect: (choice: string, skipImage?: boolean) => void;
  onFinishStory: () => void;
  onChapterChange: (index: number) => void;
  onAudioGenerated?: (audioUrl: string) => void;
  skipImage?: boolean;
  onSkipImageChange?: ((skipImage: boolean) => void) | undefined;
}

const StoryCreateMode: React.FC<StoryCreateModeProps> = ({
  currentStorySegment,
  allStorySegments,
  segmentCount,
  showHistory,
  isGenerating,
  prompt,
  currentChapterIndex,
  onChoiceSelect,
  onFinishStory,
  onChapterChange,
  skipImage = false,
  onSkipImageChange
}) => {
  const storyTitle = prompt.substring(0, 50) + '...';
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [diagnostics, setDiagnostics] = useState<any>(null);

  // Generate diagnostics when current story segment changes
  useEffect(() => {
    if (currentStorySegment?.segment_text) {
      const { diagnostics } = generateChoices(currentStorySegment.segment_text, true);
      setDiagnostics(diagnostics);
    }
  }, [currentStorySegment]);

const handleSidebarChapterClick = (chapterIndex: number) => {
  console.log('Sidebar clicked chapter:', chapterIndex);
  console.log('Calling onChapterChange with index:', chapterIndex);
  onChapterChange(chapterIndex);
};

const renderDiagnostics = () => {
  if (!diagnostics) return null;
  
  return (
    <div className="glass-card-enhanced diagnostics-panel p-6 mt-6">
      <h2 className="text-heading text-center mb-4">Contextual Alignment Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Narrative Position */}
        <div className="border rounded-lg p-4">
          <h3 className="text-subheading mb-2">Narrative Position</h3>
          <ul className="space-y-1">
            <li><strong>Current Actions:</strong> {diagnostics.narrativePosition?.currentActions?.join(', ') || 'None'}</li>
            <li><strong>Completed Actions:</strong> {diagnostics.narrativePosition?.completedActions?.join(', ') || 'None'}</li>
            <li><strong>Environmental Focus:</strong> {diagnostics.narrativePosition?.environmentalFocus || 'None'}</li>
            <li><strong>Tension Points:</strong> {diagnostics.narrativePosition?.tensionPoints?.join(', ') || 'None'}</li>
          </ul>
        </div>
        
        {/* Character Perspective */}
        <div className="border rounded-lg p-4">
          <h3 className="text-subheading mb-2">Character Perspective</h3>
          <ul className="space-y-1">
            <li><strong>Emotion:</strong> {diagnostics.characterPerspective?.emotion || 'Neutral'}</li>
            <li><strong>Traits:</strong> {diagnostics.characterPerspective?.traits?.join(', ') || 'None'}</li>
            <li><strong>Goals:</strong> {diagnostics.characterPerspective?.goals?.join(', ') || 'None'}</li>
          </ul>
        </div>
        
        {/* Choice Scoring */}
        <div className="border rounded-lg p-4 md:col-span-2">
          <h3 className="text-subheading mb-2">Choice Scoring</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Choice</th>
                  <th className="text-right p-2">Score</th>
                  <th className="text-right p-2">Temporal</th>
                </tr>
              </thead>
              <tbody>
                {diagnostics.candidateChoices?.map((candidate: any, index: number) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">{candidate.choice}</td>
                    <td className="text-right p-2">{candidate.score}</td>
                    <td className="text-right p-2">
                      {candidate.isTemporallyValid !== undefined ?
                        (candidate.isTemporallyValid ? '✅' : '❌') : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Timeline Alignment */}
        <div className="border rounded-lg p-4 md:col-span-2">
          <h3 className="text-subheading mb-2">Timeline Alignment</h3>
          <div className="space-y-2">
            {diagnostics.timeline?.map((event: string, index: number) => (
              <div key={index} className="flex items-start">
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center mr-2 flex-shrink-0">
                  {index + 1}
                </div>
                <div className="text-body">{event}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

return (
  <div className="space-y-6">
    {/* Two-Column Layout for Story Progress */}
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* LEFT COLUMN: MAIN STORY CANVAS */}
      <div
        key={currentStorySegment?.id}
        className="lg:col-span-8 space-y-8 animate-fade-in"
      >


          {/* --- STORY SEGMENT PANEL --- */}
          <div className="glass-enhanced backdrop-blur-lg bg-black/40 border border-white/20 rounded-2xl shadow-xl story-segment-panel p-6 md:p-8">
              <h1 className="text-title text-center mb-6 tracking-wider text-white" style={{textShadow: '0 2px 4px rgba(0,0,0,0.6)'}}>
                  CHAPTER {segmentCount}
              </h1>
              <p className="text-body-large mb-6 text-white" style={{textShadow: '0 1px 2px rgba(0,0,0,0.6)'}}>
                  {currentStorySegment?.segment_text}
              </p>
              <div className="image-container w-full aspect-video rounded-lg overflow-hidden flex items-center justify-center">
                  {currentStorySegment?.image_url && currentStorySegment.image_url !== '/placeholder.svg' ? (
                      <img src={currentStorySegment.image_url} alt={`Illustration for Chapter ${segmentCount}`} className="w-full h-full object-cover animate-fade-in" />
                  ) : (
                      <div className="image-placeholder w-full h-full flex items-center justify-center text-body">Generating Illustration...</div>
                  )}
              </div>
          </div>

          {/* --- CHOICES PANEL --- */}
          {currentStorySegment && currentStorySegment.choices && currentStorySegment.choices.length > 0 && (
              <div className="glass-enhanced backdrop-blur-lg bg-black/40 border border-white/20 rounded-2xl shadow-xl what-happens-next-panel p-6 md:p-8">
                  <h2 className="text-heading text-center tracking-wider mb-2 text-white" style={{textShadow: '0 2px 4px rgba(0,0,0,0.6)'}}>
                      WHAT HAPPENS NEXT?
                  </h2>
                  <p className="text-body text-center mb-6 text-white/90" style={{textShadow: '0 1px 2px rgba(0,0,0,0.6)'}}>Choose your path and continue the adventure!</p>
                  <div className="grid gap-3 md:gap-4 grid-cols-1">
                      {currentStorySegment.choices.map((choice, index) => (
                          <Button
                              key={index}
                              onClick={() => onChoiceSelect(choice)}
                              disabled={isGenerating}
                              variant="secondary"
                              className="w-full text-left p-4 h-auto justify-start whitespace-normal break-words"
                              aria-label={`Choice ${index + 1}: ${choice}`}
                          >
                              <span className="font-medium text-white leading-relaxed">
                                <span className="mr-2 text-amber-400 flex-shrink-0">{index + 1}.</span>
                                <span className="break-words">{choice}</span>
                              </span>
                          </Button>
                      ))}
                  </div>
                  <div className="flex items-center justify-center mt-8">
                      <input
                          type="checkbox"
                          id="skip-image-gen"
                          checked={skipImage}
                          onChange={(e) => onSkipImageChange?.(e.target.checked)}
                          className="h-4 w-4 rounded"
                      />
                      <label htmlFor="skip-image-gen" className="ml-3 text-body">Skip image generation for next segment</label>
                  </div>
              </div>
          )}

          {/* --- PRIMARY ACTION (END STORY) PANEL --- */}
          {currentStorySegment && currentStorySegment.choices && currentStorySegment.choices.length > 0 && (
              <div className="glass-enhanced backdrop-blur-lg bg-black/40 border border-white/20 rounded-2xl shadow-xl end-story-panel p-6 md:p-8 text-center">
                  <h2 className="text-title tracking-wider text-white" style={{textShadow: '0 2px 4px rgba(0,0,0,0.6)'}}>FINISH THE TALE</h2>
                  <p className="text-body mt-2 mb-6 text-white/90" style={{textShadow: '0 1px 2px rgba(0,0,0,0.6)'}}>Craft a final, concluding chapter for your story.</p>
                  <Button
                      onClick={onFinishStory}
                      disabled={isGenerating}
                      variant="orange-amber"
                      size="lg"
                      className="w-full font-bold"
                  >
                      End Story Here
                  </Button>
              </div>
          )}

          {/* Diagnostics Dashboard */}
          {showDiagnostics && renderDiagnostics()}
      </div>

      {/* RIGHT COLUMN: UNIFIED STORY LOG SIDEBAR */}
      <div className="lg:col-span-4">
        {showHistory && allStorySegments.length > 0 ? (
          <EnhancedStoryHistorySidebar
            storySegments={allStorySegments}
            currentSegmentId={currentStorySegment?.id || ''}
            storyTitle={storyTitle}
            onSegmentClick={handleSidebarChapterClick}
            currentChapterIndex={currentChapterIndex}
          />
        ) : (
          <div className="glass-card-enhanced story-log-sidebar p-6 lg:sticky lg:top-24">
            <h2 className="text-heading mb-4">Story Log</h2>
            <p className="text-body">Enable history to view your story progress and chapters.</p>
          </div>
        )}
      </div>
    </div>
  </div>
);
};

export default StoryCreateMode;
