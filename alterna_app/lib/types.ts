import { EventType, SubscriptionMethod } from './constants';

// ニュースイベント型
export interface NewsEvent {
  id: string;
  url: string;
  title: string;
  description: string | null;
  event_type: EventType;
  subscription_method: SubscriptionMethod | null;
  expected_yield: number | null;
  minimum_investment: number | null;
  deadline: string | null;
  published_at: string;
  created_at: string;
}

// スナップショット型
export interface Snapshot {
  id: string;
  url: string;
  image_path: string;
  title: string | null;
  note: string | null;
  captured_at: string;
  signed_url?: string | null;
}

// API レスポンス型
export interface SnapshotsApiResponse {
  ok: boolean;
  items: Snapshot[];
  error?: string;
}

// フィルタ型
export interface NewsFilters {
  eventType?: EventType;
  subscriptionMethod?: SubscriptionMethod;
  dateFrom?: string;
  dateTo?: string;
}