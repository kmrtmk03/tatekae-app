import type { IExpense } from "../types/expense.type"
import type { TMonthFilter, TMonthKey } from "../types/month.type"

/** 月フィルタで「すべての月」を表す値 */
export const ALL_MONTHS = "all" satisfies TMonthFilter

/** 'YYYY-MM' 形式（月は 01〜12）かを判定する正規表現 */
const MONTH_KEY_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/

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

/**
 * 'YYYY-MM-DD' の日付文字列から月キー 'YYYY-MM' を取り出す。形式が不正な場合は null。
 * 記録が日付（'YYYY-MM-DD'）で保存されていた旧データを、精算月へ変換するために使う。
 */
export function getMonthKey(date: string): TMonthKey | null {
  const monthKey = date.slice(0, 7)
  return isMonthKey(monthKey) ? monthKey : null
}

/** 月キーを分解した値。month は 1〜12 */
export interface IMonthParts {
  year: number
  month: number
}

/** 月キー 'YYYY-MM' を年・月に分解する。月キーであることは型で保証されているため検証しない */
export function parseMonthKey(monthKey: TMonthKey): IMonthParts {
  const [year, month] = monthKey.split("-").map(Number)
  return { year, month }
}

/** 年（4 桁）と月（1〜12）から月キーを組み立てる。範囲外で月キーにならない場合は null */
export function toMonthKey(year: number, month: number): TMonthKey | null {
  const monthKey = `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}`
  return isMonthKey(monthKey) ? monthKey : null
}

/** 今月の月キーを 'YYYY-MM' で返す（タイムゾーンのずれを避けるためローカル日時で組み立てる） */
export function currentMonthKey(): TMonthKey {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  return `${year}-${month}` as TMonthKey
}

/**
 * 記録が存在する精算月の月キー（'YYYY-MM'）を新しい順に返す。
 */
export function listMonthKeys(expenses: IExpense[]): TMonthKey[] {
  const monthKeys = new Set<TMonthKey>()
  for (const expense of expenses) {
    monthKeys.add(expense.month)
  }
  // 'YYYY-MM' は文字列の降順がそのまま新しい順になる
  return [...monthKeys].sort().reverse()
}
