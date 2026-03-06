import { useCallback, useState } from 'react';
import { useTranscriptStore } from '../../stores/useTranscriptStore';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { MODEL_OPTIONS } from '../../constants';
import { streamTranslation } from '../../services/geminiApi';
import styles from './InterimLine.module.css';

interface Props {
  text: string;
}

export function InterimLine({ text }: Props) {
  const interimTranslation = useTranscriptStore((s) => s.interimTranslation);
  const interimTranslationStatus = useTranscriptStore((s) => s.interimTranslationStatus);
  const setInterimTranslation = useTranscriptStore((s) => s.setInterimTranslation);
  const model = useSettingsStore((s) => s.model);
  const modelLabel = MODEL_OPTIONS.find((m) => m.id === model)?.label ?? model;
  const [copied, setCopied] = useState(false);

  const handleTranslate = useCallback(async () => {
    if (!text) return;
    const { apiKey, model } = useSettingsStore.getState();
    if (!apiKey) {
      setInterimTranslation('APIキーが設定されていません', 'done');
      return;
    }

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

  const handleCopy = async () => {
    if (!interimTranslation) return;
    await navigator.clipboard.writeText(interimTranslation);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

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
          <div className={styles.streamingWrapper}>
            <div className={styles.translatingIndicator}>
              <span className={styles.translatingDot} />
              <span className={styles.translatingLabel}>翻訳中 {modelLabel.replace(/（.*）/, '')}</span>
            </div>
            <div className={styles.translation}>
              {interimTranslation}
              <span className={styles.cursor} />
            </div>
          </div>
        )}
        {interimTranslationStatus === 'done' && (
          <div className={styles.translationDone}>
            <div className={styles.translation}>{interimTranslation}</div>
            <div className={styles.actionBar}>
              <button
                className={styles.actionButton}
                onClick={handleCopy}
                title="コピー"
              >
                {copied ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                )}
              </button>
              <button
                className={styles.actionButton}
                onClick={handleTranslate}
                title="再翻訳"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 4 23 10 17 10"/>
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
