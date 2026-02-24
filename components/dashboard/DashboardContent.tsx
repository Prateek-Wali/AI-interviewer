"use client";

import { useState } from 'react';
import Link from "next/link";
import {
  ArrowRight,
  Zap,
  TrendingUp,
  Clock,
  Target,
  Mic,
  BarChart3,
  ChevronRight,
  Sparkles,
  BookOpen,
  Shield,
  Brain
} from 'lucide-react';

interface DashboardContentProps {
  firstName: string;
}

export default function DashboardContent({ firstName }: DashboardContentProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  return (
    <div className="min-h-screen relative overflow-hidden">

      {/* ═══════════════════════════════════════════════════ */}
      {/* BACKGROUND — Matches Landing Page                  */}
      {/* ═══════════════════════════════════════════════════ */}
      <div className="fixed inset-0 -z-50 h-full w-full bg-white">
        <div className="absolute h-full w-full bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-100/80 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-drift-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-100/80 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-drift-medium"></div>
        <div className="absolute top-[40%] left-[40%] w-[400px] h-[400px] bg-cyan-50/80 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-drift-fast"></div>
      </div>

      {/* ═══════════════════════════════════════════════════ */}
      {/* MAIN CONTENT                                       */}
      {/* ═══════════════════════════════════════════════════ */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-8 pb-20 space-y-10">

        {/* ─────────────────────────────────── */}
        {/* SECTION 1: HERO WELCOME            */}
        {/* ─────────────────────────────────── */}
        <section className="animate-slide-down">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3 h-3" />
            Dashboard
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-3">
            Welcome back,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">
              {firstName}
            </span>
          </h1>
          <p className="text-lg text-slate-500 max-w-xl">
            Your personal AI interview coach is ready. Pick up where you left off or start a new session.
          </p>
        </section>

        {/* ─────────────────────────────────── */}
        {/* SECTION 2: PRIMARY ACTION CARD      */}
        {/* ─────────────────────────────────── */}
        <section className="animate-slide-down" style={{ animationDelay: '0.1s' }}>
          <Link href="/interview/setup">
            <div
              className="group relative overflow-hidden rounded-3xl bg-slate-900 p-8 md:p-10 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1"
              onMouseEnter={() => setHoveredCard('start')}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Gradient glow behind the card */}
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-blue-500/20 via-violet-500/10 to-transparent rounded-full blur-[60px] transition-opacity duration-500 group-hover:opacity-100 opacity-60"></div>
              <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gradient-to-tr from-cyan-500/10 to-transparent rounded-full blur-[60px] opacity-0 group-hover:opacity-60 transition-opacity duration-500"></div>

              <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                      <Mic className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Ready to practice</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white">
                    Start a New Interview
                  </h2>
                  <p className="text-slate-400 max-w-md text-sm">
                    Upload your resume, choose your difficulty, and get grilled by Alex — our AI interviewer who doesn't go easy on you.
                  </p>
                </div>

                <div className={`flex items-center gap-2 px-6 py-3 rounded-full bg-white text-slate-900 font-bold text-sm transition-all duration-300 shadow-lg ${hoveredCard === 'start' ? 'gap-4 shadow-white/20' : ''}`}>
                  Begin Session
                  <ArrowRight className={`w-4 h-4 transition-transform duration-300 ${hoveredCard === 'start' ? 'translate-x-1' : ''}`} />
                </div>
              </div>
            </div>
          </Link>
        </section>

        {/* ─────────────────────────────────── */}
        {/* SECTION 3: STATS ROW               */}
        {/* ─────────────────────────────────── */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-slide-down" style={{ animationDelay: '0.15s' }}>
          {[
            { icon: Target, label: "Interviews", value: "0", color: "blue" },
            { icon: BarChart3, label: "Avg Score", value: "—", color: "violet" },
            { icon: Clock, label: "Time Practiced", value: "0m", color: "cyan" },
            { icon: TrendingUp, label: "Streak", value: "0 days", color: "blue" },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className="group bg-white/60 backdrop-blur-md border border-slate-200 rounded-2xl p-5 hover:border-blue-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110
                ${stat.color === 'blue' ? 'bg-blue-100 text-blue-600' : ''}
                ${stat.color === 'violet' ? 'bg-violet-100 text-violet-600' : ''}
                ${stat.color === 'cyan' ? 'bg-cyan-100 text-cyan-600' : ''}
              `}>
                <stat.icon className="w-4 h-4" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
              <div className="text-xs font-medium text-slate-500 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </section>

        {/* ─────────────────────────────────── */}
        {/* SECTION 4: FEATURE GRID            */}
        {/* ─────────────────────────────────── */}
        <section className="animate-slide-down" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-slate-900">Practice Modes</h3>
            <span className="text-xs text-slate-400 font-medium">More coming soon</span>
          </div>

          <div className="grid md:grid-cols-3 gap-5">

            {/* Card: Behavioral */}
            <Link href="/interview/setup">
              <div className="group relative bg-white/60 backdrop-blur-md border border-slate-200 rounded-2xl p-6 hover:border-violet-300 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 rounded-full blur-[40px] group-hover:bg-violet-500/10 transition-all"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center mb-4 shadow-lg shadow-violet-500/20 group-hover:scale-110 transition-transform">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mb-1">Behavioral Interview</h4>
                  <p className="text-sm text-slate-500 mb-4 leading-relaxed">
                    STAR method, conflict resolution, leadership stories. AI challenges weak answers.
                  </p>
                  <div className="flex items-center gap-1 text-violet-600 text-sm font-semibold group-hover:gap-2 transition-all">
                    Start <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </Link>

            {/* Card: Technical */}
            <div className="group relative bg-white/60 backdrop-blur-md border border-slate-200 rounded-2xl p-6 hover:border-blue-300 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-[40px] group-hover:bg-blue-500/10 transition-all"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-1">Technical Interview</h4>
                <p className="text-sm text-slate-500 mb-4 leading-relaxed">
                  Data structures, algorithms, and system design. The AI adapts to your resume.
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">Coming Soon</span>
                </div>
              </div>
            </div>

            {/* Card: System Design */}
            <div className="group relative bg-white/60 backdrop-blur-md border border-slate-200 rounded-2xl p-6 hover:border-cyan-300 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-[40px] group-hover:bg-cyan-500/10 transition-all"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/20 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-1">System Design</h4>
                <p className="text-sm text-slate-500 mb-4 leading-relaxed">
                  Scalability, databases, microservices. Whiteboard-style discussions with the AI.
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-cyan-600 bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded-full">Coming Soon</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ─────────────────────────────────── */}
        {/* SECTION 5: RECENT ACTIVITY + TIPS  */}
        {/* ─────────────────────────────────── */}
        <section className="grid md:grid-cols-5 gap-5 animate-slide-down" style={{ animationDelay: '0.25s' }}>

          {/* Recent Interviews — 3 cols */}
          <div className="md:col-span-3 bg-white/60 backdrop-blur-md border border-slate-200 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-slate-900">Recent Interviews</h3>
              <Link href="/dashboard/history" className="text-xs text-blue-600 font-semibold hover:underline">View All</Link>
            </div>

            {/* Empty State */}
            <div className="flex flex-col items-center justify-center text-center py-10 px-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <Mic className="w-7 h-7 text-slate-300" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">No interviews yet</h4>
              <p className="text-xs text-slate-500 max-w-xs mb-5">
                Start your first AI interview session. Your history, scores, and feedback will appear here.
              </p>
              <Link href="/interview/setup">
                <button className="px-5 py-2 bg-slate-900 text-white text-xs font-bold rounded-full hover:bg-black transition-all hover:shadow-lg">
                  Start First Interview
                </button>
              </Link>
            </div>
          </div>

          {/* Quick Tips — 2 cols */}
          <div className="md:col-span-2 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 rounded-2xl p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-[60px]"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-violet-500/10 rounded-full blur-[60px]"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-4 h-4 text-blue-400" />
                <h3 className="text-base font-bold">Pro Tips</h3>
              </div>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-6 h-6 shrink-0 rounded-full bg-blue-500/20 flex items-center justify-center text-[10px] font-bold text-blue-400">1</div>
                  <div>
                    <p className="text-sm font-semibold text-slate-200">Upload your real resume</p>
                    <p className="text-xs text-slate-400 mt-0.5">The AI tailors every question to your actual experience.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 shrink-0 rounded-full bg-violet-500/20 flex items-center justify-center text-[10px] font-bold text-violet-400">2</div>
                  <div>
                    <p className="text-sm font-semibold text-slate-200">Don't give one-word answers</p>
                    <p className="text-xs text-slate-400 mt-0.5">Alex will call you out. Use the STAR method for behavioral questions.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 shrink-0 rounded-full bg-cyan-500/20 flex items-center justify-center text-[10px] font-bold text-cyan-400">3</div>
                  <div>
                    <p className="text-sm font-semibold text-slate-200">Practice under pressure</p>
                    <p className="text-xs text-slate-400 mt-0.5">The silence detection and follow-ups simulate real interview stress.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </section>

      </div>
    </div>
  );
}