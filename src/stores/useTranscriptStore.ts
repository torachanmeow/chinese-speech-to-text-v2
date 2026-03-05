import { create } from 'zustand';
import type { TranscriptLine } from '../types';

interface TranscriptState {
  lines: TranscriptLine[];
  pendingText: string;
  interimText: string;
  interimTranslation: string;
  interimTranslationStatus: 'idle' | 'streaming' | 'done';
  addLine: (line: TranscriptLine) => void;
  updateLine: (id: string, updates: Partial<TranscriptLine>) => void;
  setPendingText: (text: string) => void;
  setInterimText: (text: string) => void;
  setInterimTranslation: (text: string, status: 'idle' | 'streaming' | 'done') => void;
  clearAll: () => void;
  trimToMaxLines: (max: number) => void;
}

export const useTranscriptStore = create<TranscriptState>()((set) => ({
  lines: [],
  pendingText: '',
  interimText: '',
  interimTranslation: '',
  interimTranslationStatus: 'idle' as const,

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
      // When new interim text appears after being empty, reset interim translation
      if (interimText && !state.interimText && state.interimTranslationStatus !== 'idle') {
        return { interimText, interimTranslation: '', interimTranslationStatus: 'idle' as const };
      }
      return { interimText };
    }),

  setInterimTranslation: (text, status) =>
    set({ interimTranslation: text, interimTranslationStatus: status }),

  clearAll: () => set({ lines: [], pendingText: '', interimText: '', interimTranslation: '', interimTranslationStatus: 'idle' as const }),

  trimToMaxLines: (max) =>
    set((state) => {
      if (max <= 0 || state.lines.length <= max) return state;
      return { lines: state.lines.slice(-max) };
    }),
}));
