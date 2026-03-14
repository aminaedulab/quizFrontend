"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminGuard from "@/components/AdminGuard";

export default function LessonListPage() {
  const [lessons, setLessons] = useState<any[]>([]);

  useEffect(() => {
    fetch("http://localhost:7000/v1/lesson")
      .then(res => res.json())
      .then(data => setLessons(data.data));
  }, []);

  return (
    <AdminGuard>
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-4">Lessons</h2>

        {lessons.map(lesson => (
          <div key={lesson._id}
            className="bg-white p-4 mb-2 rounded shadow">
            <h3 className="font-semibold">{lesson.title}</h3>
            <p className="text-sm">{lesson.level} · {lesson.topic}</p>

            <Link href={`/admin/lessons/edit/${lesson._id}`}
              className="text-indigo-600">
              Edit
            </Link>
          </div>
        ))}
      </div>
    </AdminGuard>
  );
}
