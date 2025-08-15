import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // === UNIFIED INPUT SYSTEM === //
          // Using our tf-input class for consistency
          "tf-input",
          // Additional mobile optimizations
          "text-base", // Prevent iOS zoom
          "md:text-sm", // Smaller on desktop
          "touch-manipulation", // Better touch response
          "transition-all duration-normal",
          // Enhanced active state for mobile feedback
          "active:scale-[0.99] active:transition-transform active:duration-100",
          className
        )}
        ref={ref}
        // Mobile-specific attributes for better UX
        autoComplete={props.autoComplete || "off"}
        autoCapitalize={type === "email" ? "none" : props.autoCapitalize}
        autoCorrect={type === "email" ? "off" : props.autoCorrect}
        spellCheck={type === "email" ? "false" : props.spellCheck}
        // Enhanced mobile keyboard optimization
        inputMode={
          type === "email" ? "email" :
          type === "tel" ? "tel" :
          type === "url" ? "url" :
          type === "number" ? "numeric" :
          type === "search" ? "search" :
          props.inputMode
        }
        // Improved accessibility
        aria-invalid={props['aria-invalid'] || "false"}
        aria-describedby={props['aria-describedby']}
        // Better mobile form validation
        pattern={props.pattern}
        title={props.title}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }