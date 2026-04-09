import React from 'react';
import { Settings } from 'lucide-react';
import { MODES } from '../config/constants';
import { cn } from '../lib/utils';

interface ModeSelectorProps {
  currentMode: string;
  onModeChange: (modeId: string, prompt: string) => void;
}

export function ModeSelector({ currentMode, onModeChange }: ModeSelectorProps) {
  return (
    <section className="glass-card p-6 h-full flex flex-col">
      <div className="flex items-center gap-3 text-xs font-bold tracking-[0.2em] text-amber-500/80 uppercase mb-5">
        <Settings className="w-4 h-4" />
        Processing Modality
      </div>

      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 content-start">
        {MODES.map((mode) => {
          const isActive = currentMode === mode.id;
          const isCustom = mode.id === 'custom';
          return (
            <button
              key={mode.id}
              onClick={() => onModeChange(mode.id, mode.prompt)}
              className={cn(
                "group flex flex-col p-4 rounded-xl border-2 text-left transition-all duration-500 relative overflow-hidden",
                isCustom && "col-span-2 flex-row items-center gap-5 py-5",
                isActive
                  ? "bg-amber-500/[0.07] border-amber-500/50 text-amber-500 shadow-[0_0_40px_rgba(245,158,11,0.1)] scale-[1.01]"
                  : "bg-zinc-950/40 border-zinc-700/50 text-zinc-400 hover:border-amber-500/20 hover:bg-zinc-900/60"
              )}
            >
              <div className={cn("flex gap-3 w-full", isCustom ? "items-center" : "items-start")}>
                <div className={cn(
                  "p-1.5 rounded-lg shrink-0 transition-colors duration-300",
                  isActive ? "bg-amber-500/20 text-amber-400" : "bg-zinc-700/50 text-zinc-500 group-hover:text-zinc-400"
                )}>
                  <mode.icon className={cn("transition-transform duration-500", isCustom ? "w-5 h-5" : "w-4 h-4", isActive && "scale-110")} />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className={cn(!isCustom && "min-h-[28px] flex items-center")}>
                    <p className={cn(
                      "text-[0.8125rem] font-bold tracking-tighter transition-colors leading-[1.2] line-clamp-2 text-balance overflow-hidden",
                      isActive ? "text-amber-500" : "text-zinc-400 group-hover:text-zinc-200"
                    )}>
                      {mode.name}
                    </p>
                  </div>
                  {isCustom && (
                    <p className="text-[clamp(0.6rem,0.65vw,0.65rem)] opacity-60 leading-tight font-medium italic truncate mt-0.5">
                      {mode.description}
                    </p>
                  )}
                </div>
              </div>

              {!isCustom && (
                  <p className="text-[clamp(0.6rem,0.65vw,0.65rem)] opacity-60 leading-tight mt-2.5 font-medium italic line-clamp-2">
                  {mode.description}
                </p>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
