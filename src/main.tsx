import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./styles/auth-pages.css";

// Import performance and storage optimizations
import { initializeStorageOptimization } from "./utils/storageOptimizer";
import { initializePerformanceOptimizations } from "./utils/performanceOptimizer";
import { initializeSecurityOptimizations } from "./utils/securityOptimizer";

// Initialize optimizations
const initializeApp = async () => {
  // Initialize storage, performance, and security optimizations
  await initializeStorageOptimization();
  initializePerformanceOptimizations();
  initializeSecurityOptimizations();
};

// Simple initialization without dynamic imports
const rootElement = document.getElementById("root");
if (rootElement) {
  // Initialize optimizations in background
  initializeApp().catch(console.error);
  
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
} else {
  // Fallback if root element is not found
  document.body.innerHTML = `
    <div style="
      min-height: 100vh;
      background-color: #0f172a;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: system-ui, -apple-system, sans-serif;
      text-align: center;
      padding: 20px;
    ">
      <div>
        <h1 style="color: #f59e0b; margin-bottom: 1rem;">Tale Forge</h1>
        <p style="color: #94a3b8;">Failed to initialize application. Please refresh the page.</p>
        <button onclick="window.location.reload()" style="
          margin-top: 1rem;
          padding: 10px 20px;
          background-color: #f59e0b;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 1rem;
        ">Refresh Page</button>
      </div>
    </div>
  `;
}
