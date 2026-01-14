"use client";

import { useState } from 'react';
import { Sparkles, TrendingUp, Award, ArrowRight, Code, Brain, Target } from 'lucide-react';
import Link from "next/link";

interface DashboardContentProps {
  firstName: string;
}

export default function DashboardContent({ firstName }: DashboardContentProps) {
  const [isHovering, setIsHovering] = useState(false);

  return (
    // CHANGE 1: Removed 'bg-white' so the background layers show through clearly
    <div className="min-h-screen text-gray-900 overflow-hidden relative">
      
      {/* CHANGE 2: Changed to 'fixed inset-0' so it starts at the very top of the screen */}
      {/* GRID PATTERN */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none -z-10"></div>

      {/* CHANGE 3: Changed to 'fixed inset-0' for blobs as well */}
      {/* BOLT DESIGN BLOBS */}
      <div className="fixed inset-0 opacity-[0.015] pointer-events-none -z-10">
        <div className="absolute top-20 right-32 w-80 h-80 bg-blue-500 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 left-40 w-80 h-80 bg-gray-400 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        
        {/* Main Content Area */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div className="space-y-6">
              
              {/* Welcome Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-sm font-medium animate-pulse-glow bg-white/50 backdrop-blur-sm">
                <Sparkles className="w-4 h-4" />
                Welcome back, {firstName}
              </div>

              {/* Headline */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight text-gray-900 animate-slide-down">
                Master your
                <span className="block text-blue-600">
                  tech interviews
                </span>
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed animate-slide-down" style={{ animationDelay: '0.1s' }}>
                Practice with AI-powered mock interviews. Get real-time feedback, improve your skills, and land your dream job.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 animate-slide-down" style={{ animationDelay: '0.2s' }}>
                
                {/* Link to Setup */}
                <Link href="/interview/setup">
                    <button
                    className="group relative px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-lg transition-all duration-200 hover:shadow-lg hover:shadow-blue-600/30 flex items-center gap-2 cursor-pointer"
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                    >
                    Start Interview
                    <ArrowRight className={`w-5 h-5 transition-transform ${isHovering ? 'translate-x-1' : ''}`} />
                    </button>
                </Link>

                <button className="px-8 py-4 bg-white hover:bg-gray-50 text-gray-900 rounded-lg font-semibold text-lg transition-all duration-200 border border-gray-300 hover:border-gray-400 shadow-sm">
                  View Progress
                </button>
              </div>

              {/* Mini Stats Row */}
              <div className="flex items-center gap-8 pt-4 animate-slide-down" style={{ animationDelay: '0.3s' }}>
                <div>
                  <div className="text-3xl font-bold text-gray-900">2.5K+</div>
                  <div className="text-sm text-gray-500">Active Users</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">98%</div>
                  <div className="text-sm text-gray-500">Success Rate</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">50K+</div>
                  <div className="text-sm text-gray-500">Interviews</div>
                </div>
              </div>
            </div>

            {/* Right Side Stats Card */}
            <div className="relative animate-slide-in">
              <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 p-8 space-y-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">Your Stats</h3>
                  <Sparkles className="w-6 h-6 text-blue-600 animate-bounce-slow" />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg group-hover:scale-110 transition-transform">
                        <Target className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Interviews Completed</div>
                        <div className="text-2xl font-bold text-gray-900">0</div>
                      </div>
                    </div>
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg group-hover:scale-110 transition-transform">
                        <Brain className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Average Score</div>
                        <div className="text-2xl font-bold text-gray-900">-</div>
                      </div>
                    </div>
                    <div className="text-emerald-600 text-sm font-semibold">+0%</div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg group-hover:scale-110 transition-transform">
                        <Award className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Current Streak</div>
                        <div className="text-2xl font-bold text-gray-900">0 Days</div>
                      </div>
                    </div>
                    <Sparkles className="w-5 h-5 text-yellow-500" />
                  </div>
                </div>

                <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="absolute inset-y-0 left-0 bg-blue-600 rounded-full animate-progress" style={{ width: '10%' }} />
                </div>
                <p className="text-sm text-gray-500 text-center">Start your first interview!</p>
              </div>
            </div>
          </div>

          {/* Bottom Cards */}
          <div className="grid md:grid-cols-3 gap-6 animate-slide-down" style={{ animationDelay: '0.4s' }}>
            <div className="group p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 hover:border-gray-300 transition-all hover:shadow-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Code className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Coding Challenges</h3>
              <p className="text-gray-600 text-sm mb-4">Practice algorithms and data structures with real interview questions</p>
              <a href="#" className="text-blue-600 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                Start practicing <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            <div className="group p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 hover:border-gray-300 transition-all hover:shadow-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Brain className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">System Design</h3>
              <p className="text-gray-600 text-sm mb-4">Master system design interviews with guided practice sessions</p>
              <a href="#" className="text-blue-600 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                Learn more <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            <div className="group p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 hover:border-gray-300 transition-all hover:shadow-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Award className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Behavioral Prep</h3>
              <p className="text-gray-600 text-sm mb-4">Get ready for behavioral interviews with AI-powered feedback</p>
              <a href="#" className="text-blue-600 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                Get started <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}