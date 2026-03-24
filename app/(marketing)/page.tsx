import LandingSection from '../../components/marketing/LandingPage';
import React from 'react';

export default function Home() {
    return (
        <main className="relative min-h-screen w-full selection:bg-blue-100 overflow-hidden">

            {/* --- MASTER BACKGROUND (Fixed Layer) --- */}
            <div className="fixed inset-0 -z-50 h-full w-full bg-white">
                <div className="absolute h-full w-full bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-100/80 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-drift-slow"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-100/80 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-drift-medium"></div>
                <div className="absolute top-[40%] left-[40%] w-[400px] h-[400px] bg-cyan-50/80 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-drift-fast"></div>
            </div>

            {/* --- SCROLLABLE CONTENT --- */}
            <div className="relative z-10 flex flex-col w-full space-y-32 pb-24">

                {/* 1. HERO SECTION (Your original Landing Component) */}
                <LandingSection />

                {/* 2. THE REALITY CHECK (Imported from old About Page) */}
                <section className="px-6 max-w-6xl mx-auto flex flex-col items-center text-center space-y-12">

                    {/* The Hook */}
                    <div className="max-w-3xl space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-gh-border text-gh-muted text-xs font-medium tracking-wide">
                            <span>Built for the 2026 Job Market</span>
                        </div>
                        <h2 className="font-mona-sans font-semibold text-4xl md:text-5xl tracking-tightest leading-tight text-gh-text-light">
                            The interview process can be overwhelming. <br />
                            <span className="text-gh-accent">
                                Lintrvw can help.
                            </span>
                        </h2>
                        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                            "LeetCode grinding" isn't enough anymore. You need to be able to communicate through your thought process.
                        </p>
                    </div>

                    {/* The "Bento Grid" */}
                    <div className="grid md:grid-cols-3 gap-6 w-full text-left">

                        {/* Card 1: The Problem */}
                        <div className="md:col-span-2 bg-slate-900 text-white p-8 rounded-3xl shadow-xl flex flex-col justify-between relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
                            <div className="relative z-10">
                                <h3 className="font-mona-sans font-semibold tracking-tight text-2xl mb-2">The "Application Black Hole"</h3>
                                <p className="text-slate-400 text-lg leading-relaxed font-inter">
                                    You apply to <span className="text-white font-bold">200 jobs</span>. You get <span className="text-white font-bold">1 callback</span>.
                                    <br />
                                    The market is unforgiving. If you are unprepared for that call, you're back to square one.
                                    <br /><br />
                                    <span className="font-mona-sans font-semibold text-white tracking-tight text-xl">Lintrvw is your safety net.</span> Fail here, safely, and learn from your mistakes.
                                </p>
                            </div>
                        </div>

                        {/* Card 2: Contextual Engine */}
                        <div className="bg-white/60 backdrop-blur-md border border-slate-200 p-8 rounded-3xl hover:border-blue-300 transition-colors shadow-sm">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6 text-2xl">
                                🎯
                            </div>
                            <h3 className="font-mona-sans font-semibold tracking-tight text-xl mb-2 text-gh-text-light">No Generic Questions</h3>
                            <p className="text-slate-600">
                                Our engine scans <span className="font-semibold text-slate-900">your resume</span>. We ask you questions on <em>your</em> projects and tech stack.
                            </p>
                        </div>

                        {/* Card 3: Feedback Loop */}
                        <div className="bg-white/60 backdrop-blur-md border border-slate-200 p-8 rounded-3xl hover:border-purple-300 transition-colors shadow-sm">
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6 text-2xl">
                                📊
                            </div>
                            <h3 className="font-mona-sans font-semibold tracking-tight text-xl mb-2 text-gh-text-light">Granular Feedback</h3>
                            <p className="text-slate-600">
                                We catch your "Um's," technical inaccuracies, and behavioral red flags instantly.
                            </p>
                        </div>

                        {/* Card 4: Philosophy */}
                        <div className="md:col-span-2 bg-gradient-to-br from-blue-50 to-white border border-blue-100 p-8 rounded-3xl flex items-center">
                            <div>
                                <h3 className="font-mona-sans font-semibold tracking-tight text-xl mb-2 text-gh-text-light">Why we built this?</h3>
                                <p className="text-slate-600">
                                    We realized that passing a technical screen wasn't just about code correctness—it was about <span className="font-semibold text-slate-900">communicating under pressure.</span>
                                </p>
                            </div>
                        </div>

                    </div>
                </section>

                {/* 3. THE PRODUCT SECTION */}
                <section className="px-6 max-w-6xl mx-auto w-full">
                    <div className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-3xl p-8 md:p-12 shadow-sm">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div>
                                <h2 className="font-mona-sans font-semibold tracking-tight text-3xl mb-6 text-gh-text-light">The "Friction" Engine</h2>
                                <p className="text-lg text-slate-600 mb-8">
                                    Most AI interviewers just ask you the question and don't engage with what you reply with.
                                    <br />
                                    <span className="font-semibold text-slate-900">Real interviews are interactive.</span>
                                </p>
                                <ul className="space-y-4">
                                    <li className="flex items-start gap-4 text-gh-muted font-inter">
                                        <span className="bg-[#f6f8fa] text-gh-text-light border border-gh-border rounded-md w-8 h-8 flex items-center justify-center text-sm shrink-0 shadow-sm">⚡</span>
                                        <span><strong className="text-gh-text-light">Interrupts You:</strong> If you start rambling, the AI cuts you off.</span>
                                    </li>
                                    <li className="flex items-start gap-4 text-gh-muted font-inter">
                                        <span className="bg-[#f6f8fa] text-gh-text-light border border-gh-border rounded-md w-8 h-8 flex items-center justify-center text-sm shrink-0 shadow-sm">🧠</span>
                                        <span><strong className="text-gh-text-light">Doubts You:</strong> It asks "Are you sure?" even when you're right.</span>
                                    </li>
                                    <li className="flex items-start gap-4 text-gh-muted font-inter">
                                        <span className="bg-[#f6f8fa] text-gh-text-light border border-gh-border rounded-md w-8 h-8 flex items-center justify-center text-sm shrink-0 shadow-sm">⏱️</span>
                                        <span><strong className="text-gh-text-light">Pressures You:</strong> Silence detection nudges you if you freeze.</span>
                                    </li>
                                </ul>
                            </div>
                            {/* Visual Representation */}
                            <div className="bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-700">
                                <div className="flex gap-2 mb-4">
                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                </div>
                                <div className="space-y-4 font-mono text-sm">
                                    <div className="text-slate-400 border-l-2 border-slate-700 pl-3">
                                        <span className="text-blue-400">AI:</span> "Wait, why did you choose a HashMap there? Wouldn't an Array be O(1) space?"
                                    </div>
                                    <div className="text-slate-300 border-l-2 border-green-500 pl-3">
                                        <span className="text-green-400">You:</span> "Well, because the keys are sparse, an array would actually waste memory..."
                                    </div>
                                    <div className="text-slate-400 border-l-2 border-slate-700 pl-3">
                                        <span className="text-blue-400">AI:</span> "Good catch. Proceed."
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4. THE ROADMAP */}
                <section className="px-6 max-w-6xl mx-auto w-full border-t border-slate-200 pt-16">
                    <div className="mb-8">
                        <h2 className="font-mona-sans font-semibold tracking-tight text-2xl text-gh-text-light">What&apos;s Next?</h2>
                        <p className="text-gh-muted">We are shipping features weekly.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="p-6 bg-slate-50/80 backdrop-blur-sm rounded-2xl border border-slate-100">
                            <span className="text-xs font-medium text-gh-text-light bg-[#f6f8fa] border border-gh-border px-2 py-1 rounded shadow-sm">Now</span>
                            <h4 className="font-mona-sans font-semibold tracking-tight text-gh-text-light mt-3 text-lg">Behavioral Interview</h4>
                            <p className="text-sm text-gh-muted mt-2">Practicing STAR method responses with sentiment analysis.</p>
                        </div>

                        <div className="p-6 bg-slate-50/80 backdrop-blur-sm rounded-2xl border border-slate-100">
                            <span className="text-xs font-medium text-gh-accent bg-gh-accent/10 border border-gh-accent/20 px-2 py-1 rounded">Coming Soon</span>
                            <h4 className="font-mona-sans font-semibold tracking-tight text-gh-text-light mt-3 text-lg">Technical Interview</h4>
                            <p className="text-sm text-gh-muted mt-2">Core data structures (Arrays, Trees, Graphs) with strict time limits.</p>
                        </div>

                        <div className="p-6 bg-slate-50/80 backdrop-blur-sm rounded-2xl border border-slate-100">
                            <span className="text-xs font-medium text-gh-accent bg-gh-accent/10 border border-gh-accent/20 px-2 py-1 rounded">Coming Soon</span>
                            <h4 className="font-mona-sans font-semibold tracking-tight text-gh-text-light mt-3 text-lg">System Design</h4>
                            <p className="text-sm text-gh-muted mt-2">Whiteboard-style interviews for scaling distributed systems.</p>
                        </div>
                    </div>
                </section>

                {/* 5. THE TEAM */}
                <section className="px-6 max-w-6xl mx-auto w-full">
                    <h2 className="font-mona-sans font-semibold tracking-tightest text-center text-3xl text-gh-text-light mb-12">Built by Students, for Students</h2>

                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">

                        {/* FOUNDER 1: Prateek */}
                        <div className="group flex flex-col items-center text-center p-8 bg-white/60 backdrop-blur-sm border border-slate-200 rounded-3xl hover:border-navy-accent/30 transition-all hover:shadow-lg">
                            <div className="relative mb-6">
                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-100 shadow-inner bg-slate-200">
                                    <img src="/prateek_pic.jpg" alt="Prateek" className="w-full h-full object-cover object-top" />
                                </div>
                                <div className="absolute bottom-0 right-0 bg-gh-text-light text-white text-xs font-medium tracking-wide px-3 py-1 rounded-full border-2 border-white">
                                    CEO
                                </div>
                            </div>

                            <h3 className="font-mona-sans font-semibold tracking-tight text-xl text-gh-text-light">Prateek Wali</h3>
                            <p className="text-gh-muted font-medium text-sm mb-4">Founder</p>
                            <p className="text-slate-600 text-sm leading-relaxed max-w-sm">
                                CS Student at NJIT. I realized that passing the interview process was harder than the job itself, so I made this webapp to help students to be able to feel ready for the interview.
                            </p>
                        </div>

                        {/* FOUNDER 2: Co-Founder */}
                        <div className="group flex flex-col items-center text-center p-8 bg-white/60 backdrop-blur-sm border border-slate-200 rounded-3xl hover:border-gold-accent/30 transition-all hover:shadow-lg">
                            <div className="relative mb-6">
                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-100 shadow-inner bg-slate-200">
                                    <img src="/Shreeya_pic.jpg" alt="Shreeya" className="w-full h-full object-cover" />
                                </div>
                                <div className="absolute bottom-0 right-0 bg-gh-text-light text-white text-xs font-medium tracking-wide px-3 py-1 rounded-full border-2 border-white">
                                    CTO
                                </div>
                            </div>

                            <h3 className="font-mona-sans font-semibold tracking-tight text-xl text-gh-text-light">Shreeya Gupta</h3>
                            <p className="text-gh-muted font-medium text-sm mb-4">Co-Founder</p>
                            <p className="text-slate-600 text-sm leading-relaxed max-w-sm">
                                Computer Engineering student at UMD.
                            </p>
                        </div>

                    </div>
                </section>

            </div>
        </main>
    );
}