import styles from "./App.module.css"
import { AddExpenseModal } from "./components/AddExpenseModal/AddExpenseModal"
import { EditExpenseModal } from "./components/EditExpenseModal/EditExpenseModal"
import { ExpenseList } from "./components/ExpenseList/ExpenseList"
import { FilterButton } from "./components/FilterButton/FilterButton"
import { FilterModal } from "./components/FilterModal/FilterModal"
import { FilterTabs } from "./components/FilterTabs/FilterTabs"
import { SummaryBar } from "./components/SummaryBar/SummaryBar"
import { useExpenseFilters } from "./hooks/useExpenseFilters"
import { useExpenses } from "./hooks/useExpenses"
import { useModalState } from "./hooks/useModalState"
import type { TNewExpenseInput } from "./types/expense.type"

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
    selectedColors,
    toggleColor,
    clearColors,
    activeFilterCount,
    resetFilters,
    revealNewExpense,
  } = useExpenseFilters(expenses)

  /** 記録を追加し、今の絞り込みで隠れる場合は絞り込みを解除して一覧に出す */
  function handleAddExpense(input: TNewExpenseInput) {
    addExpense(input)
    revealNewExpense(input)
  }

  const {
    modal,
    editingExpense,
    openAddModal,
    openEditModal,
    openFilterModal,
    closeModal,
  } = useModalState(expenses)

  return (
    <div className={styles.page}>
      <header className={styles.header}>
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
          onEdit={openEditModal}
          onRemove={removeExpense}
          emptyMessage={emptyMessage}
        />
      </main>

      <FilterButton activeCount={activeFilterCount} onClick={openFilterModal} />

      <button
        type="button"
        className={styles.addButton}
        onClick={openAddModal}
        aria-label="記録を追加"
      >
        ＋
      </button>

      {modal.type === "add" && (
        <AddExpenseModal onSubmit={handleAddExpense} onClose={closeModal} />
      )}

      {modal.type === "filter" && (
        <FilterModal
          month={activeMonth}
          monthKeys={monthKeys}
          onMonthChange={setSelectedMonth}
          colors={selectedColors}
          onColorToggle={toggleColor}
          onColorClear={clearColors}
          onReset={resetFilters}
          onClose={closeModal}
        />
      )}

      {editingExpense && (
        <EditExpenseModal
          expense={editingExpense}
          onSave={updateExpense}
          onClose={closeModal}
        />
      )}
    </div>
  )
}

export default App
