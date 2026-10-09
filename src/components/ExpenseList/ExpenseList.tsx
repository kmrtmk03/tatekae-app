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

/** 記録の一覧。渡された順にそのまま表示するため、並べ替えは呼び出し側（useExpenseFilters）で済ませておくこと */
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

  return (
    <ul className={styles.list}>
      {expenses.map((expense) => (
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
