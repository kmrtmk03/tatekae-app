import type { TExpenseInput } from "../types/expense.type"
import { parseISODate } from "./date.utils"

const TITLE_REQUIRED_MESSAGE = "項目名を入力してください"
const DATE_INVALID_MESSAGE = "日付を入力してください"
const AMOUNT_INVALID_MESSAGE = "金額は1円以上の整数で入力してください"

/** 'YYYY-MM-DD' 形式かを判定する正規表現（存在する日付かは isValidISODate で別途確認する） */
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
/** 数字だけで構成された文字列かを判定する正規表現。小数点・指数表記（1.5 / 1e3）・符号を弾く */
const DIGITS_ONLY_PATTERN = /^\d+$/

/** フォームが持つ入力中の値。すべて文字列のまま受け取り、parseExpenseInput で検証・変換する */
export interface IExpenseFormValues {
  date: string
  title: string
  amount: string
}

/** 入力欄ごとのエラー文言。エラーのない項目は undefined */
export interface IExpenseFormErrors {
  date?: string
  title?: string
  amount?: string
}

/** parseExpenseInput の結果。成功なら変換済みの値、失敗なら入力欄ごとのエラーを持つ */
export type TParseExpenseInputResult =
  { ok: true; value: TExpenseInput } | { ok: false; errors: IExpenseFormErrors }

/**
 * 'YYYY-MM-DD' として形式が正しく、かつ実在する日付かを判定する。
 * input[type="date"] は未入力や不完全な入力のとき空文字を返すため、その場合も false になる。
 * 2026-02-30 のような存在しない日付は Date が繰り上げるため、組み立て直した値と比べて弾く。
 */
function isValidISODate(value: string): boolean {
  if (!ISO_DATE_PATTERN.test(value)) return false
  const { year, month, day } = parseISODate(value)
  const date = new Date(year, month - 1, day)
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  )
}

/**
 * 追加・編集フォームの入力値を検証し、保存用の TExpenseInput に変換する。
 * 日付は実在する日付のみ、項目名は空白のみを不可とし、金額は 1 円以上の整数のみ許可する。
 * 成功したときの value は項目名の前後の空白を除き、金額を数値にしたもの。
 * 呼び出し側は ok で分岐し、失敗時は errors を画面に出すこと。
 */
export function parseExpenseInput(
  values: IExpenseFormValues,
): TParseExpenseInputResult {
  const errors: IExpenseFormErrors = {}

  const title = values.title.trim()
  if (title === "") {
    errors.title = TITLE_REQUIRED_MESSAGE
  }

  if (!isValidISODate(values.date)) {
    errors.date = DATE_INVALID_MESSAGE
  }

  const amountText = values.amount.trim()
  const amount = Number(amountText)
  if (
    !DIGITS_ONLY_PATTERN.test(amountText) ||
    !Number.isSafeInteger(amount) ||
    amount <= 0
  ) {
    errors.amount = AMOUNT_INVALID_MESSAGE
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors }
  return { ok: true, value: { date: values.date, title, amount } }
}
