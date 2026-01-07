"use client";

import { useAccount } from 'wagmi';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';

export default function DashboardPage() {
  const { isConnected } = useAccount();

  if (!isConnected) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
        <div className="text-6xl mb-6">🔗</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h2>
        <p className="text-gray-600 mb-8 max-w-md">
          Connect your wallet to view your dashboard, track your rewards, and manage your digital assets.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md">
          <p className="text-sm text-blue-800">
            Use the "Connect Wallet" button in the header to get started.
          </p>
        </div>
      </div>
    );
  }

  return <DashboardLayout />;
}