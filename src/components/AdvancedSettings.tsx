import React from 'react';
import { X, RotateCcw, Sliders } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MODES } from '../config/constants';

interface AdvancedSettingsProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  batchSize: number;
  setBatchSize: (size: number) => void;
  tokenCeiling: number;
  setTokenCeiling: (ceiling: number) => void;
  promptTemplate: string;
  setPromptTemplate: (prompt: string) => void;
  customTurnPattern: string;
  setCustomTurnPattern: (pattern: string) => void;
  currentMode: string;
  isProcessing: boolean;
  hasStarted: boolean;
}

export function AdvancedSettings({
  isOpen,
  setIsOpen,
  batchSize,
  setBatchSize,
  tokenCeiling,
  setTokenCeiling,
  promptTemplate,
  setPromptTemplate,
  customTurnPattern,
  setCustomTurnPattern,
  currentMode,
  isProcessing,
  hasStarted
}: AdvancedSettingsProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] cursor-pointer"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center z-[101] pointer-events-none p-4 sm:p-6 md:p-8">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl pointer-events-auto overflow-hidden flex flex-col max-h-[calc(100vh-4rem)] md:max-h-[calc(100vh-8rem)]"
            >
              {/* Modal Header */}
              <div className="px-8 py-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm md:text-lg font-bold tracking-tight text-white leading-tight">Advanced Parameters</h2>
                    <p className="text-[10px] md:text-xs text-zinc-400 font-medium tracking-wide uppercase">System Calibrations</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-full hover:bg-white/5 text-zinc-500 hover:text-white transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-8 space-y-10 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <div className="flex justify-between text-[11px] font-bold tracking-widest text-zinc-400 uppercase">
                      <span>Batch Density</span>
                      <span className="text-amber-500/80 font-mono">{batchSize} turns</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={batchSize}
                      disabled={isProcessing || hasStarted}
                      onChange={(e) => setBatchSize(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-amber-500 disabled:opacity-30 transition-all border border-zinc-700/50"
                    />
                    <p className="text-[10px] text-zinc-600 font-medium italic">Adjusts the number of chat turns processed per AI inference call.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between text-[11px] font-bold tracking-widest text-zinc-400 uppercase">
                      <span>Max Tokens</span>
                      <span className="text-amber-500/80 font-mono">{tokenCeiling.toLocaleString()} tokens</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="20"
                      step="1"
                      value={Math.round(Math.log2(tokenCeiling))}
                      disabled={isProcessing || hasStarted}
                      onChange={(e) => setTokenCeiling(Math.pow(2, parseInt(e.target.value)))}
                      className="w-full h-1.5 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-amber-500 disabled:opacity-30 transition-all border border-zinc-700/50"
                    />
                    <p className="text-[10px] text-zinc-600 font-medium italic">Upper bound for context window safety (1 token ≈ 4 chars).</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center text-[11px] font-bold tracking-widest text-zinc-400 uppercase">
                    <span>Custom Turn Pattern (Regex)</span>
                  </div>
                  <input
                    type="text"
                    value={customTurnPattern}
                    disabled={isProcessing || hasStarted}
                    onChange={(e) => setCustomTurnPattern(e.target.value)}
                    placeholder="e.g. (?=Human:|Assistant:)"
                    className="w-full bg-zinc-950 border border-zinc-900 rounded-xl p-4 text-[11px] font-mono text-zinc-400 focus:outline-none focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/30 transition-all placeholder:text-zinc-700"
                  />
                  <p className="text-[10px] text-zinc-600 font-medium italic">Overrides default chunking heuristic rules. Use regex assertion formats.</p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center text-[11px] font-bold tracking-widest text-zinc-400 uppercase">
                    <span>Core Prompt Template</span>
                    <button 
                      onClick={() => {
                        const mode = MODES.find(m => m.id === currentMode);
                        if (mode) setPromptTemplate(mode.prompt);
                      }}
                      className="flex items-center gap-1.5 text-zinc-500 hover:text-amber-500 transition-colors group"
                    >
                      <RotateCcw className="w-3 h-3 group-hover:-rotate-45 transition-transform" />
                      Reset to Default
                    </button>
                  </div>
                  <div className="relative group">
                    <textarea
                      value={promptTemplate}
                      onChange={(e) => setPromptTemplate(e.target.value)}
                      disabled={isProcessing}
                      className="w-full h-64 bg-zinc-950 border border-zinc-900 rounded-2xl p-5 text-[11px] font-mono text-zinc-400 focus:outline-none focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/30 transition-all resize-none leading-relaxed"
                    />
                    <div className="absolute inset-0 rounded-2xl bg-amber-500/5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500" />
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {['{{previousSummary}}', '{{previousBatch}}', '{{currentBatch}}'].map(tag => (
                      <span key={tag} className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-700 text-[9px] text-zinc-400 font-mono tracking-wider shadow-sm">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-8 py-6 border-t border-zinc-800 bg-zinc-900/30 flex justify-end">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-6 py-2.5 bg-zinc-100 hover:bg-white text-black rounded-xl text-xs font-black tracking-widest uppercase transition-all active:scale-95 shadow-xl"
                >
                  Apply & Close
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
