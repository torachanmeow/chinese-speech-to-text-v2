import { useEffect, useRef } from 'react';
import type { TranscriptLine } from '../../types';
import { usePinyin } from '../../hooks/usePinyin';
import { useTranslation } from '../../hooks/useTranslation';
import { useSettingsStore } from '../../stores/useSettingsStore';
import styles from './TranscriptRow.module.css';

interface Props {
  line: TranscriptLine;
}

export function TranscriptRow({ line }: Props) {
  const autoTranslate = useSettingsStore((s) => s.autoTranslate);
  const { translate } = useTranslation();
  const hasTriggeredTranslation = useRef(false);

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

  const handleManualTranslate = () => {
    if (line.translationStatus !== 'streaming') {
      hasTriggeredTranslation.current = false;
      translate(line.id, line.text);
    }
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
          <div className={styles.translation}>
            {line.translation}
            <span className={styles.cursor} />
          </div>
        )}
        {line.translationStatus === 'done' && (
          <div className={styles.translation}>
            {line.translation}
            <button
              className={styles.retranslateButton}
              onClick={handleManualTranslate}
            >
              ↻ 再翻訳
            </button>
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
          <div className={styles.translationLoading}>
            <span className={styles.loadingDot} />
            <span className={styles.loadingDot} />
            <span className={styles.loadingDot} />
          </div>
        )}
      </div>
    </div>
  );
}
