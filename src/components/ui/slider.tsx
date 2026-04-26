"use client";
import * as React from "react"
import { cn } from "@/lib/utils"

const Slider = React.forwardRef<
  HTMLInputElement,
  Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> & {
    value: number[],
    onValueChange: (value: number[]) => void
  }
>(({ className, value, onValueChange, ...props }, ref) => (
  <input
    type="range"
    ref={ref}
    value={value[0]}
    onChange={(e) => onValueChange([parseFloat(e.target.value)])}
    className={cn(
      "w-full h-1.5 bg-border-subtle rounded-full appearance-none cursor-pointer accent-accent",
      className
    )}
    {...props}
  />
))
Slider.displayName = "Slider"

export { Slider }
