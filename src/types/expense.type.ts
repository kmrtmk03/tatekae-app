import type { TMonthKey } from "./month.type"

/** 記録に付けられるラベル色。選択肢は lib/expense-color.constants.ts の EXPENSE_COLOR_OPTIONS */
export type TExpenseColor = "red" | "orange" | "green" | "blue" | "purple"

/** 立て替え記録 1 件 */
export interface IExpense {
  /** 一意のID。crypto.randomUUID() で生成 */
  id: string
  /** 立替精算する月。'YYYY-MM' 形式（input[type="month"] と同じ） */
  month: TMonthKey
  /** 項目名。例: 「飲み会代」「新幹線チケット」 */
  title: string
  /** 金額（円）。整数の正の数のみ */
  amount: number
  /** 清算済みなら true */
  settled: boolean
  /** ラベル色。新規作成時に選ぶ。色を持たない旧データは既定色で読み込む */
  color: TExpenseColor
  /** 作成日時。ISO 8601 文字列。並び順の補助に使う */
  createdAt: string
}

/** 追加・編集フォームから受け取る入力値（IExpense のうちユーザーが入力する項目だけ） */
export type TExpenseInput = Pick<IExpense, "month" | "title" | "amount">

/** 新規追加時の入力値。編集では色を変えないため、色は追加のときだけ受け取る */
export type TNewExpenseInput = TExpenseInput & Pick<IExpense, "color">

/** 一覧の清算状態フィルタ。"all" は絞り込みなし */
export type TExpenseFilter = "all" | "unsettled" | "settled"
