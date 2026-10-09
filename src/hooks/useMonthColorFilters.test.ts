// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { useMonthColorFilters } from "./useMonthColorFilters"
import { ALL_MONTHS } from "../lib/month.utils"
import type { IExpense } from "../types/expense.type"

const BASE = { title: "", amount: 1, settled: false, createdAt: "" }

const EXPENSES: IExpense[] = [
  { ...BASE, id: "a", month: "2026-10", color: "red" },
  { ...BASE, id: "b", month: "2026-09", color: "blue" },
]

describe("useMonthColorFilters", () => {
  it("初期状態は絞り込みなし", () => {
    const { result } = renderHook(() => useMonthColorFilters(EXPENSES))
    expect(result.current.activeMonth).toBe(ALL_MONTHS)
    expect(result.current.selectedColors).toEqual([])
    expect(result.current.activeFilterCount).toBe(0)
  })

  it("月の選択肢は記録のある月", () => {
    const { result } = renderHook(() => useMonthColorFilters(EXPENSES))
    expect([...result.current.monthKeys].sort()).toEqual(["2026-09", "2026-10"])
  })

  it("月を選ぶと activeMonth とバッジ用の有効数に反映される", () => {
    const { result } = renderHook(() => useMonthColorFilters(EXPENSES))
    act(() => result.current.setSelectedMonth("2026-10"))
    expect(result.current.activeMonth).toBe("2026-10")
    expect(result.current.activeFilterCount).toBe(1)
  })

  it("色の選択を切り替え、解除できる", () => {
    const { result } = renderHook(() => useMonthColorFilters(EXPENSES))

    act(() => result.current.toggleColor("red"))
    act(() => result.current.toggleColor("blue"))
    expect(result.current.selectedColors).toEqual(["red", "blue"])

    act(() => result.current.toggleColor("red"))
    expect(result.current.selectedColors).toEqual(["blue"])

    act(() => result.current.clearColors())
    expect(result.current.selectedColors).toEqual([])
  })

  it("選択中の月の記録が無くなったら「すべての月」に戻る", () => {
    const { result, rerender } = renderHook(
      ({ expenses }) => useMonthColorFilters(expenses),
      { initialProps: { expenses: EXPENSES } },
    )
    act(() => result.current.setSelectedMonth("2026-10"))

    rerender({ expenses: [EXPENSES[1]] })
    expect(result.current.activeMonth).toBe(ALL_MONTHS)
  })

  it("resetFilters で月と色の両方を解除する", () => {
    const { result } = renderHook(() => useMonthColorFilters(EXPENSES))
    act(() => {
      result.current.setSelectedMonth("2026-09")
      result.current.toggleColor("blue")
    })
    expect(result.current.activeFilterCount).toBe(2)

    act(() => result.current.resetFilters())
    expect(result.current.activeMonth).toBe(ALL_MONTHS)
    expect(result.current.selectedColors).toEqual([])
  })
})
