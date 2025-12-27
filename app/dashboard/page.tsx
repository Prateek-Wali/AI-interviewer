export default function DashboardPage() {
  // We don't need the auth check here anymore because the layout handles it!
  
  return (
    <main className="max-w-7xl mx-auto p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Card 1: Start Interview */}
      <div className="md:col-span-2 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group">
        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
          🚀
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Start New Mock Interview</h2>
        <p className="text-slate-500">
          Choose a difficulty and topic to begin a realistic AI-driven coding interview.
        </p>
      </div>

      {/* Card 2: Stats */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Your Progress</h2>
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Interviews Completed</span>
            <span className="font-bold text-slate-900">0</span>
          </div>
        </div>
      </div>
    </main>
  );
}