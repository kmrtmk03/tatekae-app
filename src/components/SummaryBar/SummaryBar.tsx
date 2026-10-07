import type { IExpense } from "../../types/expense.type"
import { formatAmount } from "../../lib/format.utils"
import { countUnsettled, sumAll, sumUnsettled } from "../../lib/summary.utils"
import styles from "./SummaryBar.module.css"

interface ISummaryBarProps {
  expenses: IExpense[]
}

/** 未清算合計を大きく、未清算件数と総額（清算済み含む）を補助情報として表示する */
export function SummaryBar({ expenses }: ISummaryBarProps) {
  // 件数規模が小さく計算が軽いため、メモ化せずレンダリング時に計算する
  const unsettledTotal = sumUnsettled(expenses)
  const total = sumAll(expenses)
  const unsettledCount = countUnsettled(expenses)

  return (
    <div className={styles.bar}>
      <p className={styles.label}>未清算合計</p>
      <p className={styles.amount}>{formatAmount(unsettledTotal)}</p>
      <p className={styles.meta}>
        未清算 {unsettledCount}件 ・ 総額（清算済み含む）{formatAmount(total)}
      </p>
    </div>
  )
}
