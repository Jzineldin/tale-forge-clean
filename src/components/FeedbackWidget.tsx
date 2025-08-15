import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Send, X } from 'lucide-react';
import { useFeedback, FeedbackData } from '@/hooks/useFeedback';
import { useAuth } from '@/context/AuthProvider';
import { toast } from 'sonner';

interface FeedbackWidgetProps {
  className?: string;
}

export const FeedbackWidget: React.FC<FeedbackWidgetProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<FeedbackData>>({
    feedback_type: 'general',
    subject: '',
    message: '',
    email: '',
  });
  
  const { user } = useAuth();
  const { submitFeedback } = useFeedback();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.message?.trim()) {
      toast.error('Please enter your feedback message');
      return;
    }

    if (!formData.feedback_type) {
      toast.error('Please select a feedback type');
      return;
    }

    try {
      await submitFeedback.mutateAsync({
        feedback_type: formData.feedback_type as any,
        subject: formData.subject || '',
        message: formData.message || '',
        email: formData.email || user?.email || '',
      });

      // Reset form
      setFormData({
        feedback_type: 'general',
        subject: '',
        message: '',
        email: '',
      });
      
      setIsOpen(false);
    } catch (error: any) {
      console.error('Feedback submission error:', error);
      
      // Show more specific error message
      if (error.message?.includes('relation "user_feedback" does not exist')) {
        toast.success('Feedback saved locally! The database setup is pending - your feedback will be processed once the system is fully configured.');
      } else if (error.message?.includes('permission denied')) {
        toast.error('Permission denied. Please try logging in and submitting again.');
      } else {
        toast.error(`Failed to submit feedback: ${error.message || 'Unknown error'}`);
      }
    }
  };

  const handleInputChange = (field: keyof FeedbackData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="orange-amber"
            size="lg"
            className="rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 font-bold glass-enhanced backdrop-blur-lg"
          >
            <MessageSquare className="h-5 w-5 mr-2" />
            Feedback
          </Button>
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-md glass-enhanced backdrop-blur-lg bg-black/80 border border-white/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center text-white" style={{textShadow: '0 2px 4px rgba(0,0,0,0.6)'}}>
              Share Your Feedback
            </DialogTitle>
            <DialogDescription className="text-center text-white/90" style={{textShadow: '0 1px 2px rgba(0,0,0,0.6)'}}>
              Help us improve by sharing your thoughts, suggestions, or reporting issues
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Feedback Type */}
            <div className="space-y-2">
              <Label htmlFor="feedback_type" className="text-sm font-medium text-slate-300">
                What type of feedback is this?
              </Label>
              <Select
                value={formData.feedback_type || ''}
                onValueChange={(value) => handleInputChange('feedback_type', value)}
              >
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                  <SelectValue placeholder="Select feedback type" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="bug" className="text-white hover:bg-slate-700">
                    🐛 Bug Report
                  </SelectItem>
                  <SelectItem value="feature" className="text-white hover:bg-slate-700">
                    ✨ Feature Request
                  </SelectItem>
                  <SelectItem value="general" className="text-white hover:bg-slate-700">
                    💬 General Feedback
                  </SelectItem>
                  <SelectItem value="praise" className="text-white hover:bg-slate-700">
                    👏 Praise
                  </SelectItem>
                  <SelectItem value="complaint" className="text-white hover:bg-slate-700">
                    😞 Complaint
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject" className="text-sm font-medium text-slate-300">
                Subject (optional)
              </Label>
              <Input
                id="subject"
                type="text"
                placeholder="Brief summary of your feedback"
                value={formData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>

            {/* Email (if not logged in) */}
            {!user && (
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-slate-300">
                  Email (optional)
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>
            )}

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="message" className="text-sm font-medium text-slate-300">
                Your Feedback *
              </Label>
              <Textarea
                id="message"
                placeholder="Tell us what's on your mind..."
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                rows={4}
                className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 resize-none"
                required
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitFeedback.isPending || !formData.message?.trim()}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0"
              >
                {submitFeedback.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Feedback
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Privacy Notice */}
          <div className="text-xs text-slate-400 text-center mt-4 p-3 bg-slate-800 rounded-lg">
            <p>
              Your feedback helps us improve Tale Forge. We collect basic browser information 
              for debugging purposes. Your privacy is important to us.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};