import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, RefreshCw, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<'success' | 'error' | 'verifying'>('verifying');
  const [errorMessage, setErrorMessage] = useState('');
  
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!sessionId) {
      setVerificationStatus('error');
      setErrorMessage('No session ID found in URL');
      setIsVerifying(false);
      return;
    }

    verifyPayment();
  }, [sessionId]);

  const verifyPayment = async () => {
    try {
      setIsVerifying(true);
      
      // Call the verify-payment function
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: { session_id: sessionId }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.success) {
        setVerificationStatus('success');
        toast.success('Payment successful! Your subscription has been activated.');
        
        // Redirect to account page after 3 seconds
        setTimeout(() => {
          navigate('/account');
        }, 3000);
      } else {
        throw new Error(data.error || 'Payment verification failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setVerificationStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error occurred');
      toast.error('Payment verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRetry = () => {
    setVerificationStatus('verifying');
    verifyPayment();
  };

  const handleGoToAccount = () => {
    navigate('/account');
  };

  const handleGoToPricing = () => {
    navigate('/pricing');
  };

  if (verificationStatus === 'verifying') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <RefreshCw className="w-12 h-12 mx-auto text-blue-600 animate-spin" />
              <h2 className="text-xl font-semibold">Verifying Payment</h2>
              <p className="text-gray-600">
                Please wait while we verify your payment and activate your subscription...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (verificationStatus === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-xl text-green-800">Payment Successful!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Your subscription has been successfully activated. You now have access to all premium features.
            </p>
            <p className="text-sm text-gray-500">
              Redirecting to your account dashboard in a few seconds...
            </p>
            <div className="space-y-2">
              <Button onClick={handleGoToAccount} className="w-full">
                <CreditCard className="w-4 h-4 mr-2" />
                Go to Account Dashboard
              </Button>
              <Button onClick={() => navigate('/')} variant="outline" className="w-full">
                Continue Creating Stories
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-xl text-red-800">Payment Verification Failed</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            We couldn't verify your payment. This might be a temporary issue.
          </p>
          {errorMessage && (
            <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {errorMessage}
            </p>
          )}
          <div className="space-y-2">
            <Button onClick={handleRetry} disabled={isVerifying} className="w-full">
              <RefreshCw className={`w-4 h-4 mr-2 ${isVerifying ? 'animate-spin' : ''}`} />
              {isVerifying ? 'Retrying...' : 'Retry Verification'}
            </Button>
            <Button onClick={handleGoToAccount} variant="outline" className="w-full">
              <CreditCard className="w-4 h-4 mr-2" />
              Go to Account Dashboard
            </Button>
            <Button onClick={handleGoToPricing} variant="ghost" className="w-full">
              Back to Pricing
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
