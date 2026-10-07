import type { IExpense } from "../types/expense.type"
import { formatAmount, formatDate } from "../lib/format.utils"
import styles from "./ExpenseItem.module.css"

interface IExpenseItemProps {
  expense: IExpense
  onToggleSettled: (id: string) => void
  onEdit: (expense: IExpense) => void
  onRemove: (id: string) => void
}

/**
 * 記録 1 行分の表示。清算チェック・編集・削除の操作を持つ。
 * 削除は誤タップ防止のため確認ダイアログを挟んでから onRemove を呼ぶ。
 */
export function ExpenseItem({
  expense,
  onToggleSettled,
  onEdit,
  onRemove,
}: IExpenseItemProps) {
  const checkboxId = `settled-${expense.id}`

  function handleRemove() {
    if (window.confirm(`「${expense.title}」を削除しますか？`)) {
      onRemove(expense.id)
    }
  }

  return (
    <li className={`${styles.item} ${expense.settled ? styles.settled : ""}`}>
      <label htmlFor={checkboxId} className={styles.checkboxLabel}>
        <input
          id={checkboxId}
          type="checkbox"
          checked={expense.settled}
          onChange={() => onToggleSettled(expense.id)}
        />
      </label>
      <div className={styles.content}>
        <span className={styles.title}>{expense.title}</span>
        <span className={styles.date}>{formatDate(expense.date)}</span>
      </div>
      <span className={styles.amount}>{formatAmount(expense.amount)}</span>
      <button
        type="button"
        className={styles.editButton}
        onClick={() => onEdit(expense)}
        aria-label={`${expense.title}を編集`}
      >
        ✎
      </button>
      <button
        type="button"
        className={styles.deleteButton}
        onClick={handleRemove}
        aria-label={`${expense.title}を削除`}
      >
        ×
      </button>
    </li>
  )
}
