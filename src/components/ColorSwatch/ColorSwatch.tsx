import type { TExpenseColor } from "../../types/expense.type"
import styles from "./ColorSwatch.module.css"

interface IColorSwatchProps {
  color: TExpenseColor
  /** 色名（例: 赤）。色だけでは伝わらないため、スクリーンリーダー向けの名前として使う */
  label: string
  /** 選択中なら true。外側にリングを出し、aria-pressed でも示す */
  isSelected: boolean
  onClick: () => void
}

/**
 * ラベル色を示す丸いトグルボタン（ColorPicker / ColorFilter 共通）。
 * 色は data-color 経由で index.css の --color-label に解決されるため、色ごとの CSS はここに持たない。
 */
export function ColorSwatch({
  color,
  label,
  isSelected,
  onClick,
}: IColorSwatchProps) {
  return (
    <button
      type="button"
      className={`${styles.swatch} ${isSelected ? styles.selected : ""}`}
      data-color={color}
      onClick={onClick}
      aria-label={label}
      aria-pressed={isSelected}
    />
  )
}
