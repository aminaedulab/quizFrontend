const API_BASE = "http://localhost:7000/api";

export const fetchLessons = async () => {
  const res = await fetch(`${API_BASE}/lessons`);
  return res.json();
};

export const fetchQuizByLesson = async (lessonId: string) => {
  const res = await fetch(`${API_BASE}/quiz/${lessonId}`);
  return res.json();
};

export const submitQuiz = async (data: any) => {
  const res = await fetch(`${API_BASE}/quiz/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};
