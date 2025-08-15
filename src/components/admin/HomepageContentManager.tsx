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
  Save,
  X,
  ArrowUp,
  ArrowDown,
  Home,
  BarChart3,
  Type,
  Hash
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface HomepageContentItem {
  id?: string;
  key: string;
  title: string;
  value: string;
  description?: string;
  content_type: 'text' | 'number' | 'html' | 'json';
  is_active: boolean;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

const HomepageContentManager: React.FC = () => {
  const [contentItems, setContentItems] = useState<HomepageContentItem[]>([]);
  const [editingItem, setEditingItem] = useState<HomepageContentItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  // Content type options
  const contentTypeOptions = [
    { value: 'text', label: 'Text', icon: Type },
    { value: 'number', label: 'Number', icon: Hash },
    { value: 'html', label: 'HTML', icon: Type },
    { value: 'json', label: 'JSON', icon: BarChart3 }
  ];

  // New item template
  const newItemTemplate: HomepageContentItem = {
    key: '',
    title: '',
    value: '',
    description: '',
    content_type: 'text',
    is_active: true,
    display_order: 0
  };

  // Get content type styling
  const getContentTypeStyle = (type: string) => {
    switch (type) {
      case 'text':
        return 'bg-blue-500 text-white border-0';
      case 'number':
        return 'bg-green-500 text-white border-0';
      case 'html':
        return 'bg-purple-500 text-white border-0';
      case 'json':
        return 'bg-orange-500 text-white border-0';
      default:
        return 'bg-gray-500 text-white border-0';
    }
  };

  // Get content type icon
  const getContentTypeIcon = (type: string) => {
    const option = contentTypeOptions.find(opt => opt.value === type);
    return option ? option.icon : Type;
  };

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .eq('key', 'homepage_content');

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data && data.length > 0) {
        const contentData = typeof data[0].value === 'string' ? JSON.parse(data[0].value) : data[0].value;
        setContentItems(contentData || []);
      } else {
        // Initialize with default content
        const defaultContent = [
          { id: '1', key: 'stories_created_count', title: 'Stories Created', value: '500+', description: 'Number of stories created on the platform', content_type: 'text' as const, is_active: true, display_order: 1 },
          { id: '2', key: 'countries_count', title: 'Countries', value: '30+', description: 'Number of countries where users are located', content_type: 'text' as const, is_active: true, display_order: 2 },
          { id: '3', key: 'built_by_text', title: 'Built By Text', value: 'Built by', description: 'Text for the third metric section', content_type: 'text' as const, is_active: true, display_order: 3 },
          { id: '4', key: 'built_by_subtitle', title: 'Built By Subtitle', value: 'Parents, Teachers & Kids', description: 'Subtitle for the built by section', content_type: 'text' as const, is_active: true, display_order: 4 },
          { id: '5', key: 'paypal_supporters_count', title: 'PayPal Supporters', value: '150', description: 'Number of PayPal supporters', content_type: 'number' as const, is_active: true, display_order: 5 },
          { id: '6', key: 'paypal_monthly_amount', title: 'PayPal Monthly Amount', value: '45', description: 'Monthly PayPal support amount', content_type: 'number' as const, is_active: true, display_order: 6 },
          { id: '7', key: 'hero_title', title: 'Hero Title', value: 'TALE FORGE', description: 'Main hero section title', content_type: 'text' as const, is_active: true, display_order: 7 },
          { id: '8', key: 'hero_subtitle', title: 'Hero Subtitle', value: 'CREATE MAGICAL STORIES TOGETHER!', description: 'Hero section subtitle', content_type: 'text' as const, is_active: true, display_order: 8 },
          { id: '9', key: 'hero_description', title: 'Hero Description', value: 'Transform your ideas into enchanting stories with AI-powered creativity. Perfect for families, educators, and storytellers of all ages!', description: 'Hero section description', content_type: 'text' as const, is_active: true, display_order: 9 }
        ];
        setContentItems(defaultContent);
        await saveContentToDatabase(defaultContent);
      }
    } catch (error) {
      console.error('Error loading homepage content:', error);
      toast.error('Failed to load homepage content');
      setContentItems([]);
    } finally {
      setLoading(false);
    }
  };

  const saveContentToDatabase = async (items: HomepageContentItem[]) => {
    try {
      const { error } = await supabase
        .from('admin_settings')
        .upsert({
          key: 'homepage_content',
          value: JSON.stringify(items),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'key'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving content to database:', error);
      throw error;
    }
  };

  const updateItemField = async (itemId: string, field: keyof HomepageContentItem, value: any) => {
    try {
      const updatedItems = contentItems.map(item =>
        item.id === itemId ? { ...item, [field]: value } : item
      );
      
      await saveContentToDatabase(updatedItems);
      setContentItems(updatedItems);
      toast.success(`${field} updated successfully`);
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      toast.error(`Failed to update ${field}`);
    }
  };

  const saveItem = async (item: HomepageContentItem) => {
    try {
      let updatedItems: HomepageContentItem[];
      
      if (item.id && contentItems.find(i => i.id === item.id)) {
        // Update existing
        updatedItems = contentItems.map(i => i.id === item.id ? item : i);
        toast.success('Content updated successfully');
      } else {
        // Create new
        const maxOrder = Math.max(...contentItems.map(i => i.display_order), -1);
        const newItem = { ...item, id: Date.now().toString(), display_order: maxOrder + 1 };
        updatedItems = [...contentItems, newItem];
        toast.success('Content created successfully');
      }
      
      await saveContentToDatabase(updatedItems);
      setContentItems(updatedItems);
      setEditingItem(null);
      setIsCreating(false);
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error('Failed to save content');
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content item?')) return;
    
    try {
      const updatedItems = contentItems.filter(item => item.id !== id);
      await saveContentToDatabase(updatedItems);
      setContentItems(updatedItems);
      toast.success('Content deleted successfully');
    } catch (error) {
      console.error('Error deleting content:', error);
      toast.error('Failed to delete content');
    }
  };

  const moveItem = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = contentItems.findIndex(i => i.id === id);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (targetIndex < 0 || targetIndex >= contentItems.length) return;

    const updatedItems = [...contentItems];
    const currentItem = updatedItems[currentIndex];
    const targetItem = updatedItems[targetIndex];
    
    // Swap display orders
    const tempOrder = currentItem.display_order;
    currentItem.display_order = targetItem.display_order;
    targetItem.display_order = tempOrder;
    
    // Sort by display order
    updatedItems.sort((a, b) => a.display_order - b.display_order);

    try {
      await saveContentToDatabase(updatedItems);
      setContentItems(updatedItems);
      toast.success('Content reordered successfully');
    } catch (error) {
      console.error('Error reordering content:', error);
      toast.error('Failed to reorder content');
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Home className="h-6 w-6" />
            Homepage Content Manager
          </h1>
          <p className="text-slate-400">Manage editable content displayed on the homepage</p>
        </div>
        <Button
          onClick={() => {
            setEditingItem({ ...newItemTemplate });
            setIsCreating(true);
          }}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Content Item
        </Button>
      </div>

      {/* Content items list */}
      <div className="space-y-4">
        {contentItems.map((item, index) => {
          const ContentTypeIcon = getContentTypeIcon(item.content_type);
          
          return (
            <Card key={item.id} className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">
                        {item.title || 'Untitled Content'}
                      </h3>
                      
                      {/* Content Type Badge */}
                      <Badge className={`${getContentTypeStyle(item.content_type)} font-medium text-xs px-2 py-0.5`}>
                        <ContentTypeIcon className="h-3 w-3 mr-1" />
                        {item.content_type.toUpperCase()}
                      </Badge>

                      {/* Quick Active Toggle */}
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={item.is_active}
                          onCheckedChange={(checked) => {
                            if (item.id) {
                              updateItemField(item.id, 'is_active', checked);
                            }
                          }}
                          className="scale-75"
                        />
                        <span className={`text-xs font-medium ${item.is_active ? 'text-green-400' : 'text-slate-400'}`}>
                          {item.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-slate-300 text-sm">
                        <span className="font-medium">Key:</span> {item.key}
                      </p>
                      <p className="text-slate-300 text-sm">
                        <span className="font-medium">Value:</span> {item.value}
                      </p>
                      {item.description && (
                        <p className="text-slate-400 text-xs">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {/* Move buttons */}
                    {item.id && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => moveItem(item.id!, 'up')}
                          disabled={index === 0}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => moveItem(item.id!, 'down')}
                          disabled={index === contentItems.length - 1}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    
                    {/* Edit button */}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingItem(item)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    
                    {/* Delete button */}
                    {item.id && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteItem(item.id!)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        
        {contentItems.length === 0 && (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-8 text-center">
              <p className="text-slate-400">No content items created yet</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit/Create Modal */}
      {(editingItem || isCreating) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-slate-800 border-slate-700 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                {isCreating ? 'Create Content Item' : 'Edit Content Item'}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditingItem(null);
                    setIsCreating(false);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-300">Key (unique identifier)</label>
                <Input
                  value={editingItem?.key || ''}
                  onChange={(e) => setEditingItem(prev => prev ? { ...prev, key: e.target.value } : null)}
                  placeholder="e.g., stories_created_count"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-slate-300">Title</label>
                <Input
                  value={editingItem?.title || ''}
                  onChange={(e) => setEditingItem(prev => prev ? { ...prev, title: e.target.value } : null)}
                  placeholder="Display title..."
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-slate-300">Value</label>
                <Textarea
                  value={editingItem?.value || ''}
                  onChange={(e) => setEditingItem(prev => prev ? { ...prev, value: e.target.value } : null)}
                  placeholder="Content value..."
                  rows={3}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-slate-300">Description (optional)</label>
                <Textarea
                  value={editingItem?.description || ''}
                  onChange={(e) => setEditingItem(prev => prev ? { ...prev, description: e.target.value } : null)}
                  placeholder="Description of this content item..."
                  rows={2}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-slate-300">Content Type</label>
                <Select
                  value={editingItem?.content_type || 'text'}
                  onValueChange={(value: 'text' | 'number' | 'html' | 'json') => {
                    setEditingItem(prev => prev ? { ...prev, content_type: value } : null);
                  }}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue placeholder="Select content type..." />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {contentTypeOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <SelectItem 
                          key={option.value} 
                          value={option.value}
                          className="text-white hover:bg-slate-700 focus:bg-slate-700"
                        >
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {option.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-3">
                <label className="text-sm font-medium text-slate-300">Active</label>
                <Switch
                  checked={editingItem?.is_active || false}
                  onCheckedChange={(checked) => setEditingItem(prev => prev ? { ...prev, is_active: checked } : null)}
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setEditingItem(null);
                    setIsCreating(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => editingItem && saveItem(editingItem)}
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

export default HomepageContentManager;