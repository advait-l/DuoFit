"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import DayPicker from "@/components/schedule/DayPicker";
import Button from "@/components/ui/Button";

interface Props {
  onClose: () => void;
}

export default function ScheduleModal({ onClose }: Props) {
  const router = useRouter();
  const [workoutDays, setWorkoutDays] = useState<number[]>([]);
  const [runDays, setRunDays] = useState<number[]>([]);
  const [dailySteps, setDailySteps] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/schedule")
      .then((r) => r.json())
      .then((data) => {
        if (data) {
          setWorkoutDays(data.workoutDays ?? []);
          setRunDays(data.runDays ?? []);
          setDailySteps(data.dailySteps ? String(data.dailySteps) : "");
        }
      })
      .finally(() => setFetching(false));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/schedule", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workoutDays,
          runDays,
          dailySteps: dailySteps ? Number(dailySteps) : null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to save schedule");
        return;
      }
      onClose();
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-0 sm:px-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-sm max-h-[90dvh] overflow-y-auto">
        <div className="p-5">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-semibold text-gray-800">Fitness Schedule</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
          </div>
          <p className="text-sm text-gray-500 mb-5">
            Set your weekly schedule and we&apos;ll auto-fill your checklist every week.
          </p>

          {fetching ? (
            <div className="text-center py-8 text-gray-400 text-sm">Loading…</div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">💪</span>
                  <label className="text-sm font-medium text-gray-700">Workout days</label>
                </div>
                <DayPicker selected={workoutDays} onChange={setWorkoutDays} />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🏃</span>
                  <label className="text-sm font-medium text-gray-700">Run days</label>
                </div>
                <DayPicker selected={runDays} onChange={setRunDays} />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">👟</span>
                  <label htmlFor="steps" className="text-sm font-medium text-gray-700">Daily steps goal</label>
                </div>
                <input
                  id="steps"
                  type="number"
                  placeholder="e.g. 10000"
                  value={dailySteps}
                  onChange={(e) => setDailySteps(e.target.value)}
                  min="0"
                  step="500"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
                <p className="text-xs text-gray-400 mt-1">Leave blank to skip steps tracking</p>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <div className="flex gap-3 pt-1">
                <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? "Saving…" : "Save schedule"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
