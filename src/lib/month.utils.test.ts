import { describe, expect, it } from "vitest"
import {
  currentMonthKey,
  isMonthFilter,
  isMonthKey,
  listMonthKeys,
  parseMonthKey,
  toMonthKey,
} from "./month.utils"
import type { IExpense } from "../types/expense.type"

describe("isMonthKey", () => {
  it("YYYY-MM（月は 01〜12）だけを月キーとして受け入れる", () => {
    expect(isMonthKey("2026-10")).toBe(true)
    expect(isMonthKey("2026-01")).toBe(true)
    expect(isMonthKey("2026-12")).toBe(true)
    expect(isMonthKey("2026-00")).toBe(false)
    expect(isMonthKey("2026-13")).toBe(false)
    expect(isMonthKey("2026-1")).toBe(false)
    expect(isMonthKey("2026-10-01")).toBe(false)
    expect(isMonthKey("")).toBe(false)
  })
})

describe("isMonthFilter", () => {
  it("all と月キーを受け入れる", () => {
    expect(isMonthFilter("all")).toBe(true)
    expect(isMonthFilter("2026-10")).toBe(true)
    expect(isMonthFilter("2026-13")).toBe(false)
  })
})

describe("parseMonthKey / toMonthKey", () => {
  it("月キーと年・月を相互に変換できる", () => {
    expect(parseMonthKey("2026-03")).toEqual({ year: 2026, month: 3 })
    expect(toMonthKey(2026, 3)).toBe("2026-03")
    expect(toMonthKey(2026, 12)).toBe("2026-12")
  })

  it("月キーにならない年月は null を返す", () => {
    expect(toMonthKey(2026, 0)).toBeNull()
    expect(toMonthKey(2026, 13)).toBeNull()
    expect(toMonthKey(12345, 1)).toBeNull()
  })
})

describe("currentMonthKey", () => {
  it("今月の月キーを返す", () => {
    const now = new Date()
    expect(currentMonthKey()).toBe(
      toMonthKey(now.getFullYear(), now.getMonth() + 1),
    )
  })
})

describe("listMonthKeys", () => {
  it("記録が存在する月を重複なく新しい順に返す", () => {
    const base = {
      id: "",
      title: "",
      amount: 1,
      settled: false,
      color: "blue",
      createdAt: "",
    } as const
    const expenses: IExpense[] = [
      { ...base, month: "2026-09" },
      { ...base, month: "2026-10" },
      { ...base, month: "2026-09" },
      { ...base, month: "2025-12" },
    ]
    expect(listMonthKeys(expenses)).toEqual(["2026-10", "2026-09", "2025-12"])
  })
})
