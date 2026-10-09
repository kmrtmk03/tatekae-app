import { beforeEach, describe, expect, it, vi } from "vitest"
import { loadExpenses, saveExpenses } from "./storage.utils"
import type { IExpense } from "../types/expense.type"

const KEY_V1 = "tatekae-app/expenses/v1"
const KEY_V2 = "tatekae-app/expenses/v2"

/** Node には localStorage が無いため、Map ベースの最小実装に差し替える */
function stubLocalStorage(): Map<string, string> {
  const store = new Map<string, string>()
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value),
    removeItem: (key: string) => void store.delete(key),
  })
  return store
}

const BASE = {
  title: "飲み会代",
  amount: 1000,
  settled: false,
  createdAt: "2026-09-21T00:00:00.000Z",
}

let store: Map<string, string>

beforeEach(() => {
  store = stubLocalStorage()
})

describe("loadExpenses", () => {
  it("何も保存されていなければ空配列", () => {
    expect(loadExpenses()).toEqual([])
  })

  it("v2 を month のまま読み込み、不正な要素だけ除く", () => {
    store.set(
      KEY_V2,
      JSON.stringify({
        version: 2,
        expenses: [
          { id: "a", month: "2026-10", ...BASE },
          { id: "b", month: "2026-13", ...BASE },
          { id: "c", month: 202610, ...BASE },
          { id: "d", date: "2026-10-01", ...BASE },
          "文字列",
          null,
        ],
      }),
    )
    expect(loadExpenses()).toEqual([{ id: "a", month: "2026-10", ...BASE }])
  })

  it("壊れた JSON や外枠が違う値は空配列", () => {
    store.set(KEY_V2, "{")
    expect(loadExpenses()).toEqual([])
    store.set(KEY_V2, JSON.stringify({ expenses: "x" }))
    expect(loadExpenses()).toEqual([])
  })

  it("v2 が無ければ v1 の date を精算月（年月）へ移行して読み込む", () => {
    store.set(
      KEY_V1,
      JSON.stringify({
        version: 1,
        expenses: [
          { id: "a", date: "2026-09-21", ...BASE },
          // YYYY-MM-DD 全体の形式でない date は移行しない
          { id: "b", date: "2026-10junk", ...BASE },
          { id: "c", date: "2026-13-01", ...BASE },
          { id: "d", date: "bad", ...BASE },
        ],
      }),
    )
    expect(loadExpenses()).toEqual([{ id: "a", month: "2026-09", ...BASE }])
  })

  it("v2 があれば v1 は読まない（空の v2 でも v1 は復活しない）", () => {
    store.set(
      KEY_V1,
      JSON.stringify({ expenses: [{ id: "a", date: "2026-09-21", ...BASE }] }),
    )
    store.set(KEY_V2, JSON.stringify({ version: 2, expenses: [] }))
    expect(loadExpenses()).toEqual([])
  })
})

describe("saveExpenses", () => {
  it("v2 に保存し、v1 は書き換えない", () => {
    const legacy = JSON.stringify({
      expenses: [{ id: "a", date: "2026-09-21", ...BASE }],
    })
    store.set(KEY_V1, legacy)
    const expenses: IExpense[] = [{ id: "a", month: "2026-09", ...BASE }]

    saveExpenses(expenses)

    expect(store.get(KEY_V1)).toBe(legacy)
    expect(JSON.parse(store.get(KEY_V2) ?? "")).toEqual({
      version: 2,
      expenses,
    })
    expect(loadExpenses()).toEqual(expenses)
  })
})
