import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { User, Users, Sparkles, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

interface Character {
  id: string;
  name: string;
  role: 'protagonist' | 'sidekick' | 'companion' | 'custom';
  description?: string;
  traits?: string[];
}

interface CharacterBuilderProps {
  onComplete: (characters: Character[]) => void;
  onSkip: () => void;
  maxCharacters?: number;
  genre?: string;
}

const ROLE_SUGGESTIONS = {
  protagonist: {
    label: 'Main Character',
    description: 'The hero of your story',
    icon: User,
    suggestions: ['Alex', 'Sam', 'Jordan', 'Riley', 'Taylor', 'Morgan']
  },
  sidekick: {
    label: 'Sidekick',
    description: 'Loyal friend and companion',
    icon: Users,
    suggestions: ['Buddy', 'Scout', 'Pip', 'Luna', 'Max', 'Sage']
  },
  companion: {
    label: 'Companion',
    description: 'Travel companion or guide',
    icon: Sparkles,
    suggestions: ['Whiskers', 'Shadow', 'Ember', 'Storm', 'Frost', 'Echo']
  },
  custom: {
    label: 'Custom',
    description: 'Your own character',
    icon: User,
    suggestions: ['Hero', 'Friend', 'Guide', 'Mentor', 'Guardian', 'Companion']
  }
};

const TRAIT_SUGGESTIONS = [
  'Brave', 'Curious', 'Kind', 'Clever', 'Funny', 'Loyal',
  'Creative', 'Bold', 'Gentle', 'Wise', 'Adventurous', 'Caring'
];

export const CharacterBuilder: React.FC<CharacterBuilderProps> = ({
  onComplete,
  onSkip,
  maxCharacters = 3
}) => {
  const [characters, setCharacters] = useState<Character[]>([
    {
      id: '1',
      name: '',
      role: 'protagonist',
      description: '',
      traits: []
    }
  ]);

  const addCharacter = () => {
    if (characters.length >= maxCharacters) {
      toast.error(`Maximum ${maxCharacters} characters allowed`);
      return;
    }

    const newCharacter: Character = {
      id: Date.now().toString(),
      name: '',
      role: 'sidekick',
      description: '',
      traits: []
    };

    setCharacters([...characters, newCharacter]);
  };

  const removeCharacter = (id: string) => {
    if (characters.length <= 1) {
      toast.error('At least one character is required');
      return;
    }
    setCharacters(characters.filter(char => char.id !== id));
  };

  const updateCharacter = (id: string, updates: Partial<Character>) => {
    setCharacters(characters.map(char => 
      char.id === id ? { ...char, ...updates } : char
    ));
  };

  const addTrait = (characterId: string, trait: string) => {
    const character = characters.find(c => c.id === characterId);
    if (!character) return;

    if (character.traits?.includes(trait)) {
      toast.error('Trait already added');
      return;
    }

    if ((character.traits?.length || 0) >= 3) {
      toast.error('Maximum 3 traits per character');
      return;
    }

    updateCharacter(characterId, {
      traits: [...(character.traits || []), trait]
    });
  };

  const removeTrait = (characterId: string, trait: string) => {
    const character = characters.find(c => c.id === characterId);
    if (!character) return;

    updateCharacter(characterId, {
      traits: character.traits?.filter(t => t !== trait) || []
    });
  };

  const handleComplete = () => {
    const validCharacters = characters.filter(char => char.name.trim());
    
    if (validCharacters.length === 0) {
      toast.error('Please name at least one character');
      return;
    }

    onComplete(validCharacters);
  };


  return (
    <div className="page-container">
      <div className="page-content">
        <div className="section">
          <Card className="w-full max-w-4xl mx-auto glass-card-enhanced">
        <CardHeader className="text-center">
          <CardTitle className="text-title mb-6">
            Create Your <span className="text-accent">Characters</span>
          </CardTitle>
          <p className="fantasy-subtitle text-xl text-gray-300 max-w-2xl mx-auto">
            Give your characters names and personalities to make your story more personal
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {characters.map((character, index) => {
            const roleInfo = ROLE_SUGGESTIONS[character.role];
            const Icon = roleInfo.icon;
            
            return (
              <Card key={character.id} className="glass-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Icon className="w-5 h-5 text-purple-400" />
                      <Badge variant="secondary" className="bg-purple-500/20 text-purple-200">
                        {roleInfo.label}
                      </Badge>
                      {index === 0 && (
                        <Badge variant="outline" className="border-yellow-400 text-yellow-400">
                          Required
                        </Badge>
                      )}
                    </div>
                    {characters.length > 1 && index > 0 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeCharacter(character.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Character Name */}
                    <div className="space-y-2">
                      <Label className="text-gray-300">Character Name</Label>
                      <Input
                        value={character.name}
                        onChange={(e) => updateCharacter(character.id, { name: e.target.value })}
                        placeholder={`Enter ${roleInfo.label.toLowerCase()} name...`}
                        className="input-field"
                      />
                      
                      {/* Name Suggestions */}
                      <div className="flex flex-wrap gap-2">
                        {roleInfo.suggestions.map((suggestion: string) => (
                          <Button
                            key={suggestion}
                            size="sm"
                            variant="outline"
                            onClick={() => updateCharacter(character.id, { name: suggestion })}
                            className="text-xs glass-card text-white hover:glass-enhanced"
                          >
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Character Description */}
                    <div className="space-y-2">
                      <Label className="text-gray-300">Description (Optional)</Label>
                      <Textarea
                        value={character.description || ''}
                        onChange={(e) => updateCharacter(character.id, { description: e.target.value })}
                        placeholder="Describe your character's appearance or personality..."
                        className="input-field min-h-[80px]"
                        maxLength={200}
                      />
                    </div>
                  </div>

                  {/* Character Traits */}
                  <div className="mt-4 space-y-2">
                    <Label className="text-gray-300">Personality Traits (Optional)</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {character.traits?.map((trait) => (
                        <Badge
                          key={trait}
                          className="bg-blue-500/20 text-blue-200 cursor-pointer hover:bg-blue-500/30"
                          onClick={() => removeTrait(character.id, trait)}
                        >
                          {trait} <X className="w-3 h-3 ml-1" />
                        </Badge>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {TRAIT_SUGGESTIONS.filter(trait => 
                        !character.traits?.includes(trait)
                      ).map((trait) => (
                        <Button
                          key={trait}
                          size="sm"
                          variant="ghost"
                          onClick={() => addTrait(character.id, trait)}
                          className="text-xs glass-card text-white hover:glass-enhanced"
                          disabled={(character.traits?.length || 0) >= 3}
                        >
                          + {trait}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Add Character Button */}
          {characters.length < maxCharacters && (
            <Button
              onClick={addCharacter}
              variant="outline"
              className="w-full border-dashed glass-card hover:glass-enhanced text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Another Character ({characters.length}/{maxCharacters})
            </Button>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-white/10">
            <Button
              onClick={onSkip}
              variant="ghost"
              className="flex-1 glass-card text-white hover:glass-enhanced"
            >
              Skip Character Setup
            </Button>
            <Button
              onClick={handleComplete}
              variant="cta-primary"
              disabled={!characters.some(char => char.name.trim())}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Continue with Characters
            </Button>
          </div>

          {/* Helper Text */}
          <div className="text-center text-sm text-gray-400 pt-2">
            <p>💡 Tip: Characters you create will appear throughout your story with their names and traits</p>
          </div>
        </CardContent>
      </Card>
        </div>
      </div>
    </div>
  );
};