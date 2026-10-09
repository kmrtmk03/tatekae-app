import type { IExpense } from "../types/expense.type"
import type { TMonthFilter, TMonthKey } from "../types/month.type"

/** 月フィルタで「すべての月」を表す値 */
export const ALL_MONTHS = "all" satisfies TMonthFilter

/** 'YYYY-MM' 形式かを判定する正規表現 */
const MONTH_KEY_PATTERN = /^\d{4}-\d{2}$/

/**
 * 値が月キー（'YYYY-MM'）かを判定する型ガード。
 * 日付文字列の先頭を切り出した値や、select から受け取った文字列を月キーとして扱う前に使う。
 */
export function isMonthKey(value: string): value is TMonthKey {
  return MONTH_KEY_PATTERN.test(value)
}

/**
 * 値が月フィルタの選択値（ALL_MONTHS または月キー）かを判定する型ガード。
 * select の change イベントは文字列で値を返すため、state に入れる前に検証する。
 */
export function isMonthFilter(value: string): value is TMonthFilter {
  return value === ALL_MONTHS || isMonthKey(value)
}

/** 'YYYY-MM-DD' から月キー 'YYYY-MM' を取り出す。日付の形式が不正な場合は null */
export function getMonthKey(date: string): TMonthKey | null {
  const monthKey = date.slice(0, 7)
  return isMonthKey(monthKey) ? monthKey : null
}

/**
 * 記録が存在する月の月キー（'YYYY-MM'）を新しい順に返す。
 * 日付の形式が不正な記録は月の候補に含めない（「すべての月」では表示される）。
 */
export function listMonthKeys(expenses: IExpense[]): TMonthKey[] {
  const monthKeys = new Set<TMonthKey>()
  for (const expense of expenses) {
    const monthKey = getMonthKey(expense.date)
    if (monthKey) monthKeys.add(monthKey)
  }
  // 'YYYY-MM' は文字列の降順がそのまま新しい順になる
  return [...monthKeys].sort().reverse()
}
