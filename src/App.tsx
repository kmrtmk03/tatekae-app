import { ExpenseForm } from "./components/ExpenseForm";
import { useExpenses } from "./hooks/useExpenses";
import { formatAmount, formatDate } from "./lib/format";

function App() {
  const { expenses, addExpense, saveError } = useExpenses();

  return (
    <div>
      <h1>tatekae-app</h1>
      {saveError && <p role="alert">{saveError}</p>}
      <ExpenseForm onSubmit={addExpense} />

      {/* 仮の一覧表示。Phase 3 で ExpenseList / ExpenseItem に置き換える */}
      <ul>
        {expenses.map((e) => (
          <li key={e.id}>
            {formatDate(e.date)} {e.title} {formatAmount(e.amount)}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
