"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getProgress } from "@/lib/progress";

interface Props {
  lesson: {
    _id: string;
    title: string;
    topic: string;
    level: string;
    summaryContent: string;
  };
}

export default function LessonCard({ lesson }: Props) {
  const router = useRouter();
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const p = getProgress();
    const t = p.topics[lesson.topic];
    if (t) {
      setAccuracy(t.accuracy);
      setCompleted(t.completed);
    }
  }, [lesson.topic]);

  return (
    <div className={`bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition flex flex-col relative ${completed ? "border-l-4 border-green-500" : ""}`}>
      {completed && (
        <span className="absolute top-4 right-4 text-green-500 text-lg" title="Completed">✅</span>
      )}

      <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
        {lesson.level} · {lesson.topic}
      </span>

      <h2 className="text-lg font-bold mt-2 mb-2 flex-1">{lesson.title}</h2>

      <p className="text-gray-500 text-sm line-clamp-3 mb-4">{lesson.summaryContent}</p>

      {accuracy !== null && (
        <div className="mb-3 flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${accuracy >= 60 ? "bg-green-500" : "bg-yellow-400"}`}
              style={{ width: `${accuracy}%` }}
            />
          </div>
          <span className="text-xs text-gray-500">{accuracy}%</span>
        </div>
      )}

      <button
        onClick={() => router.push(`/lessons/${lesson._id}`)}
        className="mt-auto w-full bg-indigo-600 text-white py-2 rounded-md text-sm font-semibold hover:bg-indigo-700 transition"
      >
        {completed ? "Review Lesson →" : accuracy !== null ? "Try Again →" : "Start Lesson →"}
      </button>
    </div>
  );
}
