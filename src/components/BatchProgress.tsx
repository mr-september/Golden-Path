import React from 'react';
import { motion } from 'motion/react';
import { Batch } from '../types';
import { cn } from '../lib/utils';

interface BatchProgressProps {
  progress: number;
  batches: Batch[];
  isIndexing?: boolean;
}

export function BatchProgress({ progress, batches, isIndexing }: BatchProgressProps) {
  const hasBatches = batches && batches.length > 0;
  
  if (!hasBatches && !isIndexing) return null;

  const showDormant = !hasBatches || isIndexing;

  return (
    <div className={cn("space-y-4 transition-opacity duration-500", showDormant ? (isIndexing ? "opacity-100" : "opacity-30") : "opacity-100")}>
      <div className="flex justify-between text-[11px] font-bold tracking-[0.2em] text-zinc-500 px-1 uppercase">
        <span className="flex items-center gap-2">
          <div className={cn("w-1 h-1 rounded-full", isIndexing ? "bg-amber-500 animate-pulse" : (showDormant ? "bg-zinc-700" : "bg-amber-500 animate-pulse"))} />
          {isIndexing ? "Indexing Fragments..." : (showDormant ? "Queue Dormant" : "Queue Progress")}
        </span>
        <span className={cn(showDormant ? "text-zinc-600" : "text-amber-500/80")}>
          {showDormant ? "--%" : `${Math.round(progress)}%`}
        </span>
      </div>
      <div className="h-3 w-full bg-zinc-950/80 rounded-full overflow-hidden border border-zinc-800/80 relative shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]">
        <div className="absolute inset-0 bg-zinc-900/40 opacity-50" />
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1.2, ease: "circOut" }}
          className="h-full bg-gradient-to-r from-amber-600 via-amber-300 to-amber-500 relative z-10"
          style={{ 
            boxShadow: '0 0 20px rgba(245, 158, 11, 0.4), inset 0 0 8px rgba(255, 255, 255, 0.2)' 
          }}
        >
          {/* Animated Highlight Streak */}
          <div className="absolute top-0 right-0 h-full w-32 bg-gradient-to-l from-white/20 to-transparent animate-pulse" />
        </motion.div>
        {isIndexing && <div className="absolute inset-0 skeleton-shimmer" />}
      </div>

      <div className="mt-4 flex justify-between gap-[2px] bg-zinc-900/40 p-2.5 rounded-xl border border-zinc-800/50 relative overflow-hidden">
        {isIndexing && <div className="absolute inset-0 skeleton-shimmer z-10" />}
        {showDormant ? (
          // Render a dormant placeholder grid to maintain height and layout
          Array.from({ length: 40 }).map((_, idx) => (
            <div 
              key={`placeholder-${idx}`} 
              className="h-1.5 flex-1 min-w-[4px] max-w-[32px] rounded-[1px] bg-zinc-800/40"
            />
          ))
        ) : (
          batches.map((batch, idx) => (
            <div 
              key={batch.id}
              title={`Batch ${idx + 1} - ${batch.status}`}
              className={cn(
                "h-1.5 flex-1 min-w-[4px] max-w-[32px] rounded-[1px] transition-all duration-300",
                batch.status === 'completed' ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" :
                batch.status === 'processing' ? "bg-blue-400 animate-pulse shadow-[0_0_8px_rgba(96,165,250,0.6)]" :
                batch.status === 'retrying' ? "bg-orange-500 animate-pulse" :
                batch.status === 'error' ? "bg-red-500" :
                "bg-zinc-800"
              )}
            />
          ))
        )}
      </div>
    </div>
  );
}
