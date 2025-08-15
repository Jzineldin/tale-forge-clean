
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthProvider';
import { useAdmin } from '@/context/AdminContext';
import { toast } from 'sonner';

export interface UserCharacter {
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

export interface CreateCharacterData {
  name: string;
  role: 'protagonist' | 'sidekick' | 'companion' | 'custom';
  description?: string;
  traits?: string[];
  avatar_url?: string;
}

export const useUserCharacters = () => {
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const queryClient = useQueryClient();

  // Fetch user's characters
  const {
    data: characters = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['user-characters', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('user_characters')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching characters:', error);
        throw error;
      }

      return data as UserCharacter[];
    },
    enabled: !!user?.id,
  });

  // Set a default character limit based on user tier (simplified for now)
  const characterLimit = 5;

  // Check if user can create more characters based on current count
  const canCreateMore = isAdmin || (characters.length < characterLimit);

  // Create character mutation
  const createCharacterMutation = useMutation({
    mutationFn: async (characterData: CreateCharacterData) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Check if user can create more characters (skip check for admin users)
      if (!isAdmin && characters.length >= characterLimit) {
        throw new Error('Character limit reached for your current plan');
      }

      const { data, error } = await supabase
        .from('user_characters')
        .insert({
          user_id: user.id,
          name: characterData.name,
          role: characterData.role,
          description: characterData.description || null,
          traits: characterData.traits || [],
          avatar_url: characterData.avatar_url || null,
          is_active: true
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating character:', error);
        throw error;
      }

      return data as UserCharacter;
    },
    onSuccess: (newCharacter) => {
      queryClient.invalidateQueries({ queryKey: ['user-characters'] });
      queryClient.invalidateQueries({ queryKey: ['can-create-character'] });
      toast.success(`Character "${newCharacter.name}" created successfully!`);
    },
    onError: (error: Error) => {
      console.error('Character creation error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        isAdmin,
        user: user?.id
      });
      toast.error(error.message || 'Failed to create character');
    },
  });

  // Update character mutation
  const updateCharacterMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<CreateCharacterData> }) => {
      const { data, error } = await supabase
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
        throw error;
      }

      return data as UserCharacter;
    },
    onSuccess: (updatedCharacter) => {
      queryClient.invalidateQueries({ queryKey: ['user-characters'] });
      toast.success(`Character "${updatedCharacter.name}" updated successfully!`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update character');
    },
  });

  // Delete character mutation (soft delete)
  const deleteCharacterMutation = useMutation({
    mutationFn: async (characterId: string) => {
      const { error } = await supabase
        .from('user_characters')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', characterId);

      if (error) {
        console.error('Error deleting character:', error);
        throw error;
      }

      return characterId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-characters'] });
      queryClient.invalidateQueries({ queryKey: ['can-create-character'] });
      toast.success('Character deleted successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete character');
    },
  });

  return {
    // Data
    characters,
    characterLimit,
    canCreateMore,
    
    // Loading states
    isLoading,
    isCreating: createCharacterMutation.isPending,
    isUpdating: updateCharacterMutation.isPending,
    isDeleting: deleteCharacterMutation.isPending,
    
    // Error
    error,
    
    // Actions
    createCharacter: createCharacterMutation.mutate,
    updateCharacter: updateCharacterMutation.mutate,
    deleteCharacter: deleteCharacterMutation.mutate,
    refetch,
  };
};