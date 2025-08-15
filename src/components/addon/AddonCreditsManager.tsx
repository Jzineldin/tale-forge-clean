import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, ShoppingCart, Check, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AddonPackage {
  id: string;
  name: string;
  price: number;
  creditType: 'segments' | 'images' | 'tts_minutes';
  amount: number;
  description: string;
  badge?: string;
  icon: React.ReactNode;
  stripeProductId?: string;
}

const AddonCreditsManager: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [purchasingAddon, setPurchasingAddon] = useState<string | null>(null);

  const addonPackages: AddonPackage[] = [
    {
      id: 'segments-25',
      name: 'Extra Segments',
      price: 2,
      creditType: 'segments',
      amount: 25,
      description: 'Perfect for expanding your stories',
      icon: <Plus className="h-5 w-5 text-blue-400" />,
    },
    {
      id: 'images-25',
      name: 'Extra Images',
      price: 3,
      creditType: 'images',
      amount: 25,
      description: 'More beautiful AI illustrations',
      icon: <ShoppingCart className="h-5 w-5 text-green-400" />,
    },
    {
      id: 'tts-60',
      name: 'TTS Minutes',
      price: 5,
      creditType: 'tts_minutes',
      amount: 60,
      description: 'Additional voice narration time',
      icon: <Check className="h-5 w-5 text-purple-400" />,
    },
    {
      id: 'combo-pack',
      name: 'Combo Pack',
      price: 8,
      creditType: 'segments', // We'll handle multiple types in purchase logic
      amount: 25,
      description: '25 segments + 25 images + 30 TTS minutes',
      badge: 'BEST VALUE',
      icon: <ShoppingCart className="h-5 w-5 text-orange-400" />,
    },
  ];

  const handlePurchaseAddon = async (pkg: AddonPackage) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to purchase add-on credits.",
        variant: "destructive",
      });
      return;
    }

    setPurchasingAddon(pkg.id);

    try {
      // For now, we'll simulate a successful purchase
      // In production, this would integrate with Stripe
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Add credits to user's account
      const creditsToAdd = pkg.id === 'combo-pack' 
        ? [
            { type: 'segments', amount: 25 },
            { type: 'images', amount: 25 },
            { type: 'tts_minutes', amount: 30 }
          ]
        : [{ type: pkg.creditType, amount: pkg.amount }];

      for (const credit of creditsToAdd) {
        const { error } = await supabase
          .from('addon_credits')
          .insert({
            user_id: user.id,
            credit_type: credit.type,
            amount: credit.amount,
            used_amount: 0,
            purchased_at: new Date().toISOString(),
          });

        if (error) {
          console.error('Error adding credits:', error);
          throw new Error('Failed to add credits');
        }
      }

      toast({
        title: "Purchase Successful! 🎉",
        description: `${pkg.name} credits have been added to your account.`,
      });

    } catch (error) {
      console.error('Purchase failed:', error);
      toast({
        title: "Purchase Failed",
        description: "Unable to complete your purchase. Please try again.",
        variant: "destructive",
      });
    } finally {
      setPurchasingAddon(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-4">
          Need More? <span className="text-amber-400">Top Up</span> Anytime
        </h2>
        <p className="text-slate-300">
          Buy additional credits when you need them. No subscription required.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {addonPackages.map((pkg) => (
          <Card key={pkg.id} className="relative bg-slate-800/50 border-slate-600 hover:bg-slate-800/70 transition-all duration-300">
            {pkg.badge && (
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-amber-500 text-slate-900 px-3 py-1 font-bold text-xs">
                {pkg.badge}
              </Badge>
            )}
            
            <CardContent className="p-4 text-center">
              <div className="flex justify-center mb-3 text-amber-400">
                {pkg.icon}
              </div>
              <h3 className="font-bold text-white mb-1 text-sm">{pkg.name}</h3>
              <div className="text-2xl font-bold text-white mb-1">${pkg.price}</div>
              <div className="text-amber-400 font-semibold mb-2 text-xs">
                {pkg.id === 'combo-pack' ? pkg.description : `${pkg.amount} ${pkg.creditType.replace('_', ' ')}`}
              </div>
              <p className="text-slate-400 text-xs mb-3">{pkg.description}</p>
              
              <Button
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2 px-4 rounded transition-all duration-200"
                onClick={() => handlePurchaseAddon(pkg)}
                disabled={purchasingAddon === pkg.id}
                size="sm"
              >
                {purchasingAddon === pkg.id ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Plus className="h-3 w-3 mr-2" />
                    Buy Now
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-slate-800/30 border border-slate-600 rounded-lg p-4 text-center">
        <h3 className="text-lg font-bold text-white mb-3">💡 How Add-Ons Work</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm text-slate-300">
          <div>
            <strong className="text-white">Instant Access:</strong> Credits added immediately
          </div>
          <div>
            <strong className="text-white">No Expiry:</strong> Use whenever you want
          </div>
          <div>
            <strong className="text-white">Stack with Plans:</strong> Works with any tier
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddonCreditsManager;