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
| データ保存 | localStorage |
| 対象ユーザー | 主に自分ひとり |

---

## 進捗状況（引き継ぎ用・2026-10-09時点）

他セッションへの引き継ぎ用に、着手済み/未着手を記録する。作業を再開する際はこの節を更新すること。

| Phase | 状態 | 備考 |
| --- | --- | --- |
| Phase 0: プロジェクト初期化 | ✅ 完了 | |
| Phase 1: 型とデータ層 | ✅ 完了 | |
| Phase 2: 入力フォーム（F-01） | ✅ 完了 | |
| Phase 3: 一覧表示・清算チェック・削除（F-02, F-03, F-05） | ✅ 完了 | |
| Phase 4: 未清算合計の表示（F-04） | ✅ 完了 | |
| Phase 5: スタイリングと UX | ✅ 完了 | ユーザー指示によりPhase 4より先に実施。アニメーション/Undoトースト（任意項目）は未実施 |
| Phase 6: PWA 化（F-07） | ✅ 完了 | ユーザー指示によりPhase 1〜5より先に実施 |
| Phase 8: 追加機能（MVP後） | 🔧 作業中 | フィルタ・記録の編集・月フィルタが完了。月別グルーピング（小計）/一括清算/エクスポート・インポートは未着手 |
| リファクタリング第2弾 | 🔧 作業中 | ブランチ `refactor/item-id-and-update-type`。A-2・A-4 完了、A-1・A-3・B・C・D は未着手（下記「リファクタリング第2弾」参照） |

### 当初計画からの変更点

- **パッケージマネージャー**: npm ではなく **pnpm** に統一済み（`pnpm-lock.yaml` が正、`package-lock.json` は削除済み）。以降のコマンドは `pnpm install` / `pnpm run dev` などを使うこと。
- **Lint/フォーマッタ**: Lint は当初想定の ESLint ではなく、`npm create vite@latest` 最新版が標準採用する **oxlint**（`.oxlintrc.json`）になっている。`pnpm run lint` で実行可能。フォーマッタは当初いったん未導入だったが、リファクタリング時に **Prettier** を導入（下記「リファクタリング」参照）。
- **技術スタック**: React は 18+ 想定だったが、実際にインストールされたのは **React 19系**。
- **Phase 7（デプロイ）・Phase 9（Firebase への移行準備）をプランから削除**: 方針変更のため、ユーザー指示により一旦削除（2026-10-07）。進捗表・第6章の詳細・第7章のフロー図・第8章のチェックリスト（公開 / Firebase 移行）から取り除いた。あわせて Firebase 関連の記述（データ保存の第2段階、複数端末同期の要件など）も削除し、データ保存は localStorage のみとした。再開する場合は改めて計画を立て直す
- **開発サーバーの LAN 公開**: 実機（iPhone）確認のため、`vite.config.ts` に `server.host: true` を追加。`pnpm run dev` で `http://<PCのIP>:5173`（同じ Wi-Fi 内）から開ける。確認はPC側で LAN IP 宛の HTTP 200 まで（実機での表示は未確認）。HTTP の IP アクセスは「安全なコンテキスト」ではないため、Service Worker（PWA）は登録されず、ホーム画面追加・オフライン動作は開発サーバー経由では確認できない
- **ツールのバージョン固定**: `package.json` に `"packageManager": "pnpm@11.5.2"` と `engines`（node `>=24.16.0 <25` / pnpm `>=11.5.2 <12`）、ルートに `.nvmrc`（`24.16.0`）を追加。固定値は作業環境（Node v24.16.0 / pnpm 11.5.2）に合わせた。

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

### Phase 3 完了内容
- `src/components/ExpenseList.tsx`: 記録一覧のコンテナ
  - 並び順は日付の降順、同日なら `createdAt` の降順（`compareExpenses` で比較）
  - 0件のときは「まだ記録がありません」を表示
- `src/components/ExpenseItem.tsx`: 1行の表示
  - `<input type="checkbox">`（ネイティブ要素、`<label htmlFor>` で結びつけ）で清算済み切り替え
  - 清算済みの行は取り消し線＋グレー表示（`ExpenseItem.module.css`）
  - 削除は `window.confirm` で確認してから実行（誤タップ対策。追加の依存ライブラリなしで実現）
  - タップ領域確保のため `.checkboxLabel` に `min-width/min-height: 44px` を設定（Phase 3 の要件としてここで対応。Phase 5 は全体レイアウト・配色・ダークモードなどを扱う）
- `src/App.tsx`: 仮実装だった `<ul>` を `ExpenseList` に置き換え、`toggleSettled` / `removeExpense` を接続
- **検証結果**:
  - `pnpm run build` / `pnpm run lint` 成功（既知の `set-state-in-effect` 警告のみ）
  - `pnpm run dev` + Playwright(Chromium) で以下を確認
    - 0件時に「まだ記録がありません」が表示される
    - 日付の異なる記録を追加すると新しい日付が上に表示される（降順）
    - チェックを入れると `settled` クラスが付与され取り消し線・グレー表示になり、チェック状態はリロード後も保持される
    - 削除ボタン → 確認ダイアログで承認すると削除される／キャンセルすると削除されない（両方確認）
    - 全件削除すると「まだ記録がありません」表示に戻る
  - スクリーンショットをユーザーに送付し目視確認済み

### Phase 4 完了内容
- `src/components/SummaryBar.tsx`: 未清算合計の表示
  - `sumUnsettled` / `sumAll`（`lib/summary.ts`）と未清算件数を `useMemo` で計算し、リスト操作のたびの再計算を抑制
  - 未清算合計を大きく強調表示、補助情報として「未清算n件・総額（清算済み含む）」を小さく併記
- `src/App.tsx`: `SummaryBar` をヘッダー内（タイトル直下）に配置し、ヘッダーごと `position: sticky; top: 0` で画面上部に固定（Phase 5 で作ったヘッダーのsticky構造にそのまま乗せる形。ヘッダー下部の余白は `SummaryBar` 側の `padding-bottom` に統一）
- **検証結果**:
  - `pnpm run build` / `pnpm run lint` 成功（既知の `set-state-in-effect` 警告のみ）
  - `pnpm run dev` + Playwright(Chromium) で以下を確認
    - 0件時は `¥0` と表示される
    - 記録を追加すると未清算合計・件数・総額がそれぞれ正しく計算される（3件 ¥17,800 → 1件清算済みにすると ¥17,000 に即時反映、総額は¥17,800のまま変わらない）
    - リロード後も正しい未清算合計が表示される（永続化データから再計算されている）
    - 15件登録してスクロールしても `header`（タイトル+SummaryBar）の座標が `y: 0` のまま変化せず、画面上部に固定表示され続けることを確認
  - スクリーンショットをユーザーに送付し目視確認済み

### Phase 5 完了内容（ユーザー指示によりPhase 4より先に実施）
- デザイントークンを `src/index.css` に集約（`:root` のCSSカスタムプロパティ）。色・角丸・影・セーフエリアの値を一元管理し、`@media (prefers-color-scheme: dark)` でダークモード用に上書き
- 全体レイアウト（`src/App.module.css` / `App.tsx`）
  - 最大幅480pxの1カラム中央寄せ、`100dvh` でフル高さ
  - ヘッダー（タイトル）を上部固定、一覧をスクロール領域、入力フォームを画面下部に固定（親指が届く位置）
  - `env(safe-area-inset-top / bottom)` でノッチ・ホームバーとの重なりを回避
- カラー設計: 未清算の金額はプライマリカラー（インディゴ）で強調、清算済みは行全体をグレーアウト＋項目名に取り消し線（既存のPhase 3実装を踏襲）
- コンポーネントのモダン化
  - `ExpenseForm`: カード的な入力欄（角丸・フォーカスリング）、項目名を全幅、日付・金額を2カラムのグリッドに再配置、送信ボタンをプライマリカラーの全幅ボタンに
  - `ExpenseList` / `ExpenseItem`: 一覧をカード型（角丸・影）に変更、削除ボタンは「×」アイコン＋`aria-label`、タップ領域44px以上を維持
- **未実施（計画上も任意項目）**: 追加・削除時のアニメーション、削除の取り消し（Undo）トースト
- **検証結果**:
  - `pnpm run build` / `pnpm run lint` 成功（既知の `set-state-in-effect` 警告のみ）
  - `pnpm run dev` + Playwright(Chromium) で 390×844（スマートフォン相当のビューポート）にて light / dark 両方の `colorScheme` でスクリーンショットを撮影し目視確認
  - デザイン変更後に既存機能（バリデーションエラー表示、登録、削除ボタン、0件表示）が壊れていないことをPlaywrightで再確認
  - **未検証**: 実機での片手操作の確認（Phase 5の完了条件だが、シミュレータ環境のため実施できていない）

### Phase 6 完了内容
- `vite-plugin-pwa` 導入、`registerType: 'autoUpdate'` で設定
- アイコン生成済み（`public/icon-192.png`, `public/icon-512.png` = purpose `any maskable`, `public/apple-touch-icon.png`）。画像変換ツールが無い環境だったため Node の `zlib` のみで自前PNG生成（シンプルな「¥」マーク）
- `index.html` に `theme-color` / `apple-mobile-web-app-*` / `viewport-fit=cover` を追加
- `pnpm run build` で `manifest.webmanifest` / `sw.js` / `workbox-*.js` の生成を確認
- `pnpm run preview` + Playwright(Chromium) で Service Worker が `activated` になること、オフラインでもページが表示されることを実機相当で確認
- **未検証**: 実機のホーム画面への追加、Lighthouse の PWA 監査（ツール未実行）

### Phase 8 完了内容（フィルタ機能のみ・ユーザー指示によりPhase 7より先に実施）
- `src/components/FilterTabs.tsx`: 「すべて / 未清算 / 清算済み」の3択セグメントコントロール（`role="tablist"` / `role="tab"` / `aria-selected` で実装）。`ExpenseFilter` 型（`"all" | "unsettled" | "settled"`）をこのファイルからエクスポートし `App.tsx` で共有
- `src/App.tsx`: フィルタ状態を `useState`（初期値 `"all"`）で管理し、`useMemo` でフィルタ後の一覧を計算して `ExpenseList` に渡す
  - `SummaryBar` には常に**全件**の `expenses` を渡し、未清算合計・総額はフィルタの影響を受けない設計（「未清算の合計金額を常に確認できる」という F-04 の要件を優先）
  - フィルタ結果が0件のとき、記録自体が0件の場合は「まだ記録がありません」、フィルタで絞り込んだ結果が0件の場合は「該当する記録がありません」を出し分け（`ExpenseList` に `emptyMessage` propを追加）
  - `FilterTabs` はヘッダー内（タイトル・`SummaryBar` の下）に配置し、ヘッダーごと画面上部に固定
- **検証結果**:
  - `pnpm run build` / `pnpm run lint` 成功（既知の `set-state-in-effect` 警告のみ）
  - `pnpm run dev` + Playwright(Chromium) で以下を確認
    - すべて/未清算/清算済みタブそれぞれで表示件数が正しく絞り込まれる
    - 清算済みタブで該当0件のとき「該当する記録がありません」と表示される
    - 清算済みタブを表示中でもヘッダーの未清算合計は絞り込みに関係なく全件基準の値のまま
  - スクリーンショット（すべて/未清算/清算済みの3状態）をユーザーに送付し目視確認済み
- **未実施**: フィルタの選択状態はページリロードで初期値（すべて）に戻る（永続化していない。計画上も要件になし）

### Phase 8 完了内容（記録の編集・ユーザー指示により追加実施）
- `src/lib/validation.ts`: `validateExpenseInput(title, amount)` を新設し、`ExpenseForm` と編集モーダルで同一のバリデーションロジック（項目名必須・金額1円以上）を共有するようリファクタリング
- `src/components/EditExpenseModal.tsx`: 日付・項目名・金額をまとめて編集できるモーダル
  - 一覧の各行に追加した「✎」編集ボタン（`ExpenseItem.tsx`、`aria-label` 付き）から開く
  - 開いた時点の値をフォームに事前入力し、保存ボタンで `useExpenses` の `updateExpense(id, patch)` を呼ぶ。バリデーションエラー時は保存されずモーダルも閉じない
  - 閉じ方は3通り：キャンセルボタン／オーバーレイクリック／Escapeキー（いずれも変更を破棄）。`role="dialog"` / `aria-modal="true"` を設定
  - フィールドのスタイルは `ExpenseForm.module.css` を共用（見た目の一貫性のため）
- **バグ修正（ついでに対応）**: `ExpenseForm.module.css` の `.input` に `width: 100%` / `min-width: 0` が無く、横幅が狭いコンテナ（編集モーダル内）に置いたときに入力欄が画面外にはみ出す問題を発見・修正。`.field` にも `min-width: 0` を追加（flex/gridの子要素がデフォルトで縮まない問題への対応）。通常の追加フォームへの影響がないこともスクリーンショットで確認済み
- **検証結果**:
  - `pnpm run build` / `pnpm run lint` 成功（既知の `set-state-in-effect` 警告のみ）
  - `pnpm run dev` + Playwright(Chromium) で以下を確認
    - 編集ボタンでモーダルが開き、既存の値が正しく事前入力される
    - 項目名を空にして保存するとエラーが表示されモーダルは閉じない
    - 正しい値で保存すると一覧に反映され、モーダルが閉じる。リロード後も編集内容が残る（永続化確認）
    - キャンセルボタン／オーバーレイクリック／Escapeキーのいずれでも変更が破棄されて閉じる
    - CSS修正後、編集モーダル内の金額入力欄が画面内に収まることを座標（bounding box）で確認。通常の追加フォーム・一覧・フィルタ機能に見た目の崩れがないことをスクリーンショットで再確認
  - スクリーンショット（編集モーダルのlight/dark）をユーザーに送付し目視確認済み
- **追記（ユーザー指示による修正）**: 初期実装はモーダルを画面下部に表示（ボトムシート風）していたが、ユーザーから「画面中央がいい」との指示を受け `EditExpenseModal.module.css` の `.overlay` を `align-items: flex-end` から `align-items: center` に変更（`overflow-y: auto` を付与し、パネルがビューポートより高くなる場合もスクロールできるようにした）。Playwrightで座標を計測し垂直方向に正しく中央配置されていること（`(844 - 298) / 2 = 273px` の理論値と一致）、既存の編集フロー（事前入力・バリデーション・保存・3通りの閉じ方）に回帰がないことを再確認
- **追記（レイアウト崩れの修正）**: ユーザーから「追加フォームの日付・金額のレイアウトが崩れている」とスクリーンショット付きで報告あり。画像では日付欄が金額欄より大きく、境界が重なって見える状態だった。`ExpenseForm.module.css` の `.row` を `grid-template-columns: 1fr 1fr` から `grid-template-columns: minmax(0, 1fr) minmax(0, 1fr)` に変更し、グリッドトラックの暗黙的な最小幅（コンテンツに応じた `auto` サイズ）を明示的に0にして、ネイティブの日付/数値入力の内在サイズに引っ張られて列幅が不均等になるのを防止（CSS Gridでの定番の対処法）
  - **検証結果・注意点**: `pnpm run build` / `pnpm run lint` 成功。Playwright(Chromium)でビューポート幅320/360/390/414pxの4パターンにて日付欄・金額欄の実測幅が常に等しく、境界が重ならないことを確認。ただし本セッションの環境には Chromium しかインストールされておらず、**Safari(WebKit)やその他ブラウザでは未検証**。ユーザーの画面写真は日付が「2026/09/21」形式でカレンダーアイコンが見えない表示だったため、Chromiumとは異なるブラウザ（WebKit系など）で発生した可能性がある。またこのアプリはPWA（Service Workerでプリキャッシュ）のため、修正前のビルドがキャッシュされて表示されていた可能性も考えられる。ユーザーに再度確認を依頼
- **追記（iOS Safariでは上記の修正でも直らず・レイアウトを変更）**: ユーザーから「iOS Safariで試したが直っていない」と報告。iOS Safariの `<input type="date">` はCSS Gridでの幅指定（`minmax(0, 1fr)` を含む）を無視し、内部のネイティブ日付ウィジェット自身のレイアウトを優先して列からはみ出すことがある既知の挙動と判断。この環境には検証用のiOS実機・Safari(WebKit)がなく、CSSの微調整では確実性を担保できないため、根本原因を回避する方針に変更
  - `ExpenseForm.tsx` / `EditExpenseModal.tsx`: 日付・金額を2カラムグリッド（`.row`）で横並びにしていたのをやめ、項目名と同様に縦に1カラムで並べる構成に変更。各入力欄が常に画面幅いっぱいを使えるため、ネイティブ日付ウィジェットの最小幅要求と衝突する余地がなくなる
  - `ExpenseForm.module.css`: 不要になった `.row`（グリッド定義）を削除
  - **検証結果**: `pnpm run build` / `pnpm run lint` 成功。Playwright(Chromium)で追加フォーム・編集モーダルの入力〜登録〜バリデーション〜永続化のフローに回帰がないことを再確認。縦並びレイアウトのスクリーンショット（追加フォーム／編集モーダル、ダークモード）をユーザーに送付し目視確認済み
  - **未検証**: 実際のiOS Safariでの表示確認（この環境では検証手段がないため、ユーザーに再度確認を依頼）
- **追記（縦並びにしてもiOS Safariで直らず・入力欄自体のはみ出しと判明）**: ユーザーから実機スクリーンショット付きで「日付欄が画面からはみ出る」と再報告。縦1カラムにしても直っていないことから、原因は列幅の配分ではなく、**日付入力欄そのものがコンテナの `width: 100%` を無視してネイティブ部品の内在幅で描画され、画面右端からはみ出している**ことだと判断（iOS SafariでUAデフォルトスタイルの `<input type="date">` が `width` を十分に尊重しないことがある既知のWebKitの癖）
  - `ExpenseForm.module.css` の `.input` に `-webkit-appearance: none` / `appearance: none`（ネイティブのUAデフォルト装飾をリセットしてブラウザに指定幅を尊重させる、この種の問題への定番対策）、`max-width: 100%`、`overflow: hidden` を追加
  - 保険として、はみ出しが発生してもページ全体が横スクロールしてしまわないよう `App.module.css` の `.formArea` と `EditExpenseModal.module.css` の `.panel` に `overflow-x: hidden` を追加（`.page` 自体に付けると `overflow-x` を非 `visible` にした際に `overflow-y` が暗黙的に `auto` 扱いとなり独立したスクロールコンテナ化してしまう懸念があったため、より限定的な範囲に留めた）
  - **検証結果**: `pnpm run build` / `pnpm run lint` 成功。Playwright(Chromium)で追加フォーム・編集モーダルの入力〜登録〜バリデーション〜永続化のフローに回帰がないこと、日付・金額の入力欄がビューポート幅（390px）内に収まる（bounding boxで実測）ことを確認。カレンダーアイコンの表示もChromiumでは維持されている
  - **未検証・懸念点**: 実際のiOS Safariでの表示確認は引き続きこの環境ではできない。`appearance: none` はブラウザによって `<input type="date">` の見た目（値の表示形式やアイコンの有無）が変わる可能性があり、iOS Safariで意図通りに動くかは未確認。もしこれでも直らない場合は、ネイティブの `<input type="date">` に依存しない自作の日付ピッカー（テキスト入力＋ボタンで `showPicker()` を呼ぶ、または完全に自前のUI）への置き換えが次の選択肢になる

### 追加フォームのモーダル化（ユーザー指示・ブランチ `feat/add-expense-modal`）
- 画面下部に常時固定していた追加フォーム領域（`.formArea`）が広く、一覧が見づらいという指摘を受けて変更。当初計画 Phase 5 の「上: サマリー / 中: リスト / 下: 入力フォーム」のレイアウトから変更した点
- `src/App.tsx`: 画面下部の `ExpenseForm` を削除し、右下に固定した「＋」ボタン（`aria-label="記録を追加"`）を設置。押下で `isAddModalOpen` が true になりモーダルを表示
- `src/components/AddExpenseModal.tsx`（新規）: `ExpenseForm` を画面中央のモーダルで表示。閉じ方は ×ボタン／オーバーレイクリック／Escapeキー（いずれも登録せず破棄）。登録成功時は自動で閉じる。見た目（オーバーレイ・パネル・ヘッダー）は編集モーダルと揃えるため `EditExpenseModal.module.css` を共用
- `src/components/ExpenseForm.tsx`: 項目名の入力欄に `autoFocus` を追加（モーダルを開いた直後にすぐ入力できるようにするため。このフォームの利用箇所はモーダルのみ）
- `src/App.module.css`: `.formArea` を削除し `.addButton` を追加。ボタンは `position: fixed` で最大幅480pxの中央カラムの右端に揃え、一覧の下余白を増やして最後の行がボタンに隠れないようにした
- 仕様上の変化: 以前は登録後もフォームが残り連続入力できたが、今回は登録のたびにモーダルが閉じる（連続で登録する場合は＋ボタンを押し直す）。モーダルは開くたびに作り直されるため日付は常に当日に初期化される
- **検証結果**:
  - `pnpm run build` / `pnpm run lint` 成功（既知の `set-state-in-effect` 警告のみ）
  - `pnpm run dev` + アプリ内ブラウザ（390×844）で以下を確認
    - ＋ボタンが画面右下（右16px・下16px）に表示される。1200px幅でも480pxカラムの右端に揃う
    - 押下でモーダルが開き、パネルが垂直方向中央に配置され、項目名にフォーカスが当たる
    - 未入力のまま登録するとエラー文言が出てモーダルは閉じない
    - 正しい値でEnter送信すると登録されてモーダルが閉じ、未清算合計・一覧・`localStorage` に反映される
    - Escape／オーバーレイクリック／×ボタンのいずれでも閉じ、再度開くと入力欄は空になる
  - **未検証**: 実機（iOS Safari）での表示確認、モーダル表示時のソフトウェアキーボードとの干渉。スクリーンショットでの目視確認は、この環境ではキャプチャ範囲が実ビューポートと合わず取得できなかったため、座標計測（`getBoundingClientRect`）で代替した

### Phase 8 完了内容（月フィルタ・ユーザー指示・ブランチ `feat/month-filter`）
- 月ごとに一覧を絞り込めるようにした。計画の「月別グルーピング（月ごとの見出しと小計）」とは別機能で、グルーピング・小計は引き続き未着手
- `src/lib/month.ts`（新規）: `ALL_MONTHS`（「すべての月」を表す値 `"all"`）、`getMonthKey`（`'YYYY-MM-DD'` → `'YYYY-MM'`。形式が不正なら `null`）、`listMonthKeys`（記録が存在する月を新しい順に重複なしで返す）。副作用のない純粋関数
- `src/lib/format.ts`: `formatMonth`（`'2026-10'` → 「2026年10月」）を追加
- `src/components/MonthFilter.tsx`（新規）: ネイティブの `<select>`。選択肢は「すべての月」＋記録が存在する月のみ。ネイティブ要素にしたのはモバイルで操作しやすく、iOS Safari でも安定するため
- `src/App.tsx`: `selectedMonth` を `useState` で管理。月 → 清算状態の順で絞り込み（`FilterTabs` と併用可）。選択中の月の記録が削除・編集で無くなった場合は、`activeMonth` を派生値として計算し「すべての月」に戻す（`useEffect` で state を書き換えない）
- `SummaryBar` には従来どおり絞り込み前の**全件**を渡し、未清算合計・総額は月フィルタの影響を受けない（F-04「未清算合計を常に確認できる」を優先。月ごとの合計を出す場合は別途検討）
- 配置: タイトル行の右側に置き、ヘッダーの高さを増やさない（`App.module.css` に `.titleRow` を追加）
- 日付の形式が不正な記録は月の選択肢に出ず、「すべての月」でのみ表示される
- **検証結果**:
  - `pnpm run build` / `pnpm run lint` 成功（既知の `set-state-in-effect` 警告のみ）
  - `pnpm run dev` + アプリ内ブラウザ（390×844）で、4件（2026年10月×2、2026年9月×1、2025年12月×1）を投入して確認
    - 選択肢が「すべての月 / 2026年10月 / 2026年9月 / 2025年12月」の順に出る
    - 2026年10月を選ぶと該当2件のみ、さらに「未清算」タブとの併用で1件に絞られる
    - 該当なしの組み合わせ（2025年12月 × 清算済み）では「該当する記録がありません」が出る
    - 月を絞っていてもヘッダーの総額は全件分（¥10,000）のまま
    - 選択中の月（2025年12月）の唯一の記録を削除すると、選択が「すべての月」に戻り選択肢からも消える
    - タイトルと月セレクトが1行に収まり、横スクロールは発生しない
  - **未検証**: 実機（iOS Safari）でのセレクトボックスの見た目・操作。月の選択状態はリロードで「すべての月」に戻る（永続化していない）

