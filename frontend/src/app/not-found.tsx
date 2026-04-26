import Link from 'next/link';
import { EmptyState } from '@/components/atoms/EmptyState';
import { SearchX } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex h-dvh items-center justify-center bg-surface">
      <div className="flex flex-col items-center gap-section">
        <EmptyState
          icon={<SearchX />}
          heading="Page not found"
          description="The page you're looking for doesn't exist or has been moved."
        />
        <Link
          href="/"
          className="text-label-md text-primary hover:text-primary/80 transition-colors"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
