import type { NutrientLevel } from "@/lib/types";

const COLOR_CLASS: Record<string, string> = {
  blue: "bg-c-blue",
  amber: "bg-c-amber",
  coral: "bg-c-coral",
  red: "bg-c-red",
  green: "bg-c-green",
};

type Props = {
  label: string;
  emoji: string;
  level: NutrientLevel;
  color: "blue" | "amber" | "coral" | "red" | "green";
  valueText: string;
  tilt?: boolean;
};

export default function NutrientPictogram({
  label,
  emoji,
  level,
  color,
  valueText,
  tilt = false,
}: Props) {
  const filledClass = COLOR_CLASS[color];

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-1">
        {[1, 2, 3].map((slot) => {
          const filled = slot <= level;
          const rotation = tilt && filled ? `rotate(${slot * 8}deg)` : undefined;
          return (
            <span
              key={slot}
              style={rotation ? { transform: rotation } : undefined}
              className={`flex h-11 w-11 items-center justify-center rounded-full text-2xl transition ${
                filled ? filledClass : "bg-gray-200"
              }`}
            >
              <span className={filled ? "" : "opacity-30 grayscale"}>{emoji}</span>
            </span>
          );
        })}
      </div>
      <span className="text-base font-bold text-gray-500">{label}</span>
      <span className="text-sm text-gray-400">{valueText}</span>
    </div>
  );
}
