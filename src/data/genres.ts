
import { 
  Moon, 
  Castle,
  Rocket, 
  Search, 
  Heart, 
  Map,
  Laugh,
  GraduationCap
} from 'lucide-react';

export interface Genre {
  id: string;
  title: string;
  description: string;
  mood: string; // Short mood descriptor
  tags: string[]; // Hashtag-style tags
  icon: React.ComponentType<any>;
  emoji: string; // Large display emoji
  gradient: string;
  image: string;
  category?: 'storytime' | 'learning' | 'both';
}

export const genres: Genre[] = [
  {
    id: 'bedtime-stories',
    title: 'Bedtime Stories',
    description: 'Gentle, calming tales perfect for winding down at night',
    mood: 'Peaceful Dreams',
    tags: ['#peaceful', '#calming', '#sleepy', '#dreams'],
    icon: Moon,
    emoji: '🌙',
    gradient: 'from-indigo-500 to-purple-400',
    image: 'https://cdn.midjourney.com/0c0a544c-f133-4b4c-91de-1b610a2117be/0_3.png',
    category: 'storytime'
  },
  {
    id: 'fantasy-magic',
    title: 'Fantasy & Magic',
    description: 'Enchanted worlds with mythical creatures and kid-friendly magic',
    mood: 'Epic Adventures',
    tags: ['#magical', '#epic', '#dragons', '#heroes'],
    icon: Castle,
    emoji: '🏰',
    gradient: 'from-amber-500 to-orange-400',
    image: 'https://cdn.midjourney.com/2bcfdc43-8108-4ffc-8769-00e325469032/0_2.png',
    category: 'storytime'
  },
  {
    id: 'adventure-exploration',
    title: 'Adventure & Exploration',
    description: 'Exciting quests full of discovery and daring journeys',
    mood: 'Explore & Discover',
    tags: ['#adventure', '#explore', '#treasure', '#brave'],
    icon: Map,
    emoji: '🗺️',
    gradient: 'from-teal-500 to-green-400',
    image: '/images/adventure-and-exploration.png',
    category: 'storytime'
  },
  {
    id: 'mystery-detective',
    title: 'Mystery & Detective',
    description: 'Kid-friendly whodunits and puzzle-solving adventures',
    mood: 'Solve & Investigate',
    tags: ['#mystery', '#detective', '#clues', '#puzzle'],
    icon: Search,
    emoji: '🔍',
    gradient: 'from-slate-500 to-gray-400',
    image: '/images/mystery-and-detective.png',
    category: 'both'
  },
  {
    id: 'science-space',
    title: 'Science Fiction & Space',
    description: 'Futuristic adventures that spark curiosity about STEM topics',
    mood: 'Future Worlds',
    tags: ['#space', '#future', '#robots', '#science'],
    icon: Rocket,
    emoji: '🚀',
    gradient: 'from-blue-500 to-cyan-400',
    image: 'https://cdn.midjourney.com/34b108f5-b036-4c9c-88c7-440b16d4b249/0_2.png',
    category: 'learning'
  },
  {
    id: 'educational-stories',
    title: 'Educational Stories',
    description: 'Learning made fun through engaging storytelling and discovery',
    mood: 'Learn & Grow',
    tags: ['#learning', '#smart', '#facts', '#discovery'],
    icon: GraduationCap,
    emoji: '📚',
    gradient: 'from-green-500 to-emerald-400',
    image: 'https://cdn.midjourney.com/b2e619a7-4fac-46b0-ada5-1aa06cec985c/0_1.png',
    category: 'learning'
  },
  {
    id: 'values-lessons',
    title: 'Values & Life Lessons',
    description: 'Heartwarming tales that teach important moral values and friendship',
    mood: 'Learn & Grow',
    tags: ['#kindness', '#friendship', '#values', '#heart'],
    icon: Heart,
    emoji: '❤️',
    gradient: 'from-red-500 to-pink-400',
    image: '/images/values-and-life-lessons.png',
    category: 'learning'
  },
  {
    id: 'silly-humor',
    title: 'Silly & Humorous Stories',
    description: 'Lighthearted, funny tales filled with jokes and goofy characters',
    mood: 'Laugh & Play',
    tags: ['#funny', '#silly', '#giggles', '#joy'],
    icon: Laugh,
    emoji: '😄',
    gradient: 'from-yellow-500 to-orange-400',
    image: '/images/silly-and-humorous.png',
    category: 'storytime'
  }
];

// Helper function to get genres by category
export const getGenresByCategory = (category: 'storytime' | 'learning' | 'both') => {
  return genres.filter(genre => genre.category === category || genre.category === 'both');
};

// Get all storytime genres (for parents/kids)
export const getStorytimeGenres = () => {
  return genres.filter(genre => genre.category === 'storytime' || genre.category === 'both');
};

// Get all learning genres (for teachers/educational use)
export const getLearningGenres = () => {
  return genres.filter(genre => genre.category === 'learning' || genre.category === 'both');
};
