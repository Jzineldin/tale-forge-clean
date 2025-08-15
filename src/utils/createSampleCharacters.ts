import { supabase } from '@/integrations/supabase/client';

// Sample character data
const sampleCharacters = [
  {
    name: 'Luna',
    role: 'protagonist',
    description: 'A brave and curious young girl with a love for adventure and magic.',
    traits: ['Brave', 'Curious', 'Kind', 'Creative']
  },
  {
    name: 'Max',
    role: 'sidekick',
    description: 'A loyal and funny companion who always has Luna\'s back.',
    traits: ['Loyal', 'Funny', 'Clever', 'Energetic']
  },
  {
    name: 'Whiskers',
    role: 'companion',
    description: 'A magical talking cat with ancient wisdom and mysterious powers.',
    traits: ['Wise', 'Mysterious', 'Patient', 'Protective']
  }
];

/**
 * Creates sample characters for the current user
 */
export async function createSampleCharacters() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('No authenticated user found');
      return { success: false, message: 'No authenticated user found' };
    }
    
    console.log('Creating sample characters for user:', user.id);
    
    const results = [];
    
    for (const character of sampleCharacters) {
      const { data, error } = await supabase
        .from('user_characters')
        .insert({
          user_id: user.id,
          name: character.name,
          role: character.role,
          description: character.description,
          traits: character.traits,
          is_active: true
        })
        .select()
        .single();
      
      if (error) {
        console.error(`Error creating character ${character.name}:`, error);
        results.push({ name: character.name, success: false, error });
      } else {
        console.log(`Created character ${character.name}:`, data);
        results.push({ name: character.name, success: true, data });
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    
    return { 
      success: successCount > 0, 
      message: `Created ${successCount} of ${sampleCharacters.length} sample characters`,
      results
    };
  } catch (error) {
    console.error('Error creating sample characters:', error);
    return { success: false, message: 'Error creating sample characters', error };
  }
}