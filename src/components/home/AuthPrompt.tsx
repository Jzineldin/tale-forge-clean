
import React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const AuthPrompt: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
      <Card className="border-amber-500/40 bg-black/30 backdrop-blur-md shadow-2xl magical-glow">
        <CardHeader className="text-center pb-4">
          <CardTitle className="flex items-center justify-center gap-2 text-amber-300 text-xl font-serif">
            <Sparkles className="h-6 w-6" />
            Join as a Founder
          </CardTitle>
          <CardDescription className="text-amber-100 text-lg leading-relaxed font-sans">
            Be among the first 200 users and unlock exclusive founder benefits! Limited founder spots available.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2 space-y-4">
          <Button 
            onClick={() => navigate('/auth/signup')} 
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-lg font-medium border-0 transition-all duration-300 py-4 font-sans"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Claim Your Founder Spot
          </Button>
          
          <div className="text-center pt-2">
            <p className="text-amber-300/70 text-sm">
              🏆 First 25: Pro for Life | Next 75: 50% Off | Next 100: 25% Off
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-green-500/40 bg-green-50/10 backdrop-blur-md shadow-2xl">
        <CardHeader className="text-center pb-4">
          <CardTitle className="flex items-center justify-center gap-2 text-green-300 text-xl font-serif">
            <Sparkles className="h-6 w-6" />
            Start Creating Now
          </CardTitle>
          <CardDescription className="text-green-100 text-lg leading-relaxed font-sans">
            Jump right in and start creating your personalized stories instantly. No account needed to get started!
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2 space-y-4">
          <Button 
            onClick={() => navigate('/create/genre')} 
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-lg font-medium border-0 transition-all duration-300 py-4 font-sans"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Create Your First Story
          </Button>
          
          <div className="text-center pt-2">
            <p className="text-green-300/70 text-sm">
              ✨ Full story creation available without signup
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPrompt;
