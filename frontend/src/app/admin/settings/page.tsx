'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2, AlertCircle, Lock, Zap, Wallet, Shield } from 'lucide-react';
import { ProtectedRoute } from '@/components/admin/ProtectedRoute';
import { SettingsCard } from '@/components/admin/SettingsCard';
import { PauseControl } from '@/components/admin/PauseControl';
import { TimelockManager } from '@/components/admin/TimelockManager';
import { NetworkStatus } from '@/components/admin/NetworkStatus';
import { FeeDisplay } from '@/components/admin/FeeDisplay';
import { OwnerInfo } from '@/components/admin/OwnerInfo';
import { VRFConfig } from '@/components/admin/VRFConfig';
import { EmergencyWarning } from '@/components/admin/EmergencyWarning';
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

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [settingsData, networkData] = await Promise.all([
        fetchContractSettings(),
        getNetworkInfo(),
      ]);
      setSettings(settingsData);
      setNetworkInfo(networkData);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load settings';
      setError(errorMsg);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

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

  return (
    <ProtectedRoute>
      <div className="space-y-6 p-4 sm:p-6 md:ml-64">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Manage contract parameters and emergency functions</p>
        </div>

        {/* Network Status */}
        <NetworkStatus
          chainId={networkInfo.chainId}
          chainName={networkInfo.chainName}
          isConnected={true}
        />

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

        {/* Contract Owner */}
        <SettingsCard
          title="Contract Owner"
          icon={<Shield className="h-5 w-5 text-green-600" />}
        >
          <OwnerInfo owner={settings.owner} label="Owner Address" />
        </SettingsCard>

        {/* Box Opening Fee */}
        <SettingsCard
          title="Box Opening Fee"
          icon={<Wallet className="h-5 w-5 text-amber-600" />}
        >
          <FeeDisplay fee={settings.fee} isImmutable={true} />
        </SettingsCard>

        {/* VRF Configuration */}
        <SettingsCard
          title="Chainlink VRF Settings"
          icon={<Zap className="h-5 w-5 text-indigo-600" />}
        >
          <VRFConfig
            requestConfirmations={3}
            gasLimit={250000}
          />
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
          <EmergencyWarning
            title="Emergency Operations"
            message="Only use emergency functions when absolutely necessary"
          />
          <div className="mt-4 text-sm text-gray-700 space-y-2">
            <p className="font-semibold">Available emergency functions:</p>
            <ul className="space-y-1 ml-4 list-disc">
              <li>Pause/Unpause contract (available in Contract State section above)</li>
              <li>Withdraw collected fees (execute via contract)</li>
              <li>Recover stuck NFTs (execute via contract)</li>
              <li>Update timelock (available in Timelock Management section above)</li>
            </ul>
          </div>
        </SettingsCard>
      </div>
    </ProtectedRoute>
  );
}
