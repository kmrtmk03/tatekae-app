import { describe, expect, it } from "vitest"
import { countUnsettled, sumUnsettled } from "./summary.utils"
import type { IExpense } from "../types/expense.type"

const BASE = {
  title: "",
  month: "2026-10",
  color: "red",
  createdAt: "",
} as const

const EXPENSES: IExpense[] = [
  { ...BASE, id: "a", amount: 1000, settled: false },
  { ...BASE, id: "b", amount: 2500, settled: true },
  { ...BASE, id: "c", amount: 300, settled: false },
]

describe("sumUnsettled", () => {
  it("未清算の金額だけを合計する", () => {
    expect(sumUnsettled(EXPENSES)).toBe(1300)
  })

  it("空配列なら 0", () => {
    expect(sumUnsettled([])).toBe(0)
  })

  it("すべて清算済みなら 0", () => {
    expect(sumUnsettled([EXPENSES[1]])).toBe(0)
  })
})

describe("countUnsettled", () => {
  it("未清算の件数を数える", () => {
    expect(countUnsettled(EXPENSES)).toBe(2)
  })

  it("空配列なら 0", () => {
    expect(countUnsettled([])).toBe(0)
  })
})
