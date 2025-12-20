// 1. Update the import name and file path
import LandingSection from "../components/landingSection";
import PricingSection from "../components/PricingSection"; 

export default function Home() {
  return (
    <main className="relative min-h-screen w-full selection:bg-blue-100">
      
      {/* --- MASTER BACKGROUND (Fixed Layer) --- */}
      <div className="fixed inset-0 -z-50 h-full w-full bg-white">
         
         {/* Grid */}
         <div className="absolute h-full w-full bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:24px_24px]"></div>
         
         {/* Glows */}
         <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-100/80 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-drift-slow"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-100/80 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-drift-medium"></div>
         <div className="absolute top-[40%] left-[40%] w-[400px] h-[400px] bg-cyan-50/80 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-drift-fast"></div>
      </div>

      {/* --- SCROLLABLE CONTENT --- */}
      <div className="relative z-10 flex flex-col w-full">
        {/* 2. Use the new component name here */}
        <LandingSection />
        <PricingSection />
      </div>
    </main>
  );
}