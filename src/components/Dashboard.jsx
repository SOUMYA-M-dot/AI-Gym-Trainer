// src/components/Dashboard.jsx
import React, { useState } from 'react';
import { 
  Dumbbell, 
  Flame, 
  Timer, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  Plus
} from 'lucide-react';
import { EXERCISES, EXERCISE_DETAILS, PPL_SPLITS } from '../utils/exerciseLogic';
import { estimateCalories, DEFAULT_SPLIT_EXERCISES } from '../utils/workoutStorage';

const Dashboard = ({ 
  stats, 
  currentExercise, 
  onChangeExercise, 
  workoutSeconds, 
  dayPlan,
  onChangeDayPlan,
  dayExerciseProgress, // { [exerciseId]: { reps: number, calories: number } }
  onCompleteDayWorkout,
  theme = 'dark' 
}) => {
  const isDark = theme === 'dark';
  const exerciseDetail = EXERCISE_DETAILS[currentExercise] || EXERCISE_DETAILS.BICEP_CURL;

  const formScore = stats?.formScore || 'Good';
  const feedback = stats?.feedback || [];
  const currentReps = stats?.reps || 0;
  const isPlank = currentExercise === EXERCISES.PLANK;

  // Calculate cumulative day stats
  const totalDayReps = Object.values(dayExerciseProgress || {}).reduce((sum, p) => sum + (p.reps || 0), 0) + currentReps;
  const totalDayCalories = Math.round((Object.values(dayExerciseProgress || {}).reduce((sum, p) => sum + (p.calories || 0), 0) + estimateCalories(currentExercise, workoutSeconds, currentReps, 70)) * 10) / 10;

  const formatTimer = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Switch PPL split
  const handleSplitChange = (newSplit) => {
    const defaultExList = DEFAULT_SPLIT_EXERCISES[newSplit] || DEFAULT_SPLIT_EXERCISES.PUSH;
    onChangeDayPlan({
      ...dayPlan,
      split: newSplit,
      selectedExercises: defaultExList
    });
    if (defaultExList.length > 0 && !defaultExList.includes(currentExercise)) {
      onChangeExercise(defaultExList[0]);
    }
  };

  // Toggle exercise in today's routine
  const toggleExerciseSelection = (exId) => {
    const currentList = dayPlan?.selectedExercises || [];
    let updated;
    if (currentList.includes(exId)) {
      if (currentList.length === 1) return; // keep at least 1
      updated = currentList.filter(id => id !== exId);
    } else {
      updated = [...currentList, exId];
    }
    onChangeDayPlan({
      ...dayPlan,
      selectedExercises: updated
    });
  };

  // Filter available exercises for the active split
  const availableExercisesForSplit = Object.values(EXERCISES).filter(exKey => {
    if (dayPlan?.split === PPL_SPLITS.ALL) return true;
    return EXERCISE_DETAILS[exKey]?.split === dayPlan?.split;
  });

  return (
    <div className="flex flex-col gap-3.5 w-full h-full overflow-y-auto pr-1">
      {/* PPL Day & Split Selector Banner */}
      <div className={`p-4 rounded-2xl border transition-all ${
        isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-sky-500 uppercase tracking-wider">
            <Calendar size={14} />
            Day {dayPlan?.dayNumber || 1} Routine
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-semibold text-zinc-400">Day Count:</span>
            <input 
              type="number" 
              min="1" 
              max="365"
              value={dayPlan?.dayNumber || 1}
              onChange={(e) => onChangeDayPlan({ ...dayPlan, dayNumber: Math.max(1, parseInt(e.target.value) || 1) })}
              className={`w-12 text-center text-xs font-bold py-0.5 px-1 rounded-lg border outline-hidden ${
                isDark ? 'bg-zinc-950 border-zinc-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>
        </div>

        {/* PPL Split Selector Tabs */}
        <div className={`grid grid-cols-4 gap-1 p-1 rounded-xl border ${
          isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-100 border-slate-200'
        }`}>
          {['PUSH', 'PULL', 'LEGS', 'ALL'].map((splitKey) => {
            const isActive = dayPlan?.split === splitKey;
            return (
              <button
                key={splitKey}
                onClick={() => handleSplitChange(splitKey)}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer text-center ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-xs'
                    : isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {splitKey === 'ALL' ? 'Custom' : splitKey}
              </button>
            );
          })}
        </div>

        {/* Exercises in Today's Circuit */}
        <div className="mt-3">
          <div className="text-[11px] font-semibold text-zinc-400 mb-1.5 flex items-center justify-between">
            <span>Today's Exercises:</span>
            <span className="text-sky-500 font-bold">{dayPlan?.selectedExercises?.length || 0} selected</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {availableExercisesForSplit.map((exKey) => {
              const isSelected = (dayPlan?.selectedExercises || []).includes(exKey);
              const isCurrent = currentExercise === exKey;
              const name = EXERCISE_DETAILS[exKey]?.name || exKey;

              return (
                <button
                  key={exKey}
                  onClick={() => {
                    if (!isSelected) toggleExerciseSelection(exKey);
                    onChangeExercise(exKey);
                  }}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                    isCurrent
                      ? 'bg-sky-500/20 border-sky-500 text-sky-400 font-bold'
                      : isSelected
                      ? isDark 
                        ? 'bg-zinc-800/90 border-zinc-700 text-zinc-200 hover:border-sky-500' 
                        : 'bg-white border-slate-300 text-slate-700 hover:border-sky-500'
                      : isDark
                      ? 'bg-zinc-950/40 border-zinc-850 text-zinc-500 hover:text-zinc-300'
                      : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-700'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-sky-500' : 'bg-transparent border border-zinc-500'}`}></span>
                  {name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active Exercise Live Rep Counter Card */}
      <div className={`p-5 rounded-2xl border flex flex-col items-center justify-center transition-all ${
        isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className="w-full flex items-center justify-between mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-500 flex items-center gap-1">
            <Dumbbell size={14} /> {exerciseDetail.name}
          </span>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
            isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-slate-100 text-slate-700'
          }`}>
            {exerciseDetail.category}
          </span>
        </div>

        <div className="text-5xl font-black tracking-tight font-mono my-2 text-sky-500">
          {isPlank ? `${currentReps}s` : currentReps}
        </div>

        <div className={`px-3 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5 ${
          stats.state === 'DOWN' || stats.state === 'HOLDING'
            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
            : stats.state === 'UP' || stats.state === 'MID'
            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
            : isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-slate-100 text-slate-500'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${
            stats.state === 'DOWN' || stats.state === 'HOLDING' ? 'bg-amber-500' :
            stats.state === 'UP' || stats.state === 'MID' ? 'bg-emerald-500' : 'bg-zinc-400'
          }`}></span>
          Phase: {stats.state || 'READY'}
        </div>
      </div>

      {/* Cumulative Day Metrics Row: Total Calories & Day Reps */}
      <div className="grid grid-cols-3 gap-2">
        <div className={`p-3 rounded-xl border flex flex-col justify-between ${
          isDark ? 'bg-zinc-900/80 border-zinc-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center gap-1 text-[11px] font-medium text-sky-500">
            <Layers size={13} /> Day Reps
          </div>
          <div className={`text-lg font-bold font-mono mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {totalDayReps}
          </div>
        </div>

        <div className={`p-3 rounded-xl border flex flex-col justify-between ${
          isDark ? 'bg-zinc-900/80 border-zinc-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center gap-1 text-[11px] font-medium text-orange-500">
            <Flame size={13} /> Day kcal
          </div>
          <div className={`text-lg font-bold font-mono mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {totalDayCalories}
          </div>
        </div>

        <div className={`p-3 rounded-xl border flex flex-col justify-between ${
          isDark ? 'bg-zinc-900/80 border-zinc-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center gap-1 text-[11px] font-medium text-indigo-400">
            <Timer size={13} /> Time
          </div>
          <div className={`text-lg font-bold font-mono mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {formatTimer(workoutSeconds)}
          </div>
        </div>
      </div>

      {/* Form Status & Feedback Card */}
      <div className={`p-3.5 rounded-2xl border transition-all ${
        formScore === 'Excellent'
          ? isDark ? 'bg-emerald-950/20 border-emerald-800/40' : 'bg-emerald-50/70 border-emerald-200'
          : formScore === 'Good'
          ? isDark ? 'bg-amber-950/20 border-amber-800/40' : 'bg-amber-50/70 border-amber-200'
          : isDark ? 'bg-rose-950/20 border-rose-800/40' : 'bg-rose-50/70 border-rose-200'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            {formScore === 'Excellent' && <CheckCircle2 size={16} className="text-emerald-500" />}
            {formScore === 'Good' && <AlertTriangle size={16} className="text-amber-500" />}
            {formScore === 'Bad' && <XCircle size={16} className="text-rose-500" />}
            <span className={`text-xs font-bold ${
              formScore === 'Excellent' ? 'text-emerald-500' :
              formScore === 'Good' ? 'text-amber-500' : 'text-rose-500'
            }`}>
              Form: {formScore}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          {feedback.map((msg, idx) => (
            <div 
              key={idx} 
              className={`text-xs py-1.5 px-2.5 rounded-lg font-medium leading-normal ${
                isDark ? 'bg-zinc-950/70 text-zinc-300' : 'bg-white text-slate-700 shadow-2xs'
              }`}
            >
              {msg}
            </div>
          ))}
        </div>
      </div>

      {/* Action Button: Complete Day Workout & Advance */}
      <button
        onClick={onCompleteDayWorkout}
        className="w-full mt-auto py-3 px-4 rounded-xl font-bold text-xs bg-sky-600 hover:bg-sky-500 active:scale-98 text-white transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
      >
        <Sparkles size={15} /> Complete Day {dayPlan?.dayNumber || 1} & Advance
      </button>
    </div>
  );
};

export default Dashboard;
