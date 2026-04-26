import { MapPin, Tv } from 'lucide-react';

export function VenueBroadcast({ venue, broadcasts }: { venue?: string; broadcasts?: string[] }) {
  if (!venue && (!broadcasts || broadcasts.length === 0)) return null;

  return (
    <div className="flex flex-col gap-component">
      {venue && (
        <div className="flex items-center gap-component text-body-sm text-on-surface-variant">
          <MapPin className="size-icon-1 shrink-0" />
          {venue}
        </div>
      )}
      {broadcasts && broadcasts.length > 0 && (
        <div className="flex items-center gap-component text-body-sm text-on-surface-variant">
          <Tv className="size-icon-1 shrink-0" />
          {broadcasts.join(', ')}
        </div>
      )}
    </div>
  );
}
