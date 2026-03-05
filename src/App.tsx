import { Header } from './components/Header/Header';
import { TranscriptArea } from './components/TranscriptArea/TranscriptArea';
import { ToastContainer } from './components/Toast/Toast';
import styles from './App.module.css';

export default function App() {
  return (
    <div className={styles.app}>
      <Header />
      <TranscriptArea />
      <ToastContainer />
    </div>
  );
}
