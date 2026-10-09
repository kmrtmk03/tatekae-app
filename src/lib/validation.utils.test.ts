import { describe, expect, it } from "vitest"
import { parseExpenseInput } from "./validation.utils"

const VALID = { month: "2026-10", title: "飲み会代", amount: "3000" } as const

describe("parseExpenseInput", () => {
  it("正しい入力を変換する（項目名の前後の空白を除き、金額を数値にする）", () => {
    const result = parseExpenseInput({ ...VALID, title: " 飲み会代 " })
    expect(result).toEqual({
      ok: true,
      value: { month: "2026-10", title: "飲み会代", amount: 3000 },
    })
  })

  it("空白のみの項目名は不可", () => {
    const result = parseExpenseInput({ ...VALID, title: "   " })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.errors.title).toBeDefined()
  })

  it.each(["", "0", "-5", "1.5", "1e3", "abc", "9007199254740993"])(
    "金額 %j は不可",
    (amount) => {
      const result = parseExpenseInput({ ...VALID, amount })
      expect(result.ok).toBe(false)
      if (!result.ok) expect(result.errors.amount).toBeDefined()
    },
  )
})
