import type { ReactNode } from "react"
import styles from "./ColorSwatchGroup.module.css"

interface IColorSwatchGroupProps {
  /** 見出しに表示する文言。グループの名前（aria-label）にも使う */
  label: string
  /** 並べる色ボタン（ColorSwatch など） */
  children: ReactNode
}

/**
 * 色ボタンを横に並べる、見出し付きのグループ外枠（ColorPicker / ColorFilter 共通）。
 * 見出しは視覚用で、スクリーンリーダーにはグループの aria-label として伝える。
 */
export function ColorSwatchGroup({ label, children }: IColorSwatchGroupProps) {
  return (
    <div className={styles.field} role="group" aria-label={label}>
      <span className={styles.label} aria-hidden="true">
        {label}
      </span>
      <div className={styles.options}>{children}</div>
    </div>
  )
}
