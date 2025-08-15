import React, { useState } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { useUserCharacters, UserCharacter } from '@/hooks/useUserCharacters';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, Crown, User, Users, Sparkles } from 'lucide-react';
import { CharacterFormDialog } from '@/components/characters/CharacterFormDialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

const CharacterManagement: React.FC = () => {
  const { isAdmin } = useAdmin();
  const { characters, characterLimit, canCreateMore, isLoading, isCreating, isUpdating, isDeleting, createCharacter, updateCharacter, deleteCharacter } = useUserCharacters();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<UserCharacter | null>(null);
  const [deletingCharacter, setDeletingCharacter] = useState<UserCharacter | null>(null);

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

  const handleCreateCharacter = (characterData: any) => {
    console.log('Creating character with data:', characterData);
    createCharacter(characterData);
    setShowCreateDialog(false);
  };

  const handleUpdateCharacter = (characterData: any) => {
    if (editingCharacter) {
      updateCharacter({ id: editingCharacter.id, updates: characterData });
      setEditingCharacter(null);
    }
  };

  const handleDeleteCharacter = () => {
    if (deletingCharacter) {
      deleteCharacter(deletingCharacter.id);
      setDeletingCharacter(null);
    }
  };

  const getUserTier = () => {
    // Check for admin role first
    if (isAdmin) return 'Admin';
    
    // This would come from user profile/subscription data
    // For now, we'll determine based on character limit
    if (characterLimit >= 20) return 'Enterprise';
    if (characterLimit >= 10) return 'Pro';
    if (characterLimit >= 5) return 'Premium';
    return 'Freemium';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {/* Using global background image from .scene-bg instead of local gradient */}
        <div className="text-white text-xl">Loading your characters...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      {/* Using global background image from .scene-bg instead of local gradient */}
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Your <span className="text-amber-400">Characters</span>
          </h1>
          <p className="text-xl text-gray-300 mb-6">
            Create and manage characters to bring your stories to life
          </p>
          
          {/* Plan Info */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <Badge className="bg-amber-500/20 text-amber-200 border-amber-400/30 px-4 py-2">
              <Crown className="w-4 h-4 mr-2" />
              {getUserTier()} Plan
            </Badge>
            <div className="text-gray-300">
              {characters.length} / {isAdmin ? 'Unlimited' : characterLimit} characters used
            </div>
          </div>
        </div>

        {/* Create Character Button */}
        <div className="mb-8 text-center">
          <Button
            onClick={() => setShowCreateDialog(true)}
            disabled={!canCreateMore || isCreating}
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create New Character
          </Button>
          
          {!canCreateMore && !isAdmin && (
            <p className="text-amber-300 text-sm mt-2">
              Character limit reached. Upgrade your plan to create more characters.
            </p>
          )}
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
                disabled={!canCreateMore}
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

export default CharacterManagement;