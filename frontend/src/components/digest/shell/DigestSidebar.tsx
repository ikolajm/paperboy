'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/atoms/Sidebar';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/atoms/Select';
import { SidebarItem } from '@/components/atoms/Sidebar';
import { Separator } from '@/components/atoms/Separator';
import { ThemeToggle } from '@/components/providers/ThemeToggle';
import { Logo } from '@/components/atoms/Logo';

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
  });
}

function formatMonthLabel(monthStr: string): string {
  const d = new Date(monthStr + '-15T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

/** Shared inner content used by both the desktop Sidebar and the mobile Sheet */
export function DigestSidebarContent({
  dates,
  selectedDate,
  onSelectDate,
}: {
  dates: string[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
}) {
  const months = [...new Set(dates.map((d) => d.slice(0, 7)))];
  const [selectedMonth, setSelectedMonth] = useState(
    selectedDate.slice(0, 7) || months[0] || ''
  );

  useEffect(() => {
    if (selectedDate) {
      setSelectedMonth(selectedDate.slice(0, 7));
    }
  }, [selectedDate]);

  const filteredDates = dates.filter((d) => d.startsWith(selectedMonth));

  return (
    <div className="flex flex-1 flex-col justify-between overflow-hidden">
      <div className="flex flex-col gap-group overflow-hidden">
        <div className="px-group-compact">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((m) => (
                <SelectItem key={m} value={m}>
                  {formatMonthLabel(m)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col overflow-y-auto">
          {filteredDates.map((d) => (
            <SidebarItem
              key={d}
              size="sm"
              active={d === selectedDate}
              onClick={() => onSelectDate(d)}
            >
              {formatDateLabel(d)}
            </SidebarItem>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-group">
        <Separator />
        <div className="px-group-compact">
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}

export function DigestSidebar({
  dates,
  selectedDate,
  onSelectDate,
}: {
  dates: string[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
}) {
  return (
    <Sidebar size="sm" className="flex flex-col gap-group h-full py-section">
      <div className="flex flex-col gap-group">
        <div className="flex items-center gap-group px-group">
          <Logo size={28} />
          <span className="text-title-sm">
            Paperboy
          </span>
        </div>
        <Separator />
      </div>
      <DigestSidebarContent
        dates={dates}
        selectedDate={selectedDate}
        onSelectDate={onSelectDate}
      />
    </Sidebar>
  );
}
