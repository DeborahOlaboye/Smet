import { AlertTriangle } from 'lucide-react';

interface EmergencyWarningProps {
  title?: string;
  message?: string;
}

export function EmergencyWarning({
  title = 'Emergency Mode',
  message = 'Use emergency functions only when necessary',
}: EmergencyWarningProps) {
  return (
    <div className="border-2 border-red-500 bg-red-50 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold text-red-900 text-lg">{title}</h3>
          <p className="text-red-800 text-sm mt-1">{message}</p>
          <ul className="mt-3 text-sm text-red-800 space-y-1 ml-4 list-disc">
            <li>Only use emergency functions when absolutely necessary</li>
            <li>Ensure you understand the consequences of your actions</li>
            <li>These actions are irreversible</li>
            <li>Notify the team before executing emergency functions</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
