# AI Chat with OpenAI Vector Store

Next.js アプリで OpenAI の Responses API とベクターストア検索を組み合わせたチャット UI を提供します。既存のベクターストアにドキュメントを格納しておけば、チャットから関連ドキュメントを自動で検索し、回答生成に活用できます。

## セットアップ

1. 依存関係をインストールします。

   ```bash
   npm install
   ```

2. 環境変数ファイルを作成します。

   ```bash
   cp .env.local.example .env.local
   ```

3. `.env.local` を編集して、最低限 `OPENAI_API_KEY` を設定します。ベクターストアを利用する場合は `OPENAI_VECTOR_STORE_ID` も設定してください。必要に応じて `OPENAI_MODEL` や `OPENAI_DEFAULT_INSTRUCTIONS` を上書きできます。

4. 開発サーバーを起動します。

   ```bash
   npm run dev
   ```

5. ブラウザで [http://localhost:3000](http://localhost:3000) を開き、チャットを開始します。

## ベクターストアについて

- OpenAI ダッシュボードや API でベクターストアを作成し、ファイルをアップロードします。参考: OpenAI ドキュメント「File Search」および「Vector Stores」。
- `.env.local` の `OPENAI_VECTOR_STORE_ID` に対象の ID (`vs_...`) を設定すると、チャット時にファイル検索が自動で有効化されます。

## プロジェクト構成

- `src/app/page.tsx` — チャット UI。クライアント側でメッセージ履歴を管理し、API 経由でモデル呼び出しを行います。
- `src/app/api/chat/route.ts` — OpenAI Responses API へのサーバーサイドエンドポイント。会話履歴とベクターストア ID を渡して応答を生成します。
- `.env.local.example` — 必要な環境変数のサンプル。

## 追加メモ

- OpenAI API へのリクエストは `gpt-4o-mini` を既定モデルとして使用しています。別モデルを使う場合は `.env.local` で `OPENAI_MODEL` を指定してください。
- サーバーログに API エラーを出力し、クライアント側では簡潔なエラーメッセージを表示します。

## ライセンス

プロジェクトのライセンスは別途指定がない限り未設定です。必要に応じて `LICENSE` ファイルを追加してください。
