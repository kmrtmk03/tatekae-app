import { useId } from "react"
import type { TExpenseColorFilter } from "../../types/expense.type"
import type { TMonthFilter, TMonthKey } from "../../types/month.type"
import { ColorFilter } from "../ColorFilter/ColorFilter"
import { FormFieldLayout } from "../FormFieldLayout/FormFieldLayout"
import { Modal } from "../Modal/Modal"
import { MonthFilter } from "../MonthFilter/MonthFilter"
import styles from "./FilterModal.module.css"

interface IFilterModalProps {
  /** 選択中の月。ALL_MONTHS または 'YYYY-MM' */
  month: TMonthFilter
  /** 月の選択肢（記録が存在する月） */
  monthKeys: TMonthKey[]
  onMonthChange: (value: TMonthFilter) => void
  /** 選択中のラベル色。ALL_COLORS または色 */
  color: TExpenseColorFilter
  onColorChange: (value: TExpenseColorFilter) => void
  /** 月と色の絞り込みを解除する */
  onReset: () => void
  onClose: () => void
}

/**
 * 月とラベル色の絞り込みを 1 つのモーダルで設定する。
 * 選択は即座に一覧へ反映されるため確定ボタンは無く、「完了」で閉じるだけ。
 * 絞り込みの状態は呼び出し側（useExpenseFilters）が持つので、閉じても維持される。
 */
export function FilterModal({
  month,
  monthKeys,
  onMonthChange,
  color,
  onColorChange,
  onReset,
  onClose,
}: IFilterModalProps) {
  const monthFilterId = useId()

  return (
    <Modal title="絞り込み" onClose={onClose}>
      <div className={styles.body}>
        <FormFieldLayout label="精算月" htmlFor={monthFilterId}>
          <MonthFilter
            id={monthFilterId}
            value={month}
            monthKeys={monthKeys}
            onChange={onMonthChange}
          />
        </FormFieldLayout>

        <ColorFilter value={color} onChange={onColorChange} />

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.resetButton}
            onClick={onReset}
          >
            解除
          </button>
          <button type="button" className={styles.doneButton} onClick={onClose}>
            完了
          </button>
        </div>
      </div>
    </Modal>
  )
}
