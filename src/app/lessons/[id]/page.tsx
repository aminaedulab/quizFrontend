"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Lesson {
  _id: string;
  title: string;
  topic: string;
  level: string;
  summaryContent: string;
}

export default function LessonPage() {
  const { id } = useParams();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
const [quiz, setQuiz] = useState<string | null>(null);
const [quizLoading, setQuizLoading] = useState(false);
  useEffect(() => {
    fetchLesson();
  }, []);

  const fetchLesson = async () => {
    try {
      const res = await fetch(
        `http://localhost:7000/v1/lesson/${id}`
      );
      const data = await res.json();
      setLesson(data.data);
    } catch (error) {
      console.error("Failed to fetch lesson");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="p-6">Loading lesson...</p>;
  if (!lesson) return <p className="p-6">Lesson not found</p>;


const generateQuiz = async () => {
  try {
    setQuizLoading(true);

    const res = await fetch(
      "http://localhost:8001/v1/generate-quiz",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: lesson?.summaryContent,
        }),
      }
    );

    const data = await res.json();
    setQuiz(data.quiz);
  } catch (err) {
    console.error("Quiz generation failed");
  } finally {
    setQuizLoading(false);
  }
};
  return (
    <div className="min-h-screen bg-gray-100 p-8">
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

     <button
  onClick={generateQuiz}
  className="mt-8 bg-indigo-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-indigo-700"
>
  {quizLoading ? "Generating..." : "Generate Quiz"}
</button>
      </div>
      {quiz && (
  <div className="mt-6 p-6 bg-gray-50 rounded-lg border">
    <h2 className="text-xl font-bold mb-4">Quiz</h2>
    <pre className="whitespace-pre-wrap text-gray-800">
      {quiz}
    </pre>
  </div>
)}
    </div>
  );
}
