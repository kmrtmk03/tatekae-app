import styles from "./App.module.css";
import { ExpenseForm } from "./components/ExpenseForm";
import { ExpenseList } from "./components/ExpenseList";
import { SummaryBar } from "./components/SummaryBar";
import { useExpenses } from "./hooks/useExpenses";

function App() {
  const { expenses, addExpense, toggleSettled, removeExpense, saveError } =
    useExpenses();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>立て替え管理</h1>
        <SummaryBar expenses={expenses} />
      </header>

      {saveError && (
        <p className={styles.alert} role="alert">
          {saveError}
        </p>
      )}

      <main className={styles.listArea}>
        <ExpenseList
          expenses={expenses}
          onToggleSettled={toggleSettled}
          onRemove={removeExpense}
        />
      </main>

      <div className={styles.formArea}>
        <ExpenseForm onSubmit={addExpense} />
      </div>
    </div>
  );
}

export default App;
