import type { IExpense } from "../types/expense.type"
import { ExpenseItem } from "./ExpenseItem"
import styles from "./ExpenseList.module.css"

interface IExpenseListProps {
  expenses: IExpense[]
  onToggleSettled: (id: string) => void
  onEdit: (expense: IExpense) => void
  onRemove: (id: string) => void
  emptyMessage?: string
}

function compareExpenses(a: IExpense, b: IExpense): number {
  if (a.date !== b.date) return a.date < b.date ? 1 : -1
  return a.createdAt < b.createdAt ? 1 : -1
}

export function ExpenseList({
  expenses,
  onToggleSettled,
  onEdit,
  onRemove,
  emptyMessage = "まだ記録がありません",
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
