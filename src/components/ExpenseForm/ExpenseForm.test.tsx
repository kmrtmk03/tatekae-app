// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import { ExpenseForm } from "./ExpenseForm"

afterEach(cleanup)

describe("ExpenseForm", () => {
  it("正しい入力で送信すると onSubmit に変換済みの値が渡る", async () => {
    const onSubmit = vi.fn()
    render(
      <ExpenseForm
        initialValues={{ month: "2026-10", title: "", amount: 1 }}
        submitLabel="登録する"
        onSubmit={onSubmit}
      />,
    )

    await userEvent.type(screen.getByLabelText("項目名"), "飲み会代")
    await userEvent.clear(screen.getByLabelText("金額"))
    await userEvent.type(screen.getByLabelText("金額"), "3000")
    await userEvent.click(screen.getByRole("button", { name: "登録する" }))

    expect(onSubmit).toHaveBeenCalledWith({
      month: "2026-10",
      title: "飲み会代",
      amount: 3000,
    })
  })

  it("未入力で送信するとエラーを表示し onSubmit は呼ばれない", async () => {
    const onSubmit = vi.fn()
    render(<ExpenseForm submitLabel="登録する" onSubmit={onSubmit} />)

    await userEvent.click(screen.getByRole("button", { name: "登録する" }))

    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getAllByRole("alert").length).toBeGreaterThan(0)
  })

  it("小数の金額はエラーになり onSubmit は呼ばれない", async () => {
    const onSubmit = vi.fn()
    render(<ExpenseForm submitLabel="登録する" onSubmit={onSubmit} />)

    await userEvent.type(screen.getByLabelText("項目名"), "ランチ")
    await userEvent.type(screen.getByLabelText("金額"), "1.5")
    await userEvent.click(screen.getByRole("button", { name: "登録する" }))

    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("initialValues が入力欄の初期値になる", () => {
    render(
      <ExpenseForm
        initialValues={{ month: "2026-10", title: "新幹線", amount: 14000 }}
        submitLabel="保存する"
        onSubmit={vi.fn()}
      />,
    )
    expect(screen.getByLabelText<HTMLInputElement>("項目名").value).toBe(
      "新幹線",
    )
    expect(screen.getByLabelText<HTMLInputElement>("金額").value).toBe("14000")
  })

  it("onCancel があるときだけキャンセルボタンを表示する", async () => {
    const onCancel = vi.fn()
    const { rerender } = render(
      <ExpenseForm submitLabel="保存する" onSubmit={vi.fn()} />,
    )
    expect(screen.queryByRole("button", { name: "キャンセル" })).toBeNull()

    rerender(
      <ExpenseForm
        submitLabel="保存する"
        onSubmit={vi.fn()}
        onCancel={onCancel}
      />,
    )
    await userEvent.click(screen.getByRole("button", { name: "キャンセル" }))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })
})
