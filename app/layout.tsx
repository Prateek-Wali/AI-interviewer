import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import PublicNavbar from "../components/marketing/PublicNavbar"; // <--- Import it

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DevPrepAI",
  description: "AI Technical Interview Prep",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <PublicNavbar />  {/* <--- This handles the logic now */}
        {children}
      </body>
    </html>
  );
}