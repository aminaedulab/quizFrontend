"use client";

import AdminGuard from "@/components/AdminGuard";
import Link from "next/link";

export default function AdminDashboard() {
  return (
    <AdminGuard>
      <div className="min-h-screen p-8 bg-gray-100">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/admin/lessons/add"
            className="bg-white p-6 rounded-xl shadow hover:shadow-lg">
            ➕ Add Lesson
          </Link>

          <Link href="/admin/lessons/list"
            className="bg-white p-6 rounded-xl shadow hover:shadow-lg">
            📚 Manage Lessons
          </Link>

          <div className="bg-white p-6 rounded-xl shadow">
            🧠 Quiz Generation
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
