// src/components/PaymentModal.jsx
import React, { useState } from 'react';
import { CreditCard, CheckCircle2, ShieldCheck, X } from 'lucide-react';
import { setMembershipPaid } from '../utils/workoutStorage';

const PaymentModal = ({ onPaymentSuccess, onClose, theme = 'dark' }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState('pay'); // pay, success

  const isDark = theme === 'dark';

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setStep('success');
      setMembershipPaid(true);
      setTimeout(() => {
        onPaymentSuccess();
      }, 1200);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-xs" onClick={onClose}></div>

      <div className={`w-full max-w-md rounded-3xl border overflow-hidden shadow-2xl relative z-10 animate-in fade-in zoom-in duration-200 ${
        isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <button 
          onClick={onClose} 
          className={`absolute top-4 right-4 p-1.5 rounded-xl transition-colors cursor-pointer ${
            isDark ? 'text-zinc-400 hover:text-white hover:bg-zinc-800' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
          }`}
        >
          <X size={18} />
        </button>

        {step === 'pay' ? (
          <div className="p-8">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold mb-2">Lifetime Athlete Pass</h2>
              <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                Unlock all 8 biomechanical routines, 3D Twin & full AI Coaching
              </p>
            </div>

            <div className={`rounded-2xl p-5 border mb-6 ${
              isDark ? 'bg-zinc-950/60 border-zinc-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className={`flex justify-between items-center mb-3 text-sm ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                <span>Membership Plan</span>
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Lifetime Access</span>
              </div>
              <div className={`h-px mb-3 ${isDark ? 'bg-zinc-800' : 'bg-slate-200'}`}></div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm">Total Due</span>
                <span className="text-2xl font-black text-sky-500 font-mono">₹100</span>
              </div>
            </div>

            <div className="space-y-2.5 mb-8 text-xs font-medium">
              <div className={`flex items-center gap-2.5 ${isDark ? 'text-zinc-300' : 'text-slate-600'}`}>
                <ShieldCheck size={16} className="text-emerald-500 shrink-0" />
                <span>256-bit SSL encrypted secure processing</span>
              </div>
              <div className={`flex items-center gap-2.5 ${isDark ? 'text-zinc-300' : 'text-slate-600'}`}>
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                <span>Includes Push-ups, Squats, 3D Digital Twin & Audio Coach</span>
              </div>
            </div>

            <button 
              onClick={handlePay}
              disabled={isProcessing}
              className="w-full bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              {isProcessing ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <CreditCard size={18} />
              )}
              {isProcessing ? 'Processing...' : 'Complete Payment • ₹100'}
            </button>
          </div>
        ) : (
          <div className="p-10 text-center flex flex-col items-center gap-3">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mb-2">
              <CheckCircle2 size={36} />
            </div>
            <h2 className="text-2xl font-bold">Membership Active</h2>
            <p className={`text-sm max-w-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
              Your lifetime pass is confirmed. Redirecting to your fitness studio...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