### リファクタリング（ユーザー指示・ブランチ `refactor/cleanup-structure`）
グローバル CLAUDE.md の規約に合わせた構造整理。**挙動・見た目は変えない**ことを条件に実施。コミットは性質ごとに分割。
- **Prettier 導入**: `prettier` を devDependency に追加し、`.prettierrc.json`（セミコロンなし・ダブルクォート・末尾カンマ）と `.prettierignore`（`dist` / `public` / `docs` / `*.md` / `index.html` など）を追加。`pnpm run format` / `pnpm run format:check` を `package.json` に追加。導入時に `src/` 全体と `vite.config.ts` を整形（`src/` のセミコロンは削除され、`main.tsx` 等の単一引用符はダブルクォートに統一）
- **型名・ファイル名の規約化**: `interface` は `IXxx`、`type` は `TXxx` に統一（`Expense`→`IExpense`、`NewExpenseInput`→`TExpenseInput`、`ExpenseFilter`→`TExpenseFilter`、`ExpenseFormErrors`→`IExpenseFormErrors`、各コンポーネントの `Props`→`IXxxProps` など）。`TExpenseInput` / `TExpenseFilter` は hooks・components から `types/expense.type.ts` に集約。ファイル接尾辞を `*.type.ts` / `*.utils.ts` に統一（`types/expense.ts`→`expense.type.ts`、`lib/*.ts`→`lib/*.utils.ts`）
- **モーダル・フォームの重複解消**: `Modal.tsx`（オーバーレイ・ヘッダー・Escape/外側クリック）を新設し、`AddExpenseModal` / `EditExpenseModal` が利用。`ExpenseForm` に `initialValues` / `submitLabel` / `onCancel` を追加して編集フォームと統合。モーダル化で不要になった送信後の入力クリア・フォーカス戻しを削除。input の `id` は `useId` で生成。`EditExpenseModal.module.css` は `Modal.module.css` に改名（ボタン類は `ExpenseForm.module.css` へ）
- **絞り込みロジックの分離**: `App.tsx` から `hooks/useExpenseFilters.ts`（状態・派生値）と `lib/filter.utils.ts` の純粋関数 `filterExpenses` に切り出し。ハンドラは `handleXxx` 命名に統一。`ExpenseList` の `emptyMessage` は必須 prop にしてメッセージの重複定義を解消
- **`useExpenses` の整理**: 返す操作関数を `useCallback` で安定化し、内部の `handleXxx` を公開名（`addExpense` など）で return。JSDoc とグループ化コメントを追加。保存失敗メッセージは定数化
- **`storage.utils.ts`**: `JSON.parse(raw) as IStoredData` の型アサーションをやめ、`unknown` + 型ガード（`isStoredData` / `isExpense`）で検証する形に変更
- **その他**: `SummaryBar` の `useMemo`（軽量な計算）を外し、件数計算を `countUnsettled` として `summary.utils.ts` へ。エラー文言を定数化。最大幅 480px を CSS 変数 `--layout-max-width` に集約。`validation` / `FilterTabs` / `ExpenseItem` などに JSDoc を追加
- **残した判断**: `useExpenses` の `useEffect` 内 `setState`（oxlint `set-state-in-effect` 警告）は、保存結果を state に反映する設計として引き続き許容。自動テスト（Vitest）は導入していない（ユーザー判断）
- **検証結果**:
  - 各コミットで `pnpm exec tsc -b` / `pnpm run build` 成功。最終的に `pnpm run lint`（既知の警告1件のみ）・`pnpm run format:check` も成功
  - `pnpm run dev` + アプリ内ブラウザ（390×844）で、不正要素を混ぜたテストデータを投入して回帰確認: 不正要素の除外、追加（バリデーションエラー・登録・日付初期値・フォーカス）、編集（初期値・エラー・保存）、4通りの閉じ方、月フィルタと清算状態フィルタの併用、該当なしメッセージ、月を絞った状態でも総額が全件分のまま、選択中の月の最後の1件を削除すると「すべての月」に戻る、清算チェックの切り替えと `localStorage` への反映、`id` が重複しないこと
  - **未検証**: 実機（iOS Safari）での確認。自動テストは無いため、上記は手動確認のみ
