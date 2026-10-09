import type { IExpense } from "../types/expense.type"
import type { TMonthKey } from "../types/month.type"
import { isMonthKey } from "./month.utils"

/** 現行の保存先。記録は精算月（month）で持つ */
const STORAGE_KEY = "tatekae-app/expenses/v2"
/**
 * 旧版の保存先。記録は日付（date）で持っていた。
 * 読み込み専用の移行元として扱い、書き換え・削除はしない（旧版のビルドを開いても記録が消えないようにするため）。
 */
const LEGACY_STORAGE_KEY = "tatekae-app/expenses/v1"
const STORAGE_VERSION = 2

/** 旧版の日付（'YYYY-MM-DD'）全体の形式。月だけでなく日まで形式が正しいものだけを移行する */
const LEGACY_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

/** localStorage に保存する形式。将来スキーマを変えたときに version で移行できるようにしている */
interface IStoredData {
  version: number
  expenses: IExpense[]
}

/** 記録 1 件の生データから、精算月（'YYYY-MM'）を取り出す。取り出せなければ null（その記録は読み込まない） */
type TReadMonth = (record: Record<string, unknown>) => TMonthKey | null

/** 値が null でないオブジェクト（プロパティを unknown として読める）かを判定する型ガード */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

/** 現行（v2）の記録から精算月を取り出す。month が 'YYYY-MM' 形式のときだけ有効 */
function readMonth(record: Record<string, unknown>): TMonthKey | null {
  const { month } = record
  return typeof month === "string" && isMonthKey(month) ? month : null
}

/**
 * 旧版（v1）の記録から精算月を取り出す。date が 'YYYY-MM-DD' 形式のときだけ、その年月を精算月とする。
 * 日の情報は引き継がない。
 */
function readLegacyMonth(record: Record<string, unknown>): TMonthKey | null {
  const { date } = record
  if (typeof date !== "string" || !LEGACY_DATE_PATTERN.test(date)) return null
  const monthKey = date.slice(0, 7)
  return isMonthKey(monthKey) ? monthKey : null
}

/**
 * 値を記録 1 件（IExpense）へ変換する。形式が不正なら null。
 * localStorage は他のバージョンや手動編集で壊れうる外部入力なので、
 * 読み込んだ要素ごとに、必須フィールドの存在と型を確認する。
 * 型ガードではなく変換にしているのは、旧版の記録（date）を新しい形（month）へ移すため。
 */
function parseExpense(
  value: unknown,
  readMonthFrom: TReadMonth,
): IExpense | null {
  if (!isRecord(value)) return null
  const month = readMonthFrom(value)
  if (
    month === null ||
    typeof value.id !== "string" ||
    typeof value.title !== "string" ||
    typeof value.amount !== "number" ||
    typeof value.settled !== "boolean" ||
    typeof value.createdAt !== "string"
  ) {
    return null
  }
  return {
    id: value.id,
    month,
    title: value.title,
    amount: value.amount,
    settled: value.settled,
    createdAt: value.createdAt,
  }
}

/**
 * 保存された JSON 文字列を記録一覧へ変換する。
 * JSON パース失敗や想定外の形式のときは空配列にフォールバックし（例外を投げない）、
 * 形式が不正な要素だけを取り除いて正しい要素は残す。
 */
function parseStoredExpenses(
  raw: string,
  readMonthFrom: TReadMonth,
): IExpense[] {
  try {
    // parse 結果は unknown で受け、型ガードで検証してから使う
    const parsed: unknown = JSON.parse(raw)
    // 保存形式の外枠は { expenses: 配列 }。中身は parseExpense で個別に検証する
    if (!isRecord(parsed) || !Array.isArray(parsed.expenses)) return []
    return parsed.expenses.flatMap(
      (item: unknown) => parseExpense(item, readMonthFrom) ?? [],
    )
  } catch {
    return []
  }
}

/**
 * localStorage から記録一覧を読み込む。
 * 現行の保存先（v2）があればそれを使い、無いときだけ旧版の保存先（v1）から精算月へ変換して読み込む。
 * v1 は読むだけで書き換えない。最初に保存したとき以降は v2 が使われる。
 */
export function loadExpenses(): IExpense[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw !== null) return parseStoredExpenses(raw, readMonth)

  const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY)
  if (legacyRaw === null) return []
  return parseStoredExpenses(legacyRaw, readLegacyMonth)
}

/**
 * localStorage へ記録一覧を保存する。
 * 容量超過などの例外は握りつぶさず呼び出し元に伝播させる（useExpenses が saveError に変換する）。
 */
export function saveExpenses(expenses: IExpense[]): void {
  const data: IStoredData = { version: STORAGE_VERSION, expenses }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}
