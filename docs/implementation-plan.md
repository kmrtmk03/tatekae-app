# 立て替え管理 PWA 実装フロー

## 1. プロジェクト概要

立て替えたお金を記録・管理するための個人向け PWA。
スマートフォンのホーム画面から起動し、オフラインでも記録・閲覧ができることを目指す。

| 項目 | 内容 |
| --- | --- |
| アプリ名 | tatekae-app（立て替え管理） |
| 形態 | PWA（インストール可能・オフライン動作） |
| フレームワーク | Vite + React |
| 言語 | TypeScript（推奨。JavaScript でも可） |
| データ保存 | 第1段階: localStorage / 第2段階: Firebase Firestore |
| 対象ユーザー | 主に自分ひとり（将来的に複数端末で同期） |

---

## 進捗状況（引き継ぎ用・2026-09-21時点）

他セッションへの引き継ぎ用に、着手済み/未着手を記録する。作業を再開する際はこの節を更新すること。

| Phase | 状態 | 備考 |
| --- | --- | --- |
| Phase 0: プロジェクト初期化 | ✅ 完了 | |
| Phase 1: 型とデータ層 | ✅ 完了 | |
| Phase 2: 入力フォーム（F-01） | ✅ 完了 | |
| Phase 3: 一覧表示・清算チェック・削除（F-02, F-03, F-05） | ⬜ 未着手 | |
| Phase 4: 未清算合計の表示（F-04） | ⬜ 未着手 | |
| Phase 5: スタイリングと UX | ⬜ 未着手 | |
| Phase 6: PWA 化（F-07） | ✅ 完了 | ユーザー指示によりPhase 1〜5より先に実施 |
| Phase 7: デプロイ | ⬜ 未着手 | |
| Phase 8: 追加機能（MVP後） | ⬜ 未着手 | |
| Phase 9: Firebase への移行準備 | ⬜ 未着手 | |

### 当初計画からの変更点

- **パッケージマネージャー**: npm ではなく **pnpm** に統一済み（`pnpm-lock.yaml` が正、`package-lock.json` は削除済み）。以降のコマンドは `pnpm install` / `pnpm run dev` などを使うこと。
- **Lint/フォーマッタ**: 当初想定の Prettier + ESLint ではなく、`npm create vite@latest` 最新版が標準採用する **oxlint**（`.oxlintrc.json`）になっている。`pnpm run lint` で実行可能。
- **技術スタック**: React は 18+ 想定だったが、実際にインストールされたのは **React 19系**。

### Phase 0 完了内容
- Vite + React + TypeScript でスキャフォールド、サンプル（ロゴ・カウンタ・デフォルトCSS）は削除済み
- `pnpm run dev` / `pnpm run build` / `pnpm run lint` 動作確認済み

### Phase 1 完了内容
- `src/types/expense.ts`: `Expense` 型を定義（計画の3.1節どおり）
- `src/lib/storage.ts`: `loadExpenses` / `saveExpenses` を実装
  - `localStorage` キーは `tatekae-app/expenses/v1`、`{ version, expenses }` の形で保存
  - JSON パース失敗・`expenses` が配列でない・要素の形が不正な場合は空配列にフォールバック（型ガード `isExpense` で要素単位に検証）
  - `saveExpenses` は例外を握りつぶさず呼び出し元（`useExpenses`）に伝播させる設計
