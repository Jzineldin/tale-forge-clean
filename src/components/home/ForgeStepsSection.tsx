
import React from 'react';

const ForgeStepsSection: React.FC = () => {
  const steps = [
    {
      icon: '/images/icon-world.png',
      title: 'Design Your Setting',
      description: 'From a futuristic city to a quiet coastal town, describe any environment and our AI will bring it to life with rich detail.'
    },
    {
      icon: '/images/icon-hero.png',
      title: 'Create Your Characters',
      description: 'Shape your protagonist\'s personality, motivations, and relationships. The AI will remember every detail.'
    },
    {
      icon: '/images/icon-adventure.png',
      title: 'Live Your Story',
      description: 'Guide your character through a dynamic narrative where your choices have real consequences, crafted by our AI Storyteller.'
    }
  ];

  return (
    <section className="py-8 md:py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Semi-transparent backdrop for better readability */}
        <div className="backdrop backdrop-blur-sm bg-black/30 rounded-2xl p-6 md:p-8 border border-white/20">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 md:mb-6 font-serif magical-text">
              How Your Story Unfolds
            </h2>
          </div>

          <div className="features-grid grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {steps.map((step, index) => (
              <div key={index} className="feature-column text-center space-y-3 md:space-y-4">
                <div className="flex justify-center mb-3 md:mb-4">
                  <img
                    src={step.icon}
                    alt={`${step.title} Icon`}
                    className="w-16 h-16 md:w-20 md:h-20 object-contain"
                  />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-white font-serif">
                  {step.title}
                </h3>
                <p className="text-sm md:text-base text-gray-300 font-sans leading-relaxed px-2">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForgeStepsSection;
