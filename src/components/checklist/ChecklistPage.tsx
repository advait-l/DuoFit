"use client";

import { useState, useCallback } from "react";
import { ChecklistItemDTO } from "@/types";
import { getWeekStart } from "@/lib/dates";
import ChecklistColumn from "@/components/checklist/ChecklistColumn";
import ScheduleModal from "@/components/schedule/ScheduleModal";
import { ChecklistItem } from "@/generated/prisma";
import { Button } from "@/components/ui/Button";
import { ChevronLeft, ChevronRight, Settings } from "lucide-react";

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
    imageUrl: item.imageUrl ?? null,
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

  const handleUpdate = useCallback((updated: ChecklistItemDTO) => {
    setMine((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
  }, []);

  const isCurrentWeek = toISO(weekStart) === toISO(getWeekStart());
  const showRegenerate = hasSchedule && mine.length === 0 && !loading;

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-lg mx-auto px-4 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-foreground">Weekly Checklist</h1>
          <button
            onClick={() => setShowScheduleModal(true)}
            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-full hover:bg-muted"
          >
            <Settings className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Schedule</span>
          </button>
        </div>

        <div className="flex items-center justify-between mb-4 bg-muted/50 rounded-xl p-1">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-background"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-medium text-foreground">{weekLabel(weekStart)}</span>
          <button
            onClick={() => navigate(1)}
            disabled={isCurrentWeek}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-background disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {showRegenerate && (
          <div className="mb-4 p-4 bg-brand-50 border border-brand-200 rounded-xl flex items-center justify-between gap-3">
            <p className="text-sm text-brand-700">No tasks this week. Generate from your schedule?</p>
            <Button
              onClick={handleRegenerate}
              disabled={regenerating}
              variant="brand"
              size="sm"
            >
              {regenerating ? "…" : "Generate"}
            </Button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-8 w-8 border-2 border-brand-500 border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ChecklistColumn
              title="You"
              items={mine}
              readOnly={false}
              accent="brand"
              weekStart={weekStart.toISOString()}
              onAdd={handleAddItem}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
            />
            <ChecklistColumn
              title={partnerName ?? "Partner"}
              items={partner}
              readOnly
              accent="partner"
              weekStart={weekStart.toISOString()}
            />
          </div>
        )}
      </div>

      {showScheduleModal && (
        <ScheduleModal onClose={() => setShowScheduleModal(false)} />
      )}
    </div>
  );
}