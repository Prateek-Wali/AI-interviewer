"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Sparkles,
    Clock,
    Target,
    MessageSquare,
    Shield,
    ChevronRight,
    Mic,
    Brain,
    Zap,
    BookOpen,
    ArrowLeft,
    AlertCircle,
} from "lucide-react";

// ─────────────────────────────────────
// Types
// ─────────────────────────────────────

interface HistoryInterview {
    id: string;
    type: string;
    difficulty: string;
    startedAt: string;
    endedAt: string | null;
    durationSeconds: number | null;
    questionCount: number;
    overallScore: number | null;
    communicationScore: number | null;
    confidenceScore: number | null;
    summaryText: string | null;
}

// ─────────────────────────────────────
// Helpers
// ─────────────────────────────────────

function getScoreColor(score: number) {
    if (score >= 60) return "text-[#1a7f37]";
    if (score >= 40) return "text-[#9a6700]";
    return "text-[#cf222e]";
}

function getScoreStroke(score: number) {
    if (score >= 60) return "#1a7f37";
    if (score >= 40) return "#9a6700";
    return "#cf222e";
}

function formatDuration(seconds: number | null) {
    if (!seconds) return "—";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function formatTime(dateStr: string) {
    return new Date(dateStr).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
}

function getTypeIcon(type: string) {
    switch (type) {
        case "BEHAVIORAL":
            return Brain;
        case "TECHNICAL":
            return Zap;
        case "SYSTEM_DESIGN":
            return BookOpen;
        default:
            return Target;
    }
}

function getTypeLabel(type: string) {
    switch (type) {
        case "BEHAVIORAL":
            return "Behavioral";
        case "TECHNICAL":
            return "Technical";
        case "SYSTEM_DESIGN":
            return "System Design";
        case "MIXED":
            return "Mixed";
        default:
            return type;
    }
}

function getTypeColor(type: string) {
    switch (type) {
        case "BEHAVIORAL":
            return "bg-[rgba(130,80,215,0.08)] border-[rgba(130,80,215,0.2)] text-[#8250df]";
        case "TECHNICAL":
            return "bg-[rgba(9,105,218,0.08)] border-[rgba(9,105,218,0.2)] text-[#0969da]";
        case "SYSTEM_DESIGN":
            return "bg-[rgba(26,127,55,0.08)] border-[rgba(26,127,55,0.2)] text-[#1a7f37]";
        default:
            return "bg-[#f6f8fa] border-[#d0d7de] text-[#636c76]";
    }
}

// ─────────────────────────────────────
// Component
// ─────────────────────────────────────

export default function HistoryPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [interviews, setInterviews] = useState<HistoryInterview[]>([]);
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

    useEffect(() => {
        async function fetchHistory() {
            try {
                const res = await fetch("/api/interviews/history");
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.details || data.error || "Failed to load history");
                }
                setInterviews(data.interviews);
            } catch (err) {
                console.error("History load error:", err);
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        }
        fetchHistory();
    }, []);

    return (
        <div className="min-h-screen relative overflow-hidden">

            {/* ═══════════════════════════════════════════════════ */}
            {/* BACKGROUND — Matches Dashboard                    */}
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
            <div className="relative z-10 max-w-6xl mx-auto px-6 pt-8 pb-20 space-y-8">

                {/* ─────────────────────────────────── */}
                {/* SECTION 1: PAGE HEADER              */}
                {/* ─────────────────────────────────── */}
                <section className="animate-slide-down">
                    <div className="flex items-center gap-4 mb-5">
                        <Link href="/dashboard">
                            <button className="w-9 h-9 rounded-md bg-white border border-[#d0d7de] flex items-center justify-center hover:bg-[#f6f8fa] text-[#1f2328] transition-all">
                                <ArrowLeft className="w-4 h-4" strokeWidth={2} />
                            </button>
                        </Link>
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#f6f8fa] border border-[#d0d7de] text-[#636c76] font-mono text-xs uppercase tracking-widest">
                            <Sparkles className="w-3 h-3" />
                            History
                        </div>
                    </div>
                    <h1 className="font-mono font-bold text-3xl tracking-tight text-[#1f2328] mb-3">
                        Past <span className="text-[#1f2328]">Interviews</span>
                    </h1>
                    <p className="text-sm text-[#636c76] max-w-xl">
                        Review your previous sessions, track your progress, and revisit feedback from every interview.
                    </p>
                </section>

                {/* ─────────────────────────────────── */}
                {/* LOADING STATE                       */}
                {/* ─────────────────────────────────── */}
                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <div className="w-12 h-12 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-slate-500 text-sm font-medium">Loading your interviews...</p>
                        </div>
                    </div>
                )}

                {/* ─────────────────────────────────── */}
                {/* ERROR STATE                         */}
                {/* ─────────────────────────────────── */}
                {error && !loading && (
                    <div className="flex flex-col items-center justify-center py-20 animate-slide-down">
                        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
                            <AlertCircle className="w-7 h-7 text-red-400" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 mb-1">Something went wrong</h3>
                        <p className="text-xs text-slate-500 max-w-xs text-center mb-5">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-2.5 bg-slate-900 border border-transparent text-white text-sm font-bold rounded-full hover:bg-black transition-all hover:shadow-lg shadow-md"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* ─────────────────────────────────── */}
                {/* EMPTY STATE                         */}
                {/* ─────────────────────────────────── */}
                {!loading && !error && interviews.length === 0 && (
                    <div className="flex flex-col items-center justify-center text-center py-20 animate-slide-down" style={{ animationDelay: '0.1s' }}>
                        <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center mb-5">
                            <Mic className="w-9 h-9 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">No interviews yet</h3>
                        <p className="text-sm text-slate-500 max-w-sm mb-6">
                            Complete your first AI interview session and your history, scores, and detailed feedback will appear here.
                        </p>
                        <Link href="/interview/setup">
                            <button className="px-7 py-3.5 bg-slate-900 border border-transparent text-white text-sm font-bold rounded-full hover:bg-black transition-all hover:shadow-xl shadow-lg">
                                Start First Interview
                            </button>
                        </Link>
                    </div>
                )}

                {/* ─────────────────────────────────── */}
                {/* STATS SUMMARY BAR                   */}
                {/* ─────────────────────────────────── */}
                {!loading && !error && interviews.length > 0 && (
                    <section className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-slide-down" style={{ animationDelay: '0.1s' }}>
                        {[
                            {
                                icon: Target,
                                label: "Total Interviews",
                                value: interviews.length.toString(),
                                color: "blue",
                            },
                            {
                                icon: Target,
                                label: "Avg Score",
                                value: interviews.filter(i => i.overallScore != null).length > 0
                                    ? Math.round(interviews.reduce((sum, i) => sum + (i.overallScore ?? 0), 0) / interviews.filter(i => i.overallScore != null).length).toString()
                                    : "—",
                                color: "violet",
                            },
                            {
                                icon: Clock,
                                label: "Total Time",
                                value: (() => {
                                    const totalSec = interviews.reduce((sum, i) => sum + (i.durationSeconds ?? 0), 0);
                                    const h = Math.floor(totalSec / 3600);
                                    const m = Math.floor((totalSec % 3600) / 60);
                                    return h > 0 ? `${h}h ${m}m` : `${m}m`;
                                })(),
                                color: "cyan",
                            },
                            {
                                icon: MessageSquare,
                                label: "Questions Answered",
                                value: interviews.reduce((sum, i) => sum + i.questionCount, 0).toString(),
                                color: "blue",
                            },
                        ].map((stat) => (
                            <div
                                key={stat.label}
                                className="bg-white border border-[#d0d7de] rounded-lg p-4 hover:border-[#8c959f] transition-colors duration-150"
                            >
                                <div className="text-xs text-[#636c76] flex items-center gap-1.5 mb-2">
                                    <div className="w-5 h-5 rounded-md bg-[#f6f8fa] border border-[#d0d7de] flex items-center justify-center">
                                        <stat.icon className="w-3 h-3 text-[#636c76]" />
                                    </div>
                                    {stat.label}
                                </div>
                                <div className="font-mono font-bold text-3xl tracking-tight text-[#1f2328]">{stat.value}</div>
                            </div>
                        ))}
                    </section>
                )}

                {/* ─────────────────────────────────── */}
                {/* INTERVIEW CARDS                     */}
                {/* ─────────────────────────────────── */}
                {!loading && !error && interviews.length > 0 && (
                    <section className="space-y-4 animate-slide-down" style={{ animationDelay: '0.15s' }}>
                        <h3 className="font-semibold text-sm text-[#1f2328]">All Sessions</h3>

                        <div className="space-y-4">
                            {interviews.map((interview) => {
                                const TypeIcon = getTypeIcon(interview.type);
                                const isHovered = hoveredCard === interview.id;

                                return (
                                    <Link
                                        key={interview.id}
                                        href={`/interview/${interview.id}/report`}
                                    >
                                        <div
                                            className="group bg-white border border-[#d0d7de] rounded-lg p-6 hover:border-[#8c959f] transition-colors duration-150 cursor-pointer mb-4"
                                            onMouseEnter={() => setHoveredCard(interview.id)}
                                            onMouseLeave={() => setHoveredCard(null)}
                                        >
                                            <div className="flex flex-col md:flex-row md:items-center gap-5">

                                                {/* Left: Score ring */}
                                                <div className="shrink-0">
                                                    {interview.overallScore != null ? (
                                                        <div className="relative w-16 h-16">
                                                            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                                                <circle cx="50" cy="50" r="42" fill="none" stroke="#eaeef2" strokeWidth="6" />
                                                                <circle
                                                                    cx="50" cy="50" r="42" fill="none"
                                                                    stroke={getScoreStroke(interview.overallScore)} strokeWidth="6"
                                                                    strokeLinecap="round"
                                                                    strokeDasharray={`${(interview.overallScore / 100) * 264} 264`}
                                                                />
                                                            </svg>
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <span className={`text-lg font-mono font-bold ${getScoreColor(interview.overallScore)}`}>
                                                                    {Math.round(interview.overallScore)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="w-16 h-16 rounded-full bg-[#f6f8fa] border border-[#d0d7de] flex items-center justify-center">
                                                            <span className="font-mono text-xs font-medium text-[#8c959f]">N/A</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Center: Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-mono text-xs font-medium border ${getTypeColor(interview.type)}`}>
                                                            <TypeIcon className="w-3 h-3" />
                                                            {getTypeLabel(interview.type)}
                                                        </span>
                                                        <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-[#f6f8fa] border border-[#d0d7de] text-[#636c76]">
                                                            {interview.difficulty}
                                                        </span>
                                                    </div>

                                                    <div className="font-mono font-medium text-sm text-[#1f2328] mb-1">
                                                        {formatDate(interview.startedAt)} at {formatTime(interview.startedAt)}
                                                    </div>

                                                    {interview.summaryText && (
                                                        <p className="text-xs text-[#636c76] leading-relaxed line-clamp-2 max-w-xl">
                                                            {interview.summaryText}
                                                        </p>
                                                    )}

                                                    {/* Metrics row */}
                                                    <div className="flex flex-wrap items-center gap-4 mt-3 font-mono text-xs text-[#8c959f]">
                                                        <span className="flex items-center gap-1.5">
                                                            <Clock className="w-3 h-3" />
                                                            {formatDuration(interview.durationSeconds)}
                                                        </span>
                                                        <span className="flex items-center gap-1.5">
                                                            <MessageSquare className="w-3 h-3" />
                                                            {interview.questionCount} questions
                                                        </span>
                                                        {interview.communicationScore != null && (
                                                            <span className="flex items-center gap-1.5">
                                                                <Target className="w-3 h-3" />
                                                                Comm: <strong className="text-[#0969da] font-bold">{Math.round(interview.communicationScore)}</strong>
                                                            </span>
                                                        )}
                                                        {interview.confidenceScore != null && (
                                                            <span className="flex items-center gap-1.5">
                                                                <Shield className="w-3 h-3" />
                                                                Conf: <strong className="text-[#0969da] font-bold">{Math.round(interview.confidenceScore)}</strong>
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Right: Arrow */}
                                                <div className="shrink-0 flex items-center justify-center">
                                                    <ChevronRight className="w-5 h-5 text-[#8c959f]" />
                                                </div>

                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </section>
                )}

            </div>
        </div>
    );
}
