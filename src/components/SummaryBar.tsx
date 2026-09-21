import { useMemo } from "react";
import type { Expense } from "../types/expense";
import { formatAmount } from "../lib/format";
import { sumAll, sumUnsettled } from "../lib/summary";
import styles from "./SummaryBar.module.css";

type Props = {
  expenses: Expense[];
};

export function SummaryBar({ expenses }: Props) {
  const unsettledTotal = useMemo(() => sumUnsettled(expenses), [expenses]);
  const total = useMemo(() => sumAll(expenses), [expenses]);
  const unsettledCount = useMemo(
    () => expenses.filter((e) => !e.settled).length,
    [expenses],
  );

  return (
    <div className={styles.bar}>
      <p className={styles.label}>未清算合計</p>
      <p className={styles.amount}>{formatAmount(unsettledTotal)}</p>
      <p className={styles.meta}>
        未清算 {unsettledCount}件 ・ 総額（清算済み含む）{formatAmount(total)}
      </p>
    </div>
  );
}
