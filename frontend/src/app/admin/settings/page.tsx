'use client';

import { useState, useEffect } from 'react';
import { Loader2, AlertCircle, Lock, Zap, Wallet } from 'lucide-react';
import { ProtectedRoute } from '@/components/admin/ProtectedRoute';
import { SettingsCard } from '@/components/admin/SettingsCard';
import { PauseControl } from '@/components/admin/PauseControl';
import { TimelockManager } from '@/components/admin/TimelockManager';
import { formatEther } from 'viem';
import {
  ContractSettings,
  fetchContractSettings,
  getNetworkInfo,
} from '@/services/adminSettings';
import { useToast } from '@/hooks/use-toast';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<ContractSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [networkInfo, setNetworkInfo] = useState({ chainId: 4242, chainName: 'Lisk Sepolia' });
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const [settingsData, networkData] = await Promise.all([
        fetchContractSettings(),
        getNetworkInfo(),
      ]);
      setSettings(settingsData);
      setNetworkInfo(networkData);
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to load settings';
      setError(errorMsg);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="space-y-6 p-4 sm:p-6 md:ml-64">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading settings...</span>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !settings) {
    return (
      <ProtectedRoute>
        <div className="space-y-6 p-4 sm:p-6 md:ml-64">
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-800">Error Loading Settings</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const formatAddress = (addr: string) => {
    if (!addr || addr === '0x0000000000000000000000000000000000000000') return 'Not set';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <ProtectedRoute>
      <div className="space-y-6 p-4 sm:p-6 md:ml-64">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Manage contract parameters and emergency functions</p>
        </div>

        {/* Network Information */}
        <SettingsCard
          title="Network Information"
          icon={<Zap className="h-5 w-5 text-blue-600" />}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-gray-600">Chain ID</p>
              <p className="text-lg font-semibold text-gray-900">{networkInfo.chainId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Network</p>
              <p className="text-lg font-semibold text-gray-900">{networkInfo.chainName}</p>
            </div>
          </div>
        </SettingsCard>

        {/* Contract Information */}
        <SettingsCard
          title="Contract Information"
          icon={<Lock className="h-5 w-5 text-purple-600" />}
        >
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Owner Address</p>
              <code className="block bg-gray-100 rounded px-3 py-2 text-sm font-mono break-all">
                {settings.owner}
              </code>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Timelock Address</p>
              <code className="block bg-gray-100 rounded px-3 py-2 text-sm font-mono break-all">
                {formatAddress(settings.timelock)}
              </code>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Box Opening Fee</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatEther(settings.fee)} ETH
              </p>
            </div>
          </div>
        </SettingsCard>

        {/* Contract State Management */}
        <SettingsCard
          title="Contract State"
          icon={<AlertCircle className="h-5 w-5 text-orange-600" />}
        >
          <PauseControl isPaused={settings.isPaused} onStatusChange={loadSettings} />
        </SettingsCard>

        {/* Timelock Management */}
        <SettingsCard
          title="Timelock Management"
          icon={<Lock className="h-5 w-5 text-indigo-600" />}
        >
          <TimelockManager currentTimelock={settings.timelock} onUpdate={loadSettings} />
        </SettingsCard>

        {/* Emergency Functions */}
        <SettingsCard
          title="Emergency Functions"
          icon={<Wallet className="h-5 w-5 text-red-600" />}
        >
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
            <p className="font-semibold mb-2">⚠️ Emergency Operations</p>
            <p>Emergency functions are available through the contract directly. Use with caution.</p>
            <ul className="mt-3 space-y-1 ml-4 list-disc">
              <li>Pause/Unpause contract (available above)</li>
              <li>Withdraw funds (execute via contract)</li>
              <li>Recover stuck NFTs (execute via contract)</li>
            </ul>
          </div>
        </SettingsCard>
      </div>
    </ProtectedRoute>
  );
}
