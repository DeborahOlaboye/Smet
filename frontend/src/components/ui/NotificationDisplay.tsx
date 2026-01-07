import { useNotifications } from '@/contexts/NotificationContext';

export function NotificationDisplay() {
  const { notifications, removeNotification } = useNotifications();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`p-4 rounded-lg shadow-lg border-l-4 ${
            notification.error.severity === 'error'
              ? 'bg-red-50 border-red-500 text-red-800'
              : notification.error.severity === 'warning'
              ? 'bg-yellow-50 border-yellow-500 text-yellow-800'
              : 'bg-blue-50 border-blue-500 text-blue-800'
          }`}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center">
                <span className="text-lg mr-2">
                  {notification.error.severity === 'error' ? '❌' : 
                   notification.error.severity === 'warning' ? '⚠️' : 'ℹ️'}
                </span>
                <h4 className="font-medium">
                  {notification.error.severity === 'error' ? 'Error' : 
                   notification.error.severity === 'warning' ? 'Warning' : 'Info'}
                </h4>
              </div>
              <p className="text-sm mt-1">{notification.error.userMessage}</p>
              {notification.error.context?.operation && (
                <p className="text-xs mt-1 opacity-75">
                  Operation: {notification.error.context.operation}
                </p>
              )}
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="ml-2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}