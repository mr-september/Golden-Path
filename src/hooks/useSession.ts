import { useState, useCallback, useEffect } from 'react';
import { Batch, DistillerMode, ProviderConfig, MultiFileSource, SortMode } from '../types';
import { STORAGE_KEY, MODES, DEFAULT_PROMPT, DEFAULT_BATCH_SIZE, DEFAULT_TOKEN_CEILING } from '../config/constants';
import { encrypt, decrypt } from '../lib/encryption';

const DEFAULT_PROVIDER: ProviderConfig = {
  type: 'gemini',
  apiKey: '',
  model: 'gemini-3-flash-preview',
};

const PERSISTENCE_LIMIT_BYTES = 4 * 1024 * 1024; // 4MB safety limit for localStorage

export interface SessionState {
  providerConfig: ProviderConfig;
  files: MultiFileSource[];
  sortMode: SortMode;
  batchSize: number;
  tokenCeiling: number;
  currentMode: string;
  promptTemplate: string;
  customTurnPattern: string;
  batches: Batch[];
  currentSummary: string;
  persistenceStatus: 'active' | 'volatile';
  isLoaded?: boolean;
}

/**
 * Ensures only serializable data reaches localStorage.
 * Prevents Lucide components or other React internals from poisoning the state.
 */
function sanitizeState(state: SessionState): Omit<SessionState, 'providerConfig'> & { providerMetadata: Omit<ProviderConfig, 'apiKey'> } {
  // Persistence Protocol: Check total size for localStorage limits
  const serializedFiles = JSON.stringify(state.files);
  const tooLarge = serializedFiles.length > PERSISTENCE_LIMIT_BYTES;

  return {
    providerMetadata: {
      type: state.providerConfig?.type || 'gemini',
      model: state.providerConfig?.model || 'gemini-3-flash-preview',
      baseUrl: state.providerConfig?.baseUrl
    },
    // If too large, we clear all file contents to avoid "Partial Reload Hallucination"
    files: tooLarge ? state.files.map(f => ({ ...f, content: '' })) : state.files,
    sortMode: state.sortMode || 'date-asc',
    batchSize: Math.max(1, Number(state.batchSize) || DEFAULT_BATCH_SIZE),
    tokenCeiling: Math.max(1024, Number(state.tokenCeiling) || DEFAULT_TOKEN_CEILING),
    currentMode: String(state.currentMode || MODES[0].id),
    promptTemplate: String(state.promptTemplate || ''),
    customTurnPattern: String(state.customTurnPattern || ''),
    currentSummary: String(state.currentSummary || ''),
    batches: (state.batches || []).map(b => ({
      id: Number(b.id),
      content: String(b.content || ''),
      status: b.status || 'pending',
      result: b.result,
      retryAttempt: b.retryAttempt,
      retryDelay: b.retryDelay
    })),
    persistenceStatus: tooLarge ? 'volatile' : 'active'
  };
}

