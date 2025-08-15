
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Sparkles, Heart, Zap } from 'lucide-react';

const ExampleStories: React.FC = () => {
  const examples = [
    {
      icon: <BookOpen className="h-6 w-6 text-amber-500" />,
      title: "The Enchanted Library",
      preview: "You discover a hidden room in your school library where books come alive at midnight...",
      genre: "Fantasy Adventure",
      choices: ["Approach the glowing tome", "Hide and observe", "Call out to the books"]
    },
    {
      icon: <Zap className="h-6 w-6 text-blue-500" />,
      title: "Mars Colony Alpha",
      preview: "As the newest arrival on Mars, you notice the colony's AI system is acting strangely...",
      genre: "Sci-Fi Thriller",
      choices: ["Investigate the AI core", "Report to the commander", "Gather more evidence"]
    },
    {
      icon: <Heart className="h-6 w-6 text-pink-500" />,
      title: "The Time Café",
      preview: "Every coffee you order at this mysterious café transports you to a different era...",
      genre: "Romance & Time Travel",
      choices: ["Order the 'Victorian Blend'", "Ask the barista about the magic", "Try to leave the café"]
    }
  ];

  return (
    <section className="py-16 px-4" id="examples">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-serif">
            Story Examples
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto font-sans">
            See how your simple prompt becomes an immersive, choice-driven adventure
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {examples.map((story, index) => (
            <Card key={index} className="bg-black/30 border-white/20 backdrop-blur-sm hover:bg-black/40 transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  {story.icon}
                  <div>
                    <h3 className="text-xl font-bold text-white font-serif">
                      {story.title}
                    </h3>
                    <span className="text-sm text-amber-300 font-sans">
                      {story.genre}
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-300 mb-6 leading-relaxed font-sans">
                  {story.preview}
                </p>
                
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-amber-200 mb-3 font-sans">
                    Your choices might be:
                  </p>
                  {story.choices.map((choice, choiceIndex) => (
                    <div 
                      key={choiceIndex}
                      className="flex items-center gap-2 text-sm text-gray-300 p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors font-sans"
                    >
                      <Sparkles className="h-3 w-3 text-amber-400 flex-shrink-0" />
                      {choice}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-lg text-gray-300 mb-6 font-sans">
            Every story is unique, generated just for you based on your choices
          </p>
          <a 
            href="#create-story" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-500 text-white font-semibold rounded-lg hover:from-amber-500 hover:to-amber-400 transition-all duration-200 font-sans"
          >
            <Sparkles className="h-4 w-4" />
            Create Your Own Story
          </a>
        </div>
      </div>
    </section>
  );
};

export default ExampleStories;
