import { useEffect, useState, useCallback } from 'react';
import styles from './Toast.module.css';

interface ToastMessage {
  id: string;
  text: string;
  type: 'error' | 'info';
}

type AddToastFn = (text: string, type?: 'error' | 'info') => void;
let addToastGlobal: AddToastFn | null = null;

export function showToast(text: string, type: 'error' | 'info' = 'error') {
  addToastGlobal?.(text, type);
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast: AddToastFn = useCallback((text, type = 'error') => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  useEffect(() => {
    addToastGlobal = addToast;
    return () => { addToastGlobal = null; };
  }, [addToast]);

  if (toasts.length === 0) return null;

  return (
    <div className={styles.container}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${styles.toast} ${toast.type === 'error' ? styles.error : styles.info}`}
        >
          <span>{toast.text}</span>
          <button
            className={styles.dismiss}
            onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  );
}
