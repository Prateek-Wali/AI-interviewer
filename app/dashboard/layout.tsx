import { getUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import UserMenu from "@/components/dashboard/UserMenu";
import Link from "next/link";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const avatarUrl = user.user_metadata?.avatar_url;

  return (
    <div className="min-h-screen relative font-sans text-slate-900">

      {/* --- 1. NAVBAR (PRESERVED EXACTLY AS IS) --- */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-5xl bg-white/50 backdrop-blur-xl border border-slate-200/60 shadow-sm rounded-full px-6 py-3 flex items-center justify-between transition-all hover:shadow-md">

        {/* Left Side: Logo + Links */}
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2">
            {/* Icon mark */}
            <div className="w-7 h-7 bg-[#f6f8fa] border border-[#d0d7de] rounded-md flex items-center justify-center">
              <svg width="15" height="15" viewBox="0 0 28 28" fill="none">
                <rect x="4" y="6" width="12" height="2" rx="1" fill="#8c959f"/>
                <rect x="4" y="11" width="18" height="2" rx="1" fill="#8c959f"/>
                <rect x="4" y="16" width="14" height="2" rx="1" fill="#8c959f"/>
                <path d="M4 21 Q5.5 19.5 7 21 Q8.5 22.5 10 21 Q11.5 19.5 13 21 Q14.5 22.5 16 21 Q17.5 19.5 19 21 Q20.5 22.5 22 21"
                  stroke="#cf222e" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
              </svg>
            </div>
            {/* Wordmark */}
            <span className="font-mono font-extrabold text-lg tracking-tight hidden sm:block">
              <span className="text-[#1f2328] relative">
                Lint
                <svg className="absolute -bottom-0.5 left-0 w-full" height="3" viewBox="0 0 40 3" preserveAspectRatio="none">
                  <path d="M0 2 Q5 0 10 2 Q15 4 20 2 Q25 0 30 2 Q35 4 40 2"
                    stroke="#cf222e" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
                </svg>
              </span>
              <span className="text-[#8c959f]">rvw</span>
            </span>
          </Link>

          <div className="hidden md:flex gap-1 text-sm font-medium text-slate-500">
            <Link href="/dashboard" className="hover:text-blue-600 hover:bg-blue-50/50 px-3 py-1.5 rounded-full transition-all">Dashboard</Link>
            <Link href="/dashboard/history" className="hover:text-blue-600 hover:bg-blue-50/50 px-3 py-1.5 rounded-full transition-all">History</Link>
            <Link href="/dashboard/performance" className="hover:text-blue-600 hover:bg-blue-50/50 px-3 py-1.5 rounded-full transition-all">Performance</Link>
            <Link href="/dashboard/leaderboard" className="hover:text-blue-600 hover:bg-blue-50/50 px-3 py-1.5 rounded-full transition-all">Leaderboard</Link>
          </div>
        </div>

        {/* Right Side: User Menu */}
        <UserMenu email={user.email || ""} avatarUrl={avatarUrl} />
      </nav>

      {/* --- 2. CONTENT AREA (Padding adjusted for new design) --- */}
      <div className="pt-24 pb-12 transition-all">
        {children}
      </div>

    </div>
  );
}