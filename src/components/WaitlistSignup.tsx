import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Mail, Users, CheckCircle, Star } from 'lucide-react';
import { trackWaitlistSignup } from '@/utils/analytics';

import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
const waitlistSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  marketingConsent: z.boolean().default(false),
});

type WaitlistFormData = z.infer<typeof waitlistSchema>;

interface WaitlistSignupProps {
  variant?: 'card' | 'inline';
  className?: string;
}

const WaitlistSignup: React.FC<WaitlistSignupProps> = ({ variant = 'card', className = '' }) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<WaitlistFormData>({
    resolver: zodResolver(waitlistSchema),
    defaultValues: {
      name: '',
      email: '',
      marketingConsent: false,
    },
  });

  const onSubmit = async (data: WaitlistFormData) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('waitlist')
        .insert({
          name: data.name,
          email: data.email,
          marketing_consent: data.marketingConsent,
        });

      if (error) {
        if (error.code === '23505') {
          toast.error('This email is already on our waitlist! You\'ll be notified when new features are ready.');
        } else {
          toast.error('Failed to join waitlist. Please try again.');
        }
        return;
      }

      setIsSubmitted(true);
      trackWaitlistSignup(data.email);
      toast.success('Welcome to the waitlist! We\'ll keep you updated on new features.');
    } catch (error) {
      console.error('Error joining waitlist:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className={`${className} border-green-500/40 bg-green-50/10 backdrop-blur-sm shadow-2xl`}>
        <CardContent className="p-6 text-center space-y-4">
          <div className="relative">
            <CheckCircle className="h-16 w-16 text-green-400 mx-auto" />
            <Star className="h-6 w-6 text-white absolute -top-1 -right-1 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-green-300">You're on the list!</h3>
            <p className="text-green-200 leading-relaxed">
              Thank you for joining our waitlist. We'll notify you about new features, 
              premium voices, and exclusive content as they become available.
            </p>
          </div>
          <div className="bg-green-900/20 rounded-lg p-3 border border-green-500/30">
            <p className="text-green-100 text-sm">
              💡 <strong>Pro tip:</strong> You can start creating stories right now! 
              All current features are fully functional.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-amber-200 font-medium">Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Your name"
                  className="bg-black/70 border-amber-500/60 focus:ring-amber-400 focus:border-amber-400 text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-300 focus:bg-black/80 min-h-[48px] text-base"
                  {...field}
                  aria-label="Your name"
                />
              </FormControl>
              <FormMessage className="text-red-300" />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-amber-200 font-medium">Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="your.email@example.com"
                  className="bg-black/70 border-amber-500/60 focus:ring-amber-400 focus:border-amber-400 text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-300 focus:bg-black/80 min-h-[48px] text-base"
                  {...field}
                  aria-label="Email address"
                />
              </FormControl>
              <FormMessage className="text-red-300" />
            </FormItem>
          )}
        />
        
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-medium transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <LoadingSpinner size="sm" className="h-4 w-4 " />
              Joining...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Join Waitlist
            </div>
          )}
        </Button>
        
        <p className="text-xs text-amber-200/80 text-center leading-relaxed">
          Get notified about new features, premium voices, and exclusive content
        </p>
      </form>
    </Form>
  );

  if (variant === 'inline') {
    return <div className={className}>{formContent}</div>;
  }

  return (
    <Card className={`${className} border-amber-500/40 bg-amber-50/10 backdrop-blur-sm shadow-2xl hover:shadow-3xl transition-all duration-300`}>
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-amber-300">
          <Mail className="h-5 w-5" />
          Join the Waitlist
        </CardTitle>
        <CardDescription className="text-amber-100 leading-relaxed">
          Get early access to new features, premium voices, and exclusive storytelling content
        </CardDescription>
      </CardHeader>
      <CardContent>
        {formContent}
      </CardContent>
    </Card>
  );
};

export default WaitlistSignup;
