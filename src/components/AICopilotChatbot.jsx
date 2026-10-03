import React, { useState, useRef, useEffect, useContext } from 'react';
import { SimulationContext } from '../context/SimulationContext';
import { useTheme } from '../context/ThemeContext';
import { sendGroqChatMessage, getGroqApiKey, setGroqApiKey } from '../services/groqService';

export default function AICopilotChatbot() {
  const sim = useContext(SimulationContext);
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showKeyConfig, setShowKeyConfig] = useState(false);
  const [customKey, setCustomKey] = useState(() => getGroqApiKey());
  const [keySavedToast, setKeySavedToast] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '👋 **Welcome to VelocIQ Copilot (Groq LLaMA-3.3)**! I am plugged directly into your vehicle’s live telematics stream, 3D physics model, and ECU diagnostics. How can I assist you today?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [isListening, setIsListening] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const telemetry = sim?.telemetry || {};
  const activeDTCs = sim?.activeDTCs || [];
  const vehicleProfile = sim?.vehicleProfile || 'sedan';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages, isLoading]);

  const handleSend = async (textToSend = input) => {
    const query = textToSend.trim();
    if (!query || isLoading) return;

    const userMsg = {
      role: 'user',
      content: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const assistantReplyText = await sendGroqChatMessage(
        [...messages, userMsg],
        telemetry,
        activeDTCs,
        vehicleProfile
      );

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: assistantReplyText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ Failed to get AI response: ${err.message}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Voice Speech Recognition
  const toggleSpeech = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      handleSend(transcript);
    };

    recognition.start();
  };

  const quickPrompts = [
    '🔍 Diagnose active DTCs',
    '⚡ Optimize fuel/energy efficiency',
    '🔥 Check brake & tire thermals',
    '🏎️ Analyze 3D physics state',
    '📊 Summary of engine health',
  ];

  return (
    <>
      {/* ── Floating Action Button (Bottom Right) ────────────────────────── */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className="fixed bottom-20 md:bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-full shadow-2xl transition-all duration-200 hover:scale-105 select-none font-mono text-xs font-bold text-white border border-white/20 group"
        style={{
          background: `linear-gradient(135deg, ${theme.secondary || '#0B3D91'}, ${theme.primary || '#00D4FF'})`,
          boxShadow: `0 8px 30px ${theme.glow}`,
        }}
        title="Open VelocIQ AI Copilot (Groq)"
      >
        <div className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
        </div>
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="tracking-wide">AI COPILOT</span>
          <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-black/30 font-extrabold uppercase">
            GROQ
          </span>
        </div>
      </button>

      {/* ── Slide-Out Drawer / Modal ─────────────────────────────────────── */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Chat Container */}
          <div className="relative z-10 w-full max-w-lg h-full flex flex-col bg-white shadow-2xl border-l border-slate-200 font-sans">
            {/* Header */}
            <div
              className="p-4 border-b border-slate-200 flex items-center justify-between text-white"
              style={{
                background: `linear-gradient(135deg, #0F172A, ${theme.secondary || '#0B3D91'})`,
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center border shadow-inner"
                  style={{ backgroundColor: theme.badgeBg, borderColor: theme.cardBorder }}
                >
                  <svg className="w-5 h-5 text-cyan-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <div className="font-display text-base font-black tracking-wide text-white flex items-center gap-2">
                    <span>VELOCIQ AI COPILOT</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                      GROQ LLaMA 3.3
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300 font-mono flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Live Telematics Telemetry Synced</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowKeyConfig(v => !v)}
                  className={`p-1.5 rounded-lg transition ${showKeyConfig ? 'bg-cyan-500/30 text-cyan-300' : 'text-slate-300 hover:text-white hover:bg-white/10'}`}
                  title="Configure Groq API Key"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => setMessages([messages[0]])}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
                  title="Clear Chat History"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
                  title="Close Copilot"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Groq API Key Config Dropdown */}
            {showKeyConfig && (
              <div className="bg-slate-900 border-b border-slate-700 p-3 text-xs text-slate-200 animate-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                    🔑 Groq API Key Configuration
                  </span>
                  {keySavedToast && (
                    <span className="text-[10px] text-emerald-400 font-mono font-bold">✓ Saved</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mb-2 leading-relaxed">
                  Loaded from <code className="text-cyan-300">.env.local</code> or local browser storage.
                </p>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={customKey}
                    onChange={e => setCustomKey(e.target.value)}
                    placeholder="Enter Groq API Key..."
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-[11px] text-white focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setGroqApiKey(customKey);
                      setKeySavedToast(true);
                      setTimeout(() => setKeySavedToast(false), 2000);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 font-bold text-[11px] text-white transition"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}

            {/* Live Vehicle Telemetry Ribbon */}
            <div className="px-3 py-2 bg-slate-900 border-b border-slate-800 text-[11px] font-mono text-slate-300 flex items-center justify-between overflow-x-auto gap-3 shrink-0">
              <div className="flex items-center gap-1">
                <span className="text-slate-400">SPD:</span>
                <span className="text-cyan-400 font-bold">{Math.round(telemetry.speed || 0)} km/h</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-slate-400">RPM:</span>
                <span className="text-amber-400 font-bold">{Math.round(telemetry.rpm || 0)}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-slate-400">COOLANT:</span>
                <span className="text-emerald-400 font-bold">{Math.round(telemetry.coolant || 85)}°C</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-slate-400">DTC:</span>
                <span className={activeDTCs.length > 0 ? 'text-red-400 font-bold' : 'text-slate-400'}>
                  {activeDTCs.length > 0 ? activeDTCs.join(',') : 'None'}
                </span>
              </div>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      {msg.role === 'user' ? 'YOU' : 'VELOCIQ COPILOT (GROQ)'}
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono">{msg.time}</span>
                  </div>

                  <div
                    className={`max-w-[88%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                      msg.role === 'user'
                        ? 'bg-slate-900 text-white rounded-tr-xs font-mono'
                        : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs'
                    }`}
                  >
                    <div className="whitespace-pre-wrap font-sans text-[12.5px]">
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex flex-col items-start">
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      VELOCIQ COPILOT (GROQ)
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl rounded-tl-xs bg-white border border-slate-200 text-slate-600 text-xs flex items-center gap-2 shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
                    <span className="font-mono font-semibold">Analyzing live telematics & telemetry via Groq...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts Bar */}
            <div className="px-3 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto shrink-0 scrollbar-none">
              {quickPrompts.map((qp, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSend(qp)}
                  className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition shrink-0 whitespace-nowrap"
                >
                  {qp}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask Groq AI about DTCs, engine thermals, efficiency..."
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 font-sans transition"
                disabled={isLoading}
              />

              {/* Voice Speech Recognition Button */}
              <button
                type="button"
                onClick={toggleSpeech}
                className={`p-2.5 rounded-xl border transition ${
                  isListening
                    ? 'bg-red-500 text-white border-red-600 animate-pulse'
                    : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                }`}
                title="Voice Input"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>

              {/* Send Button */}
              <button
                type="button"
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="px-4 py-2.5 rounded-xl text-white font-mono text-xs font-bold transition disabled:opacity-40 disabled:cursor-not-allowed shadow-xs flex items-center gap-1.5"
                style={{
                  backgroundColor: theme.secondary || '#0B3D91',
                }}
              >
                <span>SEND</span>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
