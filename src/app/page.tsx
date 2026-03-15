'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MapPin, Clock, AlertTriangle, Settings, User, Bot, Menu, X, RotateCcw, ShieldCheck, TrendingUp, Leaf, Zap } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

export default function SmartCityAssistant() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hello! I am your Smart City Assistant. How can I help you navigate Chicago today?' }
  ]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSystemsOnline, setIsSystemsOnline] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, history }),
      });
      const data = await response.json();

      if (data.error) throw new Error(data.error);

      setMessages(prev => [...prev, { role: 'assistant', text: data.text }]);
      setHistory(data.history);
    } catch (error: any) {
      setMessages(prev => [...prev, { role: 'assistant', text: `Error: ${error.message}. Please check your API keys.` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    if (confirm('Are you sure you want to clear the chat history?')) {
      setMessages([{ role: 'assistant', text: 'Hello! I am your Smart City Assistant. How can I help you navigate Chicago today?' }]);
      setHistory([]);
    }
  };

  return (
    <div className="flex h-screen bg-[#05070a] text-slate-200 overflow-hidden font-sans">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 320 : 0 }}
        className="bg-white/5 backdrop-blur-md border-r border-white/10 flex-shrink-0 relative z-20"
      >
        <div className={cn("p-6 flex flex-col h-full", !isSidebarOpen && "hidden")}>
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.5)]">
              <Bot className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight">SmartCity</h1>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Assistant</p>
            </div>
          </div>

          <nav className="space-y-6 flex-1 overflow-y-auto pr-2">
          </nav>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-white/5 transition-colors text-slate-400 hover:text-white"
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative">
        {/* Header */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-black/20 backdrop-blur-sm sticky top-0 z-10">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            {isSidebarOpen ? <Menu className="w-5 h-5" /> : <Menu className="w-5 h-5 rotate-90" />}
          </button>

          <div className="flex items-center gap-6">
            <div className={cn(
              "flex items-center gap-2 px-3 py-1 border rounded-full transition-colors",
              isSystemsOnline ? "bg-green-500/10 border-green-500/20 text-green-500" : "bg-red-500/10 border-red-500/20 text-red-500"
            )}>
              <div className={cn("w-1.5 h-1.5 rounded-full", isSystemsOnline ? "bg-green-500 animate-pulse" : "bg-red-500")} />
              <span className="text-[10px] uppercase font-bold">{isSystemsOnline ? "CTA Systems Online" : "Systems Offline"}</span>
            </div>
            <button
              onClick={() => setIsProfileOpen(true)}
              className="p-2 bg-white/5 rounded-full border border-white/10 hover:bg-white/10 transition-colors"
            >
              <User className="w-5 h-5 text-slate-300" />
            </button>
          </div>
        </header >

        {/* Chat Area */}
        < div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6" >
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={cn(
                  "flex gap-4 max-w-3xl",
                  msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-1 shadow-lg",
                  msg.role === 'user' ? "bg-slate-700" : "bg-blue-600 shadow-blue-900/40"
                )}>
                  {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
                </div>
                <div className={cn(
                  "p-5 rounded-2xl relative group/msg",
                  msg.role === 'user'
                    ? "bg-blue-600 text-white rounded-tr-none shadow-xl shadow-blue-900/20"
                    : "bg-white/5 border border-white/10 rounded-tl-none backdrop-blur-sm"
                )}>
                  {msg.role === 'user' ? (
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                  ) : (
                    <div className="prose prose-invert prose-sm max-w-none prose-headings:text-white prose-p:leading-relaxed prose-strong:text-blue-400 prose-ul:list-disc prose-ol:list-decimal">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  )}
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-[10px] opacity-40">
                      {mounted && new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {
            isLoading && (
              <div className="flex gap-4 max-w-3xl mr-auto">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center animate-pulse">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="flex gap-2 items-center p-5 rounded-2xl bg-white/5 border border-white/10">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></span>
                </div>
              </div>
            )
          }
        </div >

        {/* Input Area */}
        < div className="p-8 pb-10 bg-gradient-to-t from-[#05070a] via-[#05070a] to-transparent" >
          <div className="max-w-4xl mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[28px] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-focus-within:opacity-60"></div>
            <div className="relative bg-[#0d121b] border border-white/10 rounded-3xl p-2 flex items-center shadow-2xl">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about bus departures, train delays, or plan a route..."
                className="flex-1 bg-transparent px-6 py-4 outline-none text-sm placeholder:text-slate-500"
              />
              <button
                onClick={handleSend}
                disabled={isLoading}
                className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center hover:bg-blue-500 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
              >
                <Send className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <button className="flex items-center gap-2 text-[10px] uppercase font-bold text-slate-500 hover:text-blue-400 transition-colors">
                <MapPin className="w-3 h-3" />
                <span>Nearby Stops</span>
              </button>
              <button className="flex items-center gap-2 text-[10px] uppercase font-bold text-slate-500 hover:text-blue-400 transition-colors">
                <Clock className="w-3 h-3" />
                <span>Tomorrow's Plan</span>
              </button>
              <button className="flex items-center gap-2 text-[10px] uppercase font-bold text-slate-500 hover:text-blue-400 transition-colors">
                <AlertTriangle className="w-3 h-3" />
                <span>System Health</span>
              </button>
            </div>
          </div>
        </div >
      </main >

      {/* Settings Modal */}
      <AnimatePresence>
        {
          isSettingsOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSettingsOpen(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="relative bg-[#0d121b] border border-white/10 rounded-[32px] w-full max-w-md shadow-2xl overflow-hidden"
              >
                <div className="p-8">
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl font-bold flex items-center gap-3">
                      <Settings className="w-6 h-6 text-blue-500" />
                      Settings
                    </h2>
                    <button
                      onClick={() => setIsSettingsOpen(false)}
                      className="p-2 hover:bg-white/5 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-3">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Appearance & Status</p>
                      <button
                        onClick={() => setIsSystemsOnline(!isSystemsOnline)}
                        className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <ShieldCheck className={cn("w-5 h-5", isSystemsOnline ? "text-green-500" : "text-slate-500")} />
                          <span className="text-sm font-medium">Systems Status Indicator</span>
                        </div>
                        <div className={cn(
                          "w-10 h-6 rounded-full relative transition-colors",
                          isSystemsOnline ? "bg-green-600" : "bg-slate-700"
                        )}>
                          <div className={cn(
                            "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                            isSystemsOnline ? "left-5" : "left-1"
                          )} />
                        </div>
                      </button>
                    </div>

                    <div className="space-y-3">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Data Management</p>
                      <div className="grid grid-cols-1 gap-3">
                        <button
                          onClick={clearChat}
                          className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-amber-500/10 hover:border-amber-500/20 transition-all text-slate-300 hover:text-amber-400 group"
                        >
                          <RotateCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                          <span className="text-sm font-medium">Clear Chat History</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-10 pt-8 border-t border-white/5 flex flex-col items-center gap-2">
                    <p className="text-[10px] text-slate-600 uppercase font-bold tracking-[0.2em]">Smart City Assistant v1.0</p>
                    <p className="text-[10px] text-slate-700 italic">Connected to Gemini 2.0 Flash Lite</p>
                  </div>
                </div>
              </motion.div>
            </div>
          )
        }
      </AnimatePresence >

      {/* Profile Modal */}
      <AnimatePresence>
        {
          isProfileOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsProfileOpen(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="relative bg-[#0d121b] border border-white/10 rounded-[32px] w-full max-w-md shadow-2xl overflow-hidden"
              >
                <div className="relative h-32 bg-gradient-to-r from-blue-600 to-indigo-600">
                  <button
                    onClick={() => setIsProfileOpen(false)}
                    className="absolute top-6 right-6 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors backdrop-blur-md"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="px-8 pb-8">
                  <div className="relative -mt-12 mb-6 flex justify-center">
                    <div className="w-24 h-24 bg-[#0d121b] rounded-3xl p-1 shadow-2xl">
                      <div className="w-full h-full bg-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                        <User className="w-12 h-12 text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold">Tanvi Patel</h2>
                    <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mt-1">Smart City Explorer</p>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-white/5 border border-white/5 p-4 rounded-2xl text-center">
                      <TrendingUp className="w-5 h-5 text-blue-500 mx-auto mb-2" />
                      <p className="text-sm font-bold">128</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Trips</p>
                    </div>
                    <div className="bg-white/5 border border-white/5 p-4 rounded-2xl text-center">
                      <Leaf className="w-5 h-5 text-green-500 mx-auto mb-2" />
                      <p className="text-sm font-bold">42kg</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">CO2 Saved</p>
                    </div>
                    <div className="bg-white/5 border border-white/5 p-4 rounded-2xl text-center">
                      <Zap className="w-5 h-5 text-amber-500 mx-auto mb-2" />
                      <p className="text-sm font-bold">2.4h</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Time Saved</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider px-2">Recent Achievement</p>
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-br from-blue-600/10 to-indigo-600/10 border border-blue-500/20">
                      <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">Eco-Warrior Elite</p>
                        <p className="text-[10px] text-slate-400">Awarded for saving 40kg of CO2 emissions.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )
        }
      </AnimatePresence >

    </div >
  );
}
