import { useTheme } from "next-themes"
import { Toaster as Sonner, toast as originalToast } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

// Check if we're in development mode
const isDevelopment = import.meta.env.DEV;

// List of error patterns to suppress in production
const suppressedErrorPatterns = [
  'usage tracking',
  'failed to update',
  'failed to increment',
  'permission denied',
  'network error',
  'failed to fetch',
  'quota exceeded',
  'rate limit'
];

// Helper function to check if an error should be suppressed
const shouldSuppressError = (message: string): boolean => {
  if (isDevelopment) {
    // In development, show all errors
    return false;
  }
  
  // In production, suppress errors matching our patterns
  const lowerMessage = message.toLowerCase();
  return suppressedErrorPatterns.some(pattern => lowerMessage.includes(pattern));
};

// Create a wrapper for toast that intercepts error calls
const toast = new Proxy(originalToast, {
  get(target, prop) {
    if (prop === 'error') {
      // Return a function that conditionally shows or suppresses errors
      return (message: string, options?: any) => {
        // Always log to console for debugging
        console.error('[Toast Error]:', message, options);
        
        // Check if we should suppress this error
        if (shouldSuppressError(message)) {
          // Don't show the toast in production for suppressed errors
          return;
        }
        
        // In development or for non-suppressed errors, show the toast
        if (isDevelopment) {
          // Add a dev indicator to error toasts in development
          return target.error(`[DEV] ${message}`, options);
        }
        
        // For production non-suppressed errors, show a user-friendly message
        return target.error('An unexpected error occurred. Please try again.', options);
      };
    }
    
    // For all other methods (success, info, warning, etc.), use the original
    return target[prop as keyof typeof target];
  }
});

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as "system" | "light" | "dark"}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast glass-enhanced backdrop-blur-lg bg-black/80 border-white/30 text-white shadow-xl rounded-xl",
          description: "group-[.toast]:text-white/90",
          actionButton:
            "group-[.toast]:bg-amber-500 group-[.toast]:text-white group-[.toast]:hover:bg-amber-600",
          cancelButton:
            "group-[.toast]:bg-white/20 group-[.toast]:text-white group-[.toast]:hover:bg-white/30",
        },
      }}
      {...props}
    />
  )
}

export { Toaster, toast }
