'use client';

import { EmptyState } from '@/components/atoms/EmptyState';
import { Radio } from 'lucide-react';

export function LiveFeed() {
  return (
    <EmptyState
      icon={<Radio />}
      heading="Live scores coming soon"
      description="Real-time game updates will appear here during game time."
    />
  );
}
