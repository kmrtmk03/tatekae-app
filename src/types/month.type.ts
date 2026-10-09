/** 月を表すキー。'YYYY-MM' 形式（例: '2026-10'） */
export type TMonthKey = `${number}-${number}`

/** 月フィルタの選択値。"all" は月で絞り込まない。それ以外は月キー */
export type TMonthFilter = "all" | TMonthKey
