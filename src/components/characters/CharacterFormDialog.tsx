import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Sparkles } from 'lucide-react';
import { UserCharacter } from '@/hooks/useUserCharacters';

interface CharacterFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CharacterFormData) => void;
  character?: UserCharacter | null;
  isLoading?: boolean;
  title: string;
}

interface CharacterFormData {
  name: string;
  role: 'protagonist' | 'sidekick' | 'companion' | 'custom';
  description?: string;
  traits: string[];
}

const ROLE_OPTIONS = [
  { value: 'protagonist', label: 'Protagonist', description: 'The main hero of your story' },
  { value: 'sidekick', label: 'Sidekick', description: 'Loyal friend and companion' },
  { value: 'companion', label: 'Companion', description: 'Travel companion or guide' },
  { value: 'custom', label: 'Custom', description: 'Define your own role' }
];

const TRAIT_SUGGESTIONS = [
  'Brave', 'Curious', 'Kind', 'Clever', 'Funny', 'Loyal',
  'Creative', 'Bold', 'Gentle', 'Wise', 'Adventurous', 'Caring',
  'Determined', 'Optimistic', 'Thoughtful', 'Energetic', 'Patient', 'Honest'
];

const NAME_SUGGESTIONS = {
  protagonist: ['Alex', 'Sam', 'Jordan', 'Riley', 'Taylor', 'Morgan', 'Casey', 'Avery'],
  sidekick: ['Buddy', 'Scout', 'Pip', 'Luna', 'Max', 'Sage', 'Finn', 'Nova'],
  companion: ['Whiskers', 'Shadow', 'Ember', 'Storm', 'Frost', 'Echo', 'Zara', 'Phoenix'],
  custom: ['Charlie', 'River', 'Sage', 'Rowan', 'Skylar', 'Phoenix', 'Aspen', 'Kai']
};

export const CharacterFormDialog: React.FC<CharacterFormDialogProps> = ({
  open,
  onClose,
  onSubmit,
  character,
  isLoading = false,
  title
}) => {
  const [formData, setFormData] = useState<CharacterFormData>({
    name: '',
    role: 'protagonist',
    description: '',
    traits: []
  });

  const [errors, setErrors] = useState<Partial<CharacterFormData>>({});

  // Initialize form data when character changes
  useEffect(() => {
    if (character) {
      setFormData({
        name: character.name,
        role: character.role,
        description: character.description || '',
        traits: character.traits || []
      });
    } else {
      setFormData({
        name: '',
        role: 'protagonist',
        description: '',
        traits: []
      });
    }
    setErrors({});
  }, [character, open]);

  const validateForm = (): boolean => {
    const newErrors: Partial<CharacterFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Character name is required';
    } else if (formData.name.length > 50) {
      newErrors.name = 'Character name must be 50 characters or less';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be 500 characters or less';
    }

    if (formData.traits.length > 5) {
      newErrors.traits = ['Maximum 5 traits allowed'];
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSubmit(formData);
  };

  const addTrait = (trait: string) => {
    if (formData.traits.includes(trait)) {
      return;
    }

    if (formData.traits.length >= 5) {
      setErrors({ ...errors, traits: ['Maximum 5 traits allowed'] });
      return;
    }

    setFormData({
      ...formData,
      traits: [...formData.traits, trait]
    });
    // Remove the traits error by creating a new object without it
    const { traits: _, ...restErrors } = errors;
    setErrors(restErrors);
  };

  const removeTrait = (trait: string) => {
    setFormData({
      ...formData,
      traits: formData.traits.filter(t => t !== trait)
    });
  };


  const availableTraits = TRAIT_SUGGESTIONS.filter(trait => !formData.traits.includes(trait));
  const nameSuggestions = NAME_SUGGESTIONS[formData.role] || NAME_SUGGESTIONS.custom;

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-[600px] bg-slate-900 border-slate-700 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-white">
            {title}
          </DialogTitle>
          <DialogDescription className="text-center text-gray-300">
            Create or edit a character with name, role, description, and personality traits
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Character Role */}
          <div className="space-y-2">
            <Label className="text-gray-300">Character Role</Label>
            <Select
              value={formData.role}
              onValueChange={(value: any) => setFormData({ ...formData, role: value })}
            >
              <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600 !fixed !z-[9999] !pointer-events-auto">
                {ROLE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="text-white hover:bg-slate-700">
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-gray-400">{option.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Character Name */}
          <div className="space-y-2">
            <Label className="text-gray-300">Character Name</Label>
            <Input
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                // Remove the name error by creating a new object without it
                const { name: _, ...restErrors } = errors;
                setErrors(restErrors);
              }}
              placeholder="Enter character name..."
              className="bg-slate-800 border-slate-600 text-white placeholder-gray-400"
              maxLength={50}
            />
            {errors.name && (
              <p className="text-red-400 text-sm">{errors.name}</p>
            )}
            
            {/* Name Suggestions */}
            <div className="flex flex-wrap gap-2">
              {nameSuggestions.map((suggestion) => (
                <Button
                  key={suggestion}
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setFormData({ ...formData, name: suggestion });
                    const { name: _, ...restErrors } = errors;
                    setErrors(restErrors);
                  }}
                  className="text-xs border-purple-400/50 text-purple-300 hover:bg-purple-400/20"
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
              value={formData.description}
              onChange={(e) => {
                setFormData({ ...formData, description: e.target.value });
                // Remove the description error by creating a new object without it
                const { description: _, ...restErrors } = errors;
                setErrors(restErrors);
              }}
              placeholder="Describe your character's appearance, personality, or background..."
              className="bg-slate-800 border-slate-600 text-white placeholder-gray-400 min-h-[100px]"
              maxLength={500}
            />
            <div className="flex justify-between text-sm">
              {errors.description && (
                <p className="text-red-400">{errors.description}</p>
              )}
              <p className="text-gray-400 ml-auto">
                {formData.description?.length || 0}/500
              </p>
            </div>
          </div>

          {/* Character Traits */}
          <div className="space-y-2">
            <Label className="text-gray-300">Personality Traits (Optional)</Label>
            
            {/* Selected Traits */}
            {formData.traits.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.traits.map((trait) => (
                  <Badge
                    key={trait}
                    className="bg-blue-500/20 text-blue-200 cursor-pointer hover:bg-blue-500/30"
                    onClick={() => removeTrait(trait)}
                  >
                    {trait} <X className="w-3 h-3 ml-1" />
                  </Badge>
                ))}
              </div>
            )}
            
            {/* Trait Suggestions */}
            {availableTraits.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {availableTraits.slice(0, 12).map((trait) => (
                  <Button
                    key={trait}
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => addTrait(trait)}
                    className="text-xs text-gray-400 hover:text-white hover:bg-slate-700"
                    disabled={formData.traits.length >= 5}
                  >
                    + {trait}
                  </Button>
                ))}
              </div>
            )}
            
            {errors.traits && (
              <p className="text-red-400 text-sm">{errors.traits[0]}</p>
            )}
            
            <p className="text-gray-500 text-xs">
              Click traits to add them, or click selected traits to remove them. Maximum 5 traits.
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-700">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="flex-1 text-gray-400 hover:text-white"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              disabled={isLoading || !formData.name.trim()}
            >
              {isLoading ? (
                'Saving...'
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  {character ? 'Update Character' : 'Create Character'}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};