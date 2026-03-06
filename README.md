# Chinese Speech to Text v2

中国語VTuber配信などの音声をリアルタイムで認識し、日本語に翻訳する個人用Webアプリケーション。

[外国語のライブ配信をリアルタイム翻訳する方法](https://love.ianthis.net/2023/05/06/post-48/) - このツールを作成するアイデアの元となった記事です。

> 前バージョン: [chinese-speech-to-text](https://github.com/torachanmeow/chinese-speech-to-text)（開発終了・アーカイブ済み）

## 機能概要

- **リアルタイム音声認識**: Web Speech API で中国語音声をテキストに変換
- **ストリーミング翻訳**: Gemini API で日本語訳を逐次表示
- **途中翻訳**: 認識中でも「今すぐ翻訳」ボタンで即座に翻訳可能
- **コピー＆再翻訳**: 翻訳済みの行をホバーしてコピー・再翻訳ボタンを表示
- **ピンイン表示**: 各漢字の上にピンイン（声調記号付き）を ruby タグで表示
- **コピー対応**: テキスト選択・コピー時にピンインは含まれない
- **履歴ブラウジング**: 表示行数を超えた過去のデータも「読み込む」ボタンで遡れる
- **翻訳ステータス表示**: 翻訳中にモデル名を表示
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
|   今天天气很好           |  今日はいい天気です [CP][再]|
+------------------------+-------------------------+
|   (認識中...)           |  [今すぐ翻訳]            |
+------------------------+-------------------------+
|          (c) 2026 Chinese Speech to Text          |
+--------------------------------------------------+
```

## セットアップ

### 必要条件

- Node.js 18+
- Google Chrome（Web Speech API 対応）
- Gemini API キー（[Google AI Studio](https://aistudio.google.com/)）

### 音声入力の設定

VoiceMeeter 等を使って仮想マイクを作成し、配信音声をブラウザに入力します。
詳細は [外国語のライブ配信をリアルタイム翻訳する方法](https://love.ianthis.net/2023/05/06/post-48/) を参考にしてください。

動作確認: [Google翻訳](https://translate.google.com/) で中国語音声認識を試して、配信音声が認識されることを確認してください。

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
6. 翻訳済みの行はホバーでコピー・再翻訳ボタンが表示される

## 技術仕様

### 音声認識

| 項目 | 仕様 |
|------|------|
| API | Web Speech API (`SpeechRecognition`) |
| 対応言語 | 中国語簡体字 (`zh-CN`) |
| 認識モード | 連続認識 + 中間結果表示 |
| 文区切り | 句読点（。！？；）・改行検出 または 最後の確定結果から2秒経過で自動確定 |
| 自動再開 | `onend` 後に自動再接続 |
| 重複防止 | 直前の確定結果との比較による重複排除 |
| 停止方式 | `abort()` で即時リソース解放 |

### 翻訳

| 項目 | 仕様 |
|------|------|
| API | Google Gemini API（SSE ストリーミング） |
| デフォルトモデル | `gemini-3.1-flash-lite-preview` |
| 選択可能モデル | `gemini-2.5-flash-lite`, `gemini-3.1-flash-lite-preview` |
| 翻訳方向 | 簡体字中国語 → 日本語 |
| 翻訳指示 | systemInstruction API で指定 |
| Temperature | 0.3 |
| 自動翻訳 | ON/OFF 切替可能 |
| 途中翻訳 | 認識中のテキストをその場で翻訳 |

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
| 翻訳モデル | `gemini-3.1-flash-lite-preview` | Lite モデル2種から選択 |
| 最大表示行数 | 50 | 0〜200（0 = 無制限）、超過分は「過去のデータを読み込む」で遡れる |
| 自動翻訳 | OFF | ON で文確定時に自動翻訳 |
| 自動スクロール | ON | 新しい行追加時に自動スクロール |

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

## トラブルシューティング

### 音声認識が動作しない

- ブラウザのマイク権限を確認
- 正しい音声入力デバイスが選択されているか確認
- VoiceMeeter の設定とルーティングを確認

### 翻訳が動作しない

- Gemini API キーが正しく設定されているか確認
- インターネット接続を確認
- API キーの使用制限を確認

### 音声が途切れる

- 音声入力レベルを調整
- ブラウザのタブがアクティブであることを確認

## 使用ライブラリ

- [React](https://react.dev/) - MIT License
- [Zustand](https://github.com/pmndrs/zustand) - MIT License
- [pinyin-pro](https://github.com/zh-lx/pinyin-pro) - MIT License
- [Vite](https://vite.dev/) - MIT License
