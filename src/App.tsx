import { useMemo, useState } from "react";
import styles from "./App.module.css";
import { EditExpenseModal } from "./components/EditExpenseModal";
import { ExpenseForm } from "./components/ExpenseForm";
import { ExpenseList } from "./components/ExpenseList";
import type { ExpenseFilter } from "./components/FilterTabs";
import { FilterTabs } from "./components/FilterTabs";
import { SummaryBar } from "./components/SummaryBar";
import { useExpenses } from "./hooks/useExpenses";
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
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const filteredExpenses = useMemo(() => {
    if (filter === "unsettled") return expenses.filter((e) => !e.settled);
    if (filter === "settled") return expenses.filter((e) => e.settled);
    return expenses;
  }, [expenses, filter]);

  const emptyMessage =
    expenses.length === 0 ? "まだ記録がありません" : "該当する記録がありません";

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>立て替え管理</h1>
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

      <div className={styles.formArea}>
        <ExpenseForm onSubmit={addExpense} />
      </div>

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
