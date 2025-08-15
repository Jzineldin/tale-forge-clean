import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { Wand2, Image, Volume2, Settings, Play, CheckCircle, XCircle, Clock, Zap, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface ModelConfig {
  id: string;
  name: string;
  provider: string;
  type: 'text' | 'image' | 'audio';
  status: 'active' | 'inactive' | 'testing' | 'error';
  isDefault: boolean;
  lastTested: string | null;
  responseTime: number | null;
  errorRate: number;
  settings: Record<string, any>;
}

interface TestResult {
  modelId: string;
  success: boolean;
  responseTime: number;
  output?: string;
  error?: string;
  timestamp: string;
}

const ModelManagementSystem: React.FC = () => {
  const [models, setModels] = useState<ModelConfig[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  
  const [isTestingAll, setIsTestingAll] = useState(false);
  const [newModelForm, setNewModelForm] = useState({
    name: '',
    provider: '',
    type: 'text' as 'text' | 'image' | 'audio',
    apiKey: '',
    endpoint: '',
    settings: '{}'
  });

  // Initialize with default models
  const generateMockModels = (): ModelConfig[] => {
    return [
      {
        id: 'openai-gpt4',
        name: 'GPT-4O Mini',
        provider: 'OpenAI',
        type: 'text',
        status: 'active',
        isDefault: true,
        lastTested: new Date().toISOString(),
        responseTime: 1200,
        errorRate: 2.1,
        settings: {
          temperature: 0.7,
          max_tokens: 1500,
          model: 'gpt-4o-mini'
        }
      },
      {
        id: 'ovh-qwen',
        name: 'Qwen2.5-Coder-32B',
        provider: 'OVH',
        type: 'text',
        status: 'active',
        isDefault: false,
        lastTested: new Date(Date.now() - 3600000).toISOString(),
        responseTime: 2100,
        errorRate: 5.3,
        settings: {
          temperature: 0.7,
          max_tokens: 1500,
          model: 'qwen2.5-coder-32b-instruct'
        }
      },
      {
        id: 'gemini-flash',
        name: 'Gemini 1.5 Flash',
        provider: 'Google',
        type: 'text',
        status: 'inactive',
        isDefault: false,
        lastTested: new Date(Date.now() - 7200000).toISOString(),
        responseTime: 1800,
        errorRate: 1.8,
        settings: {
          temperature: 0.7,
          model: 'gemini-1.5-flash-latest'
        }
      },
      {
        id: 'dalle-3',
        name: 'DALL-E 3',
        provider: 'OpenAI',
        type: 'image',
        status: 'active',
        isDefault: true,
        lastTested: new Date().toISOString(),
        responseTime: 8500,
        errorRate: 3.2,
        settings: {
          quality: 'standard',
          size: '1024x1024',
          model: 'dall-e-3'
        }
      },
      {
        id: 'ovh-sdxl',
        name: 'Stable Diffusion XL',
        provider: 'OVH',
        type: 'image',
        status: 'active',
        isDefault: false,
        lastTested: new Date(Date.now() - 1800000).toISOString(),
        responseTime: 4200,
        errorRate: 8.1,
        settings: {
          steps: 20,
          negative_prompt: 'ugly, blurry, low quality'
        }
      },
      {
        id: 'elevenlabs-tts',
        name: 'ElevenLabs TTS',
        provider: 'ElevenLabs',
        type: 'audio',
        status: 'active',
        isDefault: true,
        lastTested: new Date().toISOString(),
        responseTime: 2800,
        errorRate: 1.2,
        settings: {
          voice: 'nPczCjzI2devNBz1zQrb',
          model: 'eleven_multilingual_v2',
          stability: 0.5,
          similarity_boost: 0.75
        }
      },
      {
        id: 'openai-tts',
        name: 'OpenAI TTS-1',
        provider: 'OpenAI',
        type: 'audio',
        status: 'inactive',
        isDefault: false,
        lastTested: new Date(Date.now() - 86400000).toISOString(),
        responseTime: 3200,
        errorRate: 1.5,
        settings: {
          voice: 'fable',
          speed: 1.0,
          model: 'tts-1'
        }
      }
    ];
  };

  const testModel = async (model: ModelConfig) => {
    const startTime = Date.now();
    
    try {
      let endpoint = '';
      let testPayload = {};

      switch (model.type) {
        case 'text':
          endpoint = 'generate-story-segment';
          testPayload = {
            prompt: 'Test story generation for admin panel',
            testMode: true,
            forceProvider: model.provider.toLowerCase()
          };
          break;
        case 'image':
          endpoint = 'regenerate-image';
          testPayload = {
            prompt: 'A simple test image for admin panel',
            testMode: true,
            forceProvider: model.provider.toLowerCase()
          };
          break;
        case 'audio':
          endpoint = 'test-voice';
          testPayload = {
            text: 'This is a test of the audio generation system.',
            voiceId: model.settings.voice || 'fable',
            testMode: true
          };
          break;
      }

      const { data, error } = await supabase.functions.invoke(endpoint, {
        body: testPayload
      });

      const responseTime = Date.now() - startTime;

      const result: TestResult = {
        modelId: model.id,
        success: !error,
        responseTime,
        timestamp: new Date().toISOString()
      };

      if (data) {
        result.output = JSON.stringify(data).substring(0, 200);
      }

      if (error) {
        result.error = error.message;
      }

      setTestResults(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 results

      // Update model status
      setModels(prev => prev.map(m => 
        m.id === model.id 
          ? { 
              ...m, 
              status: error ? 'error' : 'active',
              lastTested: result.timestamp,
              responseTime
            }
          : m
      ));

      if (error) {
        toast.error(`${model.name} test failed: ${error.message}`);
      } else {
        toast.success(`${model.name} test passed (${responseTime}ms)`);
      }

      return result;
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      const errorMessage = error?.message || error?.toString() || 'Unknown error';
      
      const result: TestResult = {
        modelId: model.id,
        success: false,
        responseTime,
        error: errorMessage,
        timestamp: new Date().toISOString()
      };

      setTestResults(prev => [result, ...prev.slice(0, 9)]);
      
      setModels(prev => prev.map(m => 
        m.id === model.id 
          ? { ...m, status: 'error', lastTested: result.timestamp }
          : m
      ));

      toast.error(`${model.name} test failed: ${errorMessage}`);
      return result;
    }
  };

  const testAllModels = async () => {
    setIsTestingAll(true);
    toast.info('Testing all models...');

    const activeModels = models.filter(m => m.status !== 'inactive');
    
    for (const model of activeModels) {
      setModels(prev => prev.map(m => 
        m.id === model.id ? { ...m, status: 'testing' } : m
      ));
      
      await testModel(model);
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setIsTestingAll(false);
    toast.success('All model tests completed');
  };

  const toggleModelStatus = (modelId: string) => {
    setModels(prev => prev.map(model => 
      model.id === modelId 
        ? { 
            ...model, 
            status: model.status === 'active' ? 'inactive' : 'active' 
          }
        : model
    ));
  };

  const setAsDefault = (modelId: string) => {
    setModels(prev => prev.map(model => ({
      ...model,
      isDefault: model.id === modelId ? true : model.type === prev.find(m => m.id === modelId)?.type ? false : model.isDefault
    })));
    
    const model = models.find(m => m.id === modelId);
    if (model) {
      toast.success(`${model.name} set as default for ${model.type} generation`);
    }
  };

  const addNewModel = () => {
    try {
      const settings = JSON.parse(newModelForm.settings);
      
      const newModel: ModelConfig = {
        id: `${newModelForm.provider.toLowerCase()}-${Date.now()}`,
        name: newModelForm.name,
        provider: newModelForm.provider,
        type: newModelForm.type,
        status: 'inactive',
        isDefault: false,
        lastTested: null,
        responseTime: null,
        errorRate: 0,
        settings
      };

      setModels(prev => [...prev, newModel]);
      setNewModelForm({
        name: '',
        provider: '',
        type: 'text',
        apiKey: '',
        endpoint: '',
        settings: '{}'
      });
      
      toast.success('New model added successfully');
    } catch (error) {
      toast.error('Invalid settings JSON');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'inactive':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      case 'testing':
        return <Clock className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Settings className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'text':
        return <Wand2 className="h-4 w-4" />;
      case 'image':
        return <Image className="h-4 w-4" />;
      case 'audio':
        return <Volume2 className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  useEffect(() => {
    setModels(generateMockModels());
  }, []);

  const groupedModels = models.reduce((acc, model) => {
    if (!acc[model.type]) {
      acc[model.type] = [];
    }
    acc[model.type].push(model);
    return acc;
  }, {} as Record<string, ModelConfig[]>);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Model Management</h2>
        <div className="flex gap-2">
          <Button
            onClick={testAllModels}
            disabled={isTestingAll}
            className="bg-green-600 hover:bg-green-700"
          >
            {isTestingAll ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Testing All...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Test All Models
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Model Groups */}
      {Object.entries(groupedModels).map(([type, typeModels]) => (
        <Card key={type} className="bg-slate-800 border-purple-600">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              {getTypeIcon(type)}
              {type.charAt(0).toUpperCase() + type.slice(1)} Generation Models
            </CardTitle>
            <CardDescription className="text-purple-200">
              Configure and manage {type} generation AI models
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {typeModels.map((model) => (
                <div key={model.id} className="bg-slate-700 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(model.status)}
                      <div>
                        <h3 className="text-white font-semibold flex items-center gap-2">
                          {model.name}
                          {model.isDefault && (
                            <Badge className="bg-purple-600 text-white text-xs">DEFAULT</Badge>
                          )}
                        </h3>
                        <p className="text-purple-200 text-sm">{model.provider}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={model.status === 'active'}
                        onCheckedChange={() => toggleModelStatus(model.id)}
                        disabled={model.status === 'testing'}
                      />
                      <Button
                        onClick={() => testModel(model)}
                        disabled={model.status === 'testing'}
                        variant="outline"
                        size="sm"
                        className="bg-slate-600 border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
                      >
                        {model.status === 'testing' ? 'Testing...' : 'Test'}
                      </Button>
                      {!model.isDefault && (
                        <Button
                          onClick={() => setAsDefault(model.id)}
                          variant="outline"
                          size="sm"
                          className="bg-slate-600 border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white"
                        >
                          Set Default
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-3">
                    <div className="bg-slate-800 p-3 rounded">
                      <div className="text-purple-200 text-sm">Response Time</div>
                      <div className="text-white font-bold">
                        {model.responseTime ? `${model.responseTime}ms` : 'N/A'}
                      </div>
                    </div>
                    <div className="bg-slate-800 p-3 rounded">
                      <div className="text-purple-200 text-sm">Error Rate</div>
                      <div className="text-white font-bold">{model.errorRate}%</div>
                    </div>
                    <div className="bg-slate-800 p-3 rounded">
                      <div className="text-purple-200 text-sm">Last Tested</div>
                      <div className="text-white font-bold text-xs">
                        {model.lastTested 
                          ? new Date(model.lastTested).toLocaleString()
                          : 'Never'
                        }
                      </div>
                    </div>
                  </div>

                  <details className="mt-3">
                    <summary className="text-purple-300 cursor-pointer text-sm">Model Settings</summary>
                    <pre className="text-xs text-purple-200 mt-2 p-3 bg-slate-900 rounded overflow-x-auto">
                      {JSON.stringify(model.settings, null, 2)}
                    </pre>
                  </details>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Add New Model */}
      <Card className="bg-slate-800 border-purple-600">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Add New Model
          </CardTitle>
          <CardDescription className="text-purple-200">
            Configure a new AI model for testing and deployment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-white">Model Name</Label>
              <Input
                value={newModelForm.name}
                onChange={(e) => setNewModelForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., GPT-4 Turbo"
                className="bg-slate-700 border-purple-600 text-white"
              />
            </div>
            <div>
              <Label className="text-white">Provider</Label>
              <Input
                value={newModelForm.provider}
                onChange={(e) => setNewModelForm(prev => ({ ...prev, provider: e.target.value }))}
                placeholder="e.g., OpenAI"
                className="bg-slate-700 border-purple-600 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-white">Type</Label>
              <Select
                value={newModelForm.type}
                onValueChange={(value: 'text' | 'image' | 'audio') => 
                  setNewModelForm(prev => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger className="bg-slate-700 border-purple-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text Generation</SelectItem>
                  <SelectItem value="image">Image Generation</SelectItem>
                  <SelectItem value="audio">Audio Generation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-white">API Key</Label>
              <Input
                type="password"
                value={newModelForm.apiKey}
                onChange={(e) => setNewModelForm(prev => ({ ...prev, apiKey: e.target.value }))}
                placeholder="API Key"
                className="bg-slate-700 border-purple-600 text-white"
              />
            </div>
          </div>

          <div>
            <Label className="text-white">Model Settings (JSON)</Label>
            <Textarea
              value={newModelForm.settings}
              onChange={(e) => setNewModelForm(prev => ({ ...prev, settings: e.target.value }))}
              placeholder='{"temperature": 0.7, "max_tokens": 1500}'
              className="bg-slate-700 border-purple-600 text-white"
              rows={3}
            />
          </div>

          <Button
            onClick={addNewModel}
            className="bg-purple-600 hover:bg-purple-700"
            disabled={!newModelForm.name || !newModelForm.provider}
          >
            Add Model
          </Button>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card className="bg-slate-800 border-purple-600">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Recent Test Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {testResults.map((result, index) => {
                const model = models.find(m => m.id === result.modelId);
                return (
                  <div key={index} className="bg-slate-700 p-3 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {result.success ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <div>
                        <div className="text-white font-medium">{model?.name}</div>
                        <div className="text-purple-200 text-sm">
                          {new Date(result.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-bold">{result.responseTime}ms</div>
                      {result.error && (
                        <div className="text-red-400 text-sm">{result.error}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ModelManagementSystem; 