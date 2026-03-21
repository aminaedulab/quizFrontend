"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";

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
}

export default function LessonPage() {
  const { id } = useParams();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState<Question[] | null>(null);
  const [quizLoading, setQuizLoading] = useState(false);

useEffect(() => {
  fetchLesson();
  fetchQuiz();
}, []);
const fetchQuiz = async () => {
  try {

    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/lesson/${id}/quiz`
    );

    setQuiz(res.data.quiz);

  } catch {
    console.log("Quiz not generated yet");
  }
};
  const fetchLesson = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/lesson/${id}`
      );
console.log('esson.pdfUrl',res.data.data)
      setLesson(res.data.data);
    } catch {
      toast.error("Failed to load lesson");
    } finally {
      setLoading(false);
    }
  };

  const generateQuiz = async () => {
    try {
      setQuizLoading(true);

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/lesson/${id}/quiz`
      );
   await fetchQuiz();
      setQuiz(res.data.quiz);
      toast.success("Quiz generated");
    } catch {
      toast.error("Quiz generation failed");
    } finally {
      setQuizLoading(false);
    }
  };

  if (loading) return <p className="p-6">Loading lesson...</p>;
  if (!lesson) return <p className="p-6">Lesson not found</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">

      {/* Lesson Card */}
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-8">

        <span className="text-sm text-indigo-600 font-semibold">
          {lesson.level} · {lesson.topic}
        </span>

        <h1 className="text-3xl font-bold mt-2 mb-4">
          {lesson.title}
        </h1>

        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
          {lesson.summaryContent}
        </p>

        {/* View PDF */}
        {lesson.pdfUrl && (
          <a
            href={`${process.env.NEXT_PUBLIC_BACKEND_URL}/uploads/quizsummary/${lesson.pdfUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-4 text-indigo-600 font-semibold"
          >
            📄 View Lesson PDF
          </a>
        )}

        {/* Generate Quiz */}
        <button
          onClick={generateQuiz}
          className="mt-8 bg-indigo-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-indigo-700"
        >
          {quizLoading ? "Generating..." : "Generate Quiz"}
        </button>

      </div>

      {/* Quiz Section */}
      {quiz && (
        <div className="max-w-3xl mx-auto mt-6 p-6 bg-white rounded-xl shadow-md">

          <h2 className="text-xl font-bold mb-6">
            Quiz
          </h2>

          {quiz.map((q, index) => (
            <div
              key={index}
              className="mb-6 p-4 border rounded-lg"
            >

              <p className="font-semibold mb-3">
                {index + 1}. {q.question}
              </p>

              <div className="space-y-2">
                {q.options.map((opt, i) => (
                  <label key={i} className="block cursor-pointer">
                    <input
                      type="radio"
                      name={`q-${index}`}
                      className="mr-2"
                    />
                    {opt}
                  </label>
                ))}
              </div>

            </div>
          ))}

        </div>
      )}

    </div>
  );
}