- **コンポーネントのディレクトリ化**: `components/` 直下に並んでいた tsx と `*.module.css` を、コンポーネントごとのディレクトリ（例: `components/ExpenseForm/ExpenseForm.tsx` + `ExpenseForm.module.css`）にまとめた。CSS を持たない `AddExpenseModal` / `EditExpenseModal` も一貫性のため同じ構成。`index.ts`（バレル）は、プロジェクトに既存の採用がないため作成せず、import は `../ExpenseForm/ExpenseForm` のようにファイルを直接指す。ファイルの移動は `git mv` で行い履歴を追える。挙動の変更はなし（`tsc -b` / `pnpm run build` / `pnpm run lint` / `pnpm run format:check` 成功。ブラウザでの再確認は未実施で、import 解決はビルドで確認）
- **注意**: 上記のファイル名変更により、本書の過去の完了内容（Phase 1〜8 の記述）に出てくる `lib/storage.ts` などの旧名は、現在は `*.utils.ts` になっている

### README の更新（2026-10-07）
- `README.md` に、主な機能・技術スタック・必要環境・開発手順（LAN 公開の注意を含む）・スクリプト一覧・ディレクトリ構成を、現状に合わせて追記した（計画自体の変更ではないため「当初計画からの変更点」ではなくここに記録）
- 記述は `package.json`（`engines` / `scripts`）、`.nvmrc`、`src/` の実体と突き合わせて確認済み
- 利用者向けの注意として、PWA は「オフライン起動はビルド成果物のブラウザ確認まで済み、実機でのホーム画面追加は未検証」、データ保存は「ブラウザの `localStorage` のみで、サイトデータを消すと失われる（同期・バックアップ・エクスポート／インポートは未実装）」と明記した
- ドキュメントのみの変更でコード・ビルドへの影響はない。Markdown は `.prettierignore` で Prettier の対象外のため、整形チェックは行っていない。ビルド・lint は未実行

### リファクタリング第2弾（ユーザー指示・ブランチ `refactor/item-id-and-update-type`・2026-10-09）
前回のリファクタリング後のコードを見直して出した改善案（A〜D）のうち、ユーザー指示で **A-2・A-4 のみ** を実施した。挙動・見た目は変えていない。
- **改善案一覧**（未着手の分は今後の候補）
  - A-1: 起動直後の `useEffect` による保存で、`loadExpenses` が除外した不正要素が localStorage から消える問題。保存を変更操作側へ移す（`useSyncExternalStore` によるストア化、または `commit` 関数）。既知の `set-state-in-effect` 警告も解消できる見込み — **未着手**
  - A-2: `ExpenseItem` のチェックボックス id を `useId` で生成 — **完了**
  - A-3: 入力チェックと型の不一致（`IExpense.amount` は正の整数だが `1.5` / `1e3` を通す、日付が空でも保存できる）。`parseExpenseInput` への置き換え案 — **仕様変更を伴うため見送り**（ユーザー判断。仕様を確定してから別途実施）
  - A-4: `updateExpense` の更新内容の型を `Partial<Omit<IExpense, "id">>` から `TExpenseInput` に限定 — **完了**
  - B-1: `ExpenseForm` のロジックを `useExpenseForm` へ、入力欄を `FormField` へ切り出し、`todayISO` を `lib/date.utils.ts` へ — 未着手
  - B-2: 日付・月の処理を `date.utils.ts` に集約し、`TMonthKey` / `TMonthFilter` 型を導入 — 未着手
  - B-3: `App.tsx` のモーダル状態を判別共用体 1 つにまとめ、編集対象は id で持つ — 未着手
  - B-4: 並び替え `compareExpenses` を `lib/sort.utils.ts` へ — `.claude/rules` の不変条件の文言変更が必要なため要確認・未着手
  - C: CSS の直書き値のトークン化（`#ffffff`・オーバーレイの `rgba`・フォーカスリング・コントロール高さ等） — 未着手
  - D: Vitest 導入（`lib` のみ）、`Modal` のアクセシビリティ改善 — 実施するか未決定
