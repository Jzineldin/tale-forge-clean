import React, { useState, useEffect } from 'react';
import { X, Cookie, Shield, BarChart3, Target, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { CookieManager, CookiePreferences } from '@/utils/cookieManager';
import { Link } from "react-router-dom";

interface CookieConsentBannerProps {
  onAccept: () => void;
  onDecline: () => void;
  onCustomize: () => void;
}

const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({
  onAccept,
  onDecline,
  onCustomize
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-700 shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Cookie className="h-6 w-6 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                We use cookies to enhance your experience
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                We use essential cookies to make our site work and optional cookies to improve your experience.
                <br />
                <Link to="/privacy" className="text-indigo-600 hover:text-indigo-500 underline">
                  Learn more in our Privacy Policy
                </Link>
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={onCustomize}
              className="w-full sm:w-auto"
            >
              <Settings className="h-4 w-4 mr-2" />
              Customize
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDecline}
              className="w-full sm:w-auto"
            >
              Decline Optional
            </Button>
            <Button
              size="sm"
              onClick={onAccept}
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700"
            >
              Accept All
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface CookieSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (preferences: CookiePreferences) => void;
  initialPreferences: CookiePreferences;
}

const CookieSettingsModal: React.FC<CookieSettingsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialPreferences
}) => {
  const [preferences, setPreferences] = useState<CookiePreferences>(initialPreferences);

  useEffect(() => {
    setPreferences(initialPreferences);
  }, [initialPreferences]);

  const handleSave = () => {
    onSave(preferences);
    onClose();
  };

  const updatePreference = (key: keyof CookiePreferences, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Cookie className="h-5 w-5 text-amber-500" />
              Cookie Settings
            </CardTitle>
            <CardDescription>
              Manage your cookie preferences. Essential cookies are required for the site to function.
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Essential Cookies */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-500" />
                <h3 className="font-medium">Essential Cookies</h3>
                <Badge variant="secondary">Required</Badge>
              </div>
              <Switch
                checked={preferences.essential}
                disabled={true}
                aria-label="Essential cookies (required)"
              />
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              These cookies are necessary for the website to function and cannot be switched off. 
              They include authentication, security, and basic functionality.
            </p>
          </div>

          <Separator />

          {/* Functional Cookies */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-blue-500" />
                <h3 className="font-medium">Functional Cookies</h3>
                <Badge variant="outline">Optional</Badge>
              </div>
              <Switch
                checked={preferences.functional}
                onCheckedChange={(checked) => updatePreference('functional', checked)}
                aria-label="Functional cookies"
              />
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              These cookies enable enhanced functionality and personalization, such as remembering your 
              theme preference, story settings, and login state.
            </p>
          </div>

          <Separator />

          {/* Analytics Cookies */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-purple-500" />
                <h3 className="font-medium">Analytics Cookies</h3>
                <Badge variant="outline">Optional</Badge>
              </div>
              <Switch
                checked={preferences.analytics}
                onCheckedChange={(checked) => updatePreference('analytics', checked)}
                aria-label="Analytics cookies"
              />
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              These cookies help us understand how visitors interact with our website by collecting 
              anonymous information about usage patterns and performance.
            </p>
          </div>

          <Separator />

          {/* Marketing Cookies */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-orange-500" />
                <h3 className="font-medium">Marketing Cookies</h3>
                <Badge variant="outline">Optional</Badge>
              </div>
              <Switch
                checked={preferences.marketing}
                onCheckedChange={(checked) => updatePreference('marketing', checked)}
                aria-label="Marketing cookies"
              />
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              These cookies are used to deliver relevant advertisements and track the effectiveness 
              of marketing campaigns across websites.
            </p>
          </div>

          <Separator />

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700">
              Save Preferences
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const CookieConsent: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    functional: false,
    analytics: false,
    marketing: false
  });

  useEffect(() => {
    // Check if user has already given consent
    const hasConsent = CookieManager.hasConsent();
    const cookiesEnabled = CookieManager.areCookiesEnabled();
    
    if (cookiesEnabled && !hasConsent) {
      setShowBanner(true);
    }
    
    // Load existing preferences
    const existingPrefs = CookieManager.getCookiePreferences();
    setPreferences(existingPrefs);
  }, []);

  const handleAcceptAll = () => {
    const allPreferences: CookiePreferences = {
      essential: true,
      functional: true,
      analytics: true,
      marketing: true
    };
    
    CookieManager.setConsent(true);
    CookieManager.setCookiePreferences(allPreferences);
    setPreferences(allPreferences);
    setShowBanner(false);
  };

  const handleDeclineOptional = () => {
    const essentialOnly: CookiePreferences = {
      essential: true,
      functional: false,
      analytics: false,
      marketing: false
    };
    
    CookieManager.setConsent(true);
    CookieManager.setCookiePreferences(essentialOnly);
    setPreferences(essentialOnly);
    setShowBanner(false);
  };

  const handleCustomize = () => {
    setShowSettings(true);
  };

  const handleSavePreferences = (newPreferences: CookiePreferences) => {
    CookieManager.setConsent(true);
    CookieManager.setCookiePreferences(newPreferences);
    setPreferences(newPreferences);
    setShowBanner(false);
  };

  return (
    <>
      {showBanner && (
        <CookieConsentBanner
          onAccept={handleAcceptAll}
          onDecline={handleDeclineOptional}
          onCustomize={handleCustomize}
        />
      )}
      
      <CookieSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onSave={handleSavePreferences}
        initialPreferences={preferences}
      />
    </>
  );
};

export default CookieConsent;