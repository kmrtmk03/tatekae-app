// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { useExpenseFilters } from "../useExpenseFilters"
import type { IExpense } from "../../types/expense.type"

const BASE = { title: "", amount: 1 }

const EXPENSES: IExpense[] = [
  {
    ...BASE,
    id: "a",
    month: "2026-09",
    color: "red",
    settled: false,
    createdAt: "2026-09-01T00:00:00Z",
  },
  {
    ...BASE,
    id: "b",
    month: "2026-10",
    color: "blue",
    settled: true,
    createdAt: "2026-10-01T00:00:00Z",
  },
  {
    ...BASE,
    id: "c",
    month: "2026-10",
    color: "red",
    settled: false,
    createdAt: "2026-10-02T00:00:00Z",
  },
]

function ids(expenses: IExpense[]): string[] {
  return expenses.map((expense) => expense.id)
}

describe("useExpenseFilters", () => {
  it("初期状態は全件を新しい順で返す", () => {
    const { result } = renderHook(() => useExpenseFilters(EXPENSES))
    expect(ids(result.current.filteredExpenses)).toEqual(["c", "b", "a"])
  })

  it("清算状態で絞り込む", () => {
    const { result } = renderHook(() => useExpenseFilters(EXPENSES))
    act(() => result.current.setStatusFilter("unsettled"))
    expect(ids(result.current.filteredExpenses)).toEqual(["c", "a"])

    act(() => result.current.setStatusFilter("settled"))
    expect(ids(result.current.filteredExpenses)).toEqual(["b"])
  })

  it("月・色・清算状態を組み合わせて絞り込む", () => {
    const { result } = renderHook(() => useExpenseFilters(EXPENSES))
    act(() => {
      result.current.setSelectedMonth("2026-10")
      result.current.toggleColor("red")
      result.current.setStatusFilter("unsettled")
    })
    expect(ids(result.current.filteredExpenses)).toEqual(["c"])
  })

  it("空メッセージは記録の有無で変わる", () => {
    const empty = renderHook(() => useExpenseFilters([]))
    expect(empty.result.current.emptyMessage).toBe("まだ記録がありません")

    const { result } = renderHook(() => useExpenseFilters(EXPENSES))
    act(() => result.current.toggleColor("purple"))
    expect(result.current.filteredExpenses).toEqual([])
    expect(result.current.emptyMessage).toBe("該当する記録がありません")
  })

  describe("revealNewExpense", () => {
    it("追加した記録が一覧に出る条件なら絞り込みを維持する", () => {
      const { result } = renderHook(() => useExpenseFilters(EXPENSES))
      act(() => result.current.toggleColor("red"))

      act(() =>
        result.current.revealNewExpense({ month: "2026-10", color: "red" }),
      )
      expect(result.current.selectedColors).toEqual(["red"])
    })

    it("色の絞り込みで隠れるなら、絞り込みを全て解除する", () => {
      const { result } = renderHook(() => useExpenseFilters(EXPENSES))
      act(() => {
        result.current.toggleColor("red")
        result.current.setStatusFilter("unsettled")
      })

      act(() =>
        result.current.revealNewExpense({ month: "2026-10", color: "blue" }),
      )
      expect(result.current.selectedColors).toEqual([])
      expect(result.current.statusFilter).toBe("all")
    })

    it("月の絞り込みで隠れるなら、絞り込みを全て解除する", () => {
      const { result } = renderHook(() => useExpenseFilters(EXPENSES))
      act(() => result.current.setSelectedMonth("2026-09"))

      act(() =>
        result.current.revealNewExpense({ month: "2026-10", color: "red" }),
      )
      expect(result.current.activeMonth).toBe("all")
    })

    it("追加直後は未清算なので、清算済みタブでは隠れて解除される", () => {
      const { result } = renderHook(() => useExpenseFilters(EXPENSES))
      act(() => result.current.setStatusFilter("settled"))

      act(() =>
        result.current.revealNewExpense({ month: "2026-10", color: "red" }),
      )
      expect(result.current.statusFilter).toBe("all")
    })
  })
})
