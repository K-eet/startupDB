'use client';

import * as React from 'react';
import { addDays, format, isSameDay, isToday, startOfWeek } from 'date-fns';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface EventsCalendarProps {
  eventDates: Date[];
  selectedDate: Date | null;
  onSelectDate: (day: Date | null) => void;
}

export function EventsCalendar({ eventDates, selectedDate, onSelectDate }: EventsCalendarProps) {
  const days = React.useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    return Array.from({ length: 28 }, (_, i) => addDays(start, i));
  }, []);

  const hasEvent = (day: Date) => eventDates.some((d) => isSameDay(d, day));

  return (
    <div className="border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold text-sm uppercase tracking-wide">Calendar</h2>
        {selectedDate ? (
          <button onClick={() => onSelectDate(null)} className="text-xs text-primary font-medium hover:underline">
            Clear day
          </button>
        ) : (
          <span className="text-xs text-muted-foreground">Next 4 weeks</span>
        )}
      </div>
      <div className="grid grid-cols-7 gap-y-2 text-center">
        {WEEKDAYS.map((day) => (
          <div key={day} className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            {day}
          </div>
        ))}
        {days.map((day) => {
          const dayHasEvent = hasEvent(day);
          const isSelected = selectedDate !== null && isSameDay(day, selectedDate);
          const circle = `flex h-7 w-7 items-center justify-center rounded-full text-sm transition-colors ${
            isToday(day) ? 'bg-primary font-semibold text-primary-foreground' : 'text-foreground'
          }${isSelected ? ' ring-2 ring-primary ring-offset-1 ring-offset-card' : ''}${
            dayHasEvent && !isToday(day) ? ' hover:bg-accent' : ''
          }`;
          const inner = (
            <>
              <span className={circle}>{format(day, 'd')}</span>
              <span className={`h-1 w-1 rounded-full ${dayHasEvent ? 'bg-primary' : 'bg-transparent'}`} />
            </>
          );

          // Only days that have events are clickable — clicking toggles the filter.
          return dayHasEvent ? (
            <button
              key={day.toISOString()}
              type="button"
              aria-pressed={isSelected}
              aria-label={`${format(day, 'PPP')} — filter to this day`}
              onClick={() => onSelectDate(isSelected ? null : day)}
              className="flex flex-col items-center gap-1 py-1 cursor-pointer"
            >
              {inner}
            </button>
          ) : (
            <div key={day.toISOString()} className="flex flex-col items-center gap-1 py-1">
              {inner}
            </div>
          );
        })}
      </div>
    </div>
  );
}
