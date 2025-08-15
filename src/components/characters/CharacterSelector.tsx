import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { User, Users, Sparkles, Plus } from 'lucide-react';
import { useUserCharacters, UserCharacter } from '@/hooks/useUserCharacters';
import { Link } from 'react-router-dom';

interface CharacterSelectorProps {
  selectedCharacters: UserCharacter[];
  onCharacterToggle: (character: UserCharacter) => void;
  maxCharacters?: number;
  className?: string;
}

export const CharacterSelector: React.FC<CharacterSelectorProps> = ({
  selectedCharacters,
  onCharacterToggle,
  maxCharacters = 3,
  className = ''
}) => {
  const { characters, isLoading } = useUserCharacters();

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'protagonist': return User;
      case 'sidekick': return Users;
      case 'companion': return Sparkles;
      default: return User;
    }
  };

  const getRoleColor = (role: string) => {
    // Unified amber accent; no rainbow chips
    return 'bg-amber-500/15 text-amber-200 border-amber-400/30';
  };

  const isCharacterSelected = (character: UserCharacter) => {
    return selectedCharacters.some(c => c.id === character.id);
  };

  const canSelectMore = selectedCharacters.length < maxCharacters;

  const handleCharacterClick = (character: UserCharacter) => {
    const isSelected = isCharacterSelected(character);
    
    if (isSelected || canSelectMore) {
      onCharacterToggle(character);
    }
  };

  if (isLoading) {
    return (
      <Card variant="glass" className={`border-none ${className}`}>
        <CardContent className="p-6">
          <div className="text-center text-gray-300">Loading your characters...</div>
        </CardContent>
      </Card>
    );
  }

  if (characters.length === 0) {
    return (
      <Card variant="glass" className={`border-none ${className}`}>
        <CardHeader>
          <CardTitle className="text-white text-center">No Characters Yet</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="text-4xl">🎭</div>
          <p className="text-gray-300">
            Create characters to make your stories more personal and engaging
          </p>
          <Link to="/characters">
            <Button variant="cta-primary">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Character
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="glass" className={`border-none ${className}`}>
      <CardHeader className="border-none">
        <CardTitle className="flex items-center justify-between text-title">
          <span>Choose Characters (Optional)</span>
          <Badge variant="outline" className="border-amber-400/40 text-amber-300">
            {selectedCharacters.length}/{maxCharacters} selected
          </Badge>
        </CardTitle>
        <CardDescription className="text-body text-gray-300">
          Select characters to include in your story. They'll appear by name and use their personality traits.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="grid gap-3">
          {characters.map((character) => {
            const RoleIcon = getRoleIcon(character.role);
            const isSelected = isCharacterSelected(character);
            const canSelect = isSelected || canSelectMore;
            
            return (
              <div
                key={character.id}
                className={`glass-card p-4 transition-colors duration-150 cursor-pointer ${
                  isSelected
                    ? 'ring-2 ring-amber-400/50'
                    : canSelect
                      ? ''
                      : 'opacity-50 cursor-not-allowed'
                }`}
                onClick={() => canSelect && handleCharacterClick(character)}
              >
                <div className="flex items-start space-x-3">
                  <Checkbox
                    checked={isSelected}
                    disabled={!canSelect}
                    className="mt-1"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <RoleIcon className="w-4 h-4 text-amber-300" />
                      <Badge className={getRoleColor(character.role)}>
                        {character.role}
                      </Badge>
                    </div>
                    
                    <h4 className="font-semibold text-white mb-1">
                      {character.name}
                    </h4>
                    
                    {character.description && (
                      <p className="text-gray-300 text-sm mb-2 line-clamp-2">
                        {character.description}
                      </p>
                    )}
                    
                    {character.traits && character.traits.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {character.traits.slice(0, 3).map((trait, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs border-amber-400/40 text-amber-200"
                          >
                            {trait}
                          </Badge>
                        ))}
                        {character.traits.length > 3 && (
                          <Badge
                            variant="outline"
                            className="text-xs border-gray-400/50 text-gray-400"
                          >
                            +{character.traits.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {!canSelectMore && (
          <p className="text-accent text-sm text-center mt-4">
            Maximum {maxCharacters} characters can be selected for a story
          </p>
        )}
        
        <div className="pt-4">
          <Link to="/characters">
            <Button
              variant="cta-secondary"
              size="sm"
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Manage Characters
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};