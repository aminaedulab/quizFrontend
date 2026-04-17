"use client";

import { useEffect, useState } from "react";
import AdminGuard from "@/components/AdminGuard";
import Link from "next/link";

interface Stats {
  totalLessons: number;
  totalQuizzes: number;
  totalAttempts: number;
  totalStudents: number;
  avgAccuracy: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/admin/stats`)
      .then((r) => r.json())
      .then((d) => d.success && setStats(d.stats))
      .catch(() => {});
  }, []);

  const statCards = stats
    ? [
        { label: "Total Lessons", value: stats.totalLessons, icon: "📚" },
        { label: "Quizzes Generated", value: stats.totalQuizzes, icon: "🧠" },
        { label: "Quiz Attempts", value: stats.totalAttempts, icon: "📝" },
        { label: "Students", value: stats.totalStudents, icon: "👩‍🎓" },
        { label: "Avg Accuracy", value: `${stats.avgAccuracy}%`, icon: "🎯" },
      ]
    : [];

  return (
    <AdminGuard>
      <div className="min-h-screen p-8 bg-gray-100">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {statCards.map((s) => (
              <div key={s.label} className="bg-white rounded-xl shadow p-4 text-center">
                <p className="text-2xl">{s.icon}</p>
                <p className="text-2xl font-bold text-indigo-700 mt-1">{s.value}</p>
                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/admin/lessons/add"
            className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
            <p className="text-2xl mb-2">➕</p>
            <p className="font-semibold text-lg">Add Lesson</p>
            <p className="text-sm text-gray-500 mt-1">Create from MDN topic or PDF upload</p>
          </Link>

          <Link href="/admin/lessons/list"
            className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
            <p className="text-2xl mb-2">📋</p>
            <p className="font-semibold text-lg">Manage Lessons</p>
            <p className="text-sm text-gray-500 mt-1">Edit, delete, reorder lessons</p>
          </Link>

          <Link href="/admin/lessons/list"
            className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
            <p className="text-2xl mb-2">🧠</p>
            <p className="font-semibold text-lg">Manage Quizzes</p>
            <p className="text-sm text-gray-500 mt-1">View and regenerate quizzes</p>
          </Link>
        </div>
      </div>
    </AdminGuard>
  );
}
