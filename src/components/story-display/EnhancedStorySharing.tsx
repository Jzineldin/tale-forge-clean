import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Share2, 
  Copy, 
  Mail, 
  Facebook, 
  Twitter, 
  MessageCircle,
  Link,
  Check,
  Download,
  QrCode
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface EnhancedStorySharingProps {
  storyId: string;
  storyTitle: string;
  storyDescription?: string;
  storyImage?: string;
  isPublic?: boolean;
  onShare?: () => void;
  inDialog?: boolean; // New prop to control styling when used in a dialog
}

const EnhancedStorySharing: React.FC<EnhancedStorySharingProps> = ({
  storyId,
  storyTitle,
  storyDescription = "Check out this amazing story created with Tale Forge!",
  isPublic = false,
  onShare,
  inDialog = false
}) => {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [customMessage, setCustomMessage] = useState(storyDescription);

  const shareUrl = `${window.location.origin}/story/${storyId}`;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedMessage = encodeURIComponent(customMessage);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Story link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  }, [shareUrl]);

  const handleEmailShare = useCallback(() => {
    const subject = `Check out this story: ${storyTitle}`;
    const body = `${customMessage}\n\nRead the full story here: ${shareUrl}\n\nCreated with Tale Forge - AI-powered storytelling for families`;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl);
  }, [storyTitle, customMessage, shareUrl]);

  const handleSocialShare = useCallback((platform: string) => {
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedMessage}&url=${encodedUrl}&hashtags=TaleForge,AIStorytelling`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedMessage}%20${encodedUrl}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedMessage}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
    toast.success(`Sharing to ${platform}!`);
  }, [encodedUrl, encodedMessage]);

  const handleNativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: storyTitle,
          text: customMessage,
          url: shareUrl,
        });
        toast.success('Story shared successfully!');
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          toast.error('Failed to share story');
        }
      }
    } else {
      // Fallback to copy link
      handleCopyLink();
    }
  }, [storyTitle, customMessage, shareUrl, handleCopyLink]);

  const generateQRCode = useCallback(() => {
    // Simple QR code generation using a service
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`;
    setShowQR(true);
    
    // Create a temporary link to download QR code
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `taleforge-story-${storyId}.png`;
    link.click();
  }, [shareUrl, storyId]);

  if (!isPublic) {
    const content = (
      <>
        <div className="text-center mb-6">
          <div className="text-4xl mb-4">🔒</div>
          <h3 className="text-xl font-bold text-amber-200 mb-2">Story is Private</h3>
          <p className="text-amber-300 text-sm">
            Make your story public to share it with friends and family!
          </p>
        </div>
        <Button
          onClick={onShare}
          className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold"
        >
          <Share2 className="mr-2 h-4 w-4" />
          Publish to Discover
        </Button>
      </>
    );

    if (inDialog) {
      return <div className="space-y-4">{content}</div>;
    }

    return (
      <Card className="bg-gradient-to-r from-amber-900/30 to-amber-800/30 border-amber-500/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-amber-200 flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Your Story
          </CardTitle>
        </CardHeader>
        <CardContent>{content}</CardContent>
      </Card>
    );
  }

  const publicContent = (
    <>
      <div className="text-center mb-6">
        <div className="text-4xl mb-4">🌟</div>
        <h3 className="text-xl font-bold text-emerald-200 mb-2">Share Your Story</h3>
        <p className="text-emerald-300 text-sm">
          Your story is public! Share it with friends and family using the options below.
        </p>
      </div>

        {/* Custom Message Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-emerald-200">
            Custom Message (Optional)
          </label>
          <Input
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder="Add a personal message..."
            className="bg-black/30 border-emerald-500/30 text-white placeholder-gray-400"
            maxLength={200}
          />
          <p className="text-xs text-emerald-400">
            {customMessage.length}/200 characters
          </p>
        </div>

        {/* Quick Share Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Button
            onClick={handleNativeShare}
            variant="outline"
            size="sm"
            className="border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/20"
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          
          <Button
            onClick={handleCopyLink}
            variant="outline"
            size="sm"
            className="border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/20"
          >
            {copied ? (
              <Check className="mr-2 h-4 w-4" />
            ) : (
              <Copy className="mr-2 h-4 w-4" />
            )}
            {copied ? 'Copied!' : 'Copy Link'}
          </Button>

          <Button
            onClick={handleEmailShare}
            variant="outline"
            size="sm"
            className="border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/20"
          >
            <Mail className="mr-2 h-4 w-4" />
            Email
          </Button>

          <Button
            onClick={generateQRCode}
            variant="outline"
            size="sm"
            className="border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/20"
          >
            <QrCode className="mr-2 h-4 w-4" />
            QR Code
          </Button>
        </div>

        {/* Social Media Sharing */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-emerald-200">Share on Social Media</h4>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <Button
              onClick={() => handleSocialShare('facebook')}
              variant="outline"
              size="sm"
              className="border-blue-500/40 text-blue-400 hover:bg-blue-500/20"
            >
              <Facebook className="h-4 w-4" />
            </Button>
            
            <Button
              onClick={() => handleSocialShare('twitter')}
              variant="outline"
              size="sm"
              className="border-sky-500/40 text-sky-400 hover:bg-sky-500/20"
            >
              <Twitter className="h-4 w-4" />
            </Button>
            
            <Button
              onClick={() => handleSocialShare('whatsapp')}
              variant="outline"
              size="sm"
              className="border-green-500/40 text-green-400 hover:bg-green-500/20"
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
            
            <Button
              onClick={() => handleSocialShare('telegram')}
              variant="outline"
              size="sm"
              className="border-blue-500/40 text-blue-400 hover:bg-blue-500/20"
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
            
            <Button
              onClick={() => handleSocialShare('linkedin')}
              variant="outline"
              size="sm"
              className="border-blue-600/40 text-blue-500 hover:bg-blue-600/20"
            >
              <Link className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Advanced Sharing Options */}
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/20"
            >
              <Download className="mr-2 h-4 w-4" />
              More Sharing Options
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-emerald-500/30">
            <DialogHeader>
              <DialogTitle className="text-emerald-200">Advanced Sharing Options</DialogTitle>
              <DialogDescription className="text-emerald-300">
                Additional ways to share your story
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-emerald-200">Direct Link</label>
                <div className="flex gap-2">
                  <Input
                    value={shareUrl}
                    readOnly
                    className="bg-black/30 border-emerald-500/30 text-white"
                  />
                  <Button
                    onClick={handleCopyLink}
                    size="sm"
                    variant="outline"
                    className="border-emerald-500/40 text-emerald-400"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  onClick={() => handleSocialShare('reddit')}
                  variant="outline"
                  className="border-brand-indigo/40 text-brand-indigo hover:bg-brand-indigo/20"
                >
                  Share on Reddit
                </Button>
                
                <Button
                  onClick={() => handleSocialShare('pinterest')}
                  variant="outline"
                  className="border-red-500/40 text-red-400 hover:bg-red-500/20"
                >
                  Pin on Pinterest
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* QR Code Display */}
        {showQR && (
          <div className="mt-4 p-4 bg-black/20 rounded-lg border border-emerald-500/30">
            <p className="text-sm text-emerald-300 mb-2">
              QR Code downloaded! Scan it to open your story on mobile devices.
            </p>
            <Button
              onClick={() => setShowQR(false)}
              variant="outline"
              size="sm"
              className="border-emerald-500/40 text-emerald-400"
            >
              Close
            </Button>
          </div>
        )}

        <div className="text-center mt-4">
          <p className="text-emerald-400 text-sm">
            ✨ Your story is public and can be discovered by other TaleForge users!
          </p>
        </div>
    </>
  );

  if (inDialog) {
    return <div className="space-y-4">{publicContent}</div>;
  }

  return (
    <Card className="bg-gradient-to-r from-emerald-900/30 to-cyan-900/30 border-emerald-500/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-emerald-200 flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Share Your Story
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">{publicContent}</CardContent>
    </Card>
  );
};

export default EnhancedStorySharing; 