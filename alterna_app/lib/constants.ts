// イベント種別定数
export const EVENT_TYPES = {
  NEW_LISTING: 'NEW_LISTING',
  REDEMPTION: 'REDEMPTION',
  RESULT: 'RESULT',
  REVIEW: 'REVIEW'
} as const;

// 申込方式定数
export const SUBSCRIPTION_METHODS = {
  FCFS: 'FCFS',
  DRAW: 'DRAW'
} as const;

// UIラベル定義
export const EVENT_TYPE_LABELS = {
  [EVENT_TYPES.NEW_LISTING]: '新着案件',
  [EVENT_TYPES.REDEMPTION]: '償還・分配',
  [EVENT_TYPES.RESULT]: '抽選・運用結果',
  [EVENT_TYPES.REVIEW]: '評判・レビュー'
} as const;

export const SUBSCRIPTION_METHOD_LABELS = {
  [SUBSCRIPTION_METHODS.FCFS]: '先着順',
  [SUBSCRIPTION_METHODS.DRAW]: '抽選方式'
} as const;

// 型定義
export type EventType = typeof EVENT_TYPES[keyof typeof EVENT_TYPES];
export type SubscriptionMethod = typeof SUBSCRIPTION_METHODS[keyof typeof SUBSCRIPTION_METHODS];