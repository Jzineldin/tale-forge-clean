import React from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent } from '@/components/ui/card';
import { Crown } from 'lucide-react';

interface SubscriptionGuardProps {
  children: React.ReactNode;
  showFounderBenefits?: boolean;
}

const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({ 
  children, 
  showFounderBenefits = true 
}) => {
  const { 
    isFounder, 
    founderData, 
    effectiveTier
  } = useSubscription();

  // Show founder status banner for founders instead of blocking content
  if (isFounder && showFounderBenefits) {
    return (
      <div className="space-y-6">
        {/* Founder Status Banner */}
        <div className="mx-auto max-w-4xl p-4">
          <Card className="glass-card border-amber-400/30 backdrop-blur-lg bg-black/40">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-r from-yellow-400 to-amber-600 p-2 rounded-full">
                    <Crown className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-amber-400">
                      Founder #{founderData?.founder_number}
                    </h3>
                    <p className="text-sm text-amber-300/80">
                      Current tier: <span className="font-semibold text-amber-400">{effectiveTier}</span>
                      {founderData?.founder_tier === 'genesis' && ' (Lifetime FREE Pro)'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-green-400">
                    ✓ All benefits active
                  </p>
                  <p className="text-xs text-amber-300/60">
                    No subscription needed
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Render the actual pricing page content */}
        {children}
      </div>
    );
  }

  // For non-founders or when showFounderBenefits is false, render children
  return <>{children}</>;
};

export default SubscriptionGuard;