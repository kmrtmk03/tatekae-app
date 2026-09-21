export type ExpenseFormErrors = {
  title?: string;
  amount?: string;
};

export function validateExpenseInput(
  title: string,
  amount: string,
): ExpenseFormErrors {
  const errors: ExpenseFormErrors = {};

  if (title.trim() === "") {
    errors.title = "項目名を入力してください";
  }

  const amountValue = Number(amount);
  if (amount.trim() === "" || Number.isNaN(amountValue) || amountValue <= 0) {
    errors.amount = "金額は1円以上の数値を入力してください";
  }

  return errors;
}
