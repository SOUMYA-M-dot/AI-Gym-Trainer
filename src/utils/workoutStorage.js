// src/utils/workoutStorage.js

const THEME_KEY = 'ai_gym_theme';
const AUTH_KEY = 'ai_gym_user';
const PAYMENT_KEY = 'ai_gym_membership_paid';
const WORKOUT_LOGS_KEY = 'ai_gym_workout_logs';
const PPL_DAY_KEY = 'ai_gym_ppl_day';

export const MET_VALUES = {
  PUSH_UP: 6.0,
  SHOULDER_PRESS: 4.5,
  LATERAL_RAISE: 3.5,
  BICEP_CURL: 3.8,
  HAMMER_CURL: 3.8,
  SQUAT: 5.5,
  LUNGE: 5.0,
  PLANK: 4.0,
  JUMPING_JACKS: 8.0,
};

export const DEFAULT_SPLIT_EXERCISES = {
  PUSH: ['PUSH_UP', 'SHOULDER_PRESS', 'LATERAL_RAISE'],
  PULL: ['BICEP_CURL', 'HAMMER_CURL'],
  LEGS: ['SQUAT', 'LUNGE', 'PLANK', 'JUMPING_JACKS'],
  ALL: ['PUSH_UP', 'BICEP_CURL', 'SQUAT', 'SHOULDER_PRESS', 'LATERAL_RAISE', 'LUNGE', 'PLANK', 'JUMPING_JACKS']
};

export function getStoredTheme() {
  if (typeof window === 'undefined') return 'dark';
  const saved = localStorage.getItem(THEME_KEY);
  if (saved) return saved;
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export function setStoredTheme(theme) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(THEME_KEY, theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}

export function getStoredUser() {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(AUTH_KEY);
  return data ? JSON.parse(data) : null;
}

export function setStoredUser(user) {
  if (typeof window !== 'undefined') {
    if (user) {
      localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_KEY);
    }
  }
}

export function getMembershipPaid() {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(PAYMENT_KEY) === 'true';
}

export function setMembershipPaid(isPaid) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(PAYMENT_KEY, isPaid ? 'true' : 'false');
  }
}

// PPL Split & Day Counter
export function getStoredDayPlan() {
  if (typeof window === 'undefined') {
    return { dayNumber: 1, split: 'PUSH', selectedExercises: DEFAULT_SPLIT_EXERCISES.PUSH };
  }
  const data = localStorage.getItem(PPL_DAY_KEY);
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {}
  }
  return { dayNumber: 1, split: 'PUSH', selectedExercises: DEFAULT_SPLIT_EXERCISES.PUSH };
}

export function saveStoredDayPlan(plan) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(PPL_DAY_KEY, JSON.stringify(plan));
  }
}

export function advanceToNextDayPlan() {
  const current = getStoredDayPlan();
  const nextDay = current.dayNumber + 1;
  let nextSplit = 'PUSH';
  if (current.split === 'PUSH') nextSplit = 'PULL';
  else if (current.split === 'PULL') nextSplit = 'LEGS';
  else nextSplit = 'PUSH';

  const newPlan = {
    dayNumber: nextDay,
    split: nextSplit,
    selectedExercises: DEFAULT_SPLIT_EXERCISES[nextSplit] || DEFAULT_SPLIT_EXERCISES.PUSH
  };
  saveStoredDayPlan(newPlan);
  return newPlan;
}

export function getWorkoutLogs() {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(WORKOUT_LOGS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveWorkoutSession(session) {
  if (typeof window === 'undefined') return;
  const existing = getWorkoutLogs();
  const updated = [
    {
      id: 'session_' + Date.now(),
      timestamp: new Date().toISOString(),
      ...session
    },
    ...existing
  ].slice(0, 50);

  localStorage.setItem(WORKOUT_LOGS_KEY, JSON.stringify(updated));
}

/**
 * Calculates calorie burn only when active exercise / reps are performed.
 */
export function estimateCalories(exerciseType, durationSeconds, reps = 0, weightKg = 70) {
  if (!reps || reps <= 0) return 0;
  const met = MET_VALUES[exerciseType] || 4.0;
  const durationHours = Math.min(durationSeconds, reps * 8) / 3600;
  const calories = (met * weightKg * durationHours * 0.5) + (reps * 0.38);
  return Math.max(0.1, Math.round(calories * 10) / 10);
}
