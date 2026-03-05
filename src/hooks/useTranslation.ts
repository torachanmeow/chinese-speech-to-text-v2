import { useCallback } from 'react';
import { useTranscriptStore } from '../stores/useTranscriptStore';
import { useSettingsStore } from '../stores/useSettingsStore';
import { streamTranslation } from '../services/geminiApi';

export function useTranslation() {
  const updateLine = useTranscriptStore((s) => s.updateLine);

  const translate = useCallback(async (lineId: string, text: string) => {
    const { apiKey, model } = useSettingsStore.getState();
    if (!apiKey) {
      updateLine(lineId, {
        translationStatus: 'error',
        translation: 'APIキーが設定されていません',
      });
      return;
    }

    updateLine(lineId, { translationStatus: 'streaming', translation: '' });

    let accumulated = '';
    try {
      for await (const chunk of streamTranslation(apiKey, text, model)) {
        accumulated += chunk;
        updateLine(lineId, { translation: accumulated });
      }
      updateLine(lineId, { translationStatus: 'done' });
    } catch (err) {
      const msg = err instanceof Error ? err.message : '翻訳エラー';
      updateLine(lineId, { translationStatus: 'error', translation: msg });
    }
  }, [updateLine]);

  return { translate };
}
