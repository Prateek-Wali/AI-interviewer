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
  Brain,
  Plus,
  Lightbulb
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
        <section className="animate-slide-down border-b border-[#d0d7de] pb-6 mb-8 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <div className="font-mono text-xs text-[#8c959f] flex items-center gap-1 mb-2">
              lintrvw / dashboard
            </div>
            <h1 className="font-mono font-bold text-2xl tracking-tight text-[#1f2328]">
              Welcome back, <span className="text-[#1a7f37]">{firstName}</span>
            </h1>
            <p className="text-sm text-[#636c76] mt-1">
              Your personal AI interview coach is ready. Pick up where you left off or start a new session.
            </p>
          </div>
          <Link href="/interview/setup">
            <button className="bg-[#1a7f37] border border-[rgba(27,31,36,0.15)] rounded-md text-white text-sm font-medium px-4 py-2 flex items-center gap-2 hover:bg-[#115822] transition-colors">
              <Plus className="w-4 h-4" />
              New Interview
            </button>
          </Link>
        </section>

        {/* ─────────────────────────────────── */}
        {/* SECTION 2: STATS GRID              */}
        {/* ─────────────────────────────────── */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-slide-down" style={{ animationDelay: '0.1s' }}>
          {/* Card 1 */}
          <div className="bg-white border border-[#d0d7de] rounded-lg p-4 hover:border-[#8c959f] transition-colors duration-150">
            <div className="text-xs text-[#636c76] flex items-center gap-1.5 mb-2">
              <Target className="w-3.5 h-3.5" />
              Interviews
            </div>
            <div className="font-mono font-bold text-3xl tracking-[-0.03em] text-[#1f2328]">0</div>
            <div className="text-xs text-[#8c959f] font-mono mt-1">Total completed</div>
          </div>
          {/* Card 2 */}
          <div className="bg-white border border-[#d0d7de] rounded-lg p-4 hover:border-[#8c959f] transition-colors duration-150">
            <div className="text-xs text-[#636c76] flex items-center gap-1.5 mb-2">
              <BarChart3 className="w-3.5 h-3.5" />
              Avg Score
            </div>
            <div className="font-mono font-bold text-3xl tracking-[-0.03em] text-[#0969da]">—</div>
            <div className="text-xs text-[#8c959f] font-mono mt-1">Across all modes</div>
          </div>
          {/* Card 3 */}
          <div className="bg-white border border-[#d0d7de] rounded-lg p-4 hover:border-[#8c959f] transition-colors duration-150">
            <div className="text-xs text-[#636c76] flex items-center gap-1.5 mb-2">
              <Clock className="w-3.5 h-3.5" />
              Time Practiced
            </div>
            <div className="font-mono font-bold text-3xl tracking-[-0.03em] text-[#1f2328]">0m</div>
            <div className="text-xs text-[#8c959f] font-mono mt-1">Total minutes</div>
          </div>
          {/* Card 4 */}
          <div className="bg-white border border-[#d0d7de] rounded-lg p-4 hover:border-[#8c959f] transition-colors duration-150">
            <div className="text-xs text-[#636c76] flex items-center gap-1.5 mb-2">
              <TrendingUp className="w-3.5 h-3.5" />
              Streak
            </div>
            <div className="font-mono font-bold text-3xl tracking-[-0.03em] text-[#9a6700]">0</div>
            <div className="text-xs text-[#8c959f] font-mono mt-1">Current days</div>
          </div>
        </section>

        {/* ─────────────────────────────────── */}
        {/* SECTION 3: CTA CARD                */}
        {/* ─────────────────────────────────── */}
        <section className="animate-slide-down" style={{ animationDelay: '0.15s' }}>
          <div className="bg-white border border-[#d0d7de] rounded-lg p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg, #1a7f37, #0969da)' }}></div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[#1a7f37] animate-pulse"></div>
              <span className="font-mono text-xs uppercase tracking-widest text-[#1a7f37]">Ready to practice</span>
            </div>
            <h2 className="font-mono font-bold text-xl text-[#1f2328] mt-1">
              Start a New Interview
            </h2>
            <p className="text-sm text-[#636c76] mt-2 mb-5 max-w-lg">
              Upload your resume, choose your difficulty, and get grilled by Alex — our AI interviewer who doesn't go easy on you.
            </p>
            <div className="flex items-center gap-3">
              <Link href="/interview/setup">
                <button className="bg-[#1a7f37] rounded-md text-white text-sm font-medium px-4 py-2 hover:bg-[#115822] transition-colors">
                  Begin Session
                </button>
              </Link>
              <button className="bg-transparent border border-[#d0d7de] rounded-md text-[#1f2328] text-sm font-medium px-4 py-2 hover:bg-[#f6f8fa] transition-colors">
                  Review Past Questions
              </button>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────── */}
        {/* SECTION 4: PRACTICE MODES          */}
        {/* ─────────────────────────────────── */}
        <section className="animate-slide-down" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-[#1f2328] flex items-center gap-2">
              <Brain className="w-4 h-4 text-[#636c76]" />
              Practice Modes
            </h3>
            <Link href="/dashboard/practice" className="text-xs text-[#0969da] hover:underline">
              View all &rarr;
            </Link>
          </div>

          <div className="flex flex-col gap-2">
            {/* Row 1: Behavioral */}
            <Link href="/interview/setup">
              <div className="bg-white border border-[#d0d7de] rounded-lg px-4 py-3.5 flex items-center gap-3.5 hover:border-[#8c959f] transition-colors group cursor-pointer">
                <div className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center font-bold" style={{ background: 'rgba(130,80,215,0.1)', color: '#8250df' }}>
                  <Mic className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm text-[#1f2328]">Behavioral Interview</h4>
                  <p className="text-xs text-[#636c76] mt-0.5">STAR method, conflict resolution, leadership stories. AI challenges weak answers.</p>
                </div>
                <div className="text-sm font-medium text-[#1a7f37] flex items-center gap-1 group-hover:gap-1.5 transition-all">
                  Start &rarr;
                </div>
              </div>
            </Link>

            {/* Row 2: Technical */}
            <div className="bg-white border border-[#d0d7de] rounded-lg px-4 py-3.5 flex items-center gap-3.5 hover:border-[#8c959f] transition-colors group cursor-pointer">
              <div className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center font-bold" style={{ background: 'rgba(9,105,218,0.1)', color: '#0969da' }}>
                <Zap className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm text-[#1f2328]">Technical Interview</h4>
                <p className="text-xs text-[#636c76] mt-0.5">Data structures, algorithms, and system design. The AI adapts to your resume.</p>
              </div>
              <div className="font-mono text-[10px] border border-[#d0d7de] rounded-full px-2 py-0.5 text-[#8c959f] bg-[#f6f8fa]">
                soon
              </div>
            </div>

            {/* Row 3: System Design */}
            <div className="bg-white border border-[#d0d7de] rounded-lg px-4 py-3.5 flex items-center gap-3.5 hover:border-[#8c959f] transition-colors group cursor-pointer">
              <div className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center font-bold" style={{ background: 'rgba(26,127,55,0.1)', color: '#1a7f37' }}>
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm text-[#1f2328]">System Design</h4>
                <p className="text-xs text-[#636c76] mt-0.5">Scalability, databases, microservices. Whiteboard-style discussions with the AI.</p>
              </div>
              <div className="font-mono text-[10px] border border-[#d0d7de] rounded-full px-2 py-0.5 text-[#8c959f] bg-[#f6f8fa]">
                soon
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────── */}
        {/* SECTION 5: BOTTOM COLUMNS          */}
        {/* ─────────────────────────────────── */}
        <section className="grid grid-cols-1 md:grid-cols-5 gap-5 animate-slide-down" style={{ animationDelay: '0.25s' }}>
          
          {/* Left: Recent Interviews (3fr) */}
          <div className="md:col-span-3 bg-white border border-dashed border-[#d0d7de] rounded-lg p-6">
            <div className="flex items-center justify-between mb-10">
              <h3 className="font-semibold text-sm text-[#1f2328]">Recent Interviews</h3>
              <Link href="/dashboard/history" className="text-xs text-[#0969da] hover:underline">
                View All
              </Link>
            </div>

            <div className="flex flex-col items-center justify-center text-center py-6">
              <div className="w-10 h-10 rounded-lg bg-[#f6f8fa] border border-[#d0d7de] flex items-center justify-center mb-3">
                <Mic className="w-5 h-5 text-[#8c959f]" />
              </div>
              <h4 className="font-medium text-sm text-[#1f2328]">No interviews yet</h4>
              <p className="text-xs text-[#636c76] mt-1 mb-4 max-w-sm">
                Start your first AI interview session. Your history, scores, and feedback will appear here.
              </p>
              <Link href="/interview/setup">
                <button className="bg-[#1a7f37] rounded-md text-white text-sm font-medium px-4 py-2 hover:bg-[#115822] transition-colors">
                  Start First Interview
                </button>
              </Link>
            </div>
          </div>

          {/* Right: Stacked Cards (2fr) */}
          <div className="md:col-span-2 flex flex-col gap-5">
            
            {/* Subcard 1: Activity / Streak */}
            <div className="bg-white border border-[#d0d7de] rounded-lg p-5">
              <div className="flex items-baseline gap-2 mb-3">
                <span className="font-mono font-extrabold text-4xl text-[#9a6700] tracking-tight">0</span>
                <span className="text-xs text-[#8c959f] font-mono">day streak</span>
              </div>
              <div className="grid grid-cols-[repeat(12,1fr)] gap-[3px]">
                {Array.from({ length: 84 }).map((_, i) => (
                  <div key={i} className="aspect-square rounded-[2px] bg-[#eaeef2]"></div>
                ))}
              </div>
              <div className="text-xs text-[#8c959f] font-mono text-right mt-2">
                Last 12 weeks
              </div>
            </div>

            {/* Subcard 2: Pro Tips */}
            <div className="bg-white border border-[#d0d7de] rounded-lg p-5">
              <div className="font-semibold text-sm text-[#1f2328] flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4 text-[#8c959f]" />
                Pro Tips
              </div>
              
              <div className="flex flex-col">
                <div className="flex gap-3 py-2.5 border-b border-[#eaeef2] first:pt-0">
                  <div className="w-5 h-5 border border-[#d0d7de] bg-[#f6f8fa] rounded font-mono text-[10px] font-bold text-[#636c76] flex items-center justify-center shrink-0 mt-0.5">1</div>
                  <div>
                    <h4 className="text-xs font-semibold text-[#1f2328]">Upload your real resume</h4>
                    <p className="text-[11px] text-[#8c959f] leading-relaxed mt-0.5">The AI tailors every question to your actual experience.</p>
                  </div>
                </div>
                
                <div className="flex gap-3 py-2.5 border-b border-[#eaeef2]">
                  <div className="w-5 h-5 border border-[#d0d7de] bg-[#f6f8fa] rounded font-mono text-[10px] font-bold text-[#636c76] flex items-center justify-center shrink-0 mt-0.5">2</div>
                  <div>
                    <h4 className="text-xs font-semibold text-[#1f2328]">Don't give one-word answers</h4>
                    <p className="text-[11px] text-[#8c959f] leading-relaxed mt-0.5">Alex will call you out. Use the STAR method for behavioral questions.</p>
                  </div>
                </div>

                <div className="flex gap-3 py-2.5 border-b border-[#eaeef2] last:border-0 last:pb-0">
                  <div className="w-5 h-5 border border-[#d0d7de] bg-[#f6f8fa] rounded font-mono text-[10px] font-bold text-[#636c76] flex items-center justify-center shrink-0 mt-0.5">3</div>
                  <div>
                    <h4 className="text-xs font-semibold text-[#1f2328]">Practice under pressure</h4>
                    <p className="text-[11px] text-[#8c959f] leading-relaxed mt-0.5">The silence detection and follow-ups simulate real interview stress.</p>
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