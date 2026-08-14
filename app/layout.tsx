import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/components/providers/auth-provider";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
});

const plexSans = IBM_Plex_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Documind — Document Intelligence Platform",
  description:
    "Upload documents, extract knowledge, and interact using natural language queries with AI-powered semantic search and graph visualization.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <html lang="en">
        <body
          className={`${fraunces.variable} ${plexSans.variable} ${plexMono.variable} antialiased`}
        >
          {children}
          <Toaster />
        </body>
      </html>
    </AuthProvider>
  );
}
