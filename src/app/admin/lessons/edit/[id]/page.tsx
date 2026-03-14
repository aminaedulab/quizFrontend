"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminGuard from "@/components/AdminGuard";

export default function EditLessonPage() {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    topic: "",
    level: "Beginner",
    summaryContent: "",
    pdfUrl: "",
    order: 1,
  });

  // 🔹 Fetch lesson
  useEffect(() => {
    if (!id) return;

    fetch(`http://localhost:7000/v1/lesson/${id}`)
      .then(res => res.json())
      .then(data => {
        const lesson = data.data;
        setForm({
          title: lesson.title,
          topic: lesson.topic,
          level: lesson.level,
          summaryContent: lesson.summaryContent,
          pdfUrl: lesson.pdfUrl || "",
          order: lesson.order,
        });
        setLoading(false);
      });
  }, [id]);

const regenerateSummary = async () => {
  setAiLoading(true);
    console.log('idddddddddd',id)

  const res = await fetch(
    "http://localhost:7000/v1/admin/regenerate-summary",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    }
  );

  const data = await res.json();

  if (data.success) {
    setForm(prev => ({
      ...prev,
      summaryContent: data.summary,
    }));
  }

  setAiLoading(false);
};


  // 🔹 Update lesson
  const update = async () => {
    await fetch(`http://localhost:7000/v1/admin/lesson/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    alert("Lesson updated successfully");
    router.push("/admin/lessons/list");
  };

  if (loading) {
    return (
      <AdminGuard>
        <div className="p-8 text-center">Loading lesson...</div>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <div className="max-w-3xl mx-auto p-8">
        <h2 className="text-2xl font-bold mb-4">Edit Lesson</h2>

        <input
          className="border p-2 w-full mb-2"
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
        />

        <input
          className="border p-2 w-full mb-2"
          value={form.topic}
          onChange={e => setForm({ ...form, topic: e.target.value })}
        />

        <select
          className="border p-2 w-full mb-2"
          value={form.level}
          onChange={e => setForm({ ...form, level: e.target.value })}
        >
          <option>Beginner</option>
          <option>Intermediate</option>
          <option>Advanced</option>
        </select>

        <textarea
          className="border p-2 w-full mb-2 h-40"
          value={form.summaryContent}
          onChange={e =>
            setForm({ ...form, summaryContent: e.target.value })
          }
        />

        {/* 🔥 AI BUTTON */}
        <button
          onClick={regenerateSummary}
          className="bg-gray-700 text-white px-4 py-2 rounded mb-4"
        >
          {aiLoading ? "Regenerating..." : "Regenerate AI Summary"}
        </button>

        <input
          className="border p-2 w-full mb-2"
          value={form.pdfUrl}
          onChange={e => setForm({ ...form, pdfUrl: e.target.value })}
        />

        <input
          type="number"
          className="border p-2 w-full mb-4"
          value={form.order}
          onChange={e =>
            setForm({ ...form, order: Number(e.target.value) })
          }
        />

        <button
          onClick={update}
          className="bg-indigo-600 text-white px-6 py-2 rounded"
        >
          Update Lesson
        </button>
      </div>
    </AdminGuard>
  );
}
