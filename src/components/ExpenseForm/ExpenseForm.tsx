import type { TExpenseInput } from "../../types/expense.type"
import { FormField } from "../FormField/FormField"
import { MonthPicker } from "../MonthPicker/MonthPicker"
import styles from "./ExpenseForm.module.css"
import { useExpenseForm } from "./hooks/useExpenseForm"

interface IExpenseFormProps {
  /** 初期値。未指定なら精算月は今月、項目名・金額は空（新規追加用） */
  initialValues?: TExpenseInput
  /** 送信ボタンの文言。例: 「登録する」「保存する」 */
  submitLabel: string
  /** バリデーションを通過した入力値を受け取る。フォームは送信後に自動では閉じない */
  onSubmit: (input: TExpenseInput) => void
  /** 指定するとキャンセルボタンを表示する（編集用） */
  onCancel?: () => void
}

/** 記録の追加・編集に共通する入力フォーム（項目名・精算月・金額）。状態と送信処理は useExpenseForm が持つ */
export function ExpenseForm({
  initialValues,
  submitLabel,
  onSubmit,
  onCancel,
}: IExpenseFormProps) {
  const { values, setMonth, setTitle, setAmount, errors, handleSubmit } =
    useExpenseForm({ initialValues, onSubmit })

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <FormField
        label="項目名"
        type="text"
        autoFocus
        value={values.title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="例: 飲み会代"
        error={errors.title}
      />

      <MonthPicker label="精算月" value={values.month} onChange={setMonth} />

      <FormField
        label="金額"
        type="number"
        inputMode="numeric"
        value={values.amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="例: 3000"
        error={errors.amount}
      />

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
