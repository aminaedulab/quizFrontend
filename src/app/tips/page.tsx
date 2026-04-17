"use client";

import { useState } from "react";

const TIPS = [
  {
    category: "JavaScript Shortcuts",
    icon: "⚡",
    color: "indigo",
    items: [
      { title: "Optional chaining (?.) saves null checks", code: "// Instead of: user && user.address && user.address.city\nconst city = user?.address?.city ?? 'Unknown';" },
      { title: "Nullish coalescing (??) vs OR (||)", code: "const val = 0 || 'default';   // 'default' — 0 is falsy!\nconst val2 = 0 ?? 'default';  // 0 — only null/undefined triggers ??" },
      { title: "Destructuring with defaults", code: "const { name = 'Guest', role = 'user' } = config;\nconst [first = 0, second = 0] = arr;" },
      { title: "Spread for immutable updates", code: "// Never mutate state directly\nconst updated = { ...user, age: 26 };\nconst newArr  = [...items, newItem];" },
      { title: "Short-circuit evaluation", code: "// Render only if condition is true\nconst el = isLoggedIn && <Dashboard />;\n// Assign if truthy\nconst name = user && user.name;" },
      { title: "Array destructuring swap", code: "let a = 1, b = 2;\n[a, b] = [b, a]; // swap without temp variable" },
    ],
  },
  {
    category: "Async Patterns",
    icon: "🔄",
    color: "purple",
    items: [
      { title: "Always handle errors in async functions", code: "async function fetchData() {\n  try {\n    const res = await fetch(url);\n    if (!res.ok) throw new Error(`HTTP ${res.status}`);\n    return await res.json();\n  } catch (err) {\n    console.error(err);\n    return null; // don't let it crash silently\n  }\n}" },
      { title: "Promise.all for parallel requests", code: "// Sequential (slow — waits for each)\nconst user  = await getUser(id);\nconst posts = await getPosts(id);\n\n// Parallel (fast — runs together)\nconst [user, posts] = await Promise.all([getUser(id), getPosts(id)]);" },
      { title: "Promise.allSettled when some can fail", code: "const results = await Promise.allSettled([fetch(url1), fetch(url2)]);\nresults.forEach(r => {\n  if (r.status === 'fulfilled') console.log(r.value);\n  else console.error(r.reason);\n});" },
    ],
  },
  {
    category: "Performance Tips",
    icon: "🚀",
    color: "green",
    items: [
      { title: "Debounce expensive operations", code: "function debounce(fn, delay) {\n  let timer;\n  return (...args) => {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), delay);\n  };\n}\nconst search = debounce(fetchResults, 300);" },
      { title: "Use const by default", code: "// const doesn't mean immutable — it means the binding can't change\nconst arr = [1, 2, 3];\narr.push(4); // fine — arr still points to same array\n// arr = []; // Error — can't reassign the binding" },
      { title: "Avoid creating functions inside loops", code: "// Bad — creates new function on every iteration\nfor (let i = 0; i < 1000; i++) {\n  el.addEventListener('click', () => doSomething(i));\n}\n\n// Better — define once outside\nconst handler = (i) => () => doSomething(i);\nfor (let i = 0; i < 1000; i++) el.addEventListener('click', handler(i));" },
    ],
  },
  {
    category: "Industry Best Practices",
    icon: "🏭",
    color: "orange",
    items: [
      { title: "Naming conventions matter", code: "// Variables & functions: camelCase\nconst userName = 'Alice';\nfunction getUserById(id) {}\n\n// Classes: PascalCase\nclass UserService {}\n\n// Constants: UPPER_SNAKE_CASE\nconst MAX_RETRIES = 3;\n\n// Private (convention): _prefix\nclass Foo { _privateMethod() {} }" },
      { title: "Write pure functions where possible", code: "// Impure — depends on external state\nlet total = 0;\nfunction addToTotal(n) { total += n; }\n\n// Pure — same input always gives same output\nfunction add(a, b) { return a + b; }" },
      { title: "Early return reduces nesting", code: "// Deeply nested (hard to read)\nfunction process(user) {\n  if (user) {\n    if (user.active) {\n      if (user.role === 'admin') { /* ... */ }\n    }\n  }\n}\n\n// Early return (clean)\nfunction process(user) {\n  if (!user) return;\n  if (!user.active) return;\n  if (user.role !== 'admin') return;\n  // main logic here\n}" },
      { title: "Use === not ==", code: "0 == '0'   // true  — type coercion!\n0 === '0'  // false — strict equality\nnull == undefined  // true\nnull === undefined // false\n// Always use === unless you explicitly need coercion" },
    ],
  },
  {
    category: "Career Tips",
    icon: "💼",
    color: "pink",
    items: [
      { title: "Build projects, not just tutorials", code: "// After learning a concept, build something with it:\n// - Variables/Functions → CLI calculator\n// - Arrays/Objects     → Todo list\n// - Async/Await        → Weather app using an API\n// - Classes            → Simple game\n// Projects > certificates on a CV" },
      { title: "Read other people's code", code: "// Open source is free education:\n// - Browse GitHub repos of tools you use\n// - Read the source of popular npm packages\n// - Review PRs on open source projects\n// Understanding real code > reading docs alone" },
      { title: "Learn to use browser DevTools", code: "// Essential DevTools skills:\n// - console.log, console.table, console.time\n// - Breakpoints in Sources tab\n// - Network tab for API debugging\n// - Performance tab for profiling\n// - Memory tab for leak detection" },
    ],
  },
];

