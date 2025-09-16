import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useTranslation } from "@/lib/i18n";
import { useSettings } from "@/hooks/useSettings";
import Header from "@/components/header";
import StatsCard from "@/components/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp,
  FileText, 
  Users, 
  Package, 
  Eye, 
  Download, 
  Edit,
  UserPlus,
  Plus,
  BarChart3,
  FolderOutput,
  AlertTriangle,
  CircleAlert,
  RefreshCw
} from "lucide-react";
import { Link, useLocation } from "wouter";
import SyncStatus from "@/components/sync-status";
import { DashboardSkeleton } from "@/components/loading-skeletons";
import { DashboardAlertsWidget } from "@/components/dashboard-alerts-widget";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [location, setLocation] = useLocation();
  const { settings } = useSettings();
  const { t } = useTranslation(settings?.language);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Non autorisé",
        description: "Vous êtes déconnecté. Reconnexion...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: stats = {}, isLoading: statsLoading, isFetching: statsFetching } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    retry: false,
    refetchInterval: 30000, // Rafraîchit toutes les 30 secondes
    refetchIntervalInBackground: true, // Continue même quand l'onglet n'est pas visible
    staleTime: 0, // Les données sont considérées comme obsolètes immédiatement
  });

  const { data: userSettings } = useQuery({
    queryKey: ["/api/user/settings"],
    retry: false,
    refetchInterval: 60000, // Rafraîchit toutes les 60 secondes pour les paramètres
    staleTime: 30000, // Les paramètres restent valides 30 secondes
  });

  if (isLoading || statsLoading) {
    return <DashboardSkeleton />;
  }

  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Tableau de Bord" 
          subtitle="Vue d'ensemble de votre activité commerciale"
          action={{
            label: "Nouvelle Facture",
            onClick: () => {}
          }}
        />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-32" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Tableau de Bord" 
          subtitle="Vue d'ensemble de votre activité commerciale"
        />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="text-center py-12">
            <p className="text-gray-500">Impossible de charger les statistiques</p>
          </div>
        </main>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    const currency = (userSettings as any)?.currency || 'XOF';
    
    if (currency === 'XOF') {
      return new Intl.NumberFormat('fr-FR', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount) + ' F CFA';
    } else if (currency === 'GHS') {
      return 'GH₵ ' + new Intl.NumberFormat('en-US', {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    } else {
      // Fallback pour XOF par défaut
      return new Intl.NumberFormat('fr-FR', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount) + ' F CFA';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">{t('paid')}</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">{t('pending')}</Badge>;
      case 'overdue':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">{t('overdue')}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('fr-FR');
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header 
        title={t('dashboard')}
        subtitle={settings?.language === 'en' ? "Overview of your business activity" : "Vue d'ensemble de votre activité commerciale"}
        showBreadcrumbs={false}
        action={{
          label: t('newInvoice'),
          onClick: () => setLocation("/invoices")
        }}
      />

      <main className="flex-1 overflow-y-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatsCard
            title={t('revenue')}
            value={formatCurrency((stats as any)?.revenue || 0)}
            change={
              (stats as any)?.revenueGrowth !== undefined && (stats as any)?.revenueGrowth !== 0
                ? `${(stats as any).revenueGrowth >= 0 ? '+' : ''}${(stats as any).revenueGrowth}% ${t('vsLastMonth')}`
                : t('noPreviousData')
            }
            changeType={(stats as any)?.revenueGrowth >= 0 ? "positive" : "negative"}
            icon={TrendingUp}
            iconColor="bg-green-50 text-green-500"
          />
          <StatsCard
            title={t('invoiceCount')}
            value={(stats as any)?.invoiceCount || 0}
            change={
              (stats as any)?.recentInvoiceCount !== undefined
                ? `+${(stats as any).recentInvoiceCount} ${t('thisWeek')}`
                : t('noRecentInvoices')
            }
            changeType="positive"
            icon={FileText}
            iconColor="bg-blue-50 text-blue-500"
          />
          <StatsCard
            title={t('activeClients')}
            value={(stats as any)?.clientCount || 0}
            change={
              (stats as any)?.recentClientCount !== undefined
                ? `+${(stats as any).recentClientCount} ${t('newThisMonth')}`
                : t('noNewClients')
            }
            changeType="positive"
            icon={Users}
            iconColor="bg-purple-50 text-purple-500"
          />
          <StatsCard
            title={t('productCount')}
            value={(stats as any)?.productCount || 0}
            change={`${((stats as any)?.lowStockProducts || []).length} ${t('stockAlerts')}`}
            changeType={((stats as any)?.lowStockProducts || []).length > 0 ? "negative" : "neutral"}
            icon={Package}
            iconColor="bg-orange-50 text-orange-500"
          />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Invoices */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t('recentInvoices')}</CardTitle>
                  <Link href="/invoices">
                    <Button variant="ghost" size="sm">
                      {t('viewAll')}
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/50 dark:bg-gray-800/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('invoiceNumber')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('client')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('amount')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('status')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('date')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('actions')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {((stats as any)?.recentInvoices || []).length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                            {t('noData')}
                          </td>
                        </tr>
                      ) : (
                        ((stats as any)?.recentInvoices || []).map((invoice: any) => (
                          <tr key={invoice.id} className="hover:bg-white/30 dark:hover:bg-gray-700/30">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {invoice.number}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {invoice.client?.name || t('unknownClient')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatCurrency(parseFloat(invoice.totalTTC || invoice.total || "0"))}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStatusBadge(invoice.status)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {invoice.createdAt && formatDate(invoice.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                              <Link href={`/invoices/${invoice.id}`}>
                                <Button variant="ghost" size="sm">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </Link>
                              <Button variant="ghost" size="sm">
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>{t('quickActions')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/clients">
                  <Button variant="ghost" className="w-full justify-start bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 hover:border-blue-300 shadow-sm">
                    <UserPlus className="mr-3 w-4 h-4 text-blue-600" />
                    <span className="text-blue-800 font-medium">{t('newClient')}</span>
                  </Button>
                </Link>
                <Link href="/products">
                  <Button variant="ghost" className="w-full justify-start bg-green-50 hover:bg-green-100">
                    <Plus className="mr-3 w-4 h-4 text-green-500" />
                    {t('newProduct')}
                  </Button>
                </Link>
                <Link href="/sales">
                  <Button variant="ghost" className="w-full justify-start bg-blue-50 hover:bg-blue-100">
                    <BarChart3 className="mr-3 w-4 h-4 text-blue-500" />
                    {t('generateReport')}
                  </Button>
                </Link>
                <Link href="/export">
                  <Button variant="ghost" className="w-full justify-start bg-purple-50 hover:bg-purple-100">
                    <FolderOutput className="mr-3 w-4 h-4 text-purple-500" />
                    {t('exportData')}
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Top Products */}
            <Card>
              <CardHeader>
                <CardTitle>{t('bestSellingProducts')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {((stats as any)?.topProducts || []).length === 0 ? (
                  <p className="text-center text-gray-500 py-4">{t('noSalesRecorded')}</p>
                ) : (
                  ((stats as any)?.topProducts || []).map((product: any, index: number) => (
                    <div key={product.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Package className="w-5 h-5 text-gray-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{product.name}</p>
                          <p className="text-xs text-gray-500">#{index + 1}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{product.salesCount}</p>
                        <p className="text-xs text-gray-500">{t('sold')}</p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Business Alerts Widget */}
            <DashboardAlertsWidget />
          </div>
        </div>
      </main>
      
      {/* Sync Status Indicator */}
      <SyncStatus 
        isOnline={true}
        isSyncing={statsFetching}
        lastSync={statsFetching ? undefined : new Date()}
      />
    </div>
  );
}
