'use client';

import { useState, useEffect, type ReactNode, type ComponentType } from 'react';

// --- Control types ---
export type ControlDef =
  | { type: 'select'; prop: string; label: string; options: string[] }
  | { type: 'boolean'; prop: string; label: string }
  | { type: 'text'; prop: string; label: string };

export interface StoryDef {
  component: ComponentType<any>;
  name: string;
  defaultProps: Record<string, any>;
  controls: ControlDef[];
}

// --- Control components ---
function SelectControl({
  control,
  value,
  onChange,
}: {
  control: Extract<ControlDef, { type: 'select' }>;
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-outline-subtle">
      <label className="text-sm text-on-surface-variant">{control.label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-surface-2 text-on-surface text-sm px-2 py-1 rounded-input border border-outline-subtle"
      >
        {control.options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

function BooleanControl({
  control,
  value,
  onChange,
}: {
  control: Extract<ControlDef, { type: 'boolean' }>;
  value: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-outline-subtle">
      <label className="text-sm text-on-surface-variant">{control.label}</label>
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 accent-primary"
      />
    </div>
  );
}

function TextControl({
  control,
  value,
  onChange,
}: {
  control: Extract<ControlDef, { type: 'text' }>;
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-outline-subtle">
      <label className="text-sm text-on-surface-variant">{control.label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-surface-2 text-on-surface text-sm px-2 py-1 rounded-input border border-outline-subtle w-48"
      />
    </div>
  );
}

// --- Playground ---
export function ComponentPlayground({ story }: { story: StoryDef }) {
  const [props, setProps] = useState<Record<string, any>>(story.defaultProps);

  // Reset props when switching between stories
  useEffect(() => {
    setProps(story.defaultProps);
  }, [story]);

  const updateProp = (prop: string, value: any) => {
    setProps((prev) => ({ ...prev, [prop]: value }));
  };

  const Component = story.component;

  // Separate children from other props — void elements (input, select) can't receive children
  const { children, ...restProps } = props;

  return (
    <div className="flex flex-col gap-8">
      {/* Preview */}
      <div className="bg-surface rounded-card border border-outline-subtle p-10 flex items-center justify-center min-h-[200px]">
        {children !== undefined ? (
          <Component {...restProps}>{children}</Component>
        ) : (
          <Component {...restProps} />
        )}
      </div>

      {/* Controls */}
      <div className="bg-surface-1 rounded-card border border-outline-subtle p-4">
        <h3 className="text-sm font-semibold text-on-surface mb-3">Controls</h3>
        <div className="flex flex-col">
          {story.controls.map((control) => {
            const value = props[control.prop] ?? story.defaultProps[control.prop];

            switch (control.type) {
              case 'select':
                return (
                  <SelectControl
                    key={control.prop}
                    control={control}
                    value={value}
                    onChange={(val) => updateProp(control.prop, val)}
                  />
                );
              case 'boolean':
                return (
                  <BooleanControl
                    key={control.prop}
                    control={control}
                    value={!!value}
                    onChange={(val) => updateProp(control.prop, val)}
                  />
                );
              case 'text':
                return (
                  <TextControl
                    key={control.prop}
                    control={control}
                    value={value ?? ''}
                    onChange={(val) => updateProp(control.prop, val)}
                  />
                );
            }
          })}
        </div>
      </div>
    </div>
  );
}
