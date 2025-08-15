interface ChangelogEntry {
  version: string;
  date: string;
  type: 'major' | 'minor' | 'patch';
  changes: {
    type: 'feature' | 'improvement' | 'fix';
    description: string;
  }[];
}

class ChangelogManager {
  private static readonly STORAGE_KEY = 'taleforge-changelog';
  private static readonly VERSION_KEY = 'taleforge-changelog-version';
  private static readonly CURRENT_VERSION = '2.10.0-stability-update';
  
  // Get current changelog from localStorage or return default
  static getCurrentChangelog(): ChangelogEntry[] {
    if (typeof window === 'undefined') return [];
    
    const stored = localStorage.getItem(this.STORAGE_KEY);
    const storedVersion = localStorage.getItem(this.VERSION_KEY);
    
    // If version doesn't match, clear cache and use new default
    if (storedVersion !== this.CURRENT_VERSION) {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.setItem(this.VERSION_KEY, this.CURRENT_VERSION);
    }
    
    if (stored && storedVersion === this.CURRENT_VERSION) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error('Failed to parse stored changelog:', error);
        localStorage.removeItem(this.STORAGE_KEY);
      }
    }
    
    // Return updated default changelog with latest improvements
    const defaultChangelog: ChangelogEntry[] = [
      {
        version: '2.10.0',
        date: '2025-01-15',
        type: 'minor' as const,
        changes: [
          { type: 'feature' as const, description: 'Voice Filter System - Intelligent story filtering by audio generation status on My Stories and Discover pages' },
          { type: 'feature' as const, description: 'Real-time Voice Detection - Stories are automatically categorized based on their audio generation status' },
          { type: 'feature' as const, description: 'Visual Voice Indicators - Green Voice badges with speaker icons clearly indicate stories with generated audio' },
          { type: 'feature' as const, description: 'Enhanced Story Theater Experience - Full story audio playback with improved controls and child-friendly typography' },
          { type: 'improvement' as const, description: 'Unified Button Styling - Standardized all action buttons with consistent orange gradient styling across the application' },
          { type: 'improvement' as const, description: 'Theme Consistency - My Stories and Discover pages now share identical card designs and visual hierarchy' },
          { type: 'improvement' as const, description: 'Responsive Age Selection - Age selection cards now use proper responsive grid layout with adequate spacing' },
          { type: 'improvement' as const, description: 'Enhanced Visual Feedback - Better loading states and error handling throughout the application' },
          { type: 'fix' as const, description: 'Critical Real-time Image Update Fix - Images now appear immediately when generated, eliminating the need for page refresh' },
          { type: 'fix' as const, description: 'Story Theater Interface - Fixed header clipping and replaced complex fonts with child-friendly typography' },
          { type: 'fix' as const, description: 'Voice Icon Display - Corrected voice badges to show proper speaker icons instead of mute icons' },
          { type: 'fix' as const, description: 'Age Selection Layout - Fixed clipping issues with responsive grid layout and proper spacing' },
          { type: 'fix' as const, description: 'Button Theme Consistency - Standardized all buttons with consistent orange gradient styling' },
          { type: 'improvement' as const, description: 'Global Event Architecture - Implemented robust CustomEvent system for reliable cross-component communication' },
          { type: 'improvement' as const, description: 'State Management - Enhanced state update mechanisms to prevent stale closures and improve reliability' },
          { type: 'improvement' as const, description: 'Image Loading Optimization - Improved cache busting and state management for better performance' },
          { type: 'improvement' as const, description: 'Memory Management - Better cleanup of event listeners and subscriptions to prevent memory leaks' },
        ],
      },
      {
        version: '2.9.0',
        date: '2025-07-18',
        type: 'minor' as const,
        changes: [
          { type: 'feature' as const, description: 'Mobile Experience Overhaul - Complete redesign of mobile navigation with smooth hamburger menu and glass morphism effects' },
          { type: 'feature' as const, description: 'Perfect Mobile Navigation - All features now accessible on any device with intuitive touch interactions' },
          { type: 'feature' as const, description: 'Glass Design Enhancement - Beautiful glass morphism effects that work flawlessly across all screen sizes' },
          { type: 'improvement' as const, description: 'Improved Touch Interactions - Every button, menu, and feature optimized for mobile users with better touch targets' },
          { type: 'improvement' as const, description: 'Better Visual Hierarchy - Enhanced contrast and readability for parents and children across all devices' },
          { type: 'improvement' as const, description: 'Streamlined Navigation - Cleaner, more intuitive menu structure with improved user flow' },
          { type: 'improvement' as const, description: 'Responsive Design Perfection - Looks amazing on phones, tablets, and desktops with consistent experience' },
          { type: 'fix' as const, description: 'Resolved Mobile Menu Visibility Issues - Fixed hamburger menu dropdown positioning and interaction problems' },
          { type: 'fix' as const, description: 'Fixed Header Styling Consistency - Updated header to match footer glass morphism design for unified appearance' },
          { type: 'improvement' as const, description: 'Performance Optimization - Faster loading and smoother animations across all devices' },
          { type: 'improvement' as const, description: 'Cross-Device Compatibility - Consistent experience across all devices with proper responsive breakpoints' },
          { type: 'fix' as const, description: 'Fixed Mobile Menu Positioning - Moved mobile menu outside container div for proper full-width display' },
          { type: 'improvement' as const, description: 'Enhanced Mobile Menu Styling - Better background, spacing, hover effects, and scrolling for professional appearance' },
        ],
      },
      {
        version: '2.8.0',
        date: '2025-07-12',
        type: 'minor' as const,
        changes: [
          { type: 'feature' as const, description: 'Complete ElevenLabs TTS Integration - Replaced OpenAI TTS with high-quality ElevenLabs voices for superior audio storytelling' },
          { type: 'feature' as const, description: 'Professional Admin Panel Transformation - Comprehensive dashboard with real system monitoring, API health tracking, and cost management' },
          { type: 'feature' as const, description: 'ElevenLabs Voice Management System - Voice explorer with 11+ curated storytelling voices categorized by quality tiers (Free, Premium, Professional)' },
          { type: 'feature' as const, description: 'Real Cost Tracking System - Eliminated fake costs, now shows only actual usage from database with real ElevenLabs pricing ($0.03 per 1K characters)' },
          { type: 'feature' as const, description: 'Advanced Voice Selector - Enhanced UI with voice descriptions, accent information, and premium upgrade prompts for better user experience' },
          { type: 'feature' as const, description: 'Admin System Overview Dashboard - Real-time metrics showing total stories, segments, users, audio coverage, and today\'s activity' },
          { type: 'feature' as const, description: 'AI Provider Status Monitoring - Live status tracking for ElevenLabs, OpenAI, Google Gemini, OVH AI, and DALL-E with health indicators' },
          { type: 'feature' as const, description: 'Voice Testing & Discovery Tools - Test any ElevenLabs voice with custom text and explore available voices in your account' },
          { type: 'improvement' as const, description: 'Enhanced Voice Quality - Upgraded from OpenAI TTS to ElevenLabs with voices like Brian (Master Storyteller), Rachel (Warm), and Adam (Energetic)' },
          { type: 'improvement' as const, description: 'Professional Admin Interface - 7 organized tabs (Overview, Monitoring, Models, Costs, Logs, Voices, Settings) for comprehensive system management' },
          { type: 'improvement' as const, description: 'Cost Optimization Features - Real-time cost tracking with optimization tips (Turbo v2 is 33% cheaper than Multilingual v2)' },
          { type: 'improvement' as const, description: 'Database Health Monitoring - Real-time tracking of story segments, audio generation, and system performance metrics' },
          { type: 'improvement' as const, description: 'Voice Categorization System - Free tier (6 voices), Premium tier (5 voices), Professional tier (1 character voice) for monetization strategy' },
          { type: 'improvement' as const, description: 'Enhanced Audio Experience - Better voice mapping with storytelling-optimized voices and improved audio quality settings' },
          { type: 'fix' as const, description: 'Eliminated Fake Cost Data - Reset all estimated costs to $0.00 and implemented real usage tracking from story_segments table' },
          { type: 'fix' as const, description: 'Fixed Admin Panel Utility - Transformed from basic mockup to functional system management dashboard with real operational value' },
          { type: 'fix' as const, description: 'Resolved Voice Name Inconsistencies - Updated from old OpenAI voice names to proper ElevenLabs voice identifiers with descriptions' },
          { type: 'improvement' as const, description: 'Backwards Compatibility - Maintained legacy voice mapping for existing stories while upgrading to new ElevenLabs system' },
          { type: 'feature' as const, description: 'Cost Management Analytics - Track character usage patterns, optimize subscription tiers, and monitor API spending with real data' },
          { type: 'improvement' as const, description: 'System Status Alerts - Real-time notifications about service health, API status, and system operational state' },
        ],
      },
      {
        version: '2.7.1',
        date: '2025-07-11',
        type: 'patch' as const,
        changes: [
          { type: 'fix' as const, description: 'Fixed "End Story" button generating 3 additional chapters instead of 1 ending segment - now properly concludes stories with a single final chapter' },
          { type: 'fix' as const, description: 'Fixed Save button functionality - stories now properly save to user accounts with authentication handling and local storage fallback for anonymous users' },
          { type: 'fix' as const, description: 'Eliminated duplicate audio players causing simultaneous playback conflicts - consolidated audio architecture for clean single-player experience' },
          { type: 'fix' as const, description: 'Fixed slideshow auto-advance timing to sync with actual audio duration instead of text-based estimation for perfect narration synchronization' },
          { type: 'improvement' as const, description: 'Enhanced story completion flow - endings no longer include continuation choices, providing proper narrative closure' },
          { type: 'improvement' as const, description: 'Improved audio-visual synchronization in slideshow mode for immersive storytelling experience' },
          { type: 'improvement' as const, description: 'Streamlined audio player architecture to prevent conflicts and improve user experience' },
        ],
      },
      {
        version: '2.7.0',
        date: '2025-07-09',
        type: 'minor',
        changes: [
          { type: 'feature', description: 'Advanced Provider Monitoring System - Real-time tracking of AI provider usage, health status, and performance metrics' },
          { type: 'feature', description: 'Enhanced Admin Panel - Comprehensive provider management with visual status indicators and usage statistics' },
          { type: 'feature', description: 'Image Provider Status Dashboard - Live monitoring of OVH and OpenAI image generation services with health checks' },
          { type: 'feature', description: 'Provider Testing Tools - Individual provider testing capabilities with detailed response time monitoring' },
          { type: 'improvement', description: 'Enhanced Edge Function Logging - Detailed logging system for image generation with provider-specific tracking' },
          { type: 'improvement', description: 'Real-time Activity Log - Live feed of AI provider activity with success/error tracking and fallback monitoring' },
          { type: 'improvement', description: 'Provider Health Monitoring - Automatic health checks with error rate tracking and performance analytics' },
          { type: 'improvement', description: 'Enhanced Fallback System - Improved provider switching with detailed logging when primary provider fails' },
          { type: 'feature', description: 'Provider Usage Analytics - Comprehensive statistics showing OVH vs OpenAI usage patterns and success rates' },
          { type: 'improvement', description: 'Admin Interface Enhancement - Better organization of provider settings with visual status indicators' },
          { type: 'feature', description: 'Debug Tools Integration - Advanced debugging capabilities for troubleshooting AI provider issues' },
          { type: 'improvement', description: 'Enhanced Error Handling - Better error reporting and recovery mechanisms for AI generation failures' },
        ],
      },
      {
        version: '2.6.0',
        date: '2025-07-04',
        type: 'minor',
        changes: [
          { type: 'improvement', description: 'Streamlined User Interface (UI) - drastically reduced text density and information overload on the landing page' },
          { type: 'improvement', description: 'Transitioned from "game-like" feel to a more professional, product-focused design addressing UI overwhelm feedback' },
          { type: 'improvement', description: 'Enhanced AI Core with refined subject adherence, ensuring better focus on intended narrative and context' },
          { type: 'feature', description: 'Alternative Sub-Page for Education - dedicated page designed for serious learning experience' },
          { type: 'feature', description: 'Educational content prioritization over adventure and storytelling for educators and parents' },
          { type: 'improvement', description: 'Comprehensive Rebuild - systematic platform rebuild ensuring robust and scalable foundation' },
          { type: 'improvement', description: 'Long-term stability approach avoiding temporary patches for sustainable growth' },
          { type: 'improvement', description: 'Improved Accessibility & Content Safety measures, particularly for younger users and classroom environments' },
          { type: 'feature', description: 'Pre-made Story Examples and tutorials to help new users get started with clear prompting guidance' },
          { type: 'feature', description: 'UI Theming Options including lighter themes to broaden appeal beyond gaming aesthetic' },
          { type: 'improvement', description: 'Differentiated "Choose Your Own Adventure" emphasis as unique selling proposition' },
          { type: 'improvement', description: 'Optimized Story Pacing with A/B testing exploration for engagement and retention sweet spot' },
          { type: 'improvement', description: 'Maintained positive design elements - retained highly praised UI/UX design and visually appealing login page' },
        ],
      },
      {
        version: '2.5.0',
        date: '2025-06-30',
        type: 'minor',
        changes: [
          { type: 'fix', description: 'MAJOR AI Integration Fix - Resolved "Edge Function returned a non-2xx status code" errors that were preventing story generation' },
          { type: 'improvement', description: 'Upgraded to OpenAI GPT-4.1-2025-04-14 for superior story generation with enhanced creativity and coherence' },
          { type: 'improvement', description: 'Implemented robust fallback system - Google Gemini serves as backup when OpenAI is unavailable' },
          { type: 'improvement', description: 'Enhanced story creation UI with astronaut background consistency and improved vertical layout (Image → Text → Choices)' },
          { type: 'fix', description: 'Fixed image generation using GPT-Image-1 model for better visual storytelling integration' },
          { type: 'improvement', description: 'Added comprehensive error handling and logging throughout the AI generation pipeline for better reliability' },
          { type: 'improvement', description: 'Enhanced API response structure with proper success/error status handling for more stable user experience' },
          { type: 'fix', description: 'Resolved TypeError issues in edge functions that were causing generation failures' },
          { type: 'improvement', description: 'Improved story prompt engineering for more engaging narratives with 150-250 word segments' },
          { type: 'feature', description: 'Added multi-provider AI system with automatic failover capabilities for maximum uptime' },
        ],
      },
      {
        version: '2.4.0',
        date: '2025-06-29',
        type: 'minor',
        changes: [
          { type: 'improvement', description: 'Major refactoring of story display components - broke down large StorySegmentItem into focused components (StoryContent, StoryImageDisplay, etc.)' },
          { type: 'improvement', description: 'Enhanced image display system with clearer loading states and better error handling for story images' },
          { type: 'improvement', description: 'Simplified image URL validation logic and removed potentially interfering accessibility tests' },
          { type: 'improvement', description: 'Added comprehensive debug logging for image generation status tracking and troubleshooting' },
          { type: 'fix', description: 'Fixed navigation conflicts in header - removed conflicting onClick handlers from TaleForge logo for consistent routing' },
          { type: 'fix', description: 'Resolved issues where HOME and TaleForge logo buttons were not properly navigating to landing page' },
          { type: 'fix', description: 'Improved component organization by creating smaller, more maintainable story viewer components' },
          { type: 'improvement', description: 'Enhanced story image loading with better fallback states and user feedback during generation' },
        ],
      },
      {
        version: '2.3.0',
        date: '2025-01-28',
        type: 'minor',
        changes: [
          { type: 'feature', description: 'Comprehensive admin panel for managing AI providers (text generation, image generation, and text-to-speech)' },
          { type: 'feature', description: 'Dynamic provider configuration system with real-time switching between Gemini, OpenAI, Stable Diffusion, and DALL-E' },
          { type: 'feature', description: 'Admin role-based authentication system with secure access controls' },
          { type: 'feature', description: 'Provider health monitoring and automatic failover capabilities' },
          { type: 'improvement', description: 'Enhanced story generation - increased word count from 50-70 to 120-200 words per segment for richer storytelling' },
          { type: 'improvement', description: 'Refactored admin components into smaller, focused modules for better maintainability' },
          { type: 'improvement', description: 'Enhanced database trigger system for automatic story validation and cleanup' },
          { type: 'improvement', description: 'Improved error handling and logging across all edge functions for better debugging' },
          { type: 'improvement', description: 'Better provider configuration management with persistent settings storage' },
          { type: 'fix', description: 'Fixed TypeScript errors in admin components with proper type guards for spread operations' },
          { type: 'fix', description: 'Resolved database trigger validation issues that were preventing story creation' },
          { type: 'fix', description: 'Fixed story generation service reliability with improved error recovery' },
          { type: 'fix', description: 'Restored astronaut background image that was missing from the landing page' },
        ],
      },
      {
        version: '2.2.0',
        date: '2025-01-27',
        type: 'minor',
        changes: [
          { type: 'improvement', description: 'Enhanced "Tale Forge" title with premium golden gradient styling and improved typography' },
          { type: 'improvement', description: 'Redesigned landing page layout with better proportions - reduced hero section to 40vh for improved content visibility' },
          { type: 'improvement', description: 'Made authentication and waitlist sections more prominent and accessible without scrolling' },
          { type: 'improvement', description: 'Added proper Playfair Display font loading for the main title with elegant serif styling' },
          { type: 'improvement', description: 'Implemented subtle breathing glow animation for the title with shimmer effects' },
          { type: 'improvement', description: 'Enhanced responsive design with better title scaling across all screen sizes' },
          { type: 'fix', description: 'Fixed title font rendering issues with proper Google Fonts integration' },
          { type: 'fix', description: 'Resolved layout issues that were hiding important content below the fold' },
        ],
      },
      {
        version: '2.1.2',
        date: '2025-01-27',
        type: 'patch',
        changes: [
          { type: 'fix', description: 'Fixed story mode card images not loading by implementing proper static image paths' },
          { type: 'fix', description: 'Resolved image loading issues with correct file name mapping and error handling' },
          { type: 'improvement', description: 'Enhanced image loading with proper lazy loading and fallback states' },
          { type: 'improvement', description: 'Improved error handling for missing images with graceful fallbacks' },
          { type: 'feature', description: 'Added comprehensive image loading diagnostics and error reporting' },
        ],
      },
      {
        version: '2.1.1',
        date: '2025-01-27',
        type: 'patch',
        changes: [
          { type: 'fix', description: 'Fixed story mode card images not displaying correctly with proper loading states' },
          { type: 'fix', description: 'Improved image error handling with better fallback states and user feedback' },
          { type: 'improvement', description: 'Enhanced story card image loading with skeleton states and error recovery' },
          { type: 'improvement', description: 'Optimized image loading performance with proper lazy loading and caching' },
          { type: 'feature', description: 'Added automatic changelog update system for tracking future changes' },
        ],
      },
      {
        version: '2.1.0',
        date: '2025-01-27',
        type: 'minor',
        changes: [
          { type: 'improvement', description: 'Fixed story genre card images not loading properly' },
          { type: 'feature', description: 'Added waitlist functionality for user engagement' },
          { type: 'feature', description: 'Implemented changelog system to track updates' },
          { type: 'improvement', description: 'Enhanced responsive design across all screen sizes' },
          { type: 'improvement', description: 'Improved image loading with better fallback states' },
        ],
      },
      {
        version: '2.0.0',
        date: '2025-01-15',
        type: 'major',
        changes: [
          { type: 'feature', description: 'Interactive multimodal storytelling with AI-generated content' },
          { type: 'feature', description: 'Multiple story genres with visual themes' },
          { type: 'feature', description: 'Real-time story generation and progression' },
          { type: 'feature', description: 'User authentication and story persistence' },
          { type: 'feature', description: 'AI-generated images and audio for immersive experience' },
        ],
      },
    ];
    return defaultChangelog;
  }
  
  // Add a new changelog entry
  static addEntry(entry: ChangelogEntry): void {
    if (typeof window === 'undefined') return;
    
    const current = this.getCurrentChangelog();
    const updated = [entry, ...current];
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
    
    // Dispatch custom event for components to listen to
    window.dispatchEvent(new CustomEvent('changelog-updated', { detail: updated }));
  }
  
  // Generate version number based on change types
  static generateNextVersion(changes: ChangelogEntry['changes'], currentVersion: string = '2.8.0'): string {
    const [major, minor, patch] = currentVersion.split('.').map(Number);
    
    const hasMajor = changes.some(change => change.type === 'feature' && change.description.includes('breaking'));
    const hasMinor = changes.some(change => change.type === 'feature');
    const hasPatch = changes.some(change => change.type === 'fix' || change.type === 'improvement');
    
    if (hasMajor) {
      return `${major + 1}.0.0`;
    } else if (hasMinor) {
      return `${major}.${minor + 1}.0`;
    } else if (hasPatch) {
      return `${major}.${minor}.${patch + 1}`;
    }
    
    return currentVersion;
  }
  
  // Quick method to add changes
  static logChanges(changes: { type: 'feature' | 'improvement' | 'fix'; description: string }[]): void {
    const current = this.getCurrentChangelog();
    const currentVersion = current[0]?.version || '2.8.0';
    const nextVersion = this.generateNextVersion(changes, currentVersion);
    
    const entry: ChangelogEntry = {
      version: nextVersion,
      date: new Date().toISOString().split('T')[0],
      type: this.determineReleaseType(changes),
      changes: changes
    };
    
    this.addEntry(entry);
  }
  
  // Force clear changelog cache
  static forceClearChangelog(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.VERSION_KEY);
    window.dispatchEvent(new CustomEvent('changelog-updated', { detail: this.getCurrentChangelog() }));
  }
  
  private static determineReleaseType(changes: { type: string }[]): 'major' | 'minor' | 'patch' {
    const hasFeature = changes.some(change => change.type === 'feature');
    const hasFix = changes.some(change => change.type === 'fix');
    
    if (hasFeature) {
      return 'minor';
    } else if (hasFix) {
      return 'patch';
    }
    return 'patch';
  }
}

export default ChangelogManager;
