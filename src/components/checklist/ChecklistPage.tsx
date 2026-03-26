"use client";

import { useState, useCallback } from "react";
import { ChecklistItemDTO } from "@/types";
import { getWeekStart } from "@/lib/dates";
import ChecklistColumn from "@/components/checklist/ChecklistColumn";
import ScheduleModal from "@/components/schedule/ScheduleModal";
import { ChecklistItem } from "@/generated/prisma/client";

interface Props {
  initialMine: ChecklistItem[];
  initialPartner: ChecklistItem[];
  partnerName: string | null;
  weekStart: string;
  hasSchedule: boolean;
}

function toISO(date: Date): string {
  return date.toISOString().split("T")[0];
}

function weekLabel(weekStart: Date): string {
  const end = new Date(weekStart);
  end.setUTCDate(weekStart.getUTCDate() + 6);
  const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${fmt(weekStart)} – ${fmt(end)}`;
}

function toDTO(item: ChecklistItem): ChecklistItemDTO {
  return {
    id: item.id,
    label: item.label,
    done: item.done,
    weekStart: item.weekStart.toISOString(),
    userId: item.userId,
    createdAt: item.createdAt.toISOString(),
  };
}

export default function ChecklistPage({ initialMine, initialPartner, partnerName, weekStart: initialWeekStart, hasSchedule }: Props) {
  const [weekStart, setWeekStart] = useState(() => new Date(initialWeekStart));
  const [mine, setMine] = useState<ChecklistItemDTO[]>(initialMine.map(toDTO));
  const [partner, setPartner] = useState<ChecklistItemDTO[]>(initialPartner.map(toDTO));
  const [loading, setLoading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  async function fetchWeek(ws: Date) {
    setLoading(true);
    try {
      const res = await fetch(`/api/checklist?weekStart=${ws.toISOString()}`);
      if (res.ok) {
        const data = await res.json();
        setMine(data.mine);
        setPartner(data.partner);
      }
    } finally {
      setLoading(false);
    }
  }

  function navigate(direction: -1 | 1) {
    const next = new Date(weekStart);
    next.setUTCDate(weekStart.getUTCDate() + direction * 7);
    setWeekStart(next);
    fetchWeek(next);
  }

  async function handleRegenerate() {
    setRegenerating(true);
    try {
      const res = await fetch("/api/schedule/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weekStart: weekStart.toISOString() }),
      });
      if (res.ok) {
        const data = await res.json();
        setMine(data.items);
      }
    } finally {
      setRegenerating(false);
    }
  }

  const handleAddItem = useCallback((item: ChecklistItemDTO) => {
    setMine((prev) => [...prev, item]);
  }, []);

  const handleToggle = useCallback((id: string, done: boolean) => {
    setMine((prev) => prev.map((i) => (i.id === id ? { ...i, done } : i)));
  }, []);

  const handleDelete = useCallback((id: string) => {
    setMine((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const isCurrentWeek = toISO(weekStart) === toISO(getWeekStart());
  const showRegenerate = hasSchedule && mine.length === 0 && !loading;

  return (
    <div className="max-w-lg mx-auto px-4 pt-8 pb-4">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold text-gray-900">Weekly Checklist</h1>
        <button
          onClick={() => setShowScheduleModal(true)}
          className="text-xs text-indigo-500 hover:text-indigo-700 font-medium px-2 py-1 rounded-lg hover:bg-indigo-50 transition-colors"
        >
          {hasSchedule ? "✏️ Schedule" : "＋ Schedule"}
        </button>
      </div>

      {/* Week navigation */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600 p-1">
          ← Prev
        </button>
        <span className="text-sm font-medium text-gray-600">{weekLabel(weekStart)}</span>
        <button
          onClick={() => navigate(1)}
          disabled={isCurrentWeek}
          className="text-gray-400 hover:text-gray-600 p-1 disabled:opacity-30"
        >
          Next →
        </button>
      </div>

      {showRegenerate && (
        <div className="mb-4 p-3 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-between gap-3">
          <p className="text-xs text-indigo-700">No tasks this week. Regenerate from your schedule?</p>
          <button
            onClick={handleRegenerate}
            disabled={regenerating}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 whitespace-nowrap disabled:opacity-50"
          >
            {regenerating ? "…" : "Regenerate"}
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-10 text-gray-400">Loading…</div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <ChecklistColumn
            title="You"
            items={mine}
            readOnly={false}
            accent="indigo"
            weekStart={weekStart.toISOString()}
            onAdd={handleAddItem}
            onToggle={handleToggle}
            onDelete={handleDelete}
          />
          <ChecklistColumn
            title={partnerName ?? "Partner"}
            items={partner}
            readOnly
            accent="amber"
            weekStart={weekStart.toISOString()}
          />
        </div>
      )}

      {showScheduleModal && (
        <ScheduleModal onClose={() => setShowScheduleModal(false)} />
      )}
    </div>
  );
}
