import { useCallback, useEffect, useState } from "react"
import { loadExpenses, saveExpenses } from "../lib/storage.utils"
import type { IExpense, TExpenseInput } from "../types/expense.type"

/** localStorage への保存に失敗したときに画面へ出すメッセージ */
const SAVE_ERROR_MESSAGE =
  "保存に失敗しました。ブラウザの空き容量を確認してください。"

/**
 * 立て替え記録の一覧と、その追加・更新・清算切り替え・削除を提供するフック。
 *
 * - 初回に localStorage から読み込み、expenses が変わるたびに保存する
 * - 保存に失敗した場合は saveError にメッセージが入る。呼び出し側で画面に表示すること
 *
 * MEMO: 保存先に依存する処理は lib/storage.utils.ts に閉じ込めている。
 * コンポーネントはこのフック経由でのみデータに触る。
 */
export function useExpenses() {
  // 遅延初期化で、毎レンダリングでは localStorage を読まない
  const [expenses, setExpenses] = useState<IExpense[]>(() => loadExpenses())
  const [saveError, setSaveError] = useState<string | null>(null)

  // MEMO: 保存結果（成功・失敗）を state に反映するため effect 内で setState している。
  // oxlint の react(set-state-in-effect) 警告は、この設計を意図的に採用しているため許容
  useEffect(() => {
    try {
      saveExpenses(expenses)
      setSaveError(null)
    } catch {
      setSaveError(SAVE_ERROR_MESSAGE)
    }
  }, [expenses])

  /** 新しい記録を追加する。id と作成日時はここで採番し、清算状態は未清算で始める */
  const handleAddExpense = useCallback((input: TExpenseInput) => {
    const expense: IExpense = {
      id: crypto.randomUUID(),
      date: input.date,
      title: input.title,
      amount: input.amount,
      settled: false,
      createdAt: new Date().toISOString(),
    }
    setExpenses((prev) => [...prev, expense])
  }, [])

  /** 指定 id の記録を部分更新する。該当 id がなければ何もしない */
  const handleUpdateExpense = useCallback(
    (id: string, patch: Partial<Omit<IExpense, "id">>) => {
      setExpenses((prev) =>
        prev.map((e) => (e.id === id ? { ...e, ...patch } : e)),
      )
    },
    [],
  )

  /** 指定 id の記録の清算済み／未清算を切り替える */
  const handleToggleSettled = useCallback((id: string) => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, settled: !e.settled } : e)),
    )
  }, [])

  /** 指定 id の記録を削除する。確認ダイアログは呼び出し側（ExpenseItem）で出す */
  const handleRemoveExpense = useCallback((id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id))
  }, [])

  return {
    // 状態
    expenses,
    saveError,
    // 操作（内部の handleXxx を、呼び出し側に分かりやすい名前で公開する）
    addExpense: handleAddExpense,
    updateExpense: handleUpdateExpense,
    toggleSettled: handleToggleSettled,
    removeExpense: handleRemoveExpense,
  }
}
