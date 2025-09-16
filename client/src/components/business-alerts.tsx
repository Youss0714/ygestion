import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { 
  Bell, 
  BellOff, 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle, 
  XCircle, 
  Package, 
  FileText, 
  Users,
  Trash2,
  RefreshCw,
  Settings,
  Eye,
  EyeOff,
  CheckCheck
} from 'lucide-react';
import { formatDistance } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { apiRequest } from '@/lib/queryClient';
import { useTranslation } from '@/lib/i18n';
import { useSettings } from '@/hooks/useSettings';
import type { SelectBusinessAlert } from '@shared/schema';

interface BusinessAlertsProps {
  showUnreadOnly?: boolean;
  compact?: boolean;
}

const severityConfig = {
  low: {
    icon: AlertCircle,
    color: 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800',
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    textColor: 'text-blue-700 dark:text-blue-300'
  },
  medium: {
    icon: AlertTriangle,
    color: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800',
    badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    textColor: 'text-yellow-700 dark:text-yellow-300'
  },
  high: {
    icon: AlertTriangle,
    color: 'bg-orange-50 border-orange-200 dark:bg-orange-950 dark:border-orange-800',
    badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    textColor: 'text-orange-700 dark:text-orange-300'
  },
  critical: {
    icon: XCircle,
    color: 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800',
    badge: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    textColor: 'text-red-700 dark:text-red-300'
  }
};

const getTypeConfig = (t: any) => ({
  low_stock: {
    icon: Package,
    label: t('lowStock'),
    color: 'text-yellow-600 dark:text-yellow-400'
  },
  critical_stock: {
    icon: Package,
    label: t('criticalStock'),
    color: 'text-red-600 dark:text-red-400'
  },
  overdue_invoice: {
    icon: FileText,
    label: t('overdueInvoice'),
    color: 'text-orange-600 dark:text-orange-400'
  },
  payment_due: {
    icon: Users,
    label: t('paymentDue'),
    color: 'text-blue-600 dark:text-blue-400'
  }
});

