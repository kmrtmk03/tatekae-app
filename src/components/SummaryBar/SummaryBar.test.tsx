// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { SummaryBar } from "./SummaryBar"
import type { IExpense } from "../../types/expense.type"

afterEach(cleanup)

const BASE = {
  title: "",
  month: "2026-10",
  color: "red",
  createdAt: "",
} as const

describe("SummaryBar", () => {
  it("未清算の合計金額と件数を表示する", () => {
    const expenses: IExpense[] = [
      { ...BASE, id: "a", amount: 1000, settled: false },
      { ...BASE, id: "b", amount: 5000, settled: true },
      { ...BASE, id: "c", amount: 2345, settled: false },
    ]
    render(<SummaryBar expenses={expenses} />)
    expect(screen.getByText("¥3,345")).toBeTruthy()
    expect(screen.getByText("未清算 2件")).toBeTruthy()
  })

  it("記録が無いときは 0 を表示する", () => {
    render(<SummaryBar expenses={[]} />)
    expect(screen.getByText("¥0")).toBeTruthy()
    expect(screen.getByText("未清算 0件")).toBeTruthy()
  })
})
