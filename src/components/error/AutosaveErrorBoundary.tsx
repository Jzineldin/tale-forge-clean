import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorCategory, ErrorSeverity, categorizeError, determineErrorSeverity, getUserFriendlyMessage } from '@/lib/error/autosaveErrorHandler';

interface Props {
  children: ReactNode;
  fallbackComponent?: ReactNode;
  onReset?: () => void;
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCategory: ErrorCategory;
  errorSeverity: ErrorSeverity;
  userMessage: string;
}

/**
 * Error boundary component for autosave errors
 * 
 * This component catches errors that occur during the autosave process
 * and displays a fallback UI with appropriate error messages and recovery options.
 */
export class AutosaveErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCategory: ErrorCategory.UNKNOWN,
      errorSeverity: ErrorSeverity.ERROR,
      userMessage: 'An unexpected error occurred'
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    const errorCategory = categorizeError(error);
    const errorSeverity = determineErrorSeverity(errorCategory, error);
    const userMessage = getUserFriendlyMessage(errorCategory, errorSeverity);

    return {
      hasError: true,
      error,
      errorCategory,
      errorSeverity,
      userMessage
    };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to an error reporting service
    console.error('Autosave error caught by boundary:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });

    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });

    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  override render(): ReactNode {
    if (this.state.hasError) {
      // If a custom fallback component is provided, use it
      if (this.props.fallbackComponent) {
        return this.props.fallbackComponent;
      }

      // Otherwise, use the default fallback UI
      return (
        <Card className="w-full max-w-md mx-auto bg-slate-900/95 border-amber-500/30 backdrop-blur-sm shadow-2xl m-4 overflow-hidden">
          <CardHeader className="text-center pb-3 px-4">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-red-500/20 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
            </div>
            <CardTitle className="text-white text-xl font-serif">
              Autosave Error
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4 px-4">
            <p className="text-slate-300 text-center">
              {this.state.userMessage}
            </p>
            
            {this.state.error && (
              <div className="bg-slate-800/50 rounded-md p-3 mt-4 overflow-auto max-h-32">
                <p className="text-xs text-slate-400 font-mono">
                  {this.state.error.toString()}
                </p>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-between px-4 pb-4">
            <Button
              variant="outline"
              onClick={this.handleReset}
            >
              Dismiss
            </Button>
            <Button
              onClick={this.handleRetry}
              variant="cta-primary"
            >
              Retry
            </Button>
          </CardFooter>
        </Card>
      );
    }

    // If there's no error, render children normally
    return this.props.children;
  }
}