- `src/lib/summary.ts`: `sumUnsettled` / `sumAll` を副作用なしの純粋関数として実装
- `src/lib/format.ts`: `formatAmount`（`¥12,345`）/ `formatDate`（`9/21(月)` 形式、タイムゾーンずれを避けるためローカル日時で組み立て）を実装
- `src/hooks/useExpenses.ts`: `useState(() => loadExpenses())` で遅延初期化し、`addExpense` / `updateExpense` / `toggleSettled` / `removeExpense` を提供。`useEffect` で state 変更のたびに `saveExpenses` を呼び、保存失敗時は `saveError` に文言をセットする（非機能要件「保存失敗時はユーザーに知らせる」への布石。実際の画面表示は Phase 2 以降で行う）
- **検証結果**:
  - `pnpm install` 実行後 `pnpm run build`（`tsc -b && vite build`）が成功することを確認
  - `pnpm run lint`（oxlint）を実行し、エラーなし。`useExpenses.ts` の `useEffect` 内 `setState` について `react(set-state-in-effect)` の**警告**が1件出るが、計画書どおり「state が変わるたびに `useEffect` で `saveExpenses` を呼ぶ」設計を意図的に採用しているため許容（exit code 0、ビルドは阻害しない）
  - `node --experimental-strip-types` で `storage.ts` / `summary.ts` / `format.ts` を直接実行するスモークテストを実施し、保存→読み込み一致、`sumUnsettled` / `sumAll` の計算値、`formatAmount` / `formatDate` の出力、不正JSON・不正な形のデータに対するフォールバック（空配列）をすべて確認
  - `pnpm run dev` + Playwright(Chromium) で `useExpenses` を一時的に `App.tsx` に組み込み、ブラウザ上で `addExpense` → `toggleSettled` → `removeExpense` を実行し、`localStorage` の中身が都度正しく更新されること（`settled: false → true`、削除後は `expenses: []`）を確認。確認後 `App.tsx` は Phase 0 時点のプレースホルダーに戻し、デバッグ用コードは残していない
  - Vitest 等の自動テストは未導入（計画上も任意）。上記は手動スモークテストであり、自動テストとしては**未整備**

### Phase 2 完了内容
- `src/components/ExpenseForm.tsx`: 日付・項目名・金額の入力フォーム
  - 日付: `input[type="date"]`、初期値は当日（ローカル日時から組み立て、タイムゾーンずれを回避）
  - 項目名: `input[type="text"]`、金額: `input[type="number"] inputMode="numeric"`
  - バリデーション: 項目名が空、または金額が数値でない/0以下の場合は登録不可とし、各入力欄の下に `role="alert"` でエラー文言を表示
  - 送信後: 項目名・金額をクリアし日付は保持、項目名の入力欄に `useRef` でフォーカスを戻す
  - `<form onSubmit>` で扱っているため Enter キーでも送信可能
- `src/App.tsx`: `useExpenses` と `ExpenseForm` を接続し、`saveError` があれば `role="alert"` で表示
  - 登録済みデータの一覧は **仮実装**（`<ul>` で日付・項目名・金額を並べるだけ）。正式な `ExpenseList` / `ExpenseItem`（並び順・清算チェック・削除・0件表示など）は Phase 3 で置き換える
- **検証結果**:
  - `pnpm run build` / `pnpm run lint` 成功（既知の `set-state-in-effect` 警告のみ、Phase 1から変化なし）
  - `pnpm run dev` + Playwright(Chromium) で以下をブラウザ上で確認
    - 未入力のまま送信 → 「項目名を入力してください」エラーが出て追加されない
    - 金額 `0` で送信 → 「金額は1円以上の数値を入力してください」エラーが出て追加されない
    - 正常入力で送信 → 一覧に反映され、項目名・金額欄はクリア、日付は保持、フォーカスが項目名に戻る
    - リロード後も登録したデータが残る（`localStorage` 経由で永続化されていることを確認）
  - スクリーンショットをユーザーに送付し目視確認済み

### Phase 6 完了内容
- `vite-plugin-pwa` 導入、`registerType: 'autoUpdate'` で設定
- アイコン生成済み（`public/icon-192.png`, `public/icon-512.png` = purpose `any maskable`, `public/apple-touch-icon.png`）。画像変換ツールが無い環境だったため Node の `zlib` のみで自前PNG生成（シンプルな「¥」マーク）
- `index.html` に `theme-color` / `apple-mobile-web-app-*` / `viewport-fit=cover` を追加
- `pnpm run build` で `manifest.webmanifest` / `sw.js` / `workbox-*.js` の生成を確認
- `pnpm run preview` + Playwright(Chromium) で Service Worker が `activated` になること、オフラインでもページが表示されることを実機相当で確認
- **未検証**: 実機のホーム画面への追加、Lighthouse の PWA 監査（ツール未実行）

### 次にやること
- Phase 3（一覧表示・清算チェック・削除: `ExpenseList.tsx` / `ExpenseItem.tsx`）から再開する
- `App.tsx` の一覧表示は仮実装（`<ul>` のみ）なので、Phase 3 で正式なコンポーネントに置き換える

