import React, { useMemo, useRef } from 'react';
import {
  FileText, Trash2, Upload, Calendar, Type,
  Maximize2, FolderPlus, AlertTriangle, CheckCircle2
} from 'lucide-react';
import { useDropzone, type Accept, type DropzoneOptions } from 'react-dropzone';
import { cn, truncateMiddle } from '../lib/utils';
import { MultiFileSource, SortMode } from '../types';
import { MODES } from '../config/constants';

interface UploadZoneProps {
  files: MultiFileSource[];
  onOpenManager: () => void;
  removeFile: (id: string) => void;
  sortFiles: (mode: SortMode) => void;
  sortMode: SortMode;
  batchCount: number;
  onDrop: (acceptedFiles: File[]) => void;
  onClear: () => void;
  currentMode: string;
  persistenceStatus: 'active' | 'volatile';
}

export function UploadZone({
  files, onOpenManager, removeFile, sortFiles, sortMode,
  batchCount, onDrop, onClear, currentMode, persistenceStatus
}: UploadZoneProps) {
  const activeMode = useMemo(() => MODES.find(m => m.id === currentMode), [currentMode]);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const accept = useMemo<Accept>(() => {
    if (!activeMode?.allowedExtensions) return {};
    // Standardizing to technical text types
    return {
      'text/plain': activeMode.allowedExtensions,
      'text/markdown': ['.md'],
      'application/json': ['.json']
    };
  }, [activeMode]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple: true
  } as unknown as DropzoneOptions);

  const incompatibilityCount = useMemo(() => {
    if (!activeMode?.allowedExtensions) return 0;
    return files.filter(f => {
      const ext = `.${f.name.split('.').pop()?.toLowerCase()}`;
      return !activeMode.allowedExtensions?.includes(ext);
    }).length;
  }, [files, activeMode]);

  const handleFolderUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onDrop(Array.from(e.target.files));
    }
  };

  return (
    <section className="glass-card p-6 h-full flex flex-col shadow-xl">
      <div className="flex flex-col h-full space-y-4">
        {/* Hidden Folder Input */}
        <input
          type="file"
          ref={folderInputRef}
          className="hidden"
          {...({
            webkitdirectory: "",
            directory: "",
          } as React.InputHTMLAttributes<HTMLInputElement> & { webkitdirectory: string; directory: string })}
          multiple
          onChange={handleFolderUpload}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs font-bold tracking-[0.2em] text-amber-500/80 uppercase">
            <FileText className="w-4 h-4 shadow-amber-500/20" />
            Input Files
          </div>
          
          <div className="flex items-center gap-2">
            {incompatibilityCount > 0 && (
              <div 
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-[9px] font-bold text-rose-400 animate-pulse"
                title={`${incompatibilityCount} file(s) may contain noise for current mode`}
              >
                <AlertTriangle className="w-3 h-3" />
                MISMATCH
              </div>
            )}
            {files.length > 0 && incompatibilityCount === 0 && persistenceStatus === 'active' && (
              <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-500/80 uppercase tracking-wider bg-emerald-500/5 px-2 py-0.5 rounded-full border border-emerald-500/10">
                <CheckCircle2 className="w-3 h-3" />
                Optimal
              </div>
            )}
            {persistenceStatus === 'volatile' && (
              <div 
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[9px] font-bold text-amber-500 animate-pulse"
                title="Session size exceeds 4MB. Changes will not survive a page refresh."
              >
                <AlertTriangle className="w-3 h-3 text-amber-500" />
                VOLATILE SESSION
              </div>
            )}
            {files.length > 0 && (
              <button
                onClick={onClear}
                className="p-1.5 rounded-lg hover:bg-rose-500/10 text-zinc-500 hover:text-rose-400 transition-all active:scale-95"
                title="Clear All"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {files.length === 0 ? (
          <div
            {...getRootProps()}
            className={cn(
              "group border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-500 flex-1 flex flex-col items-center justify-center",
              isDragActive
                ? "border-amber-500 bg-amber-500/5 shadow-[0_0_20px_rgba(245,158,11,0.1)]"
                : "border-zinc-700/60 hover:border-amber-500/30 hover:bg-zinc-900/60"
            )}
          >
            <input {...getInputProps()} />
            <div className={cn(
              "w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center transition-all duration-500",
              isDragActive ? "bg-amber-500 text-white" : "bg-zinc-800 text-zinc-400 group-hover:text-amber-500"
            )}>
              <Upload className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-zinc-300">
              {isDragActive ? "Drop to Ingest" : "Input File(s)"}
            </p>
            <div className="flex flex-col items-center gap-1.5 mt-3">
              <p className="text-[10px] text-zinc-600 tracking-widest uppercase font-bold text-center px-4">
                {activeMode?.allowedExtensions?.slice(0, 4).join(', ') || 'ANY FORMAT'}{activeMode?.allowedExtensions && activeMode.allowedExtensions.length > 4 && ', ...'}
              </p>
              {currentMode === 'repo' && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    folderInputRef.current?.click();
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[9px] text-amber-500 font-black uppercase tracking-widest hover:bg-amber-500/20 transition-all mt-2"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  Upload Repository Folder
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col flex-1 min-h-0">
            {/* Sequence Tools - Hyper Compact */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex gap-1">
                {[
                  { mode: 'name-asc', icon: Type },
                  { mode: 'date-asc', icon: Calendar }
                ].map(({ mode, icon: Icon }) => (
                  <button
                    key={mode}
                    onClick={() => sortFiles(mode as SortMode)}
                    className={cn(
                      "p-1.5 rounded-md transition-all border",
                      sortMode === mode
                        ? "text-amber-500 bg-amber-500/10 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.1)]"
                        : "text-zinc-500 border-transparent hover:text-zinc-300 hover:bg-zinc-800/50"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-zinc-500 font-bold">{files.length} FILES</span>
                <button
                  onClick={onOpenManager}
                  className="p-1.5 rounded-md hover:bg-amber-500/10 text-zinc-400 hover:text-amber-500 transition-all"
                  title="Manage Sequence"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Hyper-Compact List View */}
            <div className="flex-1 overflow-visible space-y-1">
              {files.slice(0, 3).map((file) => {
                const isCompatible = !activeMode?.allowedExtensions || activeMode.allowedExtensions.includes(`.${file.name.split('.').pop()?.toLowerCase()}`);
                return (
                  <div
                    key={file.id}
                    className={cn(
                      "group flex items-center gap-2.5 px-3 py-1.5 rounded-lg border transition-all cursor-default",
                      isCompatible 
                        ? "bg-zinc-950/40 border-zinc-800/40 hover:border-zinc-700/60 hover:bg-zinc-900/60" 
                        : "bg-rose-500/[0.03] border-rose-500/20 hover:border-rose-500/40"
                    )}
                    title={file.name}
                  >
                    <FileText className={cn("w-3.5 h-3.5 shrink-0 transition-colors", isCompatible ? "text-amber-500/60 group-hover:text-amber-500" : "text-rose-400")} />
                    <div className="flex-1 min-w-0 flex items-center justify-between gap-4">
                      <span className={cn(
                        "text-[11px] font-medium truncate group-hover:duration-1000 group-hover:delay-200 transition-all select-none",
                        isCompatible ? "text-zinc-300" : "text-rose-300/80"
                      )}>
                        {truncateMiddle(file.name, 22)}
                      </span>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="flex items-center gap-2 text-[9px] font-mono text-zinc-600 font-bold uppercase border-l border-zinc-800/50 pl-3">
                          <span>{(file.size / 1024).toFixed(1)}K</span>
                          <span className="opacity-30">|</span>
                          {!isCompatible && <span className="text-rose-500 font-black animate-pulse">!</span>}
                        </div>
                        <button
                          onClick={() => removeFile(file.id)}
                          className="p-1 rounded-md hover:bg-rose-500/10 text-zinc-700 hover:text-rose-400 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {files.length > 3 && (
                <button
                  onClick={onOpenManager}
                  className="w-full py-1.5 rounded-lg border border-dashed border-zinc-800/60 bg-zinc-900/10 text-zinc-500 hover:text-amber-500/80 hover:border-amber-500/20 transition-all text-[9px] font-black uppercase tracking-[0.2em] mt-1"
                >
                  + {files.length - 3} More Files
                </button>
              )}
            </div>

            <div className="mt-auto pt-3 border-t border-zinc-800/30 flex items-center justify-between">
              <div className="text-[9px] text-zinc-600 font-black uppercase tracking-tighter">
                {batchCount > 0 && `${batchCount} Segments Identified`}
              </div>
              <div className="flex items-center gap-2">
                {currentMode === 'repo' && (
                   <button
                    onClick={() => folderInputRef.current?.click()}
                    className="p-1.5 rounded-md bg-zinc-900/40 border border-zinc-800 text-zinc-500 hover:text-amber-500 hover:border-amber-500/30 transition-all"
                    title="Upload Folder"
                  >
                    <FolderPlus className="w-3.5 h-3.5" />
                  </button>
                )}
                <div
                  {...getRootProps()}
                  className="px-2 py-1 rounded-md bg-zinc-900/40 border border-zinc-800 text-[10px] font-bold text-zinc-500 hover:text-amber-500 hover:border-amber-500/30 cursor-pointer transition-all uppercase tracking-normal"
                >
                  <input {...getInputProps()} />
                  Add Files
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
