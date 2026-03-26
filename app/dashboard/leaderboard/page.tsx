export default function LeaderboardPage() {
  return (
    <div className="min-h-[80vh] relative font-sans text-[#1f2328] flex flex-col justify-start pt-[20vh] items-center p-4">
      {/* BACKGROUND */}
      <div className="fixed inset-0 -z-50 h-full w-full bg-white">
        <div className="absolute h-full w-full bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-100/80 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-drift-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-100/80 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-drift-medium"></div>
        <div className="absolute top-[40%] left-[40%] w-[400px] h-[400px] bg-cyan-50/80 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-drift-fast"></div>
      </div>

      <div className="text-center animate-slide-down">
        <h1 className="font-mono font-bold text-4xl tracking-tight text-[#1f2328] mb-4">
          Coming Soon
        </h1>
        <p className="font-mono text-sm text-[#636c76]">
          We are currently working on this page. Check back later!
        </p>
      </div>
    </div>
  );
}
