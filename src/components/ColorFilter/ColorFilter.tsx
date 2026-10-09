import { EXPENSE_COLOR_OPTIONS } from "../../lib/expense-color.constants"
import type { TExpenseColor } from "../../types/expense.type"
import styles from "./ColorFilter.module.css"

interface IColorFilterProps {
  /** 選択中の色（複数）。空なら「すべて」が選ばれている扱い */
  value: TExpenseColor[]
  /** 色のボタンを押したときに呼ばれる。選択の切り替え（追加／解除）は呼び出し側で行う */
  onToggle: (color: TExpenseColor) => void
  /** 「すべて」を押したときに呼ばれる。色の選択を全て解除する */
  onClear: () => void
}

/**
 * 表示するラベル色を絞り込む部品。5 色のボタンを複数選べ、「すべて」で選択を解除する。
 * 色だけでは伝わらないため、各色ボタンに色名を aria-label で付け、選択中は aria-pressed で示す。
 */
export function ColorFilter({ value, onToggle, onClear }: IColorFilterProps) {
  const isAll = value.length === 0
  return (
    <div className={styles.field} role="group" aria-label="ラベルの色">
      <span className={styles.label} aria-hidden="true">
        ラベルの色
      </span>
      <div className={styles.options}>
        <button
          type="button"
          className={`${styles.all} ${isAll ? styles.allSelected : ""}`}
          onClick={onClear}
          aria-pressed={isAll}
        >
          すべて
        </button>
        {EXPENSE_COLOR_OPTIONS.map((option) => {
          const isSelected = value.includes(option.value)
          return (
            <button
              key={option.value}
              type="button"
              className={`${styles.option} ${styles[option.value]} ${isSelected ? styles.selected : ""}`}
              onClick={() => onToggle(option.value)}
              aria-label={option.label}
              aria-pressed={isSelected}
            />
          )
        })}
      </div>
    </div>
  )
}
