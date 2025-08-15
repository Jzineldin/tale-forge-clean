import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "tf-btn",
  {
    variants: {
      variant: {
        // === UNIFIED BUTTON VARIANTS === //
        // Using our new tf-btn system for consistency
        default: "tf-btn-primary",
        primary: "tf-btn-primary",
        secondary: "tf-btn-secondary",
        ghost: "tf-btn-ghost",
        danger: "tf-btn-danger",

        // Orange gradient variants for CTA sections
        orange: "tf-btn-orange",
        "orange-amber": "tf-btn-orange-amber",
        "yellow-orange": "tf-btn-yellow-orange",

        // Shadcn compatibility variants
        destructive: "tf-btn-danger",
        outline: "tf-btn-secondary",
        link: "text-primary underline-offset-4 hover:underline bg-transparent border-none shadow-none",

        // Legacy variants (deprecated - use primary/secondary instead)
        "orange-base": "tf-btn-primary",
        "orange-bright": "tf-btn-primary",
        "orange-brightest": "tf-btn-primary",
        "cta-primary": "tf-btn-primary",
        "cta-secondary": "tf-btn-secondary",
        "cta-ghost": "tf-btn-ghost",
      },
      size: {
        // === UNIFIED BUTTON SIZES === //
        // Using our tf-btn size system
        default: "", // Base tf-btn size
        sm: "tf-btn-sm",
        lg: "tf-btn-lg",
        icon: "tf-btn-icon",

        // Mobile-optimized sizes (automatically applied on mobile)
        mobile: "tf-btn-lg", // Maps to large for mobile
        "mobile-sm": "", // Maps to default for mobile
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  /** Enable mobile-optimized touch targets automatically */
  mobileOptimized?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, mobileOptimized = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    // Auto-apply mobile optimization based on screen size or explicit prop
    const finalSize = mobileOptimized ? "mobile" : size;
    
    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size: finalSize, className }),
          // Additional mobile optimizations
          "touch-manipulation", // Improves touch responsiveness
          "select-none", // Prevents text selection on touch
          // Ensure proper focus states for accessibility
          "focus:ring-2 focus:ring-offset-2 focus:ring-primary",
          // Mobile-specific improvements
          "active:scale-95 transition-transform duration-normal", // Touch feedback using our duration token
          // Ensure minimum touch target size on all devices
          "min-h-[44px] min-w-[44px]"
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }