import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthProvider';
import { Home, Clock, PenTool, Search, Menu, X, Crown, CreditCard } from '@/lib/icons';
import UserMenu from '@/components/auth/UserMenu';
import AuthButtons from '@/components/auth/AuthButtons';
import { cn } from '@/lib/utils';
import { CleanTierStatus } from '@/components/subscription/CleanTierStatus';
import { useHeaderButtonVisibility } from '@/hooks/useHeaderButtonVisibility';

interface HeaderProps {
  isSlideshowOpen?: boolean;
}

export default function Header({ isSlideshowOpen = false }: HeaderProps) {
  const { user } = useAuth();
  const { visibility } = useHeaderButtonVisibility();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const checkMobile = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsMobile(window.innerWidth <= 768);
      }, 100);
    };
    
    checkMobile();
    
    window.addEventListener('resize', checkMobile, { passive: true });
    return () => {
      window.removeEventListener('resize', checkMobile);
      clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside, { passive: true });
      document.addEventListener('touchstart', handleClickOutside, { passive: true });
      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          setOpen(false);
        }
      };
      document.addEventListener('keydown', handleEscape);
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('touchstart', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }
    
    return () => {};
  }, [open]);

  useEffect(() => {
    if (open) {
      document.body.classList.add('mobile-menu-open');
      const scrollY = window.scrollY;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    } else {
      document.body.classList.remove('mobile-menu-open');
      const scrollY = document.body.style.top;
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }
    
    return () => {
      document.body.classList.remove('mobile-menu-open');
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
    };
  }, [open]);

  const isActive = (path: string) => {
    if (path === '/' && (location.pathname === '/' || location.pathname === '/create-story')) {
      return location.pathname === '/';
    }
    return location.pathname === path;
  };

  const isCreateStoryActive = () => location.pathname === '/create-story';

  const closeMobileMenu = () => {
    setOpen(false);
  };

  const NavigationLinks = ({ isMobile = false }) => (
    <>
      {visibility.showHome && (
        <Link
          to="/"
          onClick={isMobile ? closeMobileMenu : undefined}
          className={cn(
            "flex items-center gap-2 px-4 py-3 rounded-md transition-all duration-300",
            isMobile && "min-h-[48px] w-full text-left text-base",
            !isMobile && "px-3 py-2",
            isActive('/')
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/50',
            "touch-manipulation select-none"
          )}
        >
          <Home className={cn("h-4 w-4", isMobile && "h-5 w-5")} />
          <span>Home</span>
        </Link>
      )}
      
      {visibility.showCreateStory && isCreateStoryActive() && (
        <div className={cn(
          "flex items-center gap-2 px-4 py-3 rounded-md bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg",
          isMobile && "min-h-[48px] w-full text-base"
        )}>
          <PenTool className={cn("h-4 w-4", isMobile && "h-5 w-5")} />
          <span>Creating Story</span>
        </div>
      )}
      
      {visibility.showMyStories && (
        <Link
          to="/my-stories"
          onClick={isMobile ? closeMobileMenu : undefined}
          className={cn(
            "flex items-center gap-2 px-4 py-3 rounded-md transition-all duration-300",
            isMobile && "min-h-[48px] w-full text-left text-base",
            !isMobile && "px-3 py-2",
            isActive('/my-stories')
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/50',
            "touch-manipulation select-none"
          )}
          title="View your temporary stories (saved locally)"
        >
          <Clock className={cn("h-4 w-4", isMobile && "h-5 w-5")} />
          <span className={cn(isMobile ? "block" : "hidden lg:inline")}>My Stories</span>
          <span className={cn(isMobile ? "hidden" : "lg:hidden")}>Stories</span>
        </Link>
      )}
      
      {visibility.showDiscover && (
        <Link
          to="/discover"
          onClick={isMobile ? closeMobileMenu : undefined}
          className={cn(
            "flex items-center gap-2 px-4 py-3 rounded-md transition-all duration-300",
            isMobile && "min-h-[48px] w-full text-left text-base",
            !isMobile && "px-3 py-2",
            isActive('/discover')
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/50',
            "touch-manipulation select-none"
          )}
        >
          <Search className={cn("h-4 w-4", isMobile && "h-5 w-5")} />
          <span className={cn(isMobile ? "block" : "hidden lg:inline")}>Discover</span>
          <span className={cn(isMobile ? "hidden" : "lg:hidden")}>Explore</span>
        </Link>
      )}
      
      <Link
        to="/pricing"
        onClick={isMobile ? closeMobileMenu : undefined}
        className={cn(
          "flex items-center gap-2 px-4 py-3 rounded-md transition-all duration-300",
          isMobile && "min-h-[48px] w-full text-left text-base",
          !isMobile && "px-3 py-2",
          isActive('/pricing')
            ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg'
            : 'text-slate-300 hover:text-white hover:bg-slate-800/50',
          "touch-manipulation select-none"
        )}
      >
        <Crown className={cn("h-4 w-4", isMobile && "h-5 w-5")} />
        <span>Pricing</span>
      </Link>
      
      {user && (
        <Link
          to="/account"
          onClick={isMobile ? closeMobileMenu : undefined}
          className={cn(
            "flex items-center gap-2 px-4 py-3 rounded-md transition-all duration-300",
            isMobile && "min-h-[48px] w-full text-left text-base",
            !isMobile && "px-3 py-2",
            isActive('/account')
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/50',
            "touch-manipulation select-none"
          )}
        >
          <CreditCard className={cn("h-4 w-4", isMobile && "h-5 w-5")} />
          <span>Account</span>
        </Link>
      )}
    </>
  );

  return (
    <header className={cn(
      "bg-slate-900 text-white relative z-50",
      isSlideshowOpen && "hidden"
    )} ref={mobileMenuRef}>
      <div className="container mx-auto flex items-center justify-between px-4 h-16">
        <Link
          to="/"
          className="text-xl font-semibold text-white hover:text-amber-400 transition-colors touch-manipulation"
          onClick={closeMobileMenu}
        >
          Tale Forge
        </Link>

        {!isMobile && (
          <div className="flex items-center gap-4">
            <nav className="flex space-x-6 text-sm">
              <NavigationLinks />
            </nav>

            {user ? (
              <div className="flex items-center gap-4">
                <CleanTierStatus />
                <UserMenu />
              </div>
            ) : (
              <AuthButtons />
            )}
          </div>
        )}

        {isMobile && (
          <div className="flex items-center gap-1">
            {user && (
              <div className="mr-1">
                <UserMenu />
              </div>
            )}
            
            <button 
              onClick={() => setOpen(!open)} 
              className="p-2 rounded touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors hover:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-900"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-navigation-menu"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        )}
      </div>

      {isMobile && (
        <nav className={cn(
          "absolute w-full bg-slate-800 top-16 z-50 border-t border-slate-700",
          "transform transition-all duration-300 ease-in-out",
          open 
            ? "opacity-100 translate-y-0 pointer-events-auto" 
            : "opacity-0 -translate-y-4 pointer-events-none"
        )}
        id="mobile-navigation-menu"
        role="navigation"
        aria-label="Mobile navigation menu"
        >
          <div className="flex flex-col gap-1 p-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
            <NavigationLinks isMobile={true} />
            
            {!user && (
              <div className="mt-4 pt-4 border-t border-slate-600">
                <AuthButtons />
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
