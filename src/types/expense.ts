export type Expense = {
  /** 一意のID。crypto.randomUUID() で生成 */
  id: string;
  /** 立て替えた日付。'YYYY-MM-DD' 形式（input[type="date"] と同じ） */
  date: string;
  /** 項目名。例: 「飲み会代」「新幹線チケット」 */
  title: string;
  /** 金額（円）。整数の正の数のみ */
  amount: number;
  /** 清算済みなら true */
  settled: boolean;
  /** 作成日時。ISO 8601 文字列。並び順の補助に使う */
  createdAt: string;
};
