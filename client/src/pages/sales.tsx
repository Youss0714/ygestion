import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Calendar,
  Package,
  Users,
  BarChart3
} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { type Sale } from "@shared/schema";
import { SalesListSkeleton } from "@/components/loading-skeletons";

export default function Sales() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  const { data: sales = [], isLoading: salesLoading } = useQuery<Sale[]>({
    queryKey: ["/api/sales"],
    retry: false,
    refetchInterval: 45000, // Rafraîchit toutes les 45 secondes
    refetchIntervalInBackground: true,
    staleTime: 0,
  });

  const { data: stats } = useQuery<{
    revenue: number;
    invoiceCount: number;
    clientCount: number;
    productCount: number;
    recentInvoices: any[];
    topProducts: any[];
    lowStockProducts: any[];
  }>({
    queryKey: ["/api/dashboard/stats"],
    retry: false,
    refetchInterval: 30000, // Rafraîchit toutes les 30 secondes
    refetchIntervalInBackground: true,
    staleTime: 0,
  });

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    // Utilise XOF par défaut pour les ventes
    return new Intl.NumberFormat('fr-FR', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numAmount) + ' F CFA';
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('fr-FR');
  };

  // Pagination calculations
  const totalItems = sales.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSales = sales.slice(startIndex, endIndex);

  // Calculate sales statistics
  const totalSales = sales.reduce((sum: number, sale: Sale) => sum + parseFloat(sale.total), 0);
  const averageSale = sales.length > 0 ? totalSales / sales.length : 0;
  const totalQuantity = sales.reduce((sum: number, sale: Sale) => sum + sale.quantity, 0);

  // Group sales by month for chart data
  const salesByMonth = sales.reduce((acc: any, sale: Sale) => {
    const month = new Date(sale.createdAt!).toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
    if (!acc[month]) {
      acc[month] = { total: 0, count: 0 };
    }
    acc[month].total += parseFloat(sale.total);
    acc[month].count += 1;
    return acc;
  }, {});

  if (isLoading || salesLoading) {
    return <SalesListSkeleton />;
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header 
        title="Historique des Ventes" 
        subtitle="Analysez vos performances de vente"
      />

      <main className="flex-1 overflow-y-auto p-6">
        {/* Sales Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Ventes Totales</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalSales)}</p>
                  <p className="text-sm text-green-600 mt-1">
                    {sales.length} transactions
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-green-500 text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Vente Moyenne</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(averageSale)}</p>
                  <p className="text-sm text-blue-600 mt-1">
                    par transaction
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <BarChart3 className="text-blue-500 text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Articles Vendus</p>
                  <p className="text-2xl font-bold text-gray-900">{totalQuantity}</p>
                  <p className="text-sm text-purple-600 mt-1">
                    unités au total
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                  <Package className="text-purple-500 text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Clients Actifs</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.clientCount || 0}</p>
                  <p className="text-sm text-orange-600 mt-1">
                    clients totaux
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                  <Users className="text-orange-500 text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales by Month */}
          <Card>
            <CardHeader>
              <CardTitle>Ventes par Mois</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(salesByMonth).length === 0 ? (
                <div className="py-12 text-center">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Aucune donnée de vente disponible</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(salesByMonth).map(([month, data]: [string, any]) => (
                    <div key={month} className="flex items-center justify-between p-3 bg-white/30 dark:bg-gray-800/30 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{month}</p>
                        <p className="text-sm text-gray-500">{data.count} ventes</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{formatCurrency(data.total)}</p>
                        <p className="text-sm text-gray-500">
                          {formatCurrency(data.total / data.count)} moy.
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle>Produits les Plus Vendus</CardTitle>
            </CardHeader>
            <CardContent>
              {!stats?.topProducts || stats.topProducts.length === 0 ? (
                <div className="py-12 text-center">
                  <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Aucun produit vendu</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.topProducts.map((product: any, index: number) => (
                    <div key={product.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">
                            #{index + 1}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-500">{formatCurrency(product.price)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary">
                          {product.salesCount} vendus
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Sales */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Ventes Récentes</CardTitle>
          </CardHeader>
          <CardContent>
            {sales.length === 0 ? (
              <div className="py-12 text-center">
                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune vente</h3>
                <p className="text-gray-500">Les ventes apparaîtront ici une fois que vous aurez créé des factures payées.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/50 dark:bg-gray-800/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Produit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantité
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Prix Unitaire
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedSales.map((sale: Sale) => (
                      <tr key={sale.id} className="hover:bg-white/30 dark:hover:bg-gray-700/30">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {sale.createdAt && formatDate(sale.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          Produit #{sale.productId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {sale.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(sale.unitPrice)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          {formatCurrency(sale.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Affichage de {startIndex + 1} à {Math.min(endIndex, totalItems)} sur {totalItems} ventes
                </div>
                <Pagination>
                  <PaginationContent>
                    {/* Première page */}
                    <PaginationItem>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(1);
                        }}
                        className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                        size="sm"
                      >
                        ««
                      </PaginationLink>
                    </PaginationItem>
                    
                    <PaginationItem>
                      <PaginationPrevious 
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage > 1) {
                            setCurrentPage(currentPage - 1);
                          }
                        }}
                        className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    
                    {/* Page numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(page);
                          }}
                          isActive={currentPage === page}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage < totalPages) {
                            setCurrentPage(currentPage + 1);
                          }
                        }}
                        className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    
                    {/* Dernière page */}
                    <PaginationItem>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(totalPages);
                        }}
                        className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                        size="sm"
                      >
                        »»
                      </PaginationLink>
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
