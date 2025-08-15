
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface HeaderButtonVisibility {
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

export const useHeaderButtonVisibility = () => {
  const [visibility, setVisibility] = useState<HeaderButtonVisibility>(defaultVisibility);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVisibilitySettings();
    
    // Subscribe to real-time changes
    const subscription = supabase
      .channel('header_visibility_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'admin_settings',
          filter: 'key=eq.header_button_visibility'
        }, 
        (payload) => {
          if (payload.new && typeof payload.new === 'object' && 'value' in payload.new && payload.new.value) {
            try {
              const parsedValue = typeof payload.new.value === 'string' 
                ? JSON.parse(payload.new.value) 
                : payload.new.value;
              setVisibility({ ...defaultVisibility, ...parsedValue });
            } catch (error) {
              console.error('Error parsing real-time visibility update:', error);
            }
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadVisibilitySettings = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('value')
        .eq('key', 'header_button_visibility')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading visibility settings:', error);
        setLoading(false);
        return;
      }

      if (data && typeof data === 'object' && 'value' in data && data.value) {
        const parsedValue = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
        setVisibility({ ...defaultVisibility, ...parsedValue });
      }
    } catch (error) {
      console.error('Error parsing visibility settings:', error);
    } finally {
      setLoading(false);
    }
  };

  return { visibility, loading };
};
