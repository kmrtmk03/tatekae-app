import type { TExpenseColor, TExpenseColorFilter } from "../types/expense.type"

/** ラベル色の選択肢（画面に並べる順）。label はスクリーンリーダー向けの色名 */
export const EXPENSE_COLOR_OPTIONS: ReadonlyArray<{
  value: TExpenseColor
  label: string
}> = [
  { value: "red", label: "赤" },
  { value: "orange", label: "オレンジ" },
  { value: "green", label: "緑" },
  { value: "blue", label: "青" },
  { value: "purple", label: "紫" },
]

/** 新規追加フォームの初期色。色を持たない旧データの読み込み時にも使う */
export const DEFAULT_EXPENSE_COLOR: TExpenseColor = "blue"

/** ラベル色フィルタで「色では絞り込まない」ことを表す値 */
export const ALL_COLORS: TExpenseColorFilter = "all"