---

## 2. 要件整理

### 2.1 機能要件（MVP）

| ID | 機能 | 内容 |
| --- | --- | --- |
| F-01 | 記録の追加 | 日付・項目名・金額を入力して登録する |
| F-02 | 記録の一覧表示 | 登録済みの記録を日付順に並べて表示する |
| F-03 | 清算状態の管理 | 各記録にチェックマークを持ち、清算済み / 未清算を切り替える |
| F-04 | 未清算合計の表示 | 未清算の記録の合計金額を常に画面上部で確認できる |
| F-05 | 記録の削除 | 誤登録した記録を削除できる |
| F-06 | 永続化 | ブラウザを閉じてもデータが残る（localStorage） |
| F-07 | PWA 化 | ホーム画面に追加でき、オフラインでも起動できる |

### 2.2 追加要件（MVP 後）

- 記録の編集（日付・項目名・金額の修正）
- フィルタ（すべて / 未清算のみ / 清算済みのみ）
- 月別のグルーピングと月ごとの小計
- 「まとめて清算済みにする」一括操作
- データのエクスポート / インポート（JSON）
- Firebase Authentication + Firestore による複数端末同期

### 2.3 非機能要件

- スマートフォン縦画面を第一に考えたレイアウト（レスポンシブ）
- 入力は最小手数で完了する（日付はデフォルトで今日）
- 金額は3桁区切りで表示し、読み違えを防ぐ
- データ消失を避けるため、保存失敗時はユーザーに知らせる
- 依存ライブラリは最小限に保つ

---

## 3. データモデル設計

### 3.1 Expense（立て替え記録）

```ts
export type Expense = {
  /** 一意のID。crypto.randomUUID() で生成 */
  id: string;
  /** 立て替えた日付。'YYYY-MM-DD' 形式（input[type="date"] と同じ） */
  date: string;
  /** 項目名。例: 「飲み会代」「新幹線チケット」 */
  title: string;
  /** 金額（円）。整数の正の数のみ */
  amount: number;
  /** 清算済みなら true */
  settled: boolean;
  /** 作成日時。ISO 8601 文字列。並び順の補助に使う */
  createdAt: string;
};
```

#### 設計上の判断

- **日付は文字列で持つ**: `Date` オブジェクトは JSON 化で型が落ちるため、`'YYYY-MM-DD'` の文字列で統一する。文字列のままソートでき、`input[type="date"]` の値をそのまま使える。
- **金額は数値で持つ**: 表示時にだけ `toLocaleString()` で整形する。文字列で持つと合計計算のたびにパースが必要になる。
- **`settled` は真偽値**: 将来「いつ清算したか」を持ちたくなったら `settledAt?: string` を追加する（後方互換のため optional にする）。
- **`id` は端末側で生成**: Firebase に移行してもそのままドキュメント ID として使える。

### 3.2 localStorage の保存形式

```jsonc
// key: "tatekae-app/expenses/v1"
{
  "version": 1,
  "expenses": [ /* Expense[] */ ]
}
```

- キーにバージョンを含め、将来スキーマを変えたときに移行処理を書けるようにする。
- 配列を直に保存せずオブジェクトで包み、後からメタ情報を足せるようにする。

---

## 4. 技術スタック

| 分類 | 採用 | 理由 |
| --- | --- | --- |
| ビルド | Vite | 起動が速く、PWA プラグインが充実 |
| UI | React 18+（実際は19系を採用） | 要件どおり |
| 言語 | TypeScript | データ構造が明確な本アプリと相性が良い |
| PWA | `vite-plugin-pwa` | manifest 生成と Service Worker 生成を任せられる（導入済み） |
| パッケージ管理 | pnpm | リモートで先行導入されたため統一（当初は npm 想定） |
| 状態管理 | React の `useState` + Context | 規模が小さく、外部ライブラリは不要 |
| スタイル | CSS Modules | 追加依存なしでスコープが分かれる |
| フォーマッタ | oxlint | 最新の Vite テンプレートに同梱（当初想定の Prettier + ESLint から変更） |
| テスト | Vitest（任意） | 集計ロジックの単体テストに使う |

---

## 5. ディレクトリ構成

