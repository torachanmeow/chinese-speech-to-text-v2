# Chinese Speech to Text v2

中国語（簡体字）の音声をリアルタイムで認識し、日本語に翻訳するWebアプリケーション。

## 機能概要

- **リアルタイム音声認識**: Web Speech API で中国語音声をテキストに変換
- **ストリーミング翻訳**: Gemini API で日本語訳を逐次表示
- **途中翻訳**: 認識中でも「今すぐ翻訳」ボタンで即座に翻訳可能
- **再翻訳**: 翻訳済みの行をホバーして「再翻訳」ボタンで再翻訳
- **ピンイン表示**: 各漢字の上にピンイン（声調記号付き）を ruby タグで表示
- **コピー対応**: テキスト選択・コピー時にピンインは含まれない
- **2カラムレイアウト**: 左に原文（中国語＋ピンイン）、右に翻訳（日本語）

## 画面構成

```
+--------------------------------------------------+
|  [音声認識]  [自動翻訳 ON/OFF]  [クリア] [設定]    |
+------------------------+-------------------------+
|  原文（中国語）         |  翻訳（日本語）           |
+------------------------+-------------------------+
|   ni hao               |                         |
|   你好                  |  こんにちは               |
+------------------------+-------------------------+
|   jin tian tian qi...  |                         |
|   今天天气很好           |  今日はいい天気です  [再] |
+------------------------+-------------------------+
|   (認識中...)           |  [今すぐ翻訳]            |
+------------------------+-------------------------+
|          (c) 2026 Chinese Speech to Text          |
+--------------------------------------------------+
```

## 技術仕様

### 音声認識

| 項目 | 仕様 |
|------|------|
| API | Web Speech API (`SpeechRecognition`) |
| 対応言語 | 中国語簡体字 (`zh-CN`) |
| 認識モード | 連続認識 + 中間結果表示 |
| 文区切り | 句読点（。！？；）検出 または 2秒間の無音で自動確定 |
| 自動再開 | `onend` 後に自動再接続 |
| 重複防止 | 直前の確定結果との比較による重複排除 |
| 停止方式 | `abort()` で即時リソース解放 |

### 翻訳

| 項目 | 仕様 |
|------|------|
| API | Google Gemini API（SSE ストリーミング） |
| デフォルトモデル | `gemini-2.5-flash-lite` |
| 選択可能モデル | `gemini-2.5-flash-lite`, `gemini-3.1-flash-lite-preview` |
| 翻訳方向 | 簡体字中国語 → 日本語 |
| Temperature | 0.3 |
| 自動翻訳 | ON/OFF 切替可能 |
| 途中翻訳 | 認識中のテキストをその場で翻訳（行を分けない） |

### ピンイン

| 項目 | 仕様 |
|------|------|
| ライブラリ | pinyin-pro |
| 表示形式 | HTML ruby タグ |
| キャッシュ | 文字単位の Map キャッシュ |
| 処理タイミング | `requestIdleCallback` で非同期実行 |

### UI

| 項目 | 仕様 |
|------|------|
| フレームワーク | React 19 + TypeScript |
| ビルドツール | Vite |
| 状態管理 | Zustand（localStorage 永続化） |
| テーマ | ダークモードのみ |
| スタイル | CSS Modules + CSS Custom Properties |

### 設定項目

| 設定 | デフォルト値 | 説明 |
|------|-------------|------|
| Gemini APIキー | （空） | Google AI Studio で取得 |
| 翻訳モデル | `gemini-2.5-flash-lite` | Lite モデル2種から選択 |
| 最大表示行数 | 50 | 0 = 無制限 |
| 自動翻訳 | OFF | ON で文確定時に自動翻訳 |
| 自動スクロール | ON | 新しい行追加時に自動スクロール |

## セットアップ

### 必要条件

- Node.js 18+
- Google Chrome（Web Speech API 対応）
- Gemini API キー（[Google AI Studio](https://aistudio.google.com/)）

### インストール・起動

```bash
npm install
npm run dev
```

または `run.bat` をダブルクリック。

### 本番ビルド

```bash
npm run build
```

`dist/` に静的ファイルが出力される。

## 使い方

1. 歯車アイコンから設定を開き、Gemini API キーを入力して保存
2. 「音声認識」ボタンをクリックしてマイクを有効化
3. 中国語音声が左カラムにテキスト＋ピンインで表示される
4. 「自動翻訳」ON で右カラムに日本語訳がストリーミング表示
5. 認識中に「今すぐ翻訳」で途中翻訳も可能
6. 翻訳済みの行はホバーで「再翻訳」ボタンが表示される

## プロジェクト構成

```
src/
  main.tsx                          # エントリーポイント
  App.tsx                           # ルートコンポーネント
  types/
    index.ts                        # 共通型定義
    speech-recognition.d.ts         # Web Speech API 型宣言
  constants/
    index.ts                        # 定数（API URL、モデル、設定）
  stores/
    useSettingsStore.ts             # 設定ストア（localStorage 永続化）
    useTranscriptStore.ts           # 認識テキスト・途中翻訳ストア
  hooks/
    useSpeechRecognition.ts         # 音声認識フック
    useTranslation.ts               # ストリーミング翻訳フック
    usePinyin.ts                    # ピンイン変換フック
    useAutoScroll.ts                # 自動スクロールフック
  services/
    geminiApi.ts                    # Gemini API ストリーミングクライアント
    pinyinService.ts                # pinyin-pro ラッパー（キャッシュ付き）
  components/
    Header/                         # ヘッダー（マイクボタン、設定ボタン）
    TranscriptArea/
      TranscriptArea.tsx            # スクロール可能なコンテナ
      TranscriptRow.tsx             # 1行分の原文＋翻訳
      InterimLine.tsx               # 認識中テキスト＋途中翻訳
    SettingsModal/                  # 設定ダイアログ
    Toast/                          # 通知トースト
  styles/
    global.css                      # グローバルスタイル（CSS変数）
```

## 対応ブラウザ

- Google Chrome（推奨）
- Microsoft Edge

※ Firefox / Safari では Web Speech API 非対応のため音声認識が動作しません。
