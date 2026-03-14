    "use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Lesson {
  _id: string;
  title: string;
  topic: string;
  level: string;
  summaryContent: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [level, setLevel] = useState("Beginner");
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const id = localStorage.getItem("userId");
    if (!id) {
      router.push("/login");
    } else {
      setUserId(id);
    }
  }, [router]);

  useEffect(() => {
    fetchLessons();
  }, [level]);

  const fetchLessons = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `http://localhost:7000/v1/lesson?level=${level}`
      );
      const data = await res.json();
      setLessons(data.data || []);
    } catch (error) {
      console.error("Failed to fetch lessons");
    } finally {
      setLoading(false);
    }
  };

  if (!userId) return null;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">
            Learning Dashboard 👋
          </h1>
          <p className="text-gray-600">
            Select your learning level
          </p>
        </div>

        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          className="mt-4 md:mt-0 border px-4 py-2 rounded-md"
        >
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
      </div>

      {loading ? (
        <p className="text-gray-600">Loading lessons...</p>
      ) : lessons.length === 0 ? (
        <p className="text-gray-600">No lessons found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessons.map((lesson) => (
            <div
              key={lesson._id}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition"
            >
              <span className="text-sm font-semibold text-indigo-600">
                {lesson.level} · {lesson.topic}
              </span>

              <h2 className="text-xl font-bold mt-2">
                {lesson.title}
              </h2>

              <p className="text-gray-600 mt-2 line-clamp-3">
                {lesson.summaryContent}
              </p>

              <button
                onClick={() =>
                  router.push(`/lessons/${lesson._id}`)
                }
                className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-md font-semibold hover:bg-indigo-700 transition"
              >
                Start Lesson
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
