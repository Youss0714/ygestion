import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Edit, Eye, Calendar, DollarSign, FileText, Building2, CreditCard, Printer, Filter, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useTranslation, formatPrice } from '@/lib/i18n';
import { useSettings } from '@/hooks/useSettings';
import { insertRevenueCategorySchema, insertRevenueSchema, type RevenueCategory, type Revenue } from '@shared/schema';
import { z } from 'zod';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Composant pour la gestion des revenus
export function RevenueManager() {
  const { settings } = useSettings();
  const { t } = useTranslation(settings?.language);
  const [activeTab, setActiveTab] = useState('revenues');
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isRevenueDialogOpen, setIsRevenueDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<RevenueCategory | null>(null);
  const [editingRevenue, setEditingRevenue] = useState<Revenue | null>(null);
  const [selectedRevenue, setSelectedRevenue] = useState<Revenue | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [showDateFilter, setShowDateFilter] = useState(false);
  const itemsPerPage = 5;

  const queryClient = useQueryClient();

  // Récupérer les catégories de revenus
  const { data: categories = [], isLoading: categoriesLoading } = useQuery<RevenueCategory[]>({
    queryKey: ['/api/accounting/revenue-categories'],
  });

  // Récupérer les revenus
  const { data: revenues = [], isLoading: revenuesLoading } = useQuery<(Revenue & { category: RevenueCategory })[]>({
    queryKey: ['/api/accounting/revenues', startDate, endDate],
    queryFn: () => {
      const params = new URLSearchParams();
      if (startDate && endDate) {
        params.append('startDate', startDate);
        params.append('endDate', endDate);
      }
      return fetch(`/api/accounting/revenues?${params.toString()}`, {
        credentials: 'include'
      }).then(res => res.json());
    },
  });

  // Calculs de pagination
  const totalPages = Math.ceil(revenues.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRevenues = revenues.slice(startIndex, endIndex);

  // Formulaire pour les catégories
  const categoryForm = useForm<z.infer<typeof insertRevenueCategorySchema>>({
    resolver: zodResolver(insertRevenueCategorySchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  // Type modifié pour le formulaire avec revenueDate en string
  const revenueFormSchema = insertRevenueSchema.extend({
    revenueDate: z.string(),
  });

  // Formulaire pour les revenus
  const revenueForm = useForm<z.infer<typeof revenueFormSchema>>({
    resolver: zodResolver(revenueFormSchema),
    defaultValues: {
      description: '',
      amount: '',
      categoryId: 0,
      revenueDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'cash',
      source: '',
      notes: '',
    },
  });

  // Mutation pour créer/modifier une catégorie
  const categoryMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertRevenueCategorySchema>) => {
      if (editingCategory) {
        return apiRequest('PUT', `/api/accounting/revenue-categories/${editingCategory.id}`, data);
      } else {
        return apiRequest('POST', '/api/accounting/revenue-categories', data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/accounting/revenue-categories'] });
      setIsCategoryDialogOpen(false);
      categoryForm.reset();
      setEditingCategory(null);
      toast({
        title: editingCategory ? 'Catégorie mise à jour' : 'Catégorie créée',
        description: editingCategory ? 'La catégorie de revenus a été mise à jour avec succès.' : 'La nouvelle catégorie de revenus a été créée.',
      });
    },
    onError: (error) => {
      console.error('Erreur lors de la sauvegarde:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la sauvegarde de la catégorie.',
        variant: 'destructive',
      });
    },
  });

  // Mutation pour supprimer une catégorie
  const deleteCategoryMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/accounting/revenue-categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/accounting/revenue-categories'] });
      toast({
        title: 'Catégorie supprimée',
        description: 'La catégorie de revenus a été supprimée avec succès.',
      });
    },
    onError: (error) => {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la suppression de la catégorie.',
        variant: 'destructive',
      });
    },
  });

  // Mutation pour créer/modifier un revenu
  const revenueMutation = useMutation({
    mutationFn: async (data: z.infer<typeof revenueFormSchema>) => {
      // Convertir la date string en Date pour l'API
      const apiData = {
        ...data,
        revenueDate: new Date(data.revenueDate),
      };
      if (editingRevenue) {
        return apiRequest('PUT', `/api/accounting/revenues/${editingRevenue.id}`, apiData);
      } else {
        return apiRequest('POST', '/api/accounting/revenues', apiData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/accounting/revenues'] });
      queryClient.invalidateQueries({ queryKey: ['/api/accounting/stats'] });
      setIsRevenueDialogOpen(false);
      revenueForm.reset();
      setEditingRevenue(null);
      toast({
        title: editingRevenue ? 'Revenu mis à jour' : 'Revenu créé',
        description: editingRevenue ? 'Le revenu a été mis à jour avec succès.' : 'Le nouveau revenu a été enregistré.',
      });
    },
    onError: (error) => {
      console.error('Erreur lors de la sauvegarde:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la sauvegarde du revenu.',
        variant: 'destructive',
      });
    },
  });

  // Mutation pour supprimer un revenu
  const deleteRevenueMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/accounting/revenues/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/accounting/revenues'] });
      queryClient.invalidateQueries({ queryKey: ['/api/accounting/stats'] });
      toast({
        title: 'Revenu supprimé',
        description: 'Le revenu a été supprimé avec succès.',
      });
    },
    onError: (error) => {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la suppression du revenu.',
        variant: 'destructive',
      });
    },
  });

  const handleEditCategory = (category: RevenueCategory) => {
    setEditingCategory(category);
    categoryForm.reset({
      name: category.name,
      description: category.description || '',
    });
    setIsCategoryDialogOpen(true);
  };

  const handleEditRevenue = (revenue: Revenue) => {
    setEditingRevenue(revenue);
    revenueForm.reset({
      description: revenue.description,
      amount: revenue.amount,
      categoryId: revenue.categoryId,
      revenueDate: format(new Date(revenue.revenueDate), 'yyyy-MM-dd'),
      paymentMethod: revenue.paymentMethod,
      source: revenue.source || '',
      notes: revenue.notes || '',
    });
    setIsRevenueDialogOpen(true);
  };

  const handleViewRevenue = (revenue: Revenue & { category: RevenueCategory }) => {
    setSelectedRevenue(revenue);
    setIsDetailsDialogOpen(true);
  };

  const onCategorySubmit = (data: z.infer<typeof insertRevenueCategorySchema>) => {
    categoryMutation.mutate(data);
  };

  const onRevenueSubmit = (data: z.infer<typeof revenueFormSchema>) => {
    console.log('Tentative de création de revenu:', data);
    revenueMutation.mutate(data);
  };

  // Fonction d'impression PDF d'un revenu
  const printRevenue = (revenue: Revenue & { category?: RevenueCategory }) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Reçu de Revenu - ${revenue.reference}</title>
          <style>
            @media print {
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { font-family: Arial, sans-serif; font-size: 12px; line-height: 1.4; color: #000; }
              .print-container { max-width: 210mm; margin: 0 auto; padding: 20px; }
              .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 15px; }
              .company-name { font-size: 24px; font-weight: bold; color: #2563eb; margin-bottom: 5px; }
              .document-title { font-size: 18px; font-weight: bold; margin-top: 15px; }
              .info-section { margin: 20px 0; }
              .info-row { display: flex; justify-content: space-between; margin: 8px 0; }
              .label { font-weight: bold; color: #374151; }
              .value { color: #000; }
              .amount-section { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; }
              .amount { font-size: 24px; font-weight: bold; color: #059669; }
              .footer { margin-top: 40px; text-align: center; font-size: 10px; color: #6b7280; }
            }
            @page { margin: 15mm; }
          </style>
        </head>
        <body>
          <div class="print-container">
            <div class="header">
              <div class="company-name">YGestion</div>
              <div>Système de Gestion d'Entreprise</div>
              <div class="document-title">REÇU DE REVENU</div>
            </div>
            
            <div class="info-section">
              <div class="info-row">
                <span class="label">Référence:</span>
                <span class="value">${revenue.reference}</span>
              </div>
              <div class="info-row">
                <span class="label">Date:</span>
                <span class="value">${format(new Date(revenue.revenueDate), 'dd/MM/yyyy', { locale: fr })}</span>
              </div>
              <div class="info-row">
                <span class="label">Description:</span>
                <span class="value">${revenue.description}</span>
              </div>
              <div class="info-row">
                <span class="label">Catégorie:</span>
                <span class="value">${revenue.category?.name || 'Sans catégorie'}</span>
              </div>
              <div class="info-row">
                <span class="label">Mode de paiement:</span>
                <span class="value">${revenue.paymentMethod.replace('_', ' ')}</span>
              </div>
              ${revenue.source ? `
                <div class="info-row">
                  <span class="label">Source:</span>
                  <span class="value">${revenue.source}</span>
                </div>
              ` : ''}
              ${revenue.notes ? `
                <div class="info-row">
                  <span class="label">Notes:</span>
                  <span class="value">${revenue.notes}</span>
                </div>
              ` : ''}
            </div>
            
            <div class="amount-section">
              <div class="label">MONTANT</div>
              <div class="amount">${formatPrice(parseFloat(revenue.amount), settings?.currency)}</div>
            </div>
            
            <div class="footer">
              <p>Document généré le ${format(new Date(), 'dd/MM/yyyy à HH:mm', { locale: fr })}</p>
              <p>YGestion - Gestion d'entreprise simplifiée</p>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };





  // Télécharger tous les revenus en CSV
  const handleDownloadCSV = () => {
    if (revenues.length === 0) {
      toast({
        title: "Aucun revenu",
        description: "Il n'y a aucun revenu à exporter.",
        variant: "destructive"
      });
      return;
    }

    // En-têtes CSV
    const headers = [
      'Référence',
      'Date',
      'Description',
      'Catégorie', 
      'Mode de paiement',
      `Montant (${settings?.currency === 'GHS' ? 'GHS' : 'FCFA'})`,
      'Source',
      'Notes'
    ];

    // Convertir les données en CSV
    const csvData = revenues.map((revenue: any) => {
      return [
        revenue.reference || '',
        format(new Date(revenue.revenueDate), 'dd/MM/yyyy', { locale: fr }),
        revenue.description || '',
        revenue.category?.name || 'Sans catégorie',
        revenue.paymentMethod.replace('_', ' '),
        parseFloat(revenue.amount).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ' '),
        revenue.source || '',
        revenue.notes || ''
      ];
    });

    // Créer le contenu CSV avec BOM pour Windows
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');

    // Télécharger le fichier avec BOM UTF-8
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `revenus_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export réussi",
      description: `${revenues.length} revenus exportés en CSV.`
    });
  };

  return (
    <div className="space-y-6">
      {/* Navigation par onglets */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('revenues')}
          className={`px-6 py-3 text-sm font-medium rounded-md transition-all duration-200 flex items-center space-x-2 min-w-[120px] justify-center ${
            activeTab === 'revenues'
              ? 'bg-green-500 text-white shadow-sm'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
          data-testid="tab-revenues"
        >
          <DollarSign className="w-4 h-4" />
          <span>Revenus</span>
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-6 py-3 text-sm font-medium rounded-md transition-all duration-200 flex items-center space-x-2 min-w-[120px] justify-center ${
            activeTab === 'categories'
              ? 'bg-blue-500 text-white shadow-sm'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
          data-testid="tab-categories"
        >
          <Building2 className="w-4 h-4" />
          <span>Catégories</span>
        </button>
      </div>

      {/* Onglet Revenus */}
      {activeTab === 'revenues' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Gestion des Revenus</h3>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowDateFilter(!showDateFilter)}
                data-testid="button-toggle-revenue-date-filter"
              >
                <Filter className="mr-2 h-4 w-4" />
                Filtrer par période
              </Button>
              <Button 
                variant="outline" 
                onClick={handleDownloadCSV}
                disabled={revenues.length === 0}
                data-testid="button-download-revenues-csv"
              >
                <FileDown className="mr-2 h-4 w-4" />
                Télécharger CSV
              </Button>
              <Dialog open={isRevenueDialogOpen} onOpenChange={setIsRevenueDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-revenue">
                  <Plus className="w-4 h-4 mr-2" />
                  Nouveau Revenu
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingRevenue ? 'Modifier le Revenu' : 'Nouveau Revenu'}
                  </DialogTitle>
                </DialogHeader>
                <Form {...revenueForm}>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    console.log("Revenue form submitted");
                    const values = revenueForm.getValues();
                    console.log("Revenue form values:", values);
                    console.log("Revenue form errors:", revenueForm.formState.errors);
                    if (values.description && values.amount && values.categoryId) {
                      onRevenueSubmit(values);
                    } else {
                      console.log("Validation failed - missing required fields");
                    }
                  }} className="space-y-6 p-4">
                    <FormField
                      control={revenueForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-revenue-description" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={revenueForm.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Montant ({settings?.currency === 'GHS' ? 'GHS' : 'FCFA'})</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" step="0.01" min="0" data-testid="input-revenue-amount" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={revenueForm.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Catégorie</FormLabel>
                          <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                            <FormControl>
                              <SelectTrigger data-testid="select-revenue-category">
                                <SelectValue placeholder="Sélectionner une catégorie" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((category) => (
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

                    <FormField
                      control={revenueForm.control}
                      name="revenueDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date du Revenu</FormLabel>
                          <FormControl>
                            <Input {...field} type="date" data-testid="input-revenue-date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={revenueForm.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mode de Paiement</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-payment-method">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="cash">Espèces</SelectItem>
                              <SelectItem value="bank_transfer">Virement Bancaire</SelectItem>
                              <SelectItem value="check">Chèque</SelectItem>
                              <SelectItem value="mobile_money">Mobile Money</SelectItem>
                              <SelectItem value="card">Carte</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={revenueForm.control}
                      name="source"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Source</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ''} data-testid="input-revenue-source" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={revenueForm.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <Textarea {...field} value={field.value || ''} data-testid="textarea-revenue-notes" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <DialogFooter className="flex space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsRevenueDialogOpen(false);
                          revenueForm.reset();
                          setEditingRevenue(null);
                        }}
                        data-testid="button-cancel-revenue"
                      >
                        Annuler
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={revenueMutation.isPending}
                        data-testid="button-save-revenue"
                        onClick={() => console.log("Revenue button clicked directly")}
                      >
                        {revenueMutation.isPending ? 'Sauvegarde...' : (editingRevenue ? 'Modifier' : 'Créer')}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
            </div>
          </div>

          {/* Filtre par période pour les revenus */}
          {showDateFilter && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <Label htmlFor="revenue-start-date">Du :</Label>
                    <Input
                      id="revenue-start-date"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-auto"
                      data-testid="input-revenue-start-date"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="revenue-end-date">Au :</Label>
                    <Input
                      id="revenue-end-date"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-auto"
                      data-testid="input-revenue-end-date"
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setStartDate("");
                      setEndDate("");
                    }}
                    data-testid="button-clear-revenue-filter"
                  >
                    Effacer
                  </Button>
                </div>
                {startDate && endDate && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Affichage des revenus du {new Date(startDate).toLocaleDateString('fr-FR')} au {new Date(endDate).toLocaleDateString('fr-FR')}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {revenuesLoading ? (
            <div className="text-center py-8">Chargement des revenus...</div>
          ) : revenues.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <DollarSign className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">Aucun revenu enregistré</p>
                <p className="text-sm text-gray-400 mt-2">Cliquez sur "Nouveau Revenu" pour commencer</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Référence
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Description
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Montant
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Catégorie
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Paiement
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                        {paginatedRevenues.map((revenue) => (
                          <tr key={revenue.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                              {revenue.reference}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                              {revenue.description}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600 dark:text-green-400">
                              {formatPrice(parseFloat(revenue.amount), settings?.currency)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {revenue.category?.name || 'Sans catégorie'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {format(new Date(revenue.revenueDate), 'dd/MM/yyyy', { locale: fr })}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 capitalize">
                              {revenue.paymentMethod.replace('_', ' ')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewRevenue(revenue)}
                                  data-testid={`button-view-revenue-${revenue.id}`}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditRevenue(revenue)}
                                  data-testid={`button-edit-revenue-${revenue.id}`}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => printRevenue(revenue)}
                                  data-testid={`button-print-revenue-${revenue.id}`}
                                >
                                  <Printer className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => deleteRevenueMutation.mutate(revenue.id)}
                                  data-testid={`button-delete-revenue-${revenue.id}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    data-testid="button-prev-page"
                  >
                    Précédent
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <Button
                      key={page}
                      variant={page === currentPage ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      data-testid={`button-page-${page}`}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    data-testid="button-next-page"
                  >
                    Suivant
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Onglet Catégories */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Catégories de Revenus</h3>
            <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-category">
                  <Plus className="w-4 h-4 mr-2" />
                  Nouvelle Catégorie
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingCategory ? 'Modifier la Catégorie' : 'Nouvelle Catégorie'}
                  </DialogTitle>
                </DialogHeader>
                <Form {...categoryForm}>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    console.log("Revenue category form submitted");
                    const values = categoryForm.getValues();
                    console.log("Form values:", values);
                    console.log("Form errors:", categoryForm.formState.errors);
                    if (values.name) {
                      onCategorySubmit(values);
                    }
                  }} className="space-y-4">
                    <FormField
                      control={categoryForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom de la catégorie</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-category-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={categoryForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea {...field} value={field.value || ''} data-testid="textarea-category-description" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <DialogFooter className="flex space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsCategoryDialogOpen(false);
                          categoryForm.reset();
                          setEditingCategory(null);
                        }}
                        data-testid="button-cancel-category"
                      >
                        Annuler
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={categoryMutation.isPending}
                        data-testid="button-save-category"
                        onClick={() => console.log("Revenue category button clicked directly")}
                      >
                        {categoryMutation.isPending ? 'Sauvegarde...' : (editingCategory ? 'Modifier' : 'Créer')}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {categoriesLoading ? (
            <div className="text-center py-8">Chargement des catégories...</div>
          ) : categories.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Building2 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">Aucune catégorie créée</p>
                <p className="text-sm text-gray-400 mt-2">Créez des catégories pour organiser vos revenus</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <Card key={category.id}>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-start">
                      <span>{category.name}</span>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditCategory(category)}
                          data-testid={`button-edit-category-${category.id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteCategoryMutation.mutate(category.id)}
                          data-testid={`button-delete-category-${category.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardTitle>
                    {category.description && (
                      <CardDescription>{category.description}</CardDescription>
                    )}
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Dialog pour les détails du revenu */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Détails du Revenu</DialogTitle>
          </DialogHeader>
          {selectedRevenue && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Référence</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedRevenue.reference}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Montant</Label>
                  <p className="text-sm font-bold text-green-600">
                    {formatPrice(parseFloat(selectedRevenue.amount), settings?.currency)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Date</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {format(new Date(selectedRevenue.revenueDate), 'dd/MM/yyyy', { locale: fr })}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Mode de paiement</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                    {selectedRevenue.paymentMethod.replace('_', ' ')}
                  </p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">{selectedRevenue.description}</p>
              </div>
              {selectedRevenue.source && (
                <div>
                  <Label className="text-sm font-medium">Source</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedRevenue.source}</p>
                </div>
              )}
              {selectedRevenue.notes && (
                <div>
                  <Label className="text-sm font-medium">Notes</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedRevenue.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => selectedRevenue && printRevenue(selectedRevenue as Revenue & { category: RevenueCategory })}
              data-testid="button-print-revenue"
            >
              <FileText className="w-4 h-4 mr-2" />
              Imprimer
            </Button>
            <Button onClick={() => setIsDetailsDialogOpen(false)} data-testid="button-close-details">
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}