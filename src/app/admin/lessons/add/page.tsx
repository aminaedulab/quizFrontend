"use client";

import { useState } from "react";
import AdminGuard from "@/components/AdminGuard";

export default function AddLessonPage() {
const [form, setForm] = useState({
  title: "",
  topic: "",
  level: "Beginner",
  summaryContent: "",
  pdfUrl: "",   // 🔥 add this
  order: 1,
});


  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

const uploadPdfAndGenerateSummary = async () => {
  if (!pdfFile) return alert("Upload PDF first");

  setLoading(true);

  const fd = new FormData();
  fd.append("file", pdfFile);

  const res = await fetch("http://localhost:7000/v1/admin/pdf-summary", {
    method: "POST",
    body: fd,
  });

  const data = await res.json();

  if (data.success) {
    setForm(prev => ({
      ...prev,
      summaryContent: data.summary,
      pdfUrl: data.pdfPath,  // 🔥 SAVE PATH
    }));
  }

  setLoading(false);
};

const submit = async () => {
  await fetch("http://localhost:7000/v1/admin/lesson", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(form), // 🔥 pdfUrl included
  });

  alert("Lesson added successfully");
};

  return (
    <AdminGuard>
      <div className="max-w-3xl mx-auto p-8">
        <h2 className="text-2xl font-bold mb-4">Add Lesson</h2>

        <input className="border p-2 w-full mb-2"
          placeholder="Title"
          onChange={e => setForm({ ...form, title: e.target.value })} />

        <input className="border p-2 w-full mb-2"
          placeholder="Topic"
          onChange={e => setForm({ ...form, topic: e.target.value })} />

        <select className="border p-2 w-full mb-2"
          onChange={e => setForm({ ...form, level: e.target.value })}>
          <option>Beginner</option>
          <option>Intermediate</option>
          <option>Advanced</option>
        </select>

        {/* PDF Upload */}
        <input
          type="file"
          accept="application/pdf"
          className="border p-2 w-full mb-2"
          onChange={e => setPdfFile(e.target.files?.[0] || null)}
        />

        <button
          onClick={uploadPdfAndGenerateSummary}
          className="bg-gray-700 text-white px-4 py-2 rounded mb-3"
        >
          {loading ? "Generating..." : "Generate Summary from PDF"}
        </button>

        <textarea
          className="border p-2 w-full mb-2 h-40"
          placeholder="Editable Summary Content"
          value={form.summaryContent}
          onChange={e =>
            setForm({ ...form, summaryContent: e.target.value })
          }
        />

        <input type="number" className="border p-2 w-full mb-4"
          placeholder="Order"
          onChange={e => setForm({ ...form, order: Number(e.target.value) })} />

        <button onClick={submit}
          className="bg-indigo-600 text-white px-6 py-2 rounded">
          Save Lesson
        </button>
      </div>
    </AdminGuard>
  );
}
