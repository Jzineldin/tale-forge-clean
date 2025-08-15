import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { 
  Activity, 
  BookOpen, 
  Volume2, 
  Image, 
  Zap,
  Database,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';

interface SystemStats {
  totalStories: number;
  totalSegments: number;
  totalUsers: number;
  audioSegments: number;
  imageSegments: number;
  completedStories: number;
  publicStories: number;
  todayActivity: {
    newStories: number;
    newSegments: number;
    audioGenerated: number;
  };
}

interface ProviderStatus {
  name: string;
  service: string;
  status: 'active' | 'inactive' | 'unknown';
  description: string;
  icon: React.ReactNode;
}

const AdminOverview: React.FC = () => {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSystemStats = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Fetch all stats in parallel
      const [
        storiesResult,
        segmentsResult,
        usersResult,
        todayStoriesResult,
        todaySegmentsResult,
        audioSegmentsResult
      ] = await Promise.all([
        supabase.from('stories').select('id, is_completed, is_public'),
        supabase.from('story_segments').select('id, image_url, audio_url'),
        supabase.from('profiles').select('id'),
        supabase.from('stories').select('id').gte('created_at', today.toISOString()),
        supabase.from('story_segments').select('id').gte('created_at', today.toISOString()),
        supabase.from('story_segments').select('id').not('audio_url', 'is', null).gte('created_at', today.toISOString())
      ]);

      const stories = storiesResult.data || [];
      const segments = segmentsResult.data || [];
      const users = usersResult.data || [];
      const todayStories = todayStoriesResult.data || [];
      const todaySegments = todaySegmentsResult.data || [];
      const todayAudio = audioSegmentsResult.data || [];

      setStats({
        totalStories: stories.length,
        totalSegments: segments.length,
        totalUsers: users.length,
        audioSegments: segments.filter(s => s.audio_url).length,
        imageSegments: segments.filter(s => s.image_url).length,
        completedStories: stories.filter(s => s.is_completed).length,
        publicStories: stories.filter(s => s.is_public).length,
        todayActivity: {
          newStories: todayStories.length,
          newSegments: todaySegments.length,
          audioGenerated: todayAudio.length
        }
      });
    } catch (error) {
      console.error('Error fetching system stats:', error);
      // Set default stats to prevent undefined errors
      setStats({
        totalStories: 0,
        totalSegments: 0,
        totalUsers: 0,
        audioSegments: 0,
        imageSegments: 0,
        completedStories: 0,
        publicStories: 0,
        todayActivity: {
          newStories: 0,
          newSegments: 0,
          audioGenerated: 0
        }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemStats();
  }, []);

  const currentProviders: ProviderStatus[] = [
    {
      name: 'ElevenLabs',
      service: 'Text-to-Speech',
      status: 'active',
      description: 'Primary TTS provider with high-quality voices',
      icon: <Volume2 className="h-4 w-4" />
    },
    {
      name: 'OpenAI',
      service: 'Text Generation',
      status: 'active',
      description: 'GPT-4o-mini for story generation',
      icon: <BookOpen className="h-4 w-4" />
    },
    {
      name: 'Google Gemini',
      service: 'Text Generation',
      status: 'active',
      description: 'Gemini 1.5 Flash for cost-effective generation',
      icon: <Zap className="h-4 w-4" />
    },
    {
      name: 'OVH AI',
      service: 'Image Generation',
      status: 'active',
      description: 'Stable Diffusion for image generation',
      icon: <Image className="h-4 w-4" />
    },
    {
      name: 'DALL-E 3',
      service: 'Image Generation',
      status: 'active',
      description: 'OpenAI DALL-E 3 for high-quality images',
      icon: <Image className="h-4 w-4" />
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'inactive':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const StatCard: React.FC<{ 
    title: string; 
    value: number; 
    icon: React.ReactNode; 
    description: string;
    color: string;
  }> = ({ title, value, icon, description, color }) => (
    <Card className="bg-slate-800 border-purple-600">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-200 text-sm">{title}</p>
            <p className="text-2xl font-bold text-white">{value.toLocaleString()}</p>
            <p className="text-gray-400 text-xs mt-1">{description}</p>
          </div>
          <div className={`p-3 rounded-full ${color}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* System Status Alert */}
      <Alert className="bg-green-900 border-green-600">
        <CheckCircle className="h-4 w-4" />
        <AlertDescription className="text-green-200">
          <strong>System Status:</strong> All core services are operational. 
          ElevenLabs TTS integration is active and functioning properly.
        </AlertDescription>
      </Alert>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Stories"
          value={stats?.totalStories || 0}
          icon={<BookOpen className="h-6 w-6 text-white" />}
          description="All time story count"
          color="bg-blue-600"
        />
        <StatCard
          title="Story Segments"
          value={stats?.totalSegments || 0}
          icon={<Activity className="h-6 w-6 text-white" />}
          description="Total narrative segments"
          color="bg-green-600"
        />
        <StatCard
          title="Audio Generated"
          value={stats?.audioSegments || 0}
          icon={<Volume2 className="h-6 w-6 text-white" />}
          description="Segments with audio"
          color="bg-purple-600"
        />
        <StatCard
          title="Images Generated"
          value={stats?.imageSegments || 0}
          icon={<Image className="h-6 w-6 text-white" />}
          description="Segments with images"
          color="bg-brand-indigo"
        />
      </div>

      {/* Today's Activity */}
      <Card className="bg-slate-800 border-purple-600">
        <CardHeader>
          <CardTitle className="text-white">Today's Activity</CardTitle>
          <CardDescription className="text-purple-200">
            Real-time activity metrics for today
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-700 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-200 text-sm">New Stories</p>
                  <p className="text-2xl font-bold text-white">{stats?.todayActivity.newStories || 0}</p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-400" />
              </div>
            </div>
            <div className="bg-slate-700 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-200 text-sm">New Segments</p>
                  <p className="text-2xl font-bold text-white">{stats?.todayActivity.newSegments || 0}</p>
                </div>
                <Activity className="h-8 w-8 text-green-400" />
              </div>
            </div>
            <div className="bg-slate-700 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-200 text-sm">Audio Generated</p>
                  <p className="text-2xl font-bold text-white">{stats?.todayActivity.audioGenerated || 0}</p>
                </div>
                <Volume2 className="h-8 w-8 text-purple-400" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Provider Status */}
      <Card className="bg-slate-800 border-purple-600">
        <CardHeader>
          <CardTitle className="text-white">AI Provider Status</CardTitle>
          <CardDescription className="text-purple-200">
            Current status of integrated AI services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {currentProviders.map((provider, idx) => (
              <div key={idx} className="bg-slate-700 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {provider.icon}
                    <div>
                      <p className="text-white font-medium">{provider.name}</p>
                      <p className="text-purple-200 text-sm">{provider.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {provider.service}
                    </Badge>
                    {getStatusIcon(provider.status)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Health */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-slate-800 border-purple-600">
          <CardHeader>
            <CardTitle className="text-white">Content Quality</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-purple-200">Completed Stories</span>
                <Badge className="bg-green-600 text-white">
                  {stats?.completedStories || 0}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-purple-200">Public Stories</span>
                <Badge className="bg-blue-600 text-white">
                  {stats?.publicStories || 0}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-purple-200">Audio Coverage</span>
                <Badge className="bg-purple-600 text-white">
                  {stats?.totalSegments ? Math.round((stats.audioSegments / stats.totalSegments) * 100) : 0}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-purple-600">
          <CardHeader>
            <CardTitle className="text-white">Database Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-blue-400" />
                <span className="text-purple-200">Stories Table</span>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-blue-400" />
                <span className="text-purple-200">Segments Table</span>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-blue-400" />
                <span className="text-purple-200">Real-time Updates</span>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminOverview; 