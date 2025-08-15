import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CookieManager, cookieUtils } from '@/utils/cookieManager';

export const CookieDemo: React.FC = () => {
  const [cookies, setCookies] = useState<Record<string, string>>({});
  const [preferences, setPreferences] = useState(CookieManager.getCookiePreferences());
  const [hasConsent, setHasConsent] = useState(CookieManager.hasConsent());

  useEffect(() => {
    updateCookieDisplay();
  }, []);

  const updateCookieDisplay = () => {
    setCookies(CookieManager.getAllCookies());
    setPreferences(CookieManager.getCookiePreferences());
    setHasConsent(CookieManager.hasConsent());
  };

  const testThemeCookie = () => {
    cookieUtils.setTheme('dark');
    updateCookieDisplay();
  };

  const testRememberMeCookie = () => {
    cookieUtils.setRememberMe(true);
    updateCookieDisplay();
  };

  const testUserPreferences = () => {
    cookieUtils.setUserPreferences({
      language: 'en',
      fontSize: 'large',
      autoSave: true,
      lastVisited: new Date().toISOString()
    });
    updateCookieDisplay();
  };

  const clearAllCookies = () => {
    Object.keys(cookies).forEach(cookieName => {
      CookieManager.deleteCookie(cookieName);
    });
    updateCookieDisplay();
  };

  const enableFunctionalCookies = () => {
    const newPrefs = { ...preferences, functional: true };
    CookieManager.setCookiePreferences(newPrefs);
    updateCookieDisplay();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🍪 Cookie Manager Demo
          </CardTitle>
          <CardDescription>
            Test the cookie functionality and see how preferences are managed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status Indicators */}
          <div className="flex gap-4">
            <Badge variant={hasConsent ? "default" : "secondary"}>
              Consent: {hasConsent ? "Given" : "Not Given"}
            </Badge>
            <Badge variant={preferences.functional ? "default" : "secondary"}>
              Functional: {preferences.functional ? "Enabled" : "Disabled"}
            </Badge>
            <Badge variant={CookieManager.areCookiesEnabled() ? "default" : "destructive"}>
              Cookies: {CookieManager.areCookiesEnabled() ? "Supported" : "Not Supported"}
            </Badge>
          </div>

          {/* Test Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={testThemeCookie} variant="outline">
              Set Theme Cookie
            </Button>
            <Button onClick={testRememberMeCookie} variant="outline">
              Set Remember Me
            </Button>
            <Button onClick={testUserPreferences} variant="outline">
              Set User Preferences
            </Button>
            <Button onClick={enableFunctionalCookies} variant="outline">
              Enable Functional Cookies
            </Button>
            <Button onClick={clearAllCookies} variant="destructive">
              Clear All Cookies
            </Button>
            <Button onClick={updateCookieDisplay} variant="outline">
              Refresh Display
            </Button>
          </div>

          {/* Cookie Display */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Current Cookies:</h3>
            {Object.keys(cookies).length === 0 ? (
              <p className="text-muted-foreground">No cookies set</p>
            ) : (
              <div className="grid gap-2">
                {Object.entries(cookies).map(([name, value]) => (
                  <div key={name} className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="font-mono text-sm">{name}</span>
                    <span className="font-mono text-sm text-muted-foreground max-w-xs truncate">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Preferences Display */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Cookie Preferences:</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Essential: <Badge variant={preferences.essential ? "default" : "secondary"}>{preferences.essential ? "Enabled" : "Disabled"}</Badge></div>
              <div>Functional: <Badge variant={preferences.functional ? "default" : "secondary"}>{preferences.functional ? "Enabled" : "Disabled"}</Badge></div>
              <div>Analytics: <Badge variant={preferences.analytics ? "default" : "secondary"}>{preferences.analytics ? "Enabled" : "Disabled"}</Badge></div>
              <div>Marketing: <Badge variant={preferences.marketing ? "default" : "secondary"}>{preferences.marketing ? "Enabled" : "Disabled"}</Badge></div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">How to Test:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Click "Enable Functional Cookies" to allow preference cookies</li>
              <li>Try setting theme, remember me, and user preference cookies</li>
              <li>Check the browser's developer tools → Application → Cookies to see the actual cookies</li>
              <li>Test the cookie consent banner by clearing all cookies and refreshing</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CookieDemo; 