import PricingPage from '../components/pricing/PricingPage';
import ErrorBoundary from '@/components/error/ErrorBoundary';
import { useState } from 'react';

// Custom fallback UI for Pricing page
const PricingFallback = ({ error, resetError }: { error: Error, resetError: () => void }) => (
  <div className="pricing-error">
    <h2>Pricing Information Unavailable</h2>
    <p>We're unable to load pricing details at this time.</p>
    <p><em>{error.message}</em></p>
    <div className="actions">
      <button onClick={resetError}>Retry</button>
      <button onClick={() => window.location.reload()}>Reload Page</button>
    </div>
  </div>
);

const Pricing = () => {
  const [simulateError, setSimulateError] = useState(false);

  // For testing purposes - simulate an error
  if (simulateError) {
    throw new Error('Pricing component simulated error');
  }

  return (
    <ErrorBoundary
      fallback={(error: Error, reset: () => void) => (
        <PricingFallback error={error} resetError={reset} />
      )}
    >
      <PricingPage />
      
      {/* Testing button - would be removed in production */}
      <div style={{ position: 'fixed', bottom: '20px', right: '20px' }}>
        <button
          className="test-error-button"
          onClick={() => setSimulateError(true)}
          style={{ padding: '5px 10px', fontSize: '12px' }}
        >
          Simulate Pricing Error (Test)
        </button>
      </div>
    </ErrorBoundary>
  );
};

export default Pricing;
