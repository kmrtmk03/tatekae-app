import { useState } from "react"
import styles from "./App.module.css"
import { AddExpenseModal } from "./components/AddExpenseModal/AddExpenseModal"
import { EditExpenseModal } from "./components/EditExpenseModal/EditExpenseModal"
import { ExpenseList } from "./components/ExpenseList/ExpenseList"
import { FilterTabs } from "./components/FilterTabs/FilterTabs"
import { MonthFilter } from "./components/MonthFilter/MonthFilter"
import { SummaryBar } from "./components/SummaryBar/SummaryBar"
import { useExpenseFilters } from "./hooks/useExpenseFilters"
import { useExpenses } from "./hooks/useExpenses"
import type { IExpense } from "./types/expense.type"

/**
 * 開いているモーダルの状態。追加と編集が同時に開く状態を型の上で作れないようにする。
 * 編集は対象の記録を id で持つ。
 */
type TModalState =
  { type: "closed" } | { type: "add" } | { type: "edit"; id: string }

function App() {
  const {
    expenses,
    addExpense,
    updateExpense,
    toggleSettled,
    removeExpense,
    saveError,
  } = useExpenses()
  const {
    filteredExpenses,
    emptyMessage,
    statusFilter,
    setStatusFilter,
    monthKeys,
    activeMonth,
    setSelectedMonth,
  } = useExpenseFilters(expenses)

  const [modal, setModal] = useState<TModalState>({ type: "closed" })

  // 編集対象は id で持ち、最新の記録を expenses から引く（編集中に記録が更新されても古いコピーを見ない）
  const editingExpense =
    modal.type === "edit"
      ? expenses.find((expense) => expense.id === modal.id)
      : undefined

  function handleOpenAddModal() {
    setModal({ type: "add" })
  }

  function handleOpenEditModal(expense: IExpense) {
    setModal({ type: "edit", id: expense.id })
  }

  function handleCloseModal() {
    setModal({ type: "closed" })
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.summaryRow}>
          {/* サマリーは絞り込み前の全件で計算する（フィルタの影響を受けない） */}
          <SummaryBar expenses={expenses} />
          <MonthFilter
            value={activeMonth}
            monthKeys={monthKeys}
            onChange={setSelectedMonth}
          />
        </div>
        <FilterTabs value={statusFilter} onChange={setStatusFilter} />
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
          onEdit={handleOpenEditModal}
          onRemove={removeExpense}
          emptyMessage={emptyMessage}
        />
      </main>

      <button
        type="button"
        className={styles.addButton}
        onClick={handleOpenAddModal}
        aria-label="記録を追加"
      >
        ＋
      </button>

      {modal.type === "add" && (
        <AddExpenseModal onSubmit={addExpense} onClose={handleCloseModal} />
      )}

      {editingExpense && (
        <EditExpenseModal
          expense={editingExpense}
          onSave={updateExpense}
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}

export default App
