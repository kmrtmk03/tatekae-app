import { useEffect, useState } from "react";
import type { Expense } from "../types/expense";
import { loadExpenses, saveExpenses } from "../lib/storage";

export type NewExpenseInput = {
  date: string;
  title: string;
  amount: number;
};

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>(() => loadExpenses());
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    try {
      saveExpenses(expenses);
      setSaveError(null);
    } catch {
      setSaveError("保存に失敗しました。ブラウザの空き容量を確認してください。");
    }
  }, [expenses]);

  function addExpense(input: NewExpenseInput) {
    const expense: Expense = {
      id: crypto.randomUUID(),
      date: input.date,
      title: input.title,
      amount: input.amount,
      settled: false,
      createdAt: new Date().toISOString(),
    };
    setExpenses((prev) => [...prev, expense]);
  }

  function updateExpense(id: string, patch: Partial<Omit<Expense, "id">>) {
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    );
  }

  function toggleSettled(id: string) {
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, settled: !e.settled } : e)),
    );
  }

  function removeExpense(id: string) {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }

  return {
    expenses,
    saveError,
    addExpense,
    updateExpense,
    toggleSettled,
    removeExpense,
  };
}
