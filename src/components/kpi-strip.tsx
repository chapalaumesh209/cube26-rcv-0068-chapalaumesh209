"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

export interface KPI {
  label: string
  value: string | number
  icon: LucideIcon
  color: string // Tailwind color class e.g., 'bg-blue-500'
  trend?: string
}

interface KPIStripProps {
  kpis: KPI[]
  className?: string
}

export function KPIStrip({ kpis, className }: KPIStripProps) {
  return (
    <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon
        // Derive text color from bg color if applicable, simple fallback
        const textColorClass = kpi.color.replace('bg-', 'text-')
        
        return (
          <div
            key={index}
            className="relative overflow-hidden rounded-xl border bg-white p-6 shadow-sm"
          >
            <div
              className={cn("absolute left-0 top-0 h-full w-1", kpi.color)}
            />
            <div className="flex items-center gap-4">
              <div className={cn("rounded-lg p-2 bg-slate-50", textColorClass)}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{kpi.label}</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold tracking-tight text-slate-900">
                    {kpi.value}
                  </h3>
                  {kpi.trend && (
                    <span className="text-xs font-medium text-slate-500">
                      {kpi.trend}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
