

import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';

const AuthButtons = () => {
  return (
    <div className="flex items-center gap-2">
      <Link
        to="/auth/signin"
        className="flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-300 text-slate-300 hover:text-white hover:bg-slate-800/50 touch-manipulation select-none"
      >
        <User className="h-4 w-4" />
        <span>Sign In</span>
      </Link>
      <Link
        to="/auth/signup"
        className="flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-300 bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg hover:from-amber-600 hover:to-amber-700 touch-manipulation select-none"
      >
        <span>Sign Up</span>
      </Link>
    </div>
  );
};

export default AuthButtons;
