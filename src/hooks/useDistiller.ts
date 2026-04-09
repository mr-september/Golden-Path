import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Batch, ApiStatus, ProviderConfig, AppError } from '../types';
import { processBatch } from '../lib/providers';
import { STORAGE_KEY } from '../config/constants';

export function useDistiller(
  providerConfig: ProviderConfig,
  promptTemplate: string,
  batches: Batch[],
  setBatches: React.Dispatch<React.SetStateAction<Batch[]>>,
  currentSummary: string,
  setCurrentSummary: React.Dispatch<React.SetStateAction<string>>
) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<AppError | string | null>(null);
  const [apiStatus, setApiStatus] = useState<ApiStatus>('idle');
  const [cooldownTime, setCooldownTime] = useState(0);

  // Synchronization refs to prevent stale closure issues during async loops
  const batchesRef = useRef(batches);
  const summaryRef = useRef(currentSummary);
  const backoffRef = useRef(0);

  useEffect(() => { batchesRef.current = batches; }, [batches]);
  useEffect(() => { summaryRef.current = currentSummary; }, [currentSummary]);

  // Global heartbeat for cooldown and retry timers
  useEffect(() => {
    const interval = setInterval(() => {
      setBatches(prev => {
        if (!prev.some(b => b.status === 'retrying' && (b.retryDelay ?? 0) > 0)) return prev;
        return prev.map(b => b.status === 'retrying' && (b.retryDelay ?? 0) > 0 
          ? { ...b, retryDelay: (b.retryDelay ?? 1) - 1 } 
          : b
        );
      });
      setCooldownTime(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [setBatches]);

  const startProcessing = async () => {
    if (!providerConfig.apiKey) return setError('Please provide an API Key.');
    if (batchesRef.current.length === 0) return setError('No batches available.');

    setIsProcessing(true);
    setError(null);
    setApiStatus('healthy');
    
    try {
      let loopLimit = 0;
      const MAX_ITERATIONS = batchesRef.current.length * 5; // Allow for retries

      let runningSummary = summaryRef.current;
      let runningBatches = [...batchesRef.current];

      while (loopLimit < MAX_ITERATIONS) {
        loopLimit++;
        const nextIdx = runningBatches.findIndex(b => b.status === 'pending' || b.status === 'error' || (b.status === 'retrying' && (b.retryDelay ?? 0) <= 0));
        
        if (nextIdx === -1) break;

        // Apply exponential backoff if needed
        if (backoffRef.current > 0) {
          const waitTime = Math.pow(2, backoffRef.current) * 1000;
          setCooldownTime(Math.round(waitTime / 1000));
          setApiStatus('quota_limit');
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }

        runningBatches[nextIdx] = { ...runningBatches[nextIdx], status: 'processing', retryAttempt: (runningBatches[nextIdx].retryAttempt ?? 0), retryDelay: 0 };
        setBatches([...runningBatches]);

        const result = await processBatch(
          providerConfig,
          runningSummary,
          nextIdx > 0 ? runningBatches[nextIdx - 1].content : "",
          runningBatches[nextIdx].content,
          nextIdx,
          runningBatches.length,
          promptTemplate,
          (attempt, delay) => {
            setApiStatus('quota_limit');
            backoffRef.current = Math.max(backoffRef.current, attempt);
            runningBatches[nextIdx] = { ...runningBatches[nextIdx], status: 'retrying', retryAttempt: attempt, retryDelay: Math.round(delay / 1000) };
            setBatches([...runningBatches]);
          }
        );

        // Success Path
        setApiStatus('healthy');
        backoffRef.current = Math.max(0, backoffRef.current - 1);
        
        // Critical Fix: Sync summary manually across loop iterations
        runningSummary = result.text;
        setCurrentSummary(result.text);

        runningBatches[nextIdx] = { ...runningBatches[nextIdx], status: 'completed', result: result.text };
        setBatches([...runningBatches]);
      }
    } catch (err: any) {
      setApiStatus('error');
      
      let message = 'Processing failure.';
      if (typeof err === 'string') {
        message = err;
      } else if (err?.message) {
        message = err.message;
      } else if (err?.category) {
        message = `[${err.category}] ${err.message || 'API Error'}`;
      }

      setError(message);
      setBatches(prev => prev.map(b => (b.status === 'processing' || b.status === 'retrying') ? { ...b, status: 'error' } : b));
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = useCallback(() => {
    setBatches([]);
    setCurrentSummary('');
    setError(null);
    setApiStatus('idle');
    setCooldownTime(0);
    backoffRef.current = 0;
  }, [setBatches, setCurrentSummary]);

  return {
    isProcessing,
    error,
    setError,
    apiStatus,
    cooldownTime,
    startProcessing,
    reset
  };
}
