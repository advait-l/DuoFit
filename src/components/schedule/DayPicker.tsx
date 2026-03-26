"use client";

const DAYS = [
  { num: 1, label: "M" },
  { num: 2, label: "T" },
  { num: 3, label: "W" },
  { num: 4, label: "T" },
  { num: 5, label: "F" },
  { num: 6, label: "S" },
  { num: 7, label: "S" },
];

const FULL_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface Props {
  selected: number[];
  onChange: (days: number[]) => void;
}

export default function DayPicker({ selected, onChange }: Props) {
  function toggle(num: number) {
    if (selected.includes(num)) {
      onChange(selected.filter((d) => d !== num));
    } else {
      onChange([...selected, num].sort((a, b) => a - b));
    }
  }

  return (
    <div className="space-y-1">
      <div className="flex gap-1.5">
        {DAYS.map(({ num, label }, i) => {
          const active = selected.includes(num);
          return (
            <button
              key={num}
              type="button"
              onClick={() => toggle(num)}
              title={FULL_NAMES[i]}
              className={`w-8 h-8 rounded-full text-xs font-semibold transition-colors ${
                active
                  ? "bg-indigo-500 text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
      {selected.length > 0 && (
        <p className="text-xs text-gray-400">
          {selected.map((n) => FULL_NAMES[n - 1]).join(", ")}
        </p>
      )}
    </div>
  );
}
