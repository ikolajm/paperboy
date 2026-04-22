'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Digest } from '@/types';
import { EmptyState } from '@/components/atoms/EmptyState';
import { Newspaper } from 'lucide-react';
import { DigestSidebar } from './DigestSidebar';
import { DigestTopBar } from './DigestTopBar';
import { NewsFeed } from './NewsFeed';
import { ScoreboardPanel } from './ScoreboardPanel';

type ActiveTab = 'news' | 'scores';

export function DigestShell({
  digest,
  dates,
}: {
  digest: Digest | null;
  dates: string[];
}) {
  const router = useRouter();
  const currentDate = digest?.meta.date ?? dates[0] ?? '';
  const [activeTab, setActiveTab] = useState<ActiveTab>('news');

  const currentIndex = dates.indexOf(currentDate);
  // dates are sorted most-recent-first, so "prev" is index+1 and "next" is index-1
  const prevDate = currentIndex < dates.length - 1 ? dates[currentIndex + 1] : null;
  const nextDate = currentIndex > 0 ? dates[currentIndex - 1] : null;

  const navigateToDate = useCallback(
    (date: string) => {
      router.push(`/?date=${date}`);
    },
    [router]
  );

  if (!digest && dates.length === 0) {
    return (
      <div className="flex h-dvh items-center justify-center">
        <EmptyState
          icon={<Newspaper />}
          heading="No digests available"
          description="Run a daily digest to get started."
        />
      </div>
    );
  }

  return (
    <div className="flex h-dvh overflow-hidden">
      <DigestSidebar
        dates={dates}
        selectedDate={currentDate}
        onSelectDate={navigateToDate}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DigestTopBar
          meta={digest?.meta ?? null}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onPrevDate={prevDate ? () => navigateToDate(prevDate) : undefined}
          onNextDate={nextDate ? () => navigateToDate(nextDate) : undefined}
        />
        <main className="flex-1 overflow-y-auto p-6">
          {activeTab === 'news' ? (
            <NewsFeed sections={digest?.sections ?? null} date={currentDate} />
          ) : (
            <ScoreboardPanel scores={digest?.sections.scores ?? null} />
          )}
        </main>
      </div>
    </div>
  );
}
