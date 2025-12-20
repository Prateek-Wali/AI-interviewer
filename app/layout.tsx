import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar"; // This puts the Navbar on EVERY page automatically

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DevPrepAI | The Technical Interview Pressure Test",
  description: "Master your technical interview with high-stakes AI simulations."
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}