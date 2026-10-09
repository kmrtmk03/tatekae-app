import type { TMonthKey } from "../types/month.type"

/** 金額を「¥12,345」の形式に整形する */
export function formatAmount(n: number): string {
  return `¥${n.toLocaleString("ja-JP")}`
}

/** 月キー 'YYYY-MM' を「2026年10月」の形式に整形する */
export function formatMonth(monthKey: TMonthKey): string {
  const [year, month] = monthKey.split("-").map(Number)
  return `${year}年${month}月`
}
