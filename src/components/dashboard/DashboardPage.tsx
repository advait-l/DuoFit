"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { useUser } from "@/components/providers/UserContext";
import { ChecklistItem, MealLog } from "@/generated/prisma/client";
import PairPartnerModal from "@/components/dashboard/PairPartnerModal";
import ScheduleModal from "@/components/schedule/ScheduleModal";
import MealRow from "@/components/dashboard/MealRow";

const MEAL_TYPES = ["breakfast", "lunch", "dinner"] as const;

interface TaskItem {
  id: string;
  label: string;
  done: boolean;
}

interface UserStats {
  name: string;
  checklist: ChecklistItem[];
  meals: MealLog[];
  streak: number;
}

interface Props {
  me: UserStats;
  partner: UserStats | null;
  hasSchedule: boolean;
  today: string;
}

function TaskRow({ item, readOnly, onToggle }: {
  item: TaskItem;
  readOnly: boolean;
  onToggle?: (id: string, done: boolean) => void;
}) {
  const [localDone, setLocalDone] = useState(item.done);

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
    <li className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
      <button
        onClick={readOnly ? undefined : handleToggle}
        disabled={readOnly}
        className={`w-5 h-5 flex-shrink-0 rounded-full border-2 flex items-center justify-center transition-colors ${
          readOnly ? "cursor-default opacity-60" : "cursor-pointer"
        } ${localDone ? "bg-indigo-500 border-indigo-500" : "border-gray-300 hover:border-indigo-400"}`}
      >
        {localDone && (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
      <span className={`text-sm flex-1 ${localDone ? "line-through text-gray-400" : "text-gray-700"}`}>
        {item.label}
      </span>
    </li>
  );
}

function UserColumn({
  name,
  items,
  meals,
  streak,
  readOnly,
  accent,
  today,
  onToggle,
  onMealAdd,
  onMealUpdate,
  onMealDelete,
}: {
  name: string;
  items: TaskItem[];
  meals: MealLog[];
  streak: number;
  readOnly: boolean;
  accent: "indigo" | "amber";
  today: string;
  onToggle?: (id: string, done: boolean) => void;
  onMealAdd?: (meal: MealLog) => void;
  onMealUpdate?: (meal: MealLog) => void;
  onMealDelete?: (id: string) => void;
}) {
  const done = items.filter((i) => i.done).length;
  const accentBar = accent === "indigo" ? "bg-indigo-500" : "bg-amber-500";
  const accentBorder = accent === "indigo" ? "border-indigo-200" : "border-amber-200";
  const accentAvatar = accent === "indigo" ? "bg-indigo-500" : "bg-amber-500";

  return (
    <Card className={`flex-1 flex flex-col ${accentBorder}`} padding={false}>
      <div className={`h-1 rounded-t-2xl ${accentBar}`} />
      <div className="p-4 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${accentAvatar}`}>
            {name[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-800 text-sm truncate">{name}</p>
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <span>🔥 {streak}d</span>
            </p>
          </div>
        </div>

        {/* Tasks */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
            Tasks · {done}/{items.length}
          </p>
          {items.length === 0 ? (
            <p className="text-xs text-gray-300 italic py-1">No tasks today</p>
          ) : (
            <ul>
              {items.map((item) => (
                <TaskRow key={item.id} item={item} readOnly={readOnly} onToggle={onToggle} />
              ))}
            </ul>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100" />

        {/* Meals */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Meals</p>
          <div className="divide-y divide-gray-50">
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
    </Card>
  );
}

export default function DashboardPage({ me, partner, hasSchedule, today }: Props) {
  const { me: userInfo } = useUser();
  const [myItems, setMyItems] = useState<TaskItem[]>(
    me.checklist.map((i) => ({ id: i.id, label: i.label, done: i.done }))
  );
  const [myMeals, setMyMeals] = useState<MealLog[]>(me.meals);
  const [showPairModal, setShowPairModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const todayLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "short", day: "numeric",
  });

  function handleToggle(id: string, done: boolean) {
    setMyItems((prev) => prev.map((i) => (i.id === id ? { ...i, done } : i)));
  }

  function handleMealAdd(meal: MealLog) {
    setMyMeals((prev) => [...prev.filter((m) => m.mealType !== meal.mealType), meal]);
  }
  function handleMealUpdate(meal: MealLog) {
    setMyMeals((prev) => prev.map((m) => (m.id === meal.id ? meal : m)));
  }
  function handleMealDelete(id: string) {
    setMyMeals((prev) => prev.filter((m) => m.id !== id));
  }

  const partnerItems: TaskItem[] = (partner?.checklist ?? []).map((i) => ({
    id: i.id, label: i.label, done: i.done,
  }));

  return (
    <div className="max-w-lg mx-auto px-4 pt-8 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Today</h1>
          <p className="text-sm text-gray-500">{todayLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowScheduleModal(true)}
            className="text-xs text-indigo-500 hover:text-indigo-700 font-medium px-2 py-1 rounded-lg hover:bg-indigo-50 transition-colors"
          >
            {hasSchedule ? "✏️ Schedule" : "＋ Schedule"}
          </button>
          <LogoutButton />
        </div>
      </div>

      {/* Couple streak pill */}
      {partner && (
        <div className="flex items-center gap-1.5 mb-4 text-xs text-gray-500">
          <span>💑</span>
          <span>Couple streak:</span>
          <span className="font-semibold text-gray-700">{Math.min(me.streak, partner.streak)} days</span>
        </div>
      )}

      {/* Columns */}
      <div className="flex gap-3 mb-4">
        <UserColumn
          name={me.name}
          items={myItems}
          meals={myMeals}
          streak={me.streak}
          readOnly={false}
          accent="indigo"
          today={today}
          onToggle={handleToggle}
          onMealAdd={handleMealAdd}
          onMealUpdate={handleMealUpdate}
          onMealDelete={handleMealDelete}
        />
        {partner ? (
          <UserColumn
            name={partner.name}
            items={partnerItems}
            meals={partner.meals}
            streak={partner.streak}
            readOnly
            accent="amber"
            today={today}
          />
        ) : (
          <Card className="flex-1 border-dashed border-gray-200 flex flex-col items-center justify-center text-center py-8 gap-3">
            <p className="text-3xl">👫</p>
            <p className="text-xs font-medium text-gray-600">No partner yet</p>
            <div className="flex flex-col gap-1.5 items-center w-full px-2">
              <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg px-2 py-1.5 text-xs w-full justify-center">
                <span className="text-gray-400">Code:</span>
                <span className="font-mono font-bold text-indigo-600">{userInfo.inviteCode}</span>
                <button onClick={() => navigator.clipboard.writeText(userInfo.inviteCode)} className="text-gray-400 hover:text-gray-600">📋</button>
              </div>
              <Button onClick={() => setShowPairModal(true)} variant="secondary" size="sm" className="w-full text-xs">
                Enter code
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Schedule setup */}
      {!hasSchedule && (
        <Card>
          <div className="flex items-start gap-3">
            <span className="text-xl">🗓️</span>
            <div className="flex-1">
              <p className="font-semibold text-gray-800 text-sm">Set up your fitness schedule</p>
              <p className="text-xs text-gray-500 mt-0.5 mb-3">
                Set your workout days, run days, and steps goal — we&apos;ll auto-fill your checklist.
              </p>
              <Button size="sm" onClick={() => setShowScheduleModal(true)}>Set up schedule</Button>
            </div>
          </div>
        </Card>
      )}

      {showPairModal && <PairPartnerModal onClose={() => setShowPairModal(false)} />}
      {showScheduleModal && <ScheduleModal onClose={() => setShowScheduleModal(false)} />}
    </div>
  );
}

function LogoutButton() {
  const { me } = useUser();
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
        {me.name[0]?.toUpperCase()}
      </div>
      <button
        onClick={async () => {
          await fetch("/api/auth/logout", { method: "POST" });
          window.location.href = "/login";
        }}
        className="text-xs text-gray-400 hover:text-gray-600"
      >
        Sign out
      </button>
    </div>
  );
}
