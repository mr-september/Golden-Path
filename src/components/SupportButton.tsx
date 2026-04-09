import React from 'react';
import { Heart, Coffee, Globe, Coins, ChevronDown, ExternalLink } from 'lucide-react';
import { cn } from '../lib/utils';

export function SupportButton() {
  return (
    <div className="group relative pointer-events-auto">
      <button className={cn(
        "flex items-center gap-2.5 px-4 py-2 rounded-full border",
        "bg-amber-500/5 border-amber-500/20 text-amber-200/90",
        "text-[11px] font-bold tracking-[0.15em] uppercase backdrop-blur-md",
        "hover:bg-amber-500/15 hover:border-amber-500/40 transition-all duration-300 shadow-xl"
      )}>
        <Heart className="w-4 h-4 text-amber-500 fill-amber-500/20 animate-pulse" />
        <span>Support GoldenPath</span>
        <ChevronDown className="w-3.5 h-3.5 text-amber-500/50 group-hover:rotate-180 transition-transform duration-500" />
      </button>

      {/* Dropdown Menu - Seamless Hover Bridge Approach */}
      <div className={cn(
        "absolute top-full right-0 pt-2 w-64 group-hover:block transition-all",
        "opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto",
        "z-50"
      )}>
        {/* Invisible Bridge to maintain hover state while crossing gap */}
        <div className="absolute -top-4 left-0 right-0 h-4" />
        
        <div className="p-2 rounded-2xl border border-zinc-800 bg-[#09090b]/98 backdrop-blur-2xl shadow-2xl overflow-hidden relative">
          <div className="px-3 py-2 border-b border-zinc-800/50 mb-1">
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500">
            Support FOSS Development
          </p>
        </div>

        <div className="space-y-1">
          <a
            href="https://ko-fi.com/Q5Q11I49GI"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors group/item"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                <Coffee className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-zinc-300">Donate via Ko-fi</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-600 opacity-0 group-hover/item:opacity-100 transition-opacity" />
          </a>

          <a
            href="https://www.paypal.com/donate/?hosted_button_id=WFXL2T42BBCRN"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors group/item"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <Globe className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-zinc-300">Donate via PayPal</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-600 opacity-0 group-hover/item:opacity-100 transition-opacity" />
          </a>

          <a
            href="https://liberapay.com/mr-september"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors group/item"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <Heart className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-zinc-300">Donate via Liberapay</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-600 opacity-0 group-hover/item:opacity-100 transition-opacity" />
          </a>

          <a
            href="https://nowpayments.io/donation?api_key=5b5fabd5-2c33-4525-99a3-bf27f587780c"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors group/item"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                <Coins className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-zinc-300">Donate via Crypto</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-600 opacity-0 group-hover/item:opacity-100 transition-opacity" />
          </a>
        </div>

        <div className="mt-2 p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/50">
          <p className="text-[10px] leading-relaxed text-zinc-500 font-medium italic">
            "Your support is vital to the ongoing development of high-precision FOSS solutions."
          </p>
        </div>
        </div>
      </div>
    </div>
  );
}
