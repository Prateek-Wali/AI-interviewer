export default function DashboardPage() {
  return (
    <main className="grid grid-cols-1 gap-8">
      
      {/* Welcome Area */}
      <div className="bg-white/60 backdrop-blur-sm p-8 rounded-2xl border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Welcome Back! 👋</h1>
        <p className="text-slate-500">
            Ready to test your skills? Use the sidebar to start a new interview session.
        </p>
      </div>

      {/* Quick Stats (Expanded placeholder) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
             <div className="text-slate-500 text-sm mb-1">Interviews Completed</div>
             <div className="text-3xl font-bold text-slate-900">0</div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
             <div className="text-slate-500 text-sm mb-1">Avg. Score</div>
             <div className="text-3xl font-bold text-slate-900">-</div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
             <div className="text-slate-500 text-sm mb-1">Streak</div>
             <div className="text-3xl font-bold text-slate-900">0 Days</div>
          </div>
      </div>

    </main>
  );
}