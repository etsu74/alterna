import Link from 'next/link';
import { NewsEvent } from '@/lib/types';
import { EVENT_TYPE_LABELS, SUBSCRIPTION_METHOD_LABELS } from '@/lib/constants';

interface NewsCardProps {
  event: NewsEvent;
}

export function NewsCard({ event }: NewsCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    });
  };

  const formatYield = (yield_rate: number | null) => {
    if (!yield_rate) return null;
    return `${yield_rate}%`;
  };

  const formatInvestment = (amount: number | null) => {
    if (!amount) return null;
    return `${amount.toLocaleString()}円`;
  };

  const getEventTypeColor = (eventType: string) => {
    switch (eventType) {
      case 'NEW_LISTING':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'REDEMPTION':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'RESULT':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'REVIEW':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSubscriptionMethodColor = (method: string | null) => {
    if (!method) return '';
    switch (method) {
      case 'FCFS':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'DRAW':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-2 flex-wrap">
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getEventTypeColor(event.event_type)}`}>
            {EVENT_TYPE_LABELS[event.event_type as keyof typeof EVENT_TYPE_LABELS]}
          </span>
          {event.subscription_method && (
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSubscriptionMethodColor(event.subscription_method)}`}>
              {SUBSCRIPTION_METHOD_LABELS[event.subscription_method as keyof typeof SUBSCRIPTION_METHOD_LABELS]}
            </span>
          )}
        </div>
        <time className="text-sm text-gray-500">
          {formatDate(event.published_at)}
        </time>
      </div>

      <h3 className="text-lg font-semibold mb-2 line-clamp-2">
        <Link
          href={event.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-900 hover:text-blue-600 transition-colors"
        >
          {event.title}
        </Link>
      </h3>

      {event.description && (
        <p className="text-gray-600 mb-4 line-clamp-3">
          {event.description}
        </p>
      )}

      <div className="flex gap-4 text-sm text-gray-700">
        {event.expected_yield && (
          <div>
            <span className="font-medium">想定利回り:</span> {formatYield(event.expected_yield)}
          </div>
        )}
        {event.minimum_investment && (
          <div>
            <span className="font-medium">最低投資額:</span> {formatInvestment(event.minimum_investment)}
          </div>
        )}
      </div>

      {event.deadline && (
        <div className="mt-2 text-sm text-red-600">
          <span className="font-medium">締切:</span> {formatDate(event.deadline)}
        </div>
      )}
    </div>
  );
}