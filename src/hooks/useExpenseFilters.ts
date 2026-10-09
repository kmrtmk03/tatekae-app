import { useState } from "react"
import { filterExpenses } from "../lib/filter.utils"
import { ALL_MONTHS, listMonthKeys } from "../lib/month.utils"
import type { IExpense, TExpenseFilter } from "../types/expense.type"
import type { TMonthFilter } from "../types/month.type"

/** 記録が1件もないときの一覧メッセージ */
const EMPTY_MESSAGE_NO_RECORDS = "まだ記録がありません"
/** 記録はあるが、絞り込み条件に該当するものがないときの一覧メッセージ */
const EMPTY_MESSAGE_NO_MATCH = "該当する記録がありません"

/**
 * 一覧の絞り込み状態（月・清算状態）と、絞り込み後の記録を管理するフック。
 *
 * - 入力: useExpenses が返す全件の expenses
 * - 出力: ExpenseList に渡す filteredExpenses と、フィルタ UI（MonthFilter / FilterTabs）用の値・操作
 *
 * MEMO: 未清算合計などのサマリーは絞り込み前の全件で計算するため、
 * SummaryBar には filteredExpenses ではなく元の expenses を渡すこと。
 */
export function useExpenseFilters(expenses: IExpense[]) {
  const [statusFilter, setStatusFilter] = useState<TExpenseFilter>("all")
  // 利用者が選んだ月（ALL_MONTHS または 'YYYY-MM'）。実際に使う値は activeMonth
  const [selectedMonth, setSelectedMonth] = useState<TMonthFilter>(ALL_MONTHS)

  const monthKeys = listMonthKeys(expenses)

  // 選択中の月の記録が削除・編集で無くなった場合は「すべての月」に戻して扱う
  // （state を書き換えず派生値で補正するので、effect での同期は不要）
  const activeMonth: TMonthFilter =
    selectedMonth !== ALL_MONTHS && monthKeys.includes(selectedMonth)
      ? selectedMonth
      : ALL_MONTHS

  const filteredExpenses = filterExpenses(expenses, {
    month: activeMonth,
    status: statusFilter,
  })

  const emptyMessage =
    expenses.length === 0 ? EMPTY_MESSAGE_NO_RECORDS : EMPTY_MESSAGE_NO_MATCH

  return {
    // 絞り込み後の記録と、0件時のメッセージ
    filteredExpenses,
    emptyMessage,
    // 清算状態フィルタ
    statusFilter,
    setStatusFilter,
    // 月フィルタ（monthKeys は選択肢、activeMonth は現在の選択）
    monthKeys,
    activeMonth,
    setSelectedMonth,
  }
}