export function useSession() {
  const [state, setState] = useState<SessionState>({
    providerConfig: DEFAULT_PROVIDER,
    files: [],
    sortMode: 'date-asc',
    batchSize: DEFAULT_BATCH_SIZE,
    tokenCeiling: DEFAULT_TOKEN_CEILING,
    currentMode: MODES[0].id,
    promptTemplate: DEFAULT_PROMPT,
    customTurnPattern: '',
    batches: [],
    currentSummary: '',
    persistenceStatus: 'active',
    isLoaded: false
  });

  // Load session on mount
  useEffect(() => {
    const load = async () => {
      const saved = localStorage.getItem(STORAGE_KEY);
      const savedEncryptedKey = localStorage.getItem('goldenpath_provider_key_secure') || localStorage.getItem('gemini_api_key_secure');
      
      let apiKey = '';
      if (savedEncryptedKey) {
        apiKey = await decrypt(savedEncryptedKey);
      }

      if (saved) {
        try {
          const session = JSON.parse(saved);
          
          // Migrate legacy or load new metadata
          const providerMetadata = session.providerMetadata || {
            type: 'gemini',
            model: 'gemini-3-flash-preview'
          };

          // Surgical pick & validate
          // Handle legacy single-file migration
          const legacyFiles: MultiFileSource[] = [];
          if (session.fileName && session.fileContent) {
            legacyFiles.push({
              id: 'legacy-1',
              name: session.fileName,
              content: session.fileContent,
              lastModified: Date.now(),
              size: session.fileContent.length
            });
          }

          const validatedState: Partial<SessionState> = {
            providerConfig: {
              ...providerMetadata,
              apiKey: apiKey
            },
            files: Array.isArray(session.files) ? session.files : legacyFiles,
            sortMode: session.sortMode || 'date-asc',
            batchSize: typeof session.batchSize === 'number' ? session.batchSize : DEFAULT_BATCH_SIZE,
            tokenCeiling: typeof session.tokenCeiling === 'number' ? session.tokenCeiling : DEFAULT_TOKEN_CEILING,
            currentMode: typeof session.currentMode === 'string' ? session.currentMode : MODES[0].id,
            promptTemplate: typeof session.promptTemplate === 'string' ? session.promptTemplate : DEFAULT_PROMPT,
            customTurnPattern: typeof session.customTurnPattern === 'string' ? session.customTurnPattern : '',
            currentSummary: typeof session.currentSummary === 'string' ? session.currentSummary : '',
            batches: Array.isArray(session.batches) ? session.batches.map((b: any) => ({
              id: b.id,
              content: String(b.content || ''),
              status: b.status || 'pending',
              result: b.result,
              retryAttempt: b.retryAttempt,
              retryDelay: b.retryDelay
            })) : [],
            persistenceStatus: session.persistenceStatus || 'active'
          };

          // Atomic update to prevent partial/invalid renders
          setState(prev => ({
            ...prev,
            ...validatedState,
            isLoaded: true
          }));

          // Post-Migration Cleanup Protocol
          if (localStorage.getItem('goldenpath_provider_key_secure') && localStorage.getItem('gemini_api_key_secure')) {
            localStorage.removeItem('gemini_api_key_secure');
          }
          } catch (e) {
            console.error('[Session Migration] Failed to parse saved session:', e);
            setState(prev => ({ ...prev, isLoaded: true }));
          }
      } else {
        setState(prev => ({ 
          ...prev, 
          providerConfig: { ...prev.providerConfig, apiKey }, 
          isLoaded: true 
        }));

        // Post-Migration Cleanup Protocol for new installs/resets
        if (apiKey && localStorage.getItem('gemini_api_key_secure')) {
          localStorage.removeItem('gemini_api_key_secure');
        }
      }
    };
    load();
  }, []);

  // --- Persistence: Stable Configuration ---
  // Debounce is short (300ms) because these fields change infrequently (user interaction only).
  // Crucially, batch updates and summary changes do NOT reset this timer.
  useEffect(() => {
    if (!state.isLoaded) return;
    const timeout = setTimeout(() => {
      try {
        const persistentData = sanitizeState(state);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(persistentData));
      } catch (e) {
        console.error('[Session Persistence] Configuration update failed:', e);
      }
    }, 300);
    return () => clearTimeout(timeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    state.isLoaded,
    state.currentMode,
    state.promptTemplate,
    state.customTurnPattern,
    state.batchSize,
    state.tokenCeiling,
    state.providerConfig.type,
    state.providerConfig.model,
    state.providerConfig.baseUrl,
  ]);

  // --- Persistence: Runtime Progress ---
  // Debounce is longer (800ms) because batches/summary can update on every LLM response.
  // Continuously resetting a short timer during active processing caused data to never persist.
  useEffect(() => {
    if (!state.isLoaded) return;
    const timeout = setTimeout(() => {
      try {
        const persistentData = sanitizeState(state);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(persistentData));
      } catch (e) {
        console.error('[Session Persistence] Runtime progress update failed:', e);
      }
    }, 800);
    return () => clearTimeout(timeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    state.isLoaded,
    state.batches,
    state.currentSummary,
    state.files.length, // Watch length and mode, but debounce content
    state.sortMode,
  ]);

  // Persist sensitive data (Secure & Debounced)
  useEffect(() => {
    if (!state.isLoaded || !state.providerConfig.apiKey) {
      if (state.isLoaded && !state.providerConfig.apiKey) {
        localStorage.removeItem('goldenpath_provider_key_secure');
      }
      return;
    }

    const timeout = setTimeout(() => {
      encrypt(state.providerConfig.apiKey)
        .then(enc => {
          localStorage.setItem('goldenpath_provider_key_secure', enc);
        })
        .catch(e => {
          console.error('[Session Security] Key encryption persistence failed:', e);
        });
    }, 500);

    return () => clearTimeout(timeout);
  }, [state.providerConfig.apiKey, state.isLoaded]);

  const getCombinedContent = useCallback((sources: MultiFileSource[]) => {
    return sources.map(f => `--- FILE: ${f.name} ---\n${f.content}`).join('\n\n');
  }, []);

  const getCombinedContentBound = useCallback(() => {
    return getCombinedContent(state.files);
  }, [state.files, getCombinedContent]);

  const updateState = useCallback((updates: Partial<SessionState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('goldenpath_provider_key_secure');
    localStorage.removeItem('gemini_api_key_secure');
    setState(prev => ({
      ...prev,
      providerConfig: DEFAULT_PROVIDER,
      files: [],
      sortMode: 'date-asc',
      batches: [],
      currentSummary: ''
    }));
  }, []);

  const addFiles = useCallback((newFiles: MultiFileSource[]) => {
    setState(prev => {
      const combined = [...prev.files, ...newFiles];
      // If we add files while in an auto-sort mode, apply it
      if (prev.sortMode !== 'custom') {
        combined.sort((a, b) => {
          if (prev.sortMode === 'name-asc') return a.name.localeCompare(b.name);
          if (prev.sortMode === 'name-desc') return b.name.localeCompare(a.name);
          if (prev.sortMode === 'date-asc') return a.lastModified - b.lastModified;
          if (prev.sortMode === 'date-desc') return b.lastModified - a.lastModified;
          return 0;
        });
      }
      return { ...prev, files: combined };
    });
  }, []);

  const removeFile = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      files: prev.files.filter(f => f.id !== id)
    }));
  }, []);

  const sortFiles = useCallback((mode: SortMode) => {
    setState(prev => {
      const sorted = [...prev.files];
      if (mode === 'name-asc') sorted.sort((a, b) => a.name.localeCompare(b.name));
      if (mode === 'name-desc') sorted.sort((a, b) => b.name.localeCompare(a.name));
      if (mode === 'date-asc') sorted.sort((a, b) => a.lastModified - b.lastModified);
      if (mode === 'date-desc') sorted.sort((a, b) => b.lastModified - a.lastModified);
      return { ...prev, files: sorted, sortMode: mode };
    });
  }, []);

  const reorderFiles = useCallback((activeId: string, overId: string) => {
    setState(prev => {
      const oldIndex = prev.files.findIndex(f => f.id === activeId);
      const newIndex = prev.files.findIndex(f => f.id === overId);
      
      if (oldIndex === -1 || newIndex === -1) return prev;

      const newFiles = [...prev.files];
      const [removed] = newFiles.splice(oldIndex, 1);
      newFiles.splice(newIndex, 0, removed);

      return { ...prev, files: newFiles, sortMode: 'custom' };
    });
  }, []);

  return {
    ...state,
    batches: Array.isArray(state.batches) ? state.batches : [],
    isLoaded: state.isLoaded || false,
    setProviderConfig: (config: ProviderConfig) => updateState({ providerConfig: config }),
    setFiles: (files: MultiFileSource[]) => updateState({ files }),
    addFiles,
    removeFile,
    sortFiles,
    reorderFiles,
    setBatchSize: (size: number) => updateState({ batchSize: size }),
    setTokenCeiling: (ceiling: number) => updateState({ tokenCeiling: ceiling }),
    setCurrentMode: (mode: string) => updateState({ currentMode: mode }),
    setPromptTemplate: (template: string) => updateState({ promptTemplate: template }),
    setCustomTurnPattern: (pattern: string) => updateState({ customTurnPattern: pattern }),
    setBatches: (batches: Batch[] | ((prev: Batch[]) => Batch[])) => {
      if (typeof batches === 'function') {
        setState(prev => ({ ...prev, batches: batches(prev.batches) }));
      } else {
        updateState({ batches });
      }
    },
    setCurrentSummary: (summary: string | ((prev: string) => string)) => {
      if (typeof summary === 'function') {
        setState(prev => ({ ...prev, currentSummary: summary(prev.currentSummary) }));
      } else {
        updateState({ currentSummary: summary });
      }
    },
    clearSession,
    getCombinedContent: getCombinedContentBound
  };
}
