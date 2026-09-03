// src/components/PaymentModal.jsx
import React, { useState } from 'react';
import { CreditCard, CheckCircle2, ShieldCheck, X, AlertCircle, Zap } from 'lucide-react';
import { setMembershipPaid } from '../utils/workoutStorage';
import { openRazorpayCheckout } from '../utils/razorpay';

const PaymentModal = ({ 
  user,
  onPaymentSuccess, 
  onClose, 
  theme = 'dark' 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [paymentReceipt, setPaymentReceipt] = useState(null);
  const [step, setStep] = useState('pay'); // 'pay' | 'success'

  const isDark = theme === 'dark';

  const handleRazorpayPayment = async () => {
    setIsProcessing(true);
    setErrorMessage('');

    try {
      await openRazorpayCheckout({
        amountINR: 100,
        user: user || { name: 'Athlete', email: 'athlete@aigym.local' },
        onSuccess: (paymentData) => {
          setIsProcessing(false);
          setPaymentReceipt(paymentData);
          setStep('success');

          // Save paid membership in storage
          setMembershipPaid(true, user?.email, {
            paymentId: paymentData.paymentId,
            orderId: paymentData.orderId,
            amount: 100,
            currency: 'INR',
            paidAt: new Date().toISOString()
          });

          // Redirect after brief delay
          setTimeout(() => {
            onPaymentSuccess(paymentData);
          }, 1500);
        },
        onError: (err) => {
          setIsProcessing(false);
          const desc = err?.description || err?.message || 'Payment was unsuccessful. Please try again.';
          setErrorMessage(desc);
        },
        onDismiss: () => {
          setIsProcessing(false);
        }
      });
    } catch (error) {
      setIsProcessing(false);
      setErrorMessage(error?.message || 'Failed to initialize payment gateway.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-xs" onClick={onClose}></div>

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
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase mb-3 bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <Zap size={13} className="text-sky-400" />
                Razorpay Test Mode
              </div>
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
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Lifetime Pass</span>
              </div>
              <div className={`flex justify-between items-center mb-3 text-xs ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
                <span>Athlete Account</span>
                <span className="font-mono">{user?.email || 'Guest User'}</span>
              </div>
              <div className={`h-px mb-3 ${isDark ? 'bg-zinc-800' : 'bg-slate-200'}`}></div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm">Total Due</span>
                <span className="text-2xl font-black text-sky-500 font-mono">₹100</span>
              </div>
            </div>

            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-2.5 mb-8 text-xs font-medium">
              <div className={`flex items-center gap-2.5 ${isDark ? 'text-zinc-300' : 'text-slate-600'}`}>
                <ShieldCheck size={16} className="text-emerald-500 shrink-0" />
                <span>Secured by Razorpay • UPI, Cards & Netbanking supported</span>
              </div>
              <div className={`flex items-center gap-2.5 ${isDark ? 'text-zinc-300' : 'text-slate-600'}`}>
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                <span>Lifetime unlimited access to all PPL splits & 3D tracking</span>
              </div>
            </div>

            <button 
              onClick={handleRazorpayPayment}
              disabled={isProcessing}
              className="w-full bg-sky-600 hover:bg-sky-500 active:scale-98 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Opening Razorpay Gateway...</span>
                </>
              ) : (
                <>
                  <CreditCard size={18} />
                  <span>Pay ₹100 via Razorpay</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="p-8 text-center flex flex-col items-center gap-3">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mb-2">
              <CheckCircle2 size={36} />
            </div>
            <h2 className="text-2xl font-bold">Payment Verified!</h2>
            <p className={`text-sm max-w-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
              Your lifetime pass is activated. Welcome to AI Gym Trainer!
            </p>
            {paymentReceipt?.paymentId && (
              <div className={`mt-3 py-2 px-4 rounded-xl border text-xs font-mono ${
                isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-400' : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}>
                Payment ID: <span className="text-sky-500 font-semibold">{paymentReceipt.paymentId}</span>
              </div>
            )}
            <button
              onClick={() => onPaymentSuccess(paymentReceipt)}
              className="mt-4 px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all cursor-pointer"
            >
              Enter Studio Now →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
