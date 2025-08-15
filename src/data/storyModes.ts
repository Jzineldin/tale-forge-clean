
import { Baby, Ghost, GraduationCap, Castle, Rocket, Search, Heart, Compass, Smile, Scroll } from 'lucide-react';

export const storyModes = [
  { 
    name: 'Child-Adapted Story', 
    icon: Baby, 
    description: 'Simple, friendly, and colorful.',
    image: '/images/child-adapted-story.png',
    gradient: 'from-pink-400 to-purple-500'
  },
  { 
    name: 'Horror Story', 
    icon: Ghost, 
    description: 'Dark, suspenseful, and eerie.',
    image: '/images/horror-story.png',
    gradient: 'from-gray-800 to-red-900'
  },
  { 
    name: 'Educational Adventure', 
    icon: GraduationCap, 
    description: 'Informative and entertaining.',
    image: '/images/educational-adventure.png',
    gradient: 'from-blue-500 to-green-500'
  },
  { 
    name: 'Epic Fantasy', 
    icon: Castle, 
    description: 'Grand, mythical, and magical.',
    image: '/images/epic-fantasy.png',
    gradient: 'from-purple-600 to-blue-800'
  },
  { 
    name: 'Sci-Fi Thriller', 
    icon: Rocket, 
    description: 'Futuristic, tense, and sleek.',
    image: '/images/sci-fi-thriller.png',
    gradient: 'from-cyan-500 to-blue-700'
  },
  { 
    name: 'Mystery Detective', 
    icon: Search, 
    description: 'A noir-style investigation.',
    image: '/images/mystery-detective.png',
    gradient: 'from-gray-700 to-gray-900'
  },
  { 
    name: 'Romantic Drama', 
    icon: Heart, 
    description: 'Emotional and relationship-focused.',
    image: '/images/romantic-drama.png',
    gradient: 'from-rose-400 to-pink-600'
  },
  { 
    name: 'Adventure Quest', 
    icon: Compass, 
    description: 'Action-packed and exploratory.',
    image: '/images/adventure-quest.png',
    gradient: 'from-orange-500 to-red-600'
  },
  { 
    name: 'Comedy Adventure', 
    icon: Smile, 
    description: 'Light-hearted and humorous.',
    image: '/images/comedy-adventure.png',
    gradient: 'from-yellow-400 to-orange-500'
  },
  { 
    name: 'Historical Journey', 
    icon: Scroll, 
    description: 'Period-accurate and authentic.',
    image: '/images/historical-journey.png',
    gradient: 'from-amber-600 to-yellow-800'
  },
];

export type StoryMode = typeof storyModes[0];
