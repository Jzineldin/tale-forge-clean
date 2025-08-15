
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, BookOpen, Users, Save, Smartphone } from 'lucide-react';

const CurrentFeatures: React.FC = () => {
  const workingFeatures = [
    {
      icon: <BookOpen className="h-5 w-5" />,
      title: "Interactive Storytelling",  
      description: "AI-powered story generation with multiple choice branching"
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: "10 Story Genres",
      description: "Epic Fantasy, Sci-Fi, Mystery, Horror, Romance, and more"
    },
    {
      icon: <Save className="h-5 w-5" />,
      title: "Story Persistence",
      description: "All stories are automatically saved and accessible anytime"
    },
    {
      icon: <Smartphone className="h-5 w-5" />,
      title: "Fully Responsive",
      description: "Optimized experience across desktop, tablet, and mobile"
    }
  ];

  return (
    <section className="redesign-section">
      <div className="redesign-container">
        <div className="space-y-6">
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="h-6 w-6 text-accent-emerald" />
              <h2 className="font-heading text-2xl md:text-3xl text-text-light">What Works Now</h2>
            </div>
            <p className="text-text-muted text-lg max-w-2xl mx-auto">
              Experience fully functional interactive storytelling with AI-powered narratives
            </p>
          </div>

          <div className="redesign-grid redesign-grid-2 max-w-4xl mx-auto">
            {workingFeatures.map((feature, index) => (
              <Card key={index} className="redesign-card border-accent-emerald/30 bg-accent-emerald/5 hover:bg-accent-emerald/10 group">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3 text-accent-emerald text-lg group-hover:text-accent-emerald/80 transition-colors">
                    <span>{feature.icon}</span>
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-text-light leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CurrentFeatures;
