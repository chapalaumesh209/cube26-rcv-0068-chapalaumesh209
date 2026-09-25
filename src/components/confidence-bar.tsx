"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ConfidenceBarProps {
  value: number // 0 to 1
  showLabel?: boolean
  className?: string
}

export function ConfidenceBar({ value, showLabel = true, className }: ConfidenceBarProps) {
  const percentage = Math.max(0, Math.min(100, Math.round(value * 100)))
  
  let colorClass = "bg-verdict-fail"
  if (value >= 0.8) colorClass = "bg-verdict-pass"
  else if (value >= 0.5) colorClass = "bg-verdict-uncertain"

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="h-2 w-full flex-1 overflow-hidden rounded-full bg-slate-100">
        <div
          className={cn("h-full transition-all duration-500 ease-in-out", colorClass)}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <span className="w-9 text-right text-xs font-medium text-slate-600">
          {percentage}%
        </span>
      )}
    </div>
  )
}
