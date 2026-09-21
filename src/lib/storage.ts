import type { Expense } from "../types/expense";

const STORAGE_KEY = "tatekae-app/expenses/v1";
const STORAGE_VERSION = 1;

type StoredData = {
  version: number;
  expenses: Expense[];
};

function isExpense(value: unknown): value is Expense {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    typeof v.date === "string" &&
    typeof v.title === "string" &&
    typeof v.amount === "number" &&
    typeof v.settled === "boolean" &&
    typeof v.createdAt === "string"
  );
}

/**
 * localStorage から記録一覧を読み込む。
 * JSON パース失敗や想定外の形式のときは空配列にフォールバックする（例外を投げない）。
 */
export function loadExpenses(): Expense[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === null) return [];

  try {
    const parsed = JSON.parse(raw) as StoredData;
    if (!Array.isArray(parsed?.expenses)) return [];
    return parsed.expenses.filter(isExpense);
  } catch {
    return [];
  }
}

/**
 * localStorage へ記録一覧を保存する。
 * 容量超過などの例外は握りつぶさず呼び出し元に伝播させる。
 */
export function saveExpenses(expenses: Expense[]): void {
  const data: StoredData = { version: STORAGE_VERSION, expenses };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
