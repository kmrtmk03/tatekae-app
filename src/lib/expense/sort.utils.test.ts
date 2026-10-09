import { describe, expect, it } from "vitest"
import { sortExpensesNewestFirst } from "./sort.utils"
import type { IExpense } from "../../types/expense.type"

const BASE = { title: "", amount: 1, settled: false, color: "red" } as const

function createExpense(
  id: string,
  month: IExpense["month"],
  createdAt: string,
): IExpense {
  return { ...BASE, id, month, createdAt }
}

describe("sortExpensesNewestFirst", () => {
  it("精算月の降順に並べる", () => {
    const result = sortExpensesNewestFirst([
      createExpense("a", "2026-08", "2026-01-01T00:00:00Z"),
      createExpense("b", "2026-10", "2026-01-01T00:00:00Z"),
      createExpense("c", "2026-09", "2026-01-01T00:00:00Z"),
    ])
    expect(result.map((e) => e.id)).toEqual(["b", "c", "a"])
  })

  it("同じ月は作成日時の降順に並べる", () => {
    const result = sortExpensesNewestFirst([
      createExpense("a", "2026-10", "2026-10-01T00:00:00Z"),
      createExpense("b", "2026-10", "2026-10-03T00:00:00Z"),
      createExpense("c", "2026-10", "2026-10-02T00:00:00Z"),
    ])
    expect(result.map((e) => e.id)).toEqual(["b", "c", "a"])
  })

  it("年をまたいでも精算月の新しい順になる", () => {
    const result = sortExpensesNewestFirst([
      createExpense("a", "2025-12", "2025-12-01T00:00:00Z"),
      createExpense("b", "2026-01", "2026-01-01T00:00:00Z"),
    ])
    expect(result.map((e) => e.id)).toEqual(["b", "a"])
  })

  it("元の配列を変更しない", () => {
    const input = [
      createExpense("a", "2026-08", "2026-01-01T00:00:00Z"),
      createExpense("b", "2026-10", "2026-01-01T00:00:00Z"),
    ]
    sortExpensesNewestFirst(input)
    expect(input.map((e) => e.id)).toEqual(["a", "b"])
  })

  it("空配列は空配列を返す", () => {
    expect(sortExpensesNewestFirst([])).toEqual([])
  })
})
