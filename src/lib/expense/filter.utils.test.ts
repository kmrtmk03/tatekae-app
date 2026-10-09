import { describe, expect, it } from "vitest"
import {
  countActiveFilters,
  filterExpenses,
  matchesFilter,
  toggleColorSelection,
} from "./filter.utils"
import type { IExpenseFilterCondition } from "./filter.utils"
import type { IExpense } from "../../types/expense.type"

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
      colors: [],
      status: "all",
    })
    expect(ids(result)).toEqual(["a", "b", "c"])
  })

  it("色だけで絞り込む", () => {
    const result = filterExpenses(EXPENSES, {
      month: "all",
      colors: ["red"],
      status: "all",
    })
    expect(ids(result)).toEqual(["a", "c"])
  })

  it("複数の色を指定したら、いずれかに一致する記録を残す", () => {
    const result = filterExpenses(EXPENSES, {
      month: "all",
      colors: ["red", "blue"],
      status: "all",
    })
    expect(ids(result)).toEqual(["a", "b", "c"])
    const onlyBlue = filterExpenses(EXPENSES, {
      month: "all",
      colors: ["blue", "green"],
      status: "all",
    })
    expect(ids(onlyBlue)).toEqual(["b"])
  })

  it("月・色・清算状態を組み合わせて絞り込む", () => {
    expect(
      ids(
        filterExpenses(EXPENSES, {
          month: "2026-10",
          colors: ["red"],
          status: "unsettled",
        }),
      ),
    ).toEqual(["a"])
    expect(
      ids(
        filterExpenses(EXPENSES, {
          month: "2026-09",
          colors: ["red"],
          status: "unsettled",
        }),
      ),
    ).toEqual([])
  })
})

describe("matchesFilter", () => {
  const added = { month: "2026-10", color: "blue", settled: false } as const

  it("月・色・清算状態のすべてに合うときだけ true", () => {
    const all: IExpenseFilterCondition = {
      month: "all",
      colors: [],
      status: "all",
    }
    expect(matchesFilter(added, all)).toBe(true)
    expect(matchesFilter(added, { ...all, month: "2026-09" })).toBe(false)
    expect(matchesFilter(added, { ...all, colors: ["red"] })).toBe(false)
    expect(matchesFilter(added, { ...all, colors: ["red", "blue"] })).toBe(true)
    expect(matchesFilter(added, { ...all, status: "settled" })).toBe(false)
    expect(matchesFilter(added, { ...all, status: "unsettled" })).toBe(true)
  })
})

describe("toggleColorSelection", () => {
  it("未選択なら加え、選択中なら外す（元の配列は変えない）", () => {
    const original = ["red"] as const
    expect(toggleColorSelection([...original], "blue")).toEqual(["red", "blue"])
    expect(toggleColorSelection(["red", "blue"], "red")).toEqual(["blue"])
    expect(toggleColorSelection(["red"], "red")).toEqual([])
    expect(original).toEqual(["red"])
  })
})

describe("countActiveFilters", () => {
  it("月と色のうち有効なものの数を返し、色は何色選んでも 1 と数える", () => {
    expect(countActiveFilters("all", [])).toBe(0)
    expect(countActiveFilters("2026-10", [])).toBe(1)
    expect(countActiveFilters("all", ["red", "blue"])).toBe(1)
    expect(countActiveFilters("2026-10", ["red", "blue"])).toBe(2)
  })
})
