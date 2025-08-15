import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';

interface ConfigItem {
  key: string;
  value: any;
  description: string;
  type: 'string' | 'number' | 'boolean' | 'json';
}

const Config: React.FC = () => {
  const [config, setConfig] = useState<ConfigItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    try {
      // In a real application, this would fetch actual configuration from an API
      // For now, we'll use sample data
      setConfig([
        {
          key: 'max_story_length',
          value: 5000,
          description: 'Maximum story length in characters',
          type: 'number'
        },
        {
          key: 'enable_ai_features',
          value: true,
          description: 'Enable AI-powered features',
          type: 'boolean'
        },
        {
          key: 'default_theme',
          value: 'dark',
          description: 'Default theme for new users',
          type: 'string'
        },
        {
          key: 'api_rate_limit',
          value: 100,
          description: 'Maximum API requests per minute',
          type: 'number'
        },
        {
          key: 'maintenance_mode',
          value: false,
          description: 'Enable maintenance mode',
          type: 'boolean'
        },
        {
          key: 'allowed_file_types',
          value: 'jpg,png,gif,webp',
          description: 'Allowed file types for uploads',
          type: 'string'
        },
        {
          key: 'story_generation_params',
          value: '{"temperature": 0.7, "max_tokens": 2000}',
          description: 'Parameters for story generation',
          type: 'json'
        }
      ]);
    } catch (error) {
      console.error('Error loading config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfigChange = (key: string, value: any) => {
    setConfig(prevConfig => 
      prevConfig.map(item => 
        item.key === key ? { ...item, value } : item
      )
    );
  };

  const handleSaveConfig = async () => {
    setSaving(true);
    try {
      // In a real application, this would save the configuration to an API
      console.log('Saving configuration:', config);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Configuration saved successfully!');
    } catch (error) {
      console.error('Error saving config:', error);
      alert('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const renderConfigInput = (item: ConfigItem) => {
    switch (item.type) {
      case 'boolean':
        return (
          <input
            type="checkbox"
            checked={item.value}
            onChange={(e) => handleConfigChange(item.key, e.target.checked)}
            className="h-5 w-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
          />
        );
      case 'number':
        return (
          <input
            type="number"
            value={item.value}
            onChange={(e) => handleConfigChange(item.key, Number(e.target.value))}
            className="bg-slate-700 text-white rounded px-3 py-2 w-full md:w-64"
          />
        );
      case 'json':
        return (
          <textarea
            value={typeof item.value === 'string' ? item.value : JSON.stringify(item.value, null, 2)}
            onChange={(e) => handleConfigChange(item.key, e.target.value)}
            className="bg-slate-700 text-white rounded px-3 py-2 w-full md:w-64 h-24 font-mono text-sm"
          />
        );
      default:
        return (
          <input
            type="text"
            value={item.value}
            onChange={(e) => handleConfigChange(item.key, e.target.value)}
            className="bg-slate-700 text-white rounded px-3 py-2 w-full md:w-64"
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Configuration</h2>
        <button
          onClick={handleSaveConfig}
          disabled={saving || loading}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
      
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-2 text-gray-400">Loading configuration...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {config.map((item) => (
            <div key={item.key} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-800 rounded-lg">
              <div className="mb-2 md:mb-0">
                <p className="text-white font-medium">{item.key}</p>
                <p className="text-sm text-gray-400">{item.description}</p>
              </div>
              <div className="flex items-center space-x-2">
                {renderConfigInput(item)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Config;