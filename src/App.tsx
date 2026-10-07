import { useMemo, useState } from "react";
import styles from "./App.module.css";
import { AddExpenseModal } from "./components/AddExpenseModal";
import { EditExpenseModal } from "./components/EditExpenseModal";
import { ExpenseList } from "./components/ExpenseList";
import type { ExpenseFilter } from "./components/FilterTabs";
import { FilterTabs } from "./components/FilterTabs";
import { MonthFilter } from "./components/MonthFilter";
import { SummaryBar } from "./components/SummaryBar";
import { useExpenses } from "./hooks/useExpenses";
import { ALL_MONTHS, getMonthKey, listMonthKeys } from "./lib/month";
import type { Expense } from "./types/expense";

function App() {
  const {
    expenses,
    addExpense,
    updateExpense,
    toggleSettled,
    removeExpense,
    saveError,
  } = useExpenses();
  const [filter, setFilter] = useState<ExpenseFilter>("all");
  // 選択中の月（ALL_MONTHS または 'YYYY-MM'）
  const [selectedMonth, setSelectedMonth] = useState(ALL_MONTHS);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  // 新規追加モーダルの開閉状態
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const monthKeys = useMemo(() => listMonthKeys(expenses), [expenses]);

  // 選択中の月の記録が削除・編集で無くなった場合は「すべての月」に戻して扱う
  const activeMonth = monthKeys.includes(selectedMonth)
    ? selectedMonth
    : ALL_MONTHS;

  // 月 → 清算状態の順で絞り込む（SummaryBar には絞り込み前の全件を渡す）
  const filteredExpenses = useMemo(() => {
    const monthExpenses =
      activeMonth === ALL_MONTHS
        ? expenses
        : expenses.filter((e) => getMonthKey(e.date) === activeMonth);
    if (filter === "unsettled") return monthExpenses.filter((e) => !e.settled);
    if (filter === "settled") return monthExpenses.filter((e) => e.settled);
    return monthExpenses;
  }, [expenses, activeMonth, filter]);

  const emptyMessage =
    expenses.length === 0 ? "まだ記録がありません" : "該当する記録がありません";

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>立て替え管理</h1>
          <MonthFilter
            value={activeMonth}
            monthKeys={monthKeys}
            onChange={setSelectedMonth}
          />
        </div>
        <SummaryBar expenses={expenses} />
        <FilterTabs value={filter} onChange={setFilter} />
      </header>

      {saveError && (
        <p className={styles.alert} role="alert">
          {saveError}
        </p>
      )}

      <main className={styles.listArea}>
        <ExpenseList
          expenses={filteredExpenses}
          onToggleSettled={toggleSettled}
          onEdit={setEditingExpense}
          onRemove={removeExpense}
          emptyMessage={emptyMessage}
        />
      </main>

      <button
        type="button"
        className={styles.addButton}
        onClick={() => setIsAddModalOpen(true)}
        aria-label="記録を追加"
      >
        ＋
      </button>

      {isAddModalOpen && (
        <AddExpenseModal
          onSubmit={addExpense}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}

      {editingExpense && (
        <EditExpenseModal
          expense={editingExpense}
          onSave={updateExpense}
          onClose={() => setEditingExpense(null)}
        />
      )}
    </div>
  );
}

export default App;
