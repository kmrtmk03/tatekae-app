const TITLE_REQUIRED_MESSAGE = "項目名を入力してください"
const AMOUNT_INVALID_MESSAGE = "金額は1円以上の数値を入力してください"

/** 入力欄ごとのエラー文言。エラーのない項目は undefined */
export interface IExpenseFormErrors {
  title?: string
  amount?: string
}

/**
 * 追加・編集フォームの入力値を検証する。
 * 項目名は空白のみを不可とし、金額は 1 円以上の数値のみ許可する。
 * エラーがなければ空オブジェクトを返す（呼び出し側は Object.keys で判定する）。
 */
export function validateExpenseInput(
  title: string,
  amount: string,
): IExpenseFormErrors {
  const errors: IExpenseFormErrors = {}

  if (title.trim() === "") {
    errors.title = TITLE_REQUIRED_MESSAGE
  }

  const amountValue = Number(amount)
  if (amount.trim() === "" || Number.isNaN(amountValue) || amountValue <= 0) {
    errors.amount = AMOUNT_INVALID_MESSAGE
  }

  return errors
}
