import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Users, 
  MapPin, 
  Target, 
  Lightbulb, 
  Plus, 
  X,
  Save,
  Eye,
  Edit3
} from 'lucide-react';

interface Character {
  id: string;
  name: string;
  role: string;
  traits: string[];
  description: string;
}

interface PlotPoint {
  id: string;
  title: string;
  description: string;
  order: number;
  completed: boolean;
}

interface StoryOutline {
  title: string;
  genre: string;
  targetAge: string;
  summary: string;
  characters: Character[];
  plotPoints: PlotPoint[];
  themes: string[];
  settings: string[];
}

interface StoryOutlineEditorProps {
  initialOutline?: Partial<StoryOutline>;
  onSave: (outline: StoryOutline) => void;
  onPreview?: (outline: StoryOutline) => void;
  className?: string;
}

const THEME_SUGGESTIONS = [
  'Friendship', 'Adventure', 'Courage', 'Family', 'Discovery', 
  'Magic', 'Growth', 'Kindness', 'Mystery', 'Dreams',
  'Nature', 'Teamwork', 'Perseverance', 'Wonder', 'Hope'
];

const PLOT_STRUCTURE_TEMPLATES = {
  threePart: [
    { title: 'Beginning', description: 'Introduce characters and setting' },
    { title: 'Middle', description: 'Present the main challenge or adventure' },
    { title: 'End', description: 'Resolve the conflict and conclude the story' }
  ],
  heroJourney: [
    { title: 'Ordinary World', description: 'Hero in their normal environment' },
    { title: 'Call to Adventure', description: 'Hero faces a problem or challenge' },
    { title: 'Crossing the Threshold', description: 'Hero commits to the adventure' },
    { title: 'Tests and Trials', description: 'Hero faces challenges and makes allies' },
    { title: 'The Ordeal', description: 'Hero confronts their greatest fear' },
    { title: 'The Reward', description: 'Hero survives and gains something' },
    { title: 'The Return', description: 'Hero returns transformed' }
  ],
  mystery: [
    { title: 'The Mystery', description: 'Present the puzzle or problem' },
    { title: 'Investigation', description: 'Gather clues and evidence' },
    { title: 'Red Herrings', description: 'False leads and misdirection' },
    { title: 'Revelation', description: 'The truth is discovered' },
    { title: 'Resolution', description: 'Mystery is solved and order restored' }
  ]
};

