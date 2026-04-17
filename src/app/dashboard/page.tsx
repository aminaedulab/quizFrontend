"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LessonCard from "@/components/LessonCard";
import ProgressCharts from "@/components/ProgressCharts";
import { getProgress, getLevel } from "@/lib/progress";

interface Lesson {
  _id: string;
  title: string;
  topic: string;
  level: string;
  summaryContent: string;
}

type Tab = "lessons" | "progress";

export default function DashboardPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [level, setLevel] = useState("Beginner");
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<Tab>("lessons");

  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [lastTopic, setLastTopic] = useState<string | null>(null);
  const [suggestLevel, setSuggestLevel] = useState<string | null>(null);

  useEffect(() => {
    const id = localStorage.getItem("userId");
    if (!id) { router.push("/login"); return; }
    setUserId(id);

    const p = getProgress();
    setXp(p.xp);
    setStreak(p.streak);
    const completed = Object.values(p.topics).filter((t) => t.completed);
    setCompletedCount(completed.length);

    const sorted = Object.values(p.topics).sort((a, b) =>
      (b.completedAt ?? "").localeCompare(a.completedAt ?? "")
    );
    if (sorted.length > 0) setLastTopic(sorted[0].topic);

    // ML proficiency inference: if avg accuracy across 3+ topics >= 75, suggest next level
    const attempted = Object.values(p.topics).filter((t) => t.accuracy > 0);
    if (attempted.length >= 3) {
      const avg = attempted.reduce((s, t) => s + t.accuracy, 0) / attempted.length;
      const storedLevel = localStorage.getItem("learningLevel") ?? "Beginner";
      if (avg >= 75 && storedLevel === "Beginner") setSuggestLevel("Intermediate");
      else if (avg >= 75 && storedLevel === "Intermediate") setSuggestLevel("Advanced");
    }
  }, [router]);

  useEffect(() => { fetchLessons(); }, [level]);

  const fetchLessons = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/lesson?level=${level}`);
      const data = await res.json();
      setLessons(data.data || []);
    } catch {
      console.error("Failed to fetch lessons");
    } finally {
      setLoading(false);
    }
  };

  if (!userId) return null;

  const { level: lvl, title, progress, nextXp } = getLevel(xp);

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Top stats bar */}
      <div className="bg-white border-b px-8 py-5">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-2xl font-bold text-indigo-700">Lv.{lvl}</span>
              <span className="text-lg font-semibold text-gray-700">{title}</span>
              {streak > 0 && <span className="text-orange-500 font-semibold">🔥 {streak} day streak</span>}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-sm text-gray-500 whitespace-nowrap">{xp} / {nextXp} XP</span>
            </div>
          </div>
          <div className="flex gap-6 text-center">
            {[
              { val: completedCount, label: "Topics Done", color: "text-indigo-600" },
              { val: streak, label: "Day Streak", color: "text-orange-500" },
              { val: xp, label: "Total XP", color: "text-purple-600" },
            ].map((s) => (
              <div key={s.label}>
                <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-5xl mx-auto flex gap-1 mt-4">
          {(["lessons", "progress"] as Tab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-t-md text-sm font-semibold border-b-2 transition ${
                tab === t ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}>
              {t === "lessons" ? "📚 Lessons" : "📊 My Progress"}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6">

        {/* Level-up suggestion from ML inference */}
        {suggestLevel && (
          <div className="bg-green-50 border border-green-300 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div>
              <p className="font-semibold text-green-800">🎓 You're ready to level up!</p>
              <p className="text-sm text-green-700">
                Your average accuracy suggests you're ready for <strong>{suggestLevel}</strong> content.
              </p>
            </div>
            <button onClick={() => { setLevel(suggestLevel); setTab("lessons"); setSuggestLevel(null); }}
              className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-green-700">
              Switch to {suggestLevel} →
            </button>
          </div>
        )}

        {/* ── LESSONS TAB ── */}
        {tab === "lessons" && (
          <>
            {/* Continue where you left off */}
            {lastTopic && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-indigo-500 font-medium">Continue where you left off</p>
                  <p className="font-semibold text-indigo-800 capitalize">{lastTopic.replace(/-/g, " ")}</p>
                </div>
                <button
                  onClick={() => {
                    const match = lessons.find((l) => l.topic === lastTopic);
                    if (match) router.push(`/lessons/${match._id}`);
                    else router.push("/roadmap");
                  }}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-indigo-700">
                  Resume →
                </button>
              </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold">Lessons</h2>
                <p className="text-gray-500 text-sm">Pick your level</p>
              </div>
              <div className="flex gap-2 mt-3 md:mt-0">
                {["Beginner", "Intermediate", "Advanced"].map((l) => (
                  <button key={l} onClick={() => setLevel(l)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                      level === l ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-600 border-gray-300 hover:border-indigo-400"
                    }`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <p className="text-gray-500">Loading lessons...</p>
            ) : lessons.length === 0 ? (
              <p className="text-gray-500">No lessons found for this level.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {lessons.map((lesson) => (
                  <LessonCard key={lesson._id} lesson={lesson} />
                ))}
              </div>
            )}
          </>
        )}

        {/* ── PROGRESS TAB ── */}
        {tab === "progress" && <ProgressCharts />}
      </div>
    </div>
  );
}
