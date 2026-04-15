'use client';

type SwatchGroup = {
  name: string;
  swatches: { label: string; cssVar: string; hex: string }[];
};

const palettePrimitives: SwatchGroup[] = [
  {
    name: 'Primary',
    swatches: [
      { label: '50', cssVar: '--color-primary-50', hex: '#f7f3f5' },
      { label: '100', cssVar: '--color-primary-100', hex: '#f0e5eb' },
      { label: '200', cssVar: '--color-primary-200', hex: '#e4bed3' },
      { label: '300', cssVar: '--color-primary-300', hex: '#e07bb2' },
      { label: '400', cssVar: '--color-primary-400', hex: '#e3459b' },
      { label: '500', cssVar: '--color-primary-500', hex: '#d02582' },
      { label: '600', cssVar: '--color-primary-600', hex: '#a12166' },
      { label: '700', cssVar: '--color-primary-700', hex: '#7c1d50' },
      { label: '800', cssVar: '--color-primary-800', hex: '#561a3b' },
      { label: '900', cssVar: '--color-primary-900', hex: '#311625' },
    ],
  },
  {
    name: 'Secondary',
    swatches: [
      { label: '50', cssVar: '--color-secondary-50', hex: '#f4f3f7' },
      { label: '100', cssVar: '--color-secondary-100', hex: '#e9e5f1' },
      { label: '200', cssVar: '--color-secondary-200', hex: '#ccbee4' },
      { label: '300', cssVar: '--color-secondary-300', hex: '#a07ae0' },
      { label: '400', cssVar: '--color-secondary-400', hex: '#7f44e4' },
      { label: '500', cssVar: '--color-secondary-500', hex: '#6424d1' },
      { label: '600', cssVar: '--color-secondary-600', hex: '#5020a1' },
      { label: '700', cssVar: '--color-secondary-700', hex: '#401d7c' },
      { label: '800', cssVar: '--color-secondary-800', hex: '#301a56' },
      { label: '900', cssVar: '--color-secondary-900', hex: '#201631' },
    ],
  },
  {
    name: 'Neutral',
    swatches: [
      { label: '6', cssVar: '--color-neutral-6', hex: '#100f0f' },
      { label: '10', cssVar: '--color-neutral-10', hex: '#1b181a' },
      { label: '12', cssVar: '--color-neutral-12', hex: '#201e1f' },
      { label: '17', cssVar: '--color-neutral-17', hex: '#2d2a2b' },
      { label: '20', cssVar: '--color-neutral-20', hex: '#353133' },
      { label: '22', cssVar: '--color-neutral-22', hex: '#3a3638' },
      { label: '30', cssVar: '--color-neutral-30', hex: '#4e4b4d' },
      { label: '50', cssVar: '--color-neutral-50', hex: '#827d80' },
      { label: '60', cssVar: '--color-neutral-60', hex: '#9b9799' },
      { label: '80', cssVar: '--color-neutral-80', hex: '#cdcbcc' },
      { label: '90', cssVar: '--color-neutral-90', hex: '#e6e5e6' },
      { label: '95', cssVar: '--color-neutral-95', hex: '#f2f2f2' },
      { label: '100', cssVar: '--color-neutral-100', hex: '#ffffff' },
    ],
  },
  {
    name: 'Error',
    swatches: [
      { label: '50', cssVar: '--color-error-50', hex: '#f7f3f3' },
      { label: '100', cssVar: '--color-error-100', hex: '#f1e5e5' },
      { label: '200', cssVar: '--color-error-200', hex: '#e4bebe' },
      { label: '300', cssVar: '--color-error-300', hex: '#e17a7a' },
      { label: '400', cssVar: '--color-error-400', hex: '#e54343' },
      { label: '500', cssVar: '--color-error-500', hex: '#d22323' },
      { label: '600', cssVar: '--color-error-600', hex: '#a22020' },
      { label: '700', cssVar: '--color-error-700', hex: '#7d1c1c' },
      { label: '800', cssVar: '--color-error-800', hex: '#571919' },
      { label: '900', cssVar: '--color-error-900', hex: '#311616' },
    ],
  },
  {
    name: 'Success',
    swatches: [
      { label: '50', cssVar: '--color-success-50', hex: '#f3f7f4' },
      { label: '100', cssVar: '--color-success-100', hex: '#e6f0e9' },
      { label: '200', cssVar: '--color-success-200', hex: '#c1e1cd' },
      { label: '300', cssVar: '--color-success-300', hex: '#82d9a2' },
      { label: '400', cssVar: '--color-success-400', hex: '#50d882' },
      { label: '500', cssVar: '--color-success-500', hex: '#31c467' },
      { label: '600', cssVar: '--color-success-600', hex: '#2a9852' },
      { label: '700', cssVar: '--color-success-700', hex: '#247542' },
      { label: '800', cssVar: '--color-success-800', hex: '#1e5231' },
      { label: '900', cssVar: '--color-success-900', hex: '#182f21' },
    ],
  },
  {
    name: 'Warning',
    swatches: [
      { label: '50', cssVar: '--color-warning-50', hex: '#f7f6f2' },
      { label: '100', cssVar: '--color-warning-100', hex: '#f1eee4' },
      { label: '200', cssVar: '--color-warning-200', hex: '#e7dcbc' },
      { label: '300', cssVar: '--color-warning-300', hex: '#e7cb74' },
      { label: '400', cssVar: '--color-warning-400', hex: '#eec23a' },
      { label: '500', cssVar: '--color-warning-500', hex: '#dcac19' },
      { label: '600', cssVar: '--color-warning-600', hex: '#a98619' },
      { label: '700', cssVar: '--color-warning-700', hex: '#826817' },
      { label: '800', cssVar: '--color-warning-800', hex: '#5a4a16' },
      { label: '900', cssVar: '--color-warning-900', hex: '#332b15' },
    ],
  },
  {
    name: 'Info',
    swatches: [
      { label: '50', cssVar: '--color-info-50', hex: '#f2f4f7' },
      { label: '100', cssVar: '--color-info-100', hex: '#e4e9f1' },
      { label: '200', cssVar: '--color-info-200', hex: '#bccce6' },
      { label: '300', cssVar: '--color-info-300', hex: '#76a0e5' },
      { label: '400', cssVar: '--color-info-400', hex: '#3c7fec' },
      { label: '500', cssVar: '--color-info-500', hex: '#1b64d9' },
      { label: '600', cssVar: '--color-info-600', hex: '#1a50a8' },
      { label: '700', cssVar: '--color-info-700', hex: '#184081' },
      { label: '800', cssVar: '--color-info-800', hex: '#173059' },
      { label: '900', cssVar: '--color-info-900', hex: '#152032' },
    ],
  },
];

