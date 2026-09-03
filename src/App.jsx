// src/App.jsx
import React, { useState, useRef, useEffect } from 'react';
import CameraFeed from './components/CameraFeed';
import Dashboard from './components/Dashboard';
import Chatbot from './components/Chatbot';
import AvatarCanvas from './components/AvatarCanvas';
import Auth from './components/Auth';
import PaymentModal from './components/PaymentModal';
import HistoryModal from './components/HistoryModal';
import { ExerciseEngine, EXERCISES, EXERCISE_DETAILS, PPL_SPLITS } from './utils/exerciseLogic';
import audioCoach from './utils/audioCoach';
import { 
  getStoredTheme, 
  setStoredTheme, 
  getStoredUser, 
  setStoredUser,
  getMembershipPaid,
  setMembershipPaid,
  getStoredDayPlan,
  saveStoredDayPlan,
  advanceToNextDayPlan,
  saveWorkoutSession,
  estimateCalories
} from './utils/workoutStorage';
import { 
  Dumbbell, 
  Sun, 
  Moon, 
  Volume2, 
  VolumeX, 
  Trophy, 
  LogOut, 
  Camera, 
  Box, 
  Columns3,
  Calendar
} from 'lucide-react';

function App() {
  const [theme, setTheme] = useState(() => getStoredTheme());
  const [user, setUser] = useState(() => getStoredUser());
  const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(getStoredUser()));
  const [isPaid, setIsPaid] = useState(() => getMembershipPaid());
  const [showPayment, setShowPayment] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // View modes: 'CAMERA', 'SPLIT', 'AVATAR_3D'
  const [viewMode, setViewMode] = useState('SPLIT');

  // PPL Day Plan & Progress
  const [dayPlan, setDayPlan] = useState(() => getStoredDayPlan());
  const [dayExerciseProgress, setDayExerciseProgress] = useState({}); // { [exId]: { reps, calories } }

  const [currentExercise, setCurrentExercise] = useState(() => {
    const initialPlan = getStoredDayPlan();
    return (initialPlan.selectedExercises && initialPlan.selectedExercises[0]) || EXERCISES.PUSH_UP;
  });

  const [stats, setStats] = useState({ 
    reps: 0, 
    state: 'WAITING', 
    feedback: [], 
    formScore: 'Good', 
    badJoints: [] 
  });
  const [pose3DLandmarks, setPose3DLandmarks] = useState([]);
  const [workoutSeconds, setWorkoutSeconds] = useState(0);

  // Engine Ref
  const engineRef = useRef(new ExerciseEngine(currentExercise));
  const previousRepsRef = useRef(0);

  // Apply Theme
  useEffect(() => {
    setStoredTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Workout Session Timer
  useEffect(() => {
    if (!isLoggedIn || !isPaid) return;
    const interval = setInterval(() => {
      setWorkoutSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isLoggedIn, isPaid]);

  // Handle Day Plan Updates
  const handleDayPlanChange = (updatedPlan) => {
    setDayPlan(updatedPlan);
    saveStoredDayPlan(updatedPlan);
  };

  // Switch Active Exercise in Circuit (preserving previous progress)
  const handleChangeExercise = (nextExercise) => {
    if (nextExercise === currentExercise) return;

    // Save current exercise progress
    const earnedCal = estimateCalories(currentExercise, workoutSeconds, stats.reps, 70);
    setDayExerciseProgress(prev => ({
      ...prev,
      [currentExercise]: {
        reps: (prev[currentExercise]?.reps || 0) + stats.reps,
        calories: (prev[currentExercise]?.calories || 0) + earnedCal
      }
    }));

    setCurrentExercise(nextExercise);
    engineRef.current = new ExerciseEngine(nextExercise);
    previousRepsRef.current = 0;
    setStats({ 
      reps: 0, 
      state: 'WAITING', 
      feedback: [], 
      formScore: 'Good', 
      badJoints: [] 
    });
  };

  // Audio Mute Toggle
  const toggleAudio = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    audioCoach.setMuted(nextMute);
  };

  // Process Live Pose Results
  const handlePoseResults = (results) => {
    if (results.poseLandmarks) {
      setPose3DLandmarks([...results.poseLandmarks]);

      const newStats = engineRef.current.processFrame(results.poseLandmarks);
      setStats({ ...newStats });

      // Trigger Audio Cues
      if (newStats.reps > previousRepsRef.current) {
        audioCoach.announceRep(newStats.reps);
        previousRepsRef.current = newStats.reps;
      } else if (newStats.formScore === 'Bad' && newStats.feedback.length > 0) {
        audioCoach.announceCorrection(newStats.feedback[0]);
      }
    } else {
      setPose3DLandmarks([]);
    }
  };

  // Complete Day Workout & Advance
  const handleCompleteDayWorkout = () => {
    const currentCal = estimateCalories(currentExercise, workoutSeconds, stats.reps, 70);
    const finalProgress = {
      ...dayExerciseProgress,
      [currentExercise]: {
        reps: (dayExerciseProgress[currentExercise]?.reps || 0) + stats.reps,
        calories: (dayExerciseProgress[currentExercise]?.calories || 0) + currentCal
      }
    };

    const totalDayReps = Object.values(finalProgress).reduce((sum, p) => sum + (p.reps || 0), 0);
    const totalDayCalories = Math.round(Object.values(finalProgress).reduce((sum, p) => sum + (p.calories || 0), 0) * 10) / 10;

    if (totalDayReps <= 0) {
      alert("Please perform at least 1 repetition before completing today's routine.");
      return;
    }

    saveWorkoutSession({
      dayNumber: dayPlan.dayNumber,
      split: dayPlan.split,
      totalReps: totalDayReps,
      totalCalories: totalDayCalories,
      durationSeconds: workoutSeconds,
      progress: finalProgress
    });

    const nextPlan = advanceToNextDayPlan();
    setDayPlan(nextPlan);
    setDayExerciseProgress({});
    setWorkoutSeconds(0);

    const nextFirstEx = nextPlan.selectedExercises[0] || EXERCISES.PUSH_UP;
    setCurrentExercise(nextFirstEx);
    engineRef.current = new ExerciseEngine(nextFirstEx);
    previousRepsRef.current = 0;
    setStats({ reps: 0, state: 'WAITING', feedback: [], formScore: 'Good', badJoints: [] });

    alert(`🎉 Day ${dayPlan.dayNumber} (${dayPlan.split} Day) Completed!\nTotal: ${totalDayReps} reps • ${totalDayCalories} kcal.\nAdvancing to Day ${nextPlan.dayNumber} (${nextPlan.split} Day)!`);
  };

  // Handle Logout
  const handleLogout = () => {
    setStoredUser(null);
    setUser(null);
    setIsLoggedIn(false);
  };

  // Auth Screen
  if (!isLoggedIn) {
    return (
      <Auth 
        onLogin={(userData) => {
          setUser(userData);
          setIsLoggedIn(true);
        }} 
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  // Membership Gate Screen
  if (!isPaid) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-6 relative transition-colors ${
        theme === 'dark' ? 'bg-zinc-950 text-white' : 'bg-slate-50 text-slate-900'
      }`}>
        <div className="absolute top-6 right-6">
          <button
            onClick={toggleTheme}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              theme === 'dark' 
                ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white' 
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-xs'
            }`}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        <div className="max-w-xl w-full text-center relative z-10">
          <div className="inline-block px-3.5 py-1 bg-sky-500/10 border border-sky-500/20 rounded-full text-sky-500 text-xs font-bold tracking-widest uppercase mb-4">
            Membership Access
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            Transform Your Training With Precision Push-Pull-Legs Tracking
          </h1>
          <p className={`text-base mb-8 max-w-md mx-auto ${theme === 'dark' ? 'text-zinc-400' : 'text-slate-600'}`}>
            Unlock real-time PPL split routines, 3D twin modeling, and personalized AI coaching for just ₹100.
          </p>
          
          <button 
            onClick={() => setShowPayment(true)}
            className="bg-sky-600 hover:bg-sky-500 active:scale-98 text-white font-bold text-base px-10 py-4 rounded-2xl transition-all shadow-lg cursor-pointer"
          >
            Unlock Full Access • ₹100
          </button>
          
          <p className={`mt-6 text-xs ${theme === 'dark' ? 'text-zinc-500' : 'text-slate-400'}`}>
            One-time activation • Lifetime athlete pass • No recurring fees
          </p>
        </div>

        {showPayment && (
          <PaymentModal 
            onPaymentSuccess={() => {
              setIsPaid(true);
              setShowPayment(false);
            }} 
            onClose={() => setShowPayment(false)} 
            theme={theme}
          />
        )}
      </div>
    );
  }

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen font-sans transition-colors flex flex-col ${
      isDark ? 'bg-zinc-950 text-white' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Top Navbar */}
      <header className={`px-6 py-3 border-b sticky top-0 z-30 flex items-center justify-between transition-colors ${
        isDark ? 'bg-zinc-900/90 border-zinc-800 backdrop-blur-md' : 'bg-white/90 border-slate-200 backdrop-blur-md'
      }`}>
        {/* Brand & User Greeting */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-600 flex items-center justify-center text-white shadow-sm font-black">
            <Dumbbell size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black tracking-tight leading-none">
                AI GYM TRAINER
              </h1>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                dayPlan.split === 'PUSH' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                dayPlan.split === 'PULL' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' :
                dayPlan.split === 'LEGS' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                'bg-purple-500/20 text-purple-400 border border-purple-500/30'
              }`}>
                Day {dayPlan.dayNumber}: {dayPlan.split} Day
              </span>
            </div>
            <p className={`text-[11px] font-medium mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
              Athlete: <span className="font-semibold">{user?.name || 'Athlete'}</span>
            </p>
          </div>
        </div>

        {/* View Mode Switcher Pills */}
        <div className={`hidden md:flex items-center p-1 rounded-xl border ${
          isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-100 border-slate-200'
        }`}>
          <button
            onClick={() => setViewMode('CAMERA')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'CAMERA'
                ? 'bg-sky-600 text-white shadow-xs'
                : isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Camera size={14} /> Camera Feed
          </button>
          <button
            onClick={() => setViewMode('SPLIT')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'SPLIT'
                ? 'bg-sky-600 text-white shadow-xs'
                : isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Columns3 size={14} /> Split View
          </button>
          <button
            onClick={() => setViewMode('AVATAR_3D')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'AVATAR_3D'
                ? 'bg-sky-600 text-white shadow-xs'
                : isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Box size={14} /> 3D Digital Twin
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Audio Voice Coach Toggle */}
          <button
            onClick={toggleAudio}
            title={isMuted ? 'Unmute Audio Coach' : 'Mute Audio Coach'}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              !isMuted 
                ? 'bg-sky-500/10 border-sky-500/30 text-sky-500' 
                : isDark 
                ? 'bg-zinc-800/80 border-zinc-700 text-zinc-400' 
                : 'bg-white border-slate-200 text-slate-500'
            }`}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          {/* Workout History / Analytics */}
          <button
            onClick={() => setShowHistory(true)}
            title="Workout Analytics & History"
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              isDark 
                ? 'bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:text-white' 
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Trophy size={18} />
          </button>

          {/* Light / Dark Theme Switcher */}
          <button
            onClick={toggleTheme}
            title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              isDark 
                ? 'bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:text-white' 
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            title="Sign Out"
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              isDark 
                ? 'bg-zinc-800/80 border-zinc-700 text-zinc-400 hover:text-rose-400' 
                : 'bg-white border-slate-200 text-slate-500 hover:text-rose-600'
            }`}
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Main Studio Body */}
      <main className="flex-1 p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 h-[calc(100vh-65px)] min-h-[650px] overflow-hidden">
        {/* Left Column: Metric Dashboard & Exercise Controls */}
        <div className="col-span-1 lg:col-span-3 h-full overflow-hidden flex flex-col">
          <Dashboard 
            stats={stats} 
            currentExercise={currentExercise}
            onChangeExercise={handleChangeExercise}
            workoutSeconds={workoutSeconds}
            dayPlan={dayPlan}
            onChangeDayPlan={handleDayPlanChange}
            dayExerciseProgress={dayExerciseProgress}
            onCompleteDayWorkout={handleCompleteDayWorkout}
            theme={theme}
          />
        </div>

        {/* Center Column: Live Camera & 3D Avatar Viewport */}
        <div className="col-span-1 lg:col-span-6 h-full flex flex-col gap-3 min-h-[450px]">
          <div className={`flex-1 h-full ${
            viewMode === 'SPLIT' 
              ? 'grid grid-cols-1 md:grid-cols-2 gap-3' 
              : 'relative w-full'
          }`}>
            {/* Camera Feed Viewport */}
            <div className={`h-full min-h-[240px] transition-all ${
              viewMode === 'AVATAR_3D' 
                ? 'absolute -left-[9999px] w-1 h-1 opacity-0 pointer-events-none' 
                : 'relative w-full'
            }`}>
              <CameraFeed 
                onPoseResults={handlePoseResults} 
                badJoints={stats.badJoints} 
                theme={theme}
              />
            </div>

            {/* 3D Digital Twin Viewport */}
            <div className={`h-full min-h-[240px] transition-all ${
              viewMode === 'CAMERA' 
                ? 'hidden' 
                : 'relative w-full'
            }`}>
              <AvatarCanvas landmarks={pose3DLandmarks} theme={theme} />
            </div>
          </div>
        </div>

        {/* Right Column: AI Coach Chatbot */}
        <div className="col-span-1 lg:col-span-3 h-full overflow-hidden">
          <Chatbot 
            latestPoseData={{ 
              exercise: currentExercise, 
              state: stats.state, 
              formScore: stats.formScore, 
              feedback: stats.feedback,
              split: dayPlan.split,
              dayNumber: dayPlan.dayNumber
            }} 
            theme={theme}
          />
        </div>
      </main>

      {/* History & Analytics Modal */}
      <HistoryModal 
        isOpen={showHistory} 
        onClose={() => setShowHistory(false)} 
        theme={theme}
      />
    </div>
  );
}

export default App;
