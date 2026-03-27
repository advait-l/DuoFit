"use client";

import { useState, useRef } from "react";
import { ChecklistItemDTO } from "@/types";
import ImageUpload from "@/components/ui/ImageUpload";

interface Props {
  item: ChecklistItemDTO;
  readOnly: boolean;
  accent: "brand" | "partner";
  onToggle?: (id: string, done: boolean) => void;
  onDelete?: (id: string) => void;
  onUpdate?: (item: ChecklistItemDTO) => void;
}

export default function ChecklistItemRow({ item, readOnly, accent, onToggle, onDelete, onUpdate }: Props) {
  const [localDone, setLocalDone] = useState(item.done);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(item.label);
  const [imageUrl, setImageUrl] = useState<string | null>(item.imageUrl ?? null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  function startEdit() {
    setEditLabel(item.label);
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  }

  async function commitEdit() {
    const trimmed = editLabel.trim();
    if (!trimmed || trimmed === item.label) {
      setEditing(false);
      setEditLabel(item.label);
      return;
    }
    const res = await fetch(`/api/checklist/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: trimmed }),
    });
    if (res.ok) {
      const updated = await res.json();
      onUpdate?.({ ...item, label: updated.label });
    }
    setEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") commitEdit();
    if (e.key === "Escape") {
      setEditing(false);
      setEditLabel(item.label);
    }
  }

  async function handleImageUpload(url: string) {
    setImageUrl(url);
    await fetch(`/api/checklist/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl: url }),
    });
    onUpdate?.({ ...item, imageUrl: url });
  }

  async function handleImageRemove() {
    setImageUrl(null);
    await fetch(`/api/checklist/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl: null }),
    });
    onUpdate?.({ ...item, imageUrl: null });
  }

  const doneClass = accent === "brand"
    ? "bg-brand-500 border-brand-500"
    : "bg-partner-500 border-partner-500";

  return (
    <div className="py-2 px-2 -mx-2 rounded-lg group hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-3">
        <button
          onClick={readOnly ? undefined : handleToggle}
          disabled={readOnly}
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
            readOnly ? "opacity-60 cursor-default" : "cursor-pointer active:scale-95"
          } ${localDone ? doneClass : "border-muted-foreground/30 hover:border-brand-400"}`}
          aria-label={localDone ? "Mark incomplete" : "Mark complete"}
        >
          {localDone && (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="text-white">
              <path d="M2 5l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        {editing ? (
          <input
            ref={inputRef}
            value={editLabel}
            onChange={(e) => setEditLabel(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={handleKeyDown}
            className="flex-1 text-sm border-b border-brand-400 outline-none bg-transparent py-0.5"
            autoFocus
          />
        ) : (
          <span className={`flex-1 text-sm ${localDone ? "line-through text-muted-foreground" : "text-foreground"}`}>
            {item.label}
          </span>
        )}

        {!readOnly && !editing && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
            <button
              onClick={startEdit}
              className="text-muted-foreground hover:text-foreground text-xs transition-colors"
              aria-label="Edit label"
            >
              ✏️
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-muted-foreground hover:text-destructive text-xs transition-colors disabled:opacity-50"
              aria-label="Delete item"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      <div className="ml-8">
        <ImageUpload
          imageUrl={imageUrl}
          onUpload={handleImageUpload}
          onRemove={handleImageRemove}
          readOnly={readOnly}
        />
      </div>
    </div>
  );
}