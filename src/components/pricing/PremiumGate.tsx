
import React from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { useFounderWaitlist } from '@/hooks/useFounderWaitlist';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Sparkles, ArrowRight, Calendar } from 'lucide-react';

interface PremiumGateProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  feature?: string;
  className?: string;
  showUpgrade?: boolean;
}

export const PremiumGate: React.FC<PremiumGateProps> = ({
  children,
  title = "Coming This Fall",
  description = "This feature will be available when we launch our premium plans.",
  className = "",
  showUpgrade = true,
}) => {
  const { isPremium, isAuthenticated } = useSubscription();
  const { isOnWaitlist, joinWaitlist, loading: waitlistLoading } = useFounderWaitlist();

  // If user has premium access, render the children
  if (isPremium) {
    return <>{children}</>;
  }

  const handleJoinWaitlist = async () => {
    if (!isAuthenticated) {
      window.location.href = '/auth?redirect=/pricing';
      return;
    }
    
    await joinWaitlist();
  };

  // Render premium gate
  return (
    <Card className={`relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-background to-primary/5 ${className}`}>
      {/* Coming Soon Badge */}
      <div className="absolute top-4 right-4">
        <Badge className="bg-gradient-to-r from-purple-500 to-pink-600 text-white border-0">
          <Calendar className="w-3 h-3 mr-1" />
          Coming Fall 2024
        </Badge>
      </div>

      <CardHeader className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Preview/Placeholder Content */}
        <div className="relative">
          <div className="opacity-50 pointer-events-none select-none">
            {children}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent flex items-end justify-center pb-8">
            <div className="text-center space-y-2">
              <Calendar className="w-8 h-8 mx-auto text-purple-400" />
              <p className="text-sm font-medium">Coming This Fall</p>
            </div>
          </div>
        </div>

        {/* Upgrade Actions */}
        {showUpgrade && (
          <div className="space-y-4 pt-4 border-t">
            <div className="text-center space-y-2">
              <h4 className="font-semibold">Join the Founder Program</h4>
              <p className="text-sm text-muted-foreground">
                Get early access and lifetime discounts when we launch our premium plans this fall.
                Join the first 200 users to become a founder.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              {!isAuthenticated ? (
                <Button 
                  onClick={() => window.location.href = '/#waitlist'} 
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Join Waitlist
                </Button>
              ) : isOnWaitlist ? (
                <Button 
                  variant="outline" 
                  disabled
                  className="flex-1"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Already on Waitlist
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleJoinWaitlist}
                    disabled={waitlistLoading}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    {waitlistLoading ? 'Joining...' : 'Join Founder Program'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.href = '/pricing'}
                    className="flex-1 sm:flex-initial"
                  >
                    View Plans
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
