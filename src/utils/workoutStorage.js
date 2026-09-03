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
  const token = localStorage.getItem('ai_gym_token');
  if (!token) {
    // If no JWT token is stored, user is not authenticated
    localStorage.removeItem(AUTH_KEY);
    return null;
  }
  
  // Check token expiration
  try {
    const base64Url = token.split('.')[1];
    if (base64Url) {
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(decodeURIComponent(
        atob(base64).split('').map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
      ));
      if (payload && payload.exp && payload.exp * 1000 <= Date.now()) {
        localStorage.removeItem('ai_gym_token');
        localStorage.removeItem(AUTH_KEY);
        return null;
      }
    }
  } catch (e) {
    // Invalid token format
    localStorage.removeItem('ai_gym_token');
    localStorage.removeItem(AUTH_KEY);
    return null;
  }

  const data = localStorage.getItem(AUTH_KEY);
  return data ? JSON.parse(data) : null;
}

export function setStoredUser(user) {
  if (typeof window !== 'undefined') {
    if (user) {
      localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_KEY);
      localStorage.removeItem('ai_gym_token');
    }
  }
}

const GUEST_USAGE_PREFIX = 'ai_gym_guest_used_';
const PAYMENT_DETAILS_KEY = 'ai_gym_payment_receipt';

export function getMembershipPaid(userEmail = null) {
  if (typeof window === 'undefined') return false;
  // Clear any legacy global payment flag from earlier testing
  try {
    localStorage.removeItem(PAYMENT_KEY);
  } catch (e) {}

  if (userEmail) {
    const userPaid = localStorage.getItem(`${PAYMENT_KEY}_${userEmail.trim().toLowerCase()}`);
    return userPaid === 'true';
  }
  return false;
}

export function setMembershipPaid(isPaid, userEmail = null, paymentDetails = null) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(PAYMENT_KEY);
    } catch (e) {}

    if (userEmail) {
      localStorage.setItem(`${PAYMENT_KEY}_${userEmail.trim().toLowerCase()}`, isPaid ? 'true' : 'false');
    }
    if (paymentDetails) {
      localStorage.setItem(PAYMENT_DETAILS_KEY, JSON.stringify({
        ...paymentDetails,
        timestamp: new Date().toISOString()
      }));
    }
  }
}

export function getLastPaymentDetails() {
  if (typeof window === 'undefined') return null;
  const saved = localStorage.getItem(PAYMENT_DETAILS_KEY);
  return saved ? JSON.parse(saved) : null;
}

/**
 * Returns true if the user (or global guest) has already used their 1 free workout trial.
 */
export function hasUsedGuestSession(userEmail = null) {
  if (typeof window === 'undefined') return false;
  // If user has already paid, guest check is irrelevant (they have full access)
  if (getMembershipPaid(userEmail)) return false;

  if (userEmail) {
    const emailKey = `${GUEST_USAGE_PREFIX}${userEmail.trim().toLowerCase()}`;
    if (localStorage.getItem(emailKey) === 'true') return true;
  }
  return localStorage.getItem(`${GUEST_USAGE_PREFIX}global`) === 'true';
}

/**
 * Marks the guest trial as consumed (max 1 time).
 */
export function markGuestSessionUsed(userEmail = null) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(`${GUEST_USAGE_PREFIX}global`, 'true');
    if (userEmail) {
      localStorage.setItem(`${GUEST_USAGE_PREFIX}${userEmail.trim().toLowerCase()}`, 'true');
    }
  }
}

/**
 * Number of guest sessions remaining: 1 if never used, 0 if used.
 */
export function getGuestSessionsRemaining(userEmail = null) {
  return hasUsedGuestSession(userEmail) ? 0 : 1;
}

/**
 * Reset guest session status (for testing purposes).
 */
export function resetGuestSession(userEmail = null) {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(`${GUEST_USAGE_PREFIX}global`);
    if (userEmail) {
      localStorage.removeItem(`${GUEST_USAGE_PREFIX}${userEmail.trim().toLowerCase()}`);
    }
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
