import { EXPENSE_COLOR_OPTIONS } from "../../lib/expense-color.constants"
import type { TExpenseColor } from "../../types/expense.type"
import { ColorSwatch } from "../ColorSwatch/ColorSwatch"
import styles from "./ColorPicker.module.css"

interface IColorPickerProps {
  /** 入力欄の上に表示するラベル文言 */
  label: string
  /** 選択中の色 */
  value: TExpenseColor
  /** 色を選んだときに呼ばれる */
  onChange: (value: TExpenseColor) => void
}

/**
 * ラベル色を 5 色から 1 つ選ぶ部品。
 * 色だけでは伝わらないため、各ボタンに色名を aria-label で付け、選択中は aria-pressed で示す。
 */
export function ColorPicker({ label, value, onChange }: IColorPickerProps) {
  return (
    <div className={styles.field} role="group" aria-label={label}>
      <span className={styles.label} aria-hidden="true">
        {label}
      </span>
      <div className={styles.options}>
        {EXPENSE_COLOR_OPTIONS.map((option) => {
          const isSelected = option.value === value
          return (
            <ColorSwatch
              key={option.value}
              color={option.value}
              label={option.label}
              isSelected={isSelected}
              onClick={() => onChange(option.value)}
            />
          )
        })}
      </div>
    </div>
  )
}