const COLOR_CLASSES: Record<string, { bg: string; border: string; badge: string }> = {
  indigo: { bg: "bg-indigo-50", border: "border-indigo-200", badge: "bg-indigo-100 text-indigo-700" },
  purple: { bg: "bg-purple-50", border: "border-purple-200", badge: "bg-purple-100 text-purple-700" },
  green:  { bg: "bg-green-50",  border: "border-green-200",  badge: "bg-green-100 text-green-700" },
  orange: { bg: "bg-orange-50", border: "border-orange-200", badge: "bg-orange-100 text-orange-700" },
  pink:   { bg: "bg-pink-50",   border: "border-pink-200",   badge: "bg-pink-100 text-pink-700" },
};

export default function TipsPage() {
  const [copied, setCopied] = useState<string | null>(null);
  const [filter, setFilter] = useState("All");

  const categories = ["All", ...TIPS.map((t) => t.category)];
  const visible = filter === "All" ? TIPS : TIPS.filter((t) => t.category === filter);

  const copy = (code: string, key: string) => {
    navigator.clipboard.writeText(code);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-1">Pro Tips & Shortcuts ⚡</h1>
        <p className="text-gray-500 mb-6">Industry patterns, coding shortcuts, and career guidance to level up your JavaScript.</p>

        {/* Filter pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((c) => (
            <button key={c} onClick={() => setFilter(c)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                filter === c ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-600 border-gray-300 hover:border-indigo-400"
              }`}>
              {c}
            </button>
          ))}
        </div>

        {visible.map((cat) => {
          const cls = COLOR_CLASSES[cat.color];
          return (
            <div key={cat.category} className="mb-10">
              <h2 className="text-xl font-bold mb-4 text-gray-800">{cat.icon} {cat.category}</h2>
              <div className="space-y-4">
                {cat.items.map((tip, i) => {
                  const key = `${cat.category}-${i}`;
                  return (
                    <div key={key} className={`rounded-xl border ${cls.border} ${cls.bg} overflow-hidden`}>
                      <div className="flex items-center justify-between px-4 py-3">
                        <p className="font-semibold text-gray-800 text-sm">{tip.title}</p>
                        <button onClick={() => copy(tip.code, key)}
                          className="text-xs text-gray-400 hover:text-gray-700 transition">
                          {copied === key ? "✅ Copied" : "📋 Copy"}
                        </button>
                      </div>
                      <pre className="bg-gray-900 text-green-300 text-xs p-4 overflow-x-auto leading-relaxed font-mono whitespace-pre">
                        {tip.code}
                      </pre>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
