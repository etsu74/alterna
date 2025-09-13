import { useQuery } from '@tanstack/react-query';
import { SnapshotsApiResponse } from '@/lib/types';

export const useSnapshots = () => {
  return useQuery({
    queryKey: ['snapshots'],
    queryFn: async (): Promise<SnapshotsApiResponse> => {
      const response = await fetch('/api/snapshots');

      if (!response.ok) {
        throw new Error(`Failed to fetch snapshots: ${response.status}`);
      }

      const data: SnapshotsApiResponse = await response.json();

      if (!data.ok) {
        throw new Error(data.error || 'Unknown error occurred');
      }

      return data;
    },
    staleTime: 5 * 60 * 1000, // 5分間キャッシュ
    gcTime: 10 * 60 * 1000, // 10分間保持
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};