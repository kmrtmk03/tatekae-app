import type { IExpense } from "../types/expense.type"

/** 未清算の記録の合計金額を返す */
export function sumUnsettled(expenses: IExpense[]): number {
  return expenses
    .filter((e) => !e.settled)
    .reduce((total, e) => total + e.amount, 0)
}

/** 未清算の記録の件数を返す */
export function countUnsettled(expenses: IExpense[]): number {
  return expenses.filter((e) => !e.settled).length
}

/** すべての記録の合計金額を返す（清算済み含む） */
export function sumAll(expenses: IExpense[]): number {
  return expenses.reduce((total, e) => total + e.amount, 0)
}