type SemanticRole = { label: string; cssVar: string; tailwind: string };

const semanticRoles: { name: string; roles: SemanticRole[] }[] = [
  {
    name: 'Surfaces',
    roles: [
      { label: 'surface-dim', cssVar: '--surface-dim', tailwind: 'bg-surface-dim' },
      { label: 'surface', cssVar: '--surface', tailwind: 'bg-surface' },
      { label: 'surface-1', cssVar: '--surface-1', tailwind: 'bg-surface-1' },
      { label: 'surface-2', cssVar: '--surface-2', tailwind: 'bg-surface-2' },
      { label: 'surface-3', cssVar: '--surface-3', tailwind: 'bg-surface-3' },
      { label: 'surface-bright', cssVar: '--surface-bright', tailwind: 'bg-surface-bright' },
    ],
  },
  {
    name: 'On Surface',
    roles: [
      { label: 'on-surface', cssVar: '--on-surface', tailwind: 'text-on-surface' },
      { label: 'on-surface-variant', cssVar: '--on-surface-variant', tailwind: 'text-on-surface-variant' },
      { label: 'outline', cssVar: '--outline', tailwind: 'border-outline' },
      { label: 'outline-subtle', cssVar: '--outline-subtle', tailwind: 'border-outline-subtle' },
    ],
  },
  {
    name: 'Primary',
    roles: [
      { label: 'primary', cssVar: '--primary', tailwind: 'bg-primary' },
      { label: 'on-primary', cssVar: '--on-primary', tailwind: 'text-on-primary' },
      { label: 'primary-container', cssVar: '--primary-container', tailwind: 'bg-primary-container' },
      { label: 'on-primary-container', cssVar: '--on-primary-container', tailwind: 'text-on-primary-container' },
    ],
  },
  {
    name: 'Secondary',
    roles: [
      { label: 'secondary', cssVar: '--secondary', tailwind: 'bg-secondary' },
      { label: 'on-secondary', cssVar: '--on-secondary', tailwind: 'text-on-secondary' },
      { label: 'secondary-container', cssVar: '--secondary-container', tailwind: 'bg-secondary-container' },
      { label: 'on-secondary-container', cssVar: '--on-secondary-container', tailwind: 'text-on-secondary-container' },
    ],
  },
  {
    name: 'Status',
    roles: [
      { label: 'error', cssVar: '--error', tailwind: 'bg-error' },
      { label: 'error-container', cssVar: '--error-container', tailwind: 'bg-error-container' },
      { label: 'success', cssVar: '--success', tailwind: 'bg-success' },
      { label: 'success-container', cssVar: '--success-container', tailwind: 'bg-success-container' },
      { label: 'warning', cssVar: '--warning', tailwind: 'bg-warning' },
      { label: 'warning-container', cssVar: '--warning-container', tailwind: 'bg-warning-container' },
      { label: 'info', cssVar: '--info', tailwind: 'bg-info' },
      { label: 'info-container', cssVar: '--info-container', tailwind: 'bg-info-container' },
    ],
  },
];

