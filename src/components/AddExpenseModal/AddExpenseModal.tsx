import { useState } from "react"
import { DEFAULT_EXPENSE_COLOR } from "../../lib/expense-color.constants"
import type {
  TExpenseColor,
  TExpenseInput,
  TNewExpenseInput,
} from "../../types/expense.type"
import { ColorPicker } from "../ColorPicker/ColorPicker"
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
 * ラベル色は新規追加のときだけ選べるため、フォーム共通部品（ExpenseForm）ではなくここで持つ。
 */
export function AddExpenseModal({ onSubmit, onClose }: IAddExpenseModalProps) {
  const [color, setColor] = useState<TExpenseColor>(DEFAULT_EXPENSE_COLOR)

  function handleSubmit(input: TExpenseInput) {
    onSubmit({ ...input, color })
    onClose()
  }

  return (
    <Modal title="記録を追加" onClose={onClose}>
      <ExpenseForm submitLabel="登録する" onSubmit={handleSubmit}>
        <ColorPicker label="ラベルの色" value={color} onChange={setColor} />
      </ExpenseForm>
    </Modal>
  )
}
