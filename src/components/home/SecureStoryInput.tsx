
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { validateInput, sanitizeContent } from '@/utils/security';
import { Sparkles, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuthRequired } from '@/hooks/useAuthRequired';
import { AuthRequiredModal } from '@/components/auth/AuthRequiredModal';

interface SecureStoryInputProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  onStart: () => void;
  isLoading: boolean;
  storyMode: string;
}

const SecureStoryInput: React.FC<SecureStoryInputProps> = ({
  prompt,
  onPromptChange,
  onStart,
  isLoading,
  storyMode
}) => {
  const [inputError, setInputError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  
  const { checkAuthAndExecute, showAuthModal, setShowAuthModal } = useAuthRequired({
    feature: 'story creation'
  });

  const handlePromptChange = (value: string) => {
    setInputError(null);
    
    try {
      if (value.length > 1000) {
        setInputError('Story prompt cannot exceed 1000 characters');
        return;
      }
      
      if (value.match(/<script|javascript:|vbscript:|onload=|onerror=/i)) {
        setInputError('Invalid characters detected in your prompt');
        return;
      }
      
      const sanitizedValue = sanitizeContent.text(value);
      onPromptChange(sanitizedValue);
    } catch (error: any) {
      setInputError(error.message);
    }
  };

  const handleStart = async () => {
    setIsValidating(true);
    setInputError(null);
    
    try {
      validateInput.segmentText(prompt);
      checkAuthAndExecute(() => {
        onStart();
      });
    } catch (error: any) {
      setInputError(error.message);
    } finally {
      setIsValidating(false);
    }
  };

  const remainingChars = 1000 - prompt.length;
  const isNearLimit = remainingChars < 100;

  return (
    <>
    <Card className="redesign-card mx-auto max-w-4xl">
      <CardHeader className="text-center">
        <CardTitle className="font-heading text-2xl md:text-3xl flex items-center justify-center gap-3">
          <Sparkles className="h-8 w-8 text-brand-gold" />
          Begin Your {storyMode} Adventure
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {inputError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{inputError}</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-2">
          <label htmlFor="story-prompt" className="text-sm font-medium text-text-muted">
            Describe your story idea (be creative and specific!)
          </label>
          <Textarea
            id="story-prompt"
            placeholder="Example: A young detective discovers a mysterious letter in their grandmother's attic that leads to a century-old mystery involving missing artifacts from the local museum..."
            value={prompt}
            onChange={(e) => handlePromptChange(e.target.value)}
            className="min-h-[120px] resize-none focus:border-brand-gold focus:ring-brand-gold"
            disabled={isLoading || isValidating}
          />
          <div className="flex justify-between items-center text-xs">
            <span className="text-text-muted">
              Tip: Include characters, setting, and conflict for best results
            </span>
            <span className={`${isNearLimit ? 'text-brand-gold' : 'text-text-muted'}`}>
              {remainingChars} characters remaining
            </span>
          </div>
        </div>

        <Button
          onClick={handleStart}
          disabled={isLoading || isValidating || !prompt.trim() || !!inputError}
          variant="cta-primary"
          className="w-full"
        >
          {isLoading || isValidating ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              {isValidating ? 'Validating...' : 'Crafting Your Story...'}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Start Your Adventure
            </div>
          )}
        </Button>

        <div className="text-xs text-text-muted text-center mt-4">
          <p>Your story prompt will be validated for security before processing.</p>
        </div>
      </CardContent>
    </Card>
    
    {/* Authentication Required Modal */}
    <AuthRequiredModal
      open={showAuthModal}
      onOpenChange={setShowAuthModal}
      feature="story creation"
    />
    </>
  );
};

export default SecureStoryInput;
