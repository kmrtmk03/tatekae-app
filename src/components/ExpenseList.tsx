import type { Expense } from "../types/expense";
import { ExpenseItem } from "./ExpenseItem";
import styles from "./ExpenseList.module.css";

type Props = {
  expenses: Expense[];
  onToggleSettled: (id: string) => void;
  onEdit: (expense: Expense) => void;
  onRemove: (id: string) => void;
  emptyMessage?: string;
};

function compareExpenses(a: Expense, b: Expense): number {
  if (a.date !== b.date) return a.date < b.date ? 1 : -1;
  return a.createdAt < b.createdAt ? 1 : -1;
}

export function ExpenseList({
  expenses,
  onToggleSettled,
  onEdit,
  onRemove,
  emptyMessage = "まだ記録がありません",
}: Props) {
  if (expenses.length === 0) {
    return <p className={styles.empty}>{emptyMessage}</p>;
  }

  const sorted = [...expenses].sort(compareExpenses);

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
  );
}
