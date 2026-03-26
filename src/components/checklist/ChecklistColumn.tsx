"use client";

import { useState } from "react";
import { ChecklistItemDTO } from "@/types";
import ChecklistItemRow from "@/components/checklist/ChecklistItemRow";
import AddItemForm from "@/components/checklist/AddItemForm";
import EmptyState from "@/components/ui/EmptyState";

interface Props {
  title: string;
  items: ChecklistItemDTO[];
  readOnly: boolean;
  accent: "indigo" | "amber";
  weekStart: string;
  onAdd?: (item: ChecklistItemDTO) => void;
  onToggle?: (id: string, done: boolean) => void;
  onDelete?: (id: string) => void;
}

export default function ChecklistColumn({ title, items, readOnly, accent, weekStart, onAdd, onToggle, onDelete }: Props) {
  const done = items.filter((i) => i.done).length;
  const accentClass = accent === "indigo" ? "bg-indigo-500" : "bg-amber-500";
  const badgeClass = accent === "indigo" ? "bg-indigo-50 text-indigo-700" : "bg-amber-50 text-amber-700";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className={`h-1 ${accentClass}`} />
      <div className="p-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-800 text-sm">{title}</h2>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeClass}`}>
            {done}/{items.length}
          </span>
        </div>

        {readOnly && items.length === 0 ? (
          <EmptyState icon="👀" title="Nothing yet" />
        ) : (
          <ul className="space-y-1.5 mb-3">
            {items.map((item) => (
              <ChecklistItemRow
                key={item.id}
                item={item}
                readOnly={readOnly}
                accent={accent}
                onToggle={onToggle}
                onDelete={onDelete}
              />
            ))}
          </ul>
        )}

        {!readOnly && (
          <AddItemForm weekStart={weekStart} onAdd={onAdd!} />
        )}
      </div>
    </div>
  );
}
