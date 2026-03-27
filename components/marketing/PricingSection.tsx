import React from 'react';
import Link from 'next/link';

// We define a type so the component knows what "user" looks like
// (You can use 'any' if you prefer, but this is safer)
interface PricingProps {
  user?: any; // Accepting the user session prop
}

const PricingSection = ({ user }: PricingProps) => {
  return (
    <section id="pricing" className="relative w-full py-24 bg-transparent font-inter">

      <div className="max-w-7xl mx-auto px-6 relative z-10">

        {/* Header */}
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h3 className="font-mona-sans font-bold text-[clamp(2rem,4vw,3.5rem)] tracking-tighter-gh leading-[1.15] text-gh-text-light mb-4">
            Invest in your career, <br /> not your anxiety.
          </h3>
          <p className="font-inter font-normal text-gh-muted text-base">
            Cheaper than a single mock interview with a human. <br />
            More effective than grinding LeetCode alone.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="max-w-md mx-auto">

          {/* --- TIER 1: STARTER (The Important One) --- */}
          <div className="relative group bg-white p-8 rounded-xl border border-gh-border hover:border-gh-accent/50 transition-all hover:shadow-md">
            <div className="mb-6">
              <h4 className="font-mona-sans font-semibold text-xl tracking-[-0.01em] text-gh-text-light mb-2">Starter</h4>
              <p className="text-gh-muted text-sm h-10">Perfect for a quick warm-up before a screening.</p>
            </div>
            <div className="flex items-baseline mb-8">
              <span className="font-mona-sans font-bold text-[3rem] tracking-tightest text-gh-text-light">$0</span>
              <span className="text-gh-muted font-normal text-base ml-2">/ month</span>
            </div>

            <ul className="space-y-4 mb-8 text-gh-muted text-sm font-inter">
              <li className="flex items-center gap-3">
                <span className="text-gh-accent">✓</span> 10 AI Interview / mo
              </li>
              <li className="flex items-center gap-3">
                <span className="text-gh-accent">✓</span> Standard Difficulty
              </li>
              <li className="flex items-center gap-3">
                <span className="text-gh-accent">✓</span> Basic Feedback
              </li>
            </ul>

            {/* --- SMART BUTTON LOGIC --- */}
            {user ? (
              // If Logged In: Go to Dashboard
              <Link href="/dashboard">
                <button className="w-full py-2.5 px-4 rounded-md bg-gh-accent border border-transparent font-medium text-sm text-white hover:bg-green-700 transition-all cursor-pointer shadow-sm">
                  Go to Dashboard &rarr;
                </button>
              </Link>
            ) : (
              // If Logged Out: Go to Signup
              <Link href="/signup">
                <button className="w-full py-2.5 px-4 rounded-md border border-gh-border font-medium text-sm text-gh-text-light hover:bg-[#f6f8fa] transition-all cursor-pointer">
                  Choose Starter
                </button>
              </Link>
            )}
          </div>



        </div>

        {/* Footer Note */}
        <div className="mt-16 text-center">
          <p className="text-sm text-slate-400">
            Cancel anytime. Secure payment via Stripe. <br />
            Students get 20% off with .edu email.
          </p>
        </div>

      </div>
    </section>
  );
};

export default PricingSection;