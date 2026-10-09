import { describe, expect, it } from "vitest"
import { formatAmount, formatMonth } from "../format.utils"

describe("formatAmount", () => {
  it("3 桁ごとにカンマで区切り、先頭に ¥ を付ける", () => {
    expect(formatAmount(12345)).toBe("¥12,345")
  })

  it("1000 未満はカンマを付けない", () => {
    expect(formatAmount(999)).toBe("¥999")
  })

  it("0 も整形できる", () => {
    expect(formatAmount(0)).toBe("¥0")
  })
})

describe("formatMonth", () => {
  it("月の先頭の 0 を落として「年月」の形式にする", () => {
    expect(formatMonth("2026-01")).toBe("2026年1月")
  })

  it("2 桁の月はそのまま表示する", () => {
    expect(formatMonth("2026-10")).toBe("2026年10月")
  })
})
