import type {
  TExpenseColor,
  TExpenseInput,
  TNewExpenseInput,
} from "../../types/expense.type"
import { ExpenseForm } from "../ExpenseForm/ExpenseForm"
import { Modal } from "../Modal/Modal"

interface IAddExpenseModalProps {
  /** 登録確定時に呼ばれる。モーダルは登録後に自動で閉じる */
  onSubmit: (input: TNewExpenseInput) => void
  onClose: () => void
}

/**
 * 記録の新規追加フォームを画面中央のモーダルで表示する。
 * 開くたびにマウントされるため、精算月は常に今月、ラベル色は既定色へ初期化される。
 */
export function AddExpenseModal({ onSubmit, onClose }: IAddExpenseModalProps) {
  function handleSubmit(input: TExpenseInput, color: TExpenseColor) {
    onSubmit({ ...input, color })
    onClose()
  }

  return (
    <Modal title="記録を追加" onClose={onClose}>
      <ExpenseForm
        submitLabel="登録する"
        isColorSelectable
        onSubmit={handleSubmit}
      />
    </Modal>
  )
}
