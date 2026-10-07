/** 立て替え記録 1 件 */
export interface IExpense {
  /** 一意のID。crypto.randomUUID() で生成 */
  id: string
  /** 立て替えた日付。'YYYY-MM-DD' 形式（input[type="date"] と同じ） */
  date: string
  /** 項目名。例: 「飲み会代」「新幹線チケット」 */
  title: string
  /** 金額（円）。整数の正の数のみ */
  amount: number
  /** 清算済みなら true */
  settled: boolean
  /** 作成日時。ISO 8601 文字列。並び順の補助に使う */
  createdAt: string
}

/** 追加・編集フォームから受け取る入力値（IExpense のうちユーザーが入力する項目だけ） */
export type TExpenseInput = Pick<IExpense, "date" | "title" | "amount">

/** 一覧の清算状態フィルタ。"all" は絞り込みなし */
export type TExpenseFilter = "all" | "unsettled" | "settled"
