import React from 'react';
import { Settings, Github, History } from 'lucide-react';
import { SupportButton } from './SupportButton';

import { ApiStatus } from '../types';
import { cn } from '../lib/utils';

interface HeaderProps {
  apiStatus: ApiStatus;
  cooldownTime: number;
  retryingBatch?: { retryAttempt?: number; retryDelay?: number };
  fileName: string | null;
  onErrorClick: () => void;
}

export function Header({
  apiStatus,
  cooldownTime,
  retryingBatch,
  fileName,
  onErrorClick
}: HeaderProps) {
  return (
    <>
      {/* API Health Badge */}
      {/* API Health Badge - HUD Layer */}
      <div className="fixed top-8 left-1/2 -translate-x-1/2 w-full max-w-7xl px-8 z-50 pointer-events-none">
        <div className="flex items-center justify-between pointer-events-auto w-full">
          <SupportButton />

          <div className="flex items-center gap-4">
          {fileName && (
            <div className="flex items-center gap-3 px-4 py-2 rounded-full border border-zinc-700 bg-zinc-900/40 text-[11px] font-bold tracking-[0.15em] uppercase text-zinc-400 backdrop-blur-sm shadow-xl transition-all animate-in fade-in slide-in-from-right-4 duration-1000">
              <History className="w-4 h-4 text-amber-500" />
              <span>Session: <span className="text-zinc-200">{fileName}</span></span>
            </div>
          )}
          <a
            href="https://github.com/mr-september/Golden-Path"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-full bg-zinc-900/80 border border-zinc-700 text-zinc-400 hover:text-amber-500 hover:border-amber-500/30 transition-all shadow-xl backdrop-blur-sm"
            title="View on GitHub"
          >
            <Github className="w-5 h-5" />
          </a>
          <button
            onClick={() => {
              if (apiStatus === 'error' || apiStatus === 'quota_limit') {
                onErrorClick();
              }
            }}
            className={cn(
              "flex items-center gap-3 px-4 py-2 rounded-full border text-[11px] font-bold tracking-[0.15em] uppercase backdrop-blur-xl transition-all duration-700 shadow-2xl",
              apiStatus === 'healthy' ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400/90 shadow-emerald-500/5" :
                apiStatus === 'quota_limit' ? "bg-amber-500/10 border-amber-500/30 text-amber-500 shadow-amber-500/10" :
                  apiStatus === 'error' ? "bg-rose-500/10 border-rose-500/30 text-rose-400 shadow-rose-500/10" :
                    "bg-zinc-900/50 border-zinc-700 text-zinc-400",
              (apiStatus === 'error' || apiStatus === 'quota_limit') && "cursor-pointer hover:border-white/20 active:scale-95"
            )}
          >
            <div className={cn(
              "w-2 h-2 rounded-full shadow-[0_0_10px_currentColor]",
              apiStatus === 'healthy' ? "bg-emerald-500 animate-pulse" :
                apiStatus === 'quota_limit' ? "bg-amber-500 animate-bounce" :
                  apiStatus === 'error' ? "bg-rose-500" :
                    "bg-zinc-700"
            )} />
            <span>Status: {apiStatus.replace('_', ' ')}</span>
            {apiStatus === 'quota_limit' && (retryingBatch || cooldownTime > 0) && (
              <span className="ml-2 pl-3 border-l border-amber-500/30 text-amber-500/80 font-medium">
                {cooldownTime > 0 ? `${cooldownTime}s Wait` : `Retry #${retryingBatch?.retryAttempt}`}
              </span>
            )}
          </button>
          </div>
        </div>
      </div>

      <header className="max-w-7xl mx-auto px-8 pt-10 pb-0 space-y-6 relative overflow-hidden text-center lg:text-left">

        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <h1 className="text-6xl md:text-7xl font-black tracking-tight text-white leading-[1.1]">
              Golden<span className="text-transparent bg-clip-text bg-linear-to-r from-amber-400 via-amber-200 to-amber-500">Path.</span>
            </h1>
            <p className="text-[10px] uppercase tracking-[0.2em] font-medium text-zinc-600 mb-2 lg:mb-4">
              AI can make mistakes
            </p>
          </div>
          <p className="text-zinc-400 max-w-2xl text-xl font-light leading-relaxed">
            Synthesize massive chat logs into a single, high-fidelity source of truth.<br></br>
            Prune technical noise. <span className="text-amber-500/80 font-medium">Capture the success.</span>
          </p>
        </div>

      </header>
    </>
  );
}
