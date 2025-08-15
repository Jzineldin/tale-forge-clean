
import React, { useState } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { useCompileFullVideo } from '@/hooks/useCompileFullVideo';
import { useStripeCheckout } from '@/hooks/useStripeCheckout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Video, Sparkles, Crown, Download, Share2, Clock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { getStripeConfig } from '@/config/stripe';
import { ensureStripeConfig } from '@/services/stripeConfigService';

interface VideoCompilationSectionProps {
  story: {
    id: string;
    title?: string;
    shotstack_status?: string;
    shotstack_video_url?: string;
    shotstack_render_id?: string;
  };
}

export const VideoCompilationSection: React.FC<VideoCompilationSectionProps> = ({ story }) => {
  const { isPremium, isAuthenticated } = useSubscription();
  const { mutate: compileVideo, isPending: isCompiling } = useCompileFullVideo();
  const { mutate: checkout, isPending: isCheckingOut } = useStripeCheckout();
  const [selectedProvider, setSelectedProvider] = useState<'replicate' | 'shotstack'>('replicate');

  const handleStartCompilation = () => {
    if (!isPremium) {
      toast.error('Premium subscription required for video compilation');
      return;
    }
    
    compileVideo({ storyId: story.id });
  };

  const handleUpgrade = async () => {
    try {
      await ensureStripeConfig();
      const config = getStripeConfig();
      
      checkout({
        priceId: config.priceIds.premium,
        tier: 'Premium'
      });
    } catch (error) {
      console.error('Failed to load pricing configuration:', error);
      toast.error('Unable to load pricing. Please try again.');
    }
  };

  const getStatusDisplay = () => {
    if (!story.shotstack_status || story.shotstack_status === 'not_started') {
      return { text: 'Ready to compile', color: 'bg-muted', progress: 0 };
    }
    
    switch (story.shotstack_status) {
      case 'queued':
        return { text: 'Queued for processing', color: 'bg-yellow-500', progress: 25 };
      case 'processing':
        return { text: 'Generating video...', color: 'bg-blue-500', progress: 50 };
      case 'rendering':
        return { text: 'Rendering final video', color: 'bg-purple-500', progress: 75 };
      case 'completed':
        return { text: 'Video ready!', color: 'bg-green-500', progress: 100 };
      case 'failed':
        return { text: 'Generation failed', color: 'bg-red-500', progress: 0 };
      default:
        return { text: 'Processing...', color: 'bg-blue-500', progress: 50 };
    }
  };

  const status = getStatusDisplay();
  const isCompleted = story.shotstack_status === 'completed';
  const isProcessing = ['queued', 'processing', 'rendering'].includes(story.shotstack_status || '');

  return (
    <Card className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-background to-primary/5">
      {/* Premium Badge */}
      <div className="absolute top-4 right-4">
        <Badge className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-0">
          <Crown className="w-3 h-3 mr-1" />
          Premium Feature
        </Badge>
      </div>

      <CardHeader className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600">
            <Video className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl">AI Video Compilation</CardTitle>
            <CardDescription>
              Transform your story into a cinematic video experience
            </CardDescription>
          </div>
        </div>

        {/* Status Display */}
        {(isProcessing || isCompleted) && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{status.text}</span>
              {isCompleted && <CheckCircle className="w-4 h-4 text-green-500" />}
              {isProcessing && <Clock className="w-4 h-4 text-blue-500 animate-pulse" />}
            </div>
            <Progress value={status.progress} className="h-2" />
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Feature Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center">
              <Sparkles className="w-4 h-4 mr-2 text-white" />
              AI-Powered Generation
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Automatic scene transitions</li>
              <li>• Synchronized audio narration</li>
              <li>• Dynamic visual effects</li>
              <li>• Professional editing</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-semibold">Export Options</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• HD 1080p quality</li>
              <li>• MP4 format</li>
              <li>• Social media ready</li>
              <li>• Direct download</li>
            </ul>
          </div>
        </div>

        {/* Provider Selection (Premium Users) */}
        {isPremium && !isCompleted && !isProcessing && (
          <div className="space-y-3">
            <h4 className="font-semibold">Generation Engine</h4>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={selectedProvider === 'replicate' ? 'default' : 'outline'}
                className="h-auto p-4 flex-col space-y-2"
                onClick={() => setSelectedProvider('replicate')}
              >
                <Sparkles className="w-5 h-5" />
                <div className="text-center">
                  <div className="font-medium">AI-Powered</div>
                  <div className="text-xs text-muted-foreground">Advanced AI generation</div>
                </div>
              </Button>
              <Button
                variant={selectedProvider === 'shotstack' ? 'default' : 'outline'}
                className="h-auto p-4 flex-col space-y-2"
                onClick={() => setSelectedProvider('shotstack')}
              >
                <Video className="w-5 h-5" />
                <div className="text-center">
                  <div className="font-medium">Traditional</div>
                  <div className="text-xs text-muted-foreground">Template-based editing</div>
                </div>
              </Button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {!isPremium && isAuthenticated && (
            <>
              <Button
                onClick={handleUpgrade}
                disabled={isCheckingOut}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Crown className="w-4 h-4 mr-2" />
                {isCheckingOut ? 'Opening Checkout...' : 'Upgrade to Premium'}
              </Button>
            </>
          )}

          {!isAuthenticated && (
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">
                Join the waitlist for premium access to video compilation
              </p>
              <Button variant="outline" onClick={() => window.location.href = '/#waitlist'}>
                Join Waitlist
              </Button>
            </div>
          )}

          {isPremium && !isCompleted && !isProcessing && (
            <Button
              onClick={handleStartCompilation}
              disabled={isCompiling}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Video className="w-4 h-4 mr-2" />
              {isCompiling ? 'Starting Compilation...' : 'Generate Video'}
            </Button>
          )}

          {isCompleted && story.shotstack_video_url && (
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button
                onClick={() => window.open(story.shotstack_video_url, '_blank')}
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Video
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: story.title || 'My Story Video',
                      url: story.shotstack_video_url || '',
                    });
                  } else {
                    navigator.clipboard.writeText(story.shotstack_video_url || '');
                    toast.success('Video link copied to clipboard');
                  }
                }}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          )}
        </div>

        {/* Video Player */}
        {isCompleted && story.shotstack_video_url && (
          <div className="mt-6">
            <video
              controls
              className="w-full rounded-lg shadow-lg"
              poster="/placeholder.svg"
            >
              <source src={story.shotstack_video_url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        )}

        {/* Processing Info */}
        {isProcessing && (
          <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <Clock className="w-4 h-4 inline mr-2" />
              Video compilation typically takes 3-5 minutes. You can leave this page and return later - 
              we'll notify you when it's ready!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
