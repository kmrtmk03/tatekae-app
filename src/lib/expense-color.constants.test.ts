import { describe, expect, it } from "vitest"
import {
  DEFAULT_EXPENSE_COLOR,
  EXPENSE_COLOR_LABELS,
  EXPENSE_COLOR_OPTIONS,
} from "./expense-color.constants"

describe("EXPENSE_COLOR_OPTIONS", () => {
  it("全ての色を重複なく含み、既定色も選択肢にある", () => {
    const values = EXPENSE_COLOR_OPTIONS.map((option) => option.value)
    expect([...values].sort()).toEqual(Object.keys(EXPENSE_COLOR_LABELS).sort())
    expect(new Set(values).size).toBe(values.length)
    expect(values).toContain(DEFAULT_EXPENSE_COLOR)
  })
})
