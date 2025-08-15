import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * BackgroundManager
 * Sets the global CSS variable --app-bg-image based on the current route.
 * Main-astronaut.png is the default background for the entire site.
 * Individual pages can override with their own backgrounds.
 */
export default function BackgroundManager() {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    const root = document.documentElement;

    // Default background image - main-astronaut.png
    const defaultBackground = '/images/main-astronaut.png';
    
    // Page-specific overrides (optional)
    // These pages can use different backgrounds if desired
    const pageBackgrounds: Record<string, string> = {
      // Uncomment to override specific pages:
      // '/discover': '/images/main-2-astronaut.png',
      // '/my-stories': '/images/astronaut-background-genre.jpg',
      // '/pricing': '/images/main-2-astronaut.png',
      // Use a calmer background for auth pages to avoid visual clutter
      '/auth': '/images/main-2-astronaut.png',
      '/login': '/images/main-2-astronaut.png',
      '/signup': '/images/main-2-astronaut.png',
    };

    // Check if current path has a specific override
    let backgroundImage = defaultBackground;
    
    for (const [prefix, image] of Object.entries(pageBackgrounds)) {
      if (path.startsWith(prefix)) {
        backgroundImage = image;
        break;
      }
    }

    // Set the background image CSS variable
    const setBackground = (url: string) => {
      root.style.setProperty('--app-bg-image', `url('${url}')`);
    };

    // Try to load the image, fallback to default if it fails
    const img = new Image();
    img.onload = () => {
      setBackground(backgroundImage);
    };
    img.onerror = () => {
      // Fallback to default if specific image fails
      if (backgroundImage !== defaultBackground) {
        setBackground(defaultBackground);
      }
    };
    img.src = backgroundImage;

    // Set default immediately while image loads
    setBackground(backgroundImage);

  }, [location.pathname]);

  return null;
}


