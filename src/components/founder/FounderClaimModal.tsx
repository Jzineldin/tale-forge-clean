
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Star, Gift, Check, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FounderClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  remainingSpots: number;
  selectedTier?: 'Genesis' | 'Pioneer' | 'Early Adopter' | null;
}

const FounderClaimModal: React.FC<FounderClaimModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  remainingSpots,
  selectedTier = null
}) => {
  const [isClaimingFounder, setIsClaimingFounder] = useState(false);

  const handleClaimFounder = async () => {
    setIsClaimingFounder(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be signed in to claim founder status');
        return;
      }

      const { data, error } = await supabase.functions.invoke('assign-founder-status', {
        body: { userId: user.id }
      });

      if (error) {
        console.error('Error claiming founder status:', error);
        toast.error('Failed to claim founder status. Please try again.');
        return;
      }

      if (data.success) {
        toast.success(data.message);
        onSuccess();
        onClose();
      } else {
        toast.error(data.error || 'Failed to claim founder status');
      }
    } catch (error) {
      console.error('Error claiming founder status:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsClaimingFounder(false);
    }
  };

  const getTierInfo = () => {
    const currentSpot = 200 - remainingSpots + 1;
    
    // If a specific tier was selected from the pricing page, use that
    if (selectedTier) {
      switch (selectedTier) {
        case 'Genesis':
          return {
            tier: 'Genesis',
            badge: 'bg-yellow-500',
            icon: Crown,
            discount: '100%',
            benefits: [
              'Lifetime Pro Access (100% off)',
              'Genesis Badge',
              'Early Access to new features',
              'Direct Feedback Channel'
            ]
          };
        case 'Pioneer':
          return {
            tier: 'Pioneer',
            badge: 'bg-rose-500',
            icon: Star,
            discount: '60%',
            benefits: [
              '60% Lifetime Discount',
              'Pioneer Badge',
              'Early Access to new features',
              'Community Priority'
            ]
          };
        case 'Early Adopter':
          return {
            tier: 'Early Adopter',
            badge: 'bg-purple-500',
            icon: Gift,
            discount: '50%',
            benefits: [
              '50% Lifetime Discount',
              'Early Adopter Badge',
              'Early Access to new features'
            ]
          };
      }
    }
    
    // Fallback to original logic based on spot number
    if (currentSpot <= 25) {
      return {
        tier: 'Genesis',
        badge: 'bg-yellow-500',
        icon: Crown,
        discount: '100%',
        benefits: [
          'Lifetime Pro Access (100% off)',
          'Genesis Badge',
          'Early Access to new features',
          'Direct Feedback Channel'
        ]
      };
    } else if (currentSpot <= 100) {
      return {
        tier: 'Pioneer',
        badge: 'bg-rose-500',
        icon: Star,
        discount: '60%',
        benefits: [
          '60% Lifetime Discount',
          'Pioneer Badge',
          'Early Access to new features',
          'Community Priority'
        ]
      };
    } else {
      return {
        tier: 'Early Adopter',
        badge: 'bg-purple-500',
        icon: Gift,
        discount: '50%',
        benefits: [
          '50% Lifetime Discount',
          'Early Adopter Badge',
          'Early Access to new features'
        ]
      };
    }
  };

  const tierInfo = getTierInfo();
  const IconComponent = tierInfo.icon;

  if (remainingSpots <= 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Founder Program Full</DialogTitle>
            <DialogDescription className="text-center">
              All 200 founder spots have been claimed. Thank you for your interest!
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className={`p-3 rounded-full ${tierInfo.badge} text-white`}>
              <IconComponent className="w-6 h-6" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">
            {selectedTier ? `Claim ${selectedTier} Founder Status!` : 'Claim Your Founder Status!'}
          </DialogTitle>
          <DialogDescription className="text-center">
            You're about to become Founder #{200 - remainingSpots + 1} and unlock exclusive benefits
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tier Badge */}
          <div className="flex justify-center">
            <Badge className={`${tierInfo.badge} text-white px-4 py-2 text-lg`}>
              {tierInfo.tier} Tier
            </Badge>
          </div>

          {/* Benefits List */}
          <div className="space-y-3">
            <h4 className="font-semibold text-center">Your Founder Benefits:</h4>
            {tierInfo.benefits.map((benefit, index) => (
              <div key={index} className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-sm">{benefit}</span>
              </div>
            ))}
          </div>

          {/* Remaining Spots Warning */}
          <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
            <div className="flex items-center space-x-2 text-amber-800 dark:text-amber-200">
              <Crown className="w-5 h-5" />
              <span className="font-medium">
                Only {remainingSpots} founder spots remaining!
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isClaimingFounder}
            >
              Maybe Later
            </Button>
            <Button
              onClick={handleClaimFounder}
              disabled={isClaimingFounder}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isClaimingFounder ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Claiming...
                </>
              ) : (
                <>
                  <Crown className="w-4 h-4 mr-2" />
                  Claim Founder Status
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FounderClaimModal;
