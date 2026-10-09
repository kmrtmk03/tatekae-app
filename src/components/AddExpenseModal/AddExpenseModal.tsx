import type { TExpenseInput } from "../../types/expense.type"
import { ExpenseForm } from "../ExpenseForm/ExpenseForm"
import { Modal } from "../Modal/Modal"

interface IAddExpenseModalProps {
  /** 登録確定時に呼ばれる。モーダルは登録後に自動で閉じる */
  onSubmit: (input: TExpenseInput) => void
  onClose: () => void
}

/**
 * 記録の新規追加フォームを画面中央のモーダルで表示する。
 * 開くたびにマウントされるため、精算月は常に今月へ初期化される。
 */
export function AddExpenseModal({ onSubmit, onClose }: IAddExpenseModalProps) {
  function handleSubmit(input: TExpenseInput) {
    onSubmit(input)
    onClose()
  }

  return (
    <Modal title="記録を追加" onClose={onClose}>
      <ExpenseForm submitLabel="登録する" onSubmit={handleSubmit} />
    </Modal>
  )
}
