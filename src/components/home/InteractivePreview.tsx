
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Zap } from 'lucide-react';

const InteractivePreview: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  
  const storySteps = [
    {
      title: "Enter Your Prompt",
      description: "Start with any idea, sentence, or scenario",
      example: "A mysterious letter arrives at midnight...",
      action: "Type your story seed"
    },
    {
      title: "Choose Your Genre",
      description: "Select from 10 immersive story modes",
      example: "Epic Fantasy • Sci-Fi Thriller • Mystery Detective",
      action: "Pick your adventure style"
    },
    {
      title: "Make Choices",
      description: "Guide your story with meaningful decisions",
      example: "Will you open the letter or investigate the messenger?",
      action: "Shape the narrative"
    },
    {
      title: "Experience the Story",
      description: "Watch your choices unfold into an epic tale",
      example: "Your story branches and evolves based on your decisions",
      action: "Live your adventure"
    }
  ];

  const nextStep = () => {
    setCurrentStep((prev) => (prev + 1) % storySteps.length);
  };

  const currentStoryStep = storySteps[currentStep];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-2">
          <Play className="h-6 w-6 text-purple-400" />
          <h2 className="text-2xl md:text-3xl font-bold text-white">How It Works</h2>
        </div>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto">
          Experience the magic of interactive storytelling in four simple steps
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <Card className="border-purple-500/30 bg-purple-50/5 backdrop-blur-sm min-h-[300px] relative overflow-hidden">
          <div className="absolute top-4 right-4 text-purple-300 text-sm font-medium">
            Step {currentStep + 1} of {storySteps.length}
          </div>
          
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-purple-300 text-xl">
              <Zap className="h-6 w-6 text-purple-400" />
              {currentStoryStep.title}
            </CardTitle>
            <CardDescription className="text-purple-100/90 text-lg leading-relaxed">
              {currentStoryStep.description}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-black/30 rounded-lg p-4 border border-purple-500/20">
              <p className="text-purple-200 italic text-center text-base leading-relaxed">
                "{currentStoryStep.example}"
              </p>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {storySteps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentStep 
                        ? 'bg-purple-400 scale-125' 
                        : index < currentStep 
                          ? 'bg-purple-500/60' 
                          : 'bg-purple-500/20'
                    }`}
                  />
                ))}
              </div>
              
              <Button
                onClick={nextStep}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium px-6"
              >
                {currentStep === storySteps.length - 1 ? 'Start Over' : 'Next Step'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InteractivePreview;
