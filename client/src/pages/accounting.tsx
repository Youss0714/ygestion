import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { PlusCircle, TrendingUp, TrendingDown, DollarSign, FileText, Wallet, CreditCard, Calendar, Filter } from "lucide-react";
import { ExpenseManager } from "../components/accounting/expense-manager";
import { ImprestManager } from "../components/accounting/imprest-manager";
import { ReportsManager } from "../components/accounting/reports-manager";
import { RevenueManager } from "../components/accounting/revenue-manager";
import { useTranslation, formatPrice } from "@/lib/i18n";
import { useSettings } from "@/hooks/useSettings";

import { EXPENSE_STATUS, PAYMENT_METHODS, IMPREST_STATUS } from "@shared/schema";

interface AccountingStats {
  totalExpenses: number;
  pendingExpenses: number;
  approvedExpenses: number;
  totalImprestFunds: number;
  activeImprestFunds: number;
  totalRevenues: number;
  monthlyRevenues: number;
  recentRevenues: number;
  netResult: number; // Résultat net (Revenus - Dépenses)
  monthlyExpensesByCategory: { category: string; amount: number; allocatedAmount: number }[];
  recentExpenses: any[];
}

export default function AccountingPage() {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [showDateFilter, setShowDateFilter] = useState(false);
  const { settings } = useSettings();
  const { t } = useTranslation(settings?.language);

  const { data: stats, isLoading: statsLoading } = useQuery<AccountingStats>({
    queryKey: ["/api/accounting/stats", startDate, endDate],
    queryFn: () => {
      const params = new URLSearchParams();
      if (startDate && endDate) {
        params.append('startDate', startDate);
        params.append('endDate', endDate);
      }
      return fetch(`/api/accounting/stats?${params.toString()}`, {
        credentials: 'include'
      }).then(res => res.json());
    },
  });

  const { data: expenses } = useQuery({
    queryKey: ["/api/accounting/expenses"],
  });

  const { data: imprestFunds } = useQuery({
    queryKey: ["/api/accounting/imprest-funds"],
  });

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('accounting')}</h1>
          <p className="text-muted-foreground">
            {t('manageFinances')}
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => setShowDateFilter(!showDateFilter)}
          data-testid="button-toggle-stats-date-filter"
        >
          <Filter className="mr-2 h-4 w-4" />
          {t('filterByPeriod')}
        </Button>
      </div>

      {/* Filtre par période pour les statistiques */}
      {showDateFilter && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <Label htmlFor="stats-start-date">{t('from')} :</Label>
                <Input
                  id="stats-start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-auto"
                  data-testid="input-stats-start-date"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="stats-end-date">{t('to')} :</Label>
                <Input
                  id="stats-end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-auto"
                  data-testid="input-stats-end-date"
                />
              </div>
              <Button 
                variant="outline" 
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                }}
                data-testid="button-clear-stats-filter"
              >
                {t('clear')}
              </Button>
            </div>
            {startDate && endDate && (
              <p className="text-sm text-muted-foreground mt-2">
                {t('displaying')} {new Date(startDate).toLocaleDateString(settings?.language === 'en' ? 'en-US' : 'fr-FR')} {settings?.language === 'en' ? 'to' : 'au'} {new Date(endDate).toLocaleDateString(settings?.language === 'en' ? 'en-US' : 'fr-FR')}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalRevenues')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold break-words">
              {formatPrice(stats?.totalRevenues || 0, settings?.currency)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.recentRevenues || 0} {t('recentRevenues').toLowerCase()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalExpenses')}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold break-words">
              {formatPrice(stats?.totalExpenses || 0, settings?.currency)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.recentExpenses?.length || 0} {settings?.language === 'en' ? 'recent expenses' : 'dépenses récentes'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('awaiting')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingExpenses || 0}</div>
            <p className="text-xs text-muted-foreground">
              {t('expensesToApprove')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('approved')}</CardTitle>
            <TrendingDown className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.approvedExpenses || 0}</div>
            <p className="text-xs text-muted-foreground">
              {t('validatedExpenses')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('imprestFunds')}</CardTitle>
            <Wallet className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold break-words">
              {formatPrice(stats?.totalImprestFunds || 0, settings?.currency)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.activeImprestFunds || 0} {t('activeFunds')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('netResult')} {startDate && endDate && `(${t('selectedPeriod')})`}
            </CardTitle>
            {(stats?.netResult || 0) >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-xl font-bold break-words ${(stats?.netResult || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatPrice(stats?.netResult || 0, settings?.currency)}
            </div>
            <p className="text-xs text-muted-foreground">
              {(stats?.netResult || 0) >= 0 ? (settings?.language === 'en' ? 'Profit' : 'Bénéfice') : (settings?.language === 'en' ? 'Loss' : 'Perte')} ({t('revenuesMinusExpenses')})
              {startDate && endDate && (
                <><br />{settings?.language === 'en' ? 'Period' : 'Période'} : {new Date(startDate).toLocaleDateString(settings?.language === 'en' ? 'en-US' : 'fr-FR')} {settings?.language === 'en' ? 'to' : 'au'} {new Date(endDate).toLocaleDateString(settings?.language === 'en' ? 'en-US' : 'fr-FR')}</>
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      {stats?.recentExpenses && stats.recentExpenses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{settings?.language === 'en' ? 'Recent Expenses' : 'Dépenses récentes'}</CardTitle>
            <CardDescription>
              {settings?.language === 'en' ? 'Overview of your latest transactions' : 'Aperçu de vos dernières transactions'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentExpenses.slice(0, 3).map((expense: any) => {
                const status = EXPENSE_STATUS.find(s => s.value === expense.status);
                const paymentMethod = PAYMENT_METHODS.find(p => p.value === expense.paymentMethod);
                
                return (
                  <div key={expense.id} className="flex items-center justify-between space-x-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      <div>
                        <p className="text-sm font-medium">{expense.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {expense.category?.name} • {paymentMethod?.label}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">
                        {formatPrice(parseFloat(expense.amount), settings?.currency)}
                      </span>
                      <Badge variant="secondary" className={status?.color}>
                        {status?.icon} {status?.label}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Breakdown */}
      {stats?.monthlyExpensesByCategory && stats.monthlyExpensesByCategory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{settings?.language === 'en' ? 'Expense Overview by Category' : 'Aperçu des dépenses par catégorie'}</CardTitle>
            <CardDescription>
              {settings?.language === 'en' ? 'Breakdown of current month expenses' : 'Répartition des dépenses du mois en cours'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.monthlyExpensesByCategory.map((item: any, index: number) => {
                const percentage = item.allocatedAmount > 0 ? (item.amount / item.allocatedAmount) * 100 : 0;
                
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{item.category}</span>
                      <span className="text-muted-foreground">
                        {formatPrice(item.amount, settings?.currency)} / {formatPrice(item.allocatedAmount, settings?.currency)} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Tabs */}
      <Tabs defaultValue="expenses" className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          <TabsList className="flex flex-col sm:flex-row w-full sm:w-auto h-auto p-1 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-sm">
            <TabsTrigger 
              value="expenses" 
              className="flex items-center justify-start gap-3 w-full sm:w-auto px-6 py-3 text-sm font-medium rounded-md transition-all hover:bg-red-50 dark:hover:bg-red-900/20 data-[state=active]:bg-red-500 data-[state=active]:text-white data-[state=active]:shadow-md hover:shadow-sm"
            >
              <CreditCard className="h-5 w-5" />
              <span className="whitespace-nowrap">{t('expenses')}</span>
            </TabsTrigger>
            <TabsTrigger 
              value="imprest" 
              className="flex items-center justify-start gap-3 w-full sm:w-auto px-6 py-3 text-sm font-medium rounded-md transition-all hover:bg-blue-50 dark:hover:bg-blue-900/20 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md hover:shadow-sm"
            >
              <Wallet className="h-5 w-5" />
              <span className="whitespace-nowrap">{t('imprestFunds')}</span>
            </TabsTrigger>

            <TabsTrigger 
              value="revenues" 
              className="flex items-center justify-start gap-3 w-full sm:w-auto px-6 py-3 text-sm font-medium rounded-md transition-all hover:bg-green-50 dark:hover:bg-green-900/20 data-[state=active]:bg-green-500 data-[state=active]:text-white data-[state=active]:shadow-md hover:shadow-sm"
            >
              <TrendingUp className="h-5 w-5" />
              <span className="whitespace-nowrap">{t('revenues')}</span>
            </TabsTrigger>
            <TabsTrigger 
              value="reports" 
              className="flex items-center justify-start gap-3 w-full sm:w-auto px-6 py-3 text-sm font-medium rounded-md transition-all hover:bg-purple-50 dark:hover:bg-purple-900/20 data-[state=active]:bg-purple-500 data-[state=active]:text-white data-[state=active]:shadow-md hover:shadow-sm"
            >
              <FileText className="h-5 w-5" />
              <span className="whitespace-nowrap">{t('reports')}</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="expenses">
          <ExpenseManager />
        </TabsContent>

        <TabsContent value="imprest">
          <ImprestManager />
        </TabsContent>

        <TabsContent value="revenues">
          <RevenueManager />
        </TabsContent>

        <TabsContent value="reports">
          <ReportsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}