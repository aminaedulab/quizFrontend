"use client";

import { useEffect, useState } from "react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, CartesianGrid, Legend,
} from "recharts";
import { getProgress } from "@/lib/progress";

const LEVEL_TOPICS: Record<string, string[]> = {
  Beginner:     ["introduction", "variables", "control-flow", "loops", "functions", "arrays", "objects"],
  Intermediate: ["classes", "promises", "async-await", "events", "error-handling", "modules", "closures"],
  Advanced:     ["prototypes", "iterators-generators", "memory-management", "data-structures", "meta-programming"],
};

const TOPIC_LABEL: Record<string, string> = {
  "introduction": "Intro", "variables": "Variables", "control-flow": "Control Flow",
  "loops": "Loops", "functions": "Functions", "arrays": "Arrays", "objects": "Objects",
  "classes": "Classes", "promises": "Promises", "async-await": "Async/Await",
  "events": "Events", "error-handling": "Errors", "modules": "Modules",
  "closures": "Closures", "prototypes": "Prototypes", "iterators-generators": "Iterators",
  "memory-management": "Memory", "data-structures": "Data Structs", "meta-programming": "Meta",
};

export default function ProgressCharts() {
  const [radarData, setRadarData] = useState<any[]>([]);
  const [barData, setBarData] = useState<any[]>([]);
  const [lineData, setLineData] = useState<any[]>([]);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    const p = getProgress();
    const attempted = Object.values(p.topics);
    if (attempted.length === 0) return;
    setHasData(true);

    // Radar: average accuracy per level area
    const radar = Object.entries(LEVEL_TOPICS).map(([level, slugs]) => {
      const scores = slugs
        .map((s) => p.topics[s]?.accuracy ?? 0)
        .filter((a) => a > 0);
      return {
        subject: level,
        accuracy: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
        fullMark: 100,
      };
    });
    setRadarData(radar);

    // Bar: accuracy per attempted topic
    const bar = attempted
      .sort((a, b) => b.accuracy - a.accuracy)
      .map((t) => ({
        topic: TOPIC_LABEL[t.topic] ?? t.topic,
        accuracy: t.accuracy,
        completed: t.completed,
      }));
    setBarData(bar);

    // Line: XP over time (simulate from topics sorted by completedAt)
    const sorted = attempted
      .filter((t) => t.completedAt)
      .sort((a, b) => (a.completedAt ?? "").localeCompare(b.completedAt ?? ""));
    let cumXp = 0;
    const line = sorted.map((t) => {
      cumXp += t.xp;
      return {
        topic: TOPIC_LABEL[t.topic] ?? t.topic,
        xp: cumXp,
      };
    });
    setLineData(line);
  }, []);

  if (!hasData) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-400">
        Complete some quizzes to see your progress charts here.
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Row 1: Radar + Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Radar — skill coverage */}
        <div className="bg-white rounded-xl shadow-md p-5">
          <p className="font-semibold text-gray-700 mb-4">Skill Coverage by Level</p>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Radar name="Accuracy" dataKey="accuracy" stroke="#6366f1" fill="#6366f1" fillOpacity={0.35} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Bar — per-topic accuracy */}
        <div className="bg-white rounded-xl shadow-md p-5">
          <p className="font-semibold text-gray-700 mb-4">Accuracy per Topic</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={barData} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="topic" tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v: number) => `${v}%`} />
              <Bar dataKey="accuracy" radius={[4, 4, 0, 0]}>
                {barData.map((entry, i) => (
                  <Cell key={i} fill={entry.completed ? "#10b981" : "#f59e0b"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-green-500 inline-block" /> Passed</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-yellow-400 inline-block" /> Attempted</span>
          </div>
        </div>
      </div>

      {/* Row 2: XP growth line */}
      {lineData.length >= 2 && (
        <div className="bg-white rounded-xl shadow-md p-5">
          <p className="font-semibold text-gray-700 mb-4">XP Growth Over Time</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="topic" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="xp" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
