import { formatMonth } from "../lib/format.utils"
import { ALL_MONTHS } from "../lib/month.utils"
import styles from "./MonthFilter.module.css"

interface IMonthFilterProps {
  /** 選択中の値。ALL_MONTHS または 'YYYY-MM' */
  value: string
  /** 記録が存在する月の月キー（'YYYY-MM'）。選択肢として表示する */
  monthKeys: string[]
  onChange: (value: string) => void
}

/** 表示する月を絞り込むセレクトボックス（記録が存在する月だけを選択肢に出す） */
export function MonthFilter({ value, monthKeys, onChange }: IMonthFilterProps) {
  return (
    <select
      className={styles.select}
      value={value}
      onChange={(e) => onChange(e.target.value)}
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
