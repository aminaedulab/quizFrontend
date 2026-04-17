"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ScoreCard from "@/components/ScoreCard";
import { getLevel } from "@/lib/progress";

interface FeedbackItem {
  question: string;
  correctAnswer: string;
  correctAnswerText: string;
  studentAnswer: string;
  studentAnswerText: string;
}

interface Recommendation {
  topic: string;
  label: string;
  reason: string;
}

interface ResultData {
  score: number;
  accuracy: number;
  total: number;
  xpEarned?: number;
  topic?: string;
  evaluation: {
    feedback: FeedbackItem[];
    improvement_suggestions?: string[];
    recommended_topics?: Recommendation[];
    mdn_links?: Record<string, string>;
    summary?: string;
    performance?: string;
    knowledgeState?: { mastery: number; trend: string };
  };
}

export default function ResultPage() {
  const { attemptId } = useParams();
  const [result, setResult] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const confettiRef = useRef(false);

  useEffect(() => {
    const stored = sessionStorage.getItem(`result_${attemptId}`);
    if (stored) setResult(JSON.parse(stored));
    setLoading(false);
  }, [attemptId]);

  // Confetti on pass
  useEffect(() => {
    if (!result || confettiRef.current) return;
    if (result.accuracy >= 60) {
      confettiRef.current = true;
      launchConfetti();
    }
  }, [result]);

  const launchConfetti = () => {
    const colors = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];
    const container = document.getElementById("confetti-container");
    if (!container) return;
    for (let i = 0; i < 80; i++) {
      const el = document.createElement("div");
      el.style.cssText = `
        position:absolute;
        width:${6 + Math.random() * 8}px;
        height:${6 + Math.random() * 8}px;
        background:${colors[Math.floor(Math.random() * colors.length)]};
        border-radius:${Math.random() > 0.5 ? "50%" : "2px"};
        left:${Math.random() * 100}%;
        top:-10px;
        opacity:1;
        animation: fall ${1.5 + Math.random() * 2}s ease-in forwards;
        animation-delay:${Math.random() * 0.8}s;
      `;
      container.appendChild(el);
    }
    setTimeout(() => { if (container) container.innerHTML = ""; }, 4000);
  };

  const shareScore = () => {
    if (!result) return;
    const text = `I scored ${result.score}/${result.total} (${result.accuracy}%) on the ${result.topic ?? "JavaScript"} quiz on JS Learn! 🎉`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (loading) return <p className="p-8">Loading results...</p>;

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow text-center">
          <p className="text-gray-600 mb-4">Result not found.</p>
          <Link href="/dashboard" className="text-indigo-600 underline">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  const { score, accuracy, total, xpEarned, evaluation } = result;
  const passed = accuracy >= 60;
  const levelInfo = xpEarned !== undefined ? getLevel(xpEarned) : null;

  return (
    <div className="min-h-screen bg-gray-100 p-8 relative overflow-hidden">
      {/* Confetti container */}
      <div id="confetti-container" className="fixed inset-0 pointer-events-none z-50" />

      <style>{`
        @keyframes fall {
          to { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>

      <div className="max-w-3xl mx-auto space-y-6">

        {/* Score Card */}
        <ScoreCard score={score} accuracy={accuracy} total={total} />

        {/* XP Earned Banner */}
        {xpEarned !== undefined && (
          <div className={`rounded-xl p-5 text-center shadow-md ${passed ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700"}`}>
            {passed ? (
              <>
                <p className="text-2xl font-bold">🎉 Great job!</p>
                <p className="text-lg mt-1">+{xpEarned} XP earned</p>
                {levelInfo && <p className="text-sm mt-1 opacity-80">You are now Level {levelInfo.level} — {levelInfo.title}</p>}
              </>
            ) : (
              <>
                <p className="text-xl font-bold">Keep going! 💪</p>
                <p className="mt-1">+{xpEarned} XP earned — try again to improve your score</p>
              </>
            )}
          </div>
        )}

        {/* AI Summary + Knowledge State */}
        {(evaluation.summary || evaluation.knowledgeState) && (
          <div className="bg-white rounded-xl shadow-md p-6 space-y-3">
            {evaluation.summary && <p className="text-gray-700">{evaluation.summary}</p>}
            {evaluation.knowledgeState && (
              <div className="flex items-center gap-6 pt-2 border-t">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Mastery</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${Math.round(evaluation.knowledgeState.mastery * 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-indigo-700">
                      {Math.round(evaluation.knowledgeState.mastery * 100)}%
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Trend</p>
                  <p className="text-sm font-medium mt-1">
                    {evaluation.knowledgeState.trend === "improving" ? "📈 Improving" :
                     evaluation.knowledgeState.trend === "declining" ? "📉 Declining" : "➡️ Stable"}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Per-question Feedback */}
        {evaluation.feedback?.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-bold mb-4">Question Review</h2>
            {evaluation.feedback.map((item, i) => {
              const correct = item.studentAnswer?.toUpperCase() === item.correctAnswer?.toUpperCase();
              return (
                <div key={i} className={`mb-4 p-4 rounded-lg border ${correct ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
                  <p className="font-semibold mb-1">{i + 1}. {item.question}</p>
                  <p className="text-sm text-gray-600">
                    Your answer: <span className={correct ? "text-green-700 font-medium" : "text-red-600 font-medium"}>
                      {item.studentAnswer} — {item.studentAnswerText || "—"}
                    </span>
                  </p>
                  {!correct && (
                    <p className="text-sm text-gray-600 mt-1">
                      Correct: <span className="text-green-700 font-medium">{item.correctAnswer} — {item.correctAnswerText}</span>
                    </p>
                  )}
                  {!correct && item.correctAnswerText && (
                    <p className="text-xs text-gray-500 mt-2 italic">
                      💡 The correct answer is <strong>{item.correctAnswerText}</strong>. Review this concept in the lesson before retrying.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Suggestions */}
        {(evaluation.improvement_suggestions?.length ?? 0) > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-bold mb-3">Suggestions</h2>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              {evaluation.improvement_suggestions!.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>
        )}

        {/* Recommended Topics */}
        {(evaluation.recommended_topics?.length ?? 0) > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-bold mb-3">Recommended Next Topics</h2>
            <div className="space-y-2">
              {evaluation.recommended_topics!.map((rec, i) => (
                <div key={i} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div>
                    <p className="font-semibold text-indigo-700">{rec.label}</p>
                    <p className="text-sm text-gray-500">{rec.reason}</p>
                    {evaluation.mdn_links?.[rec.topic] && (
                      <a href={evaluation.mdn_links[rec.topic]} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-blue-500 underline mt-1 inline-block">
                        Read on MDN →
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-4">
          <Link href="/dashboard"
            className="flex-1 text-center bg-indigo-600 text-white py-3 rounded-md font-semibold hover:bg-indigo-700">
            Back to Dashboard
          </Link>
          <button onClick={shareScore}
            className="flex-1 bg-white border border-indigo-600 text-indigo-600 py-3 rounded-md font-semibold hover:bg-indigo-50">
            {copied ? "✅ Copied!" : "📤 Share Score"}
          </button>
        </div>

      </div>
    </div>
  );
}
