import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/hooks/useSubscription';
import { useCustomerPortal } from '@/hooks/useCustomerPortal';
import { useStripeCheckout } from '@/hooks/useStripeCheckout';
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

export const SubscriptionManagement = () => {
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
    getUsagePercentage 
  } = useSubscription();

  const { mutate: openCustomerPortal, isPending: isOpeningPortal } = useCustomerPortal();
  const { mutate: createCheckout } = useStripeCheckout();

  const handleManageBilling = () => {
    openCustomerPortal();
  };

  const handleUpgrade = (tier: string) => {
    let priceId = '';
    switch (tier) {
      case 'Premium':
        priceId = 'price_premium_monthly';
        break;
      case 'Pro':
        priceId = 'price_pro_monthly';
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

  return (
    <div className="space-y-6">
      {/* Current Subscription Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5" />
            Current Subscription
          </CardTitle>
          <CardDescription>
            Your current plan and subscription details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {getTierIcon(effectiveTier)}
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-semibold">{effectiveTier} Plan</h3>
                  {isFounder && (
                    <Badge variant="secondary" className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                      <Crown className="w-3 h-3 mr-1" />
                      Founder #{founderNumber}
                    </Badge>
                  )}
                </div>
                {isFounder ? (
                  <span className="text-sm text-muted-foreground">
                    {founderData?.founder_tier === 'genesis' && 'FREE Pro Forever'}
                    {founderData?.founder_tier === 'pioneer' && `60% Lifetime Discount`}
                    {founderData?.founder_tier === 'early_adopter' && `50% Lifetime Discount`}
                  </span>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {isSubscribed ? 'Active subscription' : 'Free tier'}
                  </p>
                )}
              </div>
            </div>
            <div className="text-right">
              {isSubscribed && subscription_end && (
                <div>
                  <p className="text-sm text-muted-foreground">Next billing</p>
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
        </CardContent>
      </Card>

      {/* Usage Tracking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Usage This Month
          </CardTitle>
          <CardDescription>
            Track your monthly usage limits and remaining quota
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stories Usage */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span className="font-medium">Stories Created</span>
              </div>
              <div className="text-sm">
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
              <div className="flex items-center gap-1 text-amber-600 text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>Only {getRemainingStories()} stories remaining this month</span>
              </div>
            )}
          </div>

          {/* Voice Generations */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4" />
                <span className="font-medium">Voice Generations</span>
              </div>
              <div className="text-sm">
                {effectiveTierLimits?.voice_generations_per_month === -1 ? (
                  <div className="flex items-center gap-1">
                    <InfinityIcon className="w-4 h-4" />
                    <span>Unlimited</span>
                  </div>
                ) : (
                  <span>
                    {usage.voice_generations} / {effectiveTierLimits?.voice_generations_per_month || 0}
                  </span>
                )}
              </div>
            </div>
            {effectiveTierLimits?.voice_generations_per_month !== -1 && (
              <Progress 
                value={getUsagePercentage('voice')} 
                className="h-2"
              />
            )}
            {effectiveTierLimits?.voice_generations_per_month !== -1 && getRemainingVoice() <= 2 && getRemainingVoice() > 0 && (
              <div className="flex items-center gap-1 text-amber-600 text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>Only {getRemainingVoice()} voice generations remaining this month</span>
              </div>
            )}
          </div>

          {/* Images Generated */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                <span className="font-medium">Images Generated</span>
              </div>
              <div className="text-sm">
                <span>{usage.images_generated} this month</span>
              </div>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Image limits per-story: {effectiveTierLimits?.images_per_story === -1 ? 'Unlimited' : effectiveTierLimits?.images_per_story || 0} per story</span>
              <span>{usage.images_generated} this month</span>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Usage resets on the 1st of each month
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Account status:</p>
              <p className="font-medium">{isSubscribed ? 'Subscribed' : 'Free'}</p>
            </div>
            {isFounder && (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Founder status:</p>
                  <p className="font-medium capitalize">{founderData?.founder_tier}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Founder number:</p>
                  <p className="font-medium">#{founderNumber}</p>
                </div>
              </>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Current tier:</p>
              <p className="font-medium">{effectiveTier}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Options - Only show if not founder or not Genesis */}
      {(!isFounder || founderData?.founder_tier !== 'genesis') && (
        <Card>
          <CardHeader>
            <CardTitle>Upgrade Your Plan</CardTitle>
            <CardDescription>
              Get access to more features and higher usage limits
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {effectiveTier === 'Free' && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold">Premium</h4>
                  <p className="text-sm text-muted-foreground mb-2">$7.99/month</p>
                  <ul className="text-sm space-y-1 mb-4">
                    <li>• 25 stories per month</li>
                    <li>• 25 voice generations</li>
                    <li>• 15 images per story</li>
                  </ul>
                  <Button 
                    onClick={() => handleUpgrade('Premium')}
                    className="w-full"
                  >
                    Upgrade to Premium
                  </Button>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold">Pro</h4>
                  <p className="text-sm text-muted-foreground mb-2">$17.99/month</p>
                  <ul className="text-sm space-y-1 mb-4">
                    <li>• Unlimited stories</li>
                    <li>• Unlimited voice generations</li>
                    <li>• Unlimited images</li>
                  </ul>
                  <Button 
                    onClick={() => handleUpgrade('Pro')}
                    className="w-full"
                  >
                    Upgrade to Pro
                  </Button>
                </div>
              </div>
            )}
            
            {effectiveTier === 'Premium' && (
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold">Pro</h4>
                <p className="text-sm text-muted-foreground mb-2">$17.99/month</p>
                <ul className="text-sm space-y-1 mb-4">
                  <li>• Unlimited stories</li>
                  <li>• Unlimited voice generations</li>
                  <li>• Unlimited images</li>
                </ul>
                <Button 
                  onClick={() => handleUpgrade('Pro')}
                  className="w-full"
                >
                  Upgrade to Pro
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};