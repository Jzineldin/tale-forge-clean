import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { validateInput, sanitizeContent, rateLimiter } from '@/utils/security';
import { Mail, Shield, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const WaitlistSignupSecure: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    marketingConsent: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    try {
      validateInput.email(formData.email);
    } catch (error: any) {
      newErrors.email = error.message;
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Name cannot exceed 100 characters';
    }

    // Security check for name field
    if (formData.name.match(/<script|javascript:|vbscript:|onload=|onerror=/i)) {
      newErrors.name = 'Invalid characters detected in name';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // Rate limiting
    const clientId = `waitlist_${formData.email}`;
    if (!rateLimiter.isAllowed(clientId)) { // 3 requests per 5 minutes per email
      toast.error('Too many signup attempts. Please wait before trying again.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Sanitize inputs
      const sanitizedName = sanitizeContent.text(formData.name);
      const sanitizedEmail = validateInput.email(formData.email);

      const { error } = await supabase
        .from('waitlist')
        .insert([
          {
            name: sanitizedName,
            email: sanitizedEmail,
            marketing_consent: formData.marketingConsent,
          },
        ]);

      if (error) {
        if (error.code === '23505') {
          toast.error('You are already on the waitlist!');
        } else {
          throw error;
        }
      } else {
        toast.success('Successfully joined the waitlist! We\'ll be in touch soon.');
        setFormData({ name: '', email: '', marketingConsent: false });
      }
    } catch (error: any) {
      console.error('Waitlist signup error:', error);
      toast.error('Failed to join waitlist. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-slate-800/50 border-slate-600 backdrop-blur-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-white flex items-center justify-center gap-2">
          <Mail className="h-6 w-6 text-blue-400" />
          Join the Waitlist
        </CardTitle>
        <CardDescription className="text-gray-300">
          Be the first to access premium features and early updates
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-gray-300">
              Name
            </label>
            <Input
              id="name"
              type="text"
              placeholder="Your full name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400"
              disabled={isSubmitting}
              maxLength={100}
            />
            {errors.name && (
              <Alert variant="destructive" className="py-2">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm">{errors.name}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-300">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400"
              disabled={isSubmitting}
            />
            {errors.email && (
              <Alert variant="destructive" className="py-2">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm">{errors.email}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="marketing"
              checked={formData.marketingConsent}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, marketingConsent: checked as boolean }))
              }
              disabled={isSubmitting}
            />
            <label
              htmlFor="marketing"
              className="text-sm text-gray-300 cursor-pointer"
            >
              I agree to receive marketing communications
            </label>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Joining...
              </div>
            ) : (
              'Join Waitlist'
            )}
          </Button>

          <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mt-4">
            <Shield className="h-3 w-3" />
            <span>Your information is secure and protected</span>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default WaitlistSignupSecure;
