import { useTranscriptStore } from '../../stores/useTranscriptStore';
import { useAutoScroll } from '../../hooks/useAutoScroll';
import { TranscriptRow } from './TranscriptRow';
import { InterimLine } from './InterimLine';
import styles from './TranscriptArea.module.css';

export function TranscriptArea() {
  const lines = useTranscriptStore((s) => s.lines);
  const pendingText = useTranscriptStore((s) => s.pendingText);
  const interimText = useTranscriptStore((s) => s.interimText);
  const { containerRef, handleScroll } = useAutoScroll([lines.length, pendingText, interimText]);

  return (
    <div className={styles.container}>
      {/* Column labels */}
      <div className={styles.columnLabels}>
        <div className={styles.labelLeft}>
          <span className={styles.labelCn}>原文</span>
          <span className={styles.labelLang}>中国語</span>
        </div>
        <div className={styles.labelRight}>
          <span className={styles.labelJp}>翻訳</span>
          <span className={styles.labelLang}>日本語</span>
        </div>
      </div>

      {/* Scroll area */}
      <div
        className={styles.scrollArea}
        ref={containerRef}
        onScroll={handleScroll}
      >
        {lines.length === 0 && !interimText && !pendingText && (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
              </svg>
            </div>
            <p className={styles.emptyText}>マイクボタンを押して音声認識を開始</p>
            <p className={styles.emptyHint}>中国語の音声がリアルタイムで文字に変換されます</p>
          </div>
        )}

        {lines.map((line) => (
          <TranscriptRow key={line.id} line={line} />
        ))}

        <InterimLine text={pendingText + interimText} />

        {/* Footer spacer */}
        <div className={styles.footer}>
          <span>© 2026 Chinese Speech to Text</span>
        </div>
      </div>
    </div>
  );
}
