'use client';

import { useState } from 'react';
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
  const [selectedDate, setSelectedDate] = useState(
    digest?.meta.date ?? dates[0] ?? ''
  );
  const [activeTab, setActiveTab] = useState<ActiveTab>('news');

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
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DigestTopBar
          meta={digest?.meta ?? null}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        <main className="flex-1 overflow-y-auto p-6">
          {activeTab === 'news' ? (
            <NewsFeed sections={digest?.sections ?? null} />
          ) : (
            <ScoreboardPanel scores={digest?.sections.scores ?? null} />
          )}
        </main>
      </div>
    </div>
  );
}
