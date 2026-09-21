import { useRef, useState } from "react";
import type { FormEvent } from "react";
import type { NewExpenseInput } from "../hooks/useExpenses";

type Props = {
  onSubmit: (input: NewExpenseInput) => void;
};

type Errors = {
  title?: string;
  amount?: string;
};

function todayISO(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function ExpenseForm({ onSubmit }: Props) {
  const [date, setDate] = useState(todayISO);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const titleInputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const trimmedTitle = title.trim();
    const amountValue = Number(amount);
    const nextErrors: Errors = {};

    if (trimmedTitle === "") {
      nextErrors.title = "項目名を入力してください";
    }
    if (amount.trim() === "" || Number.isNaN(amountValue) || amountValue <= 0) {
      nextErrors.amount = "金額は1円以上の数値を入力してください";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmit({ date, title: trimmedTitle, amount: amountValue });

    setTitle("");
    setAmount("");
    titleInputRef.current?.focus();
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div>
        <label htmlFor="expense-date">日付</label>
        <input
          id="expense-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="expense-title">項目名</label>
        <input
          id="expense-title"
          type="text"
          ref={titleInputRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例: 飲み会代"
        />
        {errors.title && <p role="alert">{errors.title}</p>}
      </div>

      <div>
        <label htmlFor="expense-amount">金額</label>
        <input
          id="expense-amount"
          type="number"
          inputMode="numeric"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="例: 3000"
        />
        {errors.amount && <p role="alert">{errors.amount}</p>}
      </div>

      <button type="submit">登録</button>
    </form>
  );
}
