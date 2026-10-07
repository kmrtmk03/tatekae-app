import type { IExpense } from "../../types/expense.type"
import { ExpenseItem } from "../ExpenseItem/ExpenseItem"
import styles from "./ExpenseList.module.css"

interface IExpenseListProps {
  expenses: IExpense[]
  onToggleSettled: (id: string) => void
  onEdit: (expense: IExpense) => void
  onRemove: (id: string) => void
  /** 表示する記録が0件のときに出すメッセージ */
  emptyMessage: string
}

/** 日付の降順（新しいものが上）、同日なら作成日時の降順で並べるための比較関数 */
function compareExpenses(a: IExpense, b: IExpense): number {
  if (a.date !== b.date) return a.date < b.date ? 1 : -1
  return a.createdAt < b.createdAt ? 1 : -1
}

/** 記録の一覧。並べ替えはここで行うため、呼び出し側は順不同の配列を渡してよい */
export function ExpenseList({
  expenses,
  onToggleSettled,
  onEdit,
  onRemove,
  emptyMessage,
}: IExpenseListProps) {
  if (expenses.length === 0) {
    return <p className={styles.empty}>{emptyMessage}</p>
  }

  const sorted = [...expenses].sort(compareExpenses)

  return (
    <ul className={styles.list}>
      {sorted.map((expense) => (
        <ExpenseItem
          key={expense.id}
          expense={expense}
          onToggleSettled={onToggleSettled}
          onEdit={onEdit}
          onRemove={onRemove}
        />
      ))}
    </ul>
  )
}
