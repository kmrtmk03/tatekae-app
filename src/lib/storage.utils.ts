import type { IExpense } from "../types/expense.type"
import type { TMonthKey } from "../types/month.type"
import { getMonthKey, isMonthKey } from "./month.utils"

const STORAGE_KEY = "tatekae-app/expenses/v1"
const STORAGE_VERSION = 1

/** localStorage に保存する形式。将来スキーマを変えたときに version で移行できるようにしている */
interface IStoredData {
  version: number
  expenses: IExpense[]
}

/**
 * 保存された値から精算月（'YYYY-MM'）を取り出す。
 * 現行の保存形式は month だが、日付（'YYYY-MM-DD'）の date で保存された旧データも
 * 読めるよう、month が無ければ date の先頭 7 文字を精算月として引き継ぐ。
 * どちらも妥当でなければ null（その記録は読み込まない）。
 */
function readMonth(record: Record<string, unknown>): TMonthKey | null {
  if (typeof record.month === "string") {
    return isMonthKey(record.month) ? record.month : null
  }
  if (typeof record.date === "string") return getMonthKey(record.date)
  return null
}

/**
 * 値を記録 1 件（IExpense）へ変換する。形式が不正なら null。
 * localStorage は他のバージョンや手動編集で壊れうる外部入力なので、
 * 読み込んだ要素ごとに、必須フィールドの存在と型を確認する（型ガードではなく変換なのは旧データの移行のため）。
 */
function parseExpense(value: unknown): IExpense | null {
  if (typeof value !== "object" || value === null) return null
  const record = value as Record<string, unknown>
  const month = readMonth(record)
  if (
    month === null ||
    typeof record.id !== "string" ||
    typeof record.title !== "string" ||
    typeof record.amount !== "number" ||
    typeof record.settled !== "boolean" ||
    typeof record.createdAt !== "string"
  ) {
    return null
  }
  return {
    id: record.id,
    month,
    title: record.title,
    amount: record.amount,
    settled: record.settled,
    createdAt: record.createdAt,
  }
}

/**
 * 値が保存形式（IStoredData）の外枠（expenses が配列）かを検証する型ガード。
 * 要素（expenses の中身）は parseExpense で個別に検証するため、ここでは配列であることだけを確認する。
 */
function isStoredData(value: unknown): value is { expenses: unknown[] } {
  if (typeof value !== "object" || value === null) return false
  const record = value as Record<string, unknown>
  return Array.isArray(record.expenses)
}

/**
 * localStorage から記録一覧を読み込む。
 * JSON パース失敗や想定外の形式のときは空配列にフォールバックする（例外を投げない）。
 * 形式が不正な要素だけを取り除き、正しい要素は残す。
 */
export function loadExpenses(): IExpense[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw === null) return []

  try {
    // parse 結果は unknown で受け、型ガードで検証してから使う
    const parsed: unknown = JSON.parse(raw)
    if (!isStoredData(parsed)) return []
    return parsed.expenses.flatMap((item) => parseExpense(item) ?? [])
  } catch {
    return []
  }
}

/**
 * localStorage へ記録一覧を保存する。
 * 容量超過などの例外は握りつぶさず呼び出し元に伝播させる（useExpenses が saveError に変換する）。
 */
export function saveExpenses(expenses: IExpense[]): void {
  const data: IStoredData = { version: STORAGE_VERSION, expenses }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}