```
tatekae-app/
├── public/
│   ├── icon-192.png
│   ├── icon-512.png
│   └── apple-touch-icon.png
├── src/
│   ├── components/
│   │   ├── ExpenseForm.tsx        # 入力フォーム
│   │   ├── ExpenseList.tsx        # 一覧のコンテナ
│   │   ├── ExpenseItem.tsx        # 1行（チェック・削除）
│   │   ├── SummaryBar.tsx         # 未清算合計の表示
│   │   └── FilterTabs.tsx         # 表示フィルタ（MVP後）
│   ├── hooks/
│   │   └── useExpenses.ts         # CRUD と永続化をまとめる
│   ├── lib/
│   │   ├── storage.ts             # localStorage の読み書き（差し替え対象）
│   │   ├── format.ts              # 金額・日付の整形
│   │   └── summary.ts             # 合計計算などの純粋関数
│   ├── types/
│   │   └── expense.ts             # Expense 型
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── docs/
│   └── implementation-plan.md     # このファイル
├── index.html
├── vite.config.ts
├── package.json
└── README.md
```

**方針**: 「保存先に依存する処理」を `lib/storage.ts` の1ファイルに閉じ込める。
コンポーネントは `useExpenses` 経由でしかデータに触らないため、Firebase 移行時に書き換えるのはこの2ファイルだけで済む。

---

## 6. 実装フェーズ

### Phase 0: プロジェクト初期化 ✅ 完了

1. Vite プロジェクトを作成する
   ```bash
   npm create vite@latest . -- --template react-ts
   npm install
   ```
2. `npm run dev` で起動を確認する
3. テンプレートの不要なサンプル（ロゴ、カウンタ、デフォルト CSS）を削除する
4. `.gitignore` に `node_modules` / `dist` が入っていることを確認する
5. 初回コミット

**完了条件**: 空の画面が `localhost:5173` で表示される

---

### Phase 1: 型とデータ層

1. `src/types/expense.ts` に `Expense` 型を定義する
2. `src/lib/storage.ts` を実装する
   - `loadExpenses(): Expense[]` — 読み込み。JSON パース失敗や不正な形は空配列にフォールバックする
   - `saveExpenses(expenses: Expense[]): void` — 保存。容量超過などの例外を握りつぶさず呼び出し元に返す
3. `src/lib/summary.ts` を実装する
   - `sumUnsettled(expenses: Expense[]): number`
   - `sumAll(expenses: Expense[]): number`
   - いずれも副作用のない純粋関数にして、後でテストしやすくする
4. `src/lib/format.ts` を実装する
   - `formatAmount(n: number): string` — `¥12,345`
   - `formatDate(iso: string): string` — `9/21(日)` など読みやすい形
5. `src/hooks/useExpenses.ts` を実装する
   - 初期化時に `loadExpenses()` を呼ぶ
   - `addExpense` / `toggleSettled` / `removeExpense` / `updateExpense` を提供する
   - state が変わるたびに `saveExpenses()` を呼ぶ（`useEffect`）

**完了条件**: ブラウザのコンソールから hook 経由で追加・取得ができる

**注意点**:
- `useState` の初期値に関数を渡す遅延初期化（`useState(() => loadExpenses())`）を使い、毎レンダリングで localStorage を読まないようにする
- 保存の `useEffect` は初回マウント時にも走るが、読み込んだ値をそのまま書き戻すだけなので実害はない

---

### Phase 2: 入力フォーム（F-01）

1. `ExpenseForm.tsx` を作る
   - 日付: `<input type="date">`、初期値は今日
   - 項目名: `<input type="text">`
   - 金額: `<input type="number" inputMode="numeric">`
2. バリデーション
   - 項目名が空 → 登録不可
   - 金額が 0 以下 / 数値でない → 登録不可
   - エラーは入力欄の下に文言で表示する
3. 送信後の挙動
   - 項目名と金額をクリアする
   - 日付は残す（同じ日に連続入力することが多いため）
   - 項目名の入力欄にフォーカスを戻す
4. `<form onSubmit>` で扱い、Enter キーでも送信できるようにする

**完了条件**: 入力して登録するとリロード後もデータが残る

---

### Phase 3: 一覧表示と清算チェック（F-02, F-03, F-05）

