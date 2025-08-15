import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-40 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      // Enhanced mobile backdrop - better visibility and interaction
      "backdrop-blur-sm", // Subtle blur effect for better focus
      "supports-[backdrop-filter]:bg-black/60", // Lighter overlay when blur is supported
      // Improved animation timing for mobile
      "data-[state=open]:duration-300 data-[state=closed]:duration-200",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        // Base positioning and animation
        "fixed left-[50%] top-[50%] z-60 grid translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background shadow-lg duration-200",
        // Ensure pointer events work on dialog content
        "pointer-events-auto",
        // Animation states
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
        // Mobile-first responsive sizing with safe areas
        "w-[95vw] max-w-lg", // Mobile: 95% of viewport width
        "max-h-[85vh] sm:max-h-[90vh]", // More conservative height on mobile for virtual keyboards
        "overflow-y-auto overflow-x-hidden", // Allow vertical scrolling, prevent horizontal
        // Mobile padding and spacing with safe areas
        "p-4 sm:p-6", // Smaller padding on mobile
        "mx-2 sm:mx-0", // Extra margin on very small screens
        // Enhanced mobile positioning
        "top-[45%] sm:top-[50%]", // Slightly higher on mobile for better thumb reach
        // Desktop styles
        "sm:rounded-lg",
        // Touch optimization
        "touch-manipulation",
        // Enhanced focus management and accessibility
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        // Better mobile shadow and border
        "shadow-xl sm:shadow-lg", // More prominent shadow on mobile
        "border-border/50", // Subtle border
        // Prevent content from going under notches/safe areas
        "safe-area-inset",
        className
      )}
      style={{ zIndex: 60 }}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className={cn(
        "absolute right-3 top-3 sm:right-4 sm:top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",
        // Mobile-optimized close button - WCAG 2.1 AA compliant
        "min-h-[44px] min-w-[44px] flex items-center justify-center", // Larger touch target
        "touch-manipulation", // Better touch response
        "z-10", // Ensure it's above other content
        // Enhanced mobile styling
        "rounded-md sm:rounded-sm", // More rounded on mobile for easier targeting
        "bg-background/80 hover:bg-background", // Better visibility on mobile
        "border border-border/50", // Subtle border for definition
        // Improved mobile positioning
        "right-2 top-2 sm:right-4 sm:top-4", // Closer to edge on mobile for easier reach
        // Enhanced focus and active states
        "focus:ring-amber-400 focus:border-amber-400", // Consistent focus styling
        "active:scale-95 active:transition-transform active:duration-100", // Touch feedback
      )}>
        <X className="h-5 w-5 sm:h-4 sm:w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      // Mobile optimization - better spacing
      "pb-2 sm:pb-0", // Extra padding on mobile
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      // Mobile-first: stack buttons vertically, then horizontal on desktop
      "flex flex-col gap-3 sm:flex-row sm:justify-end sm:space-x-2 sm:gap-0",
      // Mobile optimization - better spacing and touch targets
      "pt-6 sm:pt-4", // Extra top padding on mobile
      // Enhanced mobile button styling
      "[&>button]:min-h-[44px]", // Ensure all buttons have proper touch targets
      "[&>button]:w-full sm:[&>button]:w-auto", // Full width buttons on mobile
      "[&>button]:touch-manipulation", // Better touch response for all buttons
      // Better mobile button order (primary action at bottom)
      "flex-col-reverse sm:flex-row", // Reverse order on mobile for better thumb reach
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      // Mobile optimization - better text sizing
      "text-base sm:text-lg", // Smaller on mobile
      "pr-8", // Ensure space for close button
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn(
      "text-sm text-muted-foreground",
      // Mobile optimization - better readability
      "text-sm sm:text-sm", // Consistent sizing
      "leading-relaxed", // Better line height for mobile reading
      className
    )}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}