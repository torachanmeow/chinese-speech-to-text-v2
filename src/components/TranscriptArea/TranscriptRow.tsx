import { useEffect, useRef, useState } from 'react';
import type { TranscriptLine } from '../../types';
import { MODEL_OPTIONS } from '../../constants';
import { usePinyin } from '../../hooks/usePinyin';
import { useTranslation } from '../../hooks/useTranslation';
import { useSettingsStore } from '../../stores/useSettingsStore';
import styles from './TranscriptRow.module.css';

interface Props {
  line: TranscriptLine;
}

export function TranscriptRow({ line }: Props) {
  const autoTranslate = useSettingsStore((s) => s.autoTranslate);
  const model = useSettingsStore((s) => s.model);
  const { translate } = useTranslation();
  const hasTriggeredTranslation = useRef(false);
  const modelLabel = MODEL_OPTIONS.find((m) => m.id === model)?.label ?? model;

  usePinyin(line.id, line.text);

  useEffect(() => {
    if (
      autoTranslate &&
      !hasTriggeredTranslation.current &&
      line.translationStatus === 'idle'
    ) {
      hasTriggeredTranslation.current = true;
      translate(line.id, line.text);
    }
  }, [autoTranslate, line.id, line.text, line.translationStatus, translate]);

  const [copied, setCopied] = useState(false);

  const handleManualTranslate = () => {
    if (line.translationStatus !== 'streaming') {
      hasTriggeredTranslation.current = false;
      translate(line.id, line.text);
    }
  };

  const handleCopy = async () => {
    if (!line.translation) return;
    await navigator.clipboard.writeText(line.translation);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const timestamp = new Date(line.timestamp).toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div
      className={styles.row}
    >
      {/* Left: Chinese + pinyin */}
      <div className={styles.leftColumn}>
        <div className={styles.meta}>
          <span className={styles.timestamp}>{timestamp}</span>
        </div>
        {line.pinyinHtml ? (
          <div
            className={styles.chineseText}
            dangerouslySetInnerHTML={{ __html: line.pinyinHtml }}
          />
        ) : (
          <div className={styles.chineseTextPlain}>{line.text}</div>
        )}
      </div>

      {/* Right: Translation */}
      <div className={styles.rightColumn}>
        {line.translationStatus === 'idle' && (
          <button className={styles.translateButton} onClick={handleManualTranslate}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
            <span>翻訳</span>
          </button>
        )}
        {line.translationStatus === 'streaming' && (
          <div className={styles.streamingWrapper}>
            <div className={styles.translatingIndicator}>
              <span className={styles.translatingDot} />
              <span className={styles.translatingLabel}>翻訳中 {modelLabel.replace(/（.*）/, '')}</span>
            </div>
            <div className={styles.translation}>
              {line.translation}
              <span className={styles.cursor} />
            </div>
          </div>
        )}
        {line.translationStatus === 'done' && (
          <div className={styles.translationDone}>
            <div className={styles.translation}>{line.translation}</div>
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
                onClick={handleManualTranslate}
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
        {line.translationStatus === 'error' && (
          <div className={styles.translationError}>
            <span>{line.translation}</span>
            <button className={styles.retryButton} onClick={handleManualTranslate}>
              再試行
            </button>
          </div>
        )}
        {line.translationStatus === 'pending' && (
          <div className={styles.streamingWrapper}>
            <div className={styles.translatingIndicator}>
              <span className={styles.translatingDot} />
              <span className={styles.translatingLabel}>翻訳中 {modelLabel.replace(/（.*）/, '')}</span>
            </div>
            <div className={styles.translationLoading}>
              <span className={styles.loadingDot} />
              <span className={styles.loadingDot} />
              <span className={styles.loadingDot} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
