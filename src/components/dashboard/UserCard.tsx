"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { Separator } from "@/components/ui/Separator";
import { MealLog } from "@/generated/prisma";
import MealRow from "@/components/dashboard/MealRow";
import { Flame, ChevronDown, ChevronUp } from "lucide-react";

const MEAL_TYPES = ["breakfast", "lunch", "dinner"] as const;

const MEAL_LABELS: Record<string, { label: string; emoji: string }> = {
  breakfast: { label: "Breakfast", emoji: "🌅" },
  lunch: { label: "Lunch", emoji: "☀️" },
  dinner: { label: "Dinner", emoji: "🌙" },
};

const DAY_PREFIXES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function parseTaskLabel(label: string): { taskName: string; icon: string } {
  for (const day of DAY_PREFIXES) {
    if (label.startsWith(`${day} –`) || label.startsWith(`${day} -`)) {
      const rest = label.slice(day.length).replace(/^[\s–—-]+/, "");
      const iconMatch = rest.match(/\s+(\p{Emoji}|\p{Emoji_Presentation}|\p{Emoji_Modifier}|\p{Emoji_Modifier_Base}|\p{Emoji_Component})+$/u);
      if (iconMatch) {
        const icon = iconMatch[0].trim();
        const name = rest.slice(0, -iconMatch[0].length).trim();
        return { taskName: name, icon };
      }
      return { taskName: rest.trim(), icon: "" };
    }
  }
  const iconMatch = label.match(/\s+(\p{Emoji}|\p{Emoji_Presentation}|\p{Emoji_Modifier}|\p{Emoji_Modifier_Base}|\p{Emoji_Component})+$/u);
  if (iconMatch) {
    const icon = iconMatch[0].trim();
    const name = label.slice(0, -iconMatch[0].length).trim();
    return { taskName: name, icon };
  }
  return { taskName: label, icon: "" };
}

interface TaskItem {
  id: string;
  label: string;
  done: boolean;
}

interface Props {
  name: string;
  items: TaskItem[];
  meals: MealLog[];
  streak: number;
  readOnly: boolean;
  accent: "brand" | "partner";
  today: string;
  defaultCollapsed?: boolean;
  onToggle?: (id: string, done: boolean) => void;
  onMealAdd?: (meal: MealLog) => void;
  onMealUpdate?: (meal: MealLog) => void;
  onMealDelete?: (id: string) => void;
}

function TaskRow({ item, readOnly, onToggle }: {
  item: TaskItem;
  readOnly: boolean;
  onToggle?: (id: string, done: boolean) => void;
}) {
  const [localDone, setLocalDone] = useState(item.done);
  const { taskName, icon } = parseTaskLabel(item.label);

  async function handleToggle() {
    const next = !localDone;
    setLocalDone(next);
    try {
      const res = await fetch(`/api/checklist/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ done: next }),
      });
      if (!res.ok) setLocalDone(localDone);
      else onToggle?.(item.id, next);
    } catch {
      setLocalDone(localDone);
    }
  }

  return (
    <button
      onClick={readOnly ? undefined : handleToggle}
      disabled={readOnly}
      className={`w-full flex items-center gap-2.5 py-2 px-2 rounded-lg transition-all duration-200 ${
        readOnly ? "cursor-default opacity-60" : "cursor-pointer hover:bg-muted/50 active:scale-[0.98]"
      }`}
    >
      <div
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 shrink-0 ${
          localDone
            ? "bg-brand-500 border-brand-500 scale-100"
            : "border-muted-foreground/30 hover:border-brand-400"
        }`}
      >
        {localDone && (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="text-white">
            <path d="M2 5l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span className={`text-sm text-left flex-1 ${localDone ? "line-through text-muted-foreground" : "text-foreground"}`}>
        {taskName}
      </span>
      {icon && <span className="text-base shrink-0">{icon}</span>}
    </button>
  );
}

export default function UserCard({
  name,
  items,
  meals,
  streak,
  readOnly,
  accent,
  today,
  defaultCollapsed = false,
  onToggle,
  onMealAdd,
  onMealUpdate,
  onMealDelete,
}: Props) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  const done = items.filter((i) => i.done).length;
  const progress = items.length > 0 ? (done / items.length) * 100 : 0;

  function getMealStatus(type: string): "done" | "empty" {
    const entry = meals.find((m) => m.mealType === type);
    if (!entry) return "empty";
    return "done";
  }

  const collapsedTasks = items.slice(0, 3).map((item) => {
    const { taskName, icon } = parseTaskLabel(item.label);
    return { ...item, taskName, icon };
  });
  const hasMore = items.length > 3;

  return (
    <Card className={`overflow-hidden ${accent === "brand" ? "border-brand-200" : "border-partner-200"}`}>
      <div className={`h-1.5 ${accent === "brand" ? "bg-gradient-to-r from-brand-500 to-brand-400" : "bg-gradient-to-r from-partner-500 to-partner-400"}`} />
      <CardContent className="p-0">
        <div
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/30 transition-colors"
        >
          <Avatar className={`h-9 w-9 shrink-0 ${accent === "brand" ? "bg-brand-100 text-brand-700" : "bg-partner-100 text-partner-700"}`}>
            <AvatarFallback className={accent === "brand" ? "bg-brand-100 text-brand-700" : "bg-partner-100 text-partner-700"}>
              {name[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground text-sm truncate">{name}</p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Flame className="h-3 w-3 text-orange-500" />
              <span>{streak} day streak</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={accent} className="text-xs">
              {done}/{items.length}
            </Badge>
            {collapsed ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>

        {collapsed ? (
          <div className="px-4 pb-4 space-y-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} variant={accent} size="sm" />
            </div>

            {collapsedTasks.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {collapsedTasks.map((item) => (
                  <span
                    key={item.id}
                    className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                      item.done
                        ? "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {item.icon && <span>{item.icon}</span>}
                    <span>{item.taskName}</span>
                    {item.done && <span>✓</span>}
                  </span>
                ))}
                {hasMore && (
                  <span className="text-xs text-muted-foreground px-2 py-0.5">
                    +{items.length - 3} more
                  </span>
                )}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
              {MEAL_TYPES.map((type) => {
                const meta = MEAL_LABELS[type];
                const status = getMealStatus(type);
                return (
                  <span key={type} className="flex items-center gap-1">
                    <span>{meta.emoji}</span>
                    <span className="text-muted-foreground">{meta.label}</span>
                    <span>{status === "done" ? "✓" : "—"}</span>
                  </span>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="px-4 pb-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="mb-3">
              <Progress value={progress} variant={accent} size="sm" />
            </div>

            <div className="bg-muted/40 rounded-lg p-2 shadow-sm border-b border-black/10 mb-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 px-1">Activities</p>
              {items.length === 0 ? (
                <p className="text-xs text-muted-foreground italic py-2 text-center">No tasks today</p>
              ) : (
                items.map((item) => (
                  <TaskRow key={item.id} item={item} readOnly={readOnly} onToggle={onToggle} />
                ))
              )}
            </div>

            <div className="bg-muted/40 rounded-lg p-2 shadow-sm border-b border-black/10">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 px-1">Meals</p>
              <div className="space-y-2">
                {MEAL_TYPES.map((type) => {
                  const entry = meals.find((m) => m.mealType === type) ?? null;
                  return (
                    <MealRow
                      key={type}
                      mealType={type}
                      entry={entry}
                      readOnly={readOnly}
                      today={today}
                      onAdd={onMealAdd ?? (() => {})}
                      onUpdate={onMealUpdate ?? (() => {})}
                      onDelete={onMealDelete ?? (() => {})}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
