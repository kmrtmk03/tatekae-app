import { useEffect } from "react"
import type { NewExpenseInput } from "../hooks/useExpenses"
import { ExpenseForm } from "./ExpenseForm"
import styles from "./EditExpenseModal.module.css"

type Props = {
  /** 登録確定時に呼ばれる。モーダルは登録後に自動で閉じる */
  onSubmit: (input: NewExpenseInput) => void
  onClose: () => void
}

/**
 * 記録の新規追加フォームを画面中央のモーダルで表示する。
 *
 * MEMO: 見た目（オーバーレイ・パネル・ヘッダー）は編集モーダルと揃えるため
 * EditExpenseModal.module.css を共用している。
 * 開くたびにマウントされるため、日付は常に当日へ初期化される。
 */
export function AddExpenseModal({ onSubmit, onClose }: Props) {
  // Escape キーで閉じる（登録せずに破棄）
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [onClose])

  function handleSubmit(input: NewExpenseInput) {
    onSubmit(input)
    onClose()
  }

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        // パネル外（オーバーレイ自体）のクリックのみ閉じる
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label="記録を追加"
      >
        <div className={styles.headerRow}>
          <h2 className={styles.title}>記録を追加</h2>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="閉じる"
          >
            ×
          </button>
        </div>

        <ExpenseForm onSubmit={handleSubmit} />
      </div>
    </div>
  )
}
