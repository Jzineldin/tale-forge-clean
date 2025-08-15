
import React, { useState, useEffect } from 'react';
import { Sparkles, BookOpen, Feather, Wand2, Stars, Scroll } from 'lucide-react';

interface StoryCreationLoadingStateProps {
  message: string;
  submessage?: string;
}

const StoryCreationLoadingState: React.FC<StoryCreationLoadingStateProps> = ({
  message,
  submessage
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [magicalText, setMagicalText] = useState('');

  const steps = [
    { icon: Feather, text: "Weaving words into wonder...", color: "text-blue-400" },
    { icon: Wand2, text: "Conjuring magical scenes...", color: "text-purple-400" },
    { icon: Stars, text: "Crafting your adventure...", color: "text-amber-400" },
    { icon: Sparkles, text: "Almost ready...", color: "text-green-400" }
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
    }, 3000);

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
      {/* Floating magical particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-amber-400 rounded-full opacity-60 animate-magical-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
        {[...Array(8)].map((_, i) => (
          <div
            key={`star-${i}`}
            className="absolute w-0.5 h-0.5 bg-blue-400 rounded-full opacity-80 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 1}s`
            }}
          />
        ))}
      </div>

      <div className="w-full max-w-2xl bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 border-2 border-amber-500/40 backdrop-blur-lg shadow-2xl relative overflow-hidden rounded-3xl">
        {/* Animated border glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-amber-500/20 opacity-75 animate-pulse"></div>
        
        <div className="relative text-center space-y-8 py-12 px-8">
          {/* Main title with magical effect */}
          <div className="space-y-6">
            <div className="relative inline-block">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent">
                {message || "Crafting Your Tale"}
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
            
            {/* Floating magical elements around the spinner */}
            <div className="absolute -top-8 -left-8">
              <Sparkles className="h-6 w-6 text-amber-300 animate-bounce" style={{ animationDelay: '0s' }} />
            </div>
            <div className="absolute -top-8 -right-8">
              <BookOpen className="h-5 w-5 text-amber-200 animate-bounce" style={{ animationDelay: '0.5s' }} />
            </div>
            <div className="absolute -bottom-8 -left-8">
              <Scroll className="h-5 w-5 text-amber-400 animate-bounce" style={{ animationDelay: '1s' }} />
            </div>
            <div className="absolute -bottom-8 -right-8">
              <Wand2 className="h-5 w-5 text-amber-300 animate-bounce" style={{ animationDelay: '1.5s' }} />
            </div>
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
                  <step.icon className={`h-4 w-4 ${step.color}`} />
                  <span className={`text-sm font-medium ${
                    index === currentStep ? 'text-white' : 'text-gray-400'
                  }`}>
                    {step.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Submessage */}
          {submessage && (
            <p className="text-sm text-gray-400 mt-6">
              {submessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoryCreationLoadingState;
