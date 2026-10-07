import type { Expense } from "../types/expense"

/** 月フィルタで「すべての月」を表す値 */
export const ALL_MONTHS = "all"

/** 'YYYY-MM' 形式かを判定する正規表現 */
const MONTH_KEY_PATTERN = /^\d{4}-\d{2}$/

/** 'YYYY-MM-DD' から月キー 'YYYY-MM' を取り出す。日付の形式が不正な場合は null */
export function getMonthKey(date: string): string | null {
  const monthKey = date.slice(0, 7)
  return MONTH_KEY_PATTERN.test(monthKey) ? monthKey : null
}

/**
 * 記録が存在する月の月キー（'YYYY-MM'）を新しい順に返す。
 * 日付の形式が不正な記録は月の候補に含めない（「すべての月」では表示される）。
 */
export function listMonthKeys(expenses: Expense[]): string[] {
  const monthKeys = new Set<string>()
  for (const expense of expenses) {
    const monthKey = getMonthKey(expense.date)
    if (monthKey) monthKeys.add(monthKey)
  }
  // 'YYYY-MM' は文字列の降順がそのまま新しい順になる
  return [...monthKeys].sort().reverse()
}
