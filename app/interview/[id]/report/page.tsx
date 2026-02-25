"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
    ArrowLeft,
    RotateCcw,
    Sparkles,
    CheckCircle2,
    AlertCircle,
    Clock,
    MessageSquare,
    Shield,
    Target,
    TrendingUp,
    ChevronRight,
} from "lucide-react";

// ─────────────────────────────────────
// Types
// ─────────────────────────────────────

interface QuestionData {
    id: string;
    questionText: string;
    questionType: string;
    userResponse: string | null;
    responseDuration: number | null;
    confidenceScore: number | null;
    fillerWordCount: number | null;
    speakingRate: number | null;
}

interface AnalysisData {
    overallScore: number;
    communicationScore: number;
    confidenceScore: number;
    strengths: { title: string; description: string }[];
    weaknesses: { title: string; description: string }[];
    improvements: { topic: string; suggestion: string }[];
    summaryText: string;
    questionAnalysis: {
        questionId: string;
        score: number;
        communicationScore: number;
        duration: number;
        fillerWords: number;
    }[];
}

interface InterviewMeta {
    id: string;
    type: string;
    difficulty: string;
    startedAt: string;
    endedAt: string | null;
    durationSeconds: number | null;
}

// ─────────────────────────────────────
// Helpers
// ─────────────────────────────────────

function getScoreColor(score: number) {
    if (score >= 90) return "text-emerald-600";
    if (score >= 75) return "text-amber-500";
    return "text-red-500";
}

function getScoreDot(score: number) {
    if (score >= 90) return "bg-emerald-500";
    if (score >= 75) return "bg-amber-400";
    return "bg-red-500";
}

function getScoreBg(score: number) {
    if (score >= 90) return "bg-emerald-50 border-emerald-200";
    if (score >= 75) return "bg-amber-50 border-amber-200";
    return "bg-red-50 border-red-200";
}

function formatDuration(seconds: number | null) {
    if (!seconds) return "—";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

// ─────────────────────────────────────
// Component
// ─────────────────────────────────────

export default function ReportPage() {
    const params = useParams();
    const interviewId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [showReport, setShowReport] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [interview, setInterview] = useState<InterviewMeta | null>(null);
    const [questions, setQuestions] = useState<QuestionData[]>([]);
    const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
    const [selectedQuestion, setSelectedQuestion] = useState<number>(0);
    const [hoveredQuestion, setHoveredQuestion] = useState<number | null>(null);

    useEffect(() => {
        async function fetchReport() {
            try {
                const res = await fetch(`/api/interviews/${interviewId}/report`);
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.details || data.error || "Failed to load report");
                }
                setInterview(data.interview);
                setQuestions(data.questions);
                setAnalysis(data.analysis);
            } catch (err) {
                console.error("Report load error:", err);
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        }
        fetchReport();
    }, [interviewId]);

    // Trigger the reveal transition after data loads
    useEffect(() => {
        if (!loading && !error && analysis) {
            const timer = setTimeout(() => setShowReport(true), 100);
            return () => clearTimeout(timer);
        }
    }, [loading, error, analysis]);

    const dataReady = !loading && !error && !!analysis;

    // Error state (only after loading completes)
    if (!loading && (error || !analysis || !interview)) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-6">
                <div className="text-center max-w-sm">
                    <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
                    <h2 className="text-lg font-bold text-slate-900 mb-1">Report unavailable</h2>
                    <p className="text-sm text-slate-500 mb-4">{error || "Could not load interview data."}</p>
                    <Link href="/dashboard">
                        <button className="px-6 py-2.5 bg-slate-900 border border-transparent shadow-md text-white text-sm font-bold rounded-full hover:bg-black transition-all">
                            Back to Dashboard
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    const selected = questions[selectedQuestion];
    const qAnalysis = analysis?.questionAnalysis?.find(qa => qa.questionId === selected?.id);
    const starCount = analysis?.questionAnalysis?.filter(qa => qa.score >= 75).length ?? 0;

    const interviewDate = interview
        ? new Date(interview.startedAt).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
        })
        : "";
    const totalDuration = interview?.durationSeconds
        ? `${Math.floor(interview.durationSeconds / 60)} min`
        : "—";

    return (
        <div className="min-h-screen relative">
            {/* Background — Matches Dashboard */}
            <div className="fixed inset-0 -z-50 h-full w-full bg-white">
                <div className="absolute h-full w-full bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-100/80 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-drift-slow"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-100/80 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-drift-medium"></div>
                <div className="absolute top-[40%] left-[40%] w-[400px] h-[400px] bg-cyan-50/80 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-drift-fast"></div>
            </div>

            {/* ═══════════════════════════════ */}
            {/* LOADING OVERLAY — fades out     */}
            {/* ═══════════════════════════════ */}
            {(!dataReady || !showReport) && (
                <div
                    className={`fixed inset-0 z-50 flex items-center justify-center bg-white transition-all duration-600 ease-out ${dataReady ? "opacity-0 scale-95 pointer-events-none" : "opacity-100 scale-100"
                        }`}
                >
                    <div className="text-center">
                        <div className="w-12 h-12 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-slate-500 text-sm font-medium">Generating your report...</p>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════ */}
            {/* REPORT CONTENT — fades in       */}
            {/* ═══════════════════════════════ */}
            <div
                className={`flex h-screen transition-all duration-700 ease-out ${showReport ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                    }`}
            >

                {/* ═══════════════════════════════ */}
                {/* LEFT SIDEBAR                   */}
                {/* ═══════════════════════════════ */}
                <aside className="w-[280px] shrink-0 border-r border-slate-200 bg-white/10 backdrop-blur-md flex flex-col">

                    {/* Sidebar header */}
                    <div className="px-5 pt-6 pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
                            <Sparkles className="w-3 h-3" />
                            Report
                        </div>
                        <h2 className="text-sm font-bold text-slate-900">Questions ({questions.length})</h2>
                    </div>

                    {/* Question list */}
                    <nav className="flex-1 overflow-y-auto py-2">
                        {questions.map((q, i) => {
                            const score = analysis?.questionAnalysis?.find(qa => qa.questionId === q.id)?.score ?? 0;
                            const isSelected = selectedQuestion === i;
                            const isHovered = hoveredQuestion === i;

                            return (
                                <button
                                    key={q.id}
                                    onClick={() => setSelectedQuestion(i)}
                                    onMouseEnter={() => setHoveredQuestion(i)}
                                    onMouseLeave={() => setHoveredQuestion(null)}
                                    className={`w-full text-left px-5 py-3 flex items-center gap-3 transition-all duration-150 ${isSelected
                                        ? "bg-slate-100 border-r-2 border-blue-600"
                                        : "hover:bg-slate-50"
                                        }`}
                                >
                                    {/* Score dot — visible on hover or when selected */}
                                    <div
                                        className={`w-2.5 h-2.5 rounded-full shrink-0 transition-all duration-200 ${isHovered || isSelected
                                            ? getScoreDot(score)
                                            : "bg-slate-200"
                                            }`}
                                    ></div>

                                    <span className="text-sm text-slate-700 truncate">
                                        <span className="font-semibold text-slate-400">Q{i + 1}:</span>{" "}
                                        {q.questionText.substring(0, 35)}...
                                    </span>
                                </button>
                            );
                        })}
                    </nav>

                    {/* Sidebar actions */}
                    <div className="p-4 border-t border-slate-100 space-y-3">
                        <Link href="/dashboard" className="block">
                            <button className="w-full py-2.5 text-sm font-bold text-slate-800 bg-white border-2 border-slate-200 shadow-sm rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2">
                                <ArrowLeft className="w-4 h-4 text-slate-800" strokeWidth={2.5} />
                                Back to Dashboard
                            </button>
                        </Link>
                        <Link href="/interview/setup" className="block">
                            <button className="w-full py-2.5 text-sm font-bold text-white bg-slate-900 shadow-md rounded-xl hover:bg-black transition-all flex items-center justify-center gap-2">
                                <RotateCcw className="w-4 h-4" strokeWidth={2.5} />
                                Practice Again
                            </button>
                        </Link>
                    </div>
                </aside>

                {/* ═══════════════════════════════ */}
                {/* MAIN CONTENT (scrollable)      */}
                {/* ═══════════════════════════════ */}
                {analysis && interview && (
                    <main className="flex-1 overflow-y-auto scroll-smooth">
                        <div className="max-w-3xl mx-auto px-8 py-10 space-y-8">

                            {/* Header */}
                            <section className={showReport ? "animate-report-reveal report-delay-1" : "opacity-0"}>
                                <div className="flex items-center gap-4 mb-5 relative">
                                    <div className="absolute -left-12 sm:-left-24 lg:-left-39 xl:-left-110">
                                        <Link href="/dashboard/history">
                                            <button className="w-10 h-10 rounded-full bg-white shadow-sm border border-slate-300 flex items-center justify-center hover:bg-slate-50 hover:border-slate-400 transition-all">
                                                <ArrowLeft className="w-5 h-5 text-slate-800" strokeWidth={2.5} />
                                            </button>
                                        </Link>
                                    </div>
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold uppercase tracking-wider shadow-sm md:ml-[-12px]">
                                        <CheckCircle2 className="w-4 h-4" />
                                        Interview Complete
                                    </div>
                                </div>
                                <div className="text-sm text-slate-500 font-semibold md:ml-[-8px]">
                                    {interviewDate} · {totalDuration}
                                </div>
                            </section>

                            {/* Score Ring + Stats */}
                            <section className={`flex items-center gap-8 ${showReport ? "animate-report-reveal report-delay-2" : "opacity-0"}`}>
                                {/* SVG Ring */}
                                <div className="relative w-28 h-28 shrink-0">
                                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="42" fill="none" stroke="#f1f5f9" strokeWidth="6" />
                                        <circle
                                            cx="50" cy="50" r="42" fill="none"
                                            stroke="url(#scoreGradient)" strokeWidth="6"
                                            strokeLinecap="round"
                                            strokeDasharray={`${(analysis.overallScore / 100) * 264} 264`}
                                        />
                                        <defs>
                                            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="0%" stopColor="#3b82f6" />
                                                <stop offset="100%" stopColor="#7c3aed" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-3xl font-bold text-slate-900">{analysis.overallScore}</span>
                                    </div>
                                </div>

                                {/* Stat pills */}
                                <div className="flex flex-wrap gap-3">
                                    <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 bg-white">
                                        <MessageSquare className="w-4 h-4 text-blue-500" />
                                        <span className="text-sm text-slate-500">Communication</span>
                                        <span className="text-sm font-bold text-slate-900">{analysis.communicationScore}</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 bg-white">
                                        <Shield className="w-4 h-4 text-violet-500" />
                                        <span className="text-sm text-slate-500">Confidence</span>
                                        <span className="text-sm font-bold text-slate-900">{analysis.confidenceScore}</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 bg-white">
                                        <Target className="w-4 h-4 text-cyan-500" />
                                        <span className="text-sm text-slate-500">STAR</span>
                                        <span className="text-sm font-bold text-slate-900">{starCount}/{questions.length}</span>
                                    </div>
                                </div>
                            </section>

                            {/* Summary */}
                            <section className={showReport ? "animate-report-reveal report-delay-3" : "opacity-0"}>
                                <p className="text-sm text-slate-600 leading-relaxed">{analysis.summaryText}</p>
                            </section>

                            {/* Strengths & Improvements */}
                            <section className={`grid md:grid-cols-2 gap-4 ${showReport ? "animate-report-reveal report-delay-4" : "opacity-0"}`}>
                                {/* Strengths */}
                                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                                    <div className="flex items-center gap-2 mb-3">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        <h3 className="text-sm font-bold text-slate-900">Strengths</h3>
                                    </div>
                                    <ul className="space-y-2.5">
                                        {analysis.strengths.map((s, i) => (
                                            <li key={i} className="text-sm text-slate-600">
                                                <span className="font-semibold text-slate-800">{s.title}:</span> {s.description}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Improvements */}
                                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                                    <div className="flex items-center gap-2 mb-3">
                                        <TrendingUp className="w-4 h-4 text-amber-500" />
                                        <h3 className="text-sm font-bold text-slate-900">Areas to Improve</h3>
                                    </div>
                                    <ul className="space-y-2.5">
                                        {analysis.weaknesses.map((w, i) => (
                                            <li key={i} className="text-sm text-slate-600">
                                                <span className="font-semibold text-slate-800">{w.title}:</span> {w.description}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </section>

                            {/* Selected Question Detail */}
                            {selected && (
                                <section className={`rounded-2xl border border-slate-200 bg-white p-6 ${showReport ? "animate-report-reveal report-delay-5" : "opacity-0"}`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-bold text-slate-900">
                                            Q{selectedQuestion + 1} Detail
                                        </h3>
                                        {qAnalysis && (
                                            <div className="flex items-center gap-3">
                                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getScoreBg(qAnalysis.score)}`}>
                                                    {qAnalysis.score}/100
                                                </span>
                                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {formatDuration(qAnalysis.duration)}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Question */}
                                    <p className="text-sm font-semibold text-slate-800 mb-3">
                                        {selected.questionText}
                                    </p>

                                    {/* Answer */}
                                    {selected.userResponse ? (
                                        <div className="bg-slate-50 rounded-xl p-4 mb-3">
                                            <p className="text-sm text-slate-600 leading-relaxed italic">
                                                &ldquo;{selected.userResponse}&rdquo;
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-400 italic mb-3">No answer recorded</p>
                                    )}

                                    {/* Metrics row */}
                                    {qAnalysis && (
                                        <div className="flex items-center gap-4 text-xs text-slate-400">
                                            <span>Confidence: <strong className={getScoreColor(qAnalysis.score)}>{selected.confidenceScore ?? "—"}</strong></span>
                                            <span>Filler words: <strong>{selected.fillerWordCount ?? 0}</strong></span>
                                            <span>Communication: <strong>{selected.speakingRate ?? "—"}</strong></span>
                                        </div>
                                    )}
                                </section>
                            )}

                        </div>
                    </main>
                )}
            </div>
        </div>
    );
}
