import React from 'react';
import { 
  X, SortAsc, SortDesc, Calendar, Type, 
  GripVertical, Maximize2, ChevronUp, ChevronDown, FileText, Trash2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn, truncateMiddle } from '../lib/utils';
import { MultiFileSource, SortMode } from '../types';

interface SequenceManagerProps {
  isOpen: boolean;
  onClose: () => void;
  files: MultiFileSource[];
  removeFile: (id: string) => void;
  sortFiles: (mode: SortMode) => void;
  reorderFiles: (activeId: string, overId: string) => void;
  sortMode: SortMode;
}

export function SequenceManager({ 
  isOpen, onClose, files, removeFile, sortFiles, reorderFiles, sortMode 
}: SequenceManagerProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderFiles(active.id as string, over.id as string);
    }
  };

  const activeSortClass = "text-amber-500 golden-glow bg-amber-500/10 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]";
  const inactiveSortClass = "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 border-transparent";

  const SortButton = ({ mode, icon: Icon, label }: { mode: SortMode, icon: any, label: string }) => (
    <button
      onClick={() => sortFiles(mode)}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border",
        sortMode === mode ? activeSortClass : inactiveSortClass
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-100 cursor-pointer"
          />

          <div className="fixed inset-0 flex items-center justify-center z-[101] pointer-events-none p-4 sm:p-6 md:p-8">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl pointer-events-auto overflow-hidden flex flex-col max-h-[calc(100vh-4rem)] md:max-h-[calc(100vh-8rem)]"
            >
              <div className="px-8 py-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    <Maximize2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold tracking-tight text-white">Sequence of files</h2>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-white/5 text-zinc-500 hover:text-white transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="px-8 py-4 bg-zinc-900/20 border-b border-zinc-800 flex flex-wrap gap-3">
                <SortButton mode="name-asc" icon={SortAsc} label="A-Z" />
                <SortButton mode="name-desc" icon={SortDesc} label="Z-A" />
                <SortButton mode="date-asc" icon={ChevronUp} label="Oldest" />
                <SortButton mode="date-desc" icon={ChevronDown} label="Newest" />
              </div>

              <div className="p-8 space-y-1.5 overflow-y-auto custom-scrollbar flex-1">
                <DndContext 
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext 
                    items={files.map(f => f.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {files.map((file) => (
                      <SortableFileItem 
                        key={file.id} 
                        file={file} 
                        onRemove={() => removeFile(file.id)}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              </div>

              <div className="px-8 py-6 border-t border-zinc-800 bg-zinc-900/30 flex items-center justify-between">
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  {files.length} files in sequence
                </div>
                <button
                  onClick={onClose}
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

const SortableFileItem: React.FC<{ 
  file: MultiFileSource, 
  onRemove: () => void
}> = ({ file, onRemove }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: file.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={cn(
        "group flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all cursor-default",
        isDragging 
          ? "bg-amber-500/10 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.15)] relative z-50 scale-[1.02]" 
          : "bg-zinc-950/60 border-zinc-800/60 hover:border-zinc-700 hover:bg-zinc-900/80"
      )}
    >
      <button 
        {...attributes} 
        {...listeners}
        className="text-zinc-600 hover:text-amber-500 cursor-grab active:cursor-grabbing p-1 transition-colors shrink-0"
      >
        <GripVertical className="w-4 h-4" />
      </button>
      
      <FileText className="w-4 h-4 text-amber-500/60 shrink-0" />

      <div className="flex-1 min-w-0 flex items-center justify-between gap-6">
        <span 
          className="text-xs font-bold text-zinc-200 truncate group-hover:duration-1000 group-hover:delay-200"
          title={file.name}
        >
          {truncateMiddle(file.name, 40)}
        </span>
        
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-3 border-l border-zinc-800 pl-4">
            <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase">{(file.size / 1024).toFixed(1)}KB</span>
            <span className="text-[10px] font-mono text-zinc-600 hidden sm:inline">{new Date(file.lastModified).toLocaleDateString()}</span>
          </div>
          
          <button 
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="p-1.5 rounded-lg hover:bg-rose-500/10 text-zinc-700 hover:text-rose-400 transition-all opacity-0 group-hover:opacity-100"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
