
import React from 'react';
import { Volume2, Play, Users, Palette } from 'lucide-react';

const ComingSoon: React.FC = () => {
  const features = [
    {
      icon: Volume2,
      title: "AI Narration",
      description: "Professional voice acting"
    },
    {
      icon: Play,
      title: "Story Videos",
      description: "Animated sequences"
    },
    {
      icon: Users,
      title: "Collaborative Stories",
      description: "Share with friends"
    },
    {
      icon: Palette,
      title: "Custom Themes",
      description: "Personalize your experience"
    }
  ];

  return (
    <section className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-4xl font-serif font-bold text-white">
            Coming Soon
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed font-sans">
            Exciting new features to make your storytelling experience even more immersive
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center space-y-4 group">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/25 group-hover:shadow-xl group-hover:shadow-amber-500/40 transition-all duration-300 group-hover:scale-110">
                <feature.icon className="h-8 w-8 text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white font-serif">
                  {feature.title}
                </h3>
                <p className="text-gray-300 leading-relaxed text-sm font-sans">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ComingSoon;