export const StoryOutlineEditor: React.FC<StoryOutlineEditorProps> = ({
  initialOutline = {},
  onSave,
  onPreview,
  className = ""
}) => {
  const [outline, setOutline] = useState<StoryOutline>({
    title: initialOutline.title || '',
    genre: initialOutline.genre || '',
    targetAge: initialOutline.targetAge || '',
    summary: initialOutline.summary || '',
    characters: initialOutline.characters || [],
    plotPoints: initialOutline.plotPoints || [],
    themes: initialOutline.themes || [],
    settings: initialOutline.settings || []
  });

  const [newTheme, setNewTheme] = useState('');
  const [newSetting, setNewSetting] = useState('');

  // Character management
  const addCharacter = () => {
    const newCharacter: Character = {
      id: Date.now().toString(),
      name: '',
      role: '',
      traits: [],
      description: ''
    };
    setOutline(prev => ({
      ...prev,
      characters: [...prev.characters, newCharacter]
    }));
  };

  const updateCharacter = (id: string, updates: Partial<Character>) => {
    setOutline(prev => ({
      ...prev,
      characters: prev.characters.map(char => 
        char.id === id ? { ...char, ...updates } : char
      )
    }));
  };

  const removeCharacter = (id: string) => {
    setOutline(prev => ({
      ...prev,
      characters: prev.characters.filter(char => char.id !== id)
    }));
  };

  // Plot point management
  const addPlotPoint = () => {
    const newPlotPoint: PlotPoint = {
      id: Date.now().toString(),
      title: '',
      description: '',
      order: outline.plotPoints.length + 1,
      completed: false
    };
    setOutline(prev => ({
      ...prev,
      plotPoints: [...prev.plotPoints, newPlotPoint]
    }));
  };

  const updatePlotPoint = (id: string, updates: Partial<PlotPoint>) => {
    setOutline(prev => ({
      ...prev,
      plotPoints: prev.plotPoints.map(point => 
        point.id === id ? { ...point, ...updates } : point
      )
    }));
  };

  const removePlotPoint = (id: string) => {
    setOutline(prev => ({
      ...prev,
      plotPoints: prev.plotPoints.filter(point => point.id !== id)
    }));
  };

  const applyTemplate = (templateKey: keyof typeof PLOT_STRUCTURE_TEMPLATES) => {
    const template = PLOT_STRUCTURE_TEMPLATES[templateKey];
    const newPlotPoints = template.map((point, index) => ({
      id: `template-${Date.now()}-${index}`,
      title: point.title,
      description: point.description,
      order: index + 1,
      completed: false
    }));
    
    setOutline(prev => ({
      ...prev,
      plotPoints: newPlotPoints
    }));
  };

  // Theme management
  const addTheme = (theme: string) => {
    if (theme && !outline.themes.includes(theme)) {
      setOutline(prev => ({
        ...prev,
        themes: [...prev.themes, theme]
      }));
      setNewTheme('');
    }
  };

  const removeTheme = (theme: string) => {
    setOutline(prev => ({
      ...prev,
      themes: prev.themes.filter(t => t !== theme)
    }));
  };

  // Setting management
  const addSetting = (setting: string) => {
    if (setting && !outline.settings.includes(setting)) {
      setOutline(prev => ({
        ...prev,
        settings: [...prev.settings, setting]
      }));
      setNewSetting('');
    }
  };

  const removeSetting = (setting: string) => {
    setOutline(prev => ({
      ...prev,
      settings: prev.settings.filter(s => s !== setting)
    }));
  };

  return (
    <div className={`max-w-6xl mx-auto p-6 ${className}`}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-2xl">
              <BookOpen className="w-6 h-6 mr-2" />
              Story Outline Editor
            </CardTitle>
            <div className="flex gap-2">
              {onPreview && (
                <Button
                  onClick={() => onPreview(outline)}
                  variant="outline"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
              )}
              <Button
                onClick={() => onSave(outline)}
                className="bg-gradient-to-r from-blue-600 to-purple-600"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Outline
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="characters">Characters</TabsTrigger>
              <TabsTrigger value="plot">Plot Structure</TabsTrigger>
              <TabsTrigger value="themes">Themes & Settings</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Story Title</Label>
                    <Input
                      id="title"
                      value={outline.title}
                      onChange={(e) => setOutline(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter your story title..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="genre">Genre</Label>
                    <Input
                      id="genre"
                      value={outline.genre}
                      onChange={(e) => setOutline(prev => ({ ...prev, genre: e.target.value }))}
                      placeholder="e.g., Fantasy, Adventure, Mystery..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="targetAge">Target Age</Label>
                    <Input
                      id="targetAge"
                      value={outline.targetAge}
                      onChange={(e) => setOutline(prev => ({ ...prev, targetAge: e.target.value }))}
                      placeholder="e.g., 6-8 years, 9-12 years..."
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="summary">Story Summary</Label>
                  <textarea
                    id="summary"
                    value={outline.summary}
                    onChange={(e) => setOutline(prev => ({ ...prev, summary: e.target.value }))}
                    placeholder="Write a brief summary of your story..."
                    className="w-full h-32 p-3 border rounded-lg resize-none"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Characters Tab */}
            <TabsContent value="characters" className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Characters ({outline.characters.length})
                </h3>
                <Button onClick={addCharacter}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Character
                </Button>
              </div>

              <div className="grid gap-4">
                {outline.characters.map((character) => (
                  <Card key={character.id} className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <Badge variant="outline">Character {outline.characters.indexOf(character) + 1}</Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeCharacter(character.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Character Name</Label>
                        <Input
                          value={character.name}
                          onChange={(e) => updateCharacter(character.id, { name: e.target.value })}
                          placeholder="Character name..."
                        />
                      </div>

                      <div>
                        <Label>Role in Story</Label>
                        <Input
                          value={character.role}
                          onChange={(e) => updateCharacter(character.id, { role: e.target.value })}
                          placeholder="e.g., Protagonist, Sidekick, Mentor..."
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Label>Character Description</Label>
                        <textarea
                          value={character.description}
                          onChange={(e) => updateCharacter(character.id, { description: e.target.value })}
                          placeholder="Describe the character's appearance, personality, and background..."
                          className="w-full h-20 p-2 border rounded resize-none"
                        />
                      </div>
                    </div>
                  </Card>
                ))}

                {outline.characters.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No characters added yet</p>
                    <p className="text-sm">Click "Add Character" to get started</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Plot Structure Tab */}
            <TabsContent value="plot" className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Plot Structure ({outline.plotPoints.length} points)
                </h3>
                <div className="flex gap-2">
                  <select
                    onChange={(e) => e.target.value && applyTemplate(e.target.value as keyof typeof PLOT_STRUCTURE_TEMPLATES)}
                    className="px-3 py-2 border rounded-lg text-sm"
                    defaultValue=""
                  >
                    <option value="">Apply Template</option>
                    <option value="threePart">3-Part Structure</option>
                    <option value="heroJourney">Hero's Journey</option>
                    <option value="mystery">Mystery Structure</option>
                  </select>
                  <Button onClick={addPlotPoint}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Plot Point
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {outline.plotPoints
                  .sort((a, b) => a.order - b.order)
                  .map((plotPoint, index) => (
                    <Card key={plotPoint.id} className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">#{index + 1}</Badge>
                          <input
                            type="checkbox"
                            checked={plotPoint.completed}
                            onChange={(e) => updatePlotPoint(plotPoint.id, { completed: e.target.checked })}
                            className="rounded"
                          />
                          <span className="text-sm text-gray-500">Completed</span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removePlotPoint(plotPoint.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <Label>Plot Point Title</Label>
                          <Input
                            value={plotPoint.title}
                            onChange={(e) => updatePlotPoint(plotPoint.id, { title: e.target.value })}
                            placeholder="Brief title for this plot point..."
                          />
                        </div>

                        <div>
                          <Label>Description</Label>
                          <textarea
                            value={plotPoint.description}
                            onChange={(e) => updatePlotPoint(plotPoint.id, { description: e.target.value })}
                            placeholder="Detailed description of what happens in this part of the story..."
                            className="w-full h-20 p-2 border rounded resize-none"
                          />
                        </div>
                      </div>
                    </Card>
                  ))}

                {outline.plotPoints.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No plot points added yet</p>
                    <p className="text-sm">Add plot points or apply a template to structure your story</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Themes & Settings Tab */}
            <TabsContent value="themes" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Themes */}
                <div>
                  <h3 className="text-lg font-semibold flex items-center mb-4">
                    <Lightbulb className="w-5 h-5 mr-2" />
                    Story Themes
                  </h3>

                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        value={newTheme}
                        onChange={(e) => setNewTheme(e.target.value)}
                        placeholder="Add a theme..."
                        onKeyPress={(e) => e.key === 'Enter' && addTheme(newTheme)}
                      />
                      <Button onClick={() => addTheme(newTheme)}>Add</Button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {THEME_SUGGESTIONS.map((theme) => (
                        <Button
                          key={theme}
                          size="sm"
                          variant="outline"
                          onClick={() => addTheme(theme)}
                          disabled={outline.themes.includes(theme)}
                          className="text-xs"
                        >
                          {theme}
                        </Button>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <Label>Selected Themes:</Label>
                      <div className="flex flex-wrap gap-2">
                        {outline.themes.map((theme) => (
                          <Badge
                            key={theme}
                            className="cursor-pointer"
                            onClick={() => removeTheme(theme)}
                          >
                            {theme} <X className="w-3 h-3 ml-1" />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Settings */}
                <div>
                  <h3 className="text-lg font-semibold flex items-center mb-4">
                    <MapPin className="w-5 h-5 mr-2" />
                    Story Settings
                  </h3>

                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        value={newSetting}
                        onChange={(e) => setNewSetting(e.target.value)}
                        placeholder="Add a setting..."
                        onKeyPress={(e) => e.key === 'Enter' && addSetting(newSetting)}
                      />
                      <Button onClick={() => addSetting(newSetting)}>Add</Button>
                    </div>

                    <div className="space-y-2">
                      <Label>Story Locations:</Label>
                      <div className="flex flex-wrap gap-2">
                        {outline.settings.map((setting) => (
                          <Badge
                            key={setting}
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => removeSetting(setting)}
                          >
                            {setting} <X className="w-3 h-3 ml-1" />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Notes Tab */}
            <TabsContent value="notes" className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold flex items-center mb-4">
                  <Edit3 className="w-5 h-5 mr-2" />
                  Story Notes & Ideas
                </h3>
                <textarea
                  placeholder="Use this space for additional notes, ideas, research, or anything else related to your story..."
                  className="w-full h-64 p-4 border rounded-lg resize-none"
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};