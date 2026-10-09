# 実装方針（tatekae-app）

グローバル設定（`~/.claude/CLAUDE.md`）の規約を、このプロジェクトにどう適用しているかをまとめる。
2026-10 のリファクタリング（`refactor/cleanup-structure`）の結果を反映している。
新しくコードを書くときは、まずこの方針と既存コードのパターンに合わせる。

## ディレクトリ構成と配置

```
src/
├── components/<Name>/<Name>.tsx + <Name>.module.css   # 1 コンポーネント 1 ディレクトリ
├── hooks/        # useXxx.ts（状態と操作を返す。UI は返さない）
├── lib/          # *.utils.ts（副作用のない純粋関数 / 保存先に依存する処理）
├── types/        # *.type.ts（複数箇所で参照される型）
├── App.tsx / main.tsx / index.css
```

- コンポーネントは **tsx と `module.css` を同じディレクトリに置く**。CSS が無いコンポーネントも同じ構成にする
- `index.ts`（バレル）は**作らない**。import は `../ExpenseForm/ExpenseForm` のようにファイルを直接指す
- 他コンポーネントの CSS を import しない。共通の見た目が必要なら共通コンポーネント（例: `Modal`）にする
- 共有ディレクトリ（`hooks` / `lib` / `types`）へ移すのは、複数箇所で実際に使われてから。先回りの共通化はしない
- ファイル接尾辞: 型は `*.type.ts`、純粋関数・ユーティリティは `*.utils.ts`、定数が増えたら `*.constants.ts`

## 命名と型

- `interface` は `IXxx`、`type` エイリアスは `TXxx`（例: `IExpense` / `TExpenseInput` / `TExpenseFilter`）
- コンポーネントの Props は `I<コンポーネント名>Props`（例: `IExpenseFormProps`）
- 複数のファイルから使う型は `types/expense.type.ts` に置く。コンポーネントや hooks のファイルから型を export して他所から import しない
- 既存の型から作れるものは `Pick` / `Omit` で差分定義する（例: `TExpenseInput = Pick<IExpense, "date" | "title" | "amount">`）
- イベントハンドラは `handleXxx`、boolean は `isXxx`
- `any` と `enum` は使わない。`as` は型ガード内の局所的な使用に限る

## 外部データの扱い

- 保存先（localStorage）に依存する処理は **`lib/storage.utils.ts` に閉じ込める**。記録の保持・保存は `lib/expense.store.ts`（`useSyncExternalStore` 用のストア）が行い、保存は変更操作の中だけで呼ぶ（`useEffect` で state の変更を保存しない）。コンポーネントは `useExpenses` 経由でしかデータに触らない
- 読み込んだ値は `unknown` で受け、`isXxx(value): value is T` の型ガードで検証してから使う（`JSON.parse(...) as T` は禁止）
- 型ガードには「なぜその検証が必要か」をコメントで残す
- 読み込み失敗や不正データは空配列へフォールバックし、例外を投げない。保存失敗は握りつぶさず `saveError` として画面に出す

## コンポーネントとフック

- tsx は UI の記述に専念する。絞り込み・集計・整形などのロジックは **hooks か `lib/*.utils.ts` の純粋関数**に置く
  - 例: 絞り込みは `useExpenseFilters`（状態）＋ `filterExpenses`（純粋関数）
- フックが返す関数は `useCallback` で安定化する（`useExpenses` のようにモジュールレベルの関数をそのまま返す場合は不要）。内部は `handleXxx`、公開名は分かりやすい名前で return し、return はグループごとにコメントを付ける（`useExpenseFilters` を参照）
- **派生できる値は state にしない**。例: 選択中の月の記録が無くなったときの補正は、`useEffect` で state を書き換えず `activeMonth` を派生値として計算する
- `useMemo` は、件数規模が小さい計算には使わない（`SummaryBar` など）。必要になったら計測してから入れる
- 同じ入力欄・同じ見た目が 2 か所に現れたらコンポーネント化する（追加・編集で `ExpenseForm` と `Modal` を共用している）
- モーダルは**開いている間だけマウントする**（`{isOpen && <Modal />}`）。これにより、開くたびにフォームの state が初期化される
- フォームの input の `id` は `useId` で生成し、固定文字列を使わない（複数フォームの同時存在で衝突するため）

## 仕様上の不変条件（変更するときは要確認）

- **`SummaryBar` には絞り込み前の全件（`expenses`）を渡す**。月・清算状態フィルタの影響を受けない（F-04「未清算合計を常に確認できる」を優先）
- 一覧の並び順は精算月の降順、同月なら `createdAt` の降順（`useExpenseFilters` が `lib/sort.utils.ts` の `sortExpensesNewestFirst` で絞り込み後に並べ替え、`ExpenseList` は渡された順に表示する）
- 追加・編集は、保存成功時にモーダルが自動で閉じる。キャンセル・×・Escape・オーバーレイのクリックは変更を破棄して閉じる
- フィルタの選択状態（月・清算状態）は永続化しない（リロードで初期値に戻る）

## スタイル・フォーマット

- フォーマットは **Prettier が正**（セミコロンなし・ダブルクォート・末尾カンマ）。コード変更後は `pnpm run format` を実行してからコミットする
- 色・角丸・影・余白のトークン、最大幅（`--layout-max-width`）は `index.css` の CSS 変数に集約する。生の色コードやマジックナンバーを CSS に直書きしない
- スタイルは CSS Modules。グローバル CSS にはトークンとベーススタイルだけを置く
- 文言（エラーメッセージなど）は `UPPER_SNAKE_CASE` の定数にする。1 か所でしか使わないものは、使うファイル内に置く。複数箇所で使うようになったら共有する

## コメント

- 日本語で、関数・フック・型・interface のフィールドに JSDoc を書く
- 処理の言い換えではなく、意図・前提・呼び出し契約（「呼び出し側で閉じること」など）を書く
- 暫定対応や設計上の注意は `MEMO:` / `TODO:` を付ける

## 検証

コード変更後は次を実行して結果を報告する。

```bash
pnpm exec tsc -b          # 型チェック
pnpm run lint             # oxlint
pnpm run format:check     # Prettier
pnpm run build            # ビルド
```

- `pnpm run lint` は警告 0 件の状態を保つ。新しい警告を増やさない（以前許容していた `useExpenses.ts` の `react(set-state-in-effect)` 警告は、保存を `lib/expense.store.ts` へ移して解消済み）
- 自動テスト（Vitest 等）は導入していない。挙動の確認は `pnpm run dev` + ブラウザ（モバイル幅 390×844）で行い、実機（iOS Safari）で確認できていない項目は「未検証」と明記する
- 開発サーバーは LAN 公開済み（`vite.config.ts` の `server.host: true`）。実機確認は `http://<PCのIP>:5173` で行う。HTTP のため Service Worker（PWA）は動かない

## コミット

- 性質ごとに分割する（`feat` / `fix` / `docs` / `style` / `refactor`）。フォーマット一括変更・リネーム・ロジック変更を 1 コミットに混ぜない
- ドキュメント（`docs/implementation-plan.md`）の更新は、CLAUDE.md の「作業引き継ぎルール」に従う
