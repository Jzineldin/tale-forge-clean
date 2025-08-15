import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, Heart, Brain, Sparkles, Shield, Target, MessageSquare, 
  Users, Zap, BookOpen, Star, TrendingUp, X, Plus, ChevronRight 
} from 'lucide-react';
import { UserCharacter } from '@/hooks/useUserCharacters';
import { toast } from 'sonner';

interface CharacterBuilderProps {
  character?: UserCharacter | null;
  onSave: (character: ExpandedCharacterData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  maxCharacters?: number;
  currentCharacterCount?: number;
}

export interface ExpandedCharacterData {
  // Basic Info
  name: string;
  role: 'protagonist' | 'sidekick' | 'companion' | 'mentor' | 'rival' | 'custom';
  description?: string;
  
  // Personality
  traits: string[];
  personalityType?: 'brave' | 'shy' | 'curious' | 'wise' | 'mischievous' | 'serious' | 'cheerful' | 'mysterious';
  emotionalRange?: string[];
  
  // Speech & Dialogue
  speechPattern?: 'formal' | 'casual' | 'poetic' | 'simple' | 'technical' | 'humorous' | 'cryptic';
  catchphrases?: string[];
  vocabularyLevel?: 'simple' | 'moderate' | 'advanced';
  
  // Motivations & Goals
  motivations?: string[];
  goals?: string[];
  fears?: string[];
  
  // Abilities & Skills
  strengths?: string[];
  weaknesses?: string[];
  specialAbilities?: string[];
  
  // Background
  backstory?: string;
  family?: string;
  homeLocation?: string;
  
  // Relationships
  relationships?: {
    characterName: string;
    relationshipType: 'friend' | 'rival' | 'mentor' | 'student' | 'family' | 'romantic' | 'neutral';
    description?: string;
  }[];
  
  // Story Integration
  importanceLevel?: 'primary' | 'secondary' | 'tertiary';
  appearanceFrequency?: 'constant' | 'frequent' | 'moderate' | 'occasional';
  plotRole?: 'driver' | 'reactor' | 'observer' | 'catalyst';
  
  // Character Arc
  developmentArc?: {
    startingState: string;
    desiredEndState: string;
    growthType: 'linear' | 'transformative' | 'cyclical' | 'redemptive';
  };
}

const PERSONALITY_TRAITS = {
  positive: ['Brave', 'Kind', 'Curious', 'Loyal', 'Creative', 'Optimistic', 'Determined', 'Wise', 'Funny', 'Caring', 'Honest', 'Patient'],
  neutral: ['Quiet', 'Observant', 'Practical', 'Independent', 'Cautious', 'Analytical', 'Reserved', 'Methodical'],
  challenging: ['Stubborn', 'Impulsive', 'Competitive', 'Perfectionist', 'Skeptical', 'Rebellious']
};

const MOTIVATIONS = [
  'Protect loved ones', 'Seek adventure', 'Gain knowledge', 'Find belonging', 
  'Prove themselves', 'Help others', 'Discover truth', 'Achieve greatness',
  'Make friends', 'Overcome fears', 'Right wrongs', 'Have fun'
];

const FEARS = [
  'Being alone', 'Failure', 'The dark', 'Losing control', 'Being forgotten',
  'Making mistakes', 'Disappointing others', 'The unknown', 'Being powerless',
  'Rejection', 'Change', 'Responsibility'
];

const STRENGTHS = [
  'Problem-solving', 'Leadership', 'Empathy', 'Creativity', 'Physical strength',
  'Intelligence', 'Intuition', 'Communication', 'Adaptability', 'Courage',
  'Persistence', 'Observation'
];

const WEAKNESSES = [
  'Impatience', 'Overthinking', 'Too trusting', 'Perfectionism', 'Stubbornness',
  'Shyness', 'Impulsiveness', 'Pride', 'Forgetfulness', 'Clumsiness',
  'Indecisiveness', 'Overconfidence'
];

const SPECIAL_ABILITIES = [
  'Super speed', 'Invisibility', 'Mind reading', 'Time travel', 'Shape-shifting',
  'Healing powers', 'Super strength', 'Flight', 'Telekinesis', 'Elemental control',
  'Talking to animals', 'Photographic memory'
];

export const CharacterBuilder: React.FC<CharacterBuilderProps> = ({
  character,
  onSave,
  onCancel,
  isLoading = false,
  maxCharacters = 5,
  currentCharacterCount = 0
}) => {
  const [formData, setFormData] = useState<ExpandedCharacterData>({
    name: '',
    role: 'protagonist',
    traits: [],
    importanceLevel: 'secondary',
    appearanceFrequency: 'frequent'
  });

  const [activeTab, setActiveTab] = useState('basic');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data when character changes
  useEffect(() => {
    if (character) {
      setFormData({
        ...character,
        name: character.name,
        role: character.role as any,
        description: character.description,
        traits: character.traits || []
      } as ExpandedCharacterData);
    }
  }, [character]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Character name is required';
    } else if (formData.name.length > 50) {
      newErrors.name = 'Name must be 50 characters or less';
    }

    if (formData.traits.length === 0) {
      newErrors.traits = 'Select at least one personality trait';
    } else if (formData.traits.length > 8) {
      newErrors.traits = 'Maximum 8 traits allowed';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      toast.error('Please fix the errors before saving');
      return;
    }

    onSave(formData);
  };

