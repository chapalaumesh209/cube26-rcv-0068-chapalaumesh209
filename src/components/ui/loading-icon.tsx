"use client";

import React from "react";

interface LoadingIconProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  color?: "indigo" | "emerald" | "amber" | "rose" | "slate" | "white";
  className?: string;
  label?: string;
}

const sizeMap = {
  xs: "w-3.5 h-3.5",
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-7 h-7",
  xl: "w-10 h-10",
};

const strokeMap = {
  xs: 2.5,
  sm: 2.5,
  md: 2.2,
  lg: 2,
  xl: 1.8,
};

const colorMap = {
  indigo: {
    track: "stroke-indigo-100",
    head: "stroke-indigo-600",
    dot: "bg-indigo-600",
    text: "text-indigo-600",
  },
  emerald: {
    track: "stroke-emerald-100",
    head: "stroke-emerald-600",
    dot: "bg-emerald-600",
    text: "text-emerald-600",
  },
  amber: {
    track: "stroke-amber-100",
    head: "stroke-amber-600",
    dot: "bg-amber-600",
    text: "text-amber-600",
  },
  rose: {
    track: "stroke-rose-100",
    head: "stroke-rose-600",
    dot: "bg-rose-600",
    text: "text-rose-600",
  },
  slate: {
    track: "stroke-slate-200",
    head: "stroke-slate-700",
    dot: "bg-slate-700",
    text: "text-slate-700",
  },
  white: {
    track: "stroke-white/20",
    head: "stroke-white",
    dot: "bg-white",
    text: "text-white",
  },
};

export function LoadingIcon({
  size = "md",
  color = "indigo",
  className = "",
  label,
}: LoadingIconProps) {
  const sizeClass = sizeMap[size];
  const strokeWidth = strokeMap[size];
  const colors = colorMap[color];

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div className={`relative ${sizeClass} shrink-0`}>
        {/* Subtle breathing glow */}
        <div
          className={`absolute inset-0 rounded-full ${colors.dot} opacity-20 blur-[3px] animate-pulse`}
        />

        {/* Outer orbital precision track & spinning head */}
        <svg
          className="w-full h-full animate-[spin_0.8s_linear_infinite]"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Static track */}
          <circle
            cx="12"
            cy="12"
            r="9"
            className={colors.track}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Animated spinning arc with smooth round cap */}
          <circle
            cx="12"
            cy="12"
            r="9"
            className={colors.head}
            strokeWidth={strokeWidth}
            strokeDasharray="56.5"
            strokeDashoffset="38"
            strokeLinecap="round"
          />
        </svg>

        {/* Inner orbiting counter-dot for ultra-smooth optical balance */}
        {(size === "md" || size === "lg" || size === "xl") && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span
              className={`w-1 h-1 rounded-full ${colors.dot} animate-ping opacity-75`}
            />
          </div>
        )}
      </div>

      {label && (
        <span className={`text-xs font-semibold font-mono ${colors.text}`}>
          {label}
        </span>
      )}
    </div>
  );
}
