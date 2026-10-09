import { useState } from "react"
import type { FormEvent } from "react"
import { todayISO } from "../../../lib/date.utils"
import { validateExpenseInput } from "../../../lib/validation.utils"
import type { IExpenseFormErrors } from "../../../lib/validation.utils"
import type { TExpenseInput } from "../../../types/expense.type"

interface IUseExpenseFormParams {
  /** 初期値。未指定なら日付は当日、項目名・金額は空（新規追加用） */
  initialValues?: TExpenseInput
  /** バリデーションを通過した入力値を受け取る */
  onSubmit: (input: TExpenseInput) => void
}

/**
 * 記録の追加・編集フォームの入力値・エラー・送信処理を管理するフック。
 *
 * - 入力中の値は文字列で持ち、送信時に検証してから TExpenseInput に変換して onSubmit へ渡す
 * - フォームは送信後に自動では閉じない。閉じるかどうかは呼び出し側（モーダル）が決める
 *
 * MEMO: モーダルを開くたびにマウントし直す前提のため、再オープン時は初期値に戻る。
 */
export function useExpenseForm({
  initialValues,
  onSubmit,
}: IUseExpenseFormParams) {
  const [date, setDate] = useState(initialValues?.date ?? todayISO())
  const [title, setTitle] = useState(initialValues?.title ?? "")
  const [amount, setAmount] = useState(
    initialValues ? String(initialValues.amount) : "",
  )
  const [errors, setErrors] = useState<IExpenseFormErrors>({})

  /** フォームの送信。検証エラーがあれば errors に入れて onSubmit は呼ばない */
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const nextErrors = validateExpenseInput(title, amount)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    onSubmit({ date, title: title.trim(), amount: Number(amount) })
  }

  return {
    // 入力中の値と更新関数
    values: { date, title, amount },
    setDate,
    setTitle,
    setAmount,
    // 検証エラー（エラーのない項目は undefined）
    errors,
    // フォームの onSubmit に渡す
    handleSubmit,
  }
}
