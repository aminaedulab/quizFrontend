"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import AdminGuard from "@/components/AdminGuard";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

// Human-readable labels for topic slugs
const TOPIC_LABELS: Record<string, string> = {
  "introduction": "Introduction to JavaScript",
  "variables": "Variables & Data Types",
  "control-flow": "Control Flow",
  "loops": "Loops & Iteration",
  "functions": "Functions",
  "expressions-operators": "Expressions & Operators",
  "numbers-strings": "Numbers & Strings",
  "arrays": "Arrays",
  "objects": "Working with Objects",
  "classes": "Classes",
  "promises": "Promises",
  "async-await": "Async / Await",
  "events": "Events",
  "error-handling": "Error Handling",
  "regular-expressions": "Regular Expressions",
  "keyed-collections": "Map, Set & Keyed Collections",
  "indexed-collections": "Indexed Collections",
  "dates": "Dates & Times",
  "modules": "JavaScript Modules",
  "closures": "Closures",
  "prototypes": "Prototypes & Inheritance",
  "iterators-generators": "Iterators & Generators",
  "typed-arrays": "Typed Arrays",
  "memory-management": "Memory Management",
  "equality-comparisons": "Equality & Comparisons",
  "data-structures": "Data Structures",
  "meta-programming": "Meta Programming",
  "internationalization": "Internationalization",
};

