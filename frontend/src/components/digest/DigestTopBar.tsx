'use client';

import type { DigestMeta } from '@/types';
import { TopBar } from '@/components/atoms/TopBar';
import { Badge } from '@/components/atoms/Badge';
import { cn } from '@/components/atoms/cn';
import { Newspaper, Clapperboard, Trophy, ChevronLeft, ChevronRight } from 'lucide-react';

export type ActiveTab = 'news' | 'media' | 'scores';

function formatHeaderDate(meta: DigestMeta): string {
  const d = new Date(meta.date + 'T12:00:00');
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function DigestTopBar({
  meta,
  activeTab,
  onTabChange,
  onPrevDate,
  onNextDate,
}: {
  meta: DigestMeta | null;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onPrevDate?: () => void;
  onNextDate?: () => void;
}) {
  return (
    <TopBar className="justify-between shrink-0">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPrevDate}
          disabled={!onPrevDate}
          className="p-1 rounded-md text-on-surface-variant hover:text-on-surface disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Previous day"
        >
          <ChevronLeft className="size-4" />
        </button>
        {meta ? (
          <>
            <span className="font-semibold">{formatHeaderDate(meta)}</span>
            <Badge variant="neutral" size="sm">
              {meta.story_count} stories
            </Badge>
          </>
        ) : (
          <span className="text-on-surface-variant">No digest loaded</span>
        )}
        <button
          type="button"
          onClick={onNextDate}
          disabled={!onNextDate}
          className="p-1 rounded-md text-on-surface-variant hover:text-on-surface disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Next day"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
      <div className="flex items-center rounded-pill border border-outline-subtle p-0.5">
        <TabButton
          active={activeTab === 'news'}
          onClick={() => onTabChange('news')}
          icon={<Newspaper className="size-4" />}
          label="News"
        />
        <TabButton
          active={activeTab === 'media'}
          onClick={() => onTabChange('media')}
          icon={<Clapperboard className="size-4" />}
          label="Media"
        />
        <TabButton
          active={activeTab === 'scores'}
          onClick={() => onTabChange('scores')}
          icon={<Trophy className="size-4" />}
          label="Scores"
        />
      </div>
    </TopBar>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 rounded-pill px-3 py-1 text-label-md font-medium cursor-pointer transition-colors',
        active
          ? 'bg-primary-container text-on-primary-container'
          : 'text-on-surface-variant hover:text-on-surface'
      )}
    >
      {icon}
      {label}
    </button>
  );
}
