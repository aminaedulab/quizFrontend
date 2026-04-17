"use client";

import { useState } from "react";
import axios from "axios";
import CodeBlock from "@/components/CodeBlock";

interface CodeExample {
  title: string;
  code: string;
  explanation: string;
}

interface ExplainResult {
  explanation: string;
  codeExamples: CodeExample[];
  mdnUrl: string;
}

interface Props {
  topic: string;
}

export default function ConceptChat({ topic }: Props) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExplainResult | null>(null);
  const [history, setHistory] = useState<{ q: string; r: ExplainResult }[]>([]);

  const ask = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/lesson/explain-concept`,
        { topic, question }
      );
      const data: ExplainResult = res.data;
      setResult(data);
      setHistory((h) => [{ q: question, r: data }, ...h].slice(0, 5));
      setQuestion("");
    } catch {
      setResult({ explanation: "Could not get an explanation right now. Try again.", codeExamples: [], mdnUrl: "" });
    } finally {
      setLoading(false);
    }
  };

  const QUICK = [
    "What is this used for?",
    "Show me a simple example",
    "What are common mistakes?",
    "How does this relate to the previous topic?",
  ];

  return (
    <div className="mt-6">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 text-indigo-600 font-semibold text-sm hover:underline"
      >
        🤖 {open ? "Hide AI Tutor" : "Ask AI Tutor about this topic"}
      </button>

      {open && (
        <div className="mt-3 bg-indigo-50 border border-indigo-200 rounded-xl p-5">
          <p className="text-sm text-indigo-700 font-medium mb-3">
            Ask anything about <span className="font-bold">{topic.replace(/-/g, " ")}</span>
          </p>

          {/* Quick questions */}
          <div className="flex flex-wrap gap-2 mb-3">
            {QUICK.map((q) => (
              <button key={q} onClick={() => setQuestion(q)}
                className="text-xs bg-white border border-indigo-300 text-indigo-700 px-3 py-1 rounded-full hover:bg-indigo-100 transition">
                {q}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && ask()}
              placeholder="e.g. What is the difference between let and var?"
              className="flex-1 border border-indigo-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <button onClick={ask} disabled={loading || !question.trim()}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-semibold disabled:opacity-50 hover:bg-indigo-700">
              {loading ? "..." : "Ask"}
            </button>
          </div>

          {/* Current result */}
          {result && (
            <div className="mt-4 bg-white rounded-lg p-4 border border-indigo-100">
              <p className="text-sm text-gray-700 leading-relaxed">{result.explanation}</p>
              {result.codeExamples?.length > 0 && (
                <div className="mt-3">
                  {result.codeExamples.map((ex, i) => (
                    <CodeBlock key={i} title={ex.title} code={ex.code} explanation={ex.explanation} />
                  ))}
                </div>
              )}
              {result.mdnUrl && (
                <a href={result.mdnUrl} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-blue-500 underline mt-2 inline-block">
                  Read full MDN docs →
                </a>
              )}
            </div>
          )}

          {/* History */}
          {history.length > 1 && (
            <div className="mt-4 border-t pt-3">
              <p className="text-xs text-gray-400 mb-2">Previous questions</p>
              {history.slice(1).map((h, i) => (
                <button key={i} onClick={() => setResult(h.r)}
                  className="block text-xs text-indigo-600 hover:underline mb-1 text-left">
                  → {h.q}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