1. `ExpenseList.tsx` — 配列を受け取り `ExpenseItem` を並べる
   - 並び順は日付の降順（新しいものが上）、同日なら `createdAt` の降順
   - 0件のときは「まだ記録がありません」と表示する
2. `ExpenseItem.tsx` — 1行の表示
   - チェックボックス / 項目名 / 日付 / 金額 / 削除ボタン
   - 清算済みの行は文字色を薄くし、項目名に取り消し線を引く
   - 削除は確認ダイアログを挟む（誤タップ対策）
3. チェックボックスは `<input type="checkbox">` を使う
   - `<div>` に `onClick` を付けるのではなく、ネイティブ要素を使ってキーボード操作とスクリーンリーダーに対応する
   - ラベルと結びつけ、タップ領域を十分に確保する（44px 以上）

**完了条件**: チェックを付け外しでき、その状態がリロード後も保たれる

---

### Phase 4: 未清算合計の表示（F-04）

1. `SummaryBar.tsx` を作る
   - 未清算の合計金額を大きく表示する（このアプリの主役）
   - 補助情報として未清算の件数、清算済みを含む総額を小さく添える
2. 画面上部に固定する（`position: sticky; top: 0;`）
   - スクロールしても常に見えるようにする
3. 合計は `useMemo` で計算し、リスト操作のたびの再計算を抑える

**完了条件**: チェックを付けると合計金額が即座に減る

---

### Phase 5: スタイリングと UX

1. 全体のレイアウト
   - 最大幅 480px 程度の1カラム、中央寄せ
   - 上: サマリー / 中: リスト / 下: 入力フォーム（親指が届く位置）
2. カラー設計
   - 未清算は目立つ色、清算済みはグレー系
   - ダークモード対応（`prefers-color-scheme`）
3. セーフエリア対応
   - `viewport-fit=cover` と `env(safe-area-inset-bottom)` で iPhone のホームバーに被らないようにする
4. 細かな操作感
   - 追加・削除時のアニメーション
   - 削除の取り消し（Undo）トースト（任意）

**完了条件**: スマートフォンの実機で片手操作ができる

---

### Phase 6: PWA 化（F-07） ✅ 完了

1. プラグインを導入する
   ```bash
   npm install -D vite-plugin-pwa
   ```
2. `vite.config.ts` に設定を追加する
   - `registerType: 'autoUpdate'`
   - manifest: `name` / `short_name` / `theme_color` / `background_color` / `display: 'standalone'` / `start_url: '/'` / `icons`
3. アイコンを用意する（192px, 512px, maskable, apple-touch-icon）
4. `index.html` に `theme-color` と `apple-mobile-web-app-capable` を追加する
5. `npm run build && npm run preview` で検証する
   - Chrome DevTools の Application タブで manifest と Service Worker を確認する
   - Lighthouse の PWA 監査を通す
6. オフライン動作を確認する（DevTools の Offline にして再読み込み）

**完了条件**: ホーム画面に追加でき、機内モードでも起動して記録を閲覧・追加できる

**注意点**: 開発サーバーでは Service Worker の挙動が本番と異なる。必ず `preview` でビルド成果物を確認する。

---

### Phase 7: デプロイ

1. ホスティング先を決める（Vercel / Netlify / Firebase Hosting / GitHub Pages）
   - 将来 Firebase を使うなら Firebase Hosting に寄せると管理先が1つで済む
2. GitHub リポジトリと連携し、push で自動デプロイされるようにする
3. HTTPS で配信されることを確認する（PWA の必須条件）
4. サブディレクトリに置く場合は `vite.config.ts` の `base` と manifest の `start_url` / `scope` を合わせる

**完了条件**: 公開 URL をスマートフォンで開き、ホーム画面に追加できる

---

### Phase 8: 追加機能（MVP 後）

優先度順:

1. **フィルタ（すべて / 未清算 / 清算済み）** — 記録が増えると必須になる
2. **記録の編集** — 金額の打ち間違いを直せるようにする
3. **月別グルーピング** — 月ごとの見出しと小計を出す
4. **一括清算** — 「未清算をすべて清算済みにする」
5. **エクスポート / インポート** — Firebase 移行前のデータ退避手段として先に作っておくと安全

