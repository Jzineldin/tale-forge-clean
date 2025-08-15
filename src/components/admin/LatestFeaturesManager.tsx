
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  EyeOff,
  Save,
  X,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface FeatureSlide {
  id?: string;
  title: string;
  description: string;
  badge?: string;
  order_index: number;
  is_active: boolean;
  created_at?: string;
}

const LatestFeaturesManager: React.FC = () => {
  const [slides, setSlides] = useState<FeatureSlide[]>([]);
  const [isCardVisible, setIsCardVisible] = useState(true);
  const [editingSlide, setEditingSlide] = useState<FeatureSlide | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  // Predefined badge options
  const badgeOptions = [
    { value: 'none', label: 'No Badge' },
    { value: 'NEW', label: 'NEW' },
    { value: 'UPDATE', label: 'UPDATE' },
    { value: 'FEATURE', label: 'FEATURE' },
    { value: 'IMPROVEMENT', label: 'IMPROVEMENT' },
    { value: 'FIX', label: 'FIX' },
    { value: 'BETA', label: 'BETA' },
    { value: 'COMING SOON', label: 'COMING SOON' },
    { value: 'HOT', label: 'HOT' },
    { value: 'POPULAR', label: 'POPULAR' }
  ];

  // New slide template
  const newSlideTemplate: FeatureSlide = {
    title: '',
    description: '',
    badge: '',
    order_index: 0,
    is_active: true
  };

  // Get badge styling based on badge type
  const getBadgeStyle = (badge: string) => {
    switch (badge) {
      case 'NEW':
        return 'bg-emerald-500 text-white border-0 hover:bg-emerald-600';
      case 'UPDATE':
        return 'bg-blue-500 text-white border-0 hover:bg-blue-600';
      case 'FEATURE':
        return 'bg-purple-500 text-white border-0 hover:bg-purple-600';
      case 'IMPROVEMENT':
        return 'bg-amber-500 text-white border-0 hover:bg-amber-600';
      case 'FIX':
        return 'bg-red-500 text-white border-0 hover:bg-red-600';
      case 'BETA':
        return 'bg-orange-500 text-white border-0 hover:bg-orange-600';
      case 'COMING SOON':
        return 'bg-slate-500 text-white border-0 hover:bg-slate-600';
      case 'HOT':
        return 'bg-pink-500 text-white border-0 hover:bg-pink-600';
      case 'POPULAR':
        return 'bg-indigo-500 text-white border-0 hover:bg-indigo-600';
      default:
        return 'bg-gray-500 text-white border-0 hover:bg-gray-600';
    }
  };

  useEffect(() => {
    loadFeatures();
  }, []);

  const loadFeatures = async () => {
    try {
      // Load ALL slides in admin (not just active ones)
      const { data: slidesData, error: slidesError } = await supabase
        .from('latest_features')
        .select('*')
        .order('order_index', { ascending: true });

      if (slidesError) throw slidesError;
      
      // Properly cast and set the slides data
      setSlides((slidesData as FeatureSlide[]) || []);

      // Load card visibility setting
      const { data: settingData } = await supabase
        .from('admin_settings')
        .select('value')
        .eq('key', 'latest_features_visible')
        .single();

      console.log('LatestFeaturesManager: settingData loaded:', settingData);

      if (settingData) {
        setIsCardVisible(settingData.value === 'true');
        console.log('LatestFeaturesManager: Card visibility set to:', settingData.value === 'true');
      } else {
        console.log('LatestFeaturesManager: No visibility setting found, defaulting to false');
        setIsCardVisible(false);
      }
    } catch (error) {
      console.error('Error loading features:', error);
      setSlides([]);
    } finally {
      setLoading(false);
    }
  };

  const saveCardVisibility = async (visible: boolean) => {
    console.log('saveCardVisibility called with:', visible);
    try {
      // Since we know the record exists (because we got the error), just update it
      const { data, error } = await supabase
        .from('admin_settings')
        .update({ value: visible.toString() })
        .eq('key', 'latest_features_visible');
      
      console.log('Update result:', { data, error });
      
      if (error) throw error;
      
      setIsCardVisible(visible);
      console.log('Card visibility updated to:', visible);
    } catch (error) {
      console.error('Error saving visibility:', error);
      
      // If update fails, fall back to upsert with onConflict
      try {
        console.log('Trying upsert as fallback...');
        const { data: upsertData, error: upsertError } = await supabase
          .from('admin_settings')
          .upsert({ 
            key: 'latest_features_visible', 
            value: visible.toString() 
          }, {
            onConflict: 'key'
          });
        
        console.log('Fallback upsert result:', { upsertData, upsertError });
        
        if (!upsertError) {
          setIsCardVisible(visible);
          console.log('Card visibility updated to (via fallback):', visible);
        }
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
    }
  };

  const updateSlideField = async (slideId: string, field: keyof FeatureSlide, value: any) => {
    try {
      const { error } = await supabase
        .from('latest_features')
        .update({ [field]: value })
        .eq('id', slideId);
      
      if (error) throw error;
      loadFeatures();
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
    }
  };

  const saveSlide = async (slide: FeatureSlide) => {
    try {
      if (slide.id) {
        // Update existing
        const { error } = await supabase
          .from('latest_features')
          .update(slide)
          .eq('id', slide.id);
        if (error) throw error;
      } else {
        // Create new
        const maxOrder = Math.max(...slides.map(s => s.order_index), -1);
        const { error } = await supabase
          .from('latest_features')
          .insert({ ...slide, order_index: maxOrder + 1 });
        if (error) throw error;
      }
      
      loadFeatures();
      setEditingSlide(null);
      setIsCreating(false);
    } catch (error) {
      console.error('Error saving slide:', error);
    }
  };

  const deleteSlide = async (id: string) => {
    if (!confirm('Are you sure you want to delete this slide?')) return;
    
    try {
      const { error } = await supabase
        .from('latest_features')
        .delete()
        .eq('id', id);
      if (error) throw error;
      loadFeatures();
    } catch (error) {
      console.error('Error deleting slide:', error);
    }
  };

  const moveSlide = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = slides.findIndex(s => s.id === id);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (targetIndex < 0 || targetIndex >= slides.length) return;

    // Ensure both slides have valid IDs before proceeding
    const currentSlide = slides[currentIndex];
    const targetSlide = slides[targetIndex];
    
    if (!currentSlide.id || !targetSlide.id) {
      console.error('Cannot reorder slides: missing IDs');
      return;
    }

    const updates = [
      { id: currentSlide.id, order_index: targetSlide.order_index },
      { id: targetSlide.id, order_index: currentSlide.order_index }
    ];

    try {
      for (const update of updates) {
        await supabase
          .from('latest_features')
          .update({ order_index: update.order_index })
          .eq('id', update.id);
      }
      loadFeatures();
    } catch (error) {
      console.error('Error reordering slides:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with visibility toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Latest Features Manager</h1>
          <p className="text-slate-400">Manage the latest features showcase on the homepage</p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-slate-300">Card Visible:</span>
          <Switch
            checked={isCardVisible}
            onCheckedChange={saveCardVisibility}
          />
          {isCardVisible ? (
            <Eye className="h-5 w-5 text-green-400" />
          ) : (
            <EyeOff className="h-5 w-5 text-red-400" />
          )}
        </div>
      </div>

      {/* Create new slide button */}
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setEditingSlide({ ...newSlideTemplate });
            setIsCreating(true);
          }}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Feature Slide
        </Button>
      </div>

      {/* Slides list */}
      <div className="space-y-4">
        {slides.map((slide, index) => (
          <Card key={slide.id} className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">
                      {slide.title || 'Untitled Slide'}
                    </h3>
                    
                    {/* Quick Badge Selector */}
                    <Select
                      value={slide.badge === '' || !slide.badge ? 'none' : slide.badge}
                      onValueChange={(value) => {
                        if (slide.id) {
                          const badgeValue = value === 'none' ? '' : value;
                          updateSlideField(slide.id, 'badge', badgeValue);
                        }
                      }}
                    >
                      <SelectTrigger className="w-auto h-7 px-2 bg-slate-700 border-slate-600 text-white text-xs">
                        <SelectValue>
                          {slide.badge ? (
                            <Badge className={`${getBadgeStyle(slide.badge)} font-medium text-xs px-2 py-0.5`}>
                              {slide.badge}
                            </Badge>
                          ) : (
                            <span className="text-slate-400 text-xs">No Badge</span>
                          )}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {badgeOptions.map((option) => (
                          <SelectItem 
                            key={option.value} 
                            value={option.value}
                            className="text-white hover:bg-slate-700 focus:bg-slate-700"
                          >
                            {option.value !== 'none' ? (
                              <Badge className={`${getBadgeStyle(option.value)} font-medium text-xs px-2 py-0.5`}>
                                {option.value}
                              </Badge>
                            ) : (
                              <span>No Badge</span>
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Quick Active Toggle */}
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={slide.is_active}
                        onCheckedChange={(checked) => {
                          if (slide.id) {
                            updateSlideField(slide.id, 'is_active', checked);
                          }
                        }}
                        className="scale-75"
                      />
                      <span className={`text-xs font-medium ${slide.is_active ? 'text-green-400' : 'text-slate-400'}`}>
                        {slide.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <p className="text-slate-300 text-sm">
                    {slide.description || 'No description'}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  {/* Move buttons - only show if slide has ID */}
                  {slide.id && (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => moveSlide(slide.id!, 'up')}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => moveSlide(slide.id!, 'down')}
                        disabled={index === slides.length - 1}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  
                  {/* Edit button */}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingSlide(slide)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  
                  {/* Delete button - only show if slide has ID */}
                  {slide.id && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteSlide(slide.id!)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {slides.length === 0 && (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-8 text-center">
              <p className="text-slate-400">No feature slides created yet</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit/Create Modal */}
      {(editingSlide || isCreating) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-slate-800 border-slate-700 w-full max-w-lg mx-4">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                {isCreating ? 'Create Feature Slide' : 'Edit Feature Slide'}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditingSlide(null);
                    setIsCreating(false);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-300">Title</label>
                <Input
                  value={editingSlide?.title || ''}
                  onChange={(e) => setEditingSlide(prev => prev ? { ...prev, title: e.target.value } : null)}
                  placeholder="Feature title..."
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-slate-300">Description</label>
                <Textarea
                  value={editingSlide?.description || ''}
                  onChange={(e) => setEditingSlide(prev => prev ? { ...prev, description: e.target.value } : null)}
                  placeholder="Feature description..."
                  rows={3}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-slate-300">Badge</label>
                <Select
                  value={editingSlide?.badge === '' || !editingSlide?.badge ? 'none' : editingSlide.badge}
                  onValueChange={(value) => {
                    const badgeValue = value === 'none' ? '' : value;
                    setEditingSlide(prev => prev ? { ...prev, badge: badgeValue } : null);
                  }}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue placeholder="Select a badge..." />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {badgeOptions.map((option) => (
                      <SelectItem 
                        key={option.value} 
                        value={option.value}
                        className="text-white hover:bg-slate-700 focus:bg-slate-700"
                      >
                        {option.value !== 'none' ? (
                          <Badge className={`${getBadgeStyle(option.value)} font-medium text-xs px-2 py-0.5 opacity-90`}>
                            {option.value}
                          </Badge>
                        ) : (
                          <span>No Badge</span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-3">
                <label className="text-sm font-medium text-slate-300">Active</label>
                <Switch
                  checked={editingSlide?.is_active || false}
                  onCheckedChange={(checked) => setEditingSlide(prev => prev ? { ...prev, is_active: checked } : null)}
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setEditingSlide(null);
                    setIsCreating(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => editingSlide && saveSlide(editingSlide)}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default LatestFeaturesManager;
