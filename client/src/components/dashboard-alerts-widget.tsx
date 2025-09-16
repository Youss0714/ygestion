import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link } from 'wouter';
import { 
  Bell, 
  BellOff, 
  AlertTriangle, 
  Package, 
  FileText,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { formatDistance } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { SelectBusinessAlert } from '@shared/schema';

const typeConfig = {
  low_stock: {
    icon: Package,
    label: 'Stock faible',
    color: 'text-yellow-600 dark:text-yellow-400'
  },
  critical_stock: {
    icon: Package,
    label: 'Rupture de stock',
    color: 'text-red-600 dark:text-red-400'
  },
  overdue_invoice: {
    icon: FileText,
    label: 'Facture échue',
    color: 'text-orange-600 dark:text-orange-400'
  },
  payment_due: {
    icon: FileText,
    label: 'Paiement dû',
    color: 'text-blue-600 dark:text-blue-400'
  }
};

export function DashboardAlertsWidget() {
  const { data: alerts, isLoading, refetch, isRefetching } = useQuery<SelectBusinessAlert[]>({
    queryKey: ['/api/alerts', true], // unreadOnly = true
    queryFn: async () => {
      const response = await fetch('/api/alerts?unreadOnly=true');
      if (!response.ok) {
        throw new Error('Failed to fetch alerts');
      }
      return response.json();
    },
    refetchInterval: 60000, // Refresh every minute
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Alertes critiques
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const filteredAlerts = alerts || [];
  const criticalAlerts = filteredAlerts.filter(alert => 
    alert.severity === 'critical' || alert.severity === 'high'
  );
  const unreadCount = filteredAlerts.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Alertes métier
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              disabled={isRefetching}
              data-testid="button-refresh-alerts"
            >
              <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
            </Button>
            <Link href="/alerts">
              <Button variant="ghost" size="sm" data-testid="button-view-all-alerts">
                Voir tout
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
        <CardDescription>
          Surveillez vos stocks et factures échues
        </CardDescription>
      </CardHeader>
      <CardContent>
        {unreadCount === 0 ? (
          <div className="text-center py-6">
            <BellOff className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Aucune alerte en cours
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Show critical alerts first, then limit to 5 total */}
            {filteredAlerts
              .sort((a, b) => {
                // Priority: critical > high > medium > low
                const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
                const aSeverity = severityOrder[a.severity as keyof typeof severityOrder] || 4;
                const bSeverity = severityOrder[b.severity as keyof typeof severityOrder] || 4;
                if (aSeverity !== bSeverity) return aSeverity - bSeverity;
                // Then by creation date (newest first)
                return new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime();
              })
              .slice(0, 5)
              .map((alert) => {
                const alertType = typeConfig[alert.type as keyof typeof typeConfig];
                const TypeIcon = alertType?.icon || AlertTriangle;
                const isHighPriority = alert.severity === 'critical' || alert.severity === 'high';

                return (
                  <Alert
                    key={alert.id}
                    className={isHighPriority ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950' : ''}
                  >
                    <div className="flex items-start space-x-3">
                      <TypeIcon className={`h-4 w-4 mt-0.5 ${alertType?.color || 'text-gray-500'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {alert.title}
                          </h4>
                          {isHighPriority && (
                            <Badge variant="destructive" className="text-xs">
                              {alert.severity}
                            </Badge>
                          )}
                        </div>
                        <AlertDescription className="text-xs text-gray-600 dark:text-gray-300 mb-1">
                          {alert.message}
                        </AlertDescription>
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span>{alertType?.label || alert.type}</span>
                          <span>
                            {formatDistance(new Date(alert.createdAt!), new Date(), {
                              addSuffix: true,
                              locale: fr
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Alert>
                );
              })}
            
            {unreadCount > 5 && (
              <div className="text-center pt-2">
                <Link href="/alerts">
                  <Button variant="ghost" size="sm" className="text-xs" data-testid="button-view-more-alerts">
                    et {unreadCount - 5} autre(s)...
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}