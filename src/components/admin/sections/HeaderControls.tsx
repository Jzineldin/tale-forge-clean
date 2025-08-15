
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Eye, EyeOff, Save } from 'lucide-react';

interface HeaderButtonVisibility {
  showHome: boolean;
  showMyStories: boolean;
  showDiscover: boolean;
  showPricing: boolean;
  showCreateStory: boolean;
}

const defaultVisibility: HeaderButtonVisibility = {
  showHome: true,
  showMyStories: true,
  showDiscover: true,
  showPricing: true,
  showCreateStory: true,
};

const HeaderControls: React.FC = () => {
  const [visibility, setVisibility] = useState<HeaderButtonVisibility>(defaultVisibility);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadHeaderSettings();
  }, []);

  const loadHeaderSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('value')
        .eq('key', 'header_button_visibility')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading header settings:', error);
        return;
      }

      if (data?.value) {
        const parsedValue = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
        setVisibility({ ...defaultVisibility, ...parsedValue });
      }
    } catch (error) {
      console.error('Error parsing header settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveHeaderSettings = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('admin_settings')
        .upsert({
          key: 'header_button_visibility',
          value: JSON.stringify(visibility),
          updated_at: new Date().toISOString(),
        });

      if (error) {
        throw error;
      }

      toast.success('Header button visibility settings saved successfully');
    } catch (error: any) {
      console.error('Error saving header settings:', error);
      toast.error('Failed to save settings: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (key: keyof HeaderButtonVisibility) => {
    setVisibility(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Header Button Controls</h2>
        <Button onClick={saveHeaderSettings} disabled={saving} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Navigation Button Visibility
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
              <Label htmlFor="home-toggle" className="text-white">
                Home Button
              </Label>
              <Switch
                id="home-toggle"
                checked={visibility.showHome}
                onCheckedChange={() => handleToggle('showHome')}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
              <Label htmlFor="stories-toggle" className="text-white">
                My Stories Button
              </Label>
              <Switch
                id="stories-toggle"
                checked={visibility.showMyStories}
                onCheckedChange={() => handleToggle('showMyStories')}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
              <Label htmlFor="discover-toggle" className="text-white">
                Discover Button
              </Label>
              <Switch
                id="discover-toggle"
                checked={visibility.showDiscover}
                onCheckedChange={() => handleToggle('showDiscover')}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
              <Label htmlFor="pricing-toggle" className="text-white">
                Pricing Button
              </Label>
              <Switch
                id="pricing-toggle"
                checked={visibility.showPricing}
                onCheckedChange={() => handleToggle('showPricing')}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
              <Label htmlFor="create-story-toggle" className="text-white">
                Creating Story Indicator
              </Label>
              <Switch
                id="create-story-toggle"
                checked={visibility.showCreateStory}
                onCheckedChange={() => handleToggle('showCreateStory')}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3 text-slate-300">
            <EyeOff className="h-5 w-5 mt-1 flex-shrink-0" />
            <div>
              <p className="font-medium mb-2">Global Settings</p>
              <p className="text-sm">
                These settings control button visibility for all users regardless of their login status. 
                Changes apply immediately across the entire application.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HeaderControls;
