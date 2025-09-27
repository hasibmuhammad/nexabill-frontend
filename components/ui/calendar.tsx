"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectOption } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import moment, { Moment } from "moment";
import { useMemo, useState } from "react";

export interface CalendarProps {
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  className?: string;
  initialMonth?: Date;
  disabled?: (date: Date) => boolean;
  showShortcutBar?: boolean;
}

export function Calendar({
  selected,
  onSelect,
  className,
  initialMonth,
  disabled,
  showShortcutBar = true,
}: CalendarProps) {
  const initial = initialMonth
    ? moment(initialMonth)
    : selected
    ? moment(selected)
    : moment();

  const [viewMonth, setViewMonth] = useState<Moment>(
    initial.clone().startOf("month")
  );

  const weeks = useMemo(() => {
    const start = viewMonth.clone().startOf("week");
    const end = viewMonth.clone().endOf("month").endOf("week");
    const days: Moment[] = [];
    const cursor = start.clone();
    while (cursor.isSameOrBefore(end, "day")) {
      days.push(cursor.clone());
      cursor.add(1, "day");
    }
    const chunked: Moment[][] = [];
    for (let i = 0; i < days.length; i += 7) chunked.push(days.slice(i, i + 7));
    return chunked;
  }, [viewMonth]);

  const selectedMoment = selected ? moment(selected) : null;
  const monthNames = moment.months();
  const currentYear = moment().year();
  const years = useMemo(() => {
    const list: number[] = [];
    for (let y = currentYear - 50; y <= currentYear + 50; y++) list.push(y);
    return list;
  }, [currentYear]);
  const monthOptions: SelectOption[] = monthNames.map((name, idx) => ({
    value: String(idx),
    label: name,
  }));
  const yearOptions: SelectOption[] = years.map((y) => ({
    value: String(y),
    label: String(y),
  }));

  return (
    <Card
      className={cn(
        "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700",
        className
      )}
    >
      <div className="py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setViewMonth((m) => m.clone().subtract(1, "month"))}
          className="h-8 w-8 p-0"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="relative w-32">
            <Select
              aria-label="Select month"
              value={String(viewMonth.month())}
              onChange={(val) =>
                setViewMonth((m) => m.clone().month(parseInt(val)))
              }
              options={monthOptions}
              className="m-0"
              selectClassName="px-2 py-1 text-xs h-8 w-full"
            />
          </div>
          <div className="relative w-24">
            <Select
              aria-label="Select year"
              value={String(viewMonth.year())}
              onChange={(val) =>
                setViewMonth((m) => m.clone().year(parseInt(val)))
              }
              options={yearOptions}
              className="m-0"
              selectClassName="px-2 py-1 text-xs h-8 w-full"
            />
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setViewMonth((m) => m.clone().add(1, "month"))}
          className="h-8 w-8 p-0"
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="px-3 pt-3 pb-3">
        <div className="grid grid-cols-7 gap-1 mb-2 text-xs text-slate-500 dark:text-slate-400">
          {moment.weekdaysShort().map((d) => (
            <div key={d} className="text-center">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {weeks.map((week, wi) =>
            week.map((day) => {
              const inMonth = day.isSame(viewMonth, "month");
              const isSelected = selectedMoment
                ? day.isSame(selectedMoment, "day")
                : false;
              const isToday = day.isSame(moment(), "day");
              const isDisabled = disabled ? disabled(day.toDate()) : false;
              return (
                <button
                  key={day.format("YYYY-MM-DD") + wi}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => onSelect && onSelect(day.toDate())}
                  className={cn(
                    "h-9 rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500",
                    isSelected
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : isToday
                      ? "bg-blue-50 text-blue-700 dark:bg-slate-700/50 dark:text-blue-300"
                      : inMonth
                      ? "text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                      : "text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700",
                    isDisabled && "opacity-40 cursor-not-allowed"
                  )}
                  aria-current={isToday ? "date" : undefined}
                  aria-selected={isSelected || undefined}
                >
                  {day.date()}
                </button>
              );
            })
          )}
        </div>
      </div>
      {showShortcutBar && (
        <div className="px-3 pb-3 flex items-center justify-between gap-2">
          <button
            type="button"
            className="text-xs px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition-colors"
            onClick={() => onSelect && onSelect(new Date())}
          >
            Today
          </button>
          <button
            type="button"
            className="text-xs px-2 py-1 rounded-md text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            onClick={() => onSelect && onSelect(undefined)}
          >
            Clear
          </button>
        </div>
      )}
    </Card>
  );
}

export default Calendar;
