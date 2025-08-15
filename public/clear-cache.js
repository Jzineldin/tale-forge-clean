// Force clear all caches and service worker
(async function clearAllCaches() {
  try {
    // Unregister all service workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
        console.log('Service worker unregistered');
      }
    }
    
    // Clear all caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      for (const cacheName of cacheNames) {
        await caches.delete(cacheName);
        console.log('Cache deleted:', cacheName);
      }
    }
    
    // Clear localStorage and sessionStorage
    localStorage.clear();
    sessionStorage.clear();
    
    console.log('All caches cleared, reloading page...');
    
    // Reload with cache bypass
    window.location.reload(true);
  } catch (error) {
    console.error('Cache clearing failed:', error);
    // Force reload anyway
    window.location.reload(true);
  }
})();