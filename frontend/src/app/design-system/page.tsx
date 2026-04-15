'use client';

import { useState } from 'react';
import { ComponentPlayground } from '../../components/playground/ComponentPlayground';
import { ColorPalette } from '../../components/playground/ColorPalette';
import { TypographyScale } from '../../components/playground/TypographyScale';
import {
  stories,
  sidebarSections,
  type ActiveView,
  type StoryKey,
} from '../../stories/registry';

const specialPages = new Set(['colors', 'typography']);

function getPageTitle(view: ActiveView): string {
  if (view === 'colors') return 'Colors';
  if (view === 'typography') return 'Typography';
  return stories[view as StoryKey].name;
}

export default function DesignSystemPage() {
  const [activeView, setActiveView] = useState<ActiveView>('colors');

  return (
    <div className="min-h-screen bg-surface text-on-surface flex">
      {/* Sidebar */}
      <nav className="w-60 border-r border-outline-subtle p-4 flex flex-col gap-5 overflow-y-auto shrink-0">
        <h1 className="text-subtitle">Design System</h1>

        {Object.entries(sidebarSections).map(([section, { items }]) => (
          <div key={section}>
            <h2 className="text-label text-on-surface-variant uppercase tracking-wider mb-2">
              {section}
            </h2>
            <ul className="flex flex-col gap-0.5">
              {items.map(({ key, label }) => (
                <li key={key}>
                  <button
                    onClick={() => setActiveView(key)}
                    className={`w-full text-left px-3 py-1.5 text-sm rounded-component transition-colors ${
                      activeView === key
                        ? 'bg-primary-container text-on-primary-container'
                        : 'text-on-surface-variant hover:bg-surface-2'
                    }`}
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <h2 className="text-title mb-6">
          {getPageTitle(activeView)}
        </h2>

        {activeView === 'colors' && <ColorPalette />}
        {activeView === 'typography' && <TypographyScale />}
        {!specialPages.has(activeView) && (
          <ComponentPlayground story={stories[activeView as StoryKey]} />
        )}
      </main>
    </div>
  );
}
