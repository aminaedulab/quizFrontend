"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCompletedTopics, getProgress } from "@/lib/progress";

interface TopicNode {
  slug: string;
  label: string;
  prerequisites: string[];
}

const ROADMAP: Record<string, TopicNode[]> = {
  Beginner: [
    { slug: "introduction", label: "Introduction", prerequisites: [] },
    { slug: "variables", label: "Variables & Types", prerequisites: ["introduction"] },
    { slug: "control-flow", label: "Control Flow", prerequisites: ["variables"] },
    { slug: "loops", label: "Loops", prerequisites: ["control-flow"] },
    { slug: "functions", label: "Functions", prerequisites: ["loops"] },
    { slug: "arrays", label: "Arrays", prerequisites: ["functions"] },
    { slug: "objects", label: "Objects", prerequisites: ["arrays"] },
    { slug: "numbers-strings", label: "Numbers & Strings", prerequisites: ["variables"] },
    { slug: "expressions-operators", label: "Operators", prerequisites: ["variables"] },
  ],
  Intermediate: [
    { slug: "closures", label: "Closures", prerequisites: ["functions"] },
    { slug: "classes", label: "Classes", prerequisites: ["objects"] },
    { slug: "promises", label: "Promises", prerequisites: ["functions"] },
    { slug: "async-await", label: "Async/Await", prerequisites: ["promises"] },
    { slug: "events", label: "Events", prerequisites: ["functions"] },
    { slug: "error-handling", label: "Error Handling", prerequisites: ["control-flow"] },
    { slug: "modules", label: "Modules", prerequisites: ["classes"] },
    { slug: "regular-expressions", label: "Regex", prerequisites: ["numbers-strings"] },
    { slug: "keyed-collections", label: "Map & Set", prerequisites: ["objects"] },
  ],
  Advanced: [
    { slug: "prototypes", label: "Prototypes", prerequisites: ["classes"] },
    { slug: "iterators-generators", label: "Iterators & Generators", prerequisites: ["closures"] },
    { slug: "memory-management", label: "Memory Management", prerequisites: ["closures"] },
    { slug: "data-structures", label: "Data Structures", prerequisites: ["arrays", "keyed-collections"] },
    { slug: "meta-programming", label: "Meta Programming", prerequisites: ["prototypes"] },
    { slug: "equality-comparisons", label: "Equality & Comparisons", prerequisites: ["variables"] },
    { slug: "typed-arrays", label: "Typed Arrays", prerequisites: ["arrays"] },
    { slug: "internationalization", label: "Internationalization", prerequisites: ["objects"] },
  ],
};

// Objective 5: Post-JS framework roadmap
const NEXT_STEPS = [
  {
    category: "Frontend Frameworks",
    icon: "⚛️",
    color: "blue",
    items: [
      { name: "React.js", desc: "Component-based UI library by Meta. Most in-demand frontend skill.", level: "Recommended first", url: "https://react.dev" },
      { name: "Next.js", desc: "React framework with SSR, routing, and full-stack capabilities.", level: "After React", url: "https://nextjs.org" },
      { name: "Vue.js", desc: "Progressive framework, gentler learning curve than React.", level: "Alternative to React", url: "https://vuejs.org" },
    ],
  },
  {
    category: "Backend & Runtime",
    icon: "🟢",
    color: "green",
    items: [
      { name: "Node.js", desc: "Run JavaScript on the server. Essential for full-stack JS development.", level: "Recommended first", url: "https://nodejs.org" },
      { name: "Express.js", desc: "Minimal Node.js web framework. Build REST APIs quickly.", level: "After Node.js", url: "https://expressjs.com" },
      { name: "NestJS", desc: "Opinionated Node.js framework with TypeScript, great for large apps.", level: "Intermediate", url: "https://nestjs.com" },
    ],
  },
  {
    category: "Type Safety",
    icon: "🔷",
    color: "indigo",
    items: [
      { name: "TypeScript", desc: "Typed superset of JavaScript. Industry standard for large codebases.", level: "High priority", url: "https://www.typescriptlang.org" },
    ],
  },
  {
    category: "Tooling & DevOps",
    icon: "🛠️",
    color: "orange",
    items: [
      { name: "Git & GitHub", desc: "Version control. Non-negotiable for any developer.", level: "Learn now", url: "https://github.com" },
      { name: "Vite / Webpack", desc: "Modern build tools for bundling JS applications.", level: "After frameworks", url: "https://vitejs.dev" },
      { name: "Jest / Vitest", desc: "Testing frameworks for JavaScript. Employers expect this.", level: "Intermediate", url: "https://vitest.dev" },
    ],
  },
  {
    category: "Databases",
    icon: "🗄️",
    color: "purple",
    items: [
      { name: "MongoDB", desc: "Document database, pairs naturally with Node.js (MERN stack).", level: "Beginner friendly", url: "https://www.mongodb.com" },
      { name: "PostgreSQL", desc: "Powerful relational database. Used in most production systems.", level: "Intermediate", url: "https://www.postgresql.org" },
    ],
  },
];

const COLOR_MAP: Record<string, string> = {
  blue: "border-blue-300 bg-blue-50 text-blue-700",
  green: "border-green-300 bg-green-50 text-green-700",
  indigo: "border-indigo-300 bg-indigo-50 text-indigo-700",
  orange: "border-orange-300 bg-orange-50 text-orange-700",
  purple: "border-purple-300 bg-purple-50 text-purple-700",
};

