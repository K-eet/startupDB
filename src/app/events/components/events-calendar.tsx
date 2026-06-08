'use client';

import * as React from 'react';
import { addDays, format, isSameDay, isToday, startOfWeek } from 'date-fns';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function EventsCalendar({ eventDates }: { eventDates: Date[] }) {
  const days = React.useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    return Array.from({ length: 28 }, (_, i) => addDays(start, i));
  }, []);

  const hasEvent = (day: Date) => eventDates.some((d) => isSameDay(d, day));

  return (
    <div className="border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold text-sm uppercase tracking-wide">Calendar</h2>
        <span className="text-xs text-muted-foreground">Next 4 weeks</span>
      </div>
      <div className="grid grid-cols-7 gap-y-2 text-center">
        {WEEKDAYS.map((day) => (
          <div key={day} className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            {day}
          </div>
        ))}
        {days.map((day) => (
          <div key={day.toISOString()} className="flex flex-col items-center gap-1 py-1">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full text-sm ${
                isToday(day) ? 'bg-primary font-semibold text-primary-foreground' : 'text-foreground'
              }`}
            >
              {format(day, 'd')}
            </span>
            <span className={`h-1 w-1 rounded-full ${hasEvent(day) ? 'bg-primary' : 'bg-transparent'}`} />
          </div>
        ))}
      </div>
    </div>
  );
}
