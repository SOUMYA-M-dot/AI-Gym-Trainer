// src/components/Chatbot.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, MessageSquare, Sparkles } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const QUICK_PROMPTS = [
  'How is my current form?',
  'What muscles am I targeting?',
  'Tips for full range of motion',
  'Breathing rhythm technique'
];

const CANDIDATE_MODELS = [
  'gemini-1.5-flash-latest',
  'gemini-1.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-pro',
  'gemini-pro'
];

const Chatbot = ({ latestPoseData, theme = 'dark' }) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I am your AI Coach. Start exercising in front of the camera, and ask me any questions about your form or technique.'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const isDark = theme === 'dark';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (customPrompt) => {
    const textToSend = customPrompt || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage = { role: 'user', content: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    if (!customPrompt) setInput('');
    setIsLoading(true);

    const rawApiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    const apiKey = typeof rawApiKey === 'string' ? rawApiKey.trim() : '';

    try {
      // Check if API key is present
      if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY' || apiKey === 'your_gemini_api_key_here') {
        let fallback = "I'm running in local coaching mode. ";

        if (latestPoseData && latestPoseData.exercise) {
          const { exercise, state, formScore, feedback, split } = latestPoseData;
          if (formScore === 'Bad') {
            fallback += `For ${exercise} (${split || 'Workout'} Day), focus on: "${feedback.join(', ')}". Maintain core stability and steady tempo.`;
          } else if (formScore === 'Excellent') {
            fallback += `Great execution on your ${exercise}! Keep your pacing consistent at ${state} position.`;
          } else {
            fallback += `Good reps on ${exercise}. Tip: ${feedback[0] || 'Keep movements steady'}.`;
          }
        } else {
          fallback += "Position yourself clearly in the camera frame so I can evaluate your posture angles.";
        }

        await new Promise((res) => setTimeout(res, 600));
        setMessages((prev) => [...prev, { role: 'assistant', content: fallback }]);
        return;
      }

      const genAI = new GoogleGenerativeAI(apiKey);

      const contextPrompt = `
You are an encouraging, highly knowledgeable certified strength and conditioning coach (CSCS).
User question: "${textToSend}"

Current real-time biometric metrics from MediaPipe pose engine:
- Workout Split: Day ${latestPoseData?.dayNumber || 1} - ${latestPoseData?.split || 'CUSTOM'} Routine
- Active Exercise: ${latestPoseData?.exercise || 'None'}
- Movement Phase: ${latestPoseData?.state || 'WAITING'}
- Posture Form Quality: ${latestPoseData?.formScore || 'Good'}
- Active Feedback Alerts: ${JSON.stringify(latestPoseData?.feedback || [])}

Provide a concise, motivating, and actionable 2-3 sentence coaching response. Focus on posture mechanics, joint safety, and encouragement.
      `;

      let generatedText = null;
      let lastError = null;

      // Try candidate models in cascade
      for (const modelName of CANDIDATE_MODELS) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent(contextPrompt);
          const response = await result.response;
          generatedText = response.text();
          if (generatedText) break;
        } catch (mErr) {
          lastError = mErr;
          console.warn(`Model ${modelName} failed, trying next fallback...`, mErr?.message);
        }
      }

      if (generatedText) {
        setMessages((prev) => [...prev, { role: 'assistant', content: generatedText }]);
      } else {
        throw lastError || new Error('No candidate Gemini model responded.');
      }
    } catch (err) {
      console.error('Gemini API Error:', err);
      const errorMessage = err?.message || '';
      let userFriendlyError = 'Unable to reach Gemini API. ';

      if (errorMessage.includes('API_KEY_INVALID') || errorMessage.includes('400')) {
        userFriendlyError += 'The API key in .env appears to be invalid or unactivated. Please check your Google AI Studio key.';
      } else if (errorMessage.includes('quota') || errorMessage.includes('429')) {
        userFriendlyError += 'API rate limit or quota exceeded. Please try again in a few moments.';
      } else {
        userFriendlyError += errorMessage || 'Please check your connection or key.';
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: userFriendlyError
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const hasApiKey = Boolean(import.meta.env.VITE_GEMINI_API_KEY && import.meta.env.VITE_GEMINI_API_KEY !== 'your_gemini_api_key_here');

  return (
    <div className={`flex flex-col h-full rounded-2xl border overflow-hidden transition-all ${
      isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
    }`}>
      {/* Header */}
      <div className={`px-4 py-3 border-b flex items-center justify-between ${
        isDark ? 'bg-zinc-950/60 border-zinc-800' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-sky-600 flex items-center justify-center text-white">
            <Bot size={18} />
          </div>
          <div>
            <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Coach AI
            </h3>
            <p className="text-[11px] text-emerald-500 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
              {hasApiKey ? 'Gemini AI Online' : 'Local Coaching Mode'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-2.5 max-w-[88%] ${
              msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-semibold ${
                msg.role === 'user'
                  ? 'bg-sky-600 text-white'
                  : isDark
                  ? 'bg-zinc-800 text-zinc-300'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
            </div>
            <div
              className={`p-3 rounded-2xl text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-sky-600 text-white rounded-tr-xs'
                  : isDark
                  ? 'bg-zinc-800/80 text-zinc-200 rounded-tl-xs border border-zinc-750'
                  : 'bg-slate-100 text-slate-800 rounded-tl-xs border border-slate-200'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="self-start flex gap-2.5 max-w-[85%]">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
              isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-slate-200 text-slate-700'
            }`}>
              <Bot size={14} />
            </div>
            <div className={`p-3 rounded-2xl rounded-tl-xs text-xs flex gap-1 items-center ${
              isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-slate-100 text-slate-500'
            }`}>
              <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className={`px-3 py-2 border-t overflow-x-auto flex gap-1.5 scrollbar-none ${
        isDark ? 'bg-zinc-950/40 border-zinc-800' : 'bg-slate-50/70 border-slate-200'
      }`}>
        {QUICK_PROMPTS.map((q, i) => (
          <button
            key={i}
            onClick={() => handleSend(q)}
            className={`whitespace-nowrap text-[11px] font-medium px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
              isDark
                ? 'bg-zinc-800/60 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
            }`}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className={`p-3 border-t ${
        isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className={`flex items-center gap-2 rounded-xl p-1 border focus-within:ring-2 focus-within:ring-sky-500/30 transition-all ${
          isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-300'
        }`}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask Coach AI about your form..."
            className={`flex-1 bg-transparent px-3 py-2 outline-hidden text-xs ${
              isDark ? 'text-white placeholder:text-zinc-500' : 'text-slate-900 placeholder:text-slate-400'
            }`}
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            className="p-2 bg-sky-600 text-white rounded-lg hover:bg-sky-500 disabled:opacity-40 transition-colors cursor-pointer"
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
