import React, { Component, ErrorInfo, ReactNode, PropsWithChildren } from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.group('Application Critical Error');
    console.error('Error:', error);
    console.error('Info:', errorInfo);
    console.groupEnd();
  }

  handleReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050505] text-zinc-100 flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full space-y-8 text-center">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-amber-500/20 blur-3xl rounded-full" />
              <div className="relative bg-zinc-900 border border-amber-500/30 p-6 rounded-3xl shadow-2xl">
                <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
              </div>
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl font-black tracking-tight text-white">
                Circuit <span className="text-amber-500">Breaker</span>
              </h1>
              <p className="text-zinc-400 text-sm leading-relaxed">
                The application encountered an irreducible state inconsistency. 
                This is likely caused by a corrupted local session or a hydration mismatch.
              </p>
              
              {this.state.error && (
                <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-xl">
                  <p className="text-[10px] font-mono text-rose-400 truncate uppercase tracking-widest">
                    {this.state.error.message}
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 pt-4">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-4 bg-zinc-100 text-black rounded-2xl font-black text-xs tracking-widest uppercase hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Retry Manifest
              </button>
              
              <button
                onClick={this.handleReset}
                className="w-full py-4 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-2xl font-black text-xs tracking-widest uppercase hover:text-rose-400 hover:border-rose-500/30 transition-all flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Purge Session & Reset
              </button>
            </div>

            <p className="text-[10px] text-zinc-600 uppercase tracking-[0.3em]">
              Surgical Recovery Mode Active
            </p>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
