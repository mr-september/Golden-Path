import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BatchProgress } from './BatchProgress';
import { SummaryOutput } from './SummaryOutput';

interface ResultsPanelProps {
  progress: number;
  batchCount: number;
  batches: import('../types').Batch[];
  isIndexing?: boolean;
  currentSummary: string;
  onClearSummary: () => void;
}

export function ResultsPanel({
  progress,
  batchCount,
  batches,
  isIndexing,
  currentSummary,
  onClearSummary
}: ResultsPanelProps) {
  return (
    <div className="w-full space-y-10">
      <AnimatePresence mode="popLayout text-left">
        {(batches.length > 0 || isIndexing) && (
          <motion.div
            key="batch-progress-container"
            initial={{ height: 0, opacity: 0, marginBottom: 0 }}
            animate={{ height: 'auto', opacity: 1, marginBottom: 40 }}
            exit={{ height: 0, opacity: 0, marginBottom: 0 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <BatchProgress progress={progress} batches={batches} isIndexing={isIndexing} />
          </motion.div>
        )}
      </AnimatePresence>
      
      <SummaryOutput 
        summary={currentSummary} 
        onClear={onClearSummary}
      />
    </div>
  );
}
