import type {
  IExpense,
  TExpenseColorFilter,
  TExpenseFilter,
} from "../types/expense.type"
import type { TMonthFilter } from "../types/month.type"
import { ALL_COLORS } from "./expense-color.constants"
import { ALL_MONTHS } from "./month.utils"

/** 一覧の絞り込み条件 */
export interface IExpenseFilterCondition {
  /** 表示する精算月。ALL_MONTHS なら月では絞り込まない。それ以外は 'YYYY-MM' */
  month: TMonthFilter
  /** 清算状態。"all" なら清算状態では絞り込まない */
  status: TExpenseFilter
  /** ラベル色。ALL_COLORS なら色では絞り込まない */
  color: TExpenseColorFilter
}

/**
 * 記録を「月 → 色 → 清算状態」の順で絞り込んで返す。副作用のない純粋関数。
 */
export function filterExpenses(
  expenses: IExpense[],
  { month, status, color }: IExpenseFilterCondition,
): IExpense[] {
  const monthExpenses =
    month === ALL_MONTHS ? expenses : expenses.filter((e) => e.month === month)
  const colorExpenses =
    color === ALL_COLORS
      ? monthExpenses
      : monthExpenses.filter((e) => e.color === color)

  if (status === "unsettled") return colorExpenses.filter((e) => !e.settled)
  if (status === "settled") return colorExpenses.filter((e) => e.settled)
  return colorExpenses
}
