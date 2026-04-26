'use client';

import type { DigestMeta } from '@/types';
import { TopBar } from '@/components/atoms/TopBar';
import { Button } from '@/components/atoms/Button';
import { ToggleGroup, ToggleGroupItem } from '@/components/atoms/ToggleGroup';
import { Newspaper, Clapperboard, Trophy, Radio, ChevronLeft, ChevronRight, Menu } from 'lucide-react';

export type ActiveTab = 'news' | 'media' | 'scores' | 'live';

function formatHeaderDate(meta: DigestMeta): string {
  const d = new Date(meta.date + 'T12:00:00');
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

function formatShortDate(meta: DigestMeta): string {
  const d = new Date(meta.date + 'T12:00:00');
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function DigestTopBar({
  meta,
  activeTab,
  onTabChange,
  onPrevDate,
  onNextDate,
  onMenuOpen,
}: {
  meta: DigestMeta | null;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onPrevDate?: () => void;
  onNextDate?: () => void;
  onMenuOpen?: () => void;
}) {
  return (
    <TopBar className="justify-between shrink-0">
      <div className="flex items-center gap-component">
        {/* Mobile hamburger */}
        <Button
          variant="ghost"
          size="sm"
          iconOnly
          onClick={onMenuOpen}
          className="md:hidden"
          title="Open menu"
        >
          <Menu />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          iconOnly
          onClick={onPrevDate}
          disabled={!onPrevDate}
          title="Previous day"
        >
          <ChevronLeft />
        </Button>
        {meta ? (
          <>
            <span className="text-title-sm hidden md:inline">{formatHeaderDate(meta)}</span>
            <span className="text-title-sm md:hidden">{formatShortDate(meta)}</span>
          </>
        ) : (
          <span className="text-body-sm text-on-surface-variant">No digest loaded</span>
        )}
        <Button
          variant="ghost"
          size="sm"
          iconOnly
          onClick={onNextDate}
          disabled={!onNextDate}
          title="Next day"
        >
          <ChevronRight />
        </Button>
      </div>

      {/* Desktop tab switcher — hidden on mobile (BottomNav used instead) */}
      <ToggleGroup
        type="single"
        value={activeTab}
        onValueChange={(v) => { if (v) onTabChange(v as ActiveTab); }}
        size="sm"
        className="hidden md:inline-flex"
      >
        <ToggleGroupItem value="news" size="sm" className="gap-component">
          <Newspaper className="size-icon-1" />
          News
        </ToggleGroupItem>
        <ToggleGroupItem value="media" size="sm" className="gap-component">
          <Clapperboard className="size-icon-1" />
          Media
        </ToggleGroupItem>
        <ToggleGroupItem value="scores" size="sm" className="gap-component">
          <Trophy className="size-icon-1" />
          Scores
        </ToggleGroupItem>
      </ToggleGroup>
    </TopBar>
  );
}
