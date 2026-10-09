import type { IExpense, TExpenseFilter } from "../types/expense.type"
import type { TMonthFilter } from "../types/month.type"
import { ALL_MONTHS, getMonthKey } from "./month.utils"

/** 一覧の絞り込み条件 */
export interface IExpenseFilterCondition {
  /** 表示する月。ALL_MONTHS なら月では絞り込まない。それ以外は 'YYYY-MM' */
  month: TMonthFilter
  /** 清算状態。"all" なら清算状態では絞り込まない */
  status: TExpenseFilter
}

/**
 * 記録を「月 → 清算状態」の順で絞り込んで返す。副作用のない純粋関数。
 * 日付の形式が不正な記録は、特定の月を指定したときは除外される（ALL_MONTHS のときは残る）。
 */
export function filterExpenses(
  expenses: IExpense[],
  { month, status }: IExpenseFilterCondition,
): IExpense[] {
  const monthExpenses =
    month === ALL_MONTHS
      ? expenses
      : expenses.filter((e) => getMonthKey(e.date) === month)

  if (status === "unsettled") return monthExpenses.filter((e) => !e.settled)
  if (status === "settled") return monthExpenses.filter((e) => e.settled)
  return monthExpenses
}
