// src/components/AccessGate.jsx
import React, { useState } from 'react';
import { 
  Dumbbell, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Lock, 
  Zap, 
  CreditCard, 
  LogOut, 
  Sun, 
  Moon, 
  ArrowRight,
  Clock,
  UserCheck
} from 'lucide-react';
import { hasUsedGuestSession, getGuestSessionsRemaining } from '../utils/workoutStorage';
import PaymentModal from './PaymentModal';

const AccessGate = ({ 
  user, 
  onStartGuestSession, 
  onPaymentSuccess, 
  onLogout, 
  theme = 'dark', 
  onToggleTheme 
}) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const isDark = theme === 'dark';

  const guestUsed = hasUsedGuestSession(user?.email);
  const guestSessionsRemaining = getGuestSessionsRemaining(user?.email);

  return (
    <div className={`min-h-screen flex flex-col transition-colors ${
      isDark ? 'bg-zinc-950 text-white' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Navigation Top Bar */}
      <header className={`px-6 py-4 border-b flex items-center justify-between transition-colors ${
        isDark ? 'bg-zinc-900/80 border-zinc-800' : 'bg-white/90 border-slate-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-600 flex items-center justify-center text-white shadow-md">
            <Dumbbell size={22} />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight leading-none">AI GYM TRAINER</h1>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
              Athlete: <span className="font-semibold">{user?.name || user?.email?.split('@')[0] || 'Athlete'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onToggleTheme}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              isDark 
                ? 'bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:text-white' 
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-xs'
            }`}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          <button
            onClick={onLogout}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              isDark 
                ? 'bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:text-rose-400 hover:border-rose-500/40' 
                : 'bg-white border-slate-200 text-slate-700 hover:text-rose-600 shadow-xs'
            }`}
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Choice Screen */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-10 max-w-5xl mx-auto w-full">
        {/* Header Heading */}
        <div className="text-center max-w-2xl mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold tracking-wider uppercase mb-3 bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Sparkles size={14} /> Choose Your Access Mode
          </div>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-3">
            Welcome to Your AI Gym Studio
          </h2>
          <p className={`text-sm md:text-base leading-relaxed ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
            Experience real-time computer vision pose analysis, 3D Digital Twin modeling, and intelligent voice-guided coaching. Choose how you'd like to proceed:
          </p>
        </div>

        {/* Dual Choice Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
          {/* Card 1: Use as a Guest */}
          <div className={`rounded-3xl border p-7 flex flex-col justify-between transition-all relative overflow-hidden ${
            isDark 
              ? guestUsed 
                ? 'bg-zinc-900/40 border-zinc-800/60 opacity-80' 
                : 'bg-zinc-900/90 border-zinc-800 hover:border-zinc-700 shadow-xl' 
              : guestUsed 
                ? 'bg-slate-100/70 border-slate-200 opacity-80' 
                : 'bg-white border-slate-200 hover:border-slate-300 shadow-lg'
          }`}>
            {/* Status Pill */}
            <div className="flex items-center justify-between mb-4">
              <span className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 ${
                guestUsed
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              }`}>
                {guestUsed ? (
                  <>
                    <XCircle size={13} />
                    Trial Used (0 Sessions Left)
                  </>
                ) : (
                  <>
                    <Clock size={13} />
                    1-Time Free Workout Trial
                  </>
                )}
              </span>

              <span className={`text-xs font-mono font-semibold ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
                Free Pass
              </span>
            </div>

            <div>
              <h3 className="text-2xl font-black mb-2 flex items-center gap-2">
                Use as a Guest
              </h3>
              <p className={`text-xs leading-relaxed mb-6 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                Try 1 complete AI-guided workout session with live pose estimation, form scoring, and audio cues before deciding.
              </p>

              {/* Feature Checklist */}
              <div className="space-y-2.5 mb-6 text-xs">
                <div className={`flex items-center gap-2.5 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                  <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                  <span>1 Full Workout Routine (Push, Pull, or Legs)</span>
                </div>
                <div className={`flex items-center gap-2.5 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                  <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                  <span>Real-time Rep Counter & Biomechanics Analysis</span>
                </div>
                <div className={`flex items-center gap-2.5 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                  <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                  <span>3D Digital Twin & Live Audio Coach</span>
                </div>
                <div className={`flex items-center gap-2.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                  <Lock size={15} className="text-zinc-500 shrink-0" />
                  <span className="italic">Strict limit: 1 workout session only</span>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="mt-4 pt-4 border-t border-dashed border-zinc-800 dark:border-zinc-800">
              {guestUsed ? (
                <div className="space-y-2">
                  <button
                    disabled
                    className="w-full py-3.5 px-4 rounded-xl font-bold text-xs bg-zinc-800 text-zinc-500 cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Lock size={15} /> Free Trial Already Used
                  </button>
                  <p className="text-[11px] text-center text-rose-400/90 font-medium">
                    You've already used your 1 free session. Please upgrade below to continue.
                  </p>
                </div>
              ) : (
                <button
                  onClick={onStartGuestSession}
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-xs bg-zinc-800 hover:bg-zinc-700 active:scale-98 text-white border border-zinc-700 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Start 1-Time Free Workout</span>
                  <ArrowRight size={15} />
                </button>
              )}
            </div>
          </div>

          {/* Card 2: Lifetime Athlete Pass (Razorpay Payment) */}
          <div className={`rounded-3xl border p-7 flex flex-col justify-between transition-all relative overflow-hidden ${
            isDark 
              ? 'bg-gradient-to-b from-sky-950/40 via-zinc-900/90 to-zinc-900 border-sky-500/40 shadow-2xl shadow-sky-950/30' 
              : 'bg-gradient-to-b from-sky-50/60 via-white to-white border-sky-300 shadow-xl'
          }`}>
            {/* Top Glow Ribbon */}
            <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-sky-500 via-indigo-500 to-sky-400"></div>

            {/* Status Pill */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 bg-sky-500/20 text-sky-400 border border-sky-500/40">
                <Zap size={13} className="text-sky-400" />
                Recommended • Lifetime Pass
              </span>

              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-sky-500 font-mono">₹100</span>
                <span className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>one-time</span>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-black mb-2 flex items-center gap-2">
                Lifetime Athlete Pass
              </h3>
              <p className={`text-xs leading-relaxed mb-6 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                Complete unrestricted access to all 8 routines, daily progressive split counter, 3D Twin, and AI chat.
              </p>

              {/* Feature Checklist */}
              <div className="space-y-2.5 mb-6 text-xs">
                <div className={`flex items-center gap-2.5 ${isDark ? 'text-zinc-200' : 'text-slate-800'} font-medium`}>
                  <CheckCircle2 size={15} className="text-sky-400 shrink-0" />
                  <span>Unlimited workouts • No session caps</span>
                </div>
                <div className={`flex items-center gap-2.5 ${isDark ? 'text-zinc-200' : 'text-slate-800'} font-medium`}>
                  <CheckCircle2 size={15} className="text-sky-400 shrink-0" />
                  <span>All 8 exercises (Push-ups, Squats, Biceps, Planks...)</span>
                </div>
                <div className={`flex items-center gap-2.5 ${isDark ? 'text-zinc-200' : 'text-slate-800'} font-medium`}>
                  <CheckCircle2 size={15} className="text-sky-400 shrink-0" />
                  <span>Full 365-Day Progressive PPL Cycle Tracking</span>
                </div>
                <div className={`flex items-center gap-2.5 ${isDark ? 'text-zinc-200' : 'text-slate-800'} font-medium`}>
                  <CheckCircle2 size={15} className="text-sky-400 shrink-0" />
                  <span>Interactive Gemini AI Personal Trainer Chat</span>
                </div>
                <div className={`flex items-center gap-2.5 ${isDark ? 'text-zinc-200' : 'text-slate-800'} font-medium`}>
                  <CheckCircle2 size={15} className="text-sky-400 shrink-0" />
                  <span>Workout history analytics & calorie records</span>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="mt-4 pt-4 border-t border-sky-500/20">
              <button
                onClick={() => setShowPaymentModal(true)}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-xs bg-sky-600 hover:bg-sky-500 active:scale-98 text-white transition-all shadow-lg shadow-sky-600/25 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
              >
                <CreditCard size={16} />
                <span>Pay ₹100 via Razorpay</span>
              </button>
              <div className="flex items-center justify-center gap-2 mt-2 text-[10px] text-zinc-400">
                <ShieldCheck size={13} className="text-emerald-400" />
                <span>Razorpay Test Mode • UPI, Cards & Netbanking</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          user={user}
          onPaymentSuccess={(paymentData) => {
            setShowPaymentModal(false);
            onPaymentSuccess(paymentData);
          }}
          onClose={() => setShowPaymentModal(false)}
          theme={theme}
        />
      )}
    </div>
  );
};

export default AccessGate;
