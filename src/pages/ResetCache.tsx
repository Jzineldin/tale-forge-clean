import React, { useEffect, useState } from 'react';

const ResetCache: React.FC = () => {
  const [status, setStatus] = useState<string>('Starting cache reset...');
  const [details, setDetails] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    document.title = 'Reset App Cache | TaleForge';

    const log = (msg: string) => setDetails(prev => [...prev, msg]);

    async function reset() {
      try {
        // 1) Unregister all service workers
        if ('serviceWorker' in navigator) {
          const regs = await navigator.serviceWorker.getRegistrations();
          if (regs.length) {
            log(`Found ${regs.length} service worker registration(s). Unregistering...`);
            await Promise.allSettled(regs.map(r => r.unregister()));
            log('All service workers unregistered.');
          } else {
            log('No active service workers found.');
          }
        } else {
          log('Service workers not supported in this browser.');
        }

        setStatus('Clearing caches...');
        // 2) Clear all caches
        if ('caches' in window) {
          const keys = await caches.keys();
          if (keys.length) {
            await Promise.allSettled(keys.map(k => caches.delete(k)));
            log(`Deleted ${keys.length} cache(s).`);
          } else {
            log('No caches to delete.');
          }
        }

        setStatus('Clearing storage...');
        // 3) Optional: Clear storage that could pin old assets
        try {
          sessionStorage.clear();
          log('Session storage cleared.');
        } catch (_e) {
          // Ignore sessionStorage clearing errors (e.g., private mode)
        }
        try {
          localStorage.removeItem('vite-hmr');
          log('Cleared Vite HMR markers (if any).');
        } catch (_e) {
          // Ignore localStorage clearing errors (e.g., unsupported)
        }

        setDone(true);
        setStatus('Done! Please reload to get the latest version.');
      } catch (e) {
        setStatus('Something went wrong while resetting cache.');
        log(String(e));
      }
    }

    reset();
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <section className="w-full max-w-xl rounded-xl border bg-[hsl(var(--card))] border-[hsl(var(--border))] p-6 shadow">
        <h1 className="text-2xl font-semibold mb-2">Reset App Cache</h1>
        <p className="text-sm opacity-80 mb-4">Fixes issues where an older landing page appears due to a stale Service Worker.</p>

        <div className="rounded-lg bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] p-4 text-sm mb-4">
          <p className="font-medium mb-2">Status</p>
          <p>{status}</p>
        </div>

        {details.length > 0 && (
          <details className="mb-4">
            <summary className="cursor-pointer underline">Details</summary>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              {details.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </details>
        )}

        <div className="flex gap-3">
          <button
            className="px-4 py-2 rounded-md border border-[hsl(var(--ring))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary))] transition"
            onClick={() => window.location.reload()}
            disabled={!done}
          >
            Reload Now
          </button>
          <a
            className="px-4 py-2 rounded-md border border-[hsl(var(--border))] text-[hsl(var(--foreground))]/80 hover:underline"
            href="/"
          >
            Go Home
          </a>
        </div>
      </section>
    </main>
  );
};

export default ResetCache;
