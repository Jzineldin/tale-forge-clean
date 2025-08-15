
import React from 'react';
import { Wand2, MessageSquare, BookOpen, Sparkles } from 'lucide-react';

const HowItWorks: React.FC = () => {
  const steps = [
    {
      icon: Wand2,
      title: "Choose Your Genre",
      description: "Select from 10 immersive story modes to set the perfect tone for your adventure."
    },
    {
      icon: MessageSquare,
      title: "Describe Your Vision",
      description: "Share your story idea and our AI will craft a personalized beginning that captures your imagination."
    },
    {
      icon: BookOpen,
      title: "Make Choices",
      description: "Guide your story's direction by making decisions that shape the plot and determine your character's fate."
    },
    {
      icon: Sparkles,
      title: "Experience Magic",
      description: "Watch your choices unfold into an epic tale with AI-generated text, images, and audio that adapt to your unique journey."
    }
  ];

  return (
    <section className="py-12 px-4" id="how-it-works">
      <div className="max-w-6xl mx-auto">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-4xl font-serif font-bold text-white">
            How It Works
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed font-sans">
            Creating your personalized interactive story is simple and magical
          </p>
        </div>

        {/* Horizontal stepper */}
        <div className="relative mb-16">
          {/* Connection line */}
          <div className="absolute top-8 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent hidden lg:block"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center space-y-4 group relative">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/25 group-hover:shadow-xl group-hover:shadow-amber-500/40 transition-all duration-300 group-hover:scale-110 z-10 relative">
                  <step.icon className="h-8 w-8 text-white" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white font-serif">
                    {step.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed text-base font-sans">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <div className="inline-flex items-center gap-4 p-6 bg-black/30 border border-white/10 rounded-2xl backdrop-blur-sm magical-glow">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white font-medium font-sans">Currently Working:</span>
            </div>
            <span className="text-gray-300 font-sans">Story Generation, Image Creation, Choice-Based Narratives</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
