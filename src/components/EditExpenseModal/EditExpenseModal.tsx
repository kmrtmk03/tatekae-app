import type { IExpense, TExpenseInput } from "../../types/expense.type"
import { ExpenseForm } from "../ExpenseForm/ExpenseForm"
import { Modal } from "../Modal/Modal"

interface IEditExpenseModalProps {
  /** 編集対象の記録。開いた時点の値がフォームの初期値になる */
  expense: IExpense
  onSave: (id: string, patch: TExpenseInput) => void
  onClose: () => void
}

/**
 * 既存の記録（日付・項目名・金額）を画面中央のモーダルで編集する。
 * 保存成功時は自動で閉じる。キャンセル・×・Escape・オーバーレイのクリックは変更を破棄して閉じる。
 */
export function EditExpenseModal({
  expense,
  onSave,
  onClose,
}: IEditExpenseModalProps) {
  function handleSubmit(input: TExpenseInput) {
    onSave(expense.id, input)
    onClose()
  }

  return (
    <Modal title="記録を編集" onClose={onClose}>
      <ExpenseForm
        initialValues={{
          date: expense.date,
          title: expense.title,
          amount: expense.amount,
        }}
        submitLabel="保存する"
        onSubmit={handleSubmit}
        onCancel={onClose}
      />
    </Modal>
  )
}
