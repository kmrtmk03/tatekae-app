# tatekae-app（立て替え管理）

立て替えたお金を記録・管理するための個人向け PWA。
スマートフォンのホーム画面に追加して使うことを想定している。

要件・データモデル・実装フェーズ・進捗は [docs/implementation-plan.md](docs/implementation-plan.md) を参照。

## 主な機能

- 記録の追加: 右下の「＋」ボタンから開くモーダルで、日付・項目名・金額を入力して登録
- 記録の一覧表示: 登録済みの記録を日付順に表示
- 清算状態の切り替え: 各記録のチェックで清算済み / 未清算を切り替え
- 記録の編集・削除
- 未清算合計の表示: 画面上部で常に確認可能（フィルタの影響を受けない）
- 絞り込み: 清算状態のタブと月フィルタ
- データ保存: ブラウザの `localStorage`（サーバーへの送信なし）。データは使っているブラウザ内にだけ残るため、ブラウザのサイトデータを消すと失われる。端末間の同期やバックアップはなく、エクスポート／インポートも未実装
- PWA: ホーム画面への追加・オフライン起動に対応（`vite-plugin-pwa`）。オフライン起動はビルド成果物のブラウザ確認まで済み。実機でのホーム画面追加は未検証

## 技術スタック

- Vite + React 19 + TypeScript
- CSS Modules
- vite-plugin-pwa
- Lint: oxlint / フォーマッタ: Prettier
- パッケージマネージャー: pnpm（`npm` / `yarn` は使わない）

## 必要環境

- Node.js 24.16.0 以上 25 未満（`.nvmrc` に固定バージョンあり）
- pnpm 11.5.2 以上 12 未満

## 開発

```bash
pnpm install
pnpm run dev
```

開発サーバーは LAN に公開されるため、同じ Wi-Fi 内のスマートフォンから `http://<PCのIP>:5173` で表示を確認できる。
ただし HTTP の IP アクセスでは Service Worker が登録されないため、ホーム画面追加・オフライン動作は開発サーバー経由では確認できない。

## スクリプト

| コマンド | 内容 |
| --- | --- |
| `pnpm run dev` | 開発サーバーを起動 |
| `pnpm run build` | 型チェック（`tsc -b`）と本番ビルド |
| `pnpm run preview` | ビルド成果物をローカルで確認（PWA の動作確認はこちら） |
| `pnpm run lint` | oxlint を実行 |
| `pnpm run format` | Prettier で整形 |
| `pnpm run format:check` | Prettier の整形チェック |

## ディレクトリ構成

```
src/
├── components/  # 画面部品（AddExpenseModal / ExpenseList / SummaryBar など）
├── hooks/       # useExpenses（記録の取得・操作）/ useExpenseFilters（絞り込み・並び順）
├── lib/         # 純粋関数（集計・整形・日付・月・バリデーション・フィルタ・並び替え）と、記録ストア・保存処理
└── types/       # 型定義
```
