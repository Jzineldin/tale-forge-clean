import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, User, Users, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { CharacterFormDialog } from '@/components/characters/CharacterFormDialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { toast } from 'sonner';

// Define the UserCharacter interface
interface UserCharacter {
  id: string;
  user_id: string;
  name: string;
  role: 'protagonist' | 'sidekick' | 'companion' | 'custom';
  description?: string;
  traits: string[];
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const SimpleCharacterManagement: React.FC = () => {
  const [characters, setCharacters] = useState<UserCharacter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<UserCharacter | null>(null);
  const [deletingCharacter, setDeletingCharacter] = useState<UserCharacter | null>(null);

  // Fetch characters
  const fetchCharacters = async () => {
    try {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('No authenticated user found');
        setCharacters([]);
        return;
      }
      
      const { data, error } = await supabase
        .from('user_characters')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching characters:', error);
        toast.error('Failed to load characters');
        return;
      }
      
      setCharacters(data as UserCharacter[]);
    } catch (error) {
      console.error('Error fetching characters:', error);
      toast.error('Failed to load characters');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load characters on component mount
  useEffect(() => {
    fetchCharacters();
  }, []);
  
  // Create character
  const createCharacter = async (characterData: any) => {
    try {
      setIsCreating(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('You must be logged in to create characters');
        return;
      }
      
      const { error } = await supabase
        .from('user_characters')
        .insert({
          user_id: user.id,
          name: characterData.name,
          role: characterData.role,
          description: characterData.description,
          traits: characterData.traits || [],
          avatar_url: characterData.avatar_url,
          is_active: true
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating character:', error);
        toast.error('Failed to create character');
        return;
      }
      
      toast.success(`Character "${characterData.name}" created successfully!`);
      fetchCharacters();
    } catch (error) {
      console.error('Error creating character:', error);
      toast.error('Failed to create character');
    } finally {
      setIsCreating(false);
      setShowCreateDialog(false);
    }
  };
  
  // Update character
  const updateCharacter = async ({ id, updates }: { id: string; updates: any }) => {
    try {
      setIsUpdating(true);
      
      const { error } = await supabase
        .from('user_characters')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating character:', error);
        toast.error('Failed to update character');
        return;
      }
      
      toast.success(`Character "${updates.name}" updated successfully!`);
      fetchCharacters();
    } catch (error) {
      console.error('Error updating character:', error);
      toast.error('Failed to update character');
    } finally {
      setIsUpdating(false);
      setEditingCharacter(null);
    }
  };
  
  // Delete character
  const deleteCharacter = async (id: string) => {
    try {
      setIsDeleting(true);
      
      const { error } = await supabase
        .from('user_characters')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting character:', error);
        toast.error('Failed to delete character');
        return;
      }
      
      toast.success('Character deleted successfully!');
      fetchCharacters();
    } catch (error) {
      console.error('Error deleting character:', error);
      toast.error('Failed to delete character');
    } finally {
      setIsDeleting(false);
      setDeletingCharacter(null);
    }
  };
  
  const handleCreateCharacter = (characterData: any) => {
    createCharacter(characterData);
  };
  
  const handleUpdateCharacter = (characterData: any) => {
    if (editingCharacter) {
      updateCharacter({ id: editingCharacter.id, updates: characterData });
    }
  };
  
  const handleDeleteCharacter = () => {
    if (deletingCharacter) {
      deleteCharacter(deletingCharacter.id);
    }
  };
  
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'protagonist': return User;
      case 'sidekick': return Users;
      case 'companion': return Sparkles;
      default: return User;
    }
  };
  
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'protagonist': return 'bg-blue-500/20 text-blue-200 border-blue-400/30';
      case 'sidekick': return 'bg-green-500/20 text-green-200 border-green-400/30';
      case 'companion': return 'bg-purple-500/20 text-purple-200 border-purple-400/30';
      default: return 'bg-gray-500/20 text-gray-200 border-gray-400/30';
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading your characters...</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Your <span className="text-amber-400">Characters</span>
          </h1>
          <p className="text-xl text-gray-300 mb-6">
            Create and manage characters to bring your stories to life
          </p>
        </div>
        
        {/* Create Character Button */}
        <div className="mb-8 text-center">
          <Button
            onClick={() => setShowCreateDialog(true)}
            disabled={isCreating}
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create New Character
          </Button>
        </div>
        
        {/* Characters Grid */}
        {characters.length === 0 ? (
          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-center py-12">
            <CardContent>
              <div className="text-6xl mb-4">🎭</div>
              <h3 className="text-2xl font-bold text-white mb-2">No Characters Yet</h3>
              <p className="text-gray-300 mb-6">
                Create your first character to make your stories more personal and engaging
              </p>
              <Button
                onClick={() => setShowCreateDialog(true)}
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Character
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {characters.map((character) => {
              const RoleIcon = getRoleIcon(character.role);
              
              return (
                <Card key={character.id} className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <RoleIcon className="w-5 h-5 text-purple-400" />
                        <Badge className={getRoleColor(character.role)}>
                          {character.role}
                        </Badge>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingCharacter(character)}
                          className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/20"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeletingCharacter(character)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-400/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <CardTitle className="text-xl text-white">
                      {character.name}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent>
                    {character.description && (
                      <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                        {character.description}
                      </p>
                    )}
                    
                    {character.traits && character.traits.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-sm text-gray-400">Personality Traits:</div>
                        <div className="flex flex-wrap gap-2">
                          {character.traits.map((trait, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs border-amber-400/50 text-amber-300"
                            >
                              {trait}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-4 text-xs text-gray-500">
                      Created {new Date(character.created_at).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
        
        {/* Character Form Dialog */}
        <CharacterFormDialog
          open={showCreateDialog || !!editingCharacter}
          onClose={() => {
            setShowCreateDialog(false);
            setEditingCharacter(null);
          }}
          onSubmit={editingCharacter ? handleUpdateCharacter : handleCreateCharacter}
          character={editingCharacter}
          isLoading={isCreating || isUpdating}
          title={editingCharacter ? 'Edit Character' : 'Create New Character'}
        />
        
        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          open={!!deletingCharacter}
          onClose={() => setDeletingCharacter(null)}
          onConfirm={handleDeleteCharacter}
          title="Delete Character"
          description={`Are you sure you want to delete "${deletingCharacter?.name}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          isLoading={isDeleting}
          variant="destructive"
        />
      </div>
    </div>
  );
};

export default SimpleCharacterManagement;