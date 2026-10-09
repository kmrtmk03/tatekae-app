import { useCallback, useState } from "react"
import type { IExpense } from "../types/expense.type"

/**
 * 開いているモーダルの状態。追加・編集・絞り込みが同時に開く状態を型の上で作れないようにする。
 * 編集は対象の記録を id で持つ。
 */
type TModalState =
  | { type: "closed" }
  | { type: "add" }
  | { type: "edit"; id: string }
  | { type: "filter" }

/**
 * ページで開くモーダル（追加・編集・絞り込み）の開閉状態を管理するフック。
 *
 * - 入力: useExpenses が返す全件の expenses（編集対象を最新の記録として引くために使う）
 * - 出力: 開いているモーダルの種類（modal.type）と、編集対象 editingExpense、開閉の操作
 * - モーダルは開いている間だけマウントする前提のため、呼び出し側は modal.type で条件付き描画すること
 */
export function useModalState(expenses: IExpense[]) {
  const [modal, setModal] = useState<TModalState>({ type: "closed" })

  // 編集対象は id で持ち、最新の記録を expenses から引く（編集中に記録が更新されても古いコピーを見ない）。
  // 対象の記録が無くなった場合は undefined になり、編集モーダルは描画されない
  const editingExpense =
    modal.type === "edit"
      ? expenses.find((expense) => expense.id === modal.id)
      : undefined

  // 返す関数は参照を安定させる。closeModal は Modal の useEffect の依存になるため、
  // 毎回変わると Escape キーのリスナーが再レンダリングのたびに付け替わる
  const handleOpenAddModal = useCallback(() => {
    setModal({ type: "add" })
  }, [])

  const handleOpenEditModal = useCallback((expense: IExpense) => {
    setModal({ type: "edit", id: expense.id })
  }, [])

  const handleOpenFilterModal = useCallback(() => {
    setModal({ type: "filter" })
  }, [])

  const handleCloseModal = useCallback(() => {
    setModal({ type: "closed" })
  }, [])

  return {
    // 開いているモーダルと、編集対象の記録
    modal,
    editingExpense,
    // 開閉の操作
    openAddModal: handleOpenAddModal,
    openEditModal: handleOpenEditModal,
    openFilterModal: handleOpenFilterModal,
    closeModal: handleCloseModal,
  }
}
