"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import QuizQuestion from "@/components/QuizQuestion";
import SubmitButton from "@/components/SubmitButton";
import CodeBlock from "@/components/CodeBlock";
import ConceptChat from "@/components/ConceptChat";
import { recordAttempt } from "@/lib/progress";

interface Lesson {
  _id: string;
  title: string;
  topic: string;
  level: string;
  summaryContent: string;
  pdfUrl?: string;
}

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
  correctAnswerText: string;
  difficulty?: "easy" | "medium" | "hard";
}

interface RichSection {
  heading: string;
  body: string;
  codeSnippets: string[];
}

interface RichContent {
  title: string;
  intro: string;
  sections: RichSection[];
  keyPoints: string[];
  mdnUrl: string;
}

const QUIZ_TIME = 10 * 60;

export default function LessonPage() {
  const { id } = useParams();
  const router = useRouter();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [richContent, setRichContent] = useState<RichContent | null>(null);
  const [richLoading, setRichLoading] = useState(false);
  const [codeExamples, setCodeExamples] = useState<{ title: string; code: string; explanation: string }[]>([]);

  const [quiz, setQuiz] = useState<Question[] | null>(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<number, { label: string; text: string }>>({});

  // Active tab: "content" | "quiz"
  const [tab, setTab] = useState<"content" | "quiz">("content");

  // Timer
  const [timeLeft, setTimeLeft] = useState(QUIZ_TIME);
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetchLesson();
    fetchQuiz();
  }, []);

  useEffect(() => {
    if (quiz && !timerActive && tab === "quiz") {
      setTimeLeft(QUIZ_TIME);
      setTimerActive(true);
    }
  }, [quiz, tab]);

  useEffect(() => {
    if (!timerActive) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          toast.error("Time's up! Auto-submitting...");
          submitQuiz(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [timerActive]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const fetchLesson = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/lesson/${id}`);
      const l = res.data.data;
      setLesson(l);

      if (l?.topic && !l.pdfUrl) {
        // Load rich content + code examples in parallel
        setRichLoading(true);
        Promise.all([
          axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/lesson/topic-rich`, { topic: l.topic })
            .then((r) => r.data.success && setRichContent(r.data))
            .catch(() => {}),
          axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/lesson/code-examples`, { topic: l.topic })
            .then((r) => r.data.examples && setCodeExamples(r.data.examples))
            .catch(() => {}),
        ]).finally(() => setRichLoading(false));
      }
    } catch {
      toast.error("Failed to load lesson");
    } finally {
      setLoading(false);
    }
  };

  const fetchQuiz = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/lesson/${id}/quiz`);
      setQuiz(res.data.quiz);
    } catch { /* not generated yet */ }
  };

  const generateQuiz = async () => {
    try {
      setQuizLoading(true);
      setAnswers({});
      clearInterval(timerRef.current!);
      setTimerActive(false);

      const url = lesson?.pdfUrl
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/lesson/${id}/quiz`
        : `${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/lesson/${id}/generate-quiz-content`;

      const res = await axios.post(url);
      setQuiz(res.data.quiz);
      setTab("quiz");
      toast.success("Quiz ready");
    } catch {
      toast.error("Quiz generation failed");
    } finally {
      setQuizLoading(false);
    }
  };

  const handleAnswer = (qi: number, label: string, text: string) => {
    setAnswers((prev) => ({ ...prev, [qi]: { label, text } }));
  };

  const submitQuiz = async (autoSubmit = false) => {
    if (!quiz) return;
    clearInterval(timerRef.current!);
    setTimerActive(false);

    if (!autoSubmit) {
      const unanswered = quiz.findIndex((_, i) => !answers[i]);
      if (unanswered !== -1) { toast.error(`Answer question ${unanswered + 1} first`); return; }
    }

    const userId = localStorage.getItem("userId");
    if (!userId) { router.push("/login"); return; }

    const payload = quiz.map((q, i) => ({
      question: q.question,
      studentAnswer: answers[i]?.label ?? "",
      studentAnswerText: answers[i]?.text ?? "",
    }));

    try {
      setSubmitting(true);
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/lesson/${id}/submit-quiz`,
        { userId, answers: payload }
      );
      const xpEarned = recordAttempt(lesson?.topic ?? "", res.data.accuracy ?? 0);
      sessionStorage.setItem(`result_${res.data.attemptId}`, JSON.stringify({
        score: res.data.score, accuracy: res.data.accuracy, total: res.data.total,
        evaluation: res.data.evaluation, xpEarned, topic: lesson?.topic ?? "",
      }));
      toast.success("Submitted!");
      router.push(`/result/${res.data.attemptId}`);
    } catch {
      toast.error("Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="p-6 text-gray-500">Loading lesson...</p>;
  if (!lesson) return <p className="p-6">Lesson not found</p>;

  const timerColor = timeLeft < 60 ? "text-red-600" : timeLeft < 180 ? "text-yellow-600" : "text-green-600";

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b px-8 py-5 max-w-4xl mx-auto">
        <span className="text-xs font-semibold text-indigo-500 uppercase tracking-wide">
          {lesson.level} · {lesson.topic}
        </span>
        <h1 className="text-3xl font-bold mt-1">{lesson.title}</h1>

        {/* Tabs */}
        <div className="flex gap-1 mt-4">
          {(["content", "quiz"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-t-md text-sm font-semibold border-b-2 transition ${
                tab === t ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}>
              {t === "content" ? "📖 Lesson" : `🧠 Quiz${quiz ? ` (${quiz.length}Q)` : ""}`}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">

        {/* ── CONTENT TAB ── */}
        {tab === "content" && (
          <div className="space-y-6">

            {/* PDF lesson */}
            {lesson.pdfUrl && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="font-semibold mb-3 text-gray-800">📄 Lesson PDF</h3>
                <iframe
                  src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/uploads/quizsummary/${lesson.pdfUrl}`}
                  className="w-full h-[600px] border rounded-lg"
                />
                <p className="mt-4 text-gray-700 leading-relaxed whitespace-pre-line text-sm">
                  {lesson.summaryContent}
                </p>
              </div>
            )}

            {/* MDN rich content */}
            {!lesson.pdfUrl && (
              <>
                {richLoading && (
                  <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-400">
                    Loading full lesson content from MDN...
                  </div>
                )}

                {richContent && !richLoading && (
                  <>
                    {/* Intro */}
                    {richContent.intro && (
                      <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-lg font-bold mb-3 text-indigo-700">What is {richContent.title}?</h2>
                        <p className="text-gray-700 leading-relaxed">{richContent.intro}</p>
                      </div>
                    )}

                    {/* Key Points */}
                    {richContent.keyPoints?.length > 0 && (
                      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5">
                        <h2 className="text-sm font-bold text-indigo-700 uppercase tracking-wide mb-3">
                          🔑 Key Concepts
                        </h2>
                        <ul className="space-y-2">
                          {richContent.keyPoints.map((pt, i) => (
                            <li key={i} className="flex gap-2 text-sm text-gray-700">
                              <span className="text-indigo-400 mt-0.5">▸</span>
                              <span>{pt}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Sections */}
                    {richContent.sections.map((sec, i) => (
                      <div key={i} className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-lg font-bold mb-3 text-gray-800">{sec.heading}</h2>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">{sec.body}</p>

                        {sec.codeSnippets?.length > 0 && (
                          <div className="mt-4 space-y-3">
                            {sec.codeSnippets.map((snippet, j) => (
                              <CodeBlock
                                key={j}
                                title={`Example ${j + 1}`}
                                code={snippet}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}

                    {/* MDN link */}
                    <div className="text-center">
                      <a href={richContent.mdnUrl} target="_blank" rel="noopener noreferrer"
                        className="text-sm text-blue-500 underline">
                        Read full MDN documentation →
                      </a>
                    </div>
                  </>
                )}

                {/* Fallback: show stored summary if rich content failed */}
                {!richContent && !richLoading && lesson.summaryContent && (
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">{lesson.summaryContent}</p>
                  </div>
                )}
              </>
            )}

            {/* Curated Code Examples */}
            {codeExamples.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-lg font-bold mb-4">💻 Code Examples</h2>
                {codeExamples.map((ex, i) => (
                  <CodeBlock key={i} title={ex.title} code={ex.code} explanation={ex.explanation} />
                ))}
              </div>
            )}

            {/* AI Tutor */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <ConceptChat topic={lesson.topic} />
            </div>

            {/* Generate Quiz CTA */}
            <div className="text-center pb-4">
              <button onClick={generateQuiz} disabled={quizLoading}
                className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold text-lg hover:bg-indigo-700 disabled:opacity-50 shadow-md">
                {quizLoading ? "Generating Quiz..." : quiz ? "Retake Quiz →" : "Take the Quiz →"}
              </button>
              {quiz && (
                <button onClick={() => setTab("quiz")}
                  className="ml-4 text-indigo-600 underline text-sm">
                  Go to quiz
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── QUIZ TAB ── */}
        {tab === "quiz" && (
          <div className="space-y-4">
            {!quiz ? (
              <div className="bg-white rounded-xl shadow-md p-8 text-center">
                <p className="text-gray-500 mb-4">No quiz generated yet.</p>
                <button onClick={generateQuiz} disabled={quizLoading}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-indigo-700 disabled:opacity-50">
                  {quizLoading ? "Generating..." : "Generate Quiz"}
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Quiz — {lesson.title}</h2>
                  <div className={`text-lg font-mono font-bold ${timerColor}`}>
                    ⏱ {formatTime(timeLeft)}
                  </div>
                </div>

                {quiz.map((q, index) => (
                  <QuizQuestion
                    key={index}
                    index={index}
                    question={q.question}
                    options={q.options}
                    selected={answers[index]?.label}
                    difficulty={q.difficulty}
                    onSelect={(label, text) => handleAnswer(index, label, text)}
                  />
                ))}

                <div className="flex items-center justify-between mt-6">
                  <span className="text-sm text-gray-500">
                    {Object.keys(answers).length} / {quiz.length} answered
                  </span>
                  <SubmitButton
                    onClick={() => submitQuiz(false)}
                    loading={submitting}
                    disabled={Object.keys(answers).length < quiz.length}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
