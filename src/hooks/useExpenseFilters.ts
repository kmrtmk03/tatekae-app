import { useCallback, useState } from "react"
import { filterExpenses, matchesFilter } from "../lib/expense/filter.utils"
import type { TFilterableExpense } from "../lib/expense/filter.utils"
import { sortExpensesNewestFirst } from "../lib/expense/sort.utils"
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
  const {
    monthKeys,
    activeMonth,
    setSelectedMonth,
    selectedColors,
    toggleColor,
    clearColors,
    activeFilterCount,
    resetFilters: resetMonthColorFilters,
  } = useMonthColorFilters(expenses)

  // 絞り込んだあとに新しい順へ並べる（一覧の並び順はここで決まる）
  const filteredExpenses = sortExpensesNewestFirst(
    filterExpenses(expenses, {
      month: activeMonth,
      colors: selectedColors,
      status: statusFilter,
    }),
  )

  /**
   * 追加した記録が今の絞り込み条件に合わないときだけ、絞り込みを全て解除して一覧に出す。
   * 呼び忘れると、登録しても一覧に現れず保存失敗と区別がつかない。追加の直後に、追加した記録の項目を渡して呼ぶこと。
   * 追加直後の記録は未清算なので、清算状態は "settled" のときだけ合わなくなる。
   */
  const revealNewExpense = useCallback(
    (added: Pick<TFilterableExpense, "month" | "color">) => {
      const isVisible = matchesFilter(
        { ...added, settled: false },
        { month: activeMonth, colors: selectedColors, status: statusFilter },
      )
      if (isVisible) return
      resetMonthColorFilters()
      setStatusFilter("all")
    },
    [activeMonth, selectedColors, statusFilter, resetMonthColorFilters],
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
    // 月フィルタ（monthKeys は選択肢、activeMonth は現在の選択）
    monthKeys,
    activeMonth,
    setSelectedMonth,
    // ラベル色フィルタ（複数選択。空なら絞り込みなし）
    selectedColors,
    toggleColor,
    clearColors,
    // 月・色フィルタの有効数（バッジ用）と解除
    activeFilterCount,
    resetFilters: resetMonthColorFilters,
    // 追加した記録が絞り込みで隠れないようにする
    revealNewExpense,
  }
}
