import styles from "./FilterButton.module.css"

interface IFilterButtonProps {
  /** 有効な絞り込み（月・色）の数。1 以上のときバッジを出す */
  activeCount: number
  onClick: () => void
}

/** 絞り込みモーダルを開くボタン。絞り込み中はバッジで件数を示し、設定中であることに気づけるようにする */
export function FilterButton({ activeCount, onClick }: IFilterButtonProps) {
  return (
    <button
      type="button"
      className={`${styles.button} ${activeCount > 0 ? styles.active : ""}`}
      onClick={onClick}
      aria-label={
        activeCount > 0 ? `絞り込み（${activeCount}件設定中）` : "絞り込み"
      }
    >
      <span>絞り込み</span>
      {activeCount > 0 && (
        <span className={styles.badge} aria-hidden="true">
          {activeCount}
        </span>
      )}
    </button>
  )
}
