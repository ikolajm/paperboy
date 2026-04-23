'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Digest } from '@/types';
import { EmptyState } from '@/components/atoms/EmptyState';
import { Newspaper } from 'lucide-react';
import { DigestSidebar } from './DigestSidebar';
import { DigestTopBar, type ActiveTab } from './DigestTopBar';
import { NewsFeed } from './NewsFeed';
import { MediaFeed } from './MediaFeed';
import { ScoreboardPanel } from './ScoreboardPanel';

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
          {activeTab === 'news' && (
            <NewsFeed
              sections={digest?.sections ?? null}
              date={currentDate}
              availableDeepDives={digest?.deep_dives.map(d => d.id) ?? []}
            />
          )}
          {activeTab === 'media' && (
            <MediaFeed sections={digest?.sections ?? null} />
          )}
          {activeTab === 'scores' && (
            <ScoreboardPanel scores={digest?.sections.scores ?? null} />
          )}
        </main>
      </div>
    </div>
  );
}
