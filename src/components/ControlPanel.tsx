import React from 'react';
import { motion } from 'motion/react';
import { Play, RotateCcw, Loader2, Sliders } from 'lucide-react';
import { cn } from '../lib/utils';
import { ModeSelector } from './ModeSelector';
import { ProviderSettings } from './ProviderSettings';
import { UploadZone } from './UploadZone';
import { AdvancedSettings } from './AdvancedSettings';
import { SequenceManager } from './SequenceManager';
import { ErrorDisplay } from './ErrorDisplay';
import { Batch, ProviderConfig, AppError } from '../types';

interface ControlPanelProps {
  providerConfig: ProviderConfig;
  setProviderConfig: (config: ProviderConfig) => void;
  files: import('../types').MultiFileSource[];
  addFiles: (files: import('../types').MultiFileSource[]) => void;
  removeFile: (id: string) => void;
  sortFiles: (mode: import('../types').SortMode) => void;
  reorderFiles: (activeId: string, overId: string) => void;
  sortMode: import('../types').SortMode;
  batches: Batch[];
  onDrop: (files: File[]) => void;
  onClear: () => void;
  currentMode: string;
  setCurrentMode: (mode: string) => void;
  promptTemplate: string;
  setPromptTemplate: (template: string) => void;
  customTurnPattern: string;
  setCustomTurnPattern: (pattern: string) => void;
  batchSize: number;
  setBatchSize: (size: number) => void;
  tokenCeiling: number;
  setTokenCeiling: (ceiling: number) => void;
  fileContent: string | null;
  isProcessing: boolean;
  onStart: () => void;
  error: AppError | string | null;
  setError: (err: AppError | string | null) => void;
  errorRef: React.RefObject<HTMLDivElement | null>;
  isAdvancedOpen: boolean;
  setIsAdvancedOpen: (open: boolean) => void;
  isSequenceOpen: boolean;
  setIsSequenceOpen: (open: boolean) => void;
  completedCount: number;
  persistenceStatus: 'active' | 'volatile';
  onBatchUpdate: (batches: Batch[]) => void;
}

export function ControlPanel({
  providerConfig, setProviderConfig,
  files, addFiles, removeFile, sortFiles, reorderFiles, sortMode,
  batches, onDrop, onClear,
  currentMode, setCurrentMode,
  promptTemplate, setPromptTemplate,
  customTurnPattern, setCustomTurnPattern,
  batchSize, setBatchSize,
  tokenCeiling, setTokenCeiling,
  fileContent, isProcessing, onStart,
  error, setError, errorRef,
  isAdvancedOpen, setIsAdvancedOpen,
  isSequenceOpen, setIsSequenceOpen,
  completedCount,
  persistenceStatus
}: ControlPanelProps) {
  return (
    <div className="w-full space-y-6">
      {/* Configuration Row: 3 Columns with Matched Heights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Column 1: Provider Configuration */}
        <motion.div 
          layout
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="h-full flex flex-col"
        >
          <ProviderSettings config={providerConfig} setConfig={setProviderConfig} />
        </motion.div>

        {/* Column 2: Processing Modality */}
        <motion.div 
          layout
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="h-full flex flex-col"
        >
          <ModeSelector 
            currentMode={currentMode}
            onModeChange={(id, prompt) => {
              setCurrentMode(id);
              setPromptTemplate(prompt);
            }}
          />
        </motion.div>

        {/* Column 3: Data Input & System Calibration */}
        <motion.div 
          layout
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="h-full flex flex-col gap-6"
        >
          <div className="flex-1 min-h-0">
            <UploadZone 
              files={files}
              onOpenManager={() => setIsSequenceOpen(true)}
              removeFile={removeFile}
              sortFiles={sortFiles}
              sortMode={sortMode}
              batchCount={batches.length}
              onDrop={onDrop}
              onClear={onClear}
              currentMode={currentMode}
              persistenceStatus={persistenceStatus}
            />
          </div>

          <button
            onClick={() => setIsAdvancedOpen(true)}
            className={cn(
              "group glass-card p-5 flex items-center justify-between hover:border-amber-500/80 relative overflow-hidden transition-all duration-300",
              currentMode === 'custom' && "animate-golden-pulse border-amber-500/50"
            )}
          >
            <div className="flex items-center gap-4 relative z-10" style={{ isolation: 'isolate' }}>
              <div className="p-2.5 rounded-xl bg-amber-500/5 text-amber-500 border border-amber-500/10 group-hover:scale-110 group-hover:bg-amber-500/10 transition-all">
                <Sliders className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="block text-[clamp(0.7rem,0.75vw,0.75rem)] font-black tracking-[0.2em] uppercase text-zinc-400 group-hover:text-amber-500 transition-colors">Advanced Settings</span>
                <span className="block text-[clamp(0.6rem,0.65vw,0.65rem)] font-medium text-zinc-500 mt-0.5">System Calibration & Prompt Overrides</span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full border border-zinc-700 flex items-center justify-center text-zinc-500 group-hover:border-amber-500/30 group-hover:text-amber-500 transition-all relative z-10">
              <Play className="w-3 h-3 rotate-90" />
            </div>
          </button>
        </motion.div>
      </div>

      <button
        onClick={onStart}
        disabled={isProcessing || !fileContent || !providerConfig.apiKey}
        className={cn(
          "group relative w-full py-10 rounded-2xl font-black text-xs md:text-sm tracking-[0.5em] uppercase flex items-center justify-center gap-6 transition-all duration-700 overflow-hidden shadow-2xl",
          isProcessing || !fileContent || !providerConfig.apiKey
            ? "bg-zinc-900/50 border border-zinc-700/80 text-zinc-500 cursor-not-allowed opacity-50"
            : "bg-zinc-900 border-2 border-amber-500/40 text-amber-500 hover:text-black hover:scale-[1.01] active:scale-[0.99] animate-golden-pulse"
        )}
      >
        {!(isProcessing || !fileContent || !providerConfig.apiKey) && (
          <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
        )}
        
        <span className="relative z-10 flex items-center gap-6">
          {isProcessing ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              Processing Active...
            </>
          ) : (
            <>
              {completedCount > 0 ? <RotateCcw className="w-6 h-6" /> : <Play className="w-6 h-6 fill-current transition-transform group-hover:translate-x-2" />}
              {completedCount > 0 ? 'Reset Engine' : 'Start Process'}
            </>
          )}
        </span>
      </button>

      <AdvancedSettings 
        isOpen={isAdvancedOpen}
        setIsOpen={setIsAdvancedOpen}
        batchSize={batchSize}
        setBatchSize={setBatchSize}
        tokenCeiling={tokenCeiling}
        setTokenCeiling={setTokenCeiling}
        promptTemplate={promptTemplate}
        setPromptTemplate={setPromptTemplate}
        customTurnPattern={customTurnPattern}
        setCustomTurnPattern={setCustomTurnPattern}
        currentMode={currentMode}
        isProcessing={isProcessing}
        hasStarted={completedCount > 0}
      />

      <SequenceManager 
        isOpen={isSequenceOpen}
        onClose={() => setIsSequenceOpen(false)}
        files={files}
        removeFile={removeFile}
        sortFiles={sortFiles}
        reorderFiles={reorderFiles}
        sortMode={sortMode}
      />

      <ErrorDisplay 
        error={error}
        onDismiss={() => setError(null)}
        errorRef={errorRef}
      />
    </div>
  );
}
