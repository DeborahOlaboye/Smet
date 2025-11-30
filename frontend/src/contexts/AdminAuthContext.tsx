'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAccount } from 'wagmi';

type AdminAuthContextType = {
  isAdmin: boolean;
  isLoading: boolean;
  checkAdminStatus: () => Promise<boolean>;
};

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

// Replace these with actual admin wallet addresses
const ADMIN_ADDRESSES = [
  '0x123...', // Add admin wallet addresses here
];

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { address } = useAccount();

  const checkAdminStatus = async (): Promise<boolean> => {
    if (!address) return false;
    
    // In a real app, you would verify this against your backend
    const isUserAdmin = ADMIN_ADDRESSES.includes(address.toLowerCase());
    setIsAdmin(isUserAdmin);
    return isUserAdmin;
  };

  useEffect(() => {
    const verifyAdmin = async () => {
      setIsLoading(true);
      await checkAdminStatus();
      setIsLoading(false);
    };

    verifyAdmin();
  }, [address]);

  return (
    <AdminAuthContext.Provider value={{ isAdmin, isLoading, checkAdminStatus }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
