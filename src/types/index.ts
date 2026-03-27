export interface UserDTO {
  id: string;
  name: string;
  email: string;
  inviteCode: string;
  partnerId: string | null;
}

export interface PartnerDTO {
  id: string;
  name: string;
}

export interface MeResponse {
  me: UserDTO;
  partner: PartnerDTO | null;
}

export interface ChecklistItemDTO {
  id: string;
  label: string;
  done: boolean;
  weekStart: string;
  userId: string;
  createdAt: string;
  imageUrl?: string | null;
}

export interface MealLogDTO {
  id: string;
  mealType: string;
  category: string;
  notes: string | null;
  calories: number | null;
  logDate: string;
  userId: string;
  createdAt: string;
  imageUrl?: string | null;
}

export type MealCategory = "homecooked" | "restaurant" | "takeout" | "fast-food" | "skipped";

export const MEAL_CATEGORIES: { value: MealCategory; label: string; emoji: string }[] = [
  { value: "homecooked", label: "Home cooked", emoji: "🏠" },
  { value: "restaurant", label: "Restaurant", emoji: "🍽️" },
  { value: "takeout", label: "Takeout", emoji: "🥡" },
  { value: "fast-food", label: "Fast food", emoji: "🍔" },
  { value: "skipped", label: "Skipped", emoji: "⏭️" },
];

export interface FitnessScheduleDTO {
  workoutDays: number[]; // 1=Mon … 7=Sun
  runDays: number[];
  dailySteps: number | null;
}

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner", "snack"];
