import React from 'react';
import type { AppProps } from 'next/app';
import ErrorBoundary from '@/components/error/ErrorBoundary';
import { useRouter } from 'next/router';

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  // Reset error boundary on route change
  const handleRouteChange = () => {
    // This would reset any global error state
  };

  React.useEffect(() => {
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return (
    <ErrorBoundary>
      <Component {...pageProps} />
    </ErrorBoundary>
  );
}

export default MyApp;