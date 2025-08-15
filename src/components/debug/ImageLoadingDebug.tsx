import React, { useState } from 'react';
import { runImageLoadingTest } from '@/utils/imageLoadingTest';
import { clearImageCache } from '@/utils/storyCoverUtils';

/**
 * Debug component for testing image loading functionality
 * This component provides buttons to run tests and clear the cache
 */
const ImageLoadingDebug: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  // Override console methods to capture logs
  const setupLogCapture = () => {
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalInfo = console.info;

    // Clear previous logs
    setLogs([]);

    // Override console methods
    console.log = (...args) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      setLogs(prev => [...prev, `LOG: ${message}`]);
      originalLog(...args);
    };

    console.error = (...args) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      setLogs(prev => [...prev, `ERROR: ${message}`]);
      originalError(...args);
    };

    console.warn = (...args) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      setLogs(prev => [...prev, `WARN: ${message}`]);
      originalWarn(...args);
    };

    console.info = (...args) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      setLogs(prev => [...prev, `INFO: ${message}`]);
      originalInfo(...args);
    };

    // Return function to restore original console methods
    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
      console.info = originalInfo;
    };
  };

  const handleRunTest = () => {
    setIsRunning(true);
    const restoreConsole = setupLogCapture();

    try {
      runImageLoadingTest();
    } finally {
      setTimeout(() => {
        restoreConsole();
        setIsRunning(false);
      }, 10000); // Give tests 10 seconds to complete
    }
  };

  const handleClearCache = () => {
    clearImageCache();
    setLogs(prev => [...prev, 'LOG: Cache cleared']);
  };

  return (
    <div className="p-4 bg-slate-100 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Image Loading Debug</h2>
      
      <div className="flex gap-4 mb-4">
        <button
          onClick={handleRunTest}
          disabled={isRunning}
          className={`px-4 py-2 rounded-md ${
            isRunning 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {isRunning ? 'Running Tests...' : 'Run Image Loading Tests'}
        </button>
        
        <button
          onClick={handleClearCache}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md"
        >
          Clear Image Cache
        </button>
      </div>
      
      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">Test Logs:</h3>
        <div className="bg-black text-green-400 p-4 rounded-md h-96 overflow-y-auto font-mono text-sm">
          {logs.length === 0 ? (
            <p className="text-gray-500">No logs yet. Run the tests to see results.</p>
          ) : (
            logs.map((log, index) => (
              <div key={index} className={`mb-1 ${
                log.startsWith('ERROR') 
                  ? 'text-red-400' 
                  : log.startsWith('WARN')
                    ? 'text-yellow-400'
                    : 'text-green-400'
              }`}>
                {log}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageLoadingDebug;