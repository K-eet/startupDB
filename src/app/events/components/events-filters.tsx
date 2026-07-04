'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { SlidersHorizontal } from 'lucide-react';
import { eventCategoryOrder, categoryDotClass, type EventCategory } from '@/lib/events-data';

export function EventsFilters({
  activeCategories,
  onToggleCategory,
  onlyMine,
  onOnlyMineChange,
  mineAvailable,
}: {
  activeCategories: Set<EventCategory>;
  onToggleCategory: (category: EventCategory) => void;
  onlyMine: boolean;
  onOnlyMineChange: (value: boolean) => void;
  mineAvailable: boolean;
}) {
  return (
    <div className="border border-border bg-card p-4">
      <div className="flex items-center gap-2 mb-4">
        <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
        <h2 className="font-semibold text-sm uppercase tracking-wide">Filters</h2>
      </div>

      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">Category</p>
      <div className="flex flex-col gap-0.5">
        {eventCategoryOrder.map((category) => (
          <label
            key={category}
            className="flex items-center gap-2.5 py-1.5 px-1 cursor-pointer text-sm"
          >
            <Checkbox
              checked={activeCategories.has(category)}
              onCheckedChange={() => onToggleCategory(category)}
            />
            <span className={`h-2 w-2 rounded-full flex-shrink-0 ${categoryDotClass[category]}`} />
            <span>{category}</span>
          </label>
        ))}
      </div>

      {mineAvailable && (
        <>
          <Separator className="my-3" />
          <label className="flex items-center gap-2.5 py-0.5 px-1 cursor-pointer text-sm">
            <Checkbox checked={onlyMine} onCheckedChange={(v) => onOnlyMineChange(v === true)} />
            <span>Only my events</span>
          </label>
        </>
      )}
    </div>
  );
}
