import React from 'react';
import { StoryCard } from './index';
import { Story } from '@/types/stories';

/**
 * Example component demonstrating how to use the StoryCard component
 * 
 * This is for demonstration purposes only and shows how to use
 * the StoryCard component with various props and handlers.
 */
const StoryCardExample: React.FC = () => {
  // Example story data
  const exampleStory: Story = {
    id: '1',
    title: 'The Magical Adventure',
    description: 'Join the journey through enchanted lands and discover hidden treasures.',
    thumbnail_url: '/images/story-modes/fantasy.jpg',
    created_at: new Date().toISOString(),
    is_completed: false,
    segment_count: 5,
    is_public: true,
    story_mode: 'fantasy',
    full_story_audio_url: null,
    audio_generation_status: 'not_started',
    target_age: '7-12',
    published_at: null,
    shotstack_render_id: null,
    shotstack_video_url: null,
    shotstack_status: 'not_started',
    user_id: 'user123'
  };

  // Example handlers
  const handleView = (story: Story) => {
    console.log('View story:', story.title);
    // Navigate to story view page
  };

  const handleEdit = (story: Story) => {
    console.log('Edit story:', story.title);
    // Navigate to story edit page
  };

  const handleDelete = (story: Story) => {
    console.log('Delete story:', story.title);
    // Show confirmation dialog and delete if confirmed
  };

  const handleContinue = (story: Story) => {
    console.log('Continue story:', story.title);
    // Navigate to story continuation page
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Story Card Example</h2>
      
      {/* Basic usage */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Basic StoryCard</h3>
        <StoryCard 
          story={exampleStory}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onContinue={handleContinue}
        />
      </div>
      
      {/* With primary action set to edit */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">StoryCard with Edit as Primary Action</h3>
        <StoryCard 
          story={exampleStory}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onContinue={handleContinue}
          primaryAction="edit"
        />
      </div>
      
      {/* With link navigation */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">StoryCard with Link Navigation</h3>
        <StoryCard 
          story={exampleStory}
          linkTo={`/stories/${exampleStory.id}`}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onContinue={handleContinue}
        />
      </div>
      
      {/* Portrait variant */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Portrait StoryCard</h3>
        <StoryCard 
          story={exampleStory}
          variant="portrait"
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onContinue={handleContinue}
        />
      </div>
    </div>
  );
};

export default StoryCardExample;