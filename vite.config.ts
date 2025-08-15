import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { visualizer } from "rollup-plugin-visualizer";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8082,
    watch: {
      // We need to explicitly ignore node_modules and .git when adding our own paths.
      ignored: ["**/node_modules/**", "**/.git/**", "**/supabase/**"],
    },
    cors: true,
  },
  preview: {
    port: 8082,
    host: "::",
  },
  appType: 'spa', // This ensures SPA routing works properly
  build: {
    rollupOptions: {
      output: {
        // Safer chunking strategy to avoid initialization issues
        manualChunks: {
          // Keep React and context providers together
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Supabase in its own chunk but with React Query for consistency
          'supabase-vendor': ['@supabase/supabase-js', '@tanstack/react-query'],
          // UI components
          'ui-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-label',
            '@radix-ui/react-popover',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            '@radix-ui/react-tooltip',
          ],
          // Other vendor libraries
          'vendor': [
            'lucide-react',
            'clsx',
            'class-variance-authority',
            'tailwind-merge',
          ],
        },
      },
    },
    chunkSizeWarningLimit: 250, // Aggressive limit to catch large chunks
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari13.1'], // Modern targets for better optimization
    sourcemap: mode === 'development',
    minify: mode === 'production' ? 'terser' : false,
    terserOptions: mode === 'production' ? {
      compress: {
        // Don't drop console entirely - only drop specific methods
        drop_console: false,
        drop_debugger: true,
        // Only remove debug-level console methods in production
        pure_funcs: ['console.debug'],
        // Disable advanced optimizations that might cause initialization errors
        passes: 1,
        unsafe_arrows: false,
        unsafe_methods: false,
        unsafe_proto: false,
        unsafe_undefined: false,
        unsafe_regexp: false,
        // Additional safety options
        keep_fnames: true,
        keep_classnames: true,
        // Disable more aggressive optimizations
        hoist_funs: false,
        hoist_vars: false,
        inline: false,
        loops: false,
        reduce_vars: false,
        switches: false,
        top_retain: ['supabase', 's'],
      },
      mangle: {
        // Keep all function names in production to avoid initialization issues
        keep_fnames: true,
        safari10: true, // Safari compatibility
        // Don't mangle these specific names
        reserved: ['supabase', 's', 'client', 'auth'],
      },
      format: {
        comments: false, // Remove all comments in production
      },
    } : undefined,
    // Enable tree shaking
    treeshake: {
      preset: 'recommended',
      moduleSideEffects: false,
    },
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    mode === 'production' && visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
      template: 'treemap', // Better visualization
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'lucide-react',
      'clsx',
      'class-variance-authority',
      'tailwind-merge',
      // Force pre-bundle Supabase to avoid initialization issues
      '@supabase/supabase-js',
    ],
    // Exclude large files from pre-bundling to reduce initial load
    exclude: ['@/lib/voices', '@/components/admin/optimization'],
    // Force ESM for Supabase to avoid CJS/ESM conflicts
    esbuildOptions: {
      target: 'es2020',
      // Ensure proper context initialization
      keepNames: true,
    },
  },
}));