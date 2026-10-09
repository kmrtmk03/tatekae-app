import styles from "./FilterButton.module.css"

interface IFilterButtonProps {
  /** 有効な絞り込み（月・色）の数。1 以上のときバッジを出す */
  activeCount: number
  onClick: () => void
}

/**
 * 絞り込みモーダルを開く、左下に固定する丸いボタン（右下の追加ボタンと同じ見た目）。
 * 絞り込み中はバッジで件数を示し、設定中であることに気づけるようにする。
 */
export function FilterButton({ activeCount, onClick }: IFilterButtonProps) {
  return (
    <button
      type="button"
      className={styles.button}
      onClick={onClick}
      aria-label={
        activeCount > 0 ? `絞り込み（${activeCount}件設定中）` : "絞り込み"
      }
    >
      {/* ファンネル型のアイコン。文字ではなく SVG にして、ボタン内で中央に揃える */}
      <svg
        className={styles.icon}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3 5h18l-7 8v6l-4 2v-8z" />
      </svg>
      {activeCount > 0 && (
        <span className={styles.badge} aria-hidden="true">
          {activeCount}
        </span>
      )}
    </button>
  )
}
