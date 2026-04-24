'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Digest } from '@/types';
import { EmptyState } from '@/components/atoms/EmptyState';
import { BottomNav, BottomNavItem } from '@/components/atoms/BottomNav';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/atoms/Sheet';
import { Newspaper, Clapperboard, Trophy, Radio } from 'lucide-react';
import { DigestSidebar, DigestSidebarContent } from './DigestSidebar';
import { DigestTopBar, type ActiveTab } from './DigestTopBar';
import { NewsFeed } from '../news/NewsFeed';
import { MediaFeed } from '../media/MediaFeed';
import { ScoreboardPanel } from '../scores/ScoreboardPanel';
import { LiveFeed } from '../live/LiveFeed';
import { Logo } from '../../atoms/Logo';
import { Separator } from '../../atoms/Separator';

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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentIndex = dates.indexOf(currentDate);
  const prevDate = currentIndex < dates.length - 1 ? dates[currentIndex + 1] : null;
  const nextDate = currentIndex > 0 ? dates[currentIndex - 1] : null;

  const navigateToDate = useCallback(
    (date: string) => {
      router.push(`/?date=${date}`);
      setSidebarOpen(false);
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
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <DigestSidebar
          dates={dates}
          selectedDate={currentDate}
          onSelectDate={navigateToDate}
        />
      </div>

      {/* Mobile sidebar sheet */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" size="sm" className="md:hidden !bg-surface border-r border-outline-subtle">
          <SheetHeader className='flex flex-row items-center gap-component px-group'>
            <Logo size={28} className="text-on-surface" />
            <SheetTitle>Paperboy</SheetTitle>
          </SheetHeader>
          <Separator />
          <DigestSidebarContent
            dates={dates}
            selectedDate={currentDate}
            onSelectDate={navigateToDate}
          />
        </SheetContent>
      </Sheet>

      <div className="flex flex-1 flex-col overflow-hidden">
        <DigestTopBar
          meta={digest?.meta ?? null}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onPrevDate={prevDate ? () => navigateToDate(prevDate) : undefined}
          onNextDate={nextDate ? () => navigateToDate(nextDate) : undefined}
          onMenuOpen={() => setSidebarOpen(true)}
        />
        <main className="flex-1 overflow-y-auto px-content-compact md:px-content py-content-compact md:py-content pb-20 md:pb-6">
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
            <ScoreboardPanel scores={digest?.sections.scores ?? null} date={currentDate} />
          )}
          {activeTab === 'live' && (
            <LiveFeed />
          )}
        </main>

        {/* Mobile bottom nav */}
        <div className="md:hidden fixed bottom-0 inset-x-0 z-[var(--z-sticky)]">
          <BottomNav>
            <BottomNavItem
              active={activeTab === 'news'}
              onClick={() => setActiveTab('news')}
              icon={<Newspaper className="size-icon-2" />}
            >
              News
            </BottomNavItem>
            <BottomNavItem
              active={activeTab === 'media'}
              onClick={() => setActiveTab('media')}
              icon={<Clapperboard className="size-icon-2" />}
            >
              Media
            </BottomNavItem>
            <BottomNavItem
              active={activeTab === 'scores'}
              onClick={() => setActiveTab('scores')}
              icon={<Trophy className="size-icon-2" />}
            >
              Scores
            </BottomNavItem>
            <BottomNavItem
              active={activeTab === 'live'}
              onClick={() => setActiveTab('live')}
              icon={<Radio className="size-icon-2" />}
            >
              Live
            </BottomNavItem>
          </BottomNav>
        </div>
      </div>
    </div>
  );
}
