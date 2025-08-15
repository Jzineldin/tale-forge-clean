import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface HomepageContentItem {
  id?: string;
  key: string;
  title: string;
  value: string;
  description?: string;
  content_type: 'text' | 'number' | 'html' | 'json';
  is_active: boolean;
  display_order: number;
}

export const useHomepageContent = () => {
  const [content, setContent] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getContentValue = (key: string, defaultValue: string = '') => {
    return content[key] || defaultValue;
  };

  useEffect(() => {
    const loadContent = async () => {
      try {
        const { data, error } = await supabase
          .from('admin_settings')
          .select('value')
          .eq('key', 'homepage_content')
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data?.value) {
          const contentData = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
          const contentMap: Record<string, string> = {};
          
          contentData.forEach((item: HomepageContentItem) => {
            if (item.is_active) {
              contentMap[item.key] = item.value;
            }
          });
          
          setContent(contentMap);
        } else {
          // Set default values if no content found
          setContent({
            stories_created_count: '500+',
            countries_count: '30+',
            built_by_text: 'Built by',
            built_by_subtitle: 'Parents, Teachers & Kids',
            paypal_supporters_count: '150',
            paypal_monthly_amount: '45',
            hero_title: 'TALE FORGE',
            hero_subtitle: 'CREATE MAGICAL STORIES TOGETHER!',
            hero_description: 'Transform your ideas into enchanting stories with AI-powered creativity. Perfect for families, educators, and storytellers of all ages!'
          });
        }
      } catch (err) {
        console.error('Error loading homepage content:', err);
        setError(err instanceof Error ? err.message : 'Failed to load content');
        // Set default values on error
        setContent({
          stories_created_count: '500+',
          countries_count: '30+',
          built_by_text: 'Built by',
          built_by_subtitle: 'Parents, Teachers & Kids',
          paypal_supporters_count: '150',
          paypal_monthly_amount: '45',
          hero_title: 'TALE FORGE',
          hero_subtitle: 'CREATE MAGICAL STORIES TOGETHER!',
          hero_description: 'Transform your ideas into enchanting stories with AI-powered creativity. Perfect for families, educators, and storytellers of all ages!'
        });
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, []);

  return {
    content,
    getContentValue,
    loading,
    error
  };
};