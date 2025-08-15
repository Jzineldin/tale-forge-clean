import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
  current?: boolean;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
  showHome?: boolean;
  separator?: React.ReactNode;
}

/**
 * Breadcrumb Navigation Component
 * Provides hierarchical navigation context for users
 * WCAG 2.1 AA Compliance: Success Criterion 2.4.8 (Location)
 */
export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items = [],
  className,
  showHome = true,
  separator = <ChevronRight className="h-4 w-4 text-gold-metallic/60" />
}) => {
  const location = useLocation();

  // Auto-generate breadcrumbs based on current path if no items provided
  const breadcrumbItems = items.length > 0 ? items : generateBreadcrumbsFromPath(location.pathname);

  if (breadcrumbItems.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb navigation"
      className={cn(
        "flex items-center space-x-2 text-sm",
        "glass-card px-4 py-2 rounded-lg",
        "bg-slate-900/50 backdrop-blur-sm border border-amber-400/20",
        className
      )}
    >
      <ol className="flex items-center space-x-2" role="list">
        {showHome && (
          <li>
            <Link
              to="/"
              className="flex items-center text-gold-metallic/80 hover:text-gold-metallic transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 rounded-md px-1 py-1"
              aria-label="Go to homepage"
            >
              <Home className="h-4 w-4" />
              <span className="sr-only">Home</span>
            </Link>
          </li>
        )}

        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          const isFirst = index === 0;

          return (
            <React.Fragment key={`${item.label}-${index}`}>
              {(showHome || !isFirst) && (
                <li aria-hidden="true" className="flex items-center">
                  {separator}
                </li>
              )}
              
              <li>
                {item.href && !isLast ? (
                  <Link
                    to={item.href}
                    className="flex items-center space-x-1 text-gold-metallic/80 hover:text-gold-metallic transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 rounded-md px-1 py-1"
                  >
                    {item.icon && <item.icon className="h-4 w-4" />}
                    <span>{item.label}</span>
                  </Link>
                ) : (
                  <span
                    className="flex items-center space-x-1 text-gold-metallic font-medium"
                    aria-current={isLast ? "page" : undefined}
                  >
                    {item.icon && <item.icon className="h-4 w-4" />}
                    <span>{item.label}</span>
                  </span>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
};

/**
 * Auto-generate breadcrumbs from current path
 */
function generateBreadcrumbsFromPath(pathname: string): BreadcrumbItem[] {
  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];

  // Route mappings for better labels
  const routeLabels: Record<string, string> = {
    'create': 'Create Story',
    'age': 'Choose Age',
    'genre': 'Select Genre',
    'prompt': 'Story Seed',
    'starting-point': 'Starting Point',
    'customize': 'Customize',
    'my-stories': 'My Stories',
    'discover': 'Discover',
    'settings': 'Settings',
    'admin': 'Admin',
    'pricing': 'Pricing',
    'about': 'About',
    'privacy': 'Privacy',
    'terms': 'Terms',
    'auth': 'Authentication',
    'signin': 'Sign In',
    'signup': 'Sign Up'
  };

  pathSegments.forEach((segment, index) => {
    const isLast = index === pathSegments.length - 1;
    const path = '/' + pathSegments.slice(0, index + 1).join('/');
    const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);

    const breadcrumbItem: BreadcrumbItem = {
      label,
      current: isLast
    };

    if (!isLast) {
      breadcrumbItem.href = path;
    }

    breadcrumbs.push(breadcrumbItem);
  });

  return breadcrumbs;
}

/**
 * Story Creation Breadcrumb Hook
 * Provides context-aware breadcrumbs for the story creation flow
 */
export const useStoryCreationBreadcrumbs = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  
  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const path = location.pathname;
    const breadcrumbs: BreadcrumbItem[] = [];

    if (path.startsWith('/create')) {
      breadcrumbs.push({
        label: 'Create Story',
        href: '/create'
      });

      if (path.includes('/age')) {
        breadcrumbs.push({
          label: 'Choose Age',
          current: path === '/create/age'
        });
      }

      if (path.includes('/genre')) {
        const age = searchParams.get('age');
        breadcrumbs.push({
          label: 'Select Genre',
          href: age ? `/create/genre?age=${age}` : '/create/genre',
          current: path === '/create/genre'
        });
      }

      if (path.includes('/prompt')) {
        const age = searchParams.get('age');
        const genre = searchParams.get('genre');
        breadcrumbs.push({
          label: 'Story Seed',
          current: path === '/create/prompt'
        });
      }
    }

    return breadcrumbs;
  };

  return { breadcrumbs: getBreadcrumbs() };
};

/**
 * Breadcrumb Provider Component
 * Automatically shows breadcrumbs for story creation flow
 */
interface BreadcrumbProviderProps {
  children: React.ReactNode;
  showForPaths?: string[];
  className?: string;
}

export const BreadcrumbProvider: React.FC<BreadcrumbProviderProps> = ({
  children,
  showForPaths = ['/create'],
  className
}) => {
  const location = useLocation();
  const { breadcrumbs } = useStoryCreationBreadcrumbs();
  
  const shouldShowBreadcrumbs = showForPaths.some(path => 
    location.pathname.startsWith(path)
  );

  return (
    <>
      {shouldShowBreadcrumbs && breadcrumbs.length > 0 && (
        <div className={cn("container mx-auto px-4 py-2", className)}>
          <Breadcrumb items={breadcrumbs} />
        </div>
      )}
      {children}
    </>
  );
};

export default Breadcrumb;