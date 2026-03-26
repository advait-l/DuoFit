"use client";

import { useState } from "react";
import { MealLog } from "@/generated/prisma/client";
import { MEAL_CATEGORIES, MealCategory } from "@/types";

const MEAL_META: Record<string, { label: string; emoji: string }> = {
  breakfast: { label: "Breakfast", emoji: "🌅" },
  lunch: { label: "Lunch", emoji: "☀️" },
  dinner: { label: "Dinner", emoji: "🌙" },
};

const CATEGORY_COLORS: Record<string, string> = {
  homecooked: "bg-green-100 text-green-700",
  restaurant: "bg-blue-100 text-blue-700",
  takeout: "bg-purple-100 text-purple-700",
  "fast-food": "bg-orange-100 text-orange-700",
  skipped: "bg-gray-100 text-gray-400",
  "": "bg-gray-100 text-gray-400",
};

interface Props {
  mealType: string;
  entry: MealLog | null;
  readOnly: boolean;
  today: string;
  onAdd: (meal: MealLog) => void;
  onUpdate: (meal: MealLog) => void;
  onDelete: (id: string) => void;
}

export default function MealRow({ mealType, entry, readOnly, today, onAdd, onUpdate, onDelete }: Props) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<MealCategory | "">((entry?.category as MealCategory) ?? "");
  const [notes, setNotes] = useState(entry?.notes ?? "");
  const [saving, setSaving] = useState(false);

  const meta = MEAL_META[mealType] ?? { label: mealType, emoji: "🍴" };
  const catMeta = MEAL_CATEGORIES.find((c) => c.value === (entry?.category || category));

  async function handleSave() {
    if (!category) return;
    setSaving(true);
    try {
      if (entry) {
        const res = await fetch(`/api/meal-log/${entry.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ category, notes: notes || null }),
        });
        if (res.ok) {
          const updated = await res.json();
          onUpdate(updated);
          setOpen(false);
        }
      } else {
        const res = await fetch("/api/meal-log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mealType, category, notes: notes || null, logDate: today }),
        });
        if (res.ok) {
          const created = await res.json();
          onAdd(created);
          setOpen(false);
        }
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!entry) return;
    const res = await fetch(`/api/meal-log/${entry.id}`, { method: "DELETE" });
    if (res.ok) {
      onDelete(entry.id);
      setCategory("");
      setNotes("");
    }
  }

  // Read-only view
  if (readOnly) {
    return (
      <div className="flex items-center gap-2 py-1.5">
        <span className="text-sm w-5 text-center">{meta.emoji}</span>
        <span className="text-xs text-gray-500 w-14 shrink-0">{meta.label}</span>
        {entry ? (
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[entry.category]}`}>
            {catMeta?.emoji} {catMeta?.label ?? entry.category}
          </span>
        ) : (
          <span className="text-xs text-gray-300 italic">—</span>
        )}
      </div>
    );
  }

  // Logged state — show badge + edit/delete
  if (entry && !open) {
    return (
      <div className="flex items-center gap-2 py-1.5 group">
        <span className="text-sm w-5 text-center">{meta.emoji}</span>
        <span className="text-xs text-gray-500 w-14 shrink-0">{meta.label}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-1 ${CATEGORY_COLORS[entry.category]}`}>
          {catMeta?.emoji} {catMeta?.label ?? entry.category}
        </span>
        {entry.notes && (
          <span className="text-xs text-gray-400 truncate max-w-[60px]" title={entry.notes}>
            {entry.notes}
          </span>
        )}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button onClick={() => { setCategory(entry.category as MealCategory); setNotes(entry.notes ?? ""); setOpen(true); }} className="text-gray-300 hover:text-indigo-400 text-xs">✏️</button>
          <button onClick={handleDelete} className="text-gray-300 hover:text-red-400 text-xs">✕</button>
        </div>
      </div>
    );
  }

  // Inline form — log or edit
  if (open || !entry) {
    return (
      <div className="py-1.5">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-sm w-5 text-center">{meta.emoji}</span>
          <span className="text-xs font-medium text-gray-600">{meta.label}</span>
          {open && (
            <button onClick={() => setOpen(false)} className="ml-auto text-gray-300 hover:text-gray-500 text-xs">✕</button>
          )}
        </div>
        <div className="ml-7 space-y-1.5">
          {/* Category buttons */}
          <div className="flex flex-wrap gap-1">
            {MEAL_CATEGORIES.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setCategory(c.value)}
                className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                  category === c.value
                    ? "border-indigo-400 bg-indigo-50 text-indigo-700 font-medium"
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                {c.emoji} {c.label}
              </button>
            ))}
          </div>
          {/* Notes input */}
          <input
            type="text"
            placeholder="Add a note… (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100"
          />
          {/* Save */}
          <button
            onClick={handleSave}
            disabled={!category || saving}
            className="text-xs bg-indigo-500 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-indigo-600 disabled:opacity-40 transition-colors"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    );
  }

  return null;
}
