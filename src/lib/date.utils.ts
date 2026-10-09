/** 'YYYY-MM-DD' を分解した値。month は 1〜12 */
export interface IDateParts {
  year: number
  month: number
  day: number
}

/** 今日の日付を 'YYYY-MM-DD' で返す（タイムゾーンのずれを避けるためローカル日時で組み立てる） */
export function todayISO(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

/** 'YYYY-MM-DD' を年・月・日に分解する。形式の検証はしないため、呼び出し側で正しい形式を渡すこと */
export function parseISODate(iso: string): IDateParts {
  const [year, month, day] = iso.split("-").map(Number)
  return { year, month, day }
}
