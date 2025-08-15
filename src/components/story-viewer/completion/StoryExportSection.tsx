import React from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download, Share2, Crown, Lock } from 'lucide-react';
import { PDFExportGate, AudioExportGate } from '@/components/pricing/FeatureGate';
import { toast } from 'sonner';
import { StoryExporter } from '@/utils/storyExporter';

interface StoryExportSectionProps {
  story: {
    id: string;
    title?: string;
    content?: string;
    audio_url?: string;
    is_completed?: boolean;
  };
}

export const StoryExportSection: React.FC<StoryExportSectionProps> = ({ story }) => {
  const { hasFeature, isPremium, isPro, effectiveTier } = useSubscription();

  const handlePDFExport = async () => {
    if (!hasFeature('pdf_export')) {
      toast.error('PDF export requires Premium subscription');
      return;
    }

    try {
      toast.info('Generating PDF... This may take a moment.');
      await StoryExporter.exportAsPDF(story.id, story.title || 'Untitled Story');
      toast.success('PDF-ready file created! Open in browser and print to PDF.');
    } catch (error) {
      console.error('Failed to export PDF:', error);
      toast.error('Failed to export PDF');
    }
  };

  const handleAudioExport = async () => {
    if (!hasFeature('audio_export')) {
      toast.error('Audio export requires Premium subscription');
      return;
    }
    
    if (!story.audio_url) {
      toast.error('No audio available for this story. Generate audio first.');
      return;
    }
    
    try {
      // Create download link for audio
      const link = document.createElement('a');
      link.href = story.audio_url;
      link.download = `${story.title || 'story'}-audio.mp3`;
      link.click();
      toast.success('Audio download started');
    } catch (error) {
      console.error('Failed to export audio:', error);
      toast.error('Failed to export audio');
    }
  };

  const handleTextExport = () => {
    if (!story.content) {
      toast.error('No content available for this story');
      return;
    }
    
    try {
      // Export as plain text
      const blob = new Blob([story.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${story.title || 'story'}.txt`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Text file downloaded');
    } catch (error) {
      console.error('Failed to export text:', error);
      toast.error('Failed to export text');
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: story.title || 'My Story from TaleForge',
      text: story.content?.substring(0, 200) + '...' || 'Check out my story created with TaleForge AI!',
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback to copying link
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Story link copied to clipboard!');
      }
    } catch (error) {
      console.error('Failed to share:', error);
      toast.error('Failed to share story');
    }
  };

  if (!story.is_completed) {
    return (
      <Card className="opacity-60">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <FileText className="w-5 h-5 mr-2" />
            Export Options
          </CardTitle>
          <CardDescription>
            Complete your story to unlock export options
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {/* Free Export Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <FileText className="w-5 h-5 mr-2" />
            Export Options
          </CardTitle>
          <CardDescription>
            Download and share your completed story
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Free Text Export */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium">Plain Text</p>
                <p className="text-sm text-gray-500">Download as .txt file</p>
              </div>
              <Badge variant="secondary" className="ml-2">Free</Badge>
            </div>
            <Button onClick={handleTextExport} size="sm">
              <Download className="w-4 h-4 mr-1" />
              Download
            </Button>
          </div>

          {/* Share Option */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-3">
              <Share2 className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium">Share Story</p>
                <p className="text-sm text-gray-500">Share with friends and family</p>
              </div>
              <Badge variant="secondary" className="ml-2">Free</Badge>
            </div>
            <Button onClick={handleShare} size="sm" variant="outline">
              <Share2 className="w-4 h-4 mr-1" />
              Share
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Premium Export Options */}
      <PDFExportGate showUpgrade={!isPremium && !isPro}>
        <Card className={!hasFeature('pdf_export') ? 'opacity-60' : ''}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-red-600" />
                <div>
                  <p className="font-medium">PDF Export</p>
                  <p className="text-sm text-gray-500">Beautifully formatted PDF with images</p>
                </div>
                <Badge className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-0">
                  <Crown className="w-3 h-3 mr-1" />
                  Premium
                </Badge>
              </div>
              <Button 
                onClick={handlePDFExport} 
                size="sm"
                disabled={!hasFeature('pdf_export')}
                className={hasFeature('pdf_export') ? '' : 'opacity-50 cursor-not-allowed'}
              >
                {hasFeature('pdf_export') ? (
                  <>
                    <Download className="w-4 h-4 mr-1" />
                    Download PDF
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-1" />
                    Premium Required
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </PDFExportGate>

      {/* Audio Export */}
      <AudioExportGate showUpgrade={!isPremium && !isPro}>
        <Card className={!hasFeature('audio_export') ? 'opacity-60' : ''}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Download className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium">Audio Export</p>
                  <p className="text-sm text-gray-500">Download complete story narration</p>
                </div>
                <Badge className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-0">
                  <Crown className="w-3 h-3 mr-1" />
                  Premium
                </Badge>
              </div>
              <Button 
                onClick={handleAudioExport} 
                size="sm"
                disabled={!hasFeature('audio_export') || !story.audio_url}
                className={hasFeature('audio_export') && story.audio_url ? '' : 'opacity-50 cursor-not-allowed'}
              >
                {hasFeature('audio_export') ? (
                  story.audio_url ? (
                    <>
                      <Download className="w-4 h-4 mr-1" />
                      Download Audio
                    </>
                  ) : (
                    'No Audio Available'
                  )
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-1" />
                    Premium Required
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </AudioExportGate>

      {/* Tier Summary */}
      <div className="text-center text-sm text-gray-500 pt-2 border-t">
        <p>
          Current Plan: <span className="font-medium">{effectiveTier}</span>
          {effectiveTier === 'Free' && (
            <span className="ml-2">
              • <Button variant="link" className="p-0 h-auto" onClick={() => window.location.href = '/pricing'}>
                Upgrade for premium exports
              </Button>
            </span>
          )}
        </p>
      </div>
    </div>
  );
};