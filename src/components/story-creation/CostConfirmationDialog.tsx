
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DollarSign, Sparkles, Image } from 'lucide-react';
import { CheckedState } from '@radix-ui/react-checkbox';

interface CostConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pendingAction: 'start' | 'choice' | 'finish' | 'audio' | null;
  skipImage: boolean;
  skipAudio: boolean;
  onSkipImageChange: (checked: CheckedState) => void;
  onSkipAudioChange: (checked: CheckedState) => void;
  onConfirm: () => void;
  apiUsageCount: number;
  showAudioOption: boolean;
}

const CostConfirmationDialog: React.FC<CostConfirmationDialogProps> = ({
  open,
  onOpenChange,
  pendingAction,
  skipImage,
  onSkipImageChange,
  onConfirm
}) => {
  console.log('💰 CostConfirmationDialog rendered:', {
    open,
    pendingAction,
    skipImage
  });

  const getCostEstimate = () => {
    if (pendingAction === 'start') return skipImage ? '1 credit' : '2-3 credits';
    if (pendingAction === 'choice') return skipImage ? '1 credit' : '2-3 credits';
    if (pendingAction === 'finish') return '1-2 credits';
    return '1-3 credits';
  };

  const handleConfirm = () => {
    console.log('✅ Cost confirmation dialog - Generate button clicked!');
    console.log('📋 Confirmation details:', {
      pendingAction,
      skipImage,
      costEstimate: getCostEstimate()
    });
    onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-purple-600">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-purple-400" />
            Confirm Generation
          </DialogTitle>
          <DialogDescription className="text-slate-300">
            This action will use API credits to generate content.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-slate-700/50 p-3 rounded">
            <p className="text-white text-sm">
              <strong>Estimated cost:</strong> {getCostEstimate()}
            </p>
            <p className="text-slate-400 text-xs mt-1">
              {/* Removed debug API calls counter for production */}
            </p>
          </div>
          
          {pendingAction !== 'finish' && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="skip-image-dialog"
                checked={skipImage}
                onCheckedChange={onSkipImageChange}
              />
              <label htmlFor="skip-image-dialog" className="text-sm text-slate-300">
                <Image className="h-4 w-4 inline mr-1" />
                Skip image generation (saves 1-2 credits)
              </label>
            </div>
          )}
          
          <div className="text-xs text-slate-400 bg-slate-900/50 p-2 rounded">
            💡 Tip: You can continue your story anytime without time limits. 
            Only generate when you're ready to continue.
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-slate-600 text-slate-300"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Generate ({getCostEstimate()})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CostConfirmationDialog;
