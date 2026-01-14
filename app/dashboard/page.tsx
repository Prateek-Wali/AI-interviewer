import Link from "next/link";
import { createClient } from "@/app/utils/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Get first name for welcome message
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || "Candidate";

  return (
    <main className="grid grid-cols-1 gap-8">
      
      {/* --- WELCOME AREA --- */}
      <div className="bg-white/60 backdrop-blur-sm p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Welcome back, {firstName}! 👋
            </h1>
            <p className="text-slate-500 text-lg">
                Your AI interviewer is ready.
            </p>
        </div>

        {/* LINK TO RESUME SETUP PAGE */}
        <Link href="/interview/setup">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-full shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-1 flex items-center gap-2 cursor-pointer">
                <span>🚀</span> Start New Interview
            </button>
        </Link>
      </div>

      {/* --- STATS GRID --- */}
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