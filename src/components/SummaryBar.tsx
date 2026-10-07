import { useMemo } from "react"
import type { IExpense } from "../types/expense.type"
import { formatAmount } from "../lib/format.utils"
import { sumAll, sumUnsettled } from "../lib/summary.utils"
import styles from "./SummaryBar.module.css"

interface ISummaryBarProps {
  expenses: IExpense[]
}

export function SummaryBar({ expenses }: ISummaryBarProps) {
  const unsettledTotal = useMemo(() => sumUnsettled(expenses), [expenses])
  const total = useMemo(() => sumAll(expenses), [expenses])
  const unsettledCount = useMemo(
    () => expenses.filter((e) => !e.settled).length,
    [expenses],
  )

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
