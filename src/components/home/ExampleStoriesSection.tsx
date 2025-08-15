
import React from 'react';
import { ArrowRight } from 'lucide-react';

const ExampleStoriesSection: React.FC = () => {
  const examples = [
    {
      prompt: "A detective finds a mysterious letter",
      result: "15-chapter interactive mystery with crime scene images and dramatic narration",
      genre: "Mystery"
    },
    {
      prompt: "A child discovers a magical garden",
      result: "Whimsical adventure with enchanted illustrations and gentle storytelling",
      genre: "Fantasy"
    },
    {
      prompt: "Survivors on a distant planet",
      result: "Sci-fi epic with alien landscapes and immersive space audio",
      genre: "Sci-Fi"
    }
  ];

  return (
    <section className="py-8 md:py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="backdrop-blur-sm bg-black/30 rounded-2xl p-6 md:p-8 border border-white/20">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 md:mb-6 font-serif magical-text">
              See What's Possible
            </h2>
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed font-sans">
              Real examples of how simple ideas become rich, interactive experiences
            </p>
          </div>

          <div className="space-y-6 md:space-y-8">
            {examples.map((example, index) => (
              <div key={index} className="flex flex-col lg:flex-row items-center gap-4 md:gap-6 p-4 md:p-6 bg-black/20 rounded-xl border border-white/10">
                <div className="flex-1 text-center lg:text-left">
                  <div className="inline-block px-3 py-1 bg-amber-500/20 text-amber-300 text-sm font-medium rounded-full mb-2">
                    {example.genre}
                  </div>
                  <p className="text-white font-serif text-lg md:text-xl mb-2">
                    "{example.prompt}"
                  </p>
                </div>
                
                <div className="flex items-center justify-center p-2">
                  <ArrowRight className="h-6 w-6 text-amber-400" />
                </div>
                
                <div className="flex-1 text-center lg:text-right">
                  <p className="text-gray-300 font-sans leading-relaxed">
                    {example.result}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExampleStoriesSection;
