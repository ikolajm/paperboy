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
import { TreeView, type TreeNodeData } from '@/components/atoms/TreeView';
import { Separator } from '@/components/atoms/Separator';
import { ThemeToggle } from '@/components/providers/ThemeToggle';
import { Calendar } from 'lucide-react';

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function formatMonthLabel(monthStr: string): string {
  const d = new Date(monthStr + '-15T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
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

  const treeData: TreeNodeData[] = filteredDates.map((d) => ({
    id: d,
    label: formatDateLabel(d),
    icon: <Calendar className="size-full" />,
  }));

  return (
    <Sidebar size="sm" className="h-full justify-between py-4">
      <div className="flex flex-col gap-3">
        <span className="px-3 text-title-sm font-semibold tracking-tight">
          Paperboy
        </span>
        <Separator />
        <div className="px-2">
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
        <TreeView
          data={treeData}
          size="sm"
          selectedId={selectedDate}
          {...{ onSelect: onSelectDate } as any}
        />
      </div>
      <div className="flex flex-col gap-3">
        <Separator />
        <div className="px-2">
          <ThemeToggle />
        </div>
      </div>
    </Sidebar>
  );
}
