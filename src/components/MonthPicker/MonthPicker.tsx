import { useId, useState } from "react"
import type { KeyboardEvent } from "react"
import { formatMonth } from "../../lib/format.utils"
import { parseMonthKey, toMonthKey } from "../../lib/month.utils"
import type { TMonthKey } from "../../types/month.type"
import { FormFieldLayout } from "../FormFieldLayout/FormFieldLayout"
import styles from "./MonthPicker.module.css"

/** 選択できる年の範囲。年の前後ボタンはこの範囲内でのみ動く */
const MIN_YEAR = 2000
const MAX_YEAR = 2100

/** 月ボタンの並び（1〜12 月） */
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)

interface IMonthPickerProps {
  /** 入力欄の上に表示するラベル文言 */
  label: string
  /** 選択中の月 */
  value: TMonthKey
  /** 月を選んだときに呼ばれる。選択後、一覧は自動で閉じる */
  onChange: (value: TMonthKey) => void
}

/**
 * 年と月を選ぶアプリ共通の月ピッカー。ネイティブの input[type="month"] の代わりに使う。
 *
 * - 閉じている間は選択中の月（例: 2026年10月）をボタンで表示し、押すと下に年の切り替えと 12 か月の一覧が開く
 * - 一覧は同じ位置に展開する（ポップアップにしない）ため、モーダルの中でも重ならない
 * - 一覧を開いている間の Escape は一覧だけを閉じ、親のモーダルは閉じない
 */
export function MonthPicker({ label, value, onChange }: IMonthPickerProps) {
  const triggerId = useId()
  const listId = useId()
  const selected = parseMonthKey(value)
  const [isOpen, setIsOpen] = useState(false)
  // 一覧に表示中の年。開くたびに選択中の年へ戻す
  const [viewYear, setViewYear] = useState(selected.year)

  function handleToggle() {
    if (!isOpen) setViewYear(selected.year)
    setIsOpen((prev) => !prev)
  }

  function handleSelectMonth(month: number) {
    const monthKey = toMonthKey(viewYear, month)
    if (monthKey === null) return
    onChange(monthKey)
    setIsOpen(false)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key !== "Escape" || !isOpen) return
    // 親のモーダルの Escape 処理（document のリスナー）に届かないようにする
    e.stopPropagation()
    setIsOpen(false)
  }

  return (
    <FormFieldLayout label={label} htmlFor={triggerId}>
      <div className={styles.picker} onKeyDown={handleKeyDown}>
        <button
          id={triggerId}
          type="button"
          className={styles.trigger}
          onClick={handleToggle}
          aria-expanded={isOpen}
          aria-controls={listId}
          // ラベルに紐付けるだけだと選択中の月が読み上げられないため、値も含めた名前を付ける
          aria-label={`${label}: ${formatMonth(value)}`}
        >
          <span>{formatMonth(value)}</span>
          <span className={styles.chevron} aria-hidden="true">
            ▾
          </span>
        </button>

        {isOpen && (
          <div id={listId} className={styles.panel}>
            <div className={styles.yearRow}>
              <button
                type="button"
                className={styles.yearButton}
                onClick={() => setViewYear((prev) => prev - 1)}
                disabled={viewYear <= MIN_YEAR}
                aria-label="前の年"
              >
                ‹
              </button>
              <span className={styles.year}>{viewYear}年</span>
              <button
                type="button"
                className={styles.yearButton}
                onClick={() => setViewYear((prev) => prev + 1)}
                disabled={viewYear >= MAX_YEAR}
                aria-label="次の年"
              >
                ›
              </button>
            </div>
            <div className={styles.months}>
              {MONTHS.map((month) => {
                const isSelected =
                  viewYear === selected.year && month === selected.month
                return (
                  <button
                    key={month}
                    type="button"
                    className={`${styles.monthButton} ${isSelected ? styles.selected : ""}`}
                    onClick={() => handleSelectMonth(month)}
                    aria-pressed={isSelected}
                  >
                    {month}月
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </FormFieldLayout>
  )
}
