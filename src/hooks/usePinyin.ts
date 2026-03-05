import { useEffect } from 'react';
import { useTranscriptStore } from '../stores/useTranscriptStore';
import { textToRubyHtml } from '../services/pinyinService';

export function usePinyin(lineId: string, text: string) {
  const updateLine = useTranscriptStore((s) => s.updateLine);

  useEffect(() => {
    let cancelled = false;

    // Use requestIdleCallback if available, otherwise setTimeout
    const schedule = window.requestIdleCallback || ((cb: () => void) => setTimeout(cb, 16));
    const cancel = window.cancelIdleCallback || clearTimeout;

    const handle = schedule(() => {
      if (cancelled) return;
      const rubyHtml = textToRubyHtml(text);
      updateLine(lineId, { pinyinHtml: rubyHtml });
    });

    return () => {
      cancelled = true;
      cancel(handle);
    };
  }, [lineId, text, updateLine]);
}
