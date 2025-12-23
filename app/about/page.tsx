import React from 'react';

export default function About() {
    return (
        <main className="relative min-h-screen w-full overflow-x-hidden selection:bg-blue-100">

            {/* --- STATIONARY BACKGROUND LAYER --- */}
            <div className="fixed inset-0 -z-50 h-full w-full bg-white">
                <div className="absolute h-full w-full bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100/60 rounded-full mix-blend-multiply filter blur-[100px] opacity-70"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-100/60 rounded-full mix-blend-multiply filter blur-[100px] opacity-70"></div>
            </div>

            {/* --- SCROLLABLE CONTENT LAYER --- */}
            <div className="relative z-10 pt-32 pb-20 px-6 max-w-6xl mx-auto space-y-32">

                {/* SECTION 1: THE HERO & THE REALITY (Redesigned) */}
                <section className="flex flex-col items-center text-center space-y-12">
                    
                    {/* The Hook */}
                    <div className="max-w-3xl space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold uppercase tracking-wide">
                            <span>🚀 Built for the 2025 Job Market</span>
                        </div>
                        <h1 className="font-sans text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-tight">
                            Interviews can be overwhelming. <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                                DevPrepAI can help.
                            </span>
                        </h1>
                        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                            "LeetCode grinding" isn't enough anymore. You need to handle the heat.
                        </p>
                    </div>

                    {/* The "Bento Grid" - Breaking the paragraph into Visual Cards */}
                    <div className="grid md:grid-cols-3 gap-6 w-full text-left">
                        
                        {/* Card 1: The Problem (Dark Mode style for contrast) */}
                        <div className="md:col-span-2 bg-slate-900 text-white p-8 rounded-3xl shadow-xl flex flex-col justify-between relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
                            <div className="relative z-10">
                                <h3 className="text-2xl font-bold mb-2">The "Application Black Hole"</h3>
                                <p className="text-slate-400 text-lg leading-relaxed">
                                    You apply to <span className="text-white font-bold">200 jobs</span>. You get <span className="text-white font-bold">1 callback</span>.
                                    <br />
                                    The market is unforgiving. If you are unprepared for that call, you're back to square one.
                                    <br /><br />
                                    <span className="text-blue-400 font-semibold">DevPrepAI is your safety net.</span> Fail here, safely, and learn from your mistakes, so you crush it when it counts.
                                </p>
                            </div>
                        </div>

                        {/* Card 2: Contextual Engine */}
                        <div className="bg-white/60 backdrop-blur-md border border-slate-200 p-8 rounded-3xl hover:border-blue-300 transition-colors shadow-sm">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6 text-2xl">
                                🎯
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">No Generic Questions</h3>
                            <p className="text-slate-600">
                                Our engine scans <span className="font-semibold text-slate-900">your resume</span>. We grill you on <em>your</em> projects and <em>your</em> specific tech stack.
                            </p>
                        </div>

                        {/* Card 3: Feedback Loop */}
                        <div className="bg-white/60 backdrop-blur-md border border-slate-200 p-8 rounded-3xl hover:border-purple-300 transition-colors shadow-sm">
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6 text-2xl">
                                📊
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Granular Feedback</h3>
                            <p className="text-slate-600">
                                We catch your "Um's," technical inaccuracies, and behavioral red flags instantly. Turn weaknesses into offers.
                            </p>
                        </div>

                        {/* Card 4: The Philosophy */}
                        <div className="md:col-span-2 bg-gradient-to-br from-blue-50 to-white border border-blue-100 p-8 rounded-3xl flex items-center">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Why we built this?</h3>
                                <p className="text-slate-600">
                                    We realized that passing a technical screen wasn't just about code correctness—it was about <span className="font-semibold text-slate-900">communicating under pressure.</span> We simulate the unpredictability of a human interviewer.
                                </p>
                            </div>
                        </div>

                    </div>
                </section>

                {/* SECTION 2: THE PRODUCT (Kept mostly same, adjusted width) */}
                <section className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-3xl p-8 md:p-12 shadow-sm">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-slate-900 mb-6">The "Friction" Engine</h2>
                            <p className="text-lg text-slate-600 mb-8">
                                Most AI interviewers are too nice. They nod and say "Good job."
                                <br />
                                <span className="font-semibold text-slate-900">Real senior engineers don't do that.</span>
                            </p>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-4 text-slate-700">
                                    <span className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm shrink-0">⚡</span>
                                    <span><strong>Interrupts You:</strong> If you start rambling, the AI cuts you off.</span>
                                </li>
                                <li className="flex items-start gap-4 text-slate-700">
                                    <span className="bg-purple-100 text-purple-600 rounded-full w-8 h-8 flex items-center justify-center text-sm shrink-0">🧠</span>
                                    <span><strong>Doubts You:</strong> It asks "Are you sure?" even when you're right, just to test your confidence.</span>
                                </li>
                                <li className="flex items-start gap-4 text-slate-700">
                                    <span className="bg-cyan-100 text-cyan-600 rounded-full w-8 h-8 flex items-center justify-center text-sm shrink-0">⏱️</span>
                                    <span><strong>Pressures You:</strong> Silence detection nudges you if you freeze.</span>
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
                </section>

                {/* SECTION 3: THE TEAM */}
                <section>
                    <h2 className="text-center text-3xl font-bold text-slate-900 mb-12">Built by Students, for Students</h2>

                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">

                        {/* FOUNDER 1: Prateek */}
                        <div className="group flex flex-col items-center text-center p-8 bg-white/60 backdrop-blur-sm border border-slate-200 rounded-3xl hover:border-blue-300 transition-all hover:shadow-lg">
                            <div className="relative mb-6">
                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-100 shadow-inner bg-slate-200">
                                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Prateek" alt="Prateek" className="w-full h-full object-cover" />
                                </div>
                                <div className="absolute bottom-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full border-2 border-white">
                                    CEO
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-slate-900">Prateek Wali</h3>
                            <p className="text-blue-600 font-medium text-sm mb-4">Founder & Engineering Lead</p>
                            <p className="text-slate-600 text-sm leading-relaxed max-w-sm">
                                CS Student at NJIT & Amazon Junior Software Developer. I realized that passing the technical screen wasn't about code correctness, but about handling the "heat" of the moment.
                            </p>
                        </div>

                        {/* FOUNDER 2: Co-Founder */}
                        <div className="group flex flex-col items-center text-center p-8 bg-white/60 backdrop-blur-sm border border-slate-200 rounded-3xl hover:border-purple-300 transition-all hover:shadow-lg">
                            <div className="relative mb-6">
                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-100 shadow-inner bg-slate-200">
                                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=CoFounder" alt="Co-Founder" className="w-full h-full object-cover" />
                                </div>
                                <div className="absolute bottom-0 right-0 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full border-2 border-white">
                                    CTO
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-slate-900">Your Co-Founder</h3>
                            <p className="text-purple-600 font-medium text-sm mb-4">Co-Founder & Tech Lead</p>
                            <p className="text-slate-600 text-sm leading-relaxed max-w-sm">
                                [Bio Placeholder] Specialist in distributed systems and AI architecture. Building the backend engine that powers our real-time voice latency.
                            </p>
                        </div>

                    </div>
                </section>

                {/* SECTION 4: THE ROADMAP */}
                <section className="border-t border-slate-200 pt-16">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">What's Next?</h2>
                            <p className="text-slate-500">We are shipping features weekly.</p>
                        </div>
                        <button className="mt-4 md:mt-0 px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-sm font-semibold transition-colors">
                            Request a Feature
                        </button>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="p-6 bg-slate-50/80 backdrop-blur-sm rounded-2xl border border-slate-100">
                            <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded uppercase tracking-wider">Now</span>
                            <h4 className="font-bold text-slate-900 mt-3">Algorithms Mode</h4>
                            <p className="text-sm text-slate-500 mt-2">Core data structures (Arrays, Trees, Graphs) with strict time limits.</p>
                        </div>

                        <div className="p-6 bg-slate-50/80 backdrop-blur-sm rounded-2xl border border-slate-100">
                            <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded uppercase tracking-wider">Coming Soon</span>
                            <h4 className="font-bold text-slate-900 mt-3">System Design</h4>
                            <p className="text-sm text-slate-500 mt-2">Whiteboard-style interviews for scaling distributed systems.</p>
                        </div>

                        <div className="p-6 bg-slate-50/80 backdrop-blur-sm rounded-2xl border border-slate-100">
                            <span className="text-xs font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded uppercase tracking-wider">Planning</span>
                            <h4 className="font-bold text-slate-900 mt-3">Behavioral AI</h4>
                            <p className="text-sm text-slate-500 mt-2">Practicing STAR method responses with sentiment analysis.</p>
                        </div>
                    </div>
                </section>

            </div>
        </main>
    );
}