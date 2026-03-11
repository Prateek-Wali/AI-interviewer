import React from 'react';

const LandingSection = () => {
    return (
        <section className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-transparent font-inter">

            {/* -- CONTENT LAYER -- */}
            <div className="relative z-10 w-full max-w-5xl px-6 flex flex-col items-center text-center">

                {/* 2. Main Headline */}
                <h1 className="font-mona-sans font-semibold text-[clamp(2.5rem,6vw,4.5rem)] tracking-tightest text-gh-text-light mb-6 leading-[1.1]">
                    Crack interviews <br />
                    <span className="text-gh-accent">
                        with ease.
                    </span>
                </h1>

                {/* 3. Subheadline */}
                <p className="font-inter font-normal text-lg tracking-normal text-gh-muted mb-10 max-w-2xl leading-[1.6]">
                    An AI interviewer that simulates <span className="text-gh-text-light font-medium">a real interview</span>. It doesn't just ask questions—it interrupts, challenges, and grades your response.
                </p>

                {/* 4. Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto">
                    <button className="group px-6 py-3 bg-gh-accent hover:bg-green-700 text-white rounded-md font-medium text-sm transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2">
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