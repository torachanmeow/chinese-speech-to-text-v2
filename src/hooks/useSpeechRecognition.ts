import { useCallback, useRef, useState } from 'react';
import { useTranscriptStore } from '../stores/useTranscriptStore';
import { SENTENCE_FLUSH_DELAY } from '../constants';

function createRecognition(): SpeechRecognition | null {
  const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Ctor) return null;
  const r = new Ctor();
  r.continuous = true;
  r.interimResults = true;
  r.lang = 'zh-CN';
  r.maxAlternatives = 1;
  return r;
}

/** Detach all event handlers so stale instances can't interfere */
function detach(r: SpeechRecognition) {
  r.onstart = null;
  r.onresult = null;
  r.onend = null;
  r.onerror = null;
}

export function useSpeechRecognition() {
  const addLine = useTranscriptStore((s) => s.addLine);
  const setInterimText = useTranscriptStore((s) => s.setInterimText);
  const setPendingText = useTranscriptStore((s) => s.setPendingText);
  const setInterimTranslation = useTranscriptStore((s) => s.setInterimTranslation);

  const [isRecognizing, setIsRecognizing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isManualStopRef = useRef(false);
  const sentenceBufferRef = useRef('');
  const flushTimerRef = useRef<number | null>(null);
  const lastFinalRef = useRef('');
  // Generation counter — incremented on every start/stop to invalidate stale callbacks
  const genRef = useRef(0);

  const clearFlushTimer = useCallback(() => {
    if (flushTimerRef.current !== null) {
      clearTimeout(flushTimerRef.current);
      flushTimerRef.current = null;
    }
  }, []);

  const flushSentenceBuffer = useCallback(() => {
    clearFlushTimer();
    const text = sentenceBufferRef.current.trim();
    if (!text) return;

    addLine({
      id: crypto.randomUUID(),
      text,
      pinyinHtml: null,
      translation: null,
      translationStatus: 'idle',
      timestamp: Date.now(),
    });

    sentenceBufferRef.current = '';
    lastFinalRef.current = '';
    setPendingText('');
  }, [addLine, clearFlushTimer, setPendingText]);

  const resetFlushTimer = useCallback(() => {
    clearFlushTimer();
    flushTimerRef.current = window.setTimeout(() => {
      flushSentenceBuffer();
    }, SENTENCE_FLUSH_DELAY);
  }, [clearFlushTimer, flushSentenceBuffer]);

  // Wire up a recognition instance with event handlers
  const wireRecognition = useCallback((recognition: SpeechRecognition) => {
    recognition.onstart = () => {
      setIsRecognizing(true);
      setError(null);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;

        if (result.isFinal) {
          if (transcript === lastFinalRef.current) continue;
          lastFinalRef.current = transcript;

          sentenceBufferRef.current += transcript;
          setPendingText(sentenceBufferRef.current);

          if (/[。！？；\n]/.test(transcript.slice(-1))) {
            flushSentenceBuffer();
          } else {
            resetFlushTimer();
          }
        } else {
          interim += transcript;
        }
      }

      setInterimText(interim);
    };

    recognition.onend = () => {
      if (isManualStopRef.current) {
        setIsRecognizing(false);
        return;
      }

      // Reset dedup ref — new session may produce the same initial text
      lastFinalRef.current = '';

      // Capture generation so stale timeouts are ignored
      const gen = genRef.current;

      // Keep isRecognizing true during auto-restart — no UI flicker
      const fresh = createRecognition();
      if (!fresh) {
        setIsRecognizing(false);
        return;
      }

      wireRecognition(fresh);
      recognitionRef.current = fresh;

      // Minimal delay — just enough for Chrome to release the previous session
      setTimeout(() => {
        if (isManualStopRef.current || genRef.current !== gen) return;
        try {
          fresh.start();
        } catch {
          // If it fails, wait a bit and try once more
          setTimeout(() => {
            if (isManualStopRef.current || genRef.current !== gen) return;
            try {
              fresh.start();
            } catch {
              setIsRecognizing(false);
              setError('音声認識の再開に失敗しました。ボタンを押して再開してください。');
            }
          }, 500);
        }
      }, 100);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setError('マイクのアクセスが拒否されました。ブラウザの設定を確認してください。');
        isManualStopRef.current = true;
        setIsRecognizing(false);
      }
      // no-speech, network, aborted → onend will fire and auto-restart
    };
  }, [flushSentenceBuffer, resetFlushTimer, setInterimText, setPendingText]);

  const start = useCallback(() => {
    // Clean up any lingering instance from a previous session
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch { /* already stopped */ }
      detach(recognitionRef.current);
      recognitionRef.current = null;
    }

    const recognition = createRecognition();
    if (!recognition) {
      setError('このブラウザは音声認識に対応していません。Chromeをお使いください。');
      return;
    }

    // New generation — invalidates any pending timeouts from old sessions
    genRef.current += 1;

    setError(null);
    isManualStopRef.current = false;
    sentenceBufferRef.current = '';
    lastFinalRef.current = '';
    setPendingText('');

    wireRecognition(recognition);

    try {
      recognition.start();
      recognitionRef.current = recognition;
    } catch {
      setError('音声認識の開始に失敗しました。');
    }
  }, [wireRecognition]);

  const stop = useCallback(() => {
    isManualStopRef.current = true;
    // New generation — invalidates any pending auto-restart timeouts
    genRef.current += 1;
    clearFlushTimer();

    if (sentenceBufferRef.current.trim()) {
      flushSentenceBuffer();
    }

    setInterimText('');
    setInterimTranslation('', 'idle');
    setIsRecognizing(false);

    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch { /* already stopped */ }
      detach(recognitionRef.current);
      recognitionRef.current = null;
    }
  }, [clearFlushTimer, flushSentenceBuffer, setInterimText, setInterimTranslation]);

  const toggle = useCallback(() => {
    if (isRecognizing) {
      stop();
    } else {
      start();
    }
  }, [isRecognizing, start, stop]);

  return { isRecognizing, error, toggle, start, stop };
}
