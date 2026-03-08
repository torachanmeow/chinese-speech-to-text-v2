export const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/';
export const DEFAULT_MODEL = 'gemini-3.1-flash-lite-preview';

export const MODEL_OPTIONS = [
  { id: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite' },
  { id: 'gemini-3.1-flash-lite-preview', label: 'Gemini 3.1 Flash Lite（プレビュー）' },
];

export const TRANSLATION_SYSTEM_INSTRUCTION = '中国語→日本語翻訳。日本語訳のみ出力。原文・注釈・説明は絶対に含めない。';

export const GENERATION_CONFIG = {
  temperature: 0.3,
  maxOutputTokens: 2048,
};

export const SENTENCE_FLUSH_DELAY = 2000;

/** If no onresult fires within this period (ms), force-restart SpeechRecognition */
export const SR_WATCHDOG_TIMEOUT = 8000;

export const STORAGE_KEY = 'chinese_stt_v2_settings';

export const DEFAULT_SETTINGS = {
  apiKey: '',
  model: DEFAULT_MODEL,
  maxLines: 50,
  autoTranslate: false,
  autoScroll: true,
};
