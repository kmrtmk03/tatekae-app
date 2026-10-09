import { beforeEach, describe, expect, it, vi } from "vitest"
import { loadExpenses, saveExpenses } from "./storage.utils"
import type { IExpense } from "../types/expense.type"

const KEY_V1 = "tatekae-app/expenses/v1"
const KEY_V2 = "tatekae-app/expenses/v2"
const KEY_V3 = "tatekae-app/expenses/v3"

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

/** 色を持たない旧データを読み込んだときの既定色 */
const DEFAULT_COLOR = "blue"

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

  it("v3 を month のまま読み込み、不正な要素だけ除く", () => {
    store.set(
      KEY_V3,
      JSON.stringify({
        version: 3,
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
    expect(loadExpenses()).toEqual([
      { id: "a", month: "2026-10", color: DEFAULT_COLOR, ...BASE },
    ])
  })

  it("ラベル色は有効な値だけ引き継ぎ、無い・不正なら既定色にする", () => {
    store.set(
      KEY_V3,
      JSON.stringify({
        version: 3,
        expenses: [
          { id: "a", month: "2026-10", color: "red", ...BASE },
          { id: "b", month: "2026-10", color: "pink", ...BASE },
          { id: "c", month: "2026-10", color: 1, ...BASE },
        ],
      }),
    )
    expect(loadExpenses().map((expense) => expense.color)).toEqual([
      "red",
      DEFAULT_COLOR,
      DEFAULT_COLOR,
    ])
  })

  it("壊れた JSON や外枠が違う値は空配列", () => {
    store.set(KEY_V3, "{")
    expect(loadExpenses()).toEqual([])
    store.set(KEY_V3, JSON.stringify({ expenses: "x" }))
    expect(loadExpenses()).toEqual([])
  })

  it("v3 が無ければ v2（色なし）を既定色で読み込む", () => {
    store.set(
      KEY_V2,
      JSON.stringify({
        version: 2,
        expenses: [{ id: "a", month: "2026-10", ...BASE }],
      }),
    )
    expect(loadExpenses()).toEqual([
      { id: "a", month: "2026-10", color: DEFAULT_COLOR, ...BASE },
    ])
  })

  it("v3・v2 が無ければ v1 の date を精算月（年月）へ移行して読み込む", () => {
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
    expect(loadExpenses()).toEqual([
      { id: "a", month: "2026-09", color: DEFAULT_COLOR, ...BASE },
    ])
  })

  it("新しい保存先があれば古い保存先は読まない（空の v3 でも v2・v1 は復活しない）", () => {
    store.set(
      KEY_V1,
      JSON.stringify({ expenses: [{ id: "a", date: "2026-09-21", ...BASE }] }),
    )
    store.set(
      KEY_V2,
      JSON.stringify({ expenses: [{ id: "b", month: "2026-10", ...BASE }] }),
    )
    store.set(KEY_V3, JSON.stringify({ version: 3, expenses: [] }))
    expect(loadExpenses()).toEqual([])
  })
})

describe("saveExpenses", () => {
  it("v3 に保存し、v2・v1 は書き換えない", () => {
    const legacy = JSON.stringify({
      expenses: [{ id: "a", date: "2026-09-21", ...BASE }],
    })
    const previous = JSON.stringify({
      expenses: [{ id: "a", month: "2026-09", ...BASE }],
    })
    store.set(KEY_V1, legacy)
    store.set(KEY_V2, previous)
    const expenses: IExpense[] = [
      { id: "a", month: "2026-09", color: "purple", ...BASE },
    ]

    saveExpenses(expenses)

    expect(store.get(KEY_V1)).toBe(legacy)
    expect(store.get(KEY_V2)).toBe(previous)
    expect(JSON.parse(store.get(KEY_V3) ?? "")).toEqual({
      version: 3,
      expenses,
    })
    expect(loadExpenses()).toEqual(expenses)
  })
})
