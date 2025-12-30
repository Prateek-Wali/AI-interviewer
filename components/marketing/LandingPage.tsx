import React from 'react';

const LandingSection = () => {
    return (
        <section className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-transparent">

            {/* -- CONTENT LAYER -- */}
            <div className="relative z-10 w-full max-w-5xl px-6 flex flex-col items-center text-center">

                {/* 1. The Badge */}
                <div className="mb-8 inline-flex items-center rounded-full border border-blue-200 bg-blue-50/50 backdrop-blur-sm px-3 py-1 text-sm font-medium text-blue-600">
                    <span className="flex h-2 w-2 rounded-full bg-blue-500 mr-2 animate-pulse"></span>
                    DevPrepAI v1.0
                </div>

                {/* 2. Main Headline */}
                <h1 className="font-sans text-6xl md:text-8xl font-bold tracking-tight text-slate-900 mb-6 drop-shadow-sm">
                    Crack interviews <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">
                        with ease.
                    </span>
                </h1>

                {/* 3. Subheadline */}
                <p className="font-sans text-lg md:text-xl text-slate-600 mb-10 max-w-2xl leading-relaxed">
                    The industry's first AI interviewer that simulates <span className="text-slate-900 font-semibold">high-stakes friction</span>. It doesn't just ask questions—it interrupts, challenges, and grades your composure.
                </p>

                {/* 4. Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto">
                    <button className="group px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-semibold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 cursor-pointer flex items-center justify-center gap-2">
                        Start Sample Interview
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
                    </button>

                    <button className="px-8 py-4 bg-white/50 backdrop-blur-sm border border-slate-200 hover:border-slate-400 text-slate-600 hover:text-slate-900 rounded-full font-medium transition-all shadow-sm hover:shadow-md cursor-pointer flex items-center justify-center gap-2">
                        <span className="text-lg">▶</span> See How It Works
                    </button>
                </div>

            </div>
        </section>
    );
};

export default LandingSection;