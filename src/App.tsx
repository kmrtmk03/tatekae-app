import { ExpenseForm } from "./components/ExpenseForm";
import { ExpenseList } from "./components/ExpenseList";
import { useExpenses } from "./hooks/useExpenses";

function App() {
  const { expenses, addExpense, toggleSettled, removeExpense, saveError } =
    useExpenses();

  return (
    <div>
      <h1>tatekae-app</h1>
      {saveError && <p role="alert">{saveError}</p>}
      <ExpenseForm onSubmit={addExpense} />
      <ExpenseList
        expenses={expenses}
        onToggleSettled={toggleSettled}
        onRemove={removeExpense}
      />
    </div>
  );
}

export default App;
