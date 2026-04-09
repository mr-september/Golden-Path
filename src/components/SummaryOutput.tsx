import React, { useState } from 'react';
import { CheckCircle2, Save, Trash2, Check, Copy } from 'lucide-react';
import { cn } from '../lib/utils';

interface SummaryOutputProps {
  summary: string;
  onClear: () => void;
}

export function SummaryOutput({ summary, onClear }: SummaryOutputProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="min-h-[500px] glass-card overflow-hidden flex flex-col shadow-[0_0_80px_rgba(0,0,0,0.4)]">
      <div className="p-5 border-b border-zinc-600/50 flex items-center justify-between bg-zinc-950/40 backdrop-blur-xl">
        <div className="flex items-center gap-3 text-xs font-bold tracking-[0.2em] text-amber-500 uppercase golden-glow">
          <CheckCircle2 className="w-4 h-4" />
          Distilled Knowledge
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/5 text-[10px] text-emerald-500/80 border border-emerald-500/10 font-medium tracking-wider uppercase">
            <Save className="w-3 h-3" />
            Verified
          </div>
          {summary && (
            <div className="flex items-center gap-2">
              <button
                onClick={copyToClipboard}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-lg",
                  copied
                    ? "bg-emerald-500 text-white shadow-emerald-500/20"
                    : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 shadow-black/20"
                )}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Source Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Export
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  if (window.confirm('Clear all distilled knowledge? This action is immediate.')) {
                    onClear();
                  }
                }}
                className="p-2 rounded-xl bg-zinc-800/50 hover:bg-rose-500/10 text-zinc-400 hover:text-rose-400 transition-all active:scale-95"
                title="Clear Knowledge"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 p-8 font-mono text-sm leading-relaxed text-zinc-200 overflow-auto selection:bg-amber-500/30">
        {summary ? (
          <div className="whitespace-pre-wrap animate-in fade-in duration-1000 slide-in-from-bottom-2">
            {summary}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-zinc-400 gap-6 opacity-40">
            <div className="relative">
              <div className="absolute inset-0 bg-amber-500/10 blur-2xl rounded-full" />
              <div className="w-16 h-16 rounded-3xl bg-zinc-900 border border-zinc-600 flex items-center justify-center relative z-10">
                <CheckCircle2 className="w-8 h-8" />
              </div>
            </div>
            <p className="text-center max-w-[340px] text-sm font-medium tracking-wide italic">
              Processed output will be generated here.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
