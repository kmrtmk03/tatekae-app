import type { ChangeEvent } from "react"
import { formatMonth } from "../../lib/format.utils"
import { ALL_MONTHS, isMonthFilter } from "../../lib/month.utils"
import type { TMonthFilter, TMonthKey } from "../../types/month.type"
import styles from "./MonthFilter.module.css"

interface IMonthFilterProps {
  /** 選択中の値。ALL_MONTHS または 'YYYY-MM' */
  value: TMonthFilter
  /** 記録が存在する月の月キー（'YYYY-MM'）。選択肢として表示する */
  monthKeys: TMonthKey[]
  onChange: (value: TMonthFilter) => void
}

/** 表示する月を絞り込むセレクトボックス（記録が存在する月だけを選択肢に出す） */
export function MonthFilter({ value, monthKeys, onChange }: IMonthFilterProps) {
  function handleChange(e: ChangeEvent<HTMLSelectElement>) {
    // 選択肢は ALL_MONTHS と monthKeys だけだが、型として保証するため検証してから渡す
    if (isMonthFilter(e.target.value)) onChange(e.target.value)
  }

  return (
    <select
      className={styles.select}
      value={value}
      onChange={handleChange}
      aria-label="表示する月"
    >
      <option value={ALL_MONTHS}>すべての月</option>
      {monthKeys.map((monthKey) => (
        <option key={monthKey} value={monthKey}>
          {formatMonth(monthKey)}
        </option>
      ))}
    </select>
  )
}
