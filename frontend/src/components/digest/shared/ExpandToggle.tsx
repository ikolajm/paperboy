'use client';

import { Button } from '@/components/atoms/Button';
import { ChevronDown, ChevronUp } from 'lucide-react';

export function ExpandToggle({
  expanded,
  onToggle,
  showToggle = true,
  children,
}: {
  expanded: boolean;
  onToggle: () => void;
  showToggle?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-content py-component border-t border-outline-subtle">
      <div className="flex items-center gap-component flex-wrap text-label-sm text-on-surface-variant">
        {children}
      </div>
      {showToggle && (
        <Button
          variant="ghost"
          size="sm"
          iconOnly
          onClick={onToggle}
          title={expanded ? 'Collapse' : 'Expand'}
        >
          {expanded ? <ChevronUp /> : <ChevronDown />}
        </Button>
      )}
    </div>
  );
}
