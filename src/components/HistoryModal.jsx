// src/components/HistoryModal.jsx
import React from 'react';
import { X, Calendar, Dumbbell, Flame, Timer, Trophy, Trash2, Layers } from 'lucide-react';
import { getWorkoutLogs } from '../utils/workoutStorage';
import { EXERCISE_DETAILS } from '../utils/exerciseLogic';

const HistoryModal = ({ isOpen, onClose, theme = 'dark' }) => {
  if (!isOpen) return null;

  const isDark = theme === 'dark';
  const logs = getWorkoutLogs();

  const totalReps = logs.reduce((acc, log) => acc + (log.totalReps || log.reps || 0), 0);
  const totalCalories = logs.reduce((acc, log) => acc + (log.totalCalories || log.calories || 0), 0);
  const totalMinutes = Math.round(logs.reduce((acc, log) => acc + (log.durationSeconds || 0), 0) / 60);

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear workout history?')) {
      localStorage.removeItem('ai_gym_workout_logs');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose}></div>

      <div className={`w-full max-w-xl max-h-[85vh] rounded-3xl border shadow-2xl relative z-10 flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200 ${
        isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Header */}
        <div className={`p-6 border-b flex items-center justify-between ${
          isDark ? 'border-zinc-800' : 'border-slate-200'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-500">
              <Trophy size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Workout Analytics & History</h2>
              <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                Track your consistency and performance across Push, Pull & Legs
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-zinc-400 hover:text-white transition-colors cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* Aggregate Stats Cards */}
        <div className="grid grid-cols-3 gap-3 p-6 pb-2">
          <div className={`p-4 rounded-2xl border flex flex-col ${
            isDark ? 'bg-zinc-950/60 border-zinc-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <span className="text-xs font-semibold text-sky-500 flex items-center gap-1">
              <Dumbbell size={14} /> Total Reps
            </span>
            <span className="text-2xl font-black font-mono mt-1">{totalReps}</span>
          </div>

          <div className={`p-4 rounded-2xl border flex flex-col ${
            isDark ? 'bg-zinc-950/60 border-zinc-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <span className="text-xs font-semibold text-orange-500 flex items-center gap-1">
              <Flame size={14} /> Calories Burned
            </span>
            <span className="text-2xl font-black font-mono mt-1">{Math.round(totalCalories)} <span className="text-xs font-normal">kcal</span></span>
          </div>

          <div className={`p-4 rounded-2xl border flex flex-col ${
            isDark ? 'bg-zinc-950/60 border-zinc-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <span className="text-xs font-semibold text-indigo-400 flex items-center gap-1">
              <Timer size={14} /> Active Time
            </span>
            <span className="text-2xl font-black font-mono mt-1">{totalMinutes} <span className="text-xs font-normal">mins</span></span>
          </div>
        </div>

        {/* Session Log List */}
        <div className="p-6 flex-1 overflow-y-auto flex flex-col gap-3">
          <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
            Recent Workout Sessions ({logs.length})
          </h3>

          {logs.length === 0 ? (
            <div className={`text-center py-10 rounded-2xl border border-dashed ${
              isDark ? 'border-zinc-800 text-zinc-500' : 'border-slate-300 text-slate-400'
            }`}>
              <Dumbbell size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">No workout sessions logged yet.</p>
              <p className="text-xs mt-1">Complete your day routine and click "Complete Day & Advance" to record your progress.</p>
            </div>
          ) : (
            logs.map((log) => {
              const isDaySummary = Boolean(log.dayNumber);
              const splitTag = log.split || 'CUSTOM';
              const title = isDaySummary ? `Day ${log.dayNumber} - ${splitTag} Routine` : (EXERCISE_DETAILS[log.exerciseType]?.name || log.exerciseType);
              const repsCount = log.totalReps || log.reps || 0;
              const caloriesCount = Math.round((log.totalCalories || log.calories || 0) * 10) / 10;
              
              const dateStr = new Date(log.timestamp).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div 
                  key={log.id} 
                  className={`p-4 rounded-2xl border flex items-center justify-between ${
                    isDark ? 'bg-zinc-950/40 border-zinc-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center font-bold">
                      {isDaySummary ? <Layers size={18} /> : <Dumbbell size={18} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold">{title}</h4>
                        {isDaySummary && (
                          <span className={`text-[10px] font-bold px-2 py-0.2 rounded-md ${
                            splitTag === 'PUSH' ? 'bg-orange-500/20 text-orange-400' :
                            splitTag === 'PULL' ? 'bg-sky-500/20 text-sky-400' :
                            splitTag === 'LEGS' ? 'bg-emerald-500/20 text-emerald-400' :
                            'bg-purple-500/20 text-purple-400'
                          }`}>
                            {splitTag}
                          </span>
                        )}
                      </div>
                      <div className={`flex items-center gap-2 text-xs mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                        <span>{dateStr}</span>
                        <span>•</span>
                        <span>{log.durationSeconds || 0}s duration</span>
                        <span>•</span>
                        <span>{caloriesCount} kcal</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-black font-mono text-sky-500">
                      {repsCount} reps
                    </div>
                    <div className="text-xs font-semibold text-emerald-500">
                      Completed
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {logs.length > 0 && (
          <div className={`p-4 border-t flex justify-end ${isDark ? 'border-zinc-800 bg-zinc-950' : 'border-slate-200 bg-slate-50'}`}>
            <button
              onClick={clearHistory}
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1.5 py-1.5 px-3 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
            >
              <Trash2 size={14} /> Clear Workout History
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryModal;
