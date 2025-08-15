
import React from 'react';
import { Users, Heart, Share, Zap } from 'lucide-react';

const WhyTaleForgeWorksSection: React.FC = () => {
  const benefits = [
    {
      icon: Users,
      title: 'Perfect for All Ages',
      description: 'From bedtime stories for kids to epic adventures for adults - everyone can create and enjoy'
    },
    {
      icon: Zap,
      title: 'No Writing Experience Needed',
      description: 'Just describe your idea and let our AI handle the storytelling, imagery, and narration'
    },
    {
      icon: Heart,
      title: 'Stories You Own',
      description: 'Save, revisit, and continue your stories anytime. Your creativity, permanently preserved'
    },
    {
      icon: Share,
      title: 'Built to Share',
      description: 'Create stories to enjoy alone or share with family and friends for collaborative adventures'
    }
  ];

  return (
    <section className="py-8 md:py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="backdrop-blur-sm bg-black/30 rounded-2xl p-6 md:p-8 border border-white/20">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 md:mb-6 font-serif magical-text">
              Why Tale Forge Works
            </h2>
            <p className="text-lg md:text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed font-sans">
              We've made interactive storytelling accessible to everyone - no technical skills required, 
              just imagination and curiosity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex gap-4 p-4 md:p-6 bg-black/20 rounded-xl border border-white/10">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/25">
                    <benefit.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-white font-serif mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-sm md:text-base text-gray-300 font-sans leading-relaxed">
                    {benefit.description}
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

export default WhyTaleForgeWorksSection;
