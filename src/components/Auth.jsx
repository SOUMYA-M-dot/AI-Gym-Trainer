// src/components/Auth.jsx
import React, { useState } from 'react';
import { 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  Dumbbell, 
  Sun, 
  Moon, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  ShieldCheck
} from 'lucide-react';
import { loginUser, registerUser } from '../utils/auth';

const Auth = ({ onLogin, theme, onToggleTheme }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const isDark = theme === 'dark';

  // Toggle between Login & Register tabs
  const handleToggleMode = (mode) => {
    setIsLogin(mode);
    setErrorMessage('');
    setSuccessMessage('');
    setPassword('');
    setConfirmPassword('');
  };

  // Password matching status for registration
  const isPasswordMatch = password && confirmPassword && password === confirmPassword;
  const isPasswordMismatch = password && confirmPassword && password !== confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Client-side quick checks
    if (!isLogin) {
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match. Please verify your password confirmation.');
        return;
      }
    }

    setLoading(true);

    try {
      if (isLogin) {
        const result = await loginUser(email, password);
        if (result.success) {
          setSuccessMessage('Login successful! Redirecting to studio...');
          setTimeout(() => {
            onLogin(result.user);
          }, 400);
        } else {
          setErrorMessage(result.error);
        }
      } else {
        const result = await registerUser({
          name,
          email,
          password,
          confirmPassword
        });
        if (result.success) {
          setSuccessMessage('Account created successfully! Welcome aboard!');
          setTimeout(() => {
            onLogin(result.user);
          }, 400);
        } else {
          setErrorMessage(result.error);
        }
      }
    } catch (err) {
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 relative transition-colors ${
      isDark ? 'bg-zinc-950 text-white' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Background Decorative Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      
      {/* Top Bar with Theme Toggle */}
      <div className="absolute top-6 right-6">
        <button
          onClick={onToggleTheme}
          className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
            isDark 
              ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800' 
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-xs'
          }`}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      <div className={`w-full max-w-md rounded-3xl border p-8 shadow-2xl relative z-10 transition-all ${
        isDark ? 'bg-zinc-900/95 border-zinc-800/80 backdrop-blur-md' : 'bg-white border-slate-200 shadow-xl'
      }`}>
        {/* Brand Header */}
        <div className="mb-6 text-center">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-sky-600 to-cyan-500 flex items-center justify-center text-white mx-auto mb-3 shadow-lg shadow-sky-600/20">
            <Dumbbell size={26} />
          </div>
          <h1 className="text-2xl font-black tracking-tight mb-1">
            AI GYM TRAINER
          </h1>
          <p className={`text-xs font-medium ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
            Intelligent Vision Biomechanics & Personal Coaching
          </p>
        </div>

        {/* Tab Switcher */}
        <div className={`flex rounded-xl p-1 mb-6 border ${
          isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-100 border-slate-200'
        }`}>
          <button
            type="button"
            onClick={() => handleToggleMode(true)}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              isLogin 
                ? 'bg-sky-600 text-white shadow-sm' 
                : isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => handleToggleMode(false)}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              !isLogin 
                ? 'bg-sky-600 text-white shadow-sm' 
                : isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Status / Error Alerts */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-start gap-2.5 text-xs animate-in fade-in">
            <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-500" />
            <span className="font-medium leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-start gap-2.5 text-xs animate-in fade-in">
            <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-500" />
            <span className="font-medium leading-relaxed">{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Sign Up: Full Name */}
          {!isLogin && (
            <div>
              <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${
                isDark ? 'text-zinc-400' : 'text-slate-600'
              }`}>
                Full Name
              </label>
              <div className="relative">
                <User className={`absolute left-3.5 top-3.5 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`} size={18} />
                <input 
                  type="text" 
                  placeholder="e.g. Soumya Sharma" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full py-3 pl-11 pr-4 rounded-xl text-sm font-medium border outline-hidden transition-all ${
                    isDark 
                      ? 'bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-sky-500' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-sky-600'
                  }`}
                  required
                />
              </div>
            </div>
          )}
          
          {/* Email Address */}
          <div>
            <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${
              isDark ? 'text-zinc-400' : 'text-slate-600'
            }`}>
              Email Address
            </label>
            <div className="relative">
              <Mail className={`absolute left-3.5 top-3.5 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`} size={18} />
              <input 
                type="email" 
                placeholder="athlete@gym.ai" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full py-3 pl-11 pr-4 rounded-xl text-sm font-medium border outline-hidden transition-all ${
                  isDark 
                    ? 'bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-sky-500' 
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-sky-600'
                }`}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${
              isDark ? 'text-zinc-400' : 'text-slate-600'
            }`}>
              Password
            </label>
            <div className="relative">
              <Lock className={`absolute left-3.5 top-3.5 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`} size={18} />
              <input 
                type={showPassword ? 'text' : 'password'} 
                placeholder={isLogin ? 'Enter your password' : 'Create a secure password (min. 6 chars)'} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full py-3 pl-11 pr-11 rounded-xl text-sm font-medium border outline-hidden transition-all ${
                  isDark 
                    ? 'bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-sky-500' 
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-sky-600'
                }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3.5 top-3.5 p-0.5 rounded transition-colors cursor-pointer ${
                  isDark ? 'text-zinc-500 hover:text-zinc-300' : 'text-slate-400 hover:text-slate-600'
                }`}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Sign Up: Confirm Password */}
          {!isLogin && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={`block text-[11px] font-bold uppercase tracking-wider ${
                  isDark ? 'text-zinc-400' : 'text-slate-600'
                }`}>
                  Confirm Password
                </label>
                {/* Real-time Match Feedback */}
                {isPasswordMatch && (
                  <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 size={12} /> Passwords match
                  </span>
                )}
                {isPasswordMismatch && (
                  <span className="text-[10px] font-bold text-rose-400 flex items-center gap-1">
                    <AlertCircle size={12} /> Passwords do not match
                  </span>
                )}
              </div>
              <div className="relative">
                <ShieldCheck className={`absolute left-3.5 top-3.5 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`} size={18} />
                <input 
                  type={showConfirmPassword ? 'text' : 'password'} 
                  placeholder="Re-enter your password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full py-3 pl-11 pr-11 rounded-xl text-sm font-medium border outline-hidden transition-all ${
                    isPasswordMismatch 
                      ? 'border-rose-500 focus:border-rose-500' 
                      : isPasswordMatch 
                      ? 'border-emerald-500 focus:border-emerald-500' 
                      : isDark ? 'border-zinc-800 focus:border-sky-500' : 'border-slate-200 focus:border-sky-600'
                  } ${isDark ? 'bg-zinc-950 text-white placeholder:text-zinc-600' : 'bg-slate-50 text-slate-900 placeholder:text-slate-400'}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={`absolute right-3.5 top-3.5 p-0.5 rounded transition-colors cursor-pointer ${
                    isDark ? 'text-zinc-500 hover:text-zinc-300' : 'text-slate-400 hover:text-slate-600'
                  }`}
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 active:scale-98 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-sky-600/25 flex items-center justify-center gap-2 mt-5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>{isLogin ? 'Authenticating...' : 'Creating Account...'}</span>
              </>
            ) : (
              <>
                <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Bottom Switcher */}
        <div className={`mt-6 text-center pt-5 border-t ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}>
          <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
            {isLogin ? "Don't have an athlete account yet?" : "Already registered?"}
            <button 
              type="button"
              onClick={() => handleToggleMode(!isLogin)}
              className="ml-2 text-sky-500 font-bold hover:underline cursor-pointer"
            >
              {isLogin ? 'Create one now' : 'Sign in here'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
