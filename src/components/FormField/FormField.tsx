import { useId } from "react"
import type { InputHTMLAttributes } from "react"
import styles from "./FormField.module.css"

interface IFormFieldProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "id"
> {
  /** 入力欄の上に表示するラベル文言 */
  label: string
  /** 入力エラーの文言。指定すると入力欄の下に表示する */
  error?: string
}

/**
 * ラベル付きの入力欄とエラー表示をまとめたフォーム部品。
 * input の id は useId で生成してラベルと紐付けるため、同じ画面に複数あっても衝突しない。
 * label / error 以外の props（type・value・onChange など）は input にそのまま渡す。
 */
export function FormField({ label, error, ...inputProps }: IFormFieldProps) {
  const inputId = useId()

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={inputId}>
        {label}
      </label>
      <input id={inputId} className={styles.input} {...inputProps} />
      {error && (
        <p className={styles.errorText} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
