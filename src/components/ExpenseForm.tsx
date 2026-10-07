import { useId, useState } from "react"
import type { FormEvent } from "react"
import { validateExpenseInput } from "../lib/validation.utils"
import type { IExpenseFormErrors } from "../lib/validation.utils"
import type { TExpenseInput } from "../types/expense.type"
import styles from "./ExpenseForm.module.css"

interface IExpenseFormProps {
  /** 初期値。未指定なら日付は当日、項目名・金額は空（新規追加用） */
  initialValues?: TExpenseInput
  /** 送信ボタンの文言。例: 「登録する」「保存する」 */
  submitLabel: string
  /** バリデーションを通過した入力値を受け取る。フォームは送信後に自動では閉じない */
  onSubmit: (input: TExpenseInput) => void
  /** 指定するとキャンセルボタンを表示する（編集用） */
  onCancel?: () => void
}

/** 今日の日付を 'YYYY-MM-DD' で返す（タイムゾーンのずれを避けるためローカル日時で組み立てる） */
function todayISO(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

/**
 * 記録の追加・編集に共通する入力フォーム（日付・項目名・金額）。
 *
 * MEMO: 入力中の値はこのコンポーネントの state で持つ。
 * モーダルを開くたびにマウントし直す前提のため、再オープン時は初期値に戻る。
 */
export function ExpenseForm({
  initialValues,
  submitLabel,
  onSubmit,
  onCancel,
}: IExpenseFormProps) {
  const [date, setDate] = useState(initialValues?.date ?? todayISO())
  const [title, setTitle] = useState(initialValues?.title ?? "")
  const [amount, setAmount] = useState(
    initialValues ? String(initialValues.amount) : "",
  )
  const [errors, setErrors] = useState<IExpenseFormErrors>({})

  // 追加・編集の両フォームが同時に存在しても id が衝突しないようにする
  const idPrefix = useId()
  const titleId = `${idPrefix}-title`
  const dateId = `${idPrefix}-date`
  const amountId = `${idPrefix}-amount`

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const nextErrors = validateExpenseInput(title, amount)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    onSubmit({ date, title: title.trim(), amount: Number(amount) })
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.field}>
        <label className={styles.label} htmlFor={titleId}>
          項目名
        </label>
        <input
          id={titleId}
          className={styles.input}
          type="text"
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例: 飲み会代"
        />
        {errors.title && (
          <p className={styles.errorText} role="alert">
            {errors.title}
          </p>
        )}
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor={dateId}>
          日付
        </label>
        <input
          id={dateId}
          className={styles.input}
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor={amountId}>
          金額
        </label>
        <input
          id={amountId}
          className={styles.input}
          type="number"
          inputMode="numeric"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="例: 3000"
        />
        {errors.amount && (
          <p className={styles.errorText} role="alert">
            {errors.amount}
          </p>
        )}
      </div>

      <div className={styles.actions}>
        {onCancel && (
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onCancel}
          >
            キャンセル
          </button>
        )}
        <button className={styles.submit} type="submit">
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
