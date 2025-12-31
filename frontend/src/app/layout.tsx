"use client";

import type { Metadata } from "next";
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "@/providers/Web3Provider";
import { Button } from "@/components/ui/button";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { WalletConnectButton } from "@/components/WalletConnectButton";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Smet App",
  description: "Decentralized rewards platform",
};

// @ts-ignore - This is a client component
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans min-h-screen flex flex-col`}>
        <Web3Provider>
          <ThemeProvider>
            <header className="border-b">
              <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <h1 className="text-xl font-bold">Smet</h1>
                <div className="flex items-center gap-4">
                  <ThemeToggle />
                  <WalletConnectButton />
                </div>
              </div>
            </header>
            <main className="flex-1">
              {children}
            </main>
            <footer className="border-t py-4 mt-8">
              <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} Smet. All rights reserved.
              </div>
            </footer>
          </ThemeProvider>
        </Web3Provider>
      </body>
    </html>
  );
}

