
import React from 'react';
import { Star, Users, BookOpen, Sparkles } from 'lucide-react';

const SocialProof: React.FC = () => {
  const stats = [
    {
      icon: <Users className="h-8 w-8" />,
      value: "100+",
      label: "Beta Users",
      color: "text-blue-400"
    },
    {
      icon: <BookOpen className="h-8 w-8" />,
      value: "500+",
      label: "Stories Created",
      color: "text-emerald-400"
    },
    {
      icon: <Sparkles className="h-8 w-8" />,
      value: "10",
      label: "Story Genres",
      color: "text-purple-400"
    }
  ];

  const testimonials = [
    {
      name: "Alex Chen",
      role: "Creative Writer",
      content: "Tale Forge has transformed how I approach storytelling. The interactive choices make every adventure unique and engaging.",
      rating: 5
    },
    {
      name: "Morgan Taylor",
      role: "Game Developer",
      content: "The narrative complexity and user experience are impressive. This represents the future of interactive storytelling.",
      rating: 5
    },
    {
      name: "Jordan Smith",
      role: "Educator",
      content: "My students love using Tale Forge for creative writing. It sparks imagination and encourages storytelling like nothing else.",
      rating: 5
    }
  ];

  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-white">
            Join Our Growing Community
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Discover what creators are saying about Tale Forge
          </p>
        </div>

        {/* Stats Grid */}
        <div className="flex justify-center mb-16">
          <div className="grid grid-cols-3 gap-8 md:gap-16 max-w-2xl">
            {stats.map((stat, index) => (
              <div key={index} className="text-center space-y-3">
                <div className={`flex justify-center ${stat.color}`}>
                  {stat.icon}
                </div>
                <div className="space-y-1">
                  <div className="text-2xl md:text-3xl font-bold text-white">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-400">
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-center text-white mb-8">
            What Our Beta Users Say
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="p-6 rounded-xl bg-white/5 border border-white/20"
              >
                <div className="space-y-4">
                  <div className="flex gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-white text-white" />
                    ))}
                  </div>
                  <p className="text-gray-300 leading-relaxed">
                    "{testimonial.content}"
                  </p>
                  <div className="border-t border-white/10 pt-4">
                    <div className="font-semibold text-white">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-400">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
