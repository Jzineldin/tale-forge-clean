// Placeholder for error logging service
// Replace with your actual error logging service (e.g., Sentry, LogRocket)

export function logErrorToService(error: Error, errorInfo?: React.ErrorInfo) {
  // In development, log to console
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', error, errorInfo);
  }
  // TODO: Integrate with production error logging
}