"use client";

import type { Metadata } from "next";
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "@/providers/Web3Provider";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Menu, X } from "lucide-react";

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
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans min-h-screen flex flex-col safe-area`}>
        <Web3Provider>
          <header className="border-b">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
              <h1 className="text-xl font-bold">Smet</h1>
              <nav className="flex items-center gap-6">
                <a href="/" className="text-gray-600 hover:text-gray-900">Home</a>
                <a href="/dashboard" className="text-gray-600 hover:text-gray-900">Dashboard</a>
              </nav>
              <div className="flex items-center gap-4">
                <WalletConnectButton />
              </div>
            </div>
          </header>
          <main className="flex-1">
            {children}
          </main>
          <footer className="border-t py-4 mt-8 bg-white">
            <div className="container mx-auto text-center text-xs sm:text-sm text-gray-500">
              &copy; {new Date().getFullYear()} Smet. All rights reserved.
            </div>
          </footer>
        </Web3Provider>
      </body>
    </html>
  );
}

function MobileHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto flex h-14 sm:h-16 items-center justify-between">
          <h1 className="text-lg sm:text-xl font-bold">Smet</h1>
          
          {/* Desktop Navigation */}
          <div className="hidden sm:flex items-center gap-4">
            <nav className="flex items-center gap-4">
              <a href="/" className="text-sm text-gray-600 hover:text-gray-900">Home</a>
              <a href="/transactions" className="text-sm text-gray-600 hover:text-gray-900">Transactions</a>
              <a href="/analytics" className="text-sm text-gray-600 hover:text-gray-900">Analytics</a>
            </nav>
            <WalletConnectButton />
          </div>
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="sm:hidden btn-touch p-2 rounded-md hover:bg-gray-100"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="sm:hidden border-t bg-white">
            <div className="container mx-auto py-4 space-y-2">
              <nav className="space-y-2">
                <a href="/" className="block text-sm text-gray-600 hover:text-gray-900">Home</a>
                <a href="/transactions" className="block text-sm text-gray-600 hover:text-gray-900">Transactions</a>
                <a href="/analytics" className="block text-sm text-gray-600 hover:text-gray-900">Analytics</a>
              </nav>
              <div className="pt-2 border-t">
                <WalletConnectButton />
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}

function WalletConnectButton() {
  const { isConnected, address } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected && address) {
    return (
      <Button 
        variant="outline" 
        onClick={() => disconnect()}
        className="w-full sm:w-auto text-xs sm:text-sm btn-touch"
      >
        {`${address.slice(0, 6)}...${address.slice(-4)}`}
      </Button>
    );
  }

  return (
    <Button 
      onClick={() => connect({ connector: connectors[0] })}
      className="w-full sm:w-auto text-xs sm:text-sm btn-touch"
    >
      Connect Wallet
    </Button>
  );
}
