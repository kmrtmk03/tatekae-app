import type { TMonthKey } from "../types/month.type"
import { parseISODate } from "./date.utils"

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"]

/** 金額を「¥12,345」の形式に整形する */
export function formatAmount(n: number): string {
  return `¥${n.toLocaleString("ja-JP")}`
}

/** 月キー 'YYYY-MM' を「2026年10月」の形式に整形する */
export function formatMonth(monthKey: TMonthKey): string {
  const [year, month] = monthKey.split("-").map(Number)
  return `${year}年${month}月`
}

/** 'YYYY-MM-DD' を「9/21(日)」の形式に整形する */
export function formatDate(iso: string): string {
  const { year, month, day } = parseISODate(iso)
  // タイムゾーンによる日付のずれを避けるため、ローカル日時として組み立てる
  const date = new Date(year, month - 1, day)
  return `${month}/${day}(${WEEKDAYS[date.getDay()]})`
}
