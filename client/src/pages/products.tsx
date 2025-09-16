import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { ProductListSkeleton } from "@/components/loading-skeletons";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Header from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  Edit, 
  Trash2, 
  Plus,
  Search,
  AlertTriangle,
  TrendingUp,
  History
} from "lucide-react";
import { insertProductSchema, insertStockReplenishmentSchema, type Product, type InsertProduct, type Category, type StockReplenishment, type InsertStockReplenishment } from "@shared/schema";
import { formatPrice, useTranslation } from "@/lib/i18n";
import { useSettings } from "@/hooks/useSettings";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Package as PackageIcon } from "lucide-react";

export default function Products() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const { settings } = useSettings();
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isReplenishmentDialogOpen, setIsReplenishmentDialogOpen] = useState(false);
  const [selectedProductForReplenishment, setSelectedProductForReplenishment] = useState<Product | null>(null);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: t('unauthorized'),
        description: t('unauthorizedDesc'),
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    retry: false,
    refetchInterval: 60000, // Refresh every 60 seconds
    refetchIntervalInBackground: true,
    staleTime: 30000,
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    retry: false,
    refetchInterval: 120000, // Refresh every 2 minutes
    staleTime: 60000,
  });

  // Query for stock replenishments
  const { data: stockReplenishments = [] } = useQuery<StockReplenishment[]>({
    queryKey: ["/api/stock-replenishments"],
    retry: false,
    refetchInterval: 60000,
    staleTime: 30000,
  });

  // Query for specific product replenishments (conditional)
  const { data: productReplenishments = [], isLoading: productReplenishmentsLoading } = useQuery<StockReplenishment[]>({
    queryKey: ["/api/products", selectedProductForReplenishment?.id, "replenishments"],
    queryFn: async () => {
      if (!selectedProductForReplenishment) return [];
      const response = await apiRequest("GET", `/api/products/${selectedProductForReplenishment.id}/replenishments`);
      const jsonData = await response.json();
      return Array.isArray(jsonData) ? jsonData as StockReplenishment[] : [];
    },
    enabled: !!selectedProductForReplenishment && isHistoryDialogOpen,
    retry: false,
  });

  const form = useForm<InsertProduct>({
    resolver: zodResolver(insertProductSchema.omit({ userId: true })),
    defaultValues: {
      name: "",
      description: "",
      priceHT: "",
      alertStock: 10,
      categoryId: undefined,
    },
  });

  const replenishmentForm = useForm({
    defaultValues: {
      quantity: 0,
      costPerUnit: "",
      totalCost: "",
      supplier: "",
      reference: "",
      notes: "",
    },
  });

  // Calcul automatique du coût total
  const watchedQuantity = replenishmentForm.watch("quantity");
  const watchedCostPerUnit = replenishmentForm.watch("costPerUnit");

  useEffect(() => {
    const quantity = Number(watchedQuantity) || 0;
    const costPerUnit = Number(watchedCostPerUnit) || 0;
    const totalCost = quantity * costPerUnit;
    
    if (quantity > 0 && costPerUnit > 0) {
      replenishmentForm.setValue("totalCost", totalCost.toFixed(2));
    } else {
      replenishmentForm.setValue("totalCost", "");
    }
  }, [watchedQuantity, watchedCostPerUnit, replenishmentForm]);

  const createMutation = useMutation({
    mutationFn: async (data: InsertProduct) => {
      await apiRequest("POST", "/api/products", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: t('productCreated'),
        description: t('productCreatedDesc'),
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: t('error'),
        description: t('errorCreateProduct'),
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: InsertProduct) => {
      if (!editingProduct) throw new Error("No product to update");
      await apiRequest("PUT", `/api/products/${editingProduct.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: t('productModified'),
        description: t('productModifiedDesc'),
      });
      setIsDialogOpen(false);
      setEditingProduct(null);
      form.reset();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: t('error'),
        description: t('errorUpdateProduct'),
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: t('productDeleted'),
        description: t('productDeletedDesc'),
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: t('error'),
        description: t('errorDeleteProduct'),
        variant: "destructive",
      });
    },
  });

  // Stock replenishment mutations
  const createReplenishmentMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!selectedProductForReplenishment) throw new Error("No product selected");
      await apiRequest("POST", "/api/stock-replenishments", { 
        ...data, 
        productId: selectedProductForReplenishment.id 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stock-replenishments"] });
      // Also invalidate the specific product history
      if (selectedProductForReplenishment) {
        queryClient.invalidateQueries({ queryKey: ["/api/products", selectedProductForReplenishment.id, "replenishments"] });
      }
      toast({
        title: t('replenishmentAdded'),
        description: t('replenishmentAddedDesc'),
      });
      setIsReplenishmentDialogOpen(false);
      setSelectedProductForReplenishment(null);
      replenishmentForm.reset();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: t('error'),
        description: t('errorAddReplenishment'),
        variant: "destructive",
      });
    },
  });

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      form.reset({
        name: product.name,
        description: product.description || "",
        priceHT: product.priceHT,
        alertStock: product.alertStock || 10,
        categoryId: product.categoryId || undefined,
      });
    } else {
      setEditingProduct(null);
      form.reset({
        name: "",
        description: "",
        priceHT: "",
        alertStock: 10,
        categoryId: undefined,
      });
    }
    setIsDialogOpen(true);
  };

  const handleOpenReplenishmentDialog = (product: Product) => {
    setSelectedProductForReplenishment(product);
    replenishmentForm.reset({
      quantity: 0,
      costPerUnit: "",
      totalCost: "",
      supplier: "",
      reference: "",
      notes: "",
    });
    setIsReplenishmentDialogOpen(true);
  };

  const handleOpenHistoryDialog = (product: Product) => {
    setSelectedProductForReplenishment(product);
    setIsHistoryDialogOpen(true);
  };

  const onSubmit = (data: InsertProduct) => {
    if (editingProduct) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const onReplenishmentSubmit = (data: any) => {
    createReplenishmentMutation.mutate(data);
  };

  const filteredProducts = products.filter((product: Product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryName = (categoryId: number | null) => {
    if (!categoryId) return t('noCategory');
    const category = categories.find((cat: Category) => cat.id === categoryId);
    return category?.name || t('unknownCategory');
  };

  const formatProductPrice = (price: string) => {
    const currency = settings?.currency || 'XOF';
    return formatPrice(parseFloat(price), currency);
  };

  const getStockStatus = (stock: number | null, alertStock: number | null = 10) => {
    const stockValue = stock || 0;
    const alertValue = alertStock || 10;
    if (stockValue === 0) {
      return { label: t('outOfStock'), variant: "destructive" as const, icon: AlertTriangle };
    } else if (stockValue <= alertValue) {
      return { label: t('lowStock'), variant: "secondary" as const, icon: AlertTriangle };
    }
    return { label: t('inStock'), variant: "secondary" as const, icon: null };
  };

  if (isLoading || productsLoading) {
    return <ProductListSkeleton />;
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header 
        title={t('products')} 
        subtitle={t('manageProducts')}
        action={{
          label: t('newProduct'),
          onClick: () => handleOpenDialog()
        }}
      />

      <main className="flex-1 overflow-y-auto p-6">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder={t('searchProduct')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? t('noProductFound') : t('noProduct')}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm 
                  ? t('tryModifySearch')
                  : t('addFirstProduct')
                }
              </p>
              {!searchTerm && (
                <Button onClick={() => handleOpenDialog()}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t('newProduct')}
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product: Product) => {
              const stockStatus = getStockStatus(product.stock, product.alertStock);
              const StockIcon = stockStatus.icon;
              
              return (
                <Card key={product.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{product.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline">
                            {getCategoryName(product.categoryId)}
                          </Badge>
                          <Badge variant={stockStatus.variant} className="flex items-center gap-1">
                            {StockIcon && <StockIcon className="w-3 h-3" />}
                            {stockStatus.label}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-1">
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenReplenishmentDialog(product)}
                            title={t('replenishStock')}
                          >
                            <TrendingUp className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenHistoryDialog(product)}
                            title={t('replenishmentHistory')}
                          >
                            <History className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog(product)}
                            title={t('editProduct')}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteMutation.mutate(product.id)}
                            disabled={deleteMutation.isPending}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            title={t('deleteProduct')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {product.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg font-semibold text-gray-900">
                          {formatProductPrice(product.priceHT)} HT
                        </p>
                        <div className="text-sm text-gray-500 space-y-1">
                          <p>{t('stock')}: {product.stock || 0} {t('units')}</p>
                          <p>{t('stockAlertThreshold')}: {product.alertStock || 10} {t('units')}</p>
                        </div>
                      </div>
                    </div>
                    <div className="pt-2 text-xs text-gray-500">
                      {t('createdOn')} {product.createdAt && new Date(product.createdAt).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? t('editProduct') : t('newProduct')}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('productName')} *</FormLabel>
                      <FormControl>
                        <Input placeholder={t('productNamePlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('description')}</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder={t('descriptionPlaceholder')}
                          rows={3}
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="priceHT"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('priceHT')} ({settings?.currency === 'GHS' ? 'GH₵' : 'XOF'}) *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            min="0.01"
                            placeholder="0.00" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('category')}</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(value === "none" ? undefined : value ? parseInt(value) : undefined)}
                          value={field.value?.toString() || "none"}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('selectCategory')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">{t('noCategory')}</SelectItem>
                            {categories.map((category: Category) => (
                              <SelectItem key={category.id} value={category.id.toString()}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="alertStock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('stockAlertThreshold')}</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1"
                          placeholder="10" 
                          {...field}
                          value={field.value || 10}
                          onChange={(e) => field.onChange(Math.max(1, parseInt(e.target.value) || 10))}
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-gray-500 mt-1">
{t('stockManagedAutomatically')}
                      </p>
                    </FormItem>
                  )}
                />





                <div className="flex justify-end space-x-4 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    {t('cancel')}
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {editingProduct ? t('modify') : t('create')}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Stock Replenishment Dialog */}
        <Dialog open={isReplenishmentDialogOpen} onOpenChange={setIsReplenishmentDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                Réapprovisionner le stock - {selectedProductForReplenishment?.name}
              </DialogTitle>
            </DialogHeader>
            <Form {...replenishmentForm}>
              <form onSubmit={replenishmentForm.handleSubmit(onReplenishmentSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={replenishmentForm.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantité *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1"
                            placeholder="100" 
                            {...field}
                            onChange={(e) => {
                              const value = Math.max(1, parseInt(e.target.value) || 0);
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={replenishmentForm.control}
                    name="costPerUnit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Coût unitaire ({settings?.currency === 'GHS' ? 'GH₵' : 'XOF'})</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            min="0"
                            placeholder="0.00" 
                            {...field} 
                            value={field.value || ""}
                            onChange={(e) => {
                              field.onChange(e.target.value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={replenishmentForm.control}
                  name="totalCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Coût total ({settings?.currency === 'GHS' ? 'GH₵' : 'XOF'})</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          min="0"
                          placeholder="0.00" 
                          {...field} 
                          value={field.value || ""}
                          readOnly
                          className="bg-white/50 dark:bg-gray-800/50 cursor-not-allowed"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={replenishmentForm.control}
                    name="supplier"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fournisseur</FormLabel>
                        <FormControl>
                          <Input placeholder="Nom du fournisseur" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={replenishmentForm.control}
                    name="reference"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Référence/Facture</FormLabel>
                        <FormControl>
                          <Input placeholder="REF-2024-001" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={replenishmentForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Notes sur ce réapprovisionnement..."
                          rows={3}
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-4 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsReplenishmentDialogOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createReplenishmentMutation.isPending}
                  >
                    Réapprovisionner
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Stock Replenishment History Dialog */}
        <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>
                Historique des réapprovisionnements - {selectedProductForReplenishment?.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {productReplenishmentsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">Chargement de l'historique...</p>
                </div>
              ) : !Array.isArray(productReplenishments) || productReplenishments.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    Aucun réapprovisionnement
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Ce produit n'a pas encore été réapprovisionné.
                  </p>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  <div className="space-y-3">
                    {Array.isArray(productReplenishments) && productReplenishments.map((replenishment: StockReplenishment) => (
                      <Card key={replenishment.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-4">
                              <div>
                                <p className="font-medium">+{replenishment.quantity} unités</p>
                                <p className="text-sm text-gray-500">
                                  {replenishment.createdAt && new Date(replenishment.createdAt).toLocaleDateString('fr-FR')}
                                </p>
                              </div>
                              {replenishment.supplier && (
                                <div>
                                  <p className="text-sm font-medium">Fournisseur:</p>
                                  <p className="text-sm text-gray-600">{replenishment.supplier}</p>
                                </div>
                              )}
                              {replenishment.totalCost && (
                                <div>
                                  <p className="text-sm font-medium">Coût total:</p>
                                  <p className="text-sm text-gray-600">
                                    {formatPrice(parseFloat(replenishment.totalCost), settings?.currency || 'XOF')}
                                  </p>
                                </div>
                              )}
                            </div>
                            {replenishment.notes && (
                              <p className="text-sm text-gray-500 mt-2">{replenishment.notes}</p>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex justify-end pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsHistoryDialogOpen(false)}
                >
                  Fermer
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
