import React from 'react';

const LandingSection = () => {
    return (
        <section className="relative min-h-screen w-full flex flex-col items-center overflow-hidden bg-transparent font-inter">

            {/* -- CONTENT LAYER -- */}
            <div className="relative z-10 w-full max-w-5xl px-6 pt-[25vh] md:pt-[30vh] pb-24 flex flex-col items-center text-center">

                {/* 2. Main Headline */}
                <h1 className="font-mona-sans font-semibold text-[clamp(2.5rem,6vw,4.5rem)] tracking-tightest text-gh-text-light mb-6 leading-[1.1]">
                    Crack interviews <br />
                    <span className="text-gh-accent">
                        with ease.
                    </span>
                </h1>

                {/* 3. Subheadline */}
                <p className="font-inter font-normal text-lg tracking-normal text-gh-muted mb-30 max-w-2xl leading-[1.6]">
                    An AI interviewer that simulates <span className="text-gh-text-light font-medium">a real interview</span>. It doesn't just ask questions—it interrupts, challenges, and gives feedback on your response.
                </p>

                {/* 4. Demo Video Section */}
                <div className="w-full max-w-3xl mt-30 relative bg-[#0d1117] border border-[#d0d7de] rounded-2xl overflow-hidden shadow-2xl aspect-video group">

                    {/* The Video */}
                    <video
                        src="/demo.mp4"
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="w-full h-full object-cover object-[center_50%]"
                    />

                    {/* Gradient overlay for text readability */}
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 to-transparent"></div>

                    {/* Static Text Overlay Container */}
                    <div className="absolute inset-0 flex items-center justify-center p-6 pointer-events-none z-10">
                        <div className="bg-[#1f2328]/30 backdrop-blur-[2px] border border-[rgba(255,255,255,0.15)] p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-xl">
                            <div className="space-y-4 flex flex-col">
                                {/* AI Message (Right) */}
                                <div className="flex justify-end w-full">
                                    <div className="max-w-[85%] bg-[#0969da] text-white px-3.5 py-2 rounded-[16px] rounded-br-[4px] shadow-[0_0_12px_rgba(9,105,218,0.5)] border border-blue-400/20 font-inter text-[13px] leading-snug">
                                        "Tell me about a time you had to learn a new technology quickly for a project."
                                    </div>
                                </div>
                                {/* User Message (Left) */}
                                <div className="flex justify-start w-full">
                                    <div className="max-w-[85%] text-slate-100 font-inter text-[13px] leading-snug drop-shadow-sm px-1">
                                        "For my final project, we decided to use WebSockets to build a real-time chat feature, and I had to learn it from scratch."
                                    </div>
                                </div>
                                {/* AI Message (Right) */}
                                <div className="flex justify-end w-full">
                                    <div className="max-w-[85%] bg-[#0969da] text-white px-3.5 py-2 rounded-[16px] rounded-br-[4px] shadow-[0_0_12px_rgba(9,105,218,0.5)] border border-blue-400/20 font-inter text-[13px] leading-snug">
                                        "That sounds interesting. Could you go deeper into WebSockets and explain to me what they are?"
                                    </div>
                                </div>
                                {/* User Message (Left) */}
                                <div className="flex justify-start w-full">
                                    <div className="max-w-[85%] text-slate-100 font-inter text-[13px] leading-snug drop-shadow-sm px-1">
                                        "Sure, WebSockets provide a full-duplex communication channel over a single, long-held TCP connection..."
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default LandingSection;