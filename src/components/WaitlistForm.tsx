import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Mail, Users, Star } from 'lucide-react';

const WaitlistForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !name) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('waitlist')
        .insert([
          {
            email: email.toLowerCase().trim(),
            name: name.trim(),
            marketing_consent: marketingConsent
          }
        ]);

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast.error('This email is already on our waitlist!');
        } else {
          throw error;
        }
      } else {
        setIsSubmitted(true);
        toast.success('Welcome to the waitlist! We\'ll be in touch soon.');
      }
    } catch (error) {
      console.error('Waitlist error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="bg-slate-800/90 border-amber-400 backdrop-blur-sm max-w-md mx-auto">
        <CardContent className="pt-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Star className="h-12 w-12 text-amber-400" />
              <div className="absolute inset-0 h-12 w-12 border-2 border-amber-400 rounded-full animate-ping opacity-30"></div>
            </div>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">You're on the list!</h3>
          <p className="text-gray-300 mb-4">
            Thank you for joining our waitlist. We'll notify you when Tale Forge is ready for you to explore.
          </p>
          <div className="flex items-center justify-center gap-2 text-amber-400">
            <Users className="h-4 w-4" />
            <span className="text-sm">Join thousands of storytellers</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800/90 border-slate-600 backdrop-blur-sm max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-white text-xl flex items-center justify-center gap-2">
          <Mail className="h-5 w-5 text-amber-400" />
          Join the Waitlist
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="bg-slate-700 border-slate-600 text-white placeholder-gray-400"
            />
          </div>
          
          <div>
            <Input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-slate-700 border-slate-600 text-white placeholder-gray-400"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="marketing"
              checked={marketingConsent}
              onCheckedChange={(checked) => setMarketingConsent(checked === true)}
              className="border-slate-600"
            />
            <label
              htmlFor="marketing"
              className="text-sm text-gray-300 cursor-pointer"
            >
              I'd like to receive updates about Tale Forge features and news
            </label>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
          >
            {isSubmitting ? 'Joining...' : 'Join Waitlist'}
          </Button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-4">
          We respect your privacy. Unsubscribe at any time.
        </p>
      </CardContent>
    </Card>
  );
};

export default WaitlistForm;
