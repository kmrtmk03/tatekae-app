import { beforeEach, describe, expect, it, vi } from "vitest"

const STORAGE_KEY = "tatekae-app/expenses/v3"

/** Node には localStorage が無いため、Map ベースの最小実装に差し替える。setItem の失敗も再現できる */
function stubLocalStorage(options?: { failOnSet?: boolean }) {
  const data = new Map<string, string>()
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      if (options?.failOnSet) throw new Error("QuotaExceededError")
      data.set(key, value)
    },
    removeItem: (key: string) => void data.delete(key),
  })
  return data
}

/**
 * ストアはモジュール読み込み時に localStorage を読んで状態を作るため、
 * テストごとにモジュールを読み込み直して、状態が持ち越されないようにする。
 */
async function importStore() {
  vi.resetModules()
  return import("../expense.store")
}

const INPUT = {
  month: "2026-10",
  title: "飲み会代",
  amount: 1000,
  color: "purple",
} as const

beforeEach(() => {
  stubLocalStorage()
})

describe("addExpense", () => {
  it("色を保持し、未清算で追加して localStorage にも保存する", async () => {
    const data = stubLocalStorage()
    const store = await importStore()

    store.addExpense(INPUT)

    const [expense] = store.getExpensesSnapshot().expenses
    expect(expense).toMatchObject({ ...INPUT, settled: false })
    expect(expense.id).not.toBe("")
    expect(JSON.parse(data.get(STORAGE_KEY) ?? "").expenses).toEqual([expense])
  })
})

describe("updateExpense", () => {
  it("精算月・項目名・金額だけ更新し、色・id・作成日時・清算状態は変えない", async () => {
    const store = await importStore()
    store.addExpense(INPUT)
    const before = store.getExpensesSnapshot().expenses[0]
    store.toggleSettled(before.id)

    store.updateExpense(before.id, {
      month: "2026-11",
      title: "新幹線",
      amount: 2000,
    })

    const [after] = store.getExpensesSnapshot().expenses
    expect(after).toEqual({
      ...before,
      month: "2026-11",
      title: "新幹線",
      amount: 2000,
      settled: true,
    })
    expect(after.color).toBe("purple")
  })

  it("該当する id が無ければ何も変えない", async () => {
    const store = await importStore()
    store.addExpense(INPUT)
    const before = store.getExpensesSnapshot().expenses

    store.updateExpense("none", { month: "2026-11", title: "x", amount: 1 })

    expect(store.getExpensesSnapshot().expenses).toEqual(before)
  })
})

describe("toggleSettled / removeExpense", () => {
  it("清算状態を切り替え、削除できる", async () => {
    const store = await importStore()
    store.addExpense(INPUT)
    const { id } = store.getExpensesSnapshot().expenses[0]

    store.toggleSettled(id)
    expect(store.getExpensesSnapshot().expenses[0].settled).toBe(true)
    store.toggleSettled(id)
    expect(store.getExpensesSnapshot().expenses[0].settled).toBe(false)

    store.removeExpense(id)
    expect(store.getExpensesSnapshot().expenses).toEqual([])
  })
})

describe("保存と購読", () => {
  it("保存済みの記録を初回に読み込む（読み込んだだけでは保存し直さない）", async () => {
    const data = stubLocalStorage()
    const saved = {
      id: "a",
      month: "2026-10",
      title: "保存済み",
      amount: 1,
      settled: false,
      color: "green",
      createdAt: "2026-10-01",
    }
    data.set(STORAGE_KEY, JSON.stringify({ version: 3, expenses: [saved] }))
    const before = data.get(STORAGE_KEY)

    const store = await importStore()

    expect(store.getExpensesSnapshot().expenses).toEqual([saved])
    expect(data.get(STORAGE_KEY)).toBe(before)
  })

  it("保存に失敗しても画面上の記録は更新し、saveError を設定する", async () => {
    stubLocalStorage({ failOnSet: true })
    const store = await importStore()

    store.addExpense(INPUT)

    const state = store.getExpensesSnapshot()
    expect(state.expenses).toHaveLength(1)
    expect(state.saveError).not.toBeNull()
  })

  it("変更時に購読者へ通知し、解除後は通知しない", async () => {
    const store = await importStore()
    const listener = vi.fn()
    const unsubscribe = store.subscribeExpenses(listener)

    store.addExpense(INPUT)
    expect(listener).toHaveBeenCalledTimes(1)

    unsubscribe()
    store.addExpense(INPUT)
    expect(listener).toHaveBeenCalledTimes(1)
  })
})
