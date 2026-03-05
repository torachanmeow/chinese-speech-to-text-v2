import { useEffect, useRef, useState } from 'react';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { MODEL_OPTIONS } from '../../constants';
import styles from './SettingsModal.module.css';

interface Props {
  onClose: () => void;
}

export function SettingsModal({ onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const apiKey = useSettingsStore((s) => s.apiKey);
  const model = useSettingsStore((s) => s.model);
  const maxLines = useSettingsStore((s) => s.maxLines);
  const autoScroll = useSettingsStore((s) => s.autoScroll);
  const setApiKey = useSettingsStore((s) => s.setApiKey);
  const setModel = useSettingsStore((s) => s.setModel);
  const setMaxLines = useSettingsStore((s) => s.setMaxLines);
  const setAutoScroll = useSettingsStore((s) => s.setAutoScroll);

  const [localApiKey, setLocalApiKey] = useState(apiKey);
  const [localModel, setLocalModel] = useState(model);
  const [localMaxLines, setLocalMaxLines] = useState(maxLines);
  const [localAutoScroll, setLocalAutoScroll] = useState(autoScroll);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) {
      dialog.showModal();
    }
  }, []);

  const handleSave = () => {
    setApiKey(localApiKey.trim());
    setModel(localModel);
    setMaxLines(localMaxLines);
    setAutoScroll(localAutoScroll);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <dialog ref={dialogRef} className={styles.dialog} onKeyDown={handleKeyDown}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>設定</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.field}>
            <label className={styles.label}>Gemini APIキー</label>
            <div className={styles.passwordField}>
              <input
                type={showKey ? 'text' : 'password'}
                value={localApiKey}
                onChange={(e) => setLocalApiKey(e.target.value)}
                placeholder="APIキーを入力してください"
                className={styles.input}
              />
              <button
                className={styles.eyeButton}
                onClick={() => setShowKey(!showKey)}
                type="button"
              >
                {showKey ? '隠す' : '表示'}
              </button>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>翻訳モデル</label>
            <select
              value={localModel}
              onChange={(e) => setLocalModel(e.target.value)}
              className={styles.select}
            >
              {MODEL_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>最大表示行数</label>
            <input
              type="number"
              value={localMaxLines}
              onChange={(e) => setLocalMaxLines(parseInt(e.target.value) || 0)}
              min={0}
              max={200}
              className={styles.inputSmall}
            />
            <span className={styles.hint}>0 = 無制限</span>
          </div>

          <div className={styles.field}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={localAutoScroll}
                onChange={(e) => setLocalAutoScroll(e.target.checked)}
              />
              自動スクロール
            </label>
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelButton} onClick={onClose}>キャンセル</button>
          <button className={styles.saveButton} onClick={handleSave}>保存</button>
        </div>
      </div>
    </dialog>
  );
}
