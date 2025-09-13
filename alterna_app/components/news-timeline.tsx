'use client';

import { useNews } from '@/hooks/useNews';
import { NewsCard } from './news-card';
import { NewsFilters } from '@/lib/types';

interface NewsTimelineProps {
  filters?: NewsFilters;
}

export function NewsTimeline({ filters }: NewsTimelineProps) {
  const { data: events, isLoading, error, refetch } = useNews(filters);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-2">
                <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
              </div>
              <div className="h-4 w-16 bg-gray-200 rounded"></div>
            </div>
            <div className="h-6 w-3/4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
            <div className="h-4 w-2/3 bg-gray-200 rounded mb-4"></div>
            <div className="flex gap-4">
              <div className="h-4 w-24 bg-gray-200 rounded"></div>
              <div className="h-4 w-24 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-800 mb-4">ニュースの読み込みに失敗しました</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          再試行
        </button>
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <p className="text-gray-600">表示するニュースがありません</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <NewsCard key={event.id} event={event} />
      ))}
    </div>
  );
}