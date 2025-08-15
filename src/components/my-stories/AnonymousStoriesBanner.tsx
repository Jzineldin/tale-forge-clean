
import { Link } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Clock, AlertTriangle, LogIn, UserPlus } from 'lucide-react';

const AnonymousStoriesBanner = () => {
  return (
    <Alert className="mb-6 border-brand-indigo/50 bg-brand-indigo/10">
      <AlertTriangle className="h-4 w-4 text-brand-indigo" />
      <AlertDescription className="text-indigo-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-orange-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-orange-100 mb-1">
                Temporary Stories (Saved Locally)
              </p>
              <p className="text-sm text-orange-200">
                Your stories are saved in your browser's local storage. They will be lost if you clear your browser data or use a different device.
              </p>
              <p className="text-sm text-green-300 mt-1 font-medium">
                Sign in or create an account to save your stories permanently!
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
            <Link to="/auth/signin">
              <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto">
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            </Link>
            <Link to="/auth/signup">
              <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white w-full sm:w-auto">
                <UserPlus className="h-4 w-4 mr-2" />
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default AnonymousStoriesBanner;
