import { useState } from "react"
import { filterExpenses } from "../lib/filter.utils"
import { sortExpensesNewestFirst } from "../lib/sort.utils"
import type { IExpense, TExpenseFilter } from "../types/expense.type"
import { useMonthColorFilters } from "./useMonthColorFilters"

/** 記録が1件もないときの一覧メッセージ */
const EMPTY_MESSAGE_NO_RECORDS = "まだ記録がありません"
/** 記録はあるが、絞り込み条件に該当するものがないときの一覧メッセージ */
const EMPTY_MESSAGE_NO_MATCH = "該当する記録がありません"

/**
 * 一覧の絞り込み状態（月・ラベル色・清算状態）と、絞り込み後の記録を管理するフック。
 *
 * - 入力: useExpenses が返す全件の expenses
 * - 出力: ExpenseList に渡す、絞り込み後かつ新しい順に並べた filteredExpenses と、フィルタ UI（FilterModal / FilterTabs）用の値・操作
 * - 月・色の状態は useMonthColorFilters、清算状態はここで持つ
 *
 * MEMO: 未清算合計などのサマリーは絞り込み前の全件で計算するため、
 * SummaryBar には filteredExpenses ではなく元の expenses を渡すこと。
 */
export function useExpenseFilters(expenses: IExpense[]) {
  const [statusFilter, setStatusFilter] = useState<TExpenseFilter>("all")
  const monthColorFilters = useMonthColorFilters(expenses)
  const { activeMonth, selectedColors } = monthColorFilters

  // 絞り込んだあとに新しい順へ並べる（一覧の並び順はここで決まる）
  const filteredExpenses = sortExpensesNewestFirst(
    filterExpenses(expenses, {
      month: activeMonth,
      colors: selectedColors,
      status: statusFilter,
    }),
  )

  const emptyMessage =
    expenses.length === 0 ? EMPTY_MESSAGE_NO_RECORDS : EMPTY_MESSAGE_NO_MATCH

  return {
    // 絞り込み後の記録と、0件時のメッセージ
    filteredExpenses,
    emptyMessage,
    // 清算状態フィルタ
    statusFilter,
    setStatusFilter,
    // 月・色フィルタ（絞り込みモーダル用。内訳は useMonthColorFilters を参照）
    ...monthColorFilters,
  }
}
