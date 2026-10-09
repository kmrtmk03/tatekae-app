import type {
  IExpense,
  TExpenseColor,
  TExpenseFilter,
} from "../types/expense.type"
import type { TMonthFilter } from "../types/month.type"
import { ALL_MONTHS } from "./month.utils"

/** 一覧の絞り込み条件 */
export interface IExpenseFilterCondition {
  /** 表示する精算月。ALL_MONTHS なら月では絞り込まない。それ以外は 'YYYY-MM' */
  month: TMonthFilter
  /** 清算状態。"all" なら清算状態では絞り込まない */
  status: TExpenseFilter
  /** 表示するラベル色（複数選択）。空配列なら色では絞り込まない */
  colors: TExpenseColor[]
}

/** 絞り込み条件との照合に使う、記録の項目（追加前の記録でも照合できるよう IExpense の一部だけ） */
export type TFilterableExpense = Pick<IExpense, "month" | "color" | "settled">

/**
 * 記録が絞り込み条件（月・色・清算状態のすべて）に合うかを返す。副作用のない純粋関数。
 * 追加直後の記録が一覧に出るかの判定にも使う。
 */
export function matchesFilter(
  expense: TFilterableExpense,
  { month, status, colors }: IExpenseFilterCondition,
): boolean {
  if (month !== ALL_MONTHS && expense.month !== month) return false
  if (colors.length > 0 && !colors.includes(expense.color)) return false
  if (status === "unsettled") return !expense.settled
  if (status === "settled") return expense.settled
  return true
}

/**
 * 記録を「月・色・清算状態」で絞り込んで返す。副作用のない純粋関数。
 */
export function filterExpenses(
  expenses: IExpense[],
  condition: IExpenseFilterCondition,
): IExpense[] {
  return expenses.filter((expense) => matchesFilter(expense, condition))
}

/** 色の選択を切り替えた新しい配列を返す（選択中なら外し、未選択なら末尾に加える） */
export function toggleColorSelection(
  colors: TExpenseColor[],
  color: TExpenseColor,
): TExpenseColor[] {
  return colors.includes(color)
    ? colors.filter((c) => c !== color)
    : [...colors, color]
}

/**
 * 絞り込みモーダルで設定する条件（月・色）のうち、有効なものの数（0〜2）を返す。
 * 色は何色選んでいても 1 件と数える。絞り込みボタンのバッジに使う。
 */
export function countActiveFilters(
  month: TMonthFilter,
  colors: TExpenseColor[],
): number {
  return (month !== ALL_MONTHS ? 1 : 0) + (colors.length > 0 ? 1 : 0)
}
