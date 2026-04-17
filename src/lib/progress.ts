// ── Client-side progress & gamification store ──────────────────────────────
// Stored in localStorage so it persists across sessions without a backend change

export interface TopicProgress {
  topic: string;
  completed: boolean;
  accuracy: number;
  xp: number;
  completedAt?: string;
}

export interface UserProgress {
  xp: number;
  streak: number;
  lastActiveDate: string; // ISO date string YYYY-MM-DD
  topics: Record<string, TopicProgress>;
}

const KEY = "jslearn_progress";

function today(): string {
  return new Date().toISOString().split("T")[0];
}

export function getProgress(): UserProgress {
  if (typeof window === "undefined") return defaultProgress();
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : defaultProgress();
  } catch {
    return defaultProgress();
  }
}

function defaultProgress(): UserProgress {
  return { xp: 0, streak: 0, lastActiveDate: "", topics: {} };
}

function save(p: UserProgress) {
  localStorage.setItem(KEY, JSON.stringify(p));
}

/** Call after a quiz is submitted. Returns XP earned. */
export function recordAttempt(topic: string, accuracy: number): number {
  const p = getProgress();

  // XP formula: base 10 + accuracy bonus + streak bonus
  const base = 10;
  const accBonus = Math.round(accuracy / 10); // 0–10
  const streakBonus = Math.min(p.streak * 2, 20); // up to 20
  const xpEarned = base + accBonus + streakBonus;

  // Update streak
  const t = today();
  if (p.lastActiveDate === t) {
    // already active today — no change
  } else if (p.lastActiveDate === getPreviousDay(t)) {
    p.streak += 1;
  } else {
    p.streak = 1; // reset
  }
  p.lastActiveDate = t;

  // Update XP
  p.xp += xpEarned;

  // Update topic
  const existing = p.topics[topic];
  if (!existing || accuracy > existing.accuracy) {
    p.topics[topic] = {
      topic,
      completed: accuracy >= 60,
      accuracy,
      xp: xpEarned,
      completedAt: accuracy >= 60 ? new Date().toISOString() : undefined,
    };
  }

  save(p);
  return xpEarned;
}

export function getLevel(xp: number): {
  level: number;
  title: string;
  nextXp: number;
  progress: number;
} {
  const thresholds = [0, 50, 150, 300, 500, 750, 1100, 1500, 2000, 2600, 3300];
  const titles = [
    "Newbie",
    "Curious",
    "Explorer",
    "Learner",
    "Coder",
    "Developer",
    "Engineer",
    "Expert",
    "Master",
    "Guru",
    "Legend",
  ];

  let lvl = 0;
  for (let i = 0; i < thresholds.length; i++) {
    if (xp >= thresholds[i]) lvl = i;
  }

  const nextXp = thresholds[lvl + 1] ?? thresholds[thresholds.length - 1];
  const prevXp = thresholds[lvl];
  const progress = Math.min(
    Math.round(((xp - prevXp) / (nextXp - prevXp)) * 100),
    100,
  );

  return { level: lvl + 1, title: titles[lvl], nextXp, progress };
}

function getPreviousDay(dateStr: string): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

export function getCompletedTopics(): string[] {
  const p = getProgress();
  return Object.values(p.topics)
    .filter((t) => t.completed)
    .map((t) => t.topic);
}
