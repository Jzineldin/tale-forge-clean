
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Star, X, Calendar } from 'lucide-react';

interface WhatsNewModalProps {
  trigger?: React.ReactNode;
}

const WhatsNewModal: React.FC<WhatsNewModalProps> = ({ trigger }) => {
  const [showWhatsNew, setShowWhatsNew] = useState(false);

  const recentFeatures = [
    {
      category: "✨ New Features",
      date: "2025-01-15",
      items: [
        "Voice Filter System - Intelligent story filtering by audio generation status on My Stories and Discover pages",
        "Real-time Voice Detection - Stories are automatically categorized based on their audio generation status",
        "Visual Voice Indicators - Green 'Voice' badges with speaker icons clearly indicate stories with generated audio",
        "Enhanced Story Theater Experience - Full story audio playback with improved controls and child-friendly typography"
      ]
    },
    {
      category: "🎨 UI/UX Improvements",
      date: "2025-01-15",
      items: [
        "Unified Button Styling - Standardized all action buttons with consistent orange gradient styling",
        "Theme Consistency - My Stories and Discover pages now share identical card designs and visual hierarchy",
        "Responsive Age Selection - Age selection cards now use proper responsive grid layout with adequate spacing",
        "Enhanced Visual Feedback - Better loading states and error handling throughout the application"
      ]
    },
    {
      category: "🐛 Critical Bug Fixes",
      date: "2025-01-15",
      items: [
        "Real-time Image Updates - Images now appear immediately when generated, eliminating the need for page refresh",
        "Story Theater Interface - Fixed header clipping and replaced complex fonts with child-friendly typography",
        "Voice Icon Display - Corrected voice badges to show proper speaker icons instead of mute icons",
        "Age Selection Layout - Fixed clipping issues with responsive grid layout and proper spacing",
        "Button Theme Consistency - Standardized all buttons with consistent orange gradient styling"
      ]
    },
    {
      category: "🔧 Technical Improvements",
      date: "2025-01-15",
      items: [
        "Global Event Architecture - Implemented robust CustomEvent system for reliable cross-component communication",
        "State Management - Enhanced state update mechanisms to prevent stale closures and improve reliability",
        "Image Loading Optimization - Improved cache busting and state management for better performance",
        "Memory Management - Better cleanup of event listeners and subscriptions to prevent memory leaks"
      ]
    },
    {
      category: "📱 Mobile Experience Overhaul",
      date: "2025-07-18",
      items: [
        "Perfect Mobile Navigation - Smooth hamburger menu with all features accessible on any device",
        "Glass Design Enhancement - Beautiful new glass morphism effects that work flawlessly across all screen sizes",
        "Improved Touch Interactions - Every button, menu, and feature optimized for mobile users",
        "Fixed Mobile Menu Visibility - Resolved hamburger menu dropdown positioning and interaction issues",
        "Header-Footer Consistency - Updated header styling to match footer's glass morphism design"
      ]
    },
    {
      category: "✨ User Experience Improvements",
      date: "2025-07-18",
      items: [
        "Better Visual Hierarchy - Enhanced contrast and readability for parents and children",
        "Streamlined Navigation - Cleaner, more intuitive menu structure",
        "Responsive Design Perfection - Looks amazing on phones, tablets, and desktops",
        "Enhanced Typography - Consistent fantasy-heading class across all major headings",
        "Golden Color System - Unified golden colors (#F4D03F for titles, #FF9500 for buttons)"
      ]
    },
    {
      category: "🛠️ Platform Stability",
      date: "2025-07-18",
      items: [
        "Bug Fixes - Resolved mobile menu visibility and interaction issues",
        "Performance Optimization - Faster loading and smoother animations",
        "Cross-Device Compatibility - Consistent experience across all devices",
        "Mobile Menu Positioning - Fixed full-width dropdown positioning outside container",
        "CSS Specificity Fixes - Resolved conflicts between desktop and mobile menu styles"
      ]
    },
    {
      category: "🎨 Design & Layout Fixes",
      date: "2025-07-17",
      items: [
        "Fixed 'Tale Forge' Title Wrapping - Added whitespace-nowrap to prevent text overflow",
        "Removed Dark Overlay - Cleaned up unwanted dark overlay div causing layout issues",
        "Glass Container Enhancement - Improved glassmorphic box with darker background and stronger blur",
        "Button Alignment - Fixed hero section button container alignment and spacing",
        "Font Consistency - Applied fantasy-heading class consistently across all major headings"
      ]
    },
    {
      category: "🎨 User Experience",
      date: "2025-07-16",
      items: [
        "Fixed story card title truncation issues across Discover and My Stories pages",
        "Enhanced mobile responsiveness for better viewing on all devices",
        "Improved story card layouts with better text wrapping and readability",
        "Added comprehensive search and filtering capabilities"
      ]
    },
    {
      category: "🔧 Technical Improvements",
      date: "2025-07-15",
      items: [
        "Optimized story generation with narrative context building for consistency",
        "Enhanced slideshow and audio synchronization for better user experience",
        "Implemented ElevenLabs voice integration for high-quality narration",
        "Added real-time AI provider health monitoring in admin panel"
      ]
    },
    {
      category: "🚀 New Features",
      date: "2025-07-14",
      items: [
        "Community story discovery with public story sharing",
        "Advanced story export options (EPUB, PDF, HTML, Text)",
        "Comprehensive admin dashboard with waitlist management",
        "Enhanced story completion interface with download and publishing options"
      ]
    },
    {
      category: "🛡️ Security & Performance",
      date: "2025-07-13",
      items: [
        "Enhanced security with rate limiting and input validation",
        "Improved error handling and user feedback systems",
        "Optimized database queries and real-time connection management",
        "Added comprehensive code audit and security improvements"
      ]
    }
  ];

  const defaultTrigger = (
    <Button
      onClick={() => setShowWhatsNew(true)}
      variant="outline"
      className="px-6 py-3 text-white border-white/20 bg-black/20 hover:bg-white/10 hover:border-white/30 backdrop-blur-sm"
    >
      <Star className="mr-2 h-4 w-4" />
      What's New?
    </Button>
  );

  return (
    <>
      {trigger ? (
        <div onClick={() => setShowWhatsNew(true)}>
          {trigger}
        </div>
      ) : (
        defaultTrigger
      )}

      <Dialog open={showWhatsNew} onOpenChange={setShowWhatsNew}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-slate-900/95 border-amber-400/30 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-amber-300 flex items-center gap-2">
              <Star className="h-6 w-6" />
              What's New in Tale Forge
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              Discover the latest features, improvements, and updates to enhance your storytelling experience
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 mt-4">
            {recentFeatures.map((category, index) => (
              <div key={index} className="space-y-3">
                <div className="flex items-center justify-between border-b border-amber-400/30 pb-2">
                  <h3 className="text-lg font-semibold text-amber-200">
                    {category.category}
                  </h3>
                  <div className="flex items-center text-gray-400 text-sm">
                    <Calendar className="h-4 w-4 mr-1" />
                    {category.date}
                  </div>
                </div>
                <ul className="space-y-2 pl-4">
                  {category.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="text-gray-300 flex items-start gap-2">
                      <span className="text-amber-400 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="flex justify-end mt-6 pt-4 border-t border-amber-400/30">
            <Button
              onClick={() => setShowWhatsNew(false)}
              variant="outline"
              className="border-amber-400/50 text-amber-300 hover:bg-amber-400/10"
            >
              <X className="mr-2 h-4 w-4" />
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WhatsNewModal;
