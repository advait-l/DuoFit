"use client";

import { useState } from "react";
import { MealLogDTO, MEAL_TYPES, MealType } from "@/types";
import MealEntry from "@/components/meal-log/MealEntry";
import AddMealForm from "@/components/meal-log/AddMealForm";
import EmptyState from "@/components/ui/EmptyState";

interface Props {
  title: string;
  meals: MealLogDTO[];
  readOnly: boolean;
  accent: "indigo" | "amber";
  date: string;
  onAdd?: (meal: MealLogDTO) => void;
  onDelete?: (id: string) => void;
  onUpdate?: (meal: MealLogDTO) => void;
}

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: "🌅 Breakfast",
  lunch: "☀️ Lunch",
  dinner: "🌙 Dinner",
  snack: "🍎 Snack",
};

export default function MealColumn({ title, meals, readOnly, accent, date, onAdd, onDelete, onUpdate }: Props) {
  const [showForm, setShowForm] = useState(false);
  const accentClass = accent === "indigo" ? "bg-indigo-500" : "bg-amber-500";
  const badgeClass = accent === "indigo" ? "bg-indigo-50 text-indigo-700" : "bg-amber-50 text-amber-700";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className={`h-1 ${accentClass}`} />
      <div className="p-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-800 text-sm">{title}</h2>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeClass}`}>
            {meals.length} logged
          </span>
        </div>

        {meals.length === 0 && readOnly ? (
          <EmptyState icon="🍽️" title="Nothing yet" />
        ) : (
          <div className="space-y-3 mb-3">
            {MEAL_TYPES.map((type) => {
              const group = meals.filter((m) => m.mealType === type);
              if (group.length === 0) return null;
              return (
                <div key={type}>
                  <p className="text-xs font-medium text-gray-400 mb-1">{MEAL_LABELS[type]}</p>
                  <ul className="space-y-1">
                    {group.map((meal) => (
                      <MealEntry
                        key={meal.id}
                        meal={meal}
                        readOnly={readOnly}
                        onDelete={onDelete}
                        onUpdate={onUpdate}
                      />
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}

        {!readOnly && (
          <>
            {showForm ? (
              <AddMealForm
                date={date}
                onAdd={(meal) => {
                  onAdd?.(meal);
                  setShowForm(false);
                }}
                onCancel={() => setShowForm(false)}
              />
            ) : (
              <button
                onClick={() => setShowForm(true)}
                className="w-full text-xs text-indigo-600 hover:text-indigo-700 font-medium py-1.5 border border-dashed border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                + Log a meal
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