export function BusinessAlerts({ showUnreadOnly = false, compact = false }: BusinessAlertsProps) {
  const [activeTab, setActiveTab] = useState('all');
  const [unreadFilter, setUnreadFilter] = useState(showUnreadOnly);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { settings } = useSettings();
  const { t } = useTranslation(settings?.language);
  
  const typeConfig = getTypeConfig(t);

  const { data: alerts, isLoading } = useQuery<SelectBusinessAlert[]>({
    queryKey: ['/api/alerts', unreadFilter],
    queryFn: async () => {
      const response = await fetch(`/api/alerts?unreadOnly=${unreadFilter}`);
      if (!response.ok) {
        throw new Error('Failed to fetch alerts');
      }
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/alerts/${id}/read`, { method: 'PATCH' });
      if (!response.ok) {
        throw new Error('Failed to mark alert as read');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/alerts'] });
      toast({
        title: t("success"),
        description: t("markAsRead"),
      });
    },
    onError: () => {
      toast({
        title: t("error"),
        description: "Impossible de marquer l'alerte comme lue",
        variant: "destructive",
      });
    },
  });

  const markAsResolvedMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/alerts/${id}/resolve`, { method: 'PATCH' });
      if (!response.ok) {
        throw new Error('Failed to resolve alert');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/alerts'] });
      toast({
        title: t("success"),
        description: "Alerte résolue",
      });
    },
    onError: () => {
      toast({
        title: t("error"),
        description: "Impossible de résoudre l'alerte",
        variant: "destructive",
      });
    },
  });

  const deleteAlertMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/alerts/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        throw new Error('Failed to delete alert');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/alerts'] });
      toast({
        title: t("success"),
        description: t("deleteAlert"),
      });
    },
    onError: () => {
      toast({
        title: t("error"),
        description: "Impossible de supprimer l'alerte",
        variant: "destructive",
      });
    },
  });

  const generateStockAlertsMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/alerts/generate/stock', { method: 'POST' });
      if (!response.ok) {
        throw new Error('Failed to generate stock alerts');
      }
      return response.json();
    },
    onSuccess: (data: { message: string }) => {
      queryClient.invalidateQueries({ queryKey: ['/api/alerts'] });
      toast({
        title: t("success"),
        description: data.message,
      });
    },
    onError: () => {
      toast({
        title: t("error"),
        description: "Impossible de générer les alertes de stock",
        variant: "destructive",
      });
    },
  });

  const generateOverdueAlertsMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/alerts/generate/overdue', { method: 'POST' });
      if (!response.ok) {
        throw new Error('Failed to generate overdue alerts');
      }
      return response.json();
    },
    onSuccess: (data: { message: string }) => {
      queryClient.invalidateQueries({ queryKey: ['/api/alerts'] });
      toast({
        title: t("success"),
        description: data.message,
      });
    },
    onError: () => {
      toast({
        title: t("error"),
        description: "Impossible de générer les alertes de factures échues",
        variant: "destructive",
      });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/alerts/mark-all-read', { method: 'PATCH' });
      if (!response.ok) {
        throw new Error('Failed to mark all alerts as read');
      }
      return response.json();
    },
    onSuccess: (data: { message: string }) => {
      queryClient.invalidateQueries({ queryKey: ['/api/alerts'] });
      toast({
        title: t("success"),
        description: data.message,
      });
    },
    onError: () => {
      toast({
        title: t("error"),
        description: "Impossible de marquer toutes les alertes comme lues",
        variant: "destructive",
      });
    },
  });

  const cleanupMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/alerts/cleanup', { method: 'DELETE' });
      if (!response.ok) {
        throw new Error('Failed to cleanup alerts');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/alerts'] });
      toast({
        title: t("success"),
        description: "Alertes nettoyées avec succès",
      });
    },
    onError: () => {
      toast({
        title: t("error"),
        description: "Impossible de nettoyer les alertes",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>
    );
  }

  const filteredAlerts: SelectBusinessAlert[] = alerts || [];
  const unreadCount = filteredAlerts.filter((alert) => !alert.isRead).length;
  const criticalCount = filteredAlerts.filter((alert) => alert.severity === 'critical').length;

  const getFilteredAlerts = (filter: string): SelectBusinessAlert[] => {
    switch (filter) {
      case 'unread':
        return filteredAlerts.filter((alert) => !alert.isRead);
      case 'critical':
        return filteredAlerts.filter((alert) => alert.severity === 'critical');
      case 'stock':
        return filteredAlerts.filter((alert) => 
          alert.type === 'low_stock' || alert.type === 'critical_stock'
        );
      case 'invoices':
        return filteredAlerts.filter((alert) => alert.type === 'overdue_invoice');
      default:
        return filteredAlerts;
    }
  };

  const renderAlert = (alert: SelectBusinessAlert) => {
    const severity = severityConfig[alert.severity as keyof typeof severityConfig] || severityConfig.medium;
    const alertType = typeConfig[alert.type as keyof typeof typeConfig];
    const SeverityIcon = severity.icon;
    const TypeIcon = alertType?.icon || AlertCircle;

    return (
      <Card key={alert.id} className={`${severity.color} transition-all hover:shadow-md`}>
        <CardHeader className={compact ? "pb-2" : "pb-4"}>
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <SeverityIcon className={`h-5 w-5 ${severity.textColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {alert.title}
                  </h4>
                  <Badge className={severity.badge}>
                    {alert.severity}
                  </Badge>
                  {!alert.isRead && (
                    <Badge variant="secondary" className="text-xs">
                      {settings?.language === 'en' ? 'New' : 'Nouveau'}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                  <TypeIcon className="h-3 w-3" />
                  <span>{alertType?.label || alert.type}</span>
                  <span>•</span>
                  <span>
                    {formatDistance(new Date(alert.createdAt!), new Date(), {
                      addSuffix: true,
                      locale: settings?.language === 'en' ? enUS : fr
                    })}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              {!alert.isRead && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => markAsReadMutation.mutate(alert.id)}
                  disabled={markAsReadMutation.isPending}
                  data-testid={`button-mark-read-${alert.id}`}
                >
                  <Eye className="h-3 w-3" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => markAsResolvedMutation.mutate(alert.id)}
                disabled={markAsResolvedMutation.isPending}
                data-testid={`button-resolve-${alert.id}`}
              >
                <CheckCircle className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteAlertMutation.mutate(alert.id)}
                disabled={deleteAlertMutation.isPending}
                data-testid={`button-delete-${alert.id}`}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        {!compact && (
          <CardContent className="pt-0">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              {alert.message}
            </p>
            {alert.metadata && (
              <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                {typeof alert.metadata === 'object' && alert.metadata && (
                  <>
                    {(alert.metadata as any).productName && (
                      <div>{settings?.language === 'en' ? 'Product' : 'Produit'}: {(alert.metadata as any).productName}</div>
                    )}
                    {(alert.metadata as any).invoiceNumber && (
                      <div>{settings?.language === 'en' ? 'Invoice' : 'Facture'}: {(alert.metadata as any).invoiceNumber}</div>
                    )}
                    {(alert.metadata as any).clientName && (
                      <div>{t('client')}: {(alert.metadata as any).clientName}</div>
                    )}
                    {(alert.metadata as any).daysPastDue && (
                      <div>{settings?.language === 'en' ? 'Days overdue' : 'Échéance dépassée'}: {String((alert.metadata as any).daysPastDue)} {settings?.language === 'en' ? 'day(s)' : 'jour(s)'}</div>
                    )}
                    {(alert.metadata as any).currentStock !== undefined && (
                      <div>{settings?.language === 'en' ? 'Current stock' : 'Stock actuel'}: {String((alert.metadata as any).currentStock)}</div>
                    )}
                  </>
                )}
              </div>
            )}
          </CardContent>
        )}
      </Card>
    );
  };

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">{t('alerts')}</h3>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount}
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setUnreadFilter(!unreadFilter)}
              data-testid="button-toggle-unread-filter"
            >
              {unreadFilter ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        <ScrollArea className="h-96">
          <div className="space-y-2">
            {getFilteredAlerts('all').map(renderAlert)}
            {getFilteredAlerts('all').length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>{settings?.language === 'en' ? 'No alerts' : 'Aucune alerte'}</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {t('alerts')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {settings?.language === 'en' ? 'Monitor your stock and overdue invoices' : 'Surveillez vos stocks et factures échues'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
              data-testid="button-mark-all-read"
            >
              <CheckCheck className="h-4 w-4 mr-2" />
{t('markAllAsRead')}
            </Button>
          )}
          {unreadCount > 0 && (
            <Badge variant="destructive">
{unreadCount} {settings?.language === 'en' ? 'unread' : 'non lue(s)'}
            </Badge>
          )}
          {criticalCount > 0 && (
            <Badge variant="secondary">
{criticalCount} {settings?.language === 'en' ? 'critical' : 'critique(s)'}
            </Badge>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => generateStockAlertsMutation.mutate()}
          disabled={generateStockAlertsMutation.isPending}
          data-testid="button-generate-stock-alerts"
        >
          <Package className="h-4 w-4 mr-2" />
{settings?.language === 'en' ? 'Check Stock' : 'Vérifier stocks'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => generateOverdueAlertsMutation.mutate()}
          disabled={generateOverdueAlertsMutation.isPending}
          data-testid="button-generate-overdue-alerts"
        >
          <FileText className="h-4 w-4 mr-2" />
{settings?.language === 'en' ? 'Check Due Dates' : 'Vérifier échéances'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => cleanupMutation.mutate()}
          disabled={cleanupMutation.isPending}
          data-testid="button-cleanup-alerts"
        >
          <Trash2 className="h-4 w-4 mr-2" />
{settings?.language === 'en' ? 'Cleanup' : 'Nettoyer'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setUnreadFilter(!unreadFilter)}
          data-testid="button-toggle-filter"
        >
          {unreadFilter ? (
            <>
              <EyeOff className="h-4 w-4 mr-2" />
{settings?.language === 'en' ? 'Show All' : 'Afficher tout'}
            </>
          ) : (
            <>
              <Eye className="h-4 w-4 mr-2" />
{settings?.language === 'en' ? 'Unread Only' : 'Non lues seulement'}
            </>
          )}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all" data-testid="tab-all-alerts">
            {settings?.language === 'en' ? 'All' : 'Toutes'} ({filteredAlerts.length})
          </TabsTrigger>
          <TabsTrigger value="unread" data-testid="tab-unread-alerts">
            {settings?.language === 'en' ? 'Unread' : 'Non lues'} ({unreadCount})
          </TabsTrigger>
          <TabsTrigger value="critical" data-testid="tab-critical-alerts">
            {settings?.language === 'en' ? 'Critical' : 'Critiques'} ({criticalCount})
          </TabsTrigger>
          <TabsTrigger value="stock" data-testid="tab-stock-alerts">
            {t('stock')} ({getFilteredAlerts('stock').length})
          </TabsTrigger>
          <TabsTrigger value="invoices" data-testid="tab-invoice-alerts">
            {settings?.language === 'en' ? 'Invoices' : 'Factures'} ({getFilteredAlerts('invoices').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {getFilteredAlerts('all').map(renderAlert)}
          {filteredAlerts.length === 0 && (
            <div className="text-center py-12">
              <Bell className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                {settings?.language === 'en' ? 'No alerts' : 'Aucune alerte'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {settings?.language === 'en' ? 'All your alerts will appear here.' : 'Toutes vos alertes apparaîtront ici.'}
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="unread" className="space-y-4">
          {getFilteredAlerts('unread').map(renderAlert)}
          {getFilteredAlerts('unread').length === 0 && (
            <div className="text-center py-12">
              <BellOff className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                {settings?.language === 'en' ? 'No unread alerts' : 'Aucune alerte non lue'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {settings?.language === 'en' ? 'All your alerts have been read.' : 'Toutes vos alertes ont été lues.'}
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="critical" className="space-y-4">
          {getFilteredAlerts('critical').map(renderAlert)}
          {getFilteredAlerts('critical').length === 0 && (
            <div className="text-center py-12">
              <XCircle className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                {settings?.language === 'en' ? 'No critical alerts' : 'Aucune alerte critique'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {settings?.language === 'en' ? 'No critical situation detected.' : 'Aucune situation critique détectée.'}
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="stock" className="space-y-4">
          {getFilteredAlerts('stock').map(renderAlert)}
          {getFilteredAlerts('stock').length === 0 && (
            <div className="text-center py-12">
              <Package className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                {settings?.language === 'en' ? 'No stock alerts' : 'Aucune alerte de stock'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {settings?.language === 'en' ? 'All your inventory levels are good.' : 'Tous vos stocks sont à niveau.'}
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          {getFilteredAlerts('invoices').map(renderAlert)}
          {getFilteredAlerts('invoices').length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                {settings?.language === 'en' ? 'No overdue invoices' : 'Aucune facture échue'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {settings?.language === 'en' ? 'All your invoices are up to date.' : 'Toutes vos factures sont à jour.'}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}