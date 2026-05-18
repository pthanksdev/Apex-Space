import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import Sidebar from "@/components/Sidebar";
import TabBar from "@/components/TabBar";
import PWAInstaller from "@/components/PWAInstaller";
import Background3D from "@/components/Background3D";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Apex Collaborative Workspace",
  description: "Real-time task management, team presence, and deadline tracking.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon-192.png",
    shortcut: "/icon-192.png",
    apple: "/icon-512.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Apex Workspace",
  },
};

export const viewport: Viewport = {
  themeColor: "#6366f1",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark bg-[#050505]">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://identitytoolkit.googleapis.com" />
        <link rel="preconnect" href="https://securetoken.googleapis.com" />
        <link rel="preconnect" href="https://firestore.googleapis.com" />
        <link rel="preconnect" href="https://res.cloudinary.com" />
      </head>
      <body className={`${outfit.variable} font-sans antialiased text-white min-h-screen selection:bg-indigo-500/30 overflow-x-hidden`}>
        <Providers>
          <PWAInstaller />
          <Background3D />
          
          <div className="flex min-h-screen relative z-10">
            {/* Desktop Navigation */}
            <Sidebar />
            
            {/* Content Area */}
            <div className="flex-1 flex flex-col min-w-0 pb-[70px] md:pb-0">
              {children}
            </div>
            
            {/* Mobile Navigation */}
            <TabBar />
          </div>
        </Providers>
      </body>
    </html>
  );
}
