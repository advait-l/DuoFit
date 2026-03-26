"use client";

import { useState } from "react";
import { ChecklistItemDTO } from "@/types";

interface Props {
  item: ChecklistItemDTO;
  readOnly: boolean;
  accent: "indigo" | "amber";
  onToggle?: (id: string, done: boolean) => void;
  onDelete?: (id: string) => void;
}

export default function ChecklistItemRow({ item, readOnly, accent, onToggle, onDelete }: Props) {
  const [localDone, setLocalDone] = useState(item.done);
  const [deleting, setDeleting] = useState(false);

  const checkClass = accent === "indigo"
    ? "text-indigo-600 border-indigo-400"
    : "text-amber-600 border-amber-400";

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

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/checklist/${item.id}`, { method: "DELETE" });
      if (res.ok) onDelete?.(item.id);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <li className="flex items-center gap-2 group">
      <button
        onClick={readOnly ? undefined : handleToggle}
        disabled={readOnly}
        className={`w-4 h-4 flex-shrink-0 rounded border-2 flex items-center justify-center transition-colors ${
          readOnly ? "opacity-60 cursor-default" : "cursor-pointer"
        } ${localDone ? checkClass + " bg-current" : "border-gray-300"}`}
        aria-label={localDone ? "Mark incomplete" : "Mark complete"}
      >
        {localDone && (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        )}
      </button>
      <span className={`flex-1 text-sm ${localDone ? "line-through text-gray-400" : "text-gray-700"}`}>
        {item.label}
      </span>
      {!readOnly && (
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all text-xs disabled:opacity-50"
          aria-label="Delete item"
        >
          ✕
        </button>
      )}
    </li>
  );
}
