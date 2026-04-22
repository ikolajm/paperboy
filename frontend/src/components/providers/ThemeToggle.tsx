'use client';

import { useTheme } from './ThemeProvider';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/atoms/Select';
import { Label } from '@/components/atoms/Label';

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  return (
    <div className={`flex flex-col gap-component-compact ${className ?? ''}`}>
      <Label htmlFor="theme-select" size="sm" className="justify-start">Theme</Label>
      <Select value={theme} onValueChange={(v) => setTheme(v as 'light' | 'dark' | 'system')}>
        <SelectTrigger size="sm" className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="light">Light</SelectItem>
          <SelectItem value="dark">Dark</SelectItem>
          <SelectItem value="system">System</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
