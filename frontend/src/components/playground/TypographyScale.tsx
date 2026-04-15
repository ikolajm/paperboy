'use client';

type TypographyPreset = {
  className: string;
  name: string;
  font: string;
  size: string;
  lineHeight: string;
  weight: string;
  letterSpacing?: string;
};

const presets: TypographyPreset[] = [
  {
    className: 'text-display',
    name: 'Display',
    font: 'JetBrains Mono',
    size: '40px',
    lineHeight: '48px',
    weight: '700',
    letterSpacing: '-0.02em',
  },
  {
    className: 'text-headline',
    name: 'Headline',
    font: 'JetBrains Mono',
    size: '32px',
    lineHeight: '40px',
    weight: '700',
    letterSpacing: '-0.01em',
  },
  {
    className: 'text-title',
    name: 'Title',
    font: 'JetBrains Mono',
    size: '24px',
    lineHeight: '32px',
    weight: '700',
    letterSpacing: '-0.01em',
  },
  {
    className: 'text-subtitle',
    name: 'Subtitle',
    font: 'JetBrains Mono',
    size: '18px',
    lineHeight: '24px',
    weight: '600',
  },
  {
    className: 'text-body-lg',
    name: 'Body Large',
    font: 'Source Sans 3',
    size: '18px',
    lineHeight: '28px',
    weight: '400',
  },
  {
    className: 'text-body',
    name: 'Body',
    font: 'Source Sans 3',
    size: '16px',
    lineHeight: '24px',
    weight: '400',
  },
  {
    className: 'text-body-sm',
    name: 'Body Small',
    font: 'Source Sans 3',
    size: '14px',
    lineHeight: '20px',
    weight: '400',
  },
  {
    className: 'text-label',
    name: 'Label',
    font: 'Source Sans 3',
    size: '12px',
    lineHeight: '16px',
    weight: '500',
    letterSpacing: '0.02em',
  },
  {
    className: 'text-caption',
    name: 'Caption',
    font: 'Source Sans 3',
    size: '10px',
    lineHeight: '14px',
    weight: '400',
    letterSpacing: '0.03em',
  },
];

function PresetRow({ preset }: { preset: TypographyPreset }) {
  return (
    <div className="flex flex-col gap-2 py-4 border-b border-outline-subtle last:border-b-0">
      <div className="flex items-baseline justify-between gap-4">
        <span className={`${preset.className} text-on-surface`}>
          {preset.name}
        </span>
        <span className="text-caption text-on-surface-variant shrink-0">
          .{preset.className}
        </span>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        <span className="text-caption text-on-surface-variant">
          {preset.font}
        </span>
        <span className="text-caption text-on-surface-variant">
          {preset.size} / {preset.lineHeight}
        </span>
        <span className="text-caption text-on-surface-variant">
          w{preset.weight}
        </span>
        {preset.letterSpacing && (
          <span className="text-caption text-on-surface-variant">
            ls {preset.letterSpacing}
          </span>
        )}
      </div>
    </div>
  );
}

export function TypographyScale() {
  return (
    <div className="flex flex-col gap-8">
      <section>
        <h3 className="text-subtitle mb-2">Type Scale</h3>
        <p className="text-body-sm text-on-surface-variant mb-6">
          Typography presets defined as CSS classes in tokens.css. Apply directly via className.
        </p>
        <div className="bg-surface-1 rounded-card border border-outline-subtle p-6">
          {presets.map((preset) => (
            <PresetRow key={preset.className} preset={preset} />
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-subtitle mb-2">Font Families</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-surface-1 rounded-card border border-outline-subtle p-4">
            <h4 className="text-label text-on-surface-variant uppercase tracking-wider mb-3">
              Headings
            </h4>
            <p className="font-heading text-on-surface text-lg">
              JetBrains Mono
            </p>
            <p className="font-heading text-on-surface-variant text-sm mt-1">
              ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />
              abcdefghijklmnopqrstuvwxyz<br />
              0123456789
            </p>
          </div>
          <div className="bg-surface-1 rounded-card border border-outline-subtle p-4">
            <h4 className="text-label text-on-surface-variant uppercase tracking-wider mb-3">
              Body
            </h4>
            <p className="font-body text-on-surface text-lg">
              Source Sans 3
            </p>
            <p className="font-body text-on-surface-variant text-sm mt-1">
              ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />
              abcdefghijklmnopqrstuvwxyz<br />
              0123456789
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
