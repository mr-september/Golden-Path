import React from 'react';

/** A single shimmering skeleton block */
function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={`rounded-xl bg-zinc-900/80 overflow-hidden relative ${className ?? ''}`}
    >
      {/* The sweep highlight */}
      <div className="absolute inset-0 skeleton-shimmer" />
    </div>
  );
}

/**
 * Dashboard-matched skeleton rendered while session state is
 * being rehydrated from localStorage.  Mirrors the exact layout of
 * App.tsx so there is zero visual jitter on mount.
 */
export function SkeletonLoader() {
  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100">
      {/* Ambient background SVG (identical to live app) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20">
        <svg
          className="absolute w-[200%] h-[200%] -top-[50%] -left-[50%] text-amber-500/10"
          viewBox="0 0 1000 1000"
          preserveAspectRatio="none"
        >
          <path
            className="animate-path stroke-current fill-none stroke-[0.5]"
            d="M 0 500 Q 250 100 500 500 T 1000 500"
          />
          <path
            className="animate-path stroke-current fill-none stroke-[0.3]"
            d="M 0 600 Q 300 200 600 600 T 1000 600"
            style={{ animationDelay: '-15s' }}
          />
        </svg>
      </div>

      {/* HUD bar */}
      <div className="fixed top-8 left-1/2 -translate-x-1/2 w-full max-w-7xl px-8 z-50 pointer-events-none">
        <div className="flex items-center justify-end gap-4">
          <Shimmer className="w-8 h-8 rounded-full" />
          <Shimmer className="w-24 h-8 rounded-full" />
          <Shimmer className="w-24 h-8 rounded-full" />
        </div>
      </div>

      {/* Header */}
      <div className="max-w-7xl mx-auto px-8 pt-10 pb-2 space-y-4">
        <Shimmer className="w-64 h-14 rounded-2xl" />
        <Shimmer className="w-96 h-5 rounded-lg" />
        <Shimmer className="w-72 h-4 rounded-lg opacity-60" />
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 relative z-10">
        <div className="flex flex-col gap-12 mt-8">
          {/* Control Panel — 3-column row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Shimmer className="h-72" />
            <Shimmer className="h-72" />
            <div className="flex flex-col gap-6">
              <Shimmer className="flex-1 min-h-40" />
              <Shimmer className="h-16" />
            </div>
          </div>

          {/* Start button */}
          <Shimmer className="w-full h-20 rounded-2xl opacity-40" />

          {/* Results Panel */}
          <div className="space-y-10">
            {/* Progress track */}
            <div className="space-y-4">
              <div className="flex justify-between px-1">
                <Shimmer className="w-32 h-3" />
                <Shimmer className="w-8 h-3" />
              </div>
              <Shimmer className="w-full h-3 rounded-full" />
              <Shimmer className="w-full h-8 rounded-xl" />
            </div>

            {/* Summary output */}
            <Shimmer className="w-full min-h-[500px]" />
          </div>
        </div>
      </div>
    </div>
  );
}