---

### Phase 9: Firebase への移行準備

#### 移行を楽にするための設計

Phase 1 の時点で、コンポーネントが `localStorage` を直接触らないようにしておく。
データアクセスは次の形に統一する。

```ts
// src/lib/storage.ts が公開するインターフェース
export interface ExpenseRepository {
  list(): Promise<Expense[]>;
  add(expense: Expense): Promise<void>;
  update(id: string, patch: Partial<Expense>): Promise<void>;
  remove(id: string): Promise<void>;
}
```

localStorage 実装でも **戻り値を `Promise` にしておく**のが要点。
同期的な API で作ってしまうと、Firebase に差し替えるときに全コンポーネントの呼び出し側を非同期対応に書き換えることになる。

#### 移行の手順

1. Firebase プロジェクトを作成し、Firestore を有効化する
2. Firebase Authentication（匿名認証 または Google ログイン）を導入する
3. `FirestoreExpenseRepository` を `ExpenseRepository` の実装として追加する
   - コレクション構成: `users/{uid}/expenses/{expenseId}`
4. `useExpenses` が使う Repository を差し替える（環境変数で切り替えられるようにする）
5. 初回ログイン時に localStorage のデータを Firestore へ移行する処理を1度だけ走らせる
6. Firestore のセキュリティルールを設定する（自分のデータしか読み書きできないようにする）
   ```
   match /users/{uid}/expenses/{doc} {
     allow read, write: if request.auth != null && request.auth.uid == uid;
   }
   ```
7. オフライン永続化を有効にする（`enableIndexedDbPersistence`）ことで PWA のオフライン要件を維持する

#### 注意点

- Firebase の設定値（API キーなど）は `.env` に置き、`VITE_` プレフィックスを付ける
- `.env` は `.gitignore` に追加し、`.env.example` だけをコミットする
- Firestore の API キーはクライアントに露出する前提の値だが、**セキュリティルールの設定は必須**。ルールを書かないままだと誰でも全データを読める状態になる

---

## 7. 実装順のまとめ

```
Phase 0  環境構築
   ↓
Phase 1  型・localStorage・集計ロジック・useExpenses   ← ここを丁寧に作ると後が楽
   ↓
Phase 2  入力フォーム
   ↓
Phase 3  一覧表示・清算チェック・削除
   ↓
Phase 4  未清算合計の表示                              ← ここで MVP が動く
   ↓
Phase 5  スタイリング
   ↓
Phase 6  PWA 化
   ↓
Phase 7  デプロイ
   ↓
Phase 8  フィルタ・編集・月別集計など
   ↓
Phase 9  Firebase 移行
```

Phase 4 を終えた時点で「立て替えを記録して未清算合計が見える」という当初の目的は満たせる。
まずはそこまでを一区切りとして動かし、実際に使いながら Phase 5 以降を進めるのが良い。

---

## 8. チェックリスト

### MVP
- [x] Vite + React プロジェクトが起動する
- [x] `Expense` 型を定義した
- [x] localStorage の読み書きができる
- [x] 日付・項目名・金額を入力して登録できる
- [x] 入力値のバリデーションが効く
- [ ] 一覧が日付の降順で表示される（現状は仮の`<ul>`で登録順表示。Phase 3で対応）
- [ ] チェックで清算済みを切り替えられる
- [ ] 記録を削除できる
- [ ] 未清算合計が画面上部に表示される
- [ ] リロードしてもデータが残る

### PWA
- [x] manifest.json が生成されている
- [x] アイコン（192 / 512 / maskable）を用意した
- [x] Service Worker が登録される
- [x] オフラインで起動できる
- [ ] ホーム画面に追加できる（未検証: 実機での確認が必要）
- [ ] Lighthouse の PWA 監査を通る（未実行）

### 公開
- [ ] HTTPS でデプロイされている
- [ ] スマートフォン実機で動作を確認した

### Firebase 移行（将来）
- [ ] データアクセスが Repository 経由に統一されている
- [ ] Repository のメソッドが Promise を返す
- [ ] `.env` が `.gitignore` に入っている
- [ ] Firestore のセキュリティルールを設定した
- [ ] localStorage からの移行処理を用意した
