import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Layout from "../components/layout/Layout";
import { AuthProvider } from "../../components/auth/AuthProvider";
import HydrationSuppressor from "../components/HydrationSuppressor";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AgentPad - AI Agent Builder",
  description: "Visual AI Agent Builder for DeFi and Blockchain",
  icons: {
    icon: '/agentpad-icon.svg',
    shortcut: '/agentpad-icon.svg',
    apple: '/agentpad-icon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased dark bg-gray-900`}
        suppressHydrationWarning={true}
      >
        <HydrationSuppressor>
          <AuthProvider>
            <Layout>
              {children}
            </Layout>
          </AuthProvider>
        </HydrationSuppressor>
      </body>
    </html>
  );
}
