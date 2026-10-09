import type { TExpenseInput } from "../../types/expense.type"
import type { TMonthKey } from "../../types/month.type"

const TITLE_REQUIRED_MESSAGE = "項目名を入力してください"
const AMOUNT_INVALID_MESSAGE = "金額は1円以上の整数で入力してください"

/** 数字だけで構成された文字列かを判定する正規表現。小数点・指数表記（1.5 / 1e3）・符号を弾く */
const DIGITS_ONLY_PATTERN = /^\d+$/

/**
 * フォームが持つ入力中の値。項目名・金額は文字列のまま受け取り、parseExpenseInput で検証・変換する。
 * 精算月は MonthPicker が妥当な月キーしか返さないため、検証済みの型（TMonthKey）で受け取る。
 */
export interface IExpenseFormValues {
  month: TMonthKey
  title: string
  amount: string
}

/** 入力欄ごとのエラー文言。エラーのない項目は undefined */
export interface IExpenseFormErrors {
  title?: string
  amount?: string
}

/** parseExpenseInput の結果。成功なら変換済みの値、失敗なら入力欄ごとのエラーを持つ */
export type TParseExpenseInputResult =
  { ok: true; value: TExpenseInput } | { ok: false; errors: IExpenseFormErrors }

/**
 * 追加・編集フォームの入力値を検証し、保存用の TExpenseInput に変換する。
 * 項目名は空白のみを不可とし、金額は 1 円以上の整数のみ許可する。
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
  return { ok: true, value: { month: values.month, title, amount } }
}
