import React from 'react';

const PricingSection = () => {
  return (
    // Removed: border-t, border-slate-200, bg-white
    // Added: bg-transparent
    <section id="pricing" className="relative w-full py-24 bg-transparent">
      
      {/* Note: I removed the Background Grid div from here because it's now in page.tsx */}

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16 max-w-2xl mx-auto">

          <h3 className="text-4xl font-bold text-slate-900 mb-4">
            Invest in your career, <br/> not your anxiety.
          </h3>
          <p className="text-slate-600 text-lg">
            Cheaper than a single mock interview with a human. <br/>
            More effective than grinding LeetCode alone.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          
          {/* TIER 1: STARTER */}
          {/* Added backdrop-blur to cards so they stand out against the passing background */}
          <div className="relative group bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-slate-200 hover:border-blue-200 transition-all hover:shadow-lg hover:-translate-y-1">
            <div className="mb-6">
              <h4 className="text-xl font-bold text-slate-900 mb-2">Starter</h4>
              <p className="text-slate-500 text-sm h-10">Perfect for a quick warm-up before a screening.</p>
            </div>
            <div className="flex items-baseline mb-8">
              <span className="text-4xl font-bold text-slate-900">$0</span>
              <span className="text-slate-500 ml-2">/ month</span>
            </div>
            
            <ul className="space-y-4 mb-8 text-slate-600 text-sm">
              <li className="flex items-center gap-3">
                <span className="text-blue-500">✓</span> 1 AI Interview / mo
              </li>
              <li className="flex items-center gap-3">
                <span className="text-blue-500">✓</span> Standard Difficulty
              </li>
              <li className="flex items-center gap-3">
                <span className="text-blue-500">✓</span> Basic Feedback
              </li>
              <li className="flex items-center gap-3 opacity-50">
              </li>
            </ul>

            <button className="w-full py-3 px-6 rounded-xl border border-slate-200 font-semibold text-slate-700 hover:border-blue-500 hover:text-blue-600 transition-all cursor-pointer">
              Choose Starter
            </button>
          </div>

          {/* TIER 2: PRO */}
          <div className="relative group bg-slate-900 p-8 rounded-3xl shadow-xl transform md:scale-105 md:-translate-y-2 z-10 border border-slate-800">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg tracking-wider">
              MOST POPULAR
            </div>

            <div className="mb-6">
              <h4 className="text-xl font-bold text-white mb-2">Pro</h4>
              <p className="text-slate-400 text-sm h-10">Serious prep for active job seekers.</p>
            </div>
            <div className="flex items-baseline mb-8">
              <span className="text-4xl font-bold text-white">$10</span>
              <span className="text-slate-400 ml-2">/ month</span>
            </div>
            
            <ul className="space-y-4 mb-8 text-slate-300 text-sm">
              <li className="flex items-center gap-3">
                <span className="text-cyan-400">✓</span> 10 AI Interviews / mo
              </li>
              <li className="flex items-center gap-3">
                <span className="text-cyan-400">✓</span> Hard Difficulty
              </li>
              <li className="flex items-center gap-3">
                <span className="text-cyan-400">✓</span> Detailed Feedback Analysis
              </li>
              <li className="flex items-center gap-3">
                <span className="text-cyan-400">✓</span> Behavioral & System Design
              </li>
            </ul>

            <button className="w-full py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] cursor-pointer">
              Get Pro Access
            </button>
          </div>

          {/* TIER 3: UNLIMITED */}
          <div className="relative group bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-slate-200 hover:border-purple-200 transition-all hover:shadow-lg hover:-translate-y-1">
            <div className="mb-6">
              <h4 className="text-xl font-bold text-slate-900 mb-2">Unlimited</h4>
              <p className="text-slate-500 text-sm h-10">For those grinding daily until the offer letter.</p>
            </div>
            <div className="flex items-baseline mb-8">
              <span className="text-4xl font-bold text-slate-900">$20</span>
              <span className="text-slate-500 ml-2">/ month</span>
            </div>
            
            <ul className="space-y-4 mb-8 text-slate-600 text-sm">
              <li className="flex items-center gap-3">
                <span className="text-purple-500">✓</span> Unlimited Interviews
              </li>
              <li className="flex items-center gap-3">
                <span className="text-purple-500">✓</span> All Difficulty Levels
              </li>
              <li className="flex items-center gap-3">
                <span className="text-purple-500">✓</span> Priority Support
              </li>
              <li className="flex items-center gap-3">
                <span className="text-purple-500">✓</span> Resume Review AI
              </li>
            </ul>

            <button className="w-full py-3 px-6 rounded-xl border border-slate-200 font-semibold text-slate-700 hover:border-purple-500 hover:text-purple-600 transition-all cursor-pointer">
              Go Unlimited
            </button>
          </div>

        </div>
        
        {/* Footer Note */}
        <div className="mt-16 text-center">
          <p className="text-sm text-slate-400">
            Cancel anytime. Secure payment via Stripe. <br/>
            Students get 20% off with .edu email.
          </p>
        </div>

      </div>
    </section>
  );
};

export default PricingSection;