"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertTriangle, Clock, AlertOctagon } from "lucide-react"

interface VerdictBadgeProps {
  verdict: string
  size?: "sm" | "md" | "lg"
  showLabel?: boolean
}

export function VerdictBadge({ verdict, size = "md", showLabel = true }: VerdictBadgeProps) {
  const normalizedVerdict = verdict.toUpperCase()
  
  let variant: "pass" | "fail" | "uncertain" | "pending" | "default" = "default"
  let Icon = Clock
  
  switch (normalizedVerdict) {
    case "PASS":
      variant = "pass"
      Icon = CheckCircle
      break
    case "FAIL":
      variant = "fail"
      Icon = XCircle
      break
    case "UNCERTAIN":
      variant = "uncertain"
      Icon = AlertTriangle
      break
    case "PENDING":
      variant = "pending"
      Icon = Clock
      break
    case "EXCEPTION":
      variant = "fail"
      Icon = AlertOctagon
      break
  }

  const sizeClasses = {
    sm: "text-[10px] py-0 px-1.5 h-4 [&_svg]:w-3 [&_svg]:h-3 gap-1",
    md: "text-xs py-0.5 px-2.5 h-5 [&_svg]:w-3.5 [&_svg]:h-3.5 gap-1.5",
    lg: "text-sm py-1 px-3 h-7 [&_svg]:w-4 [&_svg]:h-4 gap-2",
  }

  return (
    <Badge variant={variant} className={sizeClasses[size]}>
      <Icon />
      {showLabel && <span>{normalizedVerdict}</span>}
    </Badge>
  )
}
