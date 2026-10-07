import { useState } from "react"
import styles from "./App.module.css"
import { AddExpenseModal } from "./components/AddExpenseModal"
import { EditExpenseModal } from "./components/EditExpenseModal"
import { ExpenseList } from "./components/ExpenseList"
import { FilterTabs } from "./components/FilterTabs"
import { MonthFilter } from "./components/MonthFilter"
import { SummaryBar } from "./components/SummaryBar"
import { useExpenseFilters } from "./hooks/useExpenseFilters"
import { useExpenses } from "./hooks/useExpenses"
import type { IExpense } from "./types/expense.type"

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

  // 編集モーダルの対象（null なら閉じている）
  const [editingExpense, setEditingExpense] = useState<IExpense | null>(null)
  // 新規追加モーダルの開閉状態
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  function handleOpenAddModal() {
    setIsAddModalOpen(true)
  }

  function handleCloseAddModal() {
    setIsAddModalOpen(false)
  }

  function handleCloseEditModal() {
    setEditingExpense(null)
  }

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
        {/* サマリーは絞り込み前の全件で計算する（フィルタの影響を受けない） */}
        <SummaryBar expenses={expenses} />
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
          onEdit={setEditingExpense}
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

      {isAddModalOpen && (
        <AddExpenseModal onSubmit={addExpense} onClose={handleCloseAddModal} />
      )}

      {editingExpense && (
        <EditExpenseModal
          expense={editingExpense}
          onSave={updateExpense}
          onClose={handleCloseEditModal}
        />
      )}
    </div>
  )
}

export default App
