import React, { useState } from 'react';
import {
  Key,
  Settings,
  Cpu,
  Sparkles,
  Shield,
  Globe,
  Terminal,
  ChevronDown,
  ExternalLink,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ProviderConfig, ProviderType } from '../types';

interface ProviderSettingsProps {
  config: ProviderConfig;
  setConfig: (config: ProviderConfig) => void;
}

const PROVIDERS: { type: ProviderType; name: string; icon: any; color: string; description: string }[] = [
  {
    type: 'gemini',
    name: 'Google Gemini',
    icon: Sparkles,
    color: 'text-blue-400',
    description: "Default: 2M Context"
  },
  {
    type: 'openai',
    name: 'OpenAI',
    icon: Cpu,
    color: 'text-emerald-400',
    description: ""
  },
  {
    type: 'anthropic',
    name: 'Anthropic',
    icon: Shield,
    color: 'text-orange-400',
    description: ""
  },
  {
    type: 'openrouter',
    name: 'OpenRouter',
    icon: Globe,
    color: 'text-purple-400',
    description: ""
  },
  {
    type: 'custom',
    name: 'Local / Custom',
    icon: Terminal,
    color: 'text-zinc-400',
    description: "Everything else (e.g. Ollama, LM Studio, custom API endpoints)."
  },
];

const MODEL_PRESETS: Record<ProviderType, string[]> = {
  gemini: ['gemini-3.0-flash', 'gemini-3.1-pro', 'gemini-3.1-flash-lite'],
  openai: ['gpt-5.4', 'gpt-5.4-mini', 'gpt-5.4-thinking', 'gpt-5.4-pro'],
  anthropic: ['claude-4.6-sonnet', 'claude-4.6-haiku', 'claude-4.6-opus'],
  openrouter: ['google/gemini-3.1-flash', 'anthropic/claude-4.6-sonnet', 'openai/gpt-5.4-mini', 'deepseek/deepseek-r1'],
  custom: ['qwen-3.5-coder', 'gemma-4-31b', 'phi-5'],
};

export function ProviderSettings({ config, setConfig }: ProviderSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedProvider = PROVIDERS.find(p => p.type === config.type) || PROVIDERS[0];

  const updateConfig = (updates: Partial<ProviderConfig>) => {
    setConfig({ ...config, ...updates });
  };

  const handleProviderSelect = (type: ProviderType) => {
    updateConfig({
      type,
      model: MODEL_PRESETS[type][0],
      baseUrl: type === 'custom' ? 'http://localhost:11434/v1' : undefined
    });
    setIsOpen(false);
  };

  return (
    <section className={`glass-card p-6 space-y-6 shadow-[0_0_50px_rgba(0,0,0,0.3)] border-amber-500/10 transition-all duration-300 relative ${isOpen ? 'z-40' : 'z-10'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs font-bold tracking-[0.2em] text-amber-500/80 uppercase">
          <Settings className="w-4 h-4 shadow-amber-500/20" />
          LLM Provider
        </div>
        <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-[10px] font-mono text-amber-500/80">AES-GCM Secured</span>
        </div>
      </div>

      {/* Provider Selector */}
      <div className="relative">
        <label className="block text-[10px] text-zinc-300 uppercase tracking-widest mb-2 px-1">Provider</label>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between bg-zinc-950/50 border border-zinc-600/50 rounded-xl px-4 py-3 text-sm focus:outline-none hover:border-zinc-500 transition-all group"
        >
          <div className="flex items-center gap-3">
            <selectedProvider.icon className={`w-5 h-5 ${selectedProvider.color}`} />
            <span className="font-medium">{selectedProvider.name}</span>
          </div>
          <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-zinc-900/95 border border-zinc-800 rounded-xl overflow-hidden backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
            {PROVIDERS.map((p) => (
              <button
                key={p.type}
                onClick={() => handleProviderSelect(p.type)}
                className="w-full flex items-start gap-4 px-4 py-3 hover:bg-white/5 transition-colors text-left group"
              >
                <div className={`mt-1 p-2 rounded-lg bg-zinc-950/80 border border-zinc-800 group-hover:border-zinc-700 transition-colors`}>
                  <p.icon className={`w-4 h-4 ${p.color}`} />
                </div>
                <div>
                  <div className="text-sm font-medium">{p.name}</div>
                  <div className="text-[10px] text-zinc-400 leading-tight">{p.description}</div>
                </div>
                {config.type === p.type && (
                  <CheckCircle2 className="w-4 h-4 text-amber-500 ml-auto mt-1" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Model Selector */}
        <div className="space-y-2">
          <label className="block text-[10px] text-zinc-300 uppercase tracking-widest px-1">Model ID</label>
          <div className="relative group">
            <input
              list="model-presets"
              type="text"
              value={config.model}
              onChange={(e) => updateConfig({ model: e.target.value })}
              placeholder="Select or type model..."
              className="w-full bg-zinc-950/50 border border-zinc-600/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all font-mono placeholder:text-zinc-400"
            />
            <datalist id="model-presets">
              {MODEL_PRESETS[config.type].map(m => <option key={m} value={m} />)}
            </datalist>
          </div>
        </div>

        {/* API Key Input */}
        <div className="space-y-2">
          <label className="block text-[10px] text-zinc-300 uppercase tracking-widest px-1">API Key</label>
          <div className="relative group">
            <input
              type="password"
              value={config.apiKey}
              onChange={(e) => updateConfig({ apiKey: e.target.value })}
              placeholder={`Enter ${selectedProvider.name} Key...`}
              className="w-full bg-zinc-950/50 border border-zinc-600/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all font-mono placeholder:text-zinc-400"
            />
            <Key className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-hover:text-amber-500/50 transition-colors" />
          </div>
        </div>
      </div>

      <div className="relative min-h-[72px]">
        <AnimatePresence mode="wait">
          {(config.type === 'custom' || config.type === 'openrouter') ? (
            <motion.div
              key="url-field"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between px-1">
                <label className="block text-[10px] text-zinc-300 uppercase tracking-widest">Base API URL</label>
                <span className="text-[10px] text-amber-500/60 font-mono italic">Optional override</span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={config.baseUrl || ''}
                  onChange={(e) => updateConfig({ baseUrl: e.target.value })}
                  placeholder={config.type === 'custom' ? "http://localhost:11434/v1" : "https://openrouter.ai/api/v1"}
                  className="w-full bg-zinc-950/50 border border-zinc-600/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all font-mono placeholder:text-zinc-400"
                />
                <Globe className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="security-blurb"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="bg-amber-500/5 border border-amber-500/10 rounded-lg p-3 flex gap-3 items-start h-full min-h-[72px]"
            >
              <AlertCircle className="w-4 h-4 text-amber-500/60 mt-0.5 shrink-0" />
              <p className="text-[10px] text-zinc-400 leading-relaxed italic">
                Credentials are AES-GCM encrypted and stored exclusively in your browser&apos;s local storage. They never transit our servers.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
