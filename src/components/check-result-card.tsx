"use client"

import * as React from "react"
import { 
  Fingerprint, 
  Package, 
  Box, 
  Layers, 
  Palette, 
  AlertTriangle, 
  ShieldAlert, 
  Puzzle,
  FileSearch
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { VerdictBadge } from "@/components/verdict-badge"
import { ConfidenceBar } from "@/components/confidence-bar"
import { cn } from "@/lib/utils"

interface CheckResultCardProps {
  checkKey: string
  verdict: string
  confidence: number
  detail: string
  className?: string
}

const iconMap: Record<string, React.ElementType> = {
  identity: Fingerprint,
  quantity: Package,
  cartons: Box,
  units_per_carton: Layers,
  variant: Palette,
  carton_damage: AlertTriangle,
  unit_damage: ShieldAlert,
  components: Puzzle,
}

export function CheckResultCard({ checkKey, verdict, confidence, detail, className }: CheckResultCardProps) {
  const Icon = iconMap[checkKey.toLowerCase()] || FileSearch
  
  // Format check key to readable title (e.g., units_per_carton -> Units Per Carton)
  const title = checkKey
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-4 flex flex-col gap-3 h-full">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-slate-100 p-1.5 text-slate-600">
              <Icon className="h-4 w-4" />
            </div>
            <h4 className="font-semibold text-slate-900 text-sm">{title}</h4>
          </div>
          <VerdictBadge verdict={verdict} size="sm" />
        </div>
        
        <div className="flex-1">
          <p className="text-xs text-slate-600 line-clamp-2">
            {detail}
          </p>
        </div>
        
        <div className="mt-auto pt-1 border-t border-slate-100">
          <div className="my-1 flex items-center justify-between">
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
              Confidence
            </span>
          </div>
          <ConfidenceBar value={confidence} showLabel={true} />
        </div>
      </CardContent>
    </Card>
  )
}
