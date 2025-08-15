import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthProvider';
import { useGenerateFullStoryAudio } from '@/hooks/useGenerateFullStoryAudio';
import { useNarratedMinutes } from '@/hooks/useNarratedMinutes';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Play, RefreshCw, User, Mic, Crown, Clock, Lock } from 'lucide-react';

import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ESSENTIAL_VOICES as STORYTELLER_VOICES, playVoiceTest } from '@/lib/voices-optimized';
interface Voice {
  voice_id: string;
  name: string;
  category: string;
  description?: string;
  preview_url?: string;
  labels?: Record<string, string>;
}

interface VoiceSelectorSectionProps {
  storyId: string;
  fullStoryAudioUrl?: string | undefined;
  audioGenerationStatus?: string | undefined;
  onAudioGenerated?: (audioUrl: string) => void;
}

const VoiceSelectorSection: React.FC<VoiceSelectorSectionProps> = ({
  storyId,
  fullStoryAudioUrl,
  audioGenerationStatus,
  onAudioGenerated
}) => {
  const { user: _user } = useAuth();
  const queryClient = useQueryClient();

  const { minutesUsed, minutesLimit, isAtLimit, loading: minutesLoading } = useNarratedMinutes();
  const [selectedVoice, setSelectedVoice] = useState('');
  const [availableVoices, setAvailableVoices] = useState<Voice[]>([]);
  const [loadingVoices, setLoadingVoices] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [testingVoice, setTestingVoice] = useState<string | null>(null);
  const [showVoiceGrid, setShowVoiceGrid] = useState(false);
  const voiceDropdownRef = useRef<HTMLDivElement>(null);

  const generateAudioMutation = useGenerateFullStoryAudio();
  const isGenerating = generateAudioMutation.isPending || audioGenerationStatus === 'in_progress';
  const hasAudio = audioGenerationStatus === 'completed' && fullStoryAudioUrl;

  // Minute-based access (limits-first). Unlimited when minutesLimit === -1
  const minutesRemaining = minutesLimit === -1
    ? Number.POSITIVE_INFINITY
    : Math.max(0, (minutesLimit ?? 0) - (minutesUsed ?? 0));
  const canNarrate = !!selectedVoice && !isGenerating && !(minutesLimit !== -1 && isAtLimit);

  // Use static voice list instead of fetching from API
  const fetchVoices = async () => {
    setLoadingVoices(true);
    setVoiceError(null);

    try {
      console.log('🎵 Loading static voice list...');

      // Use the static voice list
      const staticVoices = STORYTELLER_VOICES.map(voice => ({
        voice_id: voice.id,
        name: voice.name,
        category: 'premade',
        description: voice.description,
        labels: {
          gender: voice.gender,
          accent: voice.accent || 'neutral'
        }
      }));

      console.log(`✅ Successfully loaded ${staticVoices.length} voices`);
      setAvailableVoices(staticVoices);

      // Set first voice as default if none selected
      if (!selectedVoice && staticVoices.length > 0) {
        setSelectedVoice(staticVoices[0].voice_id);
      }

      toast.success(`Loaded ${staticVoices.length} voices`);
    } catch (error: any) {
      console.error('❌ Error loading voices:', error);
      setVoiceError(`Failed to load voices: ${error.message}`);
      toast.error('Failed to load voices');
    } finally {
      setLoadingVoices(false);
    }
  };

  // Test a specific voice using pre-generated audio
  const testVoice = async (voiceId: string, voiceName: string) => {
    console.log('🎵 Testing voice:', voiceId, voiceName);
    setTestingVoice(voiceId);

    try {
      // Find the voice in our static list
      const voice = STORYTELLER_VOICES.find(v => v.id === voiceId);
      if (!voice) {
        throw new Error('Voice not found');
      }

      // Play the pre-generated test audio
      await playVoiceTest(voice.id);

      console.log('🎵 Voice test successful for', voiceName);
      toast.success(`Voice test successful for ${voiceName}`);

    } catch (error: any) {
      console.error('🎵 Error testing voice:', error);

      // Provide helpful guidance when test audio isn't available
      if (error.message.includes('Test audio not yet generated')) {
        toast.info(`To hear ${voiceName}, use the "Generate Voice Narration" button below. This will create audio for your entire story.`);
      } else {
        toast.error(`Failed to test ${voiceName}: ${error.message}`);
      }
    } finally {
      setTestingVoice(null);
    }
  };

  // Fetch voices on component mount
  useEffect(() => {
    fetchVoices();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (voiceDropdownRef.current && !voiceDropdownRef.current.contains(event.target as Node)) {
        setShowVoiceGrid(false);
      }
    };

    if (showVoiceGrid) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showVoiceGrid]);

  // Listen for real-time story updates to refresh audio status
  useEffect(() => {
    if (!storyId) return;

    const channel = supabase
      .channel(`story-audio-${storyId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'stories',
          filter: `id=eq.${storyId}`
        },
        (payload) => {
          console.log('🔄 Real-time story update:', payload);

          // If audio generation completed, notify parent and refresh usage
          if (payload.new.audio_generation_status === 'completed' && payload.new.full_story_audio_url) {
            console.log('✅ Audio generation completed, updating UI');

            if (onAudioGenerated) {
              onAudioGenerated(payload.new.full_story_audio_url);
            }

            // Refresh usage data to show updated minutes
            queryClient.invalidateQueries({ queryKey: ['narrated-minutes'] });
            queryClient.invalidateQueries({ queryKey: ['usage'] });

            toast.success('Voice narration completed!', {
              description: 'Your story audio is now ready to play.'
            });
          } else if (payload.new.audio_generation_status === 'failed') {
            console.log('❌ Audio generation failed');
            toast.error('Voice generation failed', {
              description: 'Please try again or contact support if the issue persists.'
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [storyId, onAudioGenerated]);

  const handleGenerateAudio = async () => {
    console.log('🎵 Voice generation button clicked:', { storyId, selectedVoice });

    if (!selectedVoice) {
      toast.error('Please select a voice first');
      return;
    }

    if (!storyId) {
      toast.error('No story ID available');
      return;
    }

    // Check TTS limits for free users
    if (isAtLimit && minutesLimit !== -1) {
      console.log('🚫 TTS limit reached:', { minutesUsed, minutesLimit });
      toast.error(
        `TTS limit reached (${minutesUsed}/${minutesLimit} minutes)`,
        {
          description: 'You have used all your voice narration minutes for this month. Upgrade for unlimited access!',
          action: {
            label: 'Upgrade',
            onClick: () => window.location.href = '/pricing'
          }
        }
      );
      return;
    }

    try {
      console.log('🎵 Starting audio generation mutation...');
      const result = await generateAudioMutation.mutateAsync({
        storyId,
        voiceId: selectedVoice
      });

      console.log('✅ Audio generation result:', result);

      if (result?.audioUrl && onAudioGenerated) {
        onAudioGenerated(result.audioUrl);
        toast.success('Audio generation completed!');
      } else {
        console.warn('⚠️ No audio URL in result:', result);
      }
    } catch (error) {
      console.error('🚨 Audio generation failed:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        storyId,
        selectedVoice
      });

      // Check if it's a TTS limit error
      if (error instanceof Error && error.message.includes('TTS limit exceeded')) {
        toast.error('TTS limit exceeded', {
          description: error.message,
          action: {
            label: 'Upgrade',
            onClick: () => window.location.href = '/pricing'
          }
        });
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        toast.error('Failed to generate audio', {
          description: `${errorMessage}. Please try again or contact support if the issue persists.`
        });
      }
    }
  };

  const selectedVoiceData = availableVoices.find(v => v.voice_id === selectedVoice);

  // Get voice category icon
  const getVoiceIcon = (category: string) => {
    switch (category) {
      case 'premade':
        return <Mic className="h-4 w-4" />;
      case 'professional':
        return <Crown className="h-4 w-4" />;
      case 'cloned':
      case 'generated':
        return <User className="h-4 w-4" />;
      default:
        return <Mic className="h-4 w-4" />;
    }
  };

  // Get voice category color
  const getVoiceCategoryColor = (category: string) => {
    switch (category) {
      case 'premade':
        return 'text-green-400 bg-green-900/30 border-green-500/30';
      case 'professional':
        return 'text-purple-400 bg-purple-900/30 border-purple-500/30';
      case 'cloned':
        return 'text-blue-400 bg-blue-900/30 border-blue-500/30';
      case 'generated':
        return 'text-brand-indigo bg-indigo-900/30 border-brand-indigo/30';
      default:
        return 'text-slate-400 bg-slate-700/30 border-slate-500/30';
    }
  };

  return (
    <div className="glass-enhanced backdrop-blur-lg bg-black/20 rounded-lg shadow-lg border border-amber-500/20 p-4 mb-4">
      <div className="mb-4">
        <h2 className="text-xl font-semibold flex items-center text-amber-200 mb-2">
          <span className="mr-2">🎵</span>
          Story Narration
        </h2>

        {/* Refresh voices button - moved below title */}
        <div className="flex justify-end">
          <button
            onClick={fetchVoices}
            disabled={loadingVoices}
            className="flex items-center gap-2 text-xs px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors disabled:opacity-50"
          >
            {loadingVoices ? (
              <LoadingSpinner size="sm" className="h-3 w-3" />
            ) : (
              <RefreshCw className="h-3 w-3" />
            )}
            {loadingVoices ? 'Loading...' : 'Refresh Voices'}
          </button>
        </div>
      </div>

      {hasAudio ? (
        // Show audio player if audio exists
        <div className="space-y-4">
          <div className="bg-green-900/50 border border-green-500/30 rounded-lg p-4">
            <p className="text-green-300 font-medium mb-3 flex items-center">
              <span className="mr-2">✅</span>
              Your story audio is ready!
            </p>
            <audio controls className="w-full">
              <source src={fullStoryAudioUrl} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </div>

          <button
            onClick={() => {
              // Reset audio state to allow regeneration
              if (onAudioGenerated) {
                onAudioGenerated('');
              }
            }}
            className="text-sm text-amber-400 hover:text-amber-300"
          >
            Generate with different voice
          </button>
        </div>
      ) : (
        // Show voice selector and generate button
        <div className="space-y-4">
          <p className="text-slate-300">
            Choose a voice to narrate your story with professional AI voice generation
          </p>

          {/* Enhanced Voice Selector */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-amber-200">
                Select your storyteller:
              </label>
              {availableVoices.length > 0 && (
                <span className="text-xs text-slate-400">
                  {availableVoices.length} voices available
                </span>
              )}
            </div>

            {loadingVoices ? (
              <div className="w-full px-4 py-8 border border-slate-600 rounded-lg bg-slate-700 text-slate-300 text-center">
                <LoadingSpinner size="sm" className=" w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full mx-auto mb-3" />
                Loading voices from ElevenLabs...
              </div>
            ) : voiceError ? (
              <div className="w-full px-4 py-4 border border-red-500/30 rounded-lg bg-red-900/20 text-red-300">
                <div className="flex items-center justify-between">
                  <span>Error loading voices</span>
                  <button
                    onClick={fetchVoices}
                    className="text-xs px-2 py-1 bg-red-700 hover:bg-red-600 rounded"
                  >
                    Retry
                  </button>
                </div>
                <p className="text-xs mt-1">{voiceError}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Selected Voice Display */}
                {selectedVoiceData && (
                  <div className="border-2 border-amber-500/50 rounded-lg p-4 bg-amber-900/20">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`p-1 rounded ${getVoiceCategoryColor(selectedVoiceData.category)}`}>
                            {getVoiceIcon(selectedVoiceData.category)}
                          </div>
                          <h3 className="font-semibold text-amber-200">{selectedVoiceData.name}</h3>
                        </div>
                        <p className="text-sm text-slate-300 mb-2">
                          {selectedVoiceData.description || 'Professional voice'}
                        </p>
                        <div className="text-xs text-amber-400">
                          {selectedVoiceData.category} • {selectedVoiceData.labels?.accent || 'Standard accent'}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => testVoice(selectedVoiceData.voice_id, selectedVoiceData.name)}
                          disabled={testingVoice === selectedVoiceData.voice_id}
                          className="p-2 bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors disabled:opacity-50"
                          title={`Test ${selectedVoiceData.name} (Use Generate Voice Narration to hear this voice)`}
                        >
                          {testingVoice === selectedVoiceData.voice_id ? (
                            <LoadingSpinner size="sm" className="h-4 w-4  text-white" />
                          ) : (
                            <Play className="h-4 w-4 text-white" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Discrete Voice Selector */}
                <div className="relative" ref={voiceDropdownRef}>
                  <button
                    onClick={() => setShowVoiceGrid(!showVoiceGrid)}
                    className="w-full px-4 py-3 border border-slate-600 rounded-lg text-slate-200 bg-slate-700 hover:bg-slate-600 transition-colors flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <span>Change voice</span>
                      <span className="text-xs text-slate-400">
                        ({availableVoices.length} available)
                      </span>
                    </span>
                    <span className="text-slate-400">{showVoiceGrid ? '▲' : '▼'}</span>
                  </button>

                  {/* Dropdown Voice List */}
                  {showVoiceGrid && (
                    <div className="absolute top-full left-0 right-0 z-10 mt-1 max-h-64 overflow-y-auto border border-slate-600 rounded-lg bg-slate-800 shadow-xl">
                      {availableVoices.map((voice) => (
                        <div
                          key={voice.voice_id}
                          className={`p-3 cursor-pointer transition-colors border-b border-slate-700 last:border-b-0 ${
                            voice.voice_id === selectedVoice
                              ? 'bg-amber-900/30 text-amber-200'
                              : 'hover:bg-slate-700 text-slate-200'
                          }`}
                          onClick={() => {
                            setSelectedVoice(voice.voice_id);
                            setShowVoiceGrid(false);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`p-1 rounded ${getVoiceCategoryColor(voice.category)}`}>
                                {getVoiceIcon(voice.category)}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-sm">{voice.name}</h4>
                                <p className="text-xs text-slate-400 line-clamp-1">
                                  {voice.description || 'Professional voice'}
                                </p>
                              </div>
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                testVoice(voice.voice_id, voice.name);
                              }}
                              disabled={testingVoice === voice.voice_id}
                              className="p-1 bg-slate-600 hover:bg-slate-500 rounded transition-colors disabled:opacity-50"
                              title={`Test ${voice.name} (Use Generate Voice Narration to hear this voice)`}
                            >
                              {testingVoice === voice.voice_id ? (
                                <LoadingSpinner size="sm" className="h-3 w-3 text-amber-400" />
                              ) : (
                                <Play className="h-3 w-3 text-amber-400" />
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* TTS Usage Meter */}
          {!minutesLoading && (
            <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-400" />
                  <span className="text-sm font-medium text-white">Voice Minutes</span>
                </div>
                <span className="text-sm text-slate-300">
                  {minutesLimit === -1 ? 'Unlimited' : `${minutesUsed} / ${minutesLimit} minutes`}
                </span>
              </div>

              {minutesLimit !== -1 && (
              <div className="w-full bg-slate-700 rounded-full h-2 mb-2" title={`${minutesRemaining} minutes remaining`}>
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isAtLimit ? 'bg-red-500' :
                    minutesUsed / minutesLimit > 0.8 ? 'bg-yellow-500' :
                    'bg-amber-500'
                  }`}
                  style={{ width: `${Math.min((minutesUsed / minutesLimit) * 100, 100)}%` }}
                />
              </div>
              )}


              {isAtLimit && (
                <div className="flex items-center gap-2 text-red-400 text-sm">
                  <Lock className="h-3 w-3" />
                  <span>Monthly limit reached</span>
                </div>
              )}
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={handleGenerateAudio}
            disabled={!canNarrate || loadingVoices}
            className="w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-400 hover:to-amber-300 text-black rounded-lg disabled:bg-slate-600 disabled:text-white disabled:cursor-not-allowed transition-colors font-semibold text-lg"
          >
            {isGenerating ? (
              <span className="flex items-center justify-center">
                <LoadingSpinner size="sm" className=" w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                Generating Audio...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <span className="mr-2">🎤</span>
                Generate Voice Narration
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default VoiceSelectorSection;