import type { Expense } from "../types/expense";
import { ExpenseItem } from "./ExpenseItem";

type Props = {
  expenses: Expense[];
  onToggleSettled: (id: string) => void;
  onRemove: (id: string) => void;
};

function compareExpenses(a: Expense, b: Expense): number {
  if (a.date !== b.date) return a.date < b.date ? 1 : -1;
  return a.createdAt < b.createdAt ? 1 : -1;
}

export function ExpenseList({ expenses, onToggleSettled, onRemove }: Props) {
  if (expenses.length === 0) {
    return <p>まだ記録がありません</p>;
  }

  const sorted = [...expenses].sort(compareExpenses);

  return (
    <ul>
      {sorted.map((expense) => (
        <ExpenseItem
          key={expense.id}
          expense={expense}
          onToggleSettled={onToggleSettled}
          onRemove={onRemove}
        />
      ))}
    </ul>
  );
}