function labelFor(slug: string) {
  return TOPIC_LABELS[slug] ?? slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

type Mode = "topic" | "pdf";

export default function AddLessonPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("topic");

  // Topics from AiServer (via backend proxy)
  const [topicMap, setTopicMap] = useState<Record<string, string[]>>({});
  const [topicsLoading, setTopicsLoading] = useState(true);

  // Topic mode state
  const [selectedTopic, setSelectedTopic] = useState("");
  const [topicSummary, setTopicSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);

  // PDF mode state
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfSummary, setPdfSummary] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);

  // Shared
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);

  // ── Load topics from AiServer on mount ───────────────────────────────────
  useEffect(() => {
    axios
      .get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/lesson/topics`)
      .then((res) => {
        if (res.data.success) {
          // AiServer returns lowercase keys: beginner/intermediate/advanced
          // Normalise to Title Case
          const raw: Record<string, string[]> = res.data.topics;
          const normalised: Record<string, string[]> = {};
          for (const [k, v] of Object.entries(raw)) {
            const key = k.charAt(0).toUpperCase() + k.slice(1);
            normalised[key] = v;
          }
          setTopicMap(normalised);
          // Auto-select first topic
          const first = Object.values(normalised)[0]?.[0] ?? "";
          setSelectedTopic(first);
        }
      })
      .catch(() => toast.error("Could not load topics from AiServer"))
      .finally(() => setTopicsLoading(false));
  }, []);

  // Auto-set title when topic changes
  useEffect(() => {
    if (mode === "topic" && selectedTopic) {
      setTitle(labelFor(selectedTopic));
      setTopicSummary("");
    }
  }, [selectedTopic, mode]);

  // ── Fetch MDN summary ─────────────────────────────────────────────────────
  const fetchTopicSummary = async () => {
    if (!selectedTopic) return;
    try {
      setSummaryLoading(true);
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/lesson/topic-summary`,
        { topic: selectedTopic }
      );
      setTopicSummary(res.data.summary);
      toast.success("Summary fetched from MDN");
    } catch {
      toast.error("Failed to fetch topic summary");
    } finally {
      setSummaryLoading(false);
    }
  };

  // ── Upload PDF ────────────────────────────────────────────────────────────
  const uploadPdf = async () => {
    if (!pdfFile) return toast.error("Select a PDF first");
    try {
      setPdfLoading(true);
      const fd = new FormData();
      fd.append("file", pdfFile);
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/admin/pdf-summary`,
        fd
      );
      if (res.data.success) {
        setPdfSummary(res.data.summary);
        setPdfUrl(res.data.pdfUrl);
        toast.success("PDF summary generated");
      }
    } catch {
      toast.error("PDF upload failed");
    } finally {
      setPdfLoading(false);
    }
  };

  // ── Get level for selected topic ──────────────────────────────────────────
  const getLevelForTopic = (slug: string): string => {
    for (const [level, slugs] of Object.entries(topicMap)) {
      if (slugs.includes(slug)) return level;
    }
    return "Beginner";
  };

  const getOrderForTopic = (slug: string): number => {
    const all = Object.values(topicMap).flat();
    const idx = all.indexOf(slug);
    return idx >= 0 ? idx + 1 : 99;
  };

  // ── Save lesson ───────────────────────────────────────────────────────────
  const save = async () => {
    const summaryContent = mode === "topic" ? topicSummary : pdfSummary;
    if (!title.trim()) return toast.error("Title is required");
    if (!summaryContent.trim()) return toast.error("Generate a summary first");

    const level = mode === "topic" ? getLevelForTopic(selectedTopic) : "Beginner";
    const topic = mode === "topic" ? selectedTopic : title.toLowerCase().replace(/\s+/g, "-");
    const order = mode === "topic" ? getOrderForTopic(selectedTopic) : 99;

    try {
      setSaving(true);
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/admin/lesson`, {
        title,
        topic,
        level,
        summaryContent,
        pdfUrl: mode === "pdf" ? pdfUrl : "",
        order,
      });
      toast.success("Lesson saved");
      router.push("/admin/lessons/list");
    } catch {
      toast.error("Failed to save lesson");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminGuard>
      <div className="max-w-3xl mx-auto p-8">
        <h2 className="text-2xl font-bold mb-6">Add Lesson</h2>

        {/* Mode toggle */}
        <div className="flex gap-2 mb-6">
          {(["topic", "pdf"] as Mode[]).map((m) => (
            <button key={m} onClick={() => setMode(m)}
              className={`flex-1 py-2 rounded-md font-semibold border transition ${
                mode === m
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-600 border-gray-300 hover:border-indigo-400"
              }`}>
              {m === "topic" ? "📚 From MDN Topic" : "📄 From PDF Upload"}
            </button>
          ))}
        </div>

        {/* ── MDN Topic mode ── */}
        {mode === "topic" && (
          <div className="space-y-4">
            {topicsLoading ? (
              <p className="text-gray-500 text-sm">Loading topics from AiServer...</p>
            ) : Object.keys(topicMap).length === 0 ? (
              <p className="text-red-500 text-sm">Could not load topics. Is AiServer running?</p>
            ) : (
              Object.entries(topicMap).map(([level, slugs]) => (
                <div key={level}>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    {level}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {slugs.map((slug) => (
                      <button key={slug} onClick={() => setSelectedTopic(slug)}
                        className={`px-3 py-1 rounded-full text-sm border transition ${
                          selectedTopic === slug
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-white text-gray-600 border-gray-300 hover:border-indigo-400"
                        }`}>
                        {labelFor(slug)}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}

            {selectedTopic && (
              <div className="pt-3 border-t flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Selected: <span className="font-semibold text-indigo-700">{labelFor(selectedTopic)}</span>
                  <span className="text-gray-400 ml-2">· {getLevelForTopic(selectedTopic)}</span>
                </p>
                <button onClick={fetchTopicSummary} disabled={summaryLoading}
                  className="bg-gray-800 text-white px-4 py-2 rounded-md text-sm disabled:opacity-50">
                  {summaryLoading ? "Fetching from MDN..." : "Fetch AI Summary"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── PDF mode ── */}
        {mode === "pdf" && (
          <div className="space-y-3">
            <input type="file" accept="application/pdf"
              className="border p-2 w-full rounded"
              onChange={(e) => setPdfFile(e.target.files?.[0] || null)} />
            <button onClick={uploadPdf} disabled={pdfLoading}
              className="bg-gray-800 text-white px-4 py-2 rounded-md text-sm disabled:opacity-50">
              {pdfLoading ? "Uploading & Summarizing..." : "Upload PDF & Generate Summary"}
            </button>
          </div>
        )}

        {/* ── Shared fields ── */}
        <div className="mt-6 space-y-3">
          <div>
            <label className="text-sm text-gray-600 block mb-1">Lesson Title</label>
            <input className="border p-2 w-full rounded" value={title}
              placeholder="Lesson title"
              onChange={(e) => setTitle(e.target.value)} />
          </div>

          {(topicSummary || pdfSummary) && (
            <div>
              <label className="text-sm text-gray-600 block mb-1">
                Summary Content <span className="text-gray-400">(editable)</span>
              </label>
              <textarea
                className="border p-2 w-full rounded h-48 text-sm"
                value={mode === "topic" ? topicSummary : pdfSummary}
                onChange={(e) =>
                  mode === "topic" ? setTopicSummary(e.target.value) : setPdfSummary(e.target.value)
                }
              />
            </div>
          )}

          <button onClick={save}
            disabled={saving || !(mode === "topic" ? topicSummary : pdfSummary)}
            className="w-full bg-indigo-600 text-white py-2 rounded-md font-semibold hover:bg-indigo-700 disabled:opacity-50">
            {saving ? "Saving..." : "Save Lesson"}
          </button>
        </div>
      </div>
    </AdminGuard>
  );
}
