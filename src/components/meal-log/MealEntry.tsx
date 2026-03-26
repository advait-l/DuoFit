"use client";

import { useState } from "react";
import { MealLogDTO, MEAL_CATEGORIES } from "@/types";

interface Props {
  meal: MealLogDTO;
  readOnly: boolean;
  onDelete?: (id: string) => void;
  onUpdate?: (meal: MealLogDTO) => void;
}

export default function MealEntry({ meal, readOnly, onDelete, onUpdate }: Props) {
  const [editing, setEditing] = useState(false);
  const [category, setCategory] = useState(meal.category);
  const [notes, setNotes] = useState(meal.notes ?? "");
  const [saving, setSaving] = useState(false);

  const catMeta = MEAL_CATEGORIES.find((c) => c.value === meal.category);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/meal-log/${meal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, notes: notes || null }),
      });
      if (res.ok) {
        const updated = await res.json();
        onUpdate?.({ ...meal, category: updated.category, notes: updated.notes });
        setEditing(false);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    const res = await fetch(`/api/meal-log/${meal.id}`, { method: "DELETE" });
    if (res.ok) onDelete?.(meal.id);
  }

  if (editing) {
    return (
      <li className="bg-gray-50 rounded-lg p-2 space-y-2">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full text-xs border border-gray-200 rounded px-2 py-1 outline-none"
        >
          {MEAL_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>
          ))}
        </select>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full text-xs border border-gray-200 rounded px-2 py-1 outline-none"
          placeholder="Notes (optional)"
        />
        <div className="flex gap-1">
          <button onClick={handleSave} disabled={saving} className="flex-1 text-xs bg-indigo-500 text-white rounded py-1 hover:bg-indigo-600 disabled:opacity-50">Save</button>
          <button onClick={() => setEditing(false)} className="flex-1 text-xs border border-gray-200 rounded py-1 hover:bg-gray-100">Cancel</button>
        </div>
      </li>
    );
  }

  return (
    <li className="flex items-start justify-between gap-1 group text-sm">
      <div className="flex-1 min-w-0">
        <p className="text-gray-700 text-xs leading-snug">
          {catMeta ? `${catMeta.emoji} ${catMeta.label}` : meal.category}
        </p>
        {meal.notes && <p className="text-xs text-gray-400 truncate">{meal.notes}</p>}
      </div>
      {!readOnly && (
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button onClick={() => setEditing(true)} className="text-gray-400 hover:text-indigo-500 text-xs">✏️</button>
          <button onClick={handleDelete} className="text-gray-400 hover:text-red-400 text-xs">✕</button>
        </div>
      )}
    </li>
  );
}
