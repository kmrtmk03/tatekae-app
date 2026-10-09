// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { useModalState } from "./useModalState"
import type { IExpense } from "../types/expense.type"

const EXPENSE: IExpense = {
  id: "a",
  month: "2026-10",
  title: "飲み会代",
  amount: 3000,
  settled: false,
  color: "red",
  createdAt: "2026-10-01T00:00:00Z",
}

describe("useModalState", () => {
  it("初期状態は閉じている", () => {
    const { result } = renderHook(() => useModalState([EXPENSE]))
    expect(result.current.modal).toEqual({ type: "closed" })
    expect(result.current.editingExpense).toBeUndefined()
  })

  it("追加・絞り込みモーダルを開き、閉じられる", () => {
    const { result } = renderHook(() => useModalState([EXPENSE]))

    act(() => result.current.openAddModal())
    expect(result.current.modal.type).toBe("add")

    act(() => result.current.openFilterModal())
    expect(result.current.modal.type).toBe("filter")

    act(() => result.current.closeModal())
    expect(result.current.modal.type).toBe("closed")
  })

  it("編集モーダルを開くと対象の記録を返す", () => {
    const { result } = renderHook(() => useModalState([EXPENSE]))
    act(() => result.current.openEditModal(EXPENSE))
    expect(result.current.modal).toEqual({ type: "edit", id: "a" })
    expect(result.current.editingExpense).toEqual(EXPENSE)
  })

  it("編集中に記録が更新されたら最新の内容を返す", () => {
    const { result, rerender } = renderHook(
      ({ expenses }) => useModalState(expenses),
      { initialProps: { expenses: [EXPENSE] } },
    )
    act(() => result.current.openEditModal(EXPENSE))

    rerender({ expenses: [{ ...EXPENSE, title: "更新後" }] })
    expect(result.current.editingExpense?.title).toBe("更新後")
  })

  it("編集対象の記録が無くなったら editingExpense は undefined", () => {
    const { result, rerender } = renderHook(
      ({ expenses }) => useModalState(expenses),
      { initialProps: { expenses: [EXPENSE] } },
    )
    act(() => result.current.openEditModal(EXPENSE))

    rerender({ expenses: [] })
    expect(result.current.editingExpense).toBeUndefined()
  })

  it("返す関数は再レンダリングしても参照が変わらない", () => {
    const { result, rerender } = renderHook(() => useModalState([EXPENSE]))
    const before = result.current
    rerender()
    expect(result.current.openAddModal).toBe(before.openAddModal)
    expect(result.current.openEditModal).toBe(before.openEditModal)
    expect(result.current.openFilterModal).toBe(before.openFilterModal)
    expect(result.current.closeModal).toBe(before.closeModal)
  })
})