function Swatch({ label, hex, cssVar }: { label: string; hex: string; cssVar: string }) {
  const isDark = parseInt(label, 10) >= 500 || parseInt(label, 10) <= 22;
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="w-14 h-14 rounded-component border border-outline-subtle"
        style={{ backgroundColor: `var(${cssVar})` }}
      />
      <span className="text-caption text-on-surface-variant">{label}</span>
      <span className="text-caption text-on-surface-variant opacity-60">{hex}</span>
    </div>
  );
}

function SemanticSwatch({ role }: { role: SemanticRole }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div
        className="w-10 h-10 rounded-component border border-outline-subtle shrink-0"
        style={{ backgroundColor: `var(${role.cssVar})` }}
      />
      <div className="flex flex-col">
        <span className="text-body-sm text-on-surface">{role.label}</span>
        <span className="text-caption text-on-surface-variant">{role.tailwind}</span>
      </div>
    </div>
  );
}

export function ColorPalette() {
  return (
    <div className="flex flex-col gap-10">
      {/* Palette Primitives */}
      <section>
        <h3 className="text-subtitle mb-4">Color Primitives</h3>
        <p className="text-body-sm text-on-surface-variant mb-6">
          Raw palette values from the token system. Use semantic roles in components instead.
        </p>
        <div className="flex flex-col gap-8">
          {palettePrimitives.map((group) => (
            <div key={group.name}>
              <h4 className="text-label text-on-surface-variant uppercase tracking-wider mb-3">
                {group.name}
              </h4>
              <div className="flex flex-wrap gap-2">
                {group.swatches.map((s) => (
                  <Swatch key={s.cssVar} label={s.label} hex={s.hex} cssVar={s.cssVar} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Semantic Roles */}
      <section>
        <h3 className="text-subtitle mb-4">Semantic Roles</h3>
        <p className="text-body-sm text-on-surface-variant mb-6">
          Theme-aware tokens that switch between dark and light mode. Use these in components.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {semanticRoles.map((group) => (
            <div key={group.name} className="bg-surface-1 rounded-card border border-outline-subtle p-4">
              <h4 className="text-label text-on-surface-variant uppercase tracking-wider mb-3">
                {group.name}
              </h4>
              <div className="flex flex-col">
                {group.roles.map((role) => (
                  <SemanticSwatch key={role.cssVar} role={role} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
