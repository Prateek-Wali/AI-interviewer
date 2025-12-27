import { createClient } from "../utils/supabase/server";
import { redirect } from "next/navigation";
import UserMenu from "@/components/UserMenu";
import Link from "next/link"; // Changed to Link for faster navigation

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
      
      {/* --- BACKGROUND LAYER (Fixed & "Stuck") --- */}
      <div className="fixed inset-0 -z-50 h-full w-full bg-white">
        {/* The Grid */}
        <div className="absolute h-full w-full bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        
        {/* Soft Blue Orb (Top Left) */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-100/50 rounded-full mix-blend-multiply filter blur-[80px] opacity-60 animate-blob"></div>
        
        {/* Soft Purple Orb (Bottom Right) */}
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-100/50 rounded-full mix-blend-multiply filter blur-[80px] opacity-60 animate-blob animation-delay-2000"></div>
      </div>

      {/* --- DASHBOARD PILL NAVBAR --- */}
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

      {/* --- CONTENT AREA (Scrollable) --- */}
      {/* pt-32 gives slightly more breathing room for the navbar */}
      <div className="pt-32 pb-12 px-4 sm:px-8">
        {children}
      </div>
      
    </div>
  );
}