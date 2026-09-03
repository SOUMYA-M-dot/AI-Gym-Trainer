// src/components/Auth.jsx
import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Dumbbell, Sun, Moon } from 'lucide-react';
import { setStoredUser } from '../utils/workoutStorage';

const Auth = ({ onLogin, theme, onToggleTheme }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  const isDark = theme === 'dark';

  const handleSubmit = (e) => {
    e.preventDefault();
    const userData = {
      name: name || (email.split('@')[0] || 'Athlete'),
      email: email
    };
    setStoredUser(userData);
    onLogin(userData);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 relative transition-colors ${
      isDark ? 'bg-zinc-950 text-white' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Top Bar with Theme Toggle */}
      <div className="absolute top-6 right-6">
        <button
          onClick={onToggleTheme}
          className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
            isDark 
              ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800' 
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-xs'
          }`}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      <div className={`w-full max-w-md rounded-3xl border p-8 shadow-xl relative z-10 transition-all ${
        isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200 shadow-lg'
      }`}>
        <div className="mb-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-sky-600 flex items-center justify-center text-white mx-auto mb-4 shadow-md">
            <Dumbbell size={24} />
          </div>
          <h1 className="text-2xl font-black tracking-tight mb-1">
            AI GYM TRAINER
          </h1>
          <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
            {isLogin ? 'Sign in to access your workout studio' : 'Create an athlete account to get started'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <User className={`absolute left-3.5 top-3.5 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`} size={18} />
              <input 
                type="text" 
                placeholder="Full Name" 
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
          )}
          
          <div className="relative">
            <Mail className={`absolute left-3.5 top-3.5 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`} size={18} />
            <input 
              type="email" 
              placeholder="Email Address" 
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

          <div className="relative">
            <Lock className={`absolute left-3.5 top-3.5 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`} size={18} />
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full py-3 pl-11 pr-4 rounded-xl text-sm font-medium border outline-hidden transition-all ${
                isDark 
                  ? 'bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-sky-500' 
                  : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-sky-600'
              }`}
              required
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-sky-600 hover:bg-sky-500 active:scale-98 text-white font-bold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 mt-4 cursor-pointer"
          >
            {isLogin ? 'Sign In' : 'Create Account'}
            <ArrowRight size={18} />
          </button>
        </form>

        <div className={`mt-8 text-center pt-6 border-t ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}>
          <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
            {isLogin ? "Don't have an account yet?" : "Already registered?"}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="ml-2 text-sky-500 font-bold hover:underline cursor-pointer"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
