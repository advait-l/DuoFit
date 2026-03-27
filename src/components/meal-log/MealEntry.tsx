"use client";

import { useState } from "react";
import { MealLogDTO, MEAL_CATEGORIES } from "@/types";
import { Badge } from "@/components/ui/Badge";

interface Props {
  meal: MealLogDTO;
  readOnly: boolean;
  onDelete?: (id: string) => void;
  onUpdate?: (meal: MealLogDTO) => void;
}

const CATEGORY_VARIANTS: Record<string, "success" | "brand" | "partner" | "warning" | "secondary"> = {
  homecooked: "success",
  restaurant: "brand",
  takeout: "partner",
  "fast-food": "warning",
  skipped: "secondary",
};

export default function MealEntry({ meal, readOnly, onDelete, onUpdate }: Props) {
  const [editing, setEditing] = useState(false);
  const [category, setCategory] = useState(meal.category);
  const [notes, setNotes] = useState(meal.notes ?? "");
  const [saving, setSaving] = useState(false);

  const catMeta = MEAL_CATEGORIES.find((c) => c.value === meal.category);

  async function handleSave(selectedCategory: string) {
    setSaving(true);
    setCategory(selectedCategory);
    try {
      const res = await fetch(`/api/meal-log/${meal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: selectedCategory, notes: notes || null }),
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
      <div className="bg-muted/50 rounded-lg p-2.5 space-y-2">
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full text-xs border border-input bg-background rounded-lg px-2.5 py-1.5 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          placeholder="Notes (optional)"
        />
        <div className="flex flex-wrap gap-1">
          {MEAL_CATEGORIES.map((c) => (
            <button
              key={c.value}
              type="button"
              disabled={saving}
              onClick={() => handleSave(c.value)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-all duration-200 disabled:opacity-50 ${
                category === c.value
                  ? "border-brand-400 bg-brand-50 text-brand-700 font-medium shadow-sm"
                  : "border-border text-muted-foreground hover:border-brand-300 hover:bg-muted"
              }`}
            >
              {saving && category === c.value ? "…" : `${c.emoji} ${c.label}`}
            </button>
          ))}
        </div>
        <button
          onClick={() => setEditing(false)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-start justify-between gap-2 group py-1 rounded transition-colors">
      <div className="flex-1 min-w-0">
        <Badge variant={CATEGORY_VARIANTS[meal.category] || "secondary"} className="text-xs">
          {catMeta ? `${catMeta.emoji} ${catMeta.label}` : meal.category}
        </Badge>
        {meal.notes && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{meal.notes}</p>
        )}
      </div>
      {!readOnly && (
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => setEditing(true)} 
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button 
            onClick={handleDelete} 
            className="text-muted-foreground hover:text-destructive transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}