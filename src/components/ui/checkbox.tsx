"use client";
import * as React from "react"
import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    onCheckedChange?: (checked: boolean) => void
  }
>(({ className, onCheckedChange, onChange, ...props }, ref) => (
  <input
    type="checkbox"
    ref={ref}
    onChange={(e) => {
      onChange?.(e);
      onCheckedChange?.(e.target.checked);
    }}
    className={cn(
      "peer h-4 w-4 shrink-0 rounded-sm border border-border-subtle bg-transparent ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 checked:bg-accent checked:border-accent appearance-none relative after:content-['✓'] after:absolute after:inset-0 after:flex after:items-center after:justify-center after:text-[10px] after:text-primary-bg after:opacity-0 checked:after:opacity-100 transition-all",
      className
    )}
    {...props}
  />
))
Checkbox.displayName = "Checkbox"

export { Checkbox }
