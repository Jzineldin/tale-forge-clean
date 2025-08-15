
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthProvider';
import { useSubscription } from '@/hooks/useSubscription';
import { useAdmin } from '@/context/AdminContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { User, Settings, BookOpen, LogOut, Shield, Search, Crown, CreditCard } from 'lucide-react';
import { userDebug, adminDebug } from '@/utils/secureLogger';
import { mapTierToDisplay } from '@/utils/tierMapping';

const UserMenu = () => {
  const { user, signOut } = useAuth();
  const { isAdmin, error: adminError } = useAdmin();
  
  // Enhanced debugging for admin access - secure logging
  adminDebug('UserMenu - Admin status', { isAdmin, hasAdminError: !!adminError });
  userDebug('UserMenu - User info', { hasUser: !!user, userMetadata: user?.user_metadata });
  
  // Log any admin access errors for debugging
  if (adminError) {
    adminDebug('Admin access check error', { error: adminError });
  }
  const { 
    subscription_tier, 
    isFounder, 
    founderData,
    usage,
    currentTierLimits
  } = useSubscription();
  const navigate = useNavigate();

  // Hidden menu items - can be controlled by admin later
  const showSettings = false;
  const showSubscription = false;

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  const getUserDisplayName = () => {
    return user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  };

  const getTierBadge = () => {
    if (isFounder) {
      return (
        <Badge className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white text-xs">
          <Crown className="w-3 h-3 mr-1" />
          Founder #{founderData?.founder_number}
        </Badge>
      );
    }
    
    // Use centralized tier mapping
    const displayTier = mapTierToDisplay(subscription_tier);

    if (displayTier === 'Pro') {
      return <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs">Pro</Badge>;
    }
    
    if (displayTier === 'Core') {
      return <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs">Core</Badge>;
    }
    
    return <Badge variant="outline" className="text-xs">Free</Badge>;
  };

  const getUsageIndicator = () => {
    if (currentTierLimits?.stories_per_month === -1) {
      return "Unlimited chapters";
    }
    
    const total = currentTierLimits?.stories_per_month || 0;
    const used = usage?.stories_created || 0;
    
    return `${used}/${total} chapters this month`;
  };

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full flex-shrink-0 p-0 hover:bg-white/10 transition-colors focus:ring-0 focus:ring-offset-0 focus:outline-none"
        >
          <Avatar className="h-10 w-10 flex-shrink-0 avatar-smooth user-menu-avatar">
            <AvatarImage src={user.user_metadata?.avatar_url} />
            <AvatarFallback 
              className="bg-purple-600 text-white font-semibold text-sm"
            >
              {getInitials(user.email || 'U')}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 p-0" align="end" sideOffset={8}>
        <div className="flex flex-col space-y-1 p-3">
          <p className="text-sm font-medium leading-none text-white">{getUserDisplayName()}</p>
          <p className="text-xs leading-none text-gray-300">{user.email}</p>
          <div className="mt-2 space-y-2">
            {getTierBadge()}
            <div className="text-xs text-gray-300">
              {getUsageIndicator()}
            </div>
          </div>
        </div>
        <DropdownMenuSeparator className="bg-white/10" />
        {/* Profile link temporarily removed for maintenance */}
        <DropdownMenuItem asChild className="hover:bg-white/10">
          <Link to="/my-stories" className="flex items-center">
            <BookOpen className="mr-2 h-4 w-4" />
            My Stories
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="hover:bg-white/10">
          <Link to="/characters" className="flex items-center">
            <User className="mr-2 h-4 w-4" />
            My Characters
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="hover:bg-white/10">
          <Link to="/discover" className="flex items-center">
            <Search className="mr-2 h-4 w-4" />
            Discover
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-white/10" />
        {/* Hidden Settings and Subscription items - can be restored by admin */}
        {showSubscription && (
          <DropdownMenuItem asChild>
            <Link to="/settings?tab=subscription" className="flex items-center">
              <CreditCard className="mr-2 h-4 w-4" />
              Subscription
            </Link>
          </DropdownMenuItem>
        )}
        {showSettings && (
          <DropdownMenuItem asChild>
            <Link to="/settings" className="flex items-center">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </DropdownMenuItem>
        )}
        {isAdmin && (
          <DropdownMenuItem asChild className="hover:bg-white/10">
            <Link to="/admin" className="flex items-center">
              <Shield className="mr-2 h-4 w-4" />
              Admin Panel
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem onClick={handleSignOut} className="flex items-center hover:bg-white/10">
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
