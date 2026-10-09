import {
  ALL_COLORS,
  EXPENSE_COLOR_OPTIONS,
} from "../../lib/expense-color.constants"
import type { TExpenseColorFilter } from "../../types/expense.type"
import styles from "./ColorFilter.module.css"

interface IColorFilterProps {
  /** 選択中の値。ALL_COLORS または色 */
  value: TExpenseColorFilter
  onChange: (value: TExpenseColorFilter) => void
}

/**
 * 表示するラベル色を絞り込む部品。「すべて」と 5 色のボタンから 1 つ選ぶ。
 * 色だけでは伝わらないため、各色ボタンに色名を aria-label で付け、選択中は aria-pressed で示す。
 */
export function ColorFilter({ value, onChange }: IColorFilterProps) {
  return (
    <div className={styles.field} role="group" aria-label="ラベルの色">
      <span className={styles.label} aria-hidden="true">
        ラベルの色
      </span>
      <div className={styles.options}>
        <button
          type="button"
          className={`${styles.all} ${value === ALL_COLORS ? styles.allSelected : ""}`}
          onClick={() => onChange(ALL_COLORS)}
          aria-pressed={value === ALL_COLORS}
        >
          すべて
        </button>
        {EXPENSE_COLOR_OPTIONS.map((option) => {
          const isSelected = option.value === value
          return (
            <button
              key={option.value}
              type="button"
              className={`${styles.option} ${styles[option.value]} ${isSelected ? styles.selected : ""}`}
              onClick={() => onChange(option.value)}
              aria-label={option.label}
              aria-pressed={isSelected}
            />
          )
        })}
      </div>
    </div>
  )
}
