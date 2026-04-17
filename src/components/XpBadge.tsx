"use client";

import { useEffect, useState } from "react";
import { getProgress, getLevel } from "@/lib/progress";

export default function XpBadge() {
  const [xp, setXp]       = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const p = getProgress();
    setXp(p.xp);
    setStreak(p.streak);
  }, []);

  const { level, title, progress } = getLevel(xp);

  return (
    <div className="flex items-center gap-3">
      {streak > 0 && (
        <span className="text-sm font-semibold text-orange-500">
          🔥 {streak}
        </span>
      )}
      <div className="flex items-center gap-2">
        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-semibold">
          Lv.{level} {title}
        </span>
        <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs text-gray-500">{xp} XP</span>
      </div>
    </div>
  );
}
