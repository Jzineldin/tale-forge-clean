import React from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { useStripeCheckout } from '@/hooks/useStripeCheckout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Lock, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { TIER_TO_PRICE_ID } from '@/config/stripe';

interface FeatureGateProps {
  children: React.ReactNode;
  feature: 'premium_voice' | 'pdf_export' | 'audio_export' | 'api_access' | 'white_label' | 'custom_voice' | 'batch_processing' | 'advanced_editing' | 'unlimited_stories' | 'unlimited_images' | 'unlimited_voice';
  requiredTier: 'Core' | 'Pro';
  title?: string;
  description?: string;
  showUpgrade?: boolean;
  fallback?: React.ReactNode;
}

const FEATURE_INFO = {
  premium_voice: {
    title: 'Premium Voices',
    description: 'Access to high-quality AI voices for professional storytelling',
    tier: 'Core' as const
  },
  pdf_export: {
    title: 'PDF Export',
    description: 'Export your stories as beautifully formatted PDF files',
    tier: 'Core' as const
  },
  audio_export: {
    title: 'Audio Export',
    description: 'Download complete audio narrations of your stories',
    tier: 'Core' as const
  },
  advanced_editing: {
    title: 'Advanced Editing',
    description: 'Enhanced story editing tools and customization options',
    tier: 'Core' as const
  },
  unlimited_stories: {
    title: 'Unlimited Stories',
    description: 'Create as many stories as you want without monthly limits',
    tier: 'Pro' as const
  },
  unlimited_images: {
    title: 'Unlimited Images',
    description: 'Generate unlimited images per story for rich visual narratives',
    tier: 'Pro' as const
  },
  unlimited_voice: {
    title: 'Unlimited Voice Generation',
    description: 'Generate unlimited audio narrations without monthly restrictions',
    tier: 'Pro' as const
  },
  api_access: {
    title: 'API Access',
    description: 'Programmatic access to TaleForge features for developers',
    tier: 'Pro' as const
  },
  white_label: {
    title: 'White Label',
    description: 'Remove TaleForge branding and customize the interface',
    tier: 'Pro' as const
  },
  custom_voice: {
    title: 'Custom Voice Cloning',
    description: 'Clone voices and create custom narrators for your stories',
    tier: 'Pro' as const
  },
  batch_processing: {
    title: 'Batch Processing',
    description: 'Process multiple stories and generate content in bulk',
    tier: 'Pro' as const
  }
};

export const FeatureGate: React.FC<FeatureGateProps> = ({
  children,
  feature,
  requiredTier,
  title,
  description,
  showUpgrade = true,
  fallback
}) => {
  const { hasFeature, isAuthenticated, effectiveTier } = useSubscription();
  const { mutate: checkout, isPending: isCheckingOut } = useStripeCheckout();

  const featureInfo = FEATURE_INFO[feature];
  const displayTitle = title || featureInfo.title;
  const displayDescription = description || featureInfo.description;
  const actualRequiredTier = requiredTier || featureInfo.tier;

  // Check if user has access to this feature using centralized tier logic
  const hasAccess = hasFeature(feature) ||
    (actualRequiredTier === 'Core' && ['Premium', 'Core', 'Pro', 'Family', 'Enterprise'].includes(effectiveTier)) ||
    (actualRequiredTier === 'Pro' && ['Pro', 'Family', 'Enterprise'].includes(effectiveTier));

  // If user has access, render the children
  if (hasAccess) {
    return <>{children}</>;
  }

  // If fallback is provided, render it instead of the gate
  if (fallback) {
    return <>{fallback}</>;
  }

  const handleUpgrade = () => {
    if (!isAuthenticated) {
      window.location.href = '/auth?redirect=/pricing';
      return;
    }
    
    const priceId = TIER_TO_PRICE_ID[actualRequiredTier];
    if (!priceId) {
      toast.error(`Price ID not found for tier: ${actualRequiredTier}`);
      return;
    }
    
    console.log(`Starting ${actualRequiredTier} upgrade checkout`);
    checkout({
      priceId,
      tier: actualRequiredTier
    });
  };

  const showPreview = () => {
    toast.info(`This is a preview of ${displayTitle}. Upgrade to ${actualRequiredTier} to unlock full access.`);
  };

  // Render feature gate
  return (
    <Card className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-background to-primary/5">
      {/* Tier Badge */}
      <div className="absolute top-4 right-4">
        <Badge className={`border-0 ${
          actualRequiredTier === 'Pro' 
            ? 'bg-gradient-to-r from-purple-600 to-indigo-600' 
            : 'bg-gradient-to-r from-yellow-500 to-amber-600'
        } text-white`}>
          <Crown className="w-3 h-3 mr-1" />
          {actualRequiredTier}
        </Badge>
      </div>

      <CardHeader className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${
            actualRequiredTier === 'Pro' 
              ? 'bg-gradient-to-br from-purple-500 to-indigo-600' 
              : 'bg-gradient-to-br from-yellow-500 to-amber-600'
          }`}>
            <Lock className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl">{displayTitle}</CardTitle>
            <CardDescription>{displayDescription}</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Preview Content */}
        <div className="relative">
          <div className="opacity-30 pointer-events-none select-none cursor-not-allowed" onClick={showPreview}>
            {children}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent flex items-center justify-center">
            <div className="text-center space-y-2">
              <Lock className="w-8 h-8 mx-auto text-muted-foreground" />
              <p className="text-sm font-medium text-muted-foreground">
                {actualRequiredTier} Feature
              </p>
            </div>
          </div>
        </div>

        {/* Upgrade Actions */}
        {showUpgrade && (
          <div className="space-y-4 pt-4 border-t">
            <div className="text-center space-y-2">
              <h4 className="font-semibold">Unlock {displayTitle}</h4>
              <p className="text-sm text-muted-foreground">
                {actualRequiredTier === 'Pro' 
                  ? 'Get unlimited access to all professional features including API access, custom voices, and batch processing.'
                  : 'Upgrade to Premium for enhanced storytelling with premium voices, exports, and advanced editing tools.'
                }
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              {!isAuthenticated ? (
                <Button 
                  onClick={() => window.location.href = '/#waitlist'} 
                  className="btn-primary flex-1"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Join Waitlist
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleUpgrade}
                    disabled={isCheckingOut}
                    className="btn-primary flex-1"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    {isCheckingOut ? 'Opening Checkout...' : `Upgrade to ${actualRequiredTier}`}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.href = '/pricing'}
                    className="btn-ghost flex-1 sm:flex-initial"
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

// Convenience components for common features
export const PremiumVoiceGate: React.FC<Omit<FeatureGateProps, 'feature' | 'requiredTier'>> = (props) => (
  <FeatureGate {...props} feature="premium_voice" requiredTier="Core" />
);

export const PDFExportGate: React.FC<Omit<FeatureGateProps, 'feature' | 'requiredTier'>> = (props) => (
  <FeatureGate {...props} feature="pdf_export" requiredTier="Core" />
);

export const AudioExportGate: React.FC<Omit<FeatureGateProps, 'feature' | 'requiredTier'>> = (props) => (
  <FeatureGate {...props} feature="audio_export" requiredTier="Core" />
);

export const UnlimitedStoriesGate: React.FC<Omit<FeatureGateProps, 'feature' | 'requiredTier'>> = (props) => (
  <FeatureGate {...props} feature="unlimited_stories" requiredTier="Pro" />
);

export const APIAccessGate: React.FC<Omit<FeatureGateProps, 'feature' | 'requiredTier'>> = (props) => (
  <FeatureGate {...props} feature="api_access" requiredTier="Pro" />
);