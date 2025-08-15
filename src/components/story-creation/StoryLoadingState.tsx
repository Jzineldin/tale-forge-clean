
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, Wand2, Stars, Sparkles, BookOpen, Feather } from 'lucide-react';


interface StoryLoadingStateProps {
  onExit?: () => void;
}

const StoryLoadingState: React.FC<StoryLoadingStateProps> = ({
  onExit
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [magicalText, setMagicalText] = useState('');

  const steps = [
    { icon: Feather, text: "Weaving words into wonder...", delay: 0 },
    { icon: Wand2, text: "Conjuring magical scenes...", delay: 4000 },
    { icon: Stars, text: "Crafting your adventure...", delay: 8000 },
    { icon: Sparkles, text: "Almost ready...", delay: 12000 }
  ];

  const magicalPhrases = [
    "The tale begins to shimmer...",
    "Characters are awakening...",
    "Your story is taking shape...",
    "Magic is flowing through words...",
    "The adventure awaits...",
    "Worlds are being born..."
  ];

  useEffect(() => {
    // Cycle through steps
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 4000);

    // Cycle through magical text
    const textInterval = setInterval(() => {
      setMagicalText(magicalPhrases[Math.floor(Math.random() * magicalPhrases.length)]);
    }, 2500);

    return () => {
      clearInterval(stepInterval);
      clearInterval(textInterval);
    };
  }, []);

  

  return (
    <div 
      className="min-h-screen bg-slate-900 relative overflow-hidden flex items-center justify-center"
      style={{
        backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.8)), url('/images/Flux_Dev_Lonely_astronaut_sitting_on_a_pile_of_books_in_space__0.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="flex items-center justify-center w-full relative">
        {/* Floating magical particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-amber-400 rounded-full opacity-70 animate-magical-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`
              }}
            />
          ))}
        </div>

        <Card className="w-full max-w-3xl bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 border-2 border-amber-500/40 backdrop-blur-lg shadow-2xl relative overflow-hidden">
          {/* Animated border glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-amber-500/20 opacity-75 animate-pulse"></div>
          
          <CardContent className="relative text-center space-y-10 py-12 px-8">
            {/* Main title with magical effect */}
            <div className="space-y-6">
              <div className="relative inline-block">
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent">
                  Crafting Your Tale
                </h1>
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-400/20 to-yellow-400/20 blur-lg"></div>
              </div>
              
              <p className="text-xl text-gray-300 font-medium animate-magical-fade-in">
                {magicalText || "Your story is being born..."}
              </p>
            </div>

            {/* Central magical animation */}
            <div className="relative flex items-center justify-center py-8">
              {/* Main circular loading spinner */}
              <div className="relative z-10 bg-slate-800 rounded-full p-6 border-2 border-amber-400/50 shadow-lg">
                <div className="w-16 h-16 border-4 border-amber-400/30 border-t-amber-400 rounded-full animate-spin"></div>
              </div>
              
              {/* Pulsing glow */}
              <div className="absolute inset-0 bg-amber-400/10 rounded-full animate-ping"></div>
            </div>

            {/* Dynamic progress indicator */}
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-4">
                {steps.map((step, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-3 px-4 py-2 rounded-full transition-all duration-700 ${
                      index === currentStep
                        ? 'bg-amber-500/30 border-2 border-amber-400/60 scale-110'
                        : index < currentStep
                        ? 'bg-green-500/20 border border-green-400/40'
                        : 'bg-slate-700/50 border border-slate-600/30'
                    }`}
                  >
                    <step.icon 
                      className={`h-5 w-5 transition-colors duration-500 ${
                        index === currentStep
                          ? 'text-amber-300 animate-pulse'
                          : index < currentStep
                          ? 'text-green-400'
                          : 'text-gray-500'
                      }`} 
                    />
                    <span 
                      className={`text-sm font-medium transition-colors duration-500 ${
                        index === currentStep
                          ? 'text-amber-200'
                          : index < currentStep
                          ? 'text-green-300'
                          : 'text-gray-400'
                      }`}
                    >
                      {step.text}
                    </span>
                  </div>
                ))}
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-400 to-purple-400 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Story creation tip */}
            <div className="bg-slate-800/60 border border-amber-500/30 rounded-xl p-6 mx-auto max-w-md">
              <div className="flex items-center gap-3 mb-3">
                <BookOpen className="h-5 w-5 text-amber-400" />
                <span className="text-amber-300 font-semibold">Did you know?</span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                Each story is uniquely crafted by AI to match your chosen adventure. 
                No two tales are ever the same!
              </p>
            </div>

            {/* Exit button with enhanced styling */}
            <Button 
              onClick={onExit} 
              variant="outline" 
              className="group mt-8 bg-slate-800/50 border-amber-500/50 text-amber-300 hover:bg-amber-500/20 hover:text-amber-200 hover:border-amber-400 hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-300 px-8 py-3"
              size="lg"
            >
              <Home className="mr-3 h-5 w-5 group-hover:animate-pulse" />
              Return to Stories
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StoryLoadingState;
