import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, Share2 } from 'lucide-react';

interface PublishStorySectionProps {
  isPublic: boolean;
  isPublishing: boolean;
  onPublishStory: () => void;
}

const PublishStorySection: React.FC<PublishStorySectionProps> = ({
  isPublic,
  isPublishing,
  onPublishStory
}) => {
  return (
    <Card className="bg-gradient-to-r from-amber-900/30 to-amber-800/30 border-amber-500/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-amber-200 flex items-center gap-2">
          {isPublic ? (
            <CheckCircle className="h-5 w-5 text-green-400" />
          ) : (
            <span className="h-5 w-5 bg-amber-500 rounded-full flex items-center justify-center text-xs text-white">3</span>
          )}
          Share Your Story
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        {isPublic ? (
          <div className="space-y-4">
            <p className="text-green-400 mb-4">🎉 Your story is now public!</p>
            <p className="text-amber-300 text-sm">
              Anyone can discover and read your story in the Discover section
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-amber-300 mb-6">
              Share your masterpiece with the world! Publishing makes your story discoverable in our Discover section.
            </p>
            <Button 
              onClick={onPublishStory}
              disabled={isPublishing}
              size="lg"
              className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-8 py-4 text-lg"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Share2 className="mr-2 h-6 w-6" />
                  📚 Publish to Discover
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PublishStorySection;