import { useSyncExternalStore } from "react"
import {
  addExpense,
  getExpensesSnapshot,
  removeExpense,
  subscribeExpenses,
  toggleSettled,
  updateExpense,
} from "../lib/expense.store"

/**
 * 立て替え記録の一覧と、その追加・更新・清算切り替え・削除を提供するフック。
 *
 * - 記録は lib/expense.store.ts が保持し、変更操作のたびに localStorage へ保存する
 * - 保存に失敗した場合は saveError にメッセージが入る。呼び出し側で画面に表示すること
 *
 * MEMO: 操作関数はストア側のモジュールレベルの関数で参照が常に変わらないため、
 * useCallback での安定化は不要。コンポーネントはこのフック経由でのみデータに触る。
 */
export function useExpenses() {
  const { expenses, saveError } = useSyncExternalStore(
    subscribeExpenses,
    getExpensesSnapshot,
  )

  return {
    // 状態
    expenses,
    saveError,
    // 操作
    addExpense,
    updateExpense,
    toggleSettled,
    removeExpense,
  }
}
