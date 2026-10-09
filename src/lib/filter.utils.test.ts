import { describe, expect, it } from "vitest"
import { filterExpenses } from "./filter.utils"
import type { IExpense } from "../types/expense.type"

const BASE = { title: "", amount: 1, createdAt: "" }

const EXPENSES: IExpense[] = [
  { ...BASE, id: "a", month: "2026-10", color: "red", settled: false },
  { ...BASE, id: "b", month: "2026-10", color: "blue", settled: true },
  { ...BASE, id: "c", month: "2026-09", color: "red", settled: true },
]

function ids(expenses: IExpense[]): string[] {
  return expenses.map((expense) => expense.id)
}

describe("filterExpenses", () => {
  it("すべて指定なら絞り込まない", () => {
    const result = filterExpenses(EXPENSES, {
      month: "all",
      color: "all",
      status: "all",
    })
    expect(ids(result)).toEqual(["a", "b", "c"])
  })

  it("色だけで絞り込む", () => {
    const result = filterExpenses(EXPENSES, {
      month: "all",
      color: "red",
      status: "all",
    })
    expect(ids(result)).toEqual(["a", "c"])
  })

  it("月・色・清算状態を組み合わせて絞り込む", () => {
    expect(
      ids(
        filterExpenses(EXPENSES, {
          month: "2026-10",
          color: "red",
          status: "unsettled",
        }),
      ),
    ).toEqual(["a"])
    expect(
      ids(
        filterExpenses(EXPENSES, {
          month: "2026-09",
          color: "red",
          status: "unsettled",
        }),
      ),
    ).toEqual([])
  })
})
