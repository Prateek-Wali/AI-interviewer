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
    if (score >= 90) return "text-emerald-600";
    if (score >= 75) return "text-amber-500";
    return "text-red-500";
}

function getScoreBg(score: number) {
    if (score >= 90) return "bg-emerald-50 border-emerald-200 text-emerald-700";
    if (score >= 75) return "bg-amber-50 border-amber-200 text-amber-700";
    return "bg-red-50 border-red-200 text-red-700";
}

function getScoreGradient(score: number) {
    if (score >= 90) return "from-emerald-500 to-emerald-600";
    if (score >= 75) return "from-amber-400 to-amber-500";
    return "from-red-400 to-red-500";
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
            return "bg-violet-100 text-violet-700 border-violet-200";
        case "TECHNICAL":
            return "bg-blue-100 text-blue-700 border-blue-200";
        case "SYSTEM_DESIGN":
            return "bg-cyan-100 text-cyan-700 border-cyan-200";
        default:
            return "bg-slate-100 text-slate-700 border-slate-200";
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
                            <button className="w-10 h-10 rounded-full bg-white shadow-sm border border-slate-300 flex items-center justify-center hover:bg-slate-50 hover:border-slate-400 transition-all">
                                <ArrowLeft className="w-5 h-5 text-slate-800" strokeWidth={2.5} />
                            </button>
                        </Link>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider shadow-sm">
                            <Sparkles className="w-4 h-4" />
                            History
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-3">
                        Past{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">
                            Interviews
                        </span>
                    </h1>
                    <p className="text-lg text-slate-500 max-w-xl">
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
                )}

                {/* ─────────────────────────────────── */}
                {/* INTERVIEW CARDS                     */}
                {/* ─────────────────────────────────── */}
                {!loading && !error && interviews.length > 0 && (
                    <section className="space-y-4 animate-slide-down" style={{ animationDelay: '0.15s' }}>
                        <h3 className="text-lg font-bold text-slate-900">All Sessions</h3>

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
                                            className="group relative bg-white/60 backdrop-blur-md border border-slate-200 rounded-2xl p-6 hover:border-blue-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden mb-4"
                                            onMouseEnter={() => setHoveredCard(interview.id)}
                                            onMouseLeave={() => setHoveredCard(null)}
                                        >
                                            {/* Hover glow */}
                                            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/5 rounded-full blur-[60px] group-hover:bg-blue-500/10 transition-all"></div>

                                            <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-5">

                                                {/* Left: Score ring */}
                                                <div className="shrink-0">
                                                    {interview.overallScore != null ? (
                                                        <div className="relative w-16 h-16">
                                                            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                                                <circle cx="50" cy="50" r="42" fill="none" stroke="#f1f5f9" strokeWidth="6" />
                                                                <circle
                                                                    cx="50" cy="50" r="42" fill="none"
                                                                    stroke="url(#histGrad)" strokeWidth="6"
                                                                    strokeLinecap="round"
                                                                    strokeDasharray={`${(interview.overallScore / 100) * 264} 264`}
                                                                />
                                                                <defs>
                                                                    <linearGradient id="histGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                                                        <stop offset="0%" stopColor="#3b82f6" />
                                                                        <stop offset="100%" stopColor="#7c3aed" />
                                                                    </linearGradient>
                                                                </defs>
                                                            </svg>
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <span className={`text-lg font-bold ${getScoreColor(interview.overallScore)}`}>
                                                                    {Math.round(interview.overallScore)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                                                            <span className="text-xs font-medium text-slate-400">N/A</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Center: Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${getTypeColor(interview.type)}`}>
                                                            <TypeIcon className="w-3 h-3" />
                                                            {getTypeLabel(interview.type)}
                                                        </span>
                                                        <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                                                            {interview.difficulty}
                                                        </span>
                                                    </div>

                                                    <div className="text-sm font-semibold text-slate-900 mb-1">
                                                        {formatDate(interview.startedAt)} at {formatTime(interview.startedAt)}
                                                    </div>

                                                    {interview.summaryText && (
                                                        <p className="text-xs text-slate-500 line-clamp-2 max-w-xl">
                                                            {interview.summaryText}
                                                        </p>
                                                    )}

                                                    {/* Metrics row */}
                                                    <div className="flex flex-wrap items-center gap-4 mt-3">
                                                        <span className="flex items-center gap-1.5 text-xs text-slate-400">
                                                            <Clock className="w-3 h-3" />
                                                            {formatDuration(interview.durationSeconds)}
                                                        </span>
                                                        <span className="flex items-center gap-1.5 text-xs text-slate-400">
                                                            <MessageSquare className="w-3 h-3" />
                                                            {interview.questionCount} questions
                                                        </span>
                                                        {interview.communicationScore != null && (
                                                            <span className="flex items-center gap-1.5 text-xs text-slate-400">
                                                                <Target className="w-3 h-3" />
                                                                Comm: <strong className={getScoreColor(interview.communicationScore)}>{Math.round(interview.communicationScore)}</strong>
                                                            </span>
                                                        )}
                                                        {interview.confidenceScore != null && (
                                                            <span className="flex items-center gap-1.5 text-xs text-slate-400">
                                                                <Shield className="w-3 h-3" />
                                                                Conf: <strong className={getScoreColor(interview.confidenceScore)}>{Math.round(interview.confidenceScore)}</strong>
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Right: Arrow */}
                                                <div className={`shrink-0 w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center transition-all duration-300 group-hover:bg-blue-50 group-hover:border-blue-200 ${isHovered ? 'translate-x-1' : ''}`}>
                                                    <ChevronRight className={`w-5 h-5 transition-colors ${isHovered ? 'text-blue-600' : 'text-slate-400'}`} />
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
