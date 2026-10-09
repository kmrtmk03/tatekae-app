// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import { ExpenseItem } from "./ExpenseItem"
import type { IExpense } from "../../types/expense.type"

const EXPENSE: IExpense = {
  id: "a",
  month: "2026-10",
  title: "飲み会代",
  amount: 3000,
  settled: false,
  color: "red",
  createdAt: "2026-10-01T00:00:00Z",
}

function renderItem(expense: IExpense = EXPENSE) {
  const handlers = {
    onToggleSettled: vi.fn(),
    onEdit: vi.fn(),
    onRemove: vi.fn(),
  }
  render(
    <ul>
      <ExpenseItem expense={expense} {...handlers} />
    </ul>,
  )
  return handlers
}

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe("ExpenseItem", () => {
  it("項目名・精算月・金額を表示する", () => {
    renderItem()
    expect(screen.getByText("飲み会代")).toBeTruthy()
    expect(screen.getByText("2026年10月")).toBeTruthy()
    expect(screen.getByText("¥3,000")).toBeTruthy()
  })

  it("清算チェックの状態を expense.settled に合わせる", () => {
    renderItem({ ...EXPENSE, settled: true })
    const checkbox = screen.getByRole<HTMLInputElement>("checkbox")
    expect(checkbox.checked).toBe(true)
  })

  it("チェックを押すと onToggleSettled が id 付きで呼ばれる", async () => {
    const { onToggleSettled } = renderItem()
    await userEvent.click(screen.getByRole("checkbox"))
    expect(onToggleSettled).toHaveBeenCalledWith("a")
  })

  it("編集ボタンで onEdit が記録付きで呼ばれる", async () => {
    const { onEdit } = renderItem()
    await userEvent.click(
      screen.getByRole("button", { name: "飲み会代を編集" }),
    )
    expect(onEdit).toHaveBeenCalledWith(EXPENSE)
  })

  it("削除は確認で OK のときだけ onRemove が呼ばれる", async () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(true)
    const { onRemove } = renderItem()
    await userEvent.click(
      screen.getByRole("button", { name: "飲み会代を削除" }),
    )
    expect(confirm).toHaveBeenCalledWith("「飲み会代」を削除しますか？")
    expect(onRemove).toHaveBeenCalledWith("a")
  })

  it("削除の確認でキャンセルすると onRemove は呼ばれない", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(false)
    const { onRemove } = renderItem()
    await userEvent.click(
      screen.getByRole("button", { name: "飲み会代を削除" }),
    )
    expect(onRemove).not.toHaveBeenCalled()
  })
})
