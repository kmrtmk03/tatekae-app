import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { Expense } from "../types/expense";
import { validateExpenseInput } from "../lib/validation";
import formStyles from "./ExpenseForm.module.css";
import styles from "./EditExpenseModal.module.css";

type Props = {
  expense: Expense;
  onSave: (id: string, patch: Pick<Expense, "date" | "title" | "amount">) => void;
  onClose: () => void;
};

export function EditExpenseModal({ expense, onSave, onClose }: Props) {
  const [date, setDate] = useState(expense.date);
  const [title, setTitle] = useState(expense.title);
  const [amount, setAmount] = useState(String(expense.amount));
  const [errors, setErrors] = useState<ReturnType<typeof validateExpenseInput>>(
    {},
  );

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const nextErrors = validateExpenseInput(title, amount);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSave(expense.id, { date, title: title.trim(), amount: Number(amount) });
    onClose();
  }

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.panel} role="dialog" aria-modal="true" aria-label="記録を編集">
        <div className={styles.headerRow}>
          <h2 className={styles.title}>記録を編集</h2>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="閉じる"
          >
            ×
          </button>
        </div>

        <form className={formStyles.form} onSubmit={handleSubmit} noValidate>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="edit-expense-title">
              項目名
            </label>
            <input
              id="edit-expense-title"
              className={formStyles.input}
              type="text"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            {errors.title && (
              <p className={formStyles.errorText} role="alert">
                {errors.title}
              </p>
            )}
          </div>

          <div className={formStyles.row}>
            <div className={formStyles.field}>
              <label className={formStyles.label} htmlFor="edit-expense-date">
                日付
              </label>
              <input
                id="edit-expense-date"
                className={formStyles.input}
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className={formStyles.field}>
              <label className={formStyles.label} htmlFor="edit-expense-amount">
                金額
              </label>
              <input
                id="edit-expense-amount"
                className={formStyles.input}
                type="number"
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>
          {errors.amount && (
            <p className={formStyles.errorText} role="alert">
              {errors.amount}
            </p>
          )}

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
            >
              キャンセル
            </button>
            <button type="submit" className={styles.saveButton}>
              保存する
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
