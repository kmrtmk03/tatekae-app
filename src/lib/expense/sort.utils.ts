import type { IExpense } from "../../types/expense.type"

/** 精算月の降順（新しいものが上）、同じ月なら作成日時の降順で並べるための比較関数 */
function compareExpensesNewestFirst(a: IExpense, b: IExpense): number {
  if (a.month !== b.month) return a.month < b.month ? 1 : -1
  if (a.createdAt !== b.createdAt) return a.createdAt < b.createdAt ? 1 : -1
  return 0
}

/**
 * 記録を新しい順（精算月の降順、同じ月なら作成日時の降順）に並べた新しい配列を返す。
 * 元の配列は変更しない。副作用のない純粋関数。
 */
export function sortExpensesNewestFirst(expenses: IExpense[]): IExpense[] {
  return [...expenses].sort(compareExpensesNewestFirst)
}
