import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/footer";
import AuthGuard from "./components/authGuard";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "BookNook",
  description: "Your online library",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* usePathname() use kora component gulo Suspense-er bhitore thakte hoy */}
        <Suspense
          fallback={
            <div className="h-[73px] border-b border-gray-100 bg-white" />
          }
        >
          <Navbar />
        </Suspense>

        <Suspense fallback={<div className="min-h-[60vh]" />}>
          <AuthGuard>{children}</AuthGuard>
        </Suspense>

        <Footer />
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
