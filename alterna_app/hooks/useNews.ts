import { useQuery } from '@tanstack/react-query';
import { NewsEvent, NewsFilters } from '@/lib/types';

export const useNews = (filters?: NewsFilters) => {
  return useQuery({
    queryKey: ['news', filters],
    queryFn: async (): Promise<NewsEvent[]> => {
      const params = new URLSearchParams();

      if (filters?.eventType) {
        params.append('eventType', filters.eventType);
      }

      if (filters?.subscriptionMethod) {
        params.append('subscriptionMethod', filters.subscriptionMethod);
      }

      if (filters?.dateFrom) {
        params.append('dateFrom', filters.dateFrom);
      }

      if (filters?.dateTo) {
        params.append('dateTo', filters.dateTo);
      }

      const url = `/api/news${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch news: ${response.statusText}`);
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5分間キャッシュ
    gcTime: 10 * 60 * 1000, // 10分間保持
    refetchOnWindowFocus: false,
    refetchInterval: 15 * 60 * 1000 // 15分毎に自動更新
  });
};