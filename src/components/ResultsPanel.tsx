import React from 'react';
import { BatchProgress } from './BatchProgress';
import { SummaryOutput } from './SummaryOutput';

interface ResultsPanelProps {
  progress: number;
  batchCount: number;
  currentSummary: string;
  onClearSummary: () => void;
}

export function ResultsPanel({
  progress,
  batchCount,
  currentSummary,
  onClearSummary
}: ResultsPanelProps) {
  return (
    <div className="w-full space-y-10">
      <BatchProgress progress={progress} batchCount={batchCount} />
      
      <SummaryOutput 
        summary={currentSummary} 
        onClear={onClearSummary}
      />
    </div>
  );
}
