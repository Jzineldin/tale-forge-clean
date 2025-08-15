import './ComingSoonOverlay.css';
import StripeElements from '../subscription/StripeElements';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';

const PricingPage = () => {
  const { effectiveTier } = useSubscription();
  
  // Tier hierarchy for comparison
  const TIER_HIERARCHY: Record<string, number> = {
    'Free': 0,
    'Core': 1,
    'Premium': 1,
    'Pro': 2,
    'Enterprise': 3
  };
  
  // Check if user can subscribe to a tier (not already at or above that tier)
  const canSubscribeToTier = (tierName: string) => {
    const currentTierLevel = TIER_HIERARCHY[effectiveTier] || 0;
    const requestedTierLevel = TIER_HIERARCHY[tierName] || 0;
    
    // Special case: If user has Premium tier and requesting Core, they already have it
    if (tierName === 'Core' && effectiveTier === 'Premium') {
      return false;
    }
    
    return requestedTierLevel > currentTierLevel;
  };
  
  // Tier data structure - RESTORED CORRECT PRICING
  const tiers = [
    {
      name: 'Free',
      price: '$0',
      description: 'Perfect for getting started',
      features: ['20 chapters/month', '20 AI images/month', '10 minutes TTS/month'],
      cta: 'Get Started',
      accent: 'from-gray-600 to-gray-700',
      priceId: 'price_free',
      buttonVariant: 'orange'
    },
    {
      name: 'Core',
      price: '$7.99',
      description: 'For regular storytellers',
      features: ['100 chapters/month', '100 AI images/month', '60 minutes TTS/month', 'More chapters per story'],
      cta: 'Subscribe',
      accent: 'from-blue-600 to-blue-700',
      priceId: 'price_1RvIkAK8ILu7UAIcMGAtbWnS', // Real Stripe price ID for Core $7.99
      buttonVariant: 'orange-amber'
    },
    {
      name: 'Pro',
      price: '$17.99',
      description: 'For creative professionals',
      features: ['Unlimited chapters', '300 AI images/month', '140 minutes TTS/month', 'Early access to new features', 'Priority support'],
      cta: 'Subscribe',
      accent: 'from-purple-600 to-purple-700',
      priceId: 'price_1RvIknK8ILu7UAIclUEYX3oz', // Real Stripe price ID for Pro $17.99
      buttonVariant: 'yellow-orange'
    }
  ];

  return (
    <div className="min-h-screen w-full relative">
      {/* Same beautiful background as landing page */}
      <div className="scene-bg"></div>

      <div className="relative z-10">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-hero text-white" style={{textShadow: '0 2px 4px rgba(0,0,0,0.6)'}}>Choose Your Plan</h1>
          <p className="text-subheading text-white/90" style={{textShadow: '0 2px 4px rgba(0,0,0,0.6)'}}>Simple, transparent pricing for every storyteller</p>
        </div>
        
        {/* Tier cards grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-12 place-items-stretch max-w-5xl mx-auto">
          {tiers.map((tier, index) => (
            <div key={index} className="glass-enhanced backdrop-blur-lg bg-black/40 border border-white/20 rounded-2xl overflow-hidden w-full flex flex-col">
              {/* Wrap card content in relative container for positioning */}
              <div className={`relative ${tier.name.toLowerCase().replace(' ', '-')}-plan flex flex-col h-full`}>
                <div className="p-6 flex flex-col h-full">
                  <h3 className="text-heading mb-4 text-white">{tier.name}</h3>
                  <div className="mb-6">
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold text-primary-amber">{tier.price}</span>
                      <span className="ml-2 text-body text-white">/month</span>
                    </div>
                    <p className="text-body text-white/80 mt-2">{tier.description}</p>
                  </div>
                  
                  <div className="flex-grow">
                    <ul className="space-y-3 mb-8 min-h-[160px]">
                      {tier.features.map((feature, featIndex) => (
                        <li key={featIndex} className="flex items-start">
                          <svg className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="ml-3 text-body text-white/90">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                 <div className="mt-auto pt-4">
                   {tier.name !== 'Free' ? (
                     <div className="min-h-[80px] flex items-end">
                       {canSubscribeToTier(tier.name) ? (
                         <div className="w-full">
                           <StripeElements priceId={tier.priceId} />
                         </div>
                       ) : (
                         <Button variant="secondary" size="lg" className="w-full" disabled>
                           {(effectiveTier === tier.name || (effectiveTier === 'Premium' && tier.name === 'Core')) ? 'Current Plan' : `Upgrade to ${tier.name}`}
                         </Button>
                       )}
                     </div>
                   ) : (
                     <div className="min-h-[80px] flex items-end">
                       <Button variant={tier.buttonVariant as any} size="lg" className="w-full">
                         {tier.cta}
                       </Button>
                     </div>
                   )}
                 </div>
                </div>
                
                {/* Coming Soon overlay removed: Stripe integration is active */}
                {/* Previously: {false && tier.name !== 'Free' && (<div className="plan-overlay">...</div>)} */}
              </div>
            </div>
          ))}
        </div>

        {/* Feature comparison table */}
        <div className="glass-enhanced backdrop-blur-lg bg-black/40 border border-white/20 rounded-2xl p-8">
          <h2 className="text-heading text-center mb-8 text-white">Compare Plans</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-border-primary">
                  <th className="text-left py-4 px-4 text-heading text-white">Features</th>
                  <th className="text-center py-4 px-4 text-heading text-white">Free</th>
                  <th className="text-center py-4 px-4 text-heading text-white">Core</th>
                  <th className="text-center py-4 px-4 text-heading text-white">Pro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-primary">
                <tr>
                  <td className="py-4 px-4 text-body text-white/90">Chapters per month</td>
                  <td className="py-4 px-4 text-center text-body text-white/90">20</td>
                  <td className="py-4 px-4 text-center text-body text-white/90">100</td>
                  <td className="py-4 px-4 text-center text-body text-white/90">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-body text-white/90">AI images per month</td>
                  <td className="py-4 px-4 text-center text-body text-white/90">20</td>
                  <td className="py-4 px-4 text-center text-body text-white/90">100</td>
                  <td className="py-4 px-4 text-center text-body text-white/90">300</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-body text-white/90">TTS minutes per month</td>
                  <td className="py-4 px-4 text-center text-body text-white/90">10</td>
                  <td className="py-4 px-4 text-center text-body text-white/90">60</td>
                  <td className="py-4 px-4 text-center text-body text-white/90">140</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-body text-white/90">Early access to new features</td>
                  <td className="py-4 px-4 text-center text-body text-white/90">-</td>
                  <td className="py-4 px-4 text-center text-body text-white/90">-</td>
                  <td className="py-4 px-4 text-center text-body text-white/90">✓</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-body text-white/90">Priority support</td>
                  <td className="py-4 px-4 text-center text-body text-white/90">-</td>
                  <td className="py-4 px-4 text-center text-body text-white/90">-</td>
                  <td className="py-4 px-4 text-center text-body text-white/90">✓</td>
                </tr>
              </tbody>
            </table>
          </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default PricingPage;