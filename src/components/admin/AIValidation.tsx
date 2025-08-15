import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { 
  CheckCircle, XCircle, AlertCircle, RefreshCw, 
  TrendingUp, TrendingDown, Activity, Brain,
  Eye, Users, Zap, Shield, FileText, Settings
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface QualityMetrics {
  storyCoherence: number;
  characterConsistency: number;
  choiceDiversity: number;
  visualConsistency: number;
  ageAppropriateness: number;
  genreAdherence: number;
  overallScore: number;
  timestamp: string;
}

interface PerformanceMetrics {
  avgResponseTime: number;
  tokenUsage: number;
  retryRate: number;
  successRate: number;
  contextWindowUtilization: number;
  cacheHitRate: number;
}

interface ValidationResult {
  testName: string;
  status: 'passed' | 'failed' | 'warning';
  score: number;
  details: string;
  timestamp: string;
}

interface CharacterMetrics {
  characterName: string;
  appearanceFrequency: number;
  consistencyScore: number;
  developmentScore: number;
}

const AIValidation: React.FC = () => {
  const [qualityMetrics, setQualityMetrics] = useState<QualityMetrics | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [characterMetrics, setCharacterMetrics] = useState<CharacterMetrics[]>([]);
  const [historicalData, setHistoricalData] = useState<QualityMetrics[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>('all');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [alertThresholds, setAlertThresholds] = useState({
    coherence: 70,
    consistency: 75,
    diversity: 60,
    appropriateness: 85
  });

  useEffect(() => {
    fetchLatestMetrics();
    fetchHistoricalData();
    const interval = setInterval(fetchLatestMetrics, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [selectedAgeGroup, selectedGenre]);

  const fetchLatestMetrics = async () => {
    try {
      // Fetch quality metrics
      const { data: qualityData, error: qualityError } = await supabase
        .from('ai_quality_metrics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!qualityError && qualityData) {
        setQualityMetrics({
          storyCoherence: qualityData.story_coherence,
          characterConsistency: qualityData.character_consistency,
          choiceDiversity: qualityData.choice_diversity,
          visualConsistency: qualityData.visual_consistency,
          ageAppropriateness: qualityData.age_appropriateness,
          genreAdherence: qualityData.genre_adherence,
          overallScore: qualityData.overall_score,
          timestamp: qualityData.created_at
        });
      }

      // Fetch performance metrics
      const { data: perfData, error: perfError } = await supabase
        .from('ai_performance_metrics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!perfError && perfData) {
        setPerformanceMetrics({
          avgResponseTime: perfData.avg_response_time,
          tokenUsage: perfData.token_usage,
          retryRate: perfData.retry_rate,
          successRate: perfData.success_rate,
          contextWindowUtilization: perfData.context_utilization,
          cacheHitRate: perfData.cache_hit_rate
        });
      }

      // Fetch validation results
      const { data: validationData, error: validationError } = await supabase
        .from('ai_validation_results')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (!validationError && validationData) {
        setValidationResults(validationData.map(v => ({
          testName: v.test_name,
          status: v.status,
          score: v.score,
          details: v.details,
          timestamp: v.created_at
        })));
      }

      // Fetch character metrics
      const { data: charData, error: charError } = await supabase
        .from('character_metrics')
        .select('*')
        .order('consistency_score', { ascending: false })
        .limit(5);

      if (!charError && charData) {
        setCharacterMetrics(charData.map(c => ({
          characterName: c.character_name,
          appearanceFrequency: c.appearance_frequency,
          consistencyScore: c.consistency_score,
          developmentScore: c.development_score
        })));
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  const fetchHistoricalData = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_quality_metrics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(24); // Last 24 data points

      if (!error && data) {
        setHistoricalData(data.map(d => ({
          storyCoherence: d.story_coherence,
          characterConsistency: d.character_consistency,
          choiceDiversity: d.choice_diversity,
          visualConsistency: d.visual_consistency,
          ageAppropriateness: d.age_appropriateness,
          genreAdherence: d.genre_adherence,
          overallScore: d.overall_score,
          timestamp: d.created_at
        })).reverse());
      }
    } catch (error) {
      console.error('Error fetching historical data:', error);
    }
  };

  const runValidationTests = async () => {
    setIsRunningTests(true);
    try {
      const { data, error } = await supabase.functions.invoke('run-ai-validation', {
        body: { 
          ageGroup: selectedAgeGroup,
          genre: selectedGenre,
          comprehensive: true
        }
      });

      if (!error) {
        await fetchLatestMetrics();
        await fetchHistoricalData();
      }
    } catch (error) {
      console.error('Error running validation tests:', error);
    } finally {
      setIsRunningTests(false);
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  const radarData = qualityMetrics ? [
    {
      metric: 'Coherence',
      value: qualityMetrics.storyCoherence,
      fullMark: 100
    },
    {
      metric: 'Character',
      value: qualityMetrics.characterConsistency,
      fullMark: 100
    },
    {
      metric: 'Diversity',
      value: qualityMetrics.choiceDiversity,
      fullMark: 100
    },
    {
      metric: 'Visual',
      value: qualityMetrics.visualConsistency,
      fullMark: 100
    },
    {
      metric: 'Age',
      value: qualityMetrics.ageAppropriateness,
      fullMark: 100
    },
    {
      metric: 'Genre',
      value: qualityMetrics.genreAdherence,
      fullMark: 100
    }
  ] : [];

  const performanceData = performanceMetrics ? [
    { name: 'Response Time', value: performanceMetrics.avgResponseTime, unit: 'ms' },
    { name: 'Token Usage', value: performanceMetrics.tokenUsage, unit: 'tokens' },
    { name: 'Success Rate', value: performanceMetrics.successRate, unit: '%' },
    { name: 'Cache Hit Rate', value: performanceMetrics.cacheHitRate, unit: '%' }
  ] : [];

  const checkAlertThresholds = () => {
    if (!qualityMetrics) return [];
    
    const alerts = [];
    if (qualityMetrics.storyCoherence < alertThresholds.coherence) {
      alerts.push({ metric: 'Story Coherence', value: qualityMetrics.storyCoherence, threshold: alertThresholds.coherence });
    }
    if (qualityMetrics.characterConsistency < alertThresholds.consistency) {
      alerts.push({ metric: 'Character Consistency', value: qualityMetrics.characterConsistency, threshold: alertThresholds.consistency });
    }
    if (qualityMetrics.choiceDiversity < alertThresholds.diversity) {
      alerts.push({ metric: 'Choice Diversity', value: qualityMetrics.choiceDiversity, threshold: alertThresholds.diversity });
    }
    if (qualityMetrics.ageAppropriateness < alertThresholds.appropriateness) {
      alerts.push({ metric: 'Age Appropriateness', value: qualityMetrics.ageAppropriateness, threshold: alertThresholds.appropriateness });
    }
    return alerts;
  };

  const alerts = checkAlertThresholds();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">AI Validation Dashboard</h2>
          <p className="text-muted-foreground">Real-time monitoring of AI storytelling performance</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={runValidationTests}
            disabled={isRunningTests}
            className="flex items-center gap-2"
          >
            {isRunningTests ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Activity className="w-4 h-4" />
            )}
            Run Validation Tests
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Configure
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Alert className="border-yellow-500 bg-yellow-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Quality Alerts:</strong>
            <ul className="mt-2 space-y-1">
              {alerts.map((alert, index) => (
                <li key={index}>
                  {alert.metric}: {alert.value.toFixed(1)}% (threshold: {alert.threshold}%)
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Overall Score */}
      {qualityMetrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Overall Quality Score</span>
              <Badge variant={qualityMetrics.overallScore >= 80 ? 'default' : 'destructive'}>
                {qualityMetrics.overallScore >= 80 ? 'Healthy' : 'Needs Attention'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-5xl font-bold">
                <span className={getScoreColor(qualityMetrics.overallScore)}>
                  {qualityMetrics.overallScore.toFixed(1)}%
                </span>
              </div>
              <Progress value={qualityMetrics.overallScore} className="flex-1" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Tabs */}
      <Tabs defaultValue="quality" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="quality">Quality Metrics</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="characters">Characters</TabsTrigger>
          <TabsTrigger value="validation">Validation</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        {/* Quality Metrics Tab */}
        <TabsContent value="quality" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Quality Radar</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar
                      name="Score"
                      dataKey="value"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.6}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Individual Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {qualityMetrics && (
                  <>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Story Coherence</span>
                        <span className={`text-sm font-bold ${getScoreColor(qualityMetrics.storyCoherence)}`}>
                          {qualityMetrics.storyCoherence.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={qualityMetrics.storyCoherence} />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Character Consistency</span>
                        <span className={`text-sm font-bold ${getScoreColor(qualityMetrics.characterConsistency)}`}>
                          {qualityMetrics.characterConsistency.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={qualityMetrics.characterConsistency} />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Choice Diversity</span>
                        <span className={`text-sm font-bold ${getScoreColor(qualityMetrics.choiceDiversity)}`}>
                          {qualityMetrics.choiceDiversity.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={qualityMetrics.choiceDiversity} />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Visual Consistency</span>
                        <span className={`text-sm font-bold ${getScoreColor(qualityMetrics.visualConsistency)}`}>
                          {qualityMetrics.visualConsistency.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={qualityMetrics.visualConsistency} />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Age Appropriateness</span>
                        <span className={`text-sm font-bold ${getScoreColor(qualityMetrics.ageAppropriateness)}`}>
                          {qualityMetrics.ageAppropriateness.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={qualityMetrics.ageAppropriateness} />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Genre Adherence</span>
                        <span className={`text-sm font-bold ${getScoreColor(qualityMetrics.genreAdherence)}`}>
                          {qualityMetrics.genreAdherence.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={qualityMetrics.genreAdherence} />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {performanceMetrics && (
              <>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                    <Zap className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{performanceMetrics.avgResponseTime.toFixed(0)}ms</div>
                    <p className="text-xs text-muted-foreground">
                      {performanceMetrics.avgResponseTime < 1000 ? 'Excellent' : 'Needs optimization'}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Token Usage</CardTitle>
                    <Brain className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{performanceMetrics.tokenUsage.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      Context: {performanceMetrics.contextWindowUtilization.toFixed(0)}% utilized
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                    <Shield className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{performanceMetrics.successRate.toFixed(1)}%</div>
                    <p className="text-xs text-muted-foreground">
                      Retry rate: {performanceMetrics.retryRate.toFixed(1)}%
                    </p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Characters Tab */}
        <TabsContent value="characters" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Character Consistency Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {characterMetrics.map((char, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-semibold">{char.characterName}</h4>
                      <div className="mt-2 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Appearance Frequency</span>
                          <span>{(char.appearanceFrequency * 100).toFixed(0)}%</span>
                        </div>
                        <Progress value={char.appearanceFrequency * 100} className="h-2" />
                        
                        <div className="flex justify-between text-sm">
                          <span>Consistency Score</span>
                          <span className={getScoreColor(char.consistencyScore)}>
                            {char.consistencyScore.toFixed(0)}%
                          </span>
                        </div>
                        <Progress value={char.consistencyScore} className="h-2" />
                        
                        <div className="flex justify-between text-sm">
                          <span>Development Score</span>
                          <span className={getScoreColor(char.developmentScore)}>
                            {char.developmentScore.toFixed(0)}%
                          </span>
                        </div>
                        <Progress value={char.developmentScore} className="h-2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Validation Tab */}
        <TabsContent value="validation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Validation Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {validationResults.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result.status)}
                      <div>
                        <p className="font-medium">{result.testName}</p>
                        <p className="text-sm text-muted-foreground">{result.details}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${getScoreColor(result.score)}`}>
                        {result.score.toFixed(0)}%
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(result.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quality Trends Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                  />
                  <YAxis domain={[0, 100]} />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="storyCoherence" 
                    stroke="#8884d8" 
                    name="Coherence"
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="characterConsistency" 
                    stroke="#82ca9d" 
                    name="Character"
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="choiceDiversity" 
                    stroke="#ffc658" 
                    name="Diversity"
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="visualConsistency" 
                    stroke="#ff7c7c" 
                    name="Visual"
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="ageAppropriateness" 
                    stroke="#8dd1e1" 
                    name="Age"
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="overallScore" 
                    stroke="#d084d0" 
                    name="Overall"
                    strokeWidth={3}
                    strokeDasharray="5 5"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIValidation;