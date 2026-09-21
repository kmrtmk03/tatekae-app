import type { Expense } from "../types/expense";
import { formatAmount, formatDate } from "../lib/format";
import styles from "./ExpenseItem.module.css";

type Props = {
  expense: Expense;
  onToggleSettled: (id: string) => void;
  onRemove: (id: string) => void;
};

export function ExpenseItem({ expense, onToggleSettled, onRemove }: Props) {
  const checkboxId = `settled-${expense.id}`;

  function handleRemove() {
    if (window.confirm(`「${expense.title}」を削除しますか？`)) {
      onRemove(expense.id);
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
      <span className={styles.date}>{formatDate(expense.date)}</span>
      <span className={styles.title}>{expense.title}</span>
      <span className={styles.amount}>{formatAmount(expense.amount)}</span>
      <button type="button" onClick={handleRemove}>
        削除
      </button>
    </li>
  );
}
