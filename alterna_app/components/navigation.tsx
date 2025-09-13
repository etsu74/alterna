'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Navigation() {
  const pathname = usePathname();

  const tabs = [
    {
      name: 'ニュース',
      href: '/',
      testId: 'news-tab',
      active: pathname === '/'
    },
    {
      name: 'スナップショット',
      href: '/snapshots',
      testId: 'snapshots-tab',
      active: pathname === '/snapshots'
    }
  ];

  return (
    <nav className="border-b border-gray-200">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex space-x-8">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              data-testid={tab.testId}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${tab.active
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}