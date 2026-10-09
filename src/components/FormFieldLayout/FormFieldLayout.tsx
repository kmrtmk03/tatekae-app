import type { ReactNode } from "react"
import styles from "./FormFieldLayout.module.css"

interface IFormFieldLayoutProps {
  /** 入力部品の上に表示するラベル文言 */
  label: string
  /** ラベルと紐付ける入力部品の id。呼び出し側で useId を使って生成し、入力部品にも同じ値を渡すこと */
  htmlFor: string
  /** 入力エラーの文言。指定すると入力部品の下に表示する */
  error?: string
  /** ラベルの下に置く入力部品（input やボタンなど） */
  children: ReactNode
}

/**
 * フォームの 1 項目分の外枠（ラベル・入力部品・エラー表示）。
 * 入力部品の種類に依らず、項目間でラベルとエラー文言の見た目を揃えるために使う。
 */
export function FormFieldLayout({
  label,
  htmlFor,
  error,
  children,
}: IFormFieldLayoutProps) {
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {error && (
        <p className={styles.errorText} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
