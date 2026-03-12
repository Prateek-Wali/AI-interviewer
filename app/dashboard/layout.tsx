import { createClient } from "@/lib/supabase/server";
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

      {/* --- 1. NAVBAR (PRESERVED EXACTLY AS IS) --- */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-5xl bg-white/50 backdrop-blur-xl border border-slate-200/60 shadow-sm rounded-full px-6 py-3 flex items-center justify-between transition-all hover:shadow-md">

        {/* Left Side: Logo + Links */}
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <span className="font-bold text-xl text-slate-900 hidden sm:block tracking-tight">Lintrvw</span>
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

      {/* --- 2. CONTENT AREA (Padding adjusted for new design) --- */}
      <div className="pt-24 pb-12 transition-all">
        {children}
      </div>

    </div>
  );
}