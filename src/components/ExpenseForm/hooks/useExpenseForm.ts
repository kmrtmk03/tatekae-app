import { useState } from "react"
import type { FormEvent } from "react"
import { currentMonthKey } from "../../../lib/month.utils"
import { parseExpenseInput } from "../../../lib/validation.utils"
import type { IExpenseFormErrors } from "../../../lib/validation.utils"
import type { TExpenseInput } from "../../../types/expense.type"

interface IUseExpenseFormParams {
  /** 初期値。未指定なら精算月は今月、項目名・金額は空（新規追加用） */
  initialValues?: TExpenseInput
  /** バリデーションを通過した入力値を受け取る */
  onSubmit: (input: TExpenseInput) => void
}

/**
 * 記録の追加・編集フォームの入力値・エラー・送信処理を管理するフック。
 *
 * - 入力中の値は文字列で持ち、送信時に parseExpenseInput で検証・変換してから onSubmit へ渡す
 * - フォームは送信後に自動では閉じない。閉じるかどうかは呼び出し側（モーダル）が決める
 *
 * MEMO: モーダルを開くたびにマウントし直す前提のため、再オープン時は初期値に戻る。
 */
export function useExpenseForm({
  initialValues,
  onSubmit,
}: IUseExpenseFormParams) {
  const [month, setMonth] = useState<string>(
    initialValues?.month ?? currentMonthKey(),
  )
  const [title, setTitle] = useState(initialValues?.title ?? "")
  const [amount, setAmount] = useState(
    initialValues ? String(initialValues.amount) : "",
  )
  const [errors, setErrors] = useState<IExpenseFormErrors>({})

  /** フォームの送信。検証エラーがあれば errors に入れて onSubmit は呼ばない */
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const result = parseExpenseInput({ month, title, amount })
    if (!result.ok) {
      setErrors(result.errors)
      return
    }

    setErrors({})
    onSubmit(result.value)
  }

  return {
    // 入力中の値と更新関数
    values: { month, title, amount },
    setMonth,
    setTitle,
    setAmount,
    // 検証エラー（エラーのない項目は undefined）
    errors,
    // フォームの onSubmit に渡す
    handleSubmit,
  }
}
