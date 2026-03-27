"use client";

import { useMemo } from "react";
import { ChecklistItemDTO } from "@/types";
import ChecklistItemRow from "@/components/checklist/ChecklistItemRow";
import AddItemForm from "@/components/checklist/AddItemForm";
import { Card, CardContent } from "@/components/ui/Card";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Separator } from "@/components/ui/Separator";
import { Flame } from "lucide-react";

const DAY_ORDER = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_PREFIXES_REGEX = new RegExp(`^(${DAY_ORDER.join("|")})\\s*[–—-]\\s*`);

interface Props {
  title: string;
  items: ChecklistItemDTO[];
  readOnly: boolean;
  accent: "brand" | "partner";
  weekStart: string;
  streak?: number;
  onAdd?: (item: ChecklistItemDTO) => void;
  onToggle?: (id: string, done: boolean) => void;
  onDelete?: (id: string) => void;
  onUpdate?: (item: ChecklistItemDTO) => void;
}

function groupByDay(items: ChecklistItemDTO[]): Map<string, ChecklistItemDTO[]> {
  const groups = new Map<string, ChecklistItemDTO[]>();
  for (const item of items) {
    const match = item.label.match(DAY_PREFIXES_REGEX);
    const day = match ? match[1] : "Other";
    if (!groups.has(day)) groups.set(day, []);
    groups.get(day)!.push(item);
  }
  return groups;
}

function stripDayPrefix(label: string): string {
  return label.replace(DAY_PREFIXES_REGEX, "").trim();
}

function getDayCompletion(items: ChecklistItemDTO[]): { done: number; total: number } {
  const total = items.length;
  const done = items.filter((i) => i.done).length;
  return { done, total };
}

export default function ChecklistColumn({ title, items, readOnly, accent, weekStart, streak, onAdd, onToggle, onDelete, onUpdate }: Props) {
  const done = items.filter((i) => i.done).length;
  const dayGroups = useMemo(() => groupByDay(items), [items]);
  const sortedDays = useMemo(() => {
    const days = Array.from(dayGroups.keys()).sort((a, b) => {
      if (a === "Other") return 1;
      if (b === "Other") return -1;
      return DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b);
    });
    return days;
  }, [dayGroups]);

  return (
    <Card className={`overflow-hidden ${accent === "brand" ? "border-brand-200" : "border-partner-200"}`}>
      <div className={`h-1.5 ${accent === "brand" ? "bg-gradient-to-r from-brand-500 to-brand-400" : "bg-gradient-to-r from-partner-500 to-partner-400"}`} />
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className={`h-8 w-8 ${accent === "brand" ? "bg-brand-100 text-brand-700" : "bg-partner-100 text-partner-700"}`}>
              <AvatarFallback className={accent === "brand" ? "bg-brand-100 text-brand-700" : "bg-partner-100 text-partner-700"}>
                {title[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-semibold text-foreground">{title}</span>
              {streak !== undefined && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Flame className="h-3 w-3 text-orange-500" />
                  <span>{streak} day streak</span>
                </div>
              )}
            </div>
          </div>
          <Badge variant={accent}>
            {done}/{items.length}
          </Badge>
        </div>

        {readOnly && items.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-2xl mb-2">📋</p>
            <p className="text-sm">Nothing yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedDays.map((day) => {
              const dayItems = dayGroups.get(day)!;
              const { done: dayDone, total: dayTotal } = getDayCompletion(dayItems);

              return (
                <div key={day} className="bg-muted/40 rounded-lg p-2 shadow-sm border-t border-white/20 border-b border-black/10">
                  <div className="flex items-center justify-between px-1 mb-1">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{day}</span>
                    <span className={`text-xs ${dayDone === dayTotal && dayTotal > 0 ? "text-brand-600 dark:text-brand-400" : "text-muted-foreground"}`}>
                      {dayDone}/{dayTotal} {dayDone === dayTotal && dayTotal > 0 && "✓"}
                    </span>
                  </div>
                  <div className="space-y-0">
                    {dayItems.map((item) => (
                      <ChecklistItemRow
                        key={item.id}
                        item={{ ...item, label: stripDayPrefix(item.label) }}
                        originalItem={item}
                        readOnly={readOnly}
                        accent={accent}
                        onToggle={onToggle}
                        onDelete={onDelete}
                        onUpdate={onUpdate}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!readOnly && (
          <>
            <Separator className="my-3" />
            <AddItemForm weekStart={weekStart} onAdd={onAdd!} />
          </>
        )}
      </CardContent>
    </Card>
  );
}