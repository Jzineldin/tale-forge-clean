
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Crown, Sparkles } from 'lucide-react';
import FounderClaimModal from '@/components/founder/FounderClaimModal';
import { useState } from 'react';

const EnhancedPricing = () => {
  const [isFounderModalOpen, setIsFounderModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<"Genesis" | "Pioneer" | "Early Adopter" | null>(null);

  const handleModalClose = () => {
    setIsFounderModalOpen(false);
    setSelectedTier(null);
  };

  const handleFounderSuccess = () => {
    console.log('Founder claim successful');
    setIsFounderModalOpen(false);
    setSelectedTier(null);
  };

  return <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-blue-900/10 to-indigo-900/20">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Choose Your Adventure
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Join the future of interactive storytelling. Create unlimited stories, develop memorable characters, and explore worlds limited only by your imagination.
          </p>
        </div>

        {/* Current Offerings */}
        <div className="grid md:grid-cols-2 gap-8 mb-16 max-w-4xl mx-auto">
          {/* Free Beta Card */}
          <Card className="relative overflow-hidden border-green-500/50 bg-gradient-to-br from-green-900/20 to-emerald-900/10">
            <div className="absolute top-4 right-4">
              <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                FREE BETA
              </span>
            </div>
            <CardHeader>
              <CardTitle className="text-2xl text-green-400 flex items-center gap-2">
                <Sparkles className="w-6 h-6" />
                Beta Explorer
              </CardTitle>
              <CardDescription className="text-gray-300">
                Experience the magic of AI storytelling for free during our beta phase
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-4xl font-bold text-green-400">
                $0<span className="text-lg text-gray-400">/month</span>
              </div>
              
              <ul className="space-y-3">
                {["Create unlimited stories", "Access to all story modes", "Character creation", "Image generation", "Audio narration", "Community support"].map(feature => <li key={feature} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300">{feature}</span>
                  </li>)}
              </ul>

              <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-all duration-200" onClick={() => window.location.href = '/'}>
                Start Creating Stories
              </Button>
            </CardContent>
          </Card>

          {/* Founder Program Card */}
          <Card className="relative overflow-hidden border-yellow-500/50 bg-gradient-to-br from-yellow-900/20 to-orange-900/10">
            <div className="absolute top-4 right-4">
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-3 py-1 rounded-full text-sm font-bold">
                LIMITED TIME
              </span>
            </div>
            <CardHeader>
              <CardTitle className="text-2xl text-yellow-400 flex items-center gap-2">
                <Crown className="w-6 h-6" />
                Founder Program
              </CardTitle>
              <CardDescription className="text-gray-300">
                Become a founding member and shape the future of TaleForge
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {/* Genesis Tier */}
                <div className="p-4 rounded-lg bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-500/30">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold text-purple-400">Genesis Founder</h4>
                    
                  </div>
                  <p className="text-sm text-gray-400 mb-3">Lifetime access + exclusive perks</p>
                  
                </div>

                {/* Pioneer Tier */}
                <div className="p-4 rounded-lg bg-gradient-to-r from-blue-900/30 to-cyan-900/30 border border-blue-500/30">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold text-blue-400">Pioneer Founder</h4>
                    
                  </div>
                  <p className="text-sm text-gray-400 mb-3">Early access + founder benefits</p>
                  
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-400">
                  Founder spots are limited and will never be offered again
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coming Soon Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-8 text-white">Coming Soon</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Premium Plan */}
            <Card className="opacity-70 border-gray-600">
              <CardHeader>
                <CardTitle className="text-xl text-gray-300">Premium</CardTitle>
                <CardDescription>Enhanced features for avid storytellers</CardDescription>
              </CardHeader>
              <CardContent>
                
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>• Priority story generation</li>
                  <li>• Advanced character tools</li>
                  <li>• Custom story themes</li>
                  <li>• Export capabilities</li>
                </ul>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="opacity-70 border-gray-600">
              <CardHeader>
                <CardTitle className="text-xl text-gray-300">Pro</CardTitle>
                <CardDescription>Professional tools for creators</CardDescription>
              </CardHeader>
              <CardContent>
                
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>• Everything in Premium</li>
                  <li>• Commercial usage rights</li>
                  <li>• API access</li>
                  <li>• Priority support</li>
                </ul>
              </CardContent>
            </Card>

            {/* Family Plan */}
            <Card className="opacity-70 border-gray-600">
              <CardHeader>
                <CardTitle className="text-xl text-gray-300">Family</CardTitle>
                <CardDescription>Perfect for families and educators</CardDescription>
              </CardHeader>
              <CardContent>
                
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>• Up to 6 family accounts</li>
                  <li>• Parental controls</li>
                  <li>• Educational resources</li>
                  <li>• Shared story library</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8 text-white">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div className="p-6 rounded-lg bg-gray-900/50 border border-gray-700">
              <h3 className="font-bold text-white mb-2">What's included in the free beta?</h3>
              <p className="text-gray-300">
                During our beta phase, you get full access to all features including unlimited story creation, character development, image generation, and audio narration - completely free.
              </p>
            </div>
            <div className="p-6 rounded-lg bg-gray-900/50 border border-gray-700">
              <h3 className="font-bold text-white mb-2">What are the founder program benefits?</h3>
              <p className="text-gray-300">
                Founders get lifetime access, exclusive features, direct input on development, special recognition, and will never pay subscription fees even when we launch paid plans.
              </p>
            </div>
            <div className="p-6 rounded-lg bg-gray-900/50 border border-gray-700">
              <h3 className="font-bold text-white mb-2">When will paid plans launch?</h3>
              <p className="text-gray-300">
                We're focused on perfecting the core experience during beta. Paid plans will launch once we're confident in delivering exceptional value. Founders will be notified first.
              </p>
            </div>
          </div>
        </div>
      </div>

      <FounderClaimModal isOpen={isFounderModalOpen} onClose={handleModalClose} onSuccess={handleFounderSuccess} remainingSpots={150} selectedTier={selectedTier} />
    </div>;
};

export default EnhancedPricing;
