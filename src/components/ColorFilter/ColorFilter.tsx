import { EXPENSE_COLOR_OPTIONS } from "../../lib/expense/expense-color.constants"
import type { TExpenseColor } from "../../types/expense.type"
import { ColorSwatch } from "../ColorSwatch/ColorSwatch"
import { ColorSwatchGroup } from "../ColorSwatchGroup/ColorSwatchGroup"
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
 * 色の見た目と選択状態の通知は ColorSwatch が担う。
 */
export function ColorFilter({ value, onToggle, onClear }: IColorFilterProps) {
  const isAll = value.length === 0
  return (
    <ColorSwatchGroup label="ラベルの色">
      <button
        type="button"
        className={`${styles.all} ${isAll ? styles.allSelected : ""}`}
        onClick={onClear}
        aria-pressed={isAll}
      >
        すべて
      </button>
      {EXPENSE_COLOR_OPTIONS.map((option) => (
        <ColorSwatch
          key={option.value}
          color={option.value}
          label={option.label}
          isSelected={value.includes(option.value)}
          onClick={() => onToggle(option.value)}
        />
      ))}
    </ColorSwatchGroup>
  )
}
