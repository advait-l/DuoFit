import { FitnessScheduleDTO } from "@/types";

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function generateLabelsForWeek(schedule: FitnessScheduleDTO): string[] {
  const labels: string[] = [];

  for (let i = 0; i < 7; i++) {
    const dayNum = i + 1; // 1=Mon … 7=Sun
    const dayLabel = DAY_NAMES[i];

    if (schedule.workoutDays.includes(dayNum)) {
      labels.push(`${dayLabel} – Workout 💪`);
    }
    if (schedule.runDays.includes(dayNum)) {
      labels.push(`${dayLabel} – Run 🏃`);
    }
    if (schedule.dailySteps) {
      labels.push(`${dayLabel} – ${schedule.dailySteps.toLocaleString()} steps 👟`);
    }
  }

  return labels;
}

export function parseDays(str: string): number[] {
  if (!str) return [];
  return str.split(",").map(Number).filter((n) => n >= 1 && n <= 7);
}

export function serializeDays(days: number[]): string {
  return days.join(",");
}
