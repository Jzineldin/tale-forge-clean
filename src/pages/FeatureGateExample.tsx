import React from 'react';
import { FeatureGate } from '@/components/FeatureGate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UsageIndicator } from '@/components/UsageIndicator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Crown, Sparkles, Users } from 'lucide-react';

const FeatureGateExample: React.FC = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Feature Gate Examples</h1>
      
      {/* Current Subscription Status */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Your Current Subscription</h2>
        <UsageIndicator />
      </div>
      
      <Tabs defaultValue="premium">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="premium" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Premium Features
          </TabsTrigger>
          <TabsTrigger value="family" className="flex items-center gap-2">
            <Users className="w-4 h-4" /> Family Features
          </TabsTrigger>
          <TabsTrigger value="pro" className="flex items-center gap-2">
            <Crown className="w-4 h-4" /> Pro Features
          </TabsTrigger>
        </TabsList>
        
        {/* Premium Features */}
        <TabsContent value="premium">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Premium Feature 1 */}
            <FeatureGate requiredTier="Premium" feature="premium_voice">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                    Premium Voice Narration
                  </CardTitle>
                  <CardDescription>
                    Access to high-quality voice narration for your stories
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>You have access to premium voice narration! Choose from our library of professional voices.</p>
                </CardContent>
              </Card>
            </FeatureGate>
            
            {/* Premium Feature 2 */}
            <FeatureGate requiredTier="Premium" feature="pdf_export">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                    PDF Export
                  </CardTitle>
                  <CardDescription>
                    Export your stories as beautifully formatted PDF documents
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>You have access to PDF export! Create professional-looking documents from your stories.</p>
                </CardContent>
              </Card>
            </FeatureGate>
          </div>
        </TabsContent>
        
        {/* Family Features */}
        <TabsContent value="family">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Family Feature 1 */}
            <FeatureGate requiredTier="Premium" feature="advanced_editing">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-500" />
                    Multi-Child Accounts
                  </CardTitle>
                  <CardDescription>
                    Create up to 4 child accounts under your family subscription
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>You have access to multi-child accounts! Create separate accounts for each child.</p>
                </CardContent>
              </Card>
            </FeatureGate>
            
            {/* Family Feature 2 */}
            <FeatureGate requiredTier="Premium" feature="audio_export">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-500" />
                    Parental Controls
                  </CardTitle>
                  <CardDescription>
                    Set content restrictions and monitor your children's activity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>You have access to parental controls! Ensure your children have a safe experience.</p>
                </CardContent>
              </Card>
            </FeatureGate>
          </div>
        </TabsContent>
        
        {/* Pro Features */}
        <TabsContent value="pro">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pro Feature 1 */}
            <FeatureGate requiredTier="Pro" feature="unlimited_stories">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-yellow-500" />
                    Advanced AI Models
                  </CardTitle>
                  <CardDescription>
                    Access to our most advanced AI models for story generation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>You have access to advanced AI models! Generate more sophisticated and nuanced stories.</p>
                </CardContent>
              </Card>
            </FeatureGate>
            
            {/* Pro Feature 2 */}
            <FeatureGate requiredTier="Pro" feature="api_access">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-yellow-500" />
                    API Access
                  </CardTitle>
                  <CardDescription>
                    Programmatic access to Tale-Forge's story generation capabilities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>You have access to our API! Integrate Tale-Forge into your own applications.</p>
                </CardContent>
              </Card>
            </FeatureGate>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Usage Examples */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4">How to Use Feature Gates</h2>
        <Card>
          <CardHeader>
            <CardTitle>Code Examples</CardTitle>
            <CardDescription>
              Here's how to use the FeatureGate component in your code
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-slate-900 text-slate-50 p-4 rounded-md overflow-x-auto">
{`// Basic usage
<FeatureGate requiredTier="Premium">
  <YourPremiumFeature />
</FeatureGate>

// With custom fallback
<FeatureGate 
  requiredTier="Pro"
  fallback={<p>You need Pro to access this feature</p>}
>
  <YourProFeature />
</FeatureGate>

// Without upgrade message
<FeatureGate 
  requiredTier="Family"
  showUpgrade={false}
>
  <YourFamilyFeature />
</FeatureGate>

// Check for specific feature
<FeatureGate 
  requiredTier="Premium"
  feature="voice_narration"
>
  <VoiceNarrationFeature />
</FeatureGate>`}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FeatureGateExample;