export default function RoadmapPage() {
  const router = useRouter();
  const [completed, setCompleted] = useState<string[]>([]);
  const [lessons, setLessons] = useState<Record<string, string>>({});
  const [totalTopics] = useState(Object.values(ROADMAP).flat().length);
  const [activeTab, setActiveTab] = useState<"js" | "next">("js");

  useEffect(() => {
    const id = localStorage.getItem("userId");
    if (!id) { router.push("/login"); return; }
    setCompleted(getCompletedTopics());
    fetchLessonIds();
  }, [router]);

  const fetchLessonIds = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/lesson`);
      const data = await res.json();
      const map: Record<string, string> = {};
      (data.data ?? []).forEach((l: any) => { map[l.topic] = l._id; });
      setLessons(map);
    } catch { }
  };

  const isUnlocked = (node: TopicNode) =>
    node.prerequisites.every((p) => completed.includes(p));

  const getStatus = (node: TopicNode) => {
    if (completed.includes(node.slug)) return "done";
    if (isUnlocked(node)) return "available";
    return "locked";
  };

  const completedPct = Math.round((completed.length / totalTopics) * 100);
  const jsComplete = completedPct >= 80;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b px-8 py-5">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold">Learning Roadmap 🗺️</h1>
          <p className="text-gray-500 mt-1">Your structured path through JavaScript and beyond.</p>

          {/* Overall progress bar */}
          <div className="mt-4 flex items-center gap-4">
            <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${completedPct}%` }} />
            </div>
            <span className="text-sm font-semibold text-indigo-700 whitespace-nowrap">
              {completed.length} / {totalTopics} topics ({completedPct}%)
            </span>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4">
            {([["js", "📘 JavaScript Path"], ["next", "🚀 What's Next"]] as const).map(([t, label]) => (
              <button key={t} onClick={() => setActiveTab(t)}
                className={`px-5 py-2 rounded-t-md text-sm font-semibold border-b-2 transition ${
                  activeTab === t ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"
                }`}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6">

        {/* ── JS PATH TAB ── */}
        {activeTab === "js" && (
          <>
            <div className="flex gap-5 text-sm text-gray-500 mb-6">
              <span>✅ Completed</span>
              <span>▶️ Available</span>
              <span>🔒 Locked (complete prerequisites first)</span>
            </div>

            {Object.entries(ROADMAP).map(([levelName, nodes]) => {
              const doneInLevel = nodes.filter((n) => completed.includes(n.slug)).length;
              return (
                <div key={levelName} className="mb-10">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xl font-bold text-gray-800">{levelName}</h2>
                    <span className="text-sm text-gray-500">{doneInLevel}/{nodes.length} done</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {nodes.map((node) => {
                      const status = getStatus(node);
                      const lessonId = lessons[node.slug];
                      return (
                        <button key={node.slug}
                          disabled={status === "locked"}
                          onClick={() => lessonId && router.push(`/lessons/${lessonId}`)}
                          className={`relative p-4 rounded-xl border-2 text-left transition-all
                            ${status === "done" ? "border-green-400 bg-green-50" : ""}
                            ${status === "available" ? "border-indigo-400 bg-white hover:shadow-md cursor-pointer" : ""}
                            ${status === "locked" ? "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed" : ""}
                          `}>
                          <div className="flex items-start justify-between">
                            <span className="font-semibold text-gray-800 text-sm">{node.label}</span>
                            <span>{status === "done" ? "✅" : status === "locked" ? "🔒" : "▶️"}</span>
                          </div>
                          {node.prerequisites.length > 0 && status === "locked" && (
                            <p className="text-xs text-gray-400 mt-1">
                              Needs: {node.prerequisites.map((p) => p.replace(/-/g, " ")).join(", ")}
                            </p>
                          )}
                          {status === "available" && !lessonId && (
                            <p className="text-xs text-yellow-500 mt-1">Lesson coming soon</p>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* ── WHAT'S NEXT TAB ── */}
        {activeTab === "next" && (
          <div className="space-y-8">
            {!jsComplete && (
              <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4 text-sm text-yellow-800">
                💡 You've completed {completedPct}% of the JavaScript path. Finish more topics before diving into frameworks — a strong JS foundation makes everything easier.
              </div>
            )}
            {jsComplete && (
              <div className="bg-green-50 border border-green-300 rounded-xl p-4 text-sm text-green-800 font-medium">
                🎉 You've completed {completedPct}% of JavaScript! You're ready to explore the ecosystem below.
              </div>
            )}

            {NEXT_STEPS.map((cat) => (
              <div key={cat.category}>
                <h2 className="text-lg font-bold mb-3 text-gray-800">
                  {cat.icon} {cat.category}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cat.items.map((item) => (
                    <a key={item.name} href={item.url} target="_blank" rel="noopener noreferrer"
                      className={`block p-4 rounded-xl border-2 hover:shadow-md transition ${COLOR_MAP[cat.color]}`}>
                      <div className="flex items-start justify-between">
                        <p className="font-bold text-base">{item.name}</p>
                        <span className="text-xs font-semibold bg-white bg-opacity-60 px-2 py-0.5 rounded-full">
                          {item.level}
                        </span>
                      </div>
                      <p className="text-sm mt-1 opacity-80">{item.desc}</p>
                      <p className="text-xs mt-2 underline opacity-70">Learn more →</p>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
