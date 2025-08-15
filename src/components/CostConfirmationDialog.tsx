import React from 'react';
import { Button } from "@/components/ui/button";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, Sparkles } from 'lucide-react';

interface CostConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  pendingAction: 'start' | 'choice' | 'audio' | null;
}

export const CostConfirmationDialog: React.FC<CostConfirmationDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  pendingAction
}) => {
  const getActionText = () => {
    switch (pendingAction) {
      case 'start': return 'start your story';
      case 'choice': return 'generate next segment';
      case 'audio': return 'generate audio narration';
      default: return 'continue';
    }
  };

  // If not open, don't render anything
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm bg-slate-800 border-slate-600 text-white shadow-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-amber-400">
            <Coins className="h-5 w-5" />
            Confirm Generation
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
                                <p className="text-gray-300 text-sm">
                        Ready to {getActionText()}? This will use AI services to generate content.
                      </p>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Generate
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};