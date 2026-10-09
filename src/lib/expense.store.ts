/**
 * 立て替え記録の保持・保存を担うストア（useSyncExternalStore 用）。
 * 保存は記録を変更する操作の中だけで行い、起動時や再レンダリングでは書き込まない。
 *
 * MEMO: 保存先に依存する処理は lib/storage.utils.ts に閉じ込めている。
 * コンポーネントはこのストアを直接触らず、hooks/useExpenses.ts 経由で使うこと。
 */

import type { IExpense, TExpenseInput } from "../types/expense.type"
import { loadExpenses, saveExpenses } from "./storage.utils"

/** localStorage への保存に失敗したときに画面へ出すメッセージ */
const SAVE_ERROR_MESSAGE =
  "保存に失敗しました。ブラウザの空き容量を確認してください。"

/** ストアが保持する状態。更新のたびに新しいオブジェクトへ差し替える（useSyncExternalStore の前提） */
export interface IExpenseStoreState {
  expenses: IExpense[]
  /** 直近の保存に失敗したときのメッセージ。成功していれば null */
  saveError: string | null
}

/** 初回読み込みはここで 1 度だけ行う。読み込んだだけでは保存し直さない */
let state: IExpenseStoreState = { expenses: loadExpenses(), saveError: null }

const listeners = new Set<() => void>()

/** 状態の購読を開始し、解除関数を返す。useSyncExternalStore の subscribe に渡す */
export function subscribeExpenses(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** 現在の状態を返す。変更がない間は同じ参照を返す。useSyncExternalStore の getSnapshot に渡す */
export function getExpensesSnapshot(): IExpenseStoreState {
  return state
}

/**
 * 次の記録一覧を保存し、結果（成功・失敗）とあわせて状態へ反映して購読者へ通知する。
 * 保存に失敗しても画面上の記録は更新し、saveError で利用者に知らせる。
 */
function commit(nextExpenses: IExpense[]): void {
  let saveError: string | null = null
  try {
    saveExpenses(nextExpenses)
  } catch {
    saveError = SAVE_ERROR_MESSAGE
  }

  state = { expenses: nextExpenses, saveError }
  listeners.forEach((listener) => listener())
}

/** 新しい記録を追加する。id と作成日時はここで採番し、清算状態は未清算で始める */
export function addExpense(input: TExpenseInput): void {
  const expense: IExpense = {
    id: crypto.randomUUID(),
    date: input.date,
    title: input.title,
    amount: input.amount,
    settled: false,
    createdAt: new Date().toISOString(),
  }
  commit([...state.expenses, expense])
}

/**
 * 指定 id の記録の入力項目（日付・項目名・金額）を更新する。該当 id がなければ何もしない。
 * id・createdAt はここでは書き換えさせない。清算状態の変更は toggleSettled を使う
 */
export function updateExpense(id: string, patch: TExpenseInput): void {
  commit(
    state.expenses.map((expense) =>
      expense.id === id ? { ...expense, ...patch } : expense,
    ),
  )
}

/** 指定 id の記録の清算済み／未清算を切り替える */
export function toggleSettled(id: string): void {
  commit(
    state.expenses.map((expense) =>
      expense.id === id ? { ...expense, settled: !expense.settled } : expense,
    ),
  )
}

/** 指定 id の記録を削除する。確認ダイアログは呼び出し側（ExpenseItem）で出す */
export function removeExpense(id: string): void {
  commit(state.expenses.filter((expense) => expense.id !== id))
}
