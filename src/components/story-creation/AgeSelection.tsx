import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Baby, GraduationCap, Users, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';

export interface AgeSelectionProps {
  onComplete: (age: number) => void;
}

const AgeSelection: React.FC<AgeSelectionProps> = ({
  onComplete
}) => {
  const navigate = useNavigate();
  const [age, setAge] = React.useState<number>(7);
  // Advanced fine-tuning removed
  
  const ages = [
    { 
      range: '4-6', 
      Icon: Baby, 
      label: 'Little Heroes',
      description: 'Simple stories with big pictures and easy words',
      color: 'from-pink-400 to-rose-500',
      bgColor: 'bg-pink-500/10',
      borderColor: 'border-pink-400/30',
      iconColor: 'text-pink-400'
    },
    { 
      range: '7-9', 
      Icon: GraduationCap, 
      label: 'Young Adventurers',
      description: 'Fun adventures with friends and learning',
      color: 'from-amber-400 to-orange-500',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-400/30',
      iconColor: 'text-amber-400'
    },
    { 
      range: '10-12', 
      Icon: Users, 
      label: 'Epic Explorers',
      description: 'Exciting stories with deeper thinking and STEM',
      color: 'from-blue-400 to-indigo-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-400/30',
      iconColor: 'text-blue-400'
    }
  ];

  const handleAgeSelect = (ageRange: string) => {
    // Map range midpoints to fill slider quickly
    const midpoint = ageRange === '4-6' ? 5 : ageRange === '7-9' ? 8 : 11;
    setAge(midpoint);
  };

  return (
    <div className="page-container relative overflow-hidden">

      <div className="page-content relative z-20">
        <div className="container mx-auto px-4 py-8 md:py-16">
          <div className="w-full max-w-5xl mx-auto">
            {/* Header */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-3 mb-6 px-6 py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span className="text-amber-400 font-medium text-sm">Story Creation</span>
              </div>
              
              <h1 className="tale-forge-title mb-6 leading-tight">
                Choose Your Age Group
              </h1>
              
              <p className="text-body-large text-gray-300 max-w-2xl mx-auto leading-relaxed">
                We'll craft the perfect story experience tailored to your age and interests
              </p>
            </div>

            {/* Age Selection Cards */}
            <div className="relative">
              <div className="glass-enhanced backdrop-blur-lg bg-black/40 border border-white/20 rounded-2xl p-8 md:p-10 lg:p-12 shadow-xl">
                <CardHeader className="text-center pb-8 border-none">
                  <CardTitle className="text-title text-white mb-3">
                    Tell us about you
                  </CardTitle>
                  <CardDescription className="text-body text-gray-300 max-w-2xl mx-auto">
                    We'll tailor the story's length, vocabulary, and themes to create the perfect adventure for your age group.
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-8">
                  {/* Primary age selection - three beautiful cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {ages.map(({ range, Icon, label, description }) => {
                      const selected =
                        (range === '4-6' && age >= 4 && age <= 6) ||
                        (range === '7-9' && age >= 7 && age <= 9) ||
                        (range === '10-12' && age >= 10 && age <= 12);
                      
                      return (
                        <Card
                          key={range}
                          variant="default"
                          className={`relative cursor-pointer rounded-2xl group transition-transform duration-200 ${
                            selected 
                              ? 'ring-1 ring-amber-300/40 border-amber-300/40 bg-white/20' 
                              : 'hover:-translate-y-1'
                          } bg-white/12 backdrop-blur-sm border border-white/15 shadow-md`}
                          onClick={() => handleAgeSelect(range)}
                        >
                          <div className="p-6 text-center">
                            {/* Icon with gradient background */}
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 bg-amber-400/15 ring-1 ring-amber-400/30">
                              <Icon className="w-8 h-8 text-white" />
                            </div>
                            
                            {/* Content */}
                             <h3 className="text-heading text-white mb-2">
                              {label}
                            </h3>
                             <p className="text-body text-gray-300 mb-3">
                              {description}
                            </p>
                             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/15 border border-amber-300/30">
                              <span className="text-amber-300 font-semibold text-sm">{range} years</span>
                            </div>
                          </div>
                          
                          {/* Selection indicator */}
                          {selected && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          )}
                        </Card>
                      );
                    })}
                  </div>

                  {/* Advanced age fine-tuning removed per request */}
                </CardContent>
                
                {/* Continue Button */}
                <CardFooter className="justify-center pt-8 border-none">
                  <Button
                    variant="orange-amber"
                    size="lg"
                    className="group px-8 py-4 text-lg font-semibold"
                    onClick={() => {
                      onComplete(age);
                      navigate(`/create/genre?age=${age}`);
                    }}
                  >
                    Continue to Genre
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </CardFooter>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for slider */}
      <style>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #f59e0b, #f97316);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        }
        
        .slider-thumb::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #f59e0b, #f97316);
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        }
      `}</style>
    </div>
  );
};

export default AgeSelection; 