  const addTrait = (trait: string) => {
    if (formData.traits.includes(trait) || formData.traits.length >= 8) return;
    setFormData({ ...formData, traits: [...formData.traits, trait] });
  };

  const removeTrait = (trait: string) => {
    setFormData({ ...formData, traits: formData.traits.filter(t => t !== trait) });
  };

  const addToList = (field: keyof ExpandedCharacterData, value: string) => {
    const currentList = (formData[field] as string[]) || [];
    if (!currentList.includes(value) && currentList.length < 5) {
      setFormData({ ...formData, [field]: [...currentList, value] });
    }
  };

  const removeFromList = (field: keyof ExpandedCharacterData, value: string) => {
    const currentList = (formData[field] as string[]) || [];
    setFormData({ ...formData, [field]: currentList.filter(v => v !== value) });
  };

  const addCatchphrase = () => {
    const phrase = prompt('Enter a catchphrase:');
    if (phrase && phrase.trim()) {
      const catchphrases = formData.catchphrases || [];
      if (catchphrases.length < 3) {
        setFormData({ ...formData, catchphrases: [...catchphrases, phrase.trim()] });
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="bg-slate-900/95 border-amber-400/30 backdrop-blur-sm">
        <CardHeader className="border-b border-amber-400/20">
          <CardTitle className="text-2xl font-bold text-gold-metallic flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-400" />
            {character ? 'Edit Character' : 'Create Character'}
          </CardTitle>
          <CardDescription className="text-gold-metallic/70">
            Build a detailed character with personality, motivations, and story integration
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-5 w-full bg-slate-800/50 border border-amber-400/20">
              <TabsTrigger value="basic" className="data-[state=active]:bg-amber-500/20">
                <User className="w-4 h-4 mr-1" />
                Basic
              </TabsTrigger>
              <TabsTrigger value="personality" className="data-[state=active]:bg-amber-500/20">
                <Brain className="w-4 h-4 mr-1" />
                Personality
              </TabsTrigger>
              <TabsTrigger value="abilities" className="data-[state=active]:bg-amber-500/20">
                <Zap className="w-4 h-4 mr-1" />
                Abilities
              </TabsTrigger>
              <TabsTrigger value="background" className="data-[state=active]:bg-amber-500/20">
                <BookOpen className="w-4 h-4 mr-1" />
                Background
              </TabsTrigger>
              <TabsTrigger value="story" className="data-[state=active]:bg-amber-500/20">
                <TrendingUp className="w-4 h-4 mr-1" />
                Story Arc
              </TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label className="text-gold-metallic">Character Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter character name..."
                  className="bg-slate-800/50 border-amber-400/30 text-white"
                  maxLength={50}
                />
                {errors.name && <p className="text-red-400 text-sm">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-gold-metallic">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: any) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger className="bg-slate-800/50 border-amber-400/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-amber-400/30">
                    <SelectItem value="protagonist">Protagonist - Main Hero</SelectItem>
                    <SelectItem value="sidekick">Sidekick - Loyal Companion</SelectItem>
                    <SelectItem value="companion">Companion - Travel Friend</SelectItem>
                    <SelectItem value="mentor">Mentor - Wise Guide</SelectItem>
                    <SelectItem value="rival">Rival - Friendly Competition</SelectItem>
                    <SelectItem value="custom">Custom - Define Your Own</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-gold-metallic">Description</Label>
                <Textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe appearance, personality, or unique features..."
                  className="bg-slate-800/50 border-amber-400/30 text-white min-h-[100px]"
                  maxLength={500}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gold-metallic">Importance Level</Label>
                <Select
                  value={formData.importanceLevel || 'secondary'}
                  onValueChange={(value: any) => setFormData({ ...formData, importanceLevel: value })}
                >
                  <SelectTrigger className="bg-slate-800/50 border-amber-400/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-amber-400/30">
                    <SelectItem value="primary">Primary - Central to Story</SelectItem>
                    <SelectItem value="secondary">Secondary - Important Supporting</SelectItem>
                    <SelectItem value="tertiary">Tertiary - Minor Role</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            {/* Personality Tab */}
            <TabsContent value="personality" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label className="text-gold-metallic">Personality Type</Label>
                <Select
                  value={formData.personalityType || ''}
                  onValueChange={(value: any) => setFormData({ ...formData, personalityType: value })}
                >
                  <SelectTrigger className="bg-slate-800/50 border-amber-400/30 text-white">
                    <SelectValue placeholder="Select personality type..." />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-amber-400/30">
                    <SelectItem value="brave">Brave - Courageous and Bold</SelectItem>
                    <SelectItem value="shy">Shy - Quiet and Reserved</SelectItem>
                    <SelectItem value="curious">Curious - Always Exploring</SelectItem>
                    <SelectItem value="wise">Wise - Thoughtful and Insightful</SelectItem>
                    <SelectItem value="mischievous">Mischievous - Playful Troublemaker</SelectItem>
                    <SelectItem value="serious">Serious - Focused and Determined</SelectItem>
                    <SelectItem value="cheerful">Cheerful - Happy and Optimistic</SelectItem>
                    <SelectItem value="mysterious">Mysterious - Enigmatic and Secretive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-gold-metallic">Personality Traits * ({formData.traits.length}/8)</Label>
                {errors.traits && <p className="text-red-400 text-sm">{errors.traits}</p>}
                
                {/* Selected Traits */}
                {formData.traits.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3 p-3 bg-amber-500/10 rounded-lg">
                    {formData.traits.map((trait) => (
                      <Badge
                        key={trait}
                        className="bg-amber-500/20 text-amber-200 cursor-pointer hover:bg-amber-500/30"
                        onClick={() => removeTrait(trait)}
                      >
                        {trait} <X className="w-3 h-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Trait Categories */}
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gold-metallic/70 mb-2">Positive Traits</p>
                    <div className="flex flex-wrap gap-2">
                      {PERSONALITY_TRAITS.positive.map((trait) => (
                        <Button
                          key={trait}
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => addTrait(trait)}
                          disabled={formData.traits.includes(trait) || formData.traits.length >= 8}
                          className="text-xs text-amber-300 hover:bg-amber-500/20"
                        >
                          + {trait}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gold-metallic/70 mb-2">Neutral Traits</p>
                    <div className="flex flex-wrap gap-2">
                      {PERSONALITY_TRAITS.neutral.map((trait) => (
                        <Button
                          key={trait}
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => addTrait(trait)}
                          disabled={formData.traits.includes(trait) || formData.traits.length >= 8}
                          className="text-xs text-blue-300 hover:bg-blue-500/20"
                        >
                          + {trait}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gold-metallic">Speech Pattern</Label>
                <Select
                  value={formData.speechPattern || ''}
                  onValueChange={(value: any) => setFormData({ ...formData, speechPattern: value })}
                >
                  <SelectTrigger className="bg-slate-800/50 border-amber-400/30 text-white">
                    <SelectValue placeholder="How does the character speak?" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-amber-400/30">
                    <SelectItem value="formal">Formal - Proper and Polite</SelectItem>
                    <SelectItem value="casual">Casual - Relaxed and Friendly</SelectItem>
                    <SelectItem value="poetic">Poetic - Flowery and Artistic</SelectItem>
                    <SelectItem value="simple">Simple - Clear and Direct</SelectItem>
                    <SelectItem value="technical">Technical - Precise and Detailed</SelectItem>
                    <SelectItem value="humorous">Humorous - Funny and Witty</SelectItem>
                    <SelectItem value="cryptic">Cryptic - Mysterious and Vague</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-gold-metallic">Catchphrases ({(formData.catchphrases || []).length}/3)</Label>
                <div className="space-y-2">
                  {(formData.catchphrases || []).map((phrase, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="flex-1 p-2 bg-slate-800/50 rounded border border-amber-400/20 text-white">
                        "{phrase}"
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          const catchphrases = formData.catchphrases || [];
                          setFormData({
                            ...formData,
                            catchphrases: catchphrases.filter((_, i) => i !== index)
                          });
                        }}
                        className="text-red-400 hover:bg-red-500/20"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  {(!formData.catchphrases || formData.catchphrases.length < 3) && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={addCatchphrase}
                      className="border-amber-400/30 text-amber-300 hover:bg-amber-500/20"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Catchphrase
                    </Button>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Abilities Tab */}
            <TabsContent value="abilities" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label className="text-gold-metallic">Motivations & Goals</Label>
                <div className="space-y-2">
                  {(formData.motivations || []).map((motivation, index) => (
                    <Badge key={index} className="bg-green-500/20 text-green-200 mr-2">
                      {motivation}
                      <X 
                        className="w-3 h-3 ml-1 cursor-pointer" 
                        onClick={() => removeFromList('motivations', motivation)}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {MOTIVATIONS.filter(m => !(formData.motivations || []).includes(m)).map((motivation) => (
                    <Button
                      key={motivation}
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => addToList('motivations', motivation)}
                      disabled={(formData.motivations || []).length >= 5}
                      className="text-xs text-green-300 hover:bg-green-500/20"
                    >
                      + {motivation}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gold-metallic">Fears & Weaknesses</Label>
                <div className="space-y-2">
                  {(formData.fears || []).map((fear, index) => (
                    <Badge key={index} className="bg-red-500/20 text-red-200 mr-2">
                      {fear}
                      <X 
                        className="w-3 h-3 ml-1 cursor-pointer" 
                        onClick={() => removeFromList('fears', fear)}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {FEARS.filter(f => !(formData.fears || []).includes(f)).map((fear) => (
                    <Button
                      key={fear}
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => addToList('fears', fear)}
                      disabled={(formData.fears || []).length >= 5}
                      className="text-xs text-red-300 hover:bg-red-500/20"
                    >
                      + {fear}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gold-metallic">Strengths</Label>
                <div className="space-y-2">
                  {(formData.strengths || []).map((strength, index) => (
                    <Badge key={index} className="bg-blue-500/20 text-blue-200 mr-2">
                      {strength}
                      <X 
                        className="w-3 h-3 ml-1 cursor-pointer" 
                        onClick={() => removeFromList('strengths', strength)}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {STRENGTHS.filter(s => !(formData.strengths || []).includes(s)).map((strength) => (
                    <Button
                      key={strength}
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => addToList('strengths', strength)}
                      disabled={(formData.strengths || []).length >= 5}
                      className="text-xs text-blue-300 hover:bg-blue-500/20"
                    >
                      + {strength}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gold-metallic">Special Abilities (Optional)</Label>
                <div className="space-y-2">
                  {(formData.specialAbilities || []).map((ability, index) => (
                    <Badge key={index} className="bg-purple-500/20 text-purple-200 mr-2">
                      {ability}
                      <X 
                        className="w-3 h-3 ml-1 cursor-pointer" 
                        onClick={() => removeFromList('specialAbilities', ability)}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {SPECIAL_ABILITIES.filter(a => !(formData.specialAbilities || []).includes(a)).map((ability) => (
                    <Button
                      key={ability}
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => addToList('specialAbilities', ability)}
                      disabled={(formData.specialAbilities || []).length >= 3}
                      className="text-xs text-purple-300 hover:bg-purple-500/20"
                    >
                      + {ability}
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Background Tab */}
            <TabsContent value="background" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label className="text-gold-metallic">Backstory</Label>
                <Textarea
                  value={formData.backstory || ''}
                  onChange={(e) => setFormData({ ...formData, backstory: e.target.value })}
                  placeholder="What's the character's history? What shaped them?"
                  className="bg-slate-800/50 border-amber-400/30 text-white min-h-[120px]"
                  maxLength={1000}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gold-metallic">Family & Relationships</Label>
                <Textarea
                  value={formData.family || ''}
                  onChange={(e) => setFormData({ ...formData, family: e.target.value })}
                  placeholder="Describe family members, friends, or important relationships..."
                  className="bg-slate-800/50 border-amber-400/30 text-white min-h-[80px]"
                  maxLength={500}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gold-metallic">Home Location</Label>
                <Input
                  value={formData.homeLocation || ''}
                  onChange={(e) => setFormData({ ...formData, homeLocation: e.target.value })}
                  placeholder="Where does the character come from?"
                  className="bg-slate-800/50 border-amber-400/30 text-white"
                  maxLength={100}
                />
              </div>
            </TabsContent>

            {/* Story Arc Tab */}
            <TabsContent value="story" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label className="text-gold-metallic">Character's Starting Point</Label>
                <Textarea
                  value={formData.developmentArc?.startingState || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    developmentArc: {
                      ...formData.developmentArc,
                      startingState: e.target.value,
                      desiredEndState: formData.developmentArc?.desiredEndState || '',
                      growthType: formData.developmentArc?.growthType || 'linear'
                    }
                  })}
                  placeholder="How does the character begin their journey?"
                  className="bg-slate-800/50 border-amber-400/30 text-white min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gold-metallic">Character's Goal/End State</Label>
                <Textarea
                  value={formData.developmentArc?.desiredEndState || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    developmentArc: {
                      ...formData.developmentArc,
                      startingState: formData.developmentArc?.startingState || '',
                      desiredEndState: e.target.value,
                      growthType: formData.developmentArc?.growthType || 'linear'
                    }
                  })}
                  placeholder="What should the character achieve or become?"
                  className="bg-slate-800/50 border-amber-400/30 text-white min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gold-metallic">Growth Type</Label>
                <Select
                  value={formData.developmentArc?.growthType || 'linear'}
                  onValueChange={(value: any) => setFormData({
                    ...formData,
                    developmentArc: {
                      ...formData.developmentArc,
                      startingState: formData.developmentArc?.startingState || '',
                      desiredEndState: formData.developmentArc?.desiredEndState || '',
                      growthType: value
                    }
                  })}
                >
                  <SelectTrigger className="bg-slate-800/50 border-amber-400/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-amber-400/30">
                    <SelectItem value="linear">Linear - Steady Progress</SelectItem>
                    <SelectItem value="transformative">Transformative - Major Change</SelectItem>
                    <SelectItem value="cyclical">Cyclical - Repeating Patterns</SelectItem>
                    <SelectItem value="redemptive">Redemptive - Overcoming Past</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-gold-metallic">Appearance Frequency</Label>
                <Select
                  value={formData.appearanceFrequency || 'frequent'}
                  onValueChange={(value: any) => setFormData({ ...formData, appearanceFrequency: value })}
                >
                  <SelectTrigger className="bg-slate-800/50 border-amber-400/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-amber-400/30">
                    <SelectItem value="constant">Constant - Always Present</SelectItem>
                    <SelectItem value="frequent">Frequent - Most Scenes</SelectItem>
                    <SelectItem value="moderate">Moderate - Key Scenes</SelectItem>
                    <SelectItem value="occasional">Occasional - Few Scenes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-gold-metallic">Plot Role</Label>
                <Select
                  value={formData.plotRole || ''}
                  onValueChange={(value: any) => setFormData({ ...formData, plotRole: value })}
                >
                  <SelectTrigger className="bg-slate-800/50 border-amber-400/30 text-white">
                    <SelectValue placeholder="How does the character affect the plot?" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-amber-400/30">
                    <SelectItem value="driver">Driver - Moves Plot Forward</SelectItem>
                    <SelectItem value="reactor">Reactor - Responds to Events</SelectItem>
                    <SelectItem value="observer">Observer - Witnesses Events</SelectItem>
                    <SelectItem value="catalyst">Catalyst - Triggers Changes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex justify-between items-center mt-6 pt-6 border-t border-amber-400/20">
            <div className="text-sm text-gold-metallic/70">
              {currentCharacterCount !== undefined && (
                <span>
                  Characters: {currentCharacterCount}/{maxCharacters}
                </span>
              )}
            </div>
            
            <div className="flex gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={onCancel}
                disabled={isLoading}
                className="text-gold-metallic hover:bg-amber-500/10"
              >
                Cancel
              </Button>
              
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading || !formData.name.trim()}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    {character ? 'Update Character' : 'Create Character'}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};