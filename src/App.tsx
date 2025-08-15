import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthProvider";
import PricingPage from "@/components/pricing/PricingPage";
import { StoryCreationProvider } from "@/context/StoryCreationContext";
import { HeaderVisibilityProvider } from "@/context/HeaderVisibilityContext";
import { SlideshowProvider } from "@/context/SlideshowContext";
import { SettingsProvider } from "@/context/SettingsContext";
import { AdminProvider } from "@/context/AdminContext";
import { ASSET_VERSION } from "@/config/version";
import Layout from "@/components/Layout";
import ErrorBoundary from "@/components/ErrorBoundary";
import CookieConsent from "@/components/CookieConsent";
import CookieDemo from "@/components/CookieDemo";
import { AuthMigrationWrapper } from "@/components/auth/AuthMigrationWrapper";
import BackgroundManager from "@/components/BackgroundManager";

import { Suspense, lazy } from "react";
import { HelmetProvider } from 'react-helmet-async';

// Import magical theme styles
import "@/styles/magical-theme.css";
import "@/styles/hero-override.css";
// Title styling used for large gold headings (global)
import "@/styles/hero-title.css";
// Import unified design system styles after magical theme to ensure proper override
import "@/styles/unified-design-system.css";
// Import components CSS for Profile, Settings, and other component-specific styles
import "@/styles/components.css";
// Import additional essential styles
import "@/styles/global.css";
import "@/styles/utilities.css";

// Import local feedback utilities for debugging (updated)
import "@/utils/localFeedbackUtils";

// Retry import logic with exponential backoff
const retryImport = async (importer: () => Promise<any>, retries = 3): Promise<any> => {
  try {
    return await importer();
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return retryImport(importer, retries - 1);
    }
    throw error;
  }
};

// Lazy load pages for better performance
const Index = lazy(() => import("./pages/Index"));
const Learning = lazy(() => import("./pages/Learning"));
const About = lazy(() => import("./pages/About"));
const ProductionDebug = lazy(() => import("./pages/ProductionDebug"));
const MyStories = lazy(() => import("./pages/MyStories"));
const Discover = lazy(() => import("./pages/Discover"));
const StoryViewer = lazy(() => import("./pages/StoryViewer"));
const StoryEditor = lazy(() => import("./pages/StoryEditor"));
const StoryDisplay = lazy(() => import("./pages/StoryDisplay"));
const StoryCreation = lazy(() => import("./pages/StoryCreation"));
const CreatePrompt = lazy(() => import("./pages/CreatePromptWithCharacters"));
const Auth = lazy(() => import("./pages/Auth"));
const SignIn = lazy(() => import("./pages/auth/SignIn"));
const SignUp = lazy(() => import("./pages/auth/SignUp"));
const AuthCallback = lazy(() => import("./pages/auth/AuthCallback"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));
const Pricing = lazy(() => import("./components/pricing/PricingPage"));
const EnhancedPricing = lazy(() => import("./pages/EnhancedPricing"));
const Beta = lazy(() => import("./pages/Beta"));
const Admin = lazy(() => import("./pages/Admin"));
const AdminDemo = lazy(() => import("./pages/AdminDemo"));
const AdminDebug = lazy(() => import("./pages/AdminDebug"));
const AuthTest = lazy(() => import("./pages/AuthTest"));
const SimpleAuthTest = lazy(() => import("./pages/SimpleAuthTest"));
const MinimalAuthTest = lazy(() => import("./pages/MinimalAuthTest"));
const EnvCheck = lazy(() => import("./pages/EnvCheck"));
const AuthProviderTest = lazy(() => import("./pages/AuthProviderTest"));
const SimpleTest = lazy(() => import("./pages/SimpleTest"));
const Diagnostics = lazy(() => import("./pages/Diagnostics"));
const ImageDebug = lazy(() => import("./pages/ImageDebug"));
const VoiceGenerationDebug = lazy(() => import("./components/debug/VoiceGenerationDebug"));
const SubscriptionDebug = lazy(() => import("./components/debug/SubscriptionDebug"));
const EmailDiagnostics = lazy(() => import("./pages/EmailDiagnostics"));
const DemoSetup = lazy(() => import("./pages/DemoSetup"));
const SimpleCharacterManagement = lazy(() => import("./pages/SimpleCharacterManagement"));
const NotFound = lazy(() => import("./pages/NotFound"));
const TestAccess = lazy(() => import("./pages/TestAccess"));
const ResetCache = lazy(() => import("./pages/ResetCache"));
const CharacterManagement = lazy(() => import("./pages/CharacterManagement"));
const ProtectedRoute = lazy(() => import("./components/ProtectedRoute"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const SettingsPage = lazy(() => retryImport(() => import("./pages/Settings"), 3));
const Profile = lazy(() => import("./pages/Profile"));
const AccountDashboard = lazy(() => import("./components/subscription/AccountDashboard"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));

function MaintenanceMessage() {
  return (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold mb-4">Profile Section Unavailable</h1>
      <p>The profile section is temporarily down for maintenance.</p>
      <p>Please check back later.</p>
    </div>
  );
}

// Lazy load create flow pages
const CreateAge = lazy(() => import("./pages/CreateAge"));
const CreateGenre = lazy(() => import("./pages/CreateGenre"));
const CreateStartingPoint = lazy(() => import("./pages/CreateStartingPoint"));
const CreateCustomize = lazy(() => import("./pages/CreateCustomize"));

// Loading fallback component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-900">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400 mx-auto mb-4"></div>
      <p className="text-slate-400 text-sm">Loading...</p>
    </div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (replaces cacheTime in v5)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const isDev = import.meta.env.DEV;
  return (
    <ErrorBoundary fallback={<div className="p-4 text-red-500">Critical application error. Please refresh the page.</div>}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <AuthMigrationWrapper>
              <AdminProvider>
                <StoryCreationProvider>
                  <HeaderVisibilityProvider>
                    <SlideshowProvider>
                      <SettingsProvider>
                        <HelmetProvider>
                          <BrowserRouter
                            future={{
                              v7_startTransition: true,
                              v7_relativeSplatPath: true
                            }}
                          >
                            
                            <div className="min-h-screen relative">
                              {/* Apply the astronaut background */}
                              <BackgroundManager />
                              <div className="scene-bg"></div>
                              <script src={`/scripts/analytics.js?v=${ASSET_VERSION}`} />
                              <Layout>
                                <Suspense fallback={<LoadingFallback />}>
                                  <Routes>
                                    {/* Public Routes */}
                                    <Route path="/" element={<Index />} />
                                    <Route path="/learning" element={<Learning />} />
                                    <Route path="/about" element={<About />} />
                                    <Route path="/privacy" element={<Privacy />} />
                                    <Route path="/terms" element={<Terms />} />
                                    <Route path="/discover" element={<Discover />} />
                                    <Route path="/pricing" element={<PricingPage />} />
                                    <Route path="/pricing/:version?" element={<PricingPage />} />
                                    <Route path="/pricing/legacy" element={<Navigate to="/pricing?version=2" replace />} />
                                    <Route path="/beta" element={<Beta />} />
                                    <Route path="/debug" element={<ProductionDebug />} />
                                    
                                    {/* Authentication Routes */}
                                    <Route path="/auth" element={<Auth />} />
                                    <Route path="/auth/signin" element={<SignIn />} />
                                    <Route path="/auth/signup" element={<SignUp />} />
                                    <Route path="/auth/callback" element={<AuthCallback />} />
                                    <Route path="/auth/forgot-password" element={<ForgotPassword />} />
                                    <Route path="/auth/reset-password" element={<ResetPassword />} />
                                    <Route path="/login" element={<SignIn />} />
                                    <Route path="/signup" element={<SignUp />} />
                                    
                                    {/* Story Creation Flow */}
                                    <Route path="/create" element={<StoryCreation />} />
                                    <Route path="/create/age" element={<CreateAge />} />
                                    <Route path="/create/genre" element={<CreateGenre />} />
                                    <Route path="/characters" element={<CharacterManagement />} />
                                    <Route path="/create/prompt" element={<CreatePrompt />} />
                                    <Route path="/create/starting-point" element={<CreateStartingPoint />} />
                                    <Route path="/create/customize" element={<CreateCustomize />} />
                                    <Route path="/story/:id" element={<StoryDisplay />} />
                                    
                                    {/* Legacy Story Creation */}
                                    <Route path="/create-story" element={<StoryCreation />} />
                                    
                                    {/* Story Management */}
                                    <Route path="/my-stories" element={<MyStories />} />
                                    <Route path="/story-viewer/:id" element={<StoryViewer />} />
                                    <Route path="/story-editor/:id" element={<StoryEditor />} />
                                    
                                    {/* User Settings */}
                                    <Route
                                      path="/settings"
                                      element={
                                        <Suspense fallback={<div className="p-4 text-center">Loading settings...</div>}>
                                          <ErrorBoundary
                                            fallback={<div className="p-4 text-red-500">Failed to load settings. <button onClick={() => window.location.reload()} className="text-blue-500">Retry</button></div>}
                                          >
                                            <SettingsPage />
                                          </ErrorBoundary>
                                        </Suspense>
                                      }
                                    />
                                    <Route
                                      path="/account"
                                      element={
                                        <ProtectedRoute>
                                          <Suspense fallback={<div className="p-4 text-center">Loading account dashboard...</div>}>
                                            <ErrorBoundary
                                              fallback={<div className="p-4 text-red-500">Failed to load account dashboard. <button onClick={() => window.location.reload()} className="text-blue-500">Retry</button></div>}
                                            >
                                              <AccountDashboard />
                                            </ErrorBoundary>
                                          </Suspense>
                                        </ProtectedRoute>
                                      }
                                    />
                                    <Route
                                      path="/success"
                                      element={
                                        <Suspense fallback={<div className="p-4 text-center">Loading payment verification...</div>}>
                                          <ErrorBoundary
                                            fallback={<div className="p-4 text-red-500">Failed to load payment verification. <button onClick={() => window.location.reload()} className="text-blue-500">Retry</button></div>}
                                          >
                                            <PaymentSuccess />
                                          </ErrorBoundary>
                                        </Suspense>
                                      }
                                    />
                                    {/* TODO: Re-enable profile route after maintenance */}
                                    {/* <Route path="/profile" element={<Profile />} /> */}

                                    {/* Maintenance page for direct access */}
                                    <Route path="/profile" element={<MaintenanceMessage />} />
                                    
                                    {/* Admin Routes */}
                                    <Route 
                                      path="/admin/*" 
                                      element={
                                        <ProtectedRoute><Admin /></ProtectedRoute>
                                      } 
                                    />
                                    
                                    {/* Test & Admin Demo Routes (dev only) */}
                                    {isDev && (
                                      <>
                                        <Route path="/admin-demo/*" element={<ProtectedRoute><AdminDemo /></ProtectedRoute>} />
                                        <Route path="/admin-debug" element={<ProtectedRoute><AdminDebug /></ProtectedRoute>} />
                                        <Route path="/auth-test" element={<AuthTest />} />
                                        <Route path="/simple-auth-test" element={<SimpleAuthTest />} />
                                        <Route path="/minimal-auth-test" element={<MinimalAuthTest />} />
                                        <Route path="/env-check" element={<EnvCheck />} />
                                        <Route path="/auth-provider-test" element={<AuthProviderTest />} />
                                        <Route path="/simple-test" element={<SimpleTest />} />
                                        <Route path="/diagnostics" element={<Diagnostics />} />
                                        <Route path="/email-diagnostics" element={<EmailDiagnostics />} />
                                        <Route path="/image-debug" element={<ImageDebug />} />
                                        <Route path="/voice-debug" element={<VoiceGenerationDebug />} />
                                        <Route path="/subscription-debug" element={<SubscriptionDebug />} />
                                        <Route path="/cookie-demo" element={<CookieDemo />} />
                                        <Route path="/demo-setup" element={<DemoSetup />} />
                                        <Route path="/simple-characters" element={<SimpleCharacterManagement />} />
                                        <Route path="/test-access" element={<TestAccess />} />
                                      </>
                                    )}
                                    
                                    {/* Utilities */}
                                    <Route path="/reset-cache" element={<ResetCache />} />
                                    {/* Catch-all route */}
                                    <Route path="*" element={<NotFound />} />
                                  </Routes>
                                </Suspense>
                              </Layout>
                              <CookieConsent />
                            </div>
                            <Toaster />
                          </BrowserRouter>
                        </HelmetProvider>
                      </SettingsProvider>
                    </SlideshowProvider>
                  </HeaderVisibilityProvider>
                </StoryCreationProvider>
              </AdminProvider>
            </AuthMigrationWrapper>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
