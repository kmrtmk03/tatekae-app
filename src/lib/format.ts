const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

/** 金額を「¥12,345」の形式に整形する */
export function formatAmount(n: number): string {
  return `¥${n.toLocaleString("ja-JP")}`;
}

/** 'YYYY-MM-DD' を「9/21(日)」の形式に整形する */
export function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  // タイムゾーンによる日付のずれを避けるため、ローカル日時として組み立てる
  const date = new Date(year, month - 1, day);
  return `${month}/${day}(${WEEKDAYS[date.getDay()]})`;
}
