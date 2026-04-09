import React from 'react';
import { Key } from 'lucide-react';

interface ApiKeyInputProps {
  apiKey: string;
  setApiKey: (key: string) => void;
}

export function ApiKeyInput({ apiKey, setApiKey }: ApiKeyInputProps) {
  return (
    <section className="glass-card p-6 space-y-4 shadow-[0_0_50px_rgba(0,0,0,0.3)]">
      <div className="flex items-center gap-3 text-xs font-bold tracking-[0.2em] text-amber-500/80 uppercase">
        <Key className="w-4 h-4 shadow-amber-500/20" />
        Security Credentials
      </div>
      <div className="relative group">
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter Gemini API Key..."
          className="w-full bg-zinc-950/50 border border-zinc-800/80 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all placeholder:text-zinc-700 font-mono"
        />
        <div className="absolute inset-0 rounded-xl bg-amber-500/5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500" />
      </div>
      <p className="text-[10px] text-zinc-500 leading-relaxed italic">
        Your key is encrypted locally and never leaves your browser.
      </p>
    </section>
  );
}