- **A-2**: `ExpenseItem` のチェックボックス id を `settled-${expense.id}` から `useId()` に変更（`.claude/rules` の「input の id は useId」に準拠）
- **A-4**: `useExpenses` の `updateExpense` の引数 `patch` を `TExpenseInput` に変更。`id` / `createdAt` / `settled` を更新経路から書き換えられないようにした（呼び出し元は `EditExpenseModal` のみで、元から `TExpenseInput` を渡していた）
- **検証結果**:
  - 各コミットで `pnpm exec tsc -b` / `pnpm run lint`（既知の警告1件のみ）/ `pnpm run format:check` 成功。最後に `pnpm run build` 成功
  - `pnpm run dev` + アプリ内ブラウザ（390×844）でテストデータを投入して確認: チェックボックスの id が一意でラベルの `htmlFor` と一致、ラベルのクリックで清算状態が切り替わり localStorage に反映、編集保存で項目名が更新され `settled` / `createdAt` は保持。確認後に localStorage は元の内容へ戻した
  - **未検証**: 実機（iOS Safari）での確認
- **気付いた点（未対応）**: `ExpenseItem` のチェックボックスにはアクセシブルな名前（ラベル文言・`aria-label`）が無い

### 次にやること
- リファクタリング第2弾の残り（推奨順: B-2 → B-1 → B-3 → A-1 → C）を進めるか、ユーザーに確認する。A-3・B-4 は仕様・不変条件の確認が先
- Phase 8の残り（月別グルーピングと月ごとの小計、一括清算、エクスポート/インポート）を進める

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
- **`id` は端末側で生成**: `crypto.randomUUID()` で生成し、外部に依存せず一意性を保つ。

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
| Lint | oxlint | 最新の Vite テンプレートに同梱（当初想定の ESLint から変更） |
| フォーマッタ | Prettier | リファクタリング時に導入（`.prettierrc.json`: セミコロンなし・ダブルクォート・末尾カンマ） |
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
│   ├── components/            # 1 コンポーネント 1 ディレクトリ（tsx と module.css を同居）
│   │   ├── Modal/                 # 共通モーダル（オーバーレイ・ヘッダー・Escape）
│   │   ├── AddExpenseModal/       # 追加モーダル
│   │   ├── EditExpenseModal/      # 編集モーダル
│   │   ├── ExpenseForm/           # 追加・編集共通の入力フォーム
│   │   ├── ExpenseList/           # 一覧のコンテナ
│   │   ├── ExpenseItem/           # 1行（チェック・編集・削除）
│   │   ├── SummaryBar/            # 未清算合計の表示
│   │   ├── FilterTabs/            # 清算状態フィルタ
│   │   └── MonthFilter/           # 月フィルタ
│   ├── hooks/
│   │   ├── useExpenses.ts         # CRUD と永続化をまとめる
│   │   └── useExpenseFilters.ts   # 月・清算状態の絞り込み状態と結果
│   ├── lib/
│   │   ├── storage.utils.ts       # localStorage の読み書き（型ガードで検証）
│   │   ├── format.utils.ts        # 金額・日付・月の整形
│   │   ├── summary.utils.ts       # 合計・件数計算などの純粋関数
│   │   ├── month.utils.ts         # 月キーの取得・一覧化
│   │   ├── filter.utils.ts        # 記録の絞り込み（純粋関数）
│   │   └── validation.utils.ts    # フォーム入力の検証
│   ├── types/
│   │   └── expense.type.ts        # IExpense / TExpenseInput / TExpenseFilter
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

**方針**: 「保存先に依存する処理」を `lib/storage.utils.ts` の1ファイルに閉じ込める。
コンポーネントは `useExpenses` 経由でしかデータに触らないため、保存方法を変える場合に書き換えるのはこの2ファイルだけで済む。

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

### Phase 8: 追加機能（MVP 後）

優先度順:

1. **フィルタ（すべて / 未清算 / 清算済み）** — 記録が増えると必須になる
2. **記録の編集** — 金額の打ち間違いを直せるようにする
3. **月別グルーピング** — 月ごとの見出しと小計を出す
4. **一括清算** — 「未清算をすべて清算済みにする」
5. **エクスポート / インポート** — データ退避手段として作っておくと安全

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
Phase 8  フィルタ・編集・月別集計など
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
- [x] 一覧が日付の降順で表示される
- [x] チェックで清算済みを切り替えられる
- [x] 記録を削除できる
- [x] 未清算合計が画面上部に表示される
- [x] リロードしてもデータが残る

### 追加機能（MVP後・Phase 8）
- [x] フィルタ（すべて / 未清算のみ / 清算済みのみ）
- [x] 記録の編集（日付・項目名・金額の修正）
- [x] 月ごとの表示フィルタ（ヘッダーの月セレクト）
- [ ] 月別のグルーピングと月ごとの小計
- [ ] 「まとめて清算済みにする」一括操作
- [ ] データのエクスポート / インポート（JSON）

### PWA
- [x] manifest.json が生成されている
- [x] アイコン（192 / 512 / maskable）を用意した
- [x] Service Worker が登録される
- [x] オフラインで起動できる
- [ ] ホーム画面に追加できる（未検証: 実機での確認が必要）
- [ ] Lighthouse の PWA 監査を通る（未実行）

### 実機確認
- [ ] スマートフォン実機で動作を確認した
