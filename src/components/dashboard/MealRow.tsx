"use client";

import { useState } from "react";
import { MealLog } from "@/generated/prisma";
import { MEAL_CATEGORIES, MealCategory } from "@/types";
import { Badge } from "@/components/ui/Badge";
import ImageUpload from "@/components/ui/ImageUpload";

const MEAL_META: Record<string, { label: string; emoji: string }> = {
  breakfast: { label: "Breakfast", emoji: "🌅" },
  lunch: { label: "Lunch", emoji: "☀️" },
  dinner: { label: "Dinner", emoji: "🌙" },
};

const CATEGORY_VARIANTS: Record<string, "success" | "brand" | "partner" | "warning" | "secondary"> = {
  homecooked: "success",
  restaurant: "brand",
  takeout: "partner",
  "fast-food": "warning",
  skipped: "secondary",
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
  const [imageUrl, setImageUrl] = useState<string | null>((entry?.imageUrl as string | null) ?? null);

  const meta = MEAL_META[mealType] ?? { label: mealType, emoji: "🍴" };
  const catMeta = MEAL_CATEGORIES.find((c) => c.value === (entry?.category || category));

  async function handleSave(selectedCategory: MealCategory) {
    setSaving(true);
    setCategory(selectedCategory);
    try {
      if (entry) {
        const res = await fetch(`/api/meal-log/${entry.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ category: selectedCategory, notes: notes || null }),
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
          body: JSON.stringify({ mealType, category: selectedCategory, notes: notes || null, logDate: today }),
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
      setImageUrl(null);
    }
  }

  async function handleImageUpload(url: string) {
    if (!entry) return;
    setImageUrl(url);
    const res = await fetch(`/api/meal-log/${entry.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl: url }),
    });
    if (res.ok) onUpdate(await res.json());
  }

  async function handleImageRemove() {
    if (!entry) return;
    setImageUrl(null);
    const res = await fetch(`/api/meal-log/${entry.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl: null }),
    });
    if (res.ok) onUpdate(await res.json());
  }

  if (readOnly) {
    return (
      <div className="py-1.5">
        <div className="flex items-center gap-2">
          <span className="text-sm w-5 text-center">{meta.emoji}</span>
          <span className="text-xs text-muted-foreground w-14 shrink-0">{meta.label}</span>
          {entry ? (
            <Badge variant={CATEGORY_VARIANTS[entry.category] || "secondary"} className="text-xs">
              {catMeta?.emoji} {catMeta?.label ?? entry.category}
            </Badge>
          ) : (
            <span className="text-xs text-muted-foreground/50 italic">—</span>
          )}
        </div>
        {entry && (
          <div className="ml-7">
            <ImageUpload imageUrl={imageUrl} onUpload={() => {}} onRemove={() => {}} readOnly />
          </div>
        )}
      </div>
    );
  }

  if (entry && !open) {
    return (
      <div className="py-1.5 group">
        <div className="flex items-center gap-2">
          <span className="text-sm w-5 text-center">{meta.emoji}</span>
          <span className="text-xs text-muted-foreground w-14 shrink-0">{meta.label}</span>
          <Badge variant={CATEGORY_VARIANTS[entry.category] || "secondary"} className="text-xs flex-1">
            {catMeta?.emoji} {catMeta?.label ?? entry.category}
          </Badge>
          {entry.notes && (
            <span className="text-xs text-muted-foreground truncate max-w-[60px]" title={entry.notes}>
              {entry.notes}
            </span>
          )}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button
              onClick={() => { setCategory(entry.category as MealCategory); setNotes(entry.notes ?? ""); setOpen(true); }}
              className="text-muted-foreground hover:text-foreground text-xs transition-colors"
            >
              ✏️
            </button>
            <button
              onClick={handleDelete}
              className="text-muted-foreground hover:text-destructive text-xs transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
        <div className="ml-7">
          <ImageUpload imageUrl={imageUrl} onUpload={handleImageUpload} onRemove={handleImageRemove} />
        </div>
      </div>
    );
  }

  if (open || !entry) {
    return (
      <div className="py-1.5">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-sm w-5 text-center">{meta.emoji}</span>
          <span className="text-xs font-medium text-foreground">{meta.label}</span>
          {open && (
            <button onClick={() => setOpen(false)} className="ml-auto text-muted-foreground hover:text-foreground text-xs transition-colors">
              ✕
            </button>
          )}
        </div>
        <div className="ml-7 space-y-2">
          <input
            type="text"
            placeholder="Add a note… (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full text-xs border border-input bg-background rounded-lg px-2.5 py-1.5 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all duration-200"
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
        </div>
      </div>
    );
  }

  return null;
}