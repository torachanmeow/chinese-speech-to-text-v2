import { useCallback } from 'react';
import { useTranscriptStore } from '../../stores/useTranscriptStore';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { streamTranslation } from '../../services/geminiApi';
import styles from './InterimLine.module.css';

interface Props {
  text: string;
}

export function InterimLine({ text }: Props) {
  const interimTranslation = useTranscriptStore((s) => s.interimTranslation);
  const interimTranslationStatus = useTranscriptStore((s) => s.interimTranslationStatus);
  const setInterimTranslation = useTranscriptStore((s) => s.setInterimTranslation);

  const handleTranslate = useCallback(async () => {
    if (!text) return;
    const { apiKey, model } = useSettingsStore.getState();
    if (!apiKey) return;

    setInterimTranslation('', 'streaming');
    let accumulated = '';
    try {
      for await (const chunk of streamTranslation(apiKey, text, model)) {
        accumulated += chunk;
        setInterimTranslation(accumulated, 'streaming');
      }
      setInterimTranslation(accumulated, 'done');
    } catch {
      setInterimTranslation('翻訳エラー', 'done');
    }
  }, [text, setInterimTranslation]);

  const hasContent = !!text || interimTranslationStatus !== 'idle';

  return (
    <div className={`${styles.interim} ${hasContent ? '' : styles.interimEmpty}`}>
      <div className={styles.leftColumn}>
        {hasContent && (
          <>
            <div className={styles.indicator}>
              <span className={styles.dot} />
              <span className={styles.label}>認識中</span>
            </div>
            <div className={styles.text}>{text}</div>
          </>
        )}
      </div>
      <div className={styles.rightColumn}>
        {hasContent && interimTranslationStatus === 'idle' && (
          <button className={styles.flushTranslateButton} onClick={handleTranslate}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
            <span>今すぐ翻訳</span>
          </button>
        )}
        {interimTranslationStatus === 'streaming' && (
          <div className={styles.translation}>
            {interimTranslation}
            <span className={styles.cursor} />
          </div>
        )}
        {interimTranslationStatus === 'done' && (
          <div className={styles.translation}>
            {interimTranslation}
            <button className={styles.retranslateButton} onClick={handleTranslate}>
              ↻
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
