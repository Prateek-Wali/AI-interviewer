import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import PublicNavbar from "../components/marketing/PublicNavbar"; // <--- Import it

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "Lintrvw",
  description: "AI Technical Interview Prep",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans`}>
        <PublicNavbar />
        {children}
      </body>
    </html>
  );
}