export interface TranscriptLine {
  id: string;
  text: string;
  pinyinHtml: string | null;
  translation: string | null;
  translationStatus: 'idle' | 'pending' | 'streaming' | 'done' | 'error';
  timestamp: number;
}