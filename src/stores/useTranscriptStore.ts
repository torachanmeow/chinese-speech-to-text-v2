import { create } from 'zustand';
import type { TranscriptLine } from '../types';

interface TranscriptState {
  lines: TranscriptLine[];
  pendingText: string;
  interimText: string;
  interimTranslation: string;
  interimTranslationStatus: 'idle' | 'streaming' | 'done';
  visibleCount: number;
  addLine: (line: TranscriptLine) => void;
  updateLine: (id: string, updates: Partial<TranscriptLine>) => void;
  setPendingText: (text: string) => void;
  setInterimText: (text: string) => void;
  setInterimTranslation: (text: string, status: 'idle' | 'streaming' | 'done') => void;
  showMore: (count: number) => void;
  clearAll: () => void;
}

export const useTranscriptStore = create<TranscriptState>()((set) => ({
  lines: [],
  pendingText: '',
  interimText: '',
  interimTranslation: '',
  interimTranslationStatus: 'idle' as const,
  visibleCount: 0,

  addLine: (line) =>
    set((state) => ({
      lines: [...state.lines, line],
      interimTranslation: '',
      interimTranslationStatus: 'idle' as const,
    })),

  updateLine: (id, updates) =>
    set((state) => ({
      lines: state.lines.map((l) =>
        l.id === id ? { ...l, ...updates } : l
      ),
    })),

  setPendingText: (pendingText) => set({ pendingText }),

  setInterimText: (interimText) =>
    set((state) => {
      if (interimText && !state.interimText && state.interimTranslationStatus !== 'idle') {
        return { interimText, interimTranslation: '', interimTranslationStatus: 'idle' as const };
      }
      return { interimText };
    }),

  setInterimTranslation: (text, status) =>
    set({ interimTranslation: text, interimTranslationStatus: status }),

  showMore: (count) =>
    set((state) => ({ visibleCount: state.visibleCount + count })),

  clearAll: () => set({ lines: [], pendingText: '', interimText: '', interimTranslation: '', interimTranslationStatus: 'idle' as const, visibleCount: 0 }),
}));
