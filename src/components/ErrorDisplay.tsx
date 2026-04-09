import React from 'react';
import { AlertCircle, Trash2, ShieldAlert, WifiOff, Zap, Server, Settings, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { AppError, ErrorCategory } from '../types';

interface ErrorDisplayProps {
  error: AppError | string | null;
  onDismiss: () => void;
  errorRef: React.RefObject<HTMLDivElement | null>;
}

const CATEGORY_METADATA: Record<ErrorCategory, { 
  icon: any; 
  label: string; 
  tip: string;
  color: string;
}> = {
  AUTH: {
    icon: ShieldAlert,
    label: 'Authentication Failure',
    tip: 'Invalid API Key detected. Please verify your credentials in Provider Settings.',
    color: 'text-rose-500'
  },
  NETWORK: {
    icon: WifiOff,
    label: 'Network Connectivity',
    tip: 'Target endpoint unreachable. Verify your internet connection or local server (e.g. Ollama) status.',
    color: 'text-amber-500'
  },
  QUOTA: {
    icon: Zap,
    label: 'Rate Limit Exceeded',
    tip: 'Global rate limits reached. Exponential backoff is active for automatic recovery.',
    color: 'text-cyan-500'
  },
  SERVER: {
    icon: Server,
    label: 'Provider Server Error',
    tip: 'The LLM provider reported an internal error. This is likely temporary.',
    color: 'text-purple-500'
  },
  CONFIG: {
    icon: Settings,
    label: 'Configuration issue',
    tip: 'The request was malformed or the endpoint/model is invalid for this key.',
    color: 'text-blue-500'
  },
  UNKNOWN: {
    icon: HelpCircle,
    label: 'Processing Interruption',
    tip: 'An unexpected error occurred during distillation.',
    color: 'text-zinc-500'
  }
};

export function ErrorDisplay({ error, onDismiss, errorRef }: ErrorDisplayProps) {
  if (!error) return null;

  const isStructured = typeof error === 'object' && 'category' in error;
  const category = isStructured ? (error as AppError).category : 'UNKNOWN';
  const message = isStructured ? (error as AppError).message : (error as string);
  const code = isStructured ? (error as AppError).code : null;
  
  const meta = CATEGORY_METADATA[category as ErrorCategory] || CATEGORY_METADATA.UNKNOWN;
  const Icon = meta.icon;

  return (
    <motion.div 
      ref={errorRef}
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card p-5 border-rose-500/20 bg-rose-500/5 flex items-start gap-4 shadow-xl relative overflow-hidden"
    >
      <div className={`absolute top-0 left-0 w-1 h-full bg-rose-500/40`} />
      
      <div className={`p-2 rounded-lg bg-zinc-900/50 border border-white/5 ${meta.color}`}>
        <Icon className="w-5 h-5 drop-shadow-[0_0_8px_currentColor]" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="space-y-3">
          <div>
            <p className="text-[10px] font-black text-rose-400 uppercase tracking-[0.2em] mb-1">
              {code ? `Diagnostic Exception [${code}]` : meta.label}
            </p>
            <p className="text-xs text-zinc-300 leading-relaxed font-normal">
              {message}
            </p>
          </div>

          <div className="pt-3 border-t border-white/5">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-zinc-900/40 border border-white/5 group hover:border-amber-500/20 transition-all">
              <div className="relative mt-1">
                <div className={`w-2 h-2 rounded-full bg-amber-500 ${category === 'QUOTA' ? 'animate-pulse' : ''} shadow-[0_0_10px_#f59e0b]`} />
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Troubleshooting Tip</p>
                <p className="text-[10px] text-zinc-400 font-medium leading-relaxed italic">
                  "{meta.tip}"
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button 
        onClick={onDismiss}
        className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-600 hover:text-white transition-all active:scale-90"
        title="Dismiss Diagnostic"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

