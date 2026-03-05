import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEY, DEFAULT_SETTINGS } from '../constants';

interface SettingsState {
  apiKey: string;
  model: string;
  maxLines: number;
  autoTranslate: boolean;
  autoScroll: boolean;
  setApiKey: (key: string) => void;
  setModel: (model: string) => void;
  setMaxLines: (n: number) => void;
  setAutoTranslate: (v: boolean) => void;
  setAutoScroll: (v: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      setApiKey: (apiKey) => set({ apiKey }),
      setModel: (model) => set({ model }),
      setMaxLines: (maxLines) => set({ maxLines: Math.max(0, Math.min(200, maxLines)) }),
      setAutoTranslate: (autoTranslate) => set({ autoTranslate }),
      setAutoScroll: (autoScroll) => set({ autoScroll }),
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        apiKey: state.apiKey,
        model: state.model,
        maxLines: state.maxLines,
        autoTranslate: state.autoTranslate,
        autoScroll: state.autoScroll,
      }),
    }
  )
);
