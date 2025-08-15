import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, Lock, UserPlus, LogIn } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface AuthRequiredModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature?: string;
  onSignInClick?: () => void;
  onSignUpClick?: () => void;
}

export const AuthRequiredModal: React.FC<AuthRequiredModalProps> = ({
  open,
  onOpenChange,
  feature = 'AI-powered features',
  onSignInClick,
  onSignUpClick,
}) => {
  const navigate = useNavigate();

  const handleSignIn = () => {
    if (onSignInClick) {
      onSignInClick();
    } else {
      navigate('/auth/signup');
    }
    onOpenChange(false);
  };

  const handleSignUp = () => {
    if (onSignUpClick) {
      onSignUpClick();
    } else {
      navigate('/auth/signup');
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-slate-900 to-slate-800 border-amber-500/30">
        <DialogHeader className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center">
            <Lock className="h-8 w-8 text-amber-400" />
          </div>
          <DialogTitle className="text-2xl font-bold text-amber-300 font-serif">
            Account Required
          </DialogTitle>
          <DialogDescription className="text-gray-300 text-base leading-relaxed">
            Create a free account to unlock {feature} and start crafting magical stories with AI assistance.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Card className="p-4 bg-amber-900/20 border-amber-500/30">
            <h4 className="text-amber-300 font-semibold mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Free Account Benefits
            </h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• 20 chapters per month</li>
              <li>• 20 AI images per month</li>
              <li>• 10 minutes TTS per month</li>
              <li>• Save and continue your stories</li>
              <li>• Share your creations with others</li>
            </ul>
          </Card>

          <div className="text-xs text-gray-400 text-center">
            <p>Want more? Upgrade to <span className="text-amber-300 font-semibold">Core ($7.99/mo)</span> for 100 chapters & images + 60 min TTS</p>
            <p>or <span className="text-amber-300 font-semibold">Pro ($17.99/mo)</span> for unlimited chapters + 300 images + 140 min TTS</p>
          </div>

          <div className="text-center text-sm text-gray-400">
            <p>Join thousands of storytellers already using Tale Forge!</p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-3">
          <Button
            onClick={handleSignUp}
            className="w-full sm:w-auto bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-semibold"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Create Free Account
          </Button>
          <Button
            onClick={handleSignIn}
            variant="outline"
            className="w-full sm:w-auto border-amber-500/50 text-amber-300 hover:bg-amber-500/10"
          >
            <LogIn className="mr-2 h-4 w-4" />
            Sign In
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};