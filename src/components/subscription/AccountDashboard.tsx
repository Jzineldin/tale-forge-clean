import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/hooks/useSubscription';
import { useCustomerPortal } from '@/hooks/useCustomerPortal';
import { useStripeCheckout } from '@/hooks/useStripeCheckout';
import { useAuth } from '@/context/AuthProvider';
import { mapTierToDisplay, hasPremiumAccess } from '@/utils/tierMapping';

import {
  Crown,
  CreditCard,
  FileText,
  Mic,
  Image as ImageIcon,
  AlertTriangle,
  Infinity as InfinityIcon,
  Sparkles
} from 'lucide-react';


// Tier hierarchy for comparison
const TIER_HIERARCHY: Record<string, number> = {
  'Free': 0,
  'Core': 1,
  'Premium': 1,
  'Pro': 2,
  'Enterprise': 3
};

export default function AccountDashboard() {
  const { 
    subscription_end, 
    isSubscribed,
    usage,
    effectiveTierLimits,
    effectiveTier,
    isFounder,
    founderData,
    founderNumber,
    getRemainingStories,
    getRemainingVoice,
    getUsagePercentage,
    refreshSubscription
  } = useSubscription();

  const { mutate: openCustomerPortal, isPending: isOpeningPortal } = useCustomerPortal();
  const { mutate: createCheckout } = useStripeCheckout();
  const { subscriptionLoading } = useAuth();
  


  const handleManageBilling = () => {
    console.log('🔗 Manage Billing clicked:', {
      isSubscribed,
      effectiveTier,
      subscription_end,
      isFounder
    });
    openCustomerPortal();
  };

  const handleUpgrade = (tier: string) => {
    // Check if user can upgrade to this tier
    const currentTierLevel = TIER_HIERARCHY[effectiveTier] || 0;
    const requestedTierLevel = TIER_HIERARCHY[tier] || 0;
    
    // Only allow upgrades to higher tiers
    if (requestedTierLevel <= currentTierLevel) {
      console.warn(`Cannot downgrade from ${effectiveTier} to ${tier}`);
      return;
    }
    
    let priceId = '';
    switch (tier) {
      case 'Premium':
        priceId = 'price_1RvIkAK8ILu7UAIcMGAtbWnS'; // Real Stripe price ID for Premium/Core tier
        break;
      case 'Pro':
        priceId = 'price_1RvIknK8ILu7UAIclUEYX3oz'; // Real Stripe price ID for Pro tier
        break;
      default:
        return;
    }

    createCheckout({
      priceId,
      tier
    });
  };
  


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'Pro':
      case 'Enterprise':
        return <Crown className="w-4 h-4" />;
      case 'Premium':
        return <Sparkles className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  // Format price for display
  const formatPrice = (tier: string) => {
    switch (tier) {
      case 'Premium':
        return '$7.99/month'; // Premium (displayed as Core) costs $7.99
      case 'Pro':
        return '$17.99/month';
      default:
        return 'Free';
    }
  };

  // Use centralized tier mapping
  const displayTier = mapTierToDisplay(effectiveTier);
  // Safely derive TTS minutes limit and remaining minutes for TS
  const ttsLimit = effectiveTierLimits?.voice_minutes_per_month;
  const remainingTtsMinutes =
    typeof ttsLimit === 'number' && ttsLimit !== -1
      ? ttsLimit - (usage.narrated_minutes_used || 0)
      : undefined;

  return (
    <div className="page-container">
      <div className="page-content">
        <div className="profile-settings-container">
          {/* Page Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-hero" style={{ color: '#fbbf24', textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>Account</h1>
              <p className="text-subheading" style={{ color: '#e5e7eb' }}>Subscription, billing, and usage management</p>
            </div>

          </div>

          {/* Single unified container */}
          <Card className="glass-enhanced backdrop-blur-lg bg-black/40 border border-white/20 rounded-2xl shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-heading">
                <Crown className="w-5 h-5 text-primary-amber" />
                Account Dashboard
              </CardTitle>
              <CardDescription className="text-small text-muted">
                Manage your subscription, view usage, and account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Current Subscription Section */}
              <div>
                <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
                  <Crown className="w-5 h-5 text-primary-amber" />
                  Current Subscription
                </h3>
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getTierIcon(effectiveTier)}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-semibold">
                            {displayTier} Plan
                            {subscriptionLoading && (
                              <span className="ml-2 text-sm text-muted animate-pulse">(updating...)</span>
                            )}
                          </h3>
                          {isFounder && (
                            <Badge variant="secondary" className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                              <Crown className="w-3 h-3 mr-1" />
                              Founder #{founderNumber}
                            </Badge>
                          )}
                        </div>
                        <p className="text-small text-muted">
                          {formatPrice(effectiveTier)}
                        </p>
                        {isFounder ? (
                          <span className="text-small text-muted">
                            {founderData?.founder_tier === 'genesis' && 'FREE Pro Forever'}
                            {founderData?.founder_tier === 'pioneer' && `60% Lifetime Discount`}
                            {founderData?.founder_tier === 'early_adopter' && `50% Lifetime Discount`}
                          </span>
                        ) : (
                          <p className="text-small text-muted">
                            {isSubscribed ? 'Active subscription' : 'Free tier'}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {isSubscribed && subscription_end && (
                        <div>
                          <p className="text-small text-muted">Next billing</p>
                          <p className="font-medium">{formatDate(subscription_end)}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {isSubscribed && !isFounder && (
                    <Button
                      onClick={handleManageBilling}
                      disabled={isOpeningPortal}
                      variant="outline"
                      className="w-full"
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      {isOpeningPortal ? 'Opening...' : 'Manage Billing'}
                    </Button>
                  )}
                </div>
              </div>

              {/* Usage Tracking Section */}
              <div>
                <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
                  <FileText className="w-5 h-5" />
                  Usage This Month
                </h3>
                <div className="space-y-6">
                  {/* Stories Usage */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        <span className="font-medium">Chapters Created</span>
                      </div>
                      <div className="text-small text-muted">
                        {effectiveTierLimits?.stories_per_month === -1 ? (
                          <div className="flex items-center gap-1">
                            <InfinityIcon className="w-4 h-4" />
                            <span>Unlimited</span>
                          </div>
                        ) : (
                          <span>
                            {usage.stories_created} / {effectiveTierLimits?.stories_per_month || 0}
                          </span>
                        )}
                      </div>
                    </div>
                    {effectiveTierLimits?.stories_per_month !== -1 && (
                      <Progress
                        value={getUsagePercentage('story')}
                        className="h-2"
                      />
                    )}
                    {effectiveTierLimits?.stories_per_month !== -1 && getRemainingStories() <= 2 && getRemainingStories() > 0 && (
                      <div className="flex items-center gap-1 text-amber-600 text-small">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Only {getRemainingStories()} chapters remaining this month</span>
                      </div>
                    )}
                  </div>

                  {/* TTS Minutes */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mic className="w-4 h-4" />
                        <span className="font-medium">TTS Minutes</span>
                      </div>
                      <div className="text-small text-muted">
                        {effectiveTierLimits?.voice_minutes_per_month === -1 ? (
                          <div className="flex items-center gap-1">
                            <InfinityIcon className="w-4 h-4" />
                            <span>Unlimited</span>
                          </div>
                        ) : (
                          <span>
                            {usage.narrated_minutes_used || 0} / {effectiveTierLimits?.voice_minutes_per_month || 0} minutes
                          </span>
                        )}
                      </div>
                    </div>
                    {effectiveTierLimits?.voice_minutes_per_month !== -1 && (
                      <Progress
                        value={Math.min(100, ((usage.narrated_minutes_used || 0) / (effectiveTierLimits?.voice_minutes_per_month || 1)) * 100)}
                        className="h-2"
                      />
                    )}
                    {/* Show warning when approaching limit */}
                    {(() => {
                      const limit = effectiveTierLimits?.tts_minutes_per_month || effectiveTierLimits?.voice_minutes_per_month;
                      const used = usage.narrated_minutes_used || 0;
                      const remaining = limit && limit !== -1 ? limit - used : null;
                      return remaining !== null && remaining <= 5 && remaining > 0 && (
                        <div className="flex items-center gap-1 text-amber-600 text-small">
                          <AlertTriangle className="w-4 h-4" />
                          <span>Only {remaining} TTS minutes remaining this month</span>
                        </div>
                      );
                    })()}
                  </div>

                  {/* AI Images Generated */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        <span className="font-medium">AI Images Generated</span>
                      </div>
                      <div className="text-small text-muted">
                        {effectiveTierLimits?.images_per_story === -1 ? (
                          <div className="flex items-center gap-1">
                            <InfinityIcon className="w-4 h-4" />
                            <span>Unlimited</span>
                          </div>
                        ) : (
                          <span>
                            {usage.images_generated || 0} / {effectiveTierLimits?.images_per_story || 0}
                          </span>
                        )}
                      </div>
                    </div>
                    {effectiveTierLimits?.images_per_story !== -1 && (
                      <Progress
                        value={Math.min(100, ((usage.images_generated || 0) / (effectiveTierLimits?.images_per_story || 1)) * 100)}
                        className="h-2"
                      />
                    )}
                  </div>

                  <div className="pt-4 border-t border-border-primary">
                    <p className="text-small text-muted">
                      Usage resets on the 1st of each month
                    </p>
                  </div>
                </div>
              </div>

              {/* Account Information Section */}
              <div>
                <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
                  <FileText className="w-5 h-5" />
                  Account Information
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-small text-muted">Account status:</p>
                      <p className="font-medium">{isSubscribed ? 'Subscribed' : 'Free'}</p>
                    </div>
                    {isFounder && (
                      <>
                        <div>
                          <p className="text-small text-muted">Founder status:</p>
                          <p className="font-medium capitalize">{founderData?.founder_tier}</p>
                        </div>
                        <div>
                          <p className="text-small text-muted">Founder number:</p>
                          <p className="font-medium">#{founderNumber}</p>
                        </div>
                      </>
                    )}
                    <div>
                      <p className="text-small text-muted">Current tier:</p>
                      <p className="font-medium">{displayTier}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upgrade Options Section - Only show if not founder or not Genesis */}
              {(!isFounder || founderData?.founder_tier !== 'genesis') && (
                <div>
                  <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
                    <Crown className="w-5 h-5" />
                    Upgrade Your Plan
                  </h3>
                  <p className="text-small text-muted mb-4">
                    Get access to more features and higher usage limits
                  </p>
                  <div className="space-y-4">
                    {effectiveTier === 'Free' && (
                      <div className="grid gap-4 md:grid-cols-2">
                        <div
                          className="p-4 border border-border-primary rounded-lg shadow-sm"
                          style={{ background: 'var(--bg-overlay)' }}
                        >
                           <h4 className="font-semibold">Core</h4>
                           <p className="text-small text-muted mb-2">$7.99/month</p>
                           <ul className="text-small space-y-1 mb-4">
                             <li>• 100 chapters per month</li>
                             <li>• 100 AI images per month</li>
                             <li>• 60 TTS minutes per month</li>
                           </ul>
                           <Button
                             onClick={() => handleUpgrade('Premium')}
                             className="w-full"
                             disabled={TIER_HIERARCHY[effectiveTier] >= TIER_HIERARCHY['Premium']}
                           >
                             {TIER_HIERARCHY[effectiveTier] >= TIER_HIERARCHY['Premium'] ? 'Current Plan' : 'Upgrade to Core'}
                           </Button>
                         </div>
                        <div
                          className="p-4 border border-border-primary rounded-lg shadow-sm"
                          style={{ background: 'var(--bg-overlay)' }}
                        >
                           <h4 className="font-semibold">Pro</h4>
                           <p className="text-small text-muted mb-2">$17.99/month</p>
                           <ul className="text-small space-y-1 mb-4">
                             <li>• Unlimited chapters</li>
                             <li>• 300 AI images per month</li>
                             <li>• 140 TTS minutes per month</li>
                             <li>• Early access to new features</li>
                             <li>• Priority support</li>
                           </ul>
                           <Button
                             onClick={() => handleUpgrade('Pro')}
                             className="w-full"
                             disabled={TIER_HIERARCHY[effectiveTier] >= TIER_HIERARCHY['Pro']}
                           >
                             {TIER_HIERARCHY[effectiveTier] >= TIER_HIERARCHY['Pro'] ? 'Current Plan' : 'Upgrade to Pro'}
                           </Button>
                         </div>
                       </div>
                     )}

                     {effectiveTier === 'Premium' && (
                       <div
                        className="p-4 border border-border-primary rounded-lg shadow-sm"
                        style={{ background: 'var(--bg-overlay)' }}
                      >
                         <h4 className="font-semibold">Pro</h4>
                         <p className="text-small text-muted mb-2">$17.99/month</p>
                         <ul className="text-small space-y-1 mb-4">
                           <li>• Unlimited stories</li>
                           <li>• Unlimited voice generations</li>
                           <li>• Unlimited images</li>
                         </ul>
                         <Button
                           onClick={() => handleUpgrade('Pro')}
                           className="w-full"
                           disabled={TIER_HIERARCHY[effectiveTier] >= TIER_HIERARCHY['Pro']}
                         >
                           {TIER_HIERARCHY[effectiveTier] >= TIER_HIERARCHY['Pro'] ? 'Current Plan' : 'Upgrade to Pro'}
                         </Button>
                       </div>
                     )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}