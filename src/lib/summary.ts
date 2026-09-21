import type { Expense } from "../types/expense";

/** 未清算の記録の合計金額を返す */
export function sumUnsettled(expenses: Expense[]): number {
  return expenses
    .filter((e) => !e.settled)
    .reduce((total, e) => total + e.amount, 0);
}

/** すべての記録の合計金額を返す（清算済み含む） */
export function sumAll(expenses: Expense[]): number {
  return expenses.reduce((total, e) => total + e.amount, 0);
}
