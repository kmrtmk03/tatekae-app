import type { TExpenseColor } from "../../types/expense.type"

/**
 * ラベル色ごとの色名（スクリーンリーダー向け）。
 * Record にしているため、TExpenseColor に色を足すとここを埋めるまで型エラーになる。
 * 色を足すときは、index.css の --color-label-* と [data-color] のルールも合わせて足すこと。
 */
export const EXPENSE_COLOR_LABELS: Record<TExpenseColor, string> = {
  red: "赤",
  orange: "オレンジ",
  green: "緑",
  blue: "青",
  purple: "紫",
}

/** ラベル色を画面に並べる順。全色を含むことは expense-color.constants.test.ts で確認している */
const EXPENSE_COLOR_ORDER: readonly TExpenseColor[] = [
  "red",
  "orange",
  "green",
  "blue",
  "purple",
]

/** ラベル色の選択肢（画面に並べる順）。label はスクリーンリーダー向けの色名 */
export const EXPENSE_COLOR_OPTIONS: ReadonlyArray<{
  value: TExpenseColor
  label: string
}> = EXPENSE_COLOR_ORDER.map((value) => ({
  value,
  label: EXPENSE_COLOR_LABELS[value],
}))

/** 新規追加フォームの初期色。色を持たない旧データの読み込み時にも使う */
export const DEFAULT_EXPENSE_COLOR: TExpenseColor = "blue"
