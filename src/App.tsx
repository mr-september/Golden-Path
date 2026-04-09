import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useDistiller } from './hooks/useDistiller';
import { useSession } from './hooks/useSession';
import { createBatches } from './lib/batcher';
import { MODES } from './config/constants';

// Components
import { Header } from './components/Header';
import { ControlPanel } from './components/ControlPanel';
import { ResultsPanel } from './components/ResultsPanel';

export default function App() {
  const {
    providerConfig, setProviderConfig,
    files, addFiles, removeFile, sortFiles, reorderFiles, sortMode,
    batchSize, setBatchSize,
    tokenCeiling, setTokenCeiling,
    currentMode, setCurrentMode,
    promptTemplate, setPromptTemplate,
    customTurnPattern, setCustomTurnPattern,
    batches, setBatches,
    currentSummary, setCurrentSummary,
    persistenceStatus,
    isLoaded,
    clearSession,
    getCombinedContent
  } = useSession();

  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [isSequenceOpen, setIsSequenceOpen] = useState(false);
  const errorRef = useRef<HTMLDivElement>(null);

  const {
    isProcessing,
    error,
    setError,
    apiStatus,
    cooldownTime,
    startProcessing,
    reset: resetDistiller
  } = useDistiller(
    providerConfig, 
    promptTemplate, 
    batches, 
    setBatches, 
    currentSummary, 
    setCurrentSummary
  );

  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [error]);


  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const activeMode = MODES.find(m => m.id === currentMode);
    
    // Filter files based on mode rules
    const validFiles = acceptedFiles.filter(file => {
      if (!activeMode?.allowedExtensions) return true;
      const ext = `.${file.name.split('.').pop()?.toLowerCase()}`;
      return activeMode.allowedExtensions.includes(ext);
    });

    if (validFiles.length === 0 && acceptedFiles.length > 0) {
      setError(`Files rejected. Current mode "${activeMode?.name}" only accepts technical text formats (${activeMode?.allowedExtensions?.join(', ')})`);
      return;
    }

    const newFileEntries = await Promise.all(validFiles.map(async (file) => {
      return new Promise<import('./types').MultiFileSource>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({
            id: crypto.randomUUID(),
            name: (file as any).webkitRelativePath || file.name, 
            content: e.target?.result as string,
            lastModified: file.lastModified,
            size: file.size
          });
        };
        reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
        reader.readAsText(file);
      });
    }));

    addFiles(newFileEntries);
    setError(null);
  }, [addFiles, currentMode, setError]);

  // Reactive Batching Protocol (Hospital-Grade)
  // Ensures batches are always in sync with file state and configuration
  useEffect(() => {
    if (!isLoaded || isProcessing) return;
    
    const content = getCombinedContent();
    if (content) {
      const newBatches = createBatches(content, batchSize, tokenCeiling, currentMode, customTurnPattern);
      setBatches(newBatches);
    } else {
      setBatches([]);
    }
  }, [files, batchSize, tokenCeiling, currentMode, customTurnPattern, isLoaded, isProcessing, setBatches, getCombinedContent]);

  const handleClear = () => {
    clearSession();
    resetDistiller();
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#050505] relative overflow-hidden flex items-center justify-center">
        <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20">
          <svg className="absolute w-[200%] h-[200%] -top-[50%] -left-[50%] text-amber-500/10" viewBox="0 0 1000 1000" preserveAspectRatio="none">
            <path className="animate-path stroke-current fill-none stroke-[0.5]" d="M 0 500 Q 250 100 500 500 T 1000 500" />
            <path className="animate-path stroke-current fill-none stroke-[0.3]" d="M 0 600 Q 300 200 600 600 T 1000 600" style={{ animationDelay: '-15s' }} />
          </svg>
        </div>
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const completedCount = batches.filter(b => b.status === 'completed').length;
  const progress = batches.length > 0 ? (completedCount / batches.length) * 100 : 0;
  const retryingBatch = batches.find(b => b.status === 'retrying');

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 font-sans selection:bg-amber-500/30 relative overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20">
        <svg className="absolute w-[200%] h-[200%] -top-[50%] -left-[50%] text-amber-500/10" viewBox="0 0 1000 1000" preserveAspectRatio="none">
          <path className="animate-path stroke-current fill-none stroke-[0.5]" d="M 0 500 Q 250 100 500 500 T 1000 500" />
          <path className="animate-path stroke-current fill-none stroke-[0.3]" d="M 0 600 Q 300 200 600 600 T 1000 600" style={{ animationDelay: '-15s' }} />
        </svg>
      </div>

      <Header 
        apiStatus={apiStatus}
        cooldownTime={cooldownTime}
        retryingBatch={retryingBatch}
        fileName={files.length > 0 ? `${files.length} Files` : null}
        onErrorClick={() => errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 relative z-10">
        <div className="flex flex-col gap-12">
          <ControlPanel 
            providerConfig={providerConfig}
            setProviderConfig={setProviderConfig}
            files={files}
            addFiles={addFiles}
            removeFile={removeFile}
            sortFiles={sortFiles}
            reorderFiles={reorderFiles}
            sortMode={sortMode}
            batches={batches}
            onDrop={onDrop}
            onClear={handleClear}
            currentMode={currentMode}
            setCurrentMode={setCurrentMode}
            promptTemplate={promptTemplate}
            setPromptTemplate={setPromptTemplate}
            customTurnPattern={customTurnPattern}
            setCustomTurnPattern={setCustomTurnPattern}
            batchSize={batchSize}
            setBatchSize={setBatchSize}
            tokenCeiling={tokenCeiling}
            setTokenCeiling={setTokenCeiling}
            fileContent={getCombinedContent()}
            isProcessing={isProcessing}
            onStart={startProcessing}
            error={error}
            setError={setError}
            errorRef={errorRef}
            isAdvancedOpen={isAdvancedOpen}
            setIsAdvancedOpen={setIsAdvancedOpen}
            isSequenceOpen={isSequenceOpen}
            setIsSequenceOpen={setIsSequenceOpen}
            completedCount={completedCount}
            onBatchUpdate={setBatches}
            persistenceStatus={persistenceStatus}
          />

          <ResultsPanel 
            progress={progress}
            batchCount={batches.length}
            currentSummary={currentSummary}
            onClearSummary={() => setCurrentSummary('')}
          />
        </div>
      </div>
    </div>
  );
}
