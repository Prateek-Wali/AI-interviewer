import { createClient } from "../utils/supabase/server";
import { redirect } from "next/navigation";
import UserMenu from "@/components/dashboard/UserMenu";
import Link from "next/link";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const avatarUrl = user.user_metadata?.avatar_url;

  return (
    <div className="min-h-screen relative font-sans text-slate-900">

      {/* --- 1. RESTORED: MASTER BACKGROUND (Fixed & "Stuck") --- */}
      <div className="fixed inset-0 -z-50 h-full w-full bg-white">
        {/* The Grid - Restored */}
        <div className="absolute h-full w-full bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:40px_40px]"></div>

        {/* Soft Blue Orb (Top Left) - Restored */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-100/50 rounded-full mix-blend-multiply filter blur-[80px] opacity-60 animate-blob"></div>

        {/* Soft Purple Orb (Bottom Right) - Restored */}
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-100/50 rounded-full mix-blend-multiply filter blur-[80px] opacity-60 animate-blob animation-delay-2000"></div>
      </div>

      {/* --- 2. RESTORED: DASHBOARD PILL NAVBAR (Original) --- */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-5xl bg-white/80 backdrop-blur-xl border border-slate-200/60 shadow-sm rounded-full px-6 py-3 flex items-center justify-between transition-all hover:shadow-md">

        {/* Left Side: Logo + Links */}
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <span className="font-bold text-xl text-slate-900 hidden sm:block tracking-tight">DevPrepAI</span>
          </Link>

          <div className="hidden md:flex gap-1 text-sm font-medium text-slate-500">
            <Link href="/dashboard" className="hover:text-blue-600 hover:bg-blue-50/50 px-3 py-1.5 rounded-full transition-all">Dashboard</Link>
            <Link href="/dashboard/history" className="hover:text-blue-600 hover:bg-blue-50/50 px-3 py-1.5 rounded-full transition-all">History</Link>
            <Link href="/dashboard/practice" className="hover:text-blue-600 hover:bg-blue-50/50 px-3 py-1.5 rounded-full transition-all">Practice</Link>
          </div>
        </div>

        {/* Right Side: User Menu */}
        <UserMenu email={user.email || ""} avatarUrl={avatarUrl} />
      </nav>

      {/* --- 3. NEW: FLOATING SIDEBAR (Left Side) --- */}
      <aside className="fixed left-6 top-32 z-40 hidden xl:flex flex-col gap-4">

        {/* Button 1: Start Interview (NOW LINKED) */}
        <Link href="/interview">
          <button className="group relative flex items-center gap-3 bg-white/80 backdrop-blur-xl border border-slate-200/60 shadow-sm hover:shadow-md hover:border-blue-300 p-4 rounded-2xl transition-all w-64 text-left cursor-pointer">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
              🚀
            </div>
            <div>
              <div className="font-bold text-slate-900">Start Interview</div>
              <div className="text-xs text-slate-500">New mock session</div>
            </div>
          </button>
        </Link>

        {/* Button 2: Check Progress */}
        <button className="group relative flex items-center gap-3 bg-white/80 backdrop-blur-xl border border-slate-200/60 shadow-sm hover:shadow-md hover:border-purple-300 p-4 rounded-2xl transition-all w-64 text-left">
          <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
            📊
          </div>
          <div>
            <div className="font-bold text-slate-900">Your Progress</div>
            <div className="text-xs text-slate-500">View stats & history</div>
          </div>
        </button>

      </aside>

      {/* --- CONTENT AREA --- */}
      {/* Added xl:pl-64 to accommodate the sidebar on large screens */}
      <div className="pt-32 pb-12 px-4 sm:px-8 xl:pl-80 max-w-7xl mx-auto transition-all">
        {children}
      </div>

    </div>
  );
}