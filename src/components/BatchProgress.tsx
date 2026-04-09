import React from 'react';
import { motion } from 'motion/react';

interface BatchProgressProps {
  progress: number;
  batchCount: number;
}

export function BatchProgress({ progress, batchCount }: BatchProgressProps) {
  if (batchCount === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-[11px] font-bold tracking-[0.2em] text-zinc-500 px-1 uppercase">
        <span className="flex items-center gap-2">
          <div className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
          Queue Progress
        </span>
        <span className="text-amber-500/80">{Math.round(progress)}%</span>
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
      </div>
    </div>
  );
}
