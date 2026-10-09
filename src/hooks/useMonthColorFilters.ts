import { useCallback, useState } from "react"
import { ALL_MONTHS, listMonthKeys } from "../lib/month.utils"
import type { IExpense, TExpenseColor } from "../types/expense.type"
import type { TMonthFilter } from "../types/month.type"

/**
 * 絞り込みモーダルで設定する条件（精算月・ラベル色）の状態を管理するフック。
 * 清算状態のフィルタ（ヘッダーのタブ）は対象外で、useExpenseFilters が持つ。
 *
 * - 入力: useExpenses が返す全件の expenses（月の選択肢と、選択中の月の補正に使う）
 * - 出力: FilterModal / FilterButton 用の値・操作と、filterExpenses に渡す month / colors
 */
export function useMonthColorFilters(expenses: IExpense[]) {
  // 利用者が選んだ月（ALL_MONTHS または 'YYYY-MM'）。実際に使う値は activeMonth
  const [selectedMonth, setSelectedMonth] = useState<TMonthFilter>(ALL_MONTHS)
  // 表示するラベル色（複数選択）。空配列は「すべての色」
  const [selectedColors, setSelectedColors] = useState<TExpenseColor[]>([])

  const monthKeys = listMonthKeys(expenses)

  // 選択中の月の記録が削除・編集で無くなった場合は「すべての月」に戻して扱う
  // （state を書き換えず派生値で補正するので、effect での同期は不要）
  const activeMonth: TMonthFilter =
    selectedMonth !== ALL_MONTHS && monthKeys.includes(selectedMonth)
      ? selectedMonth
      : ALL_MONTHS

  // 絞り込みが有効な条件（月・色）の数。絞り込みボタンのバッジに使う
  const activeFilterCount =
    (activeMonth !== ALL_MONTHS ? 1 : 0) + (selectedColors.length > 0 ? 1 : 0)

  /** 指定した色の選択を切り替える（選択中なら外し、未選択なら加える） */
  const toggleColor = useCallback((color: TExpenseColor) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color],
    )
  }, [])

  /** 色の絞り込みを解除して「すべての色」に戻す */
  const clearColors = useCallback(() => {
    setSelectedColors([])
  }, [])

  /** 月と色の絞り込みを解除する */
  const resetFilters = useCallback(() => {
    setSelectedMonth(ALL_MONTHS)
    setSelectedColors([])
  }, [])

  return {
    // 月フィルタ（monthKeys は選択肢、activeMonth は現在の選択）
    monthKeys,
    activeMonth,
    setSelectedMonth,
    // ラベル色フィルタ（複数選択。空なら絞り込みなし）
    selectedColors,
    toggleColor,
    clearColors,
    // 月・色をまとめて扱う（絞り込みボタン・モーダル用）
    activeFilterCount,
    resetFilters,
  }
}
