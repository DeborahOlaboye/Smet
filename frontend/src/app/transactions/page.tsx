'use client';

import { TransactionHistory } from '@/components/transactions/TransactionHistory';

export default function TransactionHistoryPage() {
  return (
    <div className="container mx-auto py-4 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Transaction History</h1>
        <p className="text-sm sm:text-base text-gray-600">
          View all your interactions with the Smet Gaming Ecosystem contracts
        </p>
      </div>
      
      <TransactionHistory />
    </div>
  );
}