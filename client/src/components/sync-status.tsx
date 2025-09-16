import { RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { useSettings } from '@/hooks/useSettings';
import { Badge } from '@/components/ui/badge';

interface SyncStatusProps {
  isOnline?: boolean;
  isSyncing?: boolean;
  lastSync?: Date;
}

export default function SyncStatus({ isOnline = true, isSyncing = false, lastSync }: SyncStatusProps) {
  const { settings } = useSettings();
  const { t } = useTranslation(settings?.language);

  const formatLastSync = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return settings?.language === 'en' ? 'Just now' : 'À l\'instant';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return settings?.language === 'en' 
        ? `${minutes}m ago` 
        : `il y a ${minutes}m`;
    } else {
      return date.toLocaleTimeString(settings?.language === 'en' ? 'en-US' : 'fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  if (!isOnline) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Badge variant="destructive" className="flex items-center gap-2 px-3 py-2">
          <WifiOff className="w-4 h-4" />
          <span className="text-sm">
            {settings?.language === 'en' ? 'Offline' : 'Hors ligne'}
          </span>
        </Badge>
      </div>
    );
  }

  if (isSyncing) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Badge variant="secondary" className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 border-blue-200">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span className="text-sm">
            {settings?.language === 'en' ? 'Syncing...' : 'Synchronisation...'}
          </span>
        </Badge>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Badge variant="secondary" className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 border-green-200">
        <Wifi className="w-4 h-4" />
        <span className="text-sm">
          {settings?.language === 'en' ? 'Live data' : 'Données en temps réel'}
          {lastSync && (
            <span className="ml-1 text-xs opacity-75">
              • {formatLastSync(lastSync)}
            </span>
          )}
        </span>
      </Badge>
    </div>
  );
}