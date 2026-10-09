import { EXPENSE_COLOR_OPTIONS } from "../../lib/expense-color.constants"
import type { TExpenseColor } from "../../types/expense.type"
import { ColorSwatch } from "../ColorSwatch/ColorSwatch"
import { ColorSwatchGroup } from "../ColorSwatchGroup/ColorSwatchGroup"

interface IColorPickerProps {
  /** 入力欄の上に表示するラベル文言 */
  label: string
  /** 選択中の色 */
  value: TExpenseColor
  /** 色を選んだときに呼ばれる */
  onChange: (value: TExpenseColor) => void
}

/** ラベル色を 5 色から 1 つ選ぶ部品。色の見た目と選択状態の通知は ColorSwatch が担う */
export function ColorPicker({ label, value, onChange }: IColorPickerProps) {
  return (
    <ColorSwatchGroup label={label}>
      {EXPENSE_COLOR_OPTIONS.map((option) => (
        <ColorSwatch
          key={option.value}
          color={option.value}
          label={option.label}
          isSelected={option.value === value}
          onClick={() => onChange(option.value)}
        />
      ))}
    </ColorSwatchGroup>
  )
}
