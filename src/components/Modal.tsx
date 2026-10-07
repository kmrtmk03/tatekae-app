import { useEffect } from "react"
import type { ReactNode } from "react"
import styles from "./Modal.module.css"

interface IModalProps {
  /** ヘッダーに表示するタイトル。`aria-label` にも使う */
  title: string
  /** 閉じる操作（×ボタン・オーバーレイのクリック・Escape キー）で呼ばれる */
  onClose: () => void
  children: ReactNode
}

/**
 * 画面中央に表示する共通モーダル。オーバーレイ・パネル・ヘッダー（タイトルと×ボタン）を提供する。
 *
 * MEMO: 開いている間だけ描画する想定（呼び出し側が条件付きでマウントする）。
 * そのため、中の state はモーダルを開くたびに初期化される。
 */
export function Modal({ title, onClose, children }: IModalProps) {
  // Escape キーで閉じる。リスナーは同じ effect 内で必ず解除する
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [onClose])

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        // パネル内のクリックは無視し、オーバーレイ自体のクリックだけ閉じる
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className={styles.headerRow}>
          <h2 className={styles.title}>{title}</h2>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="閉じる"
          >
            ×
          </button>
        </div>

        {children}
      </div>
    </div>
  )
}
