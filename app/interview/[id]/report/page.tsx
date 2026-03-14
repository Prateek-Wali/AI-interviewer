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
    if (score >= 60) return "text-[#1a7f37]";
    if (score >= 40) return "text-[#9a6700]";
    return "text-[#cf222e]";
}

function getScoreStroke(score: number) {
    if (score >= 60) return "#1a7f37";
    if (score >= 40) return "#9a6700";
    return "#cf222e";
}

function getScoreDot(score: number) {
    if (score >= 60) return "bg-[#1a7f37]";
    if (score >= 40) return "bg-[#9a6700]";
    return "bg-[#cf222e]";
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
                <aside className="w-[280px] shrink-0 border-r border-[#d0d7de] bg-[#f6f8fa] flex flex-col">

                    {/* Sidebar header */}
                    <div className="px-5 pt-6 pb-4 border-b border-[#d0d7de]">
                        <div className="flex items-center gap-2 font-mono text-xs text-[#636c76] uppercase tracking-widest mb-1">
                            <Sparkles className="w-3 h-3" />
                            Report
                        </div>
                        <h2 className="font-mono font-bold text-sm text-[#1f2328]">Questions ({questions.length})</h2>
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
                                        className={`w-full text-left px-5 py-3 flex items-center gap-3 transition-colors duration-150 ${isSelected
                                            ? "bg-[#eaeef2] border-l-[3px] border-l-[#1a7f37]"
                                            : "hover:bg-[#eaeef2] border-l-[3px] border-l-transparent"
                                            }`}
                                    >
                                        {/* Score dot — visible on hover or when selected */}
                                        <div
                                            className={`w-2 h-2 rounded-full shrink-0 transition-colors duration-200 ${isHovered || isSelected
                                                ? "bg-[#1a7f37]"
                                                : "bg-[#d0d7de]"
                                                }`}
                                        ></div>

                                        <span className={`font-mono text-xs truncate ${isSelected ? "text-[#1f2328] font-medium" : "text-[#8c959f]"}`}>
                                            <span className={isSelected ? "text-[#1f2328]" : "text-[#636c76]"}>Q{i + 1}:</span>{" "}
                                            {q.questionText.substring(0, 35)}...
                                        </span>
                                    </button>
                            );
                        })}
                    </nav>

                    {/* Sidebar actions */}
                    <div className="p-4 border-t border-[#d0d7de] space-y-3">
                        <Link href="/dashboard" className="block">
                            <button className="w-full py-2.5 font-mono text-sm text-[#1f2328] bg-white border border-[#d0d7de] rounded-md hover:bg-[#f6f8fa] transition-colors flex items-center justify-center gap-2">
                                <ArrowLeft className="w-4 h-4 text-[#1f2328]" strokeWidth={2} />
                                Back to Dashboard
                            </button>
                        </Link>
                        <Link href="/interview/setup" className="block">
                            <button className="w-full py-2.5 font-mono font-semibold text-sm text-white bg-[#1a7f37] border border-[rgba(27,31,36,0.15)] rounded-md hover:bg-[#115822] transition-colors flex items-center justify-center gap-2">
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
                                <div className="flex items-center gap-4 mb-5">
                                    <Link href="/dashboard/history">
                                        <button className="w-9 h-9 rounded-md bg-white border border-[#d0d7de] flex items-center justify-center hover:bg-[#f6f8fa] text-[#1f2328] transition-colors -ml-4 md:-ml-60">
                                            <ArrowLeft className="w-4 h-4" strokeWidth={2} />
                                        </button>
                                    </Link>
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#dafbe1] border border-[rgba(26,127,55,0.3)] text-[#1a7f37] rounded-full font-mono text-xs uppercase tracking-widest">
                                        <CheckCircle2 className="w-4 h-4" />
                                        Interview Complete
                                    </div>
                                </div>
                                <div className="font-mono text-sm text-[#636c76]">
                                    {interviewDate} · {totalDuration}
                                </div>
                            </section>

                            {/* Score Ring + Stats */}
                            <section className={`flex items-center gap-8 ${showReport ? "animate-report-reveal report-delay-2" : "opacity-0"}`}>
                                {/* SVG Ring */}
                                <div className="relative w-28 h-28 shrink-0 bg-white rounded-full border border-[#d0d7de]">
                                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="42" fill="none" stroke="#eaeef2" strokeWidth="6" />
                                        <circle
                                            cx="50" cy="50" r="42" fill="none"
                                            stroke={getScoreStroke(analysis.overallScore)} strokeWidth="6"
                                            strokeLinecap="round"
                                            strokeDasharray={`${(analysis.overallScore / 100) * 264} 264`}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className={`font-mono font-bold text-4xl tracking-tight ${getScoreColor(analysis.overallScore)}`}>{analysis.overallScore}</span>
                                    </div>
                                </div>

                                {/* Stat pills */}
                                <div className="flex flex-wrap gap-3">
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-[#d0d7de] bg-white">
                                        <MessageSquare className="w-4 h-4 text-[#8c959f]" />
                                        <span className="font-mono text-xs text-[#636c76]">Communication</span>
                                        <span className="font-mono font-bold text-sm text-[#1f2328] ml-1">{analysis.communicationScore}</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-[#d0d7de] bg-white">
                                        <Shield className="w-4 h-4 text-[#8c959f]" />
                                        <span className="font-mono text-xs text-[#636c76]">Confidence</span>
                                        <span className="font-mono font-bold text-sm text-[#1f2328] ml-1">{analysis.confidenceScore}</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-[#d0d7de] bg-white">
                                        <Target className="w-4 h-4 text-[#8c959f]" />
                                        <span className="font-mono text-xs text-[#636c76]">STAR</span>
                                        <span className="font-mono font-bold text-sm text-[#1f2328] ml-1">{starCount}/{questions.length}</span>
                                    </div>
                                </div>
                            </section>

                            {/* Summary */}
                            <section className={showReport ? "animate-report-reveal report-delay-3" : "opacity-0"}>
                                <p className="text-sm text-[#636c76] leading-relaxed">{analysis.summaryText}</p>
                            </section>

                            {/* Strengths & Improvements */}
                            <section className={`grid md:grid-cols-2 gap-4 ${showReport ? "animate-report-reveal report-delay-4" : "opacity-0"}`}>
                                {/* Strengths */}
                                <div className="rounded-lg border border-[#d0d7de] bg-white p-5">
                                    <div className="flex items-center gap-2 mb-3">
                                        <CheckCircle2 className="w-4 h-4 text-[#1a7f37]" />
                                        <h3 className="font-semibold text-sm text-[#1a7f37]">Strengths</h3>
                                    </div>
                                    <ul className="space-y-3">
                                        {analysis.strengths.map((s, i) => (
                                            <li key={i} className="text-xs text-[#636c76] leading-relaxed pt-3 border-t border-[#eaeef2] first:border-0 first:pt-0">
                                                <span className="font-mono font-semibold text-[#1f2328]">{s.title}:</span> {s.description}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Improvements */}
                                <div className="rounded-lg border border-[#d0d7de] bg-white p-5">
                                    <div className="flex items-center gap-2 mb-3">
                                        <TrendingUp className="w-4 h-4 text-[#9a6700]" />
                                        <h3 className="font-semibold text-sm text-[#9a6700]">Areas to Improve</h3>
                                    </div>
                                    <ul className="space-y-3">
                                        {analysis.weaknesses.map((w, i) => (
                                            <li key={i} className="text-xs text-[#636c76] leading-relaxed pt-3 border-t border-[#eaeef2] first:border-0 first:pt-0">
                                                <span className="font-mono font-semibold text-[#1f2328]">{w.title}:</span> {w.description}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </section>

                            {/* Selected Question Detail */}
                            {selected && (
                                <section className={`rounded-lg border border-[#d0d7de] bg-white p-6 ${showReport ? "animate-report-reveal report-delay-5" : "opacity-0"}`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-semibold text-sm text-[#1f2328]">
                                            Q{selectedQuestion + 1} Detail
                                        </h3>
                                        {qAnalysis && (
                                            <div className="flex items-center gap-3">
                                                <span className={`font-mono text-xs font-bold px-2.5 py-1 rounded-full border ${getScoreColor(qAnalysis.score).replace("text-", "border-").replace("-[", "-[").replace("]", "]/30")} ${getScoreColor(qAnalysis.score)} bg-[#f6f8fa]`}>
                                                    {qAnalysis.score}/100
                                                </span>
                                                <span className="font-mono text-xs text-[#8c959f] flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {formatDuration(qAnalysis.duration)}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Question */}
                                    <p className="text-sm font-semibold text-[#1f2328] mb-3">
                                        {selected.questionText}
                                    </p>

                                    {/* Answer */}
                                    {selected.userResponse ? (
                                        <div className="bg-[#f6f8fa] border border-[#d0d7de] rounded-md p-4 mb-3">
                                            <p className="text-xs text-[#636c76] leading-relaxed italic">
                                                &ldquo;{selected.userResponse}&rdquo;
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-[#8c959f] italic mb-3">No answer recorded</p>
                                    )}

                                    {/* Metrics row */}
                                    {qAnalysis && (
                                        <div className="flex items-center gap-4 font-mono text-xs text-[#636c76]">
                                            <span>Confidence: <strong className={getScoreColor(qAnalysis.score)}>{selected.confidenceScore ?? "—"}</strong></span>
                                            <span>Filler words: <strong className="text-[#1f2328]">{selected.fillerWordCount ?? 0}</strong></span>
                                            <span>Communication: <strong className="text-[#1f2328]">{selected.speakingRate ?? "—"}</strong></span>
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
