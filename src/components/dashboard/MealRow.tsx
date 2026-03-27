"use client";

import { useState } from "react";
import { MealLog } from "@/generated/prisma";
import { MEAL_CATEGORIES, MealCategory } from "@/types";
import ImageUpload from "@/components/ui/ImageUpload";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/Dropdown";
import { ChevronDown } from "lucide-react";

const MEAL_META: Record<string, { label: string; emoji: string }> = {
  breakfast: { label: "Breakfast", emoji: "🌅" },
  lunch: { label: "Lunch", emoji: "☀️" },
  dinner: { label: "Dinner", emoji: "🌙" },
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
  const [imageUrl, setImageUrl] = useState<string | null>((entry?.imageUrl as string | null) ?? null);
  const [showActions, setShowActions] = useState(false);

  const meta = MEAL_META[mealType] ?? { label: mealType, emoji: "🍴" };
  const catMeta = MEAL_CATEGORIES.find((c) => c.value === entry?.category);

  async function handleSelectCategory(category: MealCategory) {
    try {
      if (entry) {
        const res = await fetch(`/api/meal-log/${entry.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ category }),
        });
        if (res.ok) {
          const updated = await res.json();
          onUpdate(updated);
        }
      } else {
        const res = await fetch("/api/meal-log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mealType, category, logDate: today }),
        });
        if (res.ok) {
          const created = await res.json();
          onAdd(created);
        }
      }
    } catch {}
  }

  async function handleDelete() {
    if (!entry) return;
    await fetch(`/api/meal-log/${entry.id}`, { method: "DELETE" });
    onDelete(entry.id);
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

  const hasEntry = !!entry;

  return (
    <div
      className="rounded-md p-2 mb-2 bg-muted shadow-sm border-t border-white/10 border-b border-black/5"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm w-5 text-center shrink-0">{meta.emoji}</span>
          <span className="text-xs font-medium text-foreground">{meta.label}</span>
          {imageUrl && (
            <div className="shrink-0">
              <ImageUpload imageUrl={imageUrl} onUpload={handleImageUpload} onRemove={handleImageRemove} readOnly inline />
            </div>
          )}
        </div>

        {readOnly ? (
          <span
            className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
              entry
                ? "bg-muted text-muted-foreground"
                : "bg-muted/50 text-muted-foreground/50 italic"
            }`}
          >
            {catMeta ? `${catMeta.emoji} ${catMeta.label}` : "—"}
          </span>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg border bg-background hover:bg-muted transition-colors">
                {catMeta ? (
                  <>
                    <span>{catMeta.emoji}</span>
                    <span>{catMeta.label}</span>
                  </>
                ) : (
                  <span className="italic text-muted-foreground">Not logged</span>
                )}
                <ChevronDown className="h-3 w-3" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {MEAL_CATEGORIES.map((c) => (
                <DropdownMenuItem
                  key={c.value}
                  onClick={() => handleSelectCategory(c.value)}
                  className={entry?.category === c.value ? "bg-muted" : ""}
                >
                  <span>{c.emoji}</span>
                  <span>{c.label}</span>
                  {entry?.category === c.value && <span className="ml-auto text-brand-600">✓</span>}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {!readOnly && hasEntry && (showActions || imageUrl) && (
        <div className="flex items-center gap-2 mt-1 ml-7">
          {!imageUrl && (
            <div className="shrink-0">
              <ImageUpload imageUrl={null} onUpload={handleImageUpload} onRemove={handleImageRemove} inline />
            </div>
          )}
          <button
            onClick={handleDelete}
            className="text-[10px] text-muted-foreground hover:text-destructive transition-colors"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
