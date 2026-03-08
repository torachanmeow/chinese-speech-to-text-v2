import { useState } from 'react';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { useTranscriptStore } from '../../stores/useTranscriptStore';
import { SettingsModal } from '../SettingsModal/SettingsModal';
import styles from './Header.module.css';

export function Header() {
  const { isRecognizing, isReconnecting, error, toggle } = useSpeechRecognition();
  const autoTranslate = useSettingsStore((s) => s.autoTranslate);
  const setAutoTranslate = useSettingsStore((s) => s.setAutoTranslate);
  const clearAll = useTranscriptStore((s) => s.clearAll);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <span className={styles.brandKanji}>中国語音声認識</span>
        <span className={styles.brandSub}>Chinese → Japanese</span>
      </div>

      <div className={styles.controls}>
        <button
          className={`${styles.micButton} ${isRecognizing ? styles.active : ''} ${isReconnecting ? styles.reconnecting : ''} ${error ? styles.error : ''}`}
          onClick={toggle}
          aria-label={isRecognizing ? '音声認識を停止' : '音声認識を開始'}
        >
          <div className={styles.micIcon}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
          </div>
          <span className={styles.micLabel}>
            {isReconnecting ? '再接続中' : isRecognizing ? (<>認識中<span className={styles.dots} /></>) : '開始'}
          </span>
        </button>

        {error && <span className={styles.errorText}>{error}</span>}

        <div className={styles.separator} />

        <label className={styles.toggle}>
          <div className={`${styles.toggleTrack} ${autoTranslate ? styles.toggleOn : ''}`}>
            <div className={styles.toggleThumb} />
          </div>
          <input
            type="checkbox"
            checked={autoTranslate}
            onChange={(e) => setAutoTranslate(e.target.checked)}
            className={styles.toggleInput}
          />
          <span className={styles.toggleLabel}>自動翻訳</span>
        </label>

        <div className={styles.separator} />

        <button
          className={styles.toolButton}
          onClick={clearAll}
          title="すべてクリア"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </button>

        <button
          className={styles.toolButton}
          onClick={() => setShowSettings(true)}
          title="設定"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>
      </div>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </header>
  );
}
