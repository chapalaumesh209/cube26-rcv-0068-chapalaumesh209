import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-[4px] border border-[#c7cabc] bg-[#fffefa] px-3 py-2 text-sm text-[#1b2825] ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#67766b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b96332] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
