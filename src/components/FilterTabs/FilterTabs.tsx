import type { TExpenseFilter } from "../../types/expense.type"
import styles from "./FilterTabs.module.css"

interface IFilterTabsProps {
  /** 選択中の清算状態 */
  value: TExpenseFilter
  onChange: (value: TExpenseFilter) => void
}

/** タブの並び順と表示文言 */
const OPTIONS: { value: TExpenseFilter; label: string }[] = [
  { value: "all", label: "すべて" },
  { value: "unsettled", label: "未清算" },
  { value: "settled", label: "清算済み" },
]

/** 「すべて / 未清算 / 清算済み」を切り替えるセグメントコントロール */
export function FilterTabs({ value, onChange }: IFilterTabsProps) {
  return (
    <div className={styles.tabs} role="tablist" aria-label="表示フィルタ">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={value === option.value}
          className={`${styles.tab} ${
            value === option.value ? styles.active : ""
          }`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
