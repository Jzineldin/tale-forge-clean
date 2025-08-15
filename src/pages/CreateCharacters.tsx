import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CharacterBuilder } from '@/components/story-creation/CharacterBuilder';

interface Character {
  id: string;
  name: string;
  role: 'protagonist' | 'sidekick' | 'companion' | 'custom';
  description?: string;
  traits?: string[];
}

const CreateCharacters: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleCharactersComplete = (characters: Character[]) => {
    // Store characters in URL params and navigate to prompt creation
    console.log('🔍 [CreateCharacters] Characters completed:', characters);
    console.log('🎭 [CreateCharacters] Character details:', characters.map(c => ({
      name: c.name,
      role: c.role,
      traits: c.traits,
      description: c.description
    })));
    const characterData = encodeURIComponent(JSON.stringify(characters));
    console.log('🔍 [CreateCharacters] Encoded character data:', characterData);
    console.log('🔍 [CreateCharacters] Character data length:', characterData.length);
    const currentParams = new URLSearchParams(searchParams);
    currentParams.set('characters', characterData);
    
    const navigationUrl = `/create/prompt?${currentParams.toString()}`;
    console.log('🔍 [CreateCharacters] Navigating to:', navigationUrl);
    console.log('✅ [CreateCharacters] SUCCESS: Characters will be passed to story generation');
    navigate(navigationUrl);
  };

  const handleSkipCharacters = () => {
    // Navigate to prompt creation without characters
    navigate(`/create/prompt?${searchParams.toString()}`);
  };

  return (
    <CharacterBuilder
      onComplete={handleCharactersComplete}
      onSkip={handleSkipCharacters}
      maxCharacters={3}
      genre={searchParams.get('genre') || ''}
    />
  );
};

export default CreateCharacters;