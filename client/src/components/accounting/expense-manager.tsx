import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Edit, Trash2, Check, X, Eye, DollarSign, Printer, Download, Calendar, Filter, FileDown } from "lucide-react";
import { ExpensePDF } from "./expense-pdf";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useTranslation, formatPrice } from "@/lib/i18n";
import { useSettings } from "@/hooks/useSettings";
import { 
  insertExpenseSchema, 
  insertExpenseCategorySchema, 
  EXPENSE_STATUS, 
  PAYMENT_METHODS,
  type NewExpense,
  type NewExpenseCategory 
} from "@shared/schema";

export function ExpenseManager() {
  const { settings } = useSettings();
  const { t } = useTranslation(settings?.language);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(3);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [showDateFilter, setShowDateFilter] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Queries
  const { data: expenses = [], isLoading: expensesLoading } = useQuery<any[]>({
    queryKey: ["/api/accounting/expenses", startDate, endDate],
    queryFn: () => {
      const params = new URLSearchParams();
      if (startDate && endDate) {
        params.append('startDate', startDate);
        params.append('endDate', endDate);
      }
      return fetch(`/api/accounting/expenses?${params.toString()}`, {
        credentials: 'include'
      }).then(res => res.json());
    },
  });

  const { data: categories = [] } = useQuery<any[]>({
    queryKey: ["/api/accounting/expense-categories"],
  });

  const { data: imprestFunds = [] } = useQuery<any[]>({
    queryKey: ["/api/accounting/imprest-funds"],
  });

  const { data: chartOfAccounts = [] } = useQuery<any[]>({
    queryKey: ["/api/accounting/chart-of-accounts"],
  });

  const { data: user } = useQuery<any>({
    queryKey: ["/api/user"],
  });

  // Forms
  const expenseForm = useForm({
    resolver: zodResolver(insertExpenseSchema),
    defaultValues: {
      description: "",
      amount: "",
      paymentMethod: "cash",
      status: "pending",
      expenseDate: new Date().toISOString().split('T')[0],
      categoryId: undefined,
      accountId: undefined,
      notes: "",
      imprestId: undefined,
    },
  });

  const categoryForm = useForm({
    resolver: zodResolver(insertExpenseCategorySchema),
    defaultValues: {
      name: "",
      description: "",
      isMajor: false,
    },
  });

  // Mutations
  const createExpenseMutation = useMutation({
    mutationFn: (data: InsertExpense) => apiRequest("POST", "/api/accounting/expenses", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounting/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/accounting/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/accounting/imprest-funds"] });
      setIsExpenseDialogOpen(false);
      expenseForm.reset();
      toast({ title: "Dépense créée avec succès" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Erreur", 
        description: error.message || "Erreur lors de la création de la dépense",
        variant: "destructive" 
      });
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: (data: InsertExpenseCategory) => apiRequest("POST", "/api/accounting/expense-categories", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounting/expense-categories"] });
      setIsCategoryDialogOpen(false);
      categoryForm.reset();
      toast({ title: "Catégorie créée avec succès" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Erreur", 
        description: error.message || "Erreur lors de la création de la catégorie",
        variant: "destructive" 
      });
    },
  });

  const approveExpenseMutation = useMutation({
    mutationFn: (id: number) => apiRequest("PATCH", `/api/accounting/expenses/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounting/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/accounting/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/accounting/imprest-funds"] });
      toast({ title: "Dépense approuvée avec succès" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Erreur", 
        description: error.message || "Erreur lors de l'approbation",
        variant: "destructive" 
      });
    },
  });

  const rejectExpenseMutation = useMutation({
    mutationFn: (id: number) => apiRequest("PATCH", `/api/accounting/expenses/${id}/reject`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounting/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/accounting/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/accounting/imprest-funds"] });
      toast({ title: "Dépense rejetée" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Erreur", 
        description: error.message || "Erreur lors du rejet",
        variant: "destructive" 
      });
    },
  });

  const handleCreateExpense = (data: any) => {
    console.log("Creating expense:", data);
    createExpenseMutation.mutate(data);
  };

  const handleCreateCategory = (data: any) => {
    console.log("Creating category:", data);
    createCategoryMutation.mutate(data);
  };

  // Bulk print/download functions
  const handleBulkPrint = () => {
    // Filtrer seulement les dépenses approuvées
    const approvedExpenses = expenses.filter((expense: any) => expense.status === 'approved');
    
    if (!approvedExpenses || approvedExpenses.length === 0) {
      toast({
        title: "Aucune dépense approuvée",
        description: "Il n'y a aucune dépense approuvée à imprimer",
        variant: "destructive"
      });
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const totalAmount = approvedExpenses.reduce((sum: number, expense: any) => sum + parseFloat(expense.amount), 0);
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Liste des dépenses</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .expenses-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .expenses-table th, .expenses-table td { 
              border: 1px solid #ddd; 
              padding: 12px; 
              text-align: left; 
            }
            .expenses-table th { 
              background-color: #f5f5f5; 
              font-weight: bold; 
            }
            .expenses-table tbody tr:nth-child(even) { 
              background-color: #f9f9f9; 
            }
            .amount { text-align: right; font-weight: bold; }
            .summary { margin-top: 30px; padding-top: 20px; border-top: 2px solid #333; }
            .total { font-size: 1.2em; font-weight: bold; text-align: right; }
            @media print { 
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>LISTE DES DÉPENSES APPROUVÉES</h1>
            <p>Généré le ${new Date().toLocaleDateString('fr-FR')}</p>
          </div>

          <table class="expenses-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Montant ({settings?.currency === 'GHS' ? 'GHS' : 'FCFA'})</th>
              </tr>
            </thead>
            <tbody>
              ${approvedExpenses.map((expense: any) => `
                <tr>
                  <td>${new Date(expense.expenseDate).toLocaleDateString('fr-FR')}</td>
                  <td>${expense.description}</td>
                  <td class="amount">${parseFloat(expense.amount).toLocaleString('fr-FR', { useGrouping: true }).replace(/\s/g, ' ')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="summary">
            <div class="total">
              <p>TOTAL: {formatPrice(totalAmount, settings?.currency)}</p>
            </div>
            <p><em>Nombre de dépenses approuvées: ${approvedExpenses.length}</em></p>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const handleBulkDownload = async () => {
    // Filtrer seulement les dépenses approuvées
    const approvedExpenses = expenses.filter((expense: any) => expense.status === 'approved');
    
    if (!approvedExpenses || approvedExpenses.length === 0) {
      toast({
        title: "Aucune dépense approuvée",
        description: "Il n'y a aucune dépense approuvée à télécharger",
        variant: "destructive"
      });
      return;
    }

    try {
      const { jsPDF } = await import('jspdf');
      const html2canvas = (await import('html2canvas')).default;

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const totalAmount = approvedExpenses.reduce((sum: number, expense: any) => sum + parseFloat(expense.amount), 0);

      // Header
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('RAPPORT DE DÉPENSES APPROUVÉES - AUDIT', pageWidth / 2, 30, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, pageWidth / 2, 40, { align: 'center' });

      // Company info
      let yPos = 60;
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Informations de l\'entreprise', margin, yPos);
      
      yPos += 10;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Entreprise: ${user?.company || 'N/A'}`, margin, yPos);
      yPos += 7;
      pdf.text(`Responsable: ${user?.firstName} ${user?.lastName}`, margin, yPos);
      yPos += 7;
      pdf.text(`Email: ${user?.email}`, margin, yPos);

      // Expenses list
      yPos += 20;
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Détail des dépenses approuvées (${approvedExpenses.length} dépense(s))`, margin, yPos);

      yPos += 15;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');

      for (const expense of approvedExpenses) {
        if (yPos > pageHeight - 40) {
          pdf.addPage();
          yPos = 30;
        }

        pdf.setFont('helvetica', 'bold');
        pdf.text(expense.description, margin, yPos);
        pdf.text(`${formatPrice(parseFloat(expense.amount), settings?.currency)}`, pageWidth - margin, yPos, { align: 'right' });
        
        yPos += 7;
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Référence: ${expense.reference}`, margin + 5, yPos);
        yPos += 5;
        pdf.text(`Catégorie: ${expense.category?.name || 'N/A'}`, margin + 5, yPos);
        yPos += 5;
        pdf.text(`Date: ${new Date(expense.expenseDate).toLocaleDateString('fr-FR')}`, margin + 5, yPos);
        yPos += 5;
        pdf.text(`Statut: ${expense.status === 'approved' ? 'Approuvée' : expense.status === 'pending' ? 'En attente' : 'Rejetée'}`, margin + 5, yPos);
        yPos += 5;
        pdf.text(`Mode: ${PAYMENT_METHODS.find(p => p.value === expense.paymentMethod)?.label || expense.paymentMethod}`, margin + 5, yPos);
        
        if (expense.notes) {
          yPos += 5;
          pdf.text(`Notes: ${expense.notes}`, margin + 5, yPos);
        }
        
        yPos += 10;
      }

      // Summary
      if (yPos > pageHeight - 60) {
        pdf.addPage();
        yPos = 30;
      }

      yPos += 10;
      pdf.setFont('helvetica', 'bold');
      pdf.text('Résumé', margin, yPos);
      yPos += 10;
      pdf.setFontSize(12);
      pdf.text(`Total général: ${formatPrice(totalAmount, settings?.currency)}`, margin, yPos);
      yPos += 8;
      pdf.setFontSize(10);
      pdf.text(`Dépenses approuvées: ${expenses.filter((e: any) => e.status === 'approved').length}`, margin, yPos);
      yPos += 6;
      pdf.text(`Dépenses en attente: ${expenses.filter((e: any) => e.status === 'pending').length}`, margin, yPos);
      yPos += 6;
      pdf.text(`Dépenses rejetées: ${expenses.filter((e: any) => e.status === 'rejected').length}`, margin, yPos);

      pdf.save(`rapport-depenses-audit-${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: "PDF téléchargé",
        description: "Le rapport de dépenses a été téléchargé avec succès"
      });
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la génération du PDF",
        variant: "destructive"
      });
    }
  };

  // Télécharger toutes les dépenses en CSV
  const handleDownloadCSV = () => {
    if (expenses.length === 0) {
      toast({
        title: "Aucune dépense",
        description: "Il n'y a aucune dépense à exporter.",
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
      'Statut',
      'Notes'
    ];

    // Convertir les données en CSV
    const csvData = expenses.map((expense: any) => {
      const paymentMethod = PAYMENT_METHODS.find(p => p.value === expense.paymentMethod);
      const status = EXPENSE_STATUS.find(s => s.value === expense.status);
      return [
        expense.reference || '',
        new Date(expense.expenseDate).toLocaleDateString('fr-FR'),
        expense.description || '',
        expense.category?.name || 'Sans catégorie',
        paymentMethod?.label || expense.paymentMethod,
        parseFloat(expense.amount).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ' '),
        status?.label || expense.status,
        expense.notes || ''
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
    link.setAttribute('download', `depenses_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export réussi",
      description: `${expenses.length} dépenses exportées en CSV.`
    });
  };

  if (expensesLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gestion des dépenses</h2>
          <p className="text-muted-foreground">
            Suivez et gérez toutes vos dépenses d'entreprise
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowDateFilter(!showDateFilter)}
            data-testid="button-toggle-date-filter"
          >
            <Filter className="mr-2 h-4 w-4" />
            Filtrer par période
          </Button>
          <Button 
            variant="outline" 
            onClick={handleDownloadCSV}
            disabled={expenses.length === 0}
            data-testid="button-download-expenses-csv"
          >
            <FileDown className="mr-2 h-4 w-4" />
            Télécharger CSV
          </Button>
          <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Catégorie
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nouvelle catégorie de dépense</DialogTitle>
                <DialogDescription>
                  Créez une nouvelle catégorie pour organiser vos dépenses
                </DialogDescription>
              </DialogHeader>
              <Form {...categoryForm}>
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    console.log("Form submitted");
                    const values = categoryForm.getValues();
                    console.log("Form values:", values);
                    if (values.name && values.name.trim()) {
                      handleCreateCategory(values);
                    } else {
                      toast({
                        title: "Erreur",
                        description: "Le nom de la catégorie est requis",
                        variant: "destructive"
                      });
                    }
                  }} 
                  className="space-y-4"
                >
                  <FormField
                    control={categoryForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom de la catégorie</FormLabel>
                        <FormControl>
                          <Input placeholder="Frais de déplacement" {...field} />
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
                          <Textarea placeholder="Description de la catégorie..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:space-x-2">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => {
                        setIsCategoryDialogOpen(false);
                        categoryForm.reset();
                      }}
                      disabled={createCategoryMutation.isPending}
                    >
                      Annuler
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createCategoryMutation.isPending}
                      onClick={() => console.log("Button clicked directly")}
                    >
                      {createCategoryMutation.isPending ? "Création..." : "Créer"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle dépense
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Nouvelle dépense</DialogTitle>
                <DialogDescription>
                  Enregistrez une nouvelle dépense d'entreprise
                </DialogDescription>
              </DialogHeader>
              <Form {...expenseForm}>
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    console.log("Expense form submitted");
                    const values = expenseForm.getValues();
                    console.log("Expense form values:", values);
                    console.log("Form errors:", expenseForm.formState.errors);
                    if (values.description && values.amount && values.categoryId) {
                      // Ajouter la référence automatiquement
                      const expenseData = {
                        ...values,
                        reference: `EXP-${Date.now()}`
                      };
                      console.log("Sending expense data:", expenseData);
                      handleCreateExpense(expenseData);
                    } else {
                      toast({
                        title: "Erreur",
                        description: "Description, montant et catégorie sont requis",
                        variant: "destructive"
                      });
                    }
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={expenseForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Input placeholder="Déjeuner d'affaires avec client" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={expenseForm.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Montant ({settings?.currency === 'GHS' ? 'GHS' : 'FCFA'})</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" step="0.01" placeholder="25000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={expenseForm.control}
                      name="expenseDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date de la dépense</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={expenseForm.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Catégorie</FormLabel>
                          <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value ? String(field.value) : ""}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionnez une catégorie" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((category: any) => (
                                <SelectItem key={category.id} value={category.id.toString()}>
                                  {category.name}
                                  {category.isMajor && <Badge variant="secondary" className="ml-2">Majeure</Badge>}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={expenseForm.control}
                      name="accountId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Compte Comptable</FormLabel>
                          <Select onValueChange={(value) => field.onChange(value === "none" ? undefined : parseInt(value))} value={field.value ? String(field.value) : "none"}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionnez un compte" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">Aucun compte</SelectItem>
                              {chartOfAccounts
                                .filter((account: any) => account.accountType === 'expense')
                                .map((account: any) => (
                                <SelectItem key={account.id} value={account.id.toString()}>
                                  {account.accountCode} - {account.accountName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={expenseForm.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Méthode de paiement</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionnez" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {PAYMENT_METHODS.map((method) => (
                                <SelectItem key={method.value} value={method.value}>
                                  {method.icon} {method.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={expenseForm.control}
                      name="imprestId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fonds d'avance (optionnel)</FormLabel>
                          <Select onValueChange={(value) => field.onChange(value === "none" ? undefined : parseInt(value))} value={field.value ? String(field.value) : "none"}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Aucun fonds" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">Aucun fonds</SelectItem>
                              {imprestFunds.map((fund: any) => (
                                <SelectItem key={fund.id} value={fund.id.toString()}>
                                  {fund.accountHolder} - {formatPrice(parseFloat(fund.currentBalance), settings?.currency)}
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
                    control={expenseForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes (optionnel)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Informations supplémentaires..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:space-x-2">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => {
                        setIsExpenseDialogOpen(false);
                        expenseForm.reset();
                      }}
                      disabled={createExpenseMutation.isPending}
                    >
                      Annuler
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createExpenseMutation.isPending}
                      onClick={() => console.log("Expense button clicked!")}
                    >
                      {createExpenseMutation.isPending ? "Création..." : "Créer la dépense"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filtre par période */}
      {showDateFilter && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <Label htmlFor="start-date">Du :</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-auto"
                  data-testid="input-start-date"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="end-date">Au :</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-auto"
                  data-testid="input-end-date"
                />
              </div>
              <Button 
                variant="outline" 
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                }}
                data-testid="button-clear-filter"
              >
                Effacer
              </Button>
            </div>
            {startDate && endDate && (
              <p className="text-sm text-muted-foreground mt-2">
                Affichage des dépenses du {new Date(startDate).toLocaleDateString('fr-FR')} au {new Date(endDate).toLocaleDateString('fr-FR')}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Expenses List */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Liste des dépenses</CardTitle>
              <CardDescription>
                Toutes vos dépenses d'entreprise
              </CardDescription>
            </div>
            {expenses && expenses.length > 0 && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleBulkPrint}>
                  <Printer className="mr-2 h-4 w-4" />
                  Imprimer tout
                </Button>
                <Button variant="outline" size="sm" onClick={handleBulkDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  PDF Audit
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {expenses?.length === 0 ? (
              <div className="text-center py-8">
                <DollarSign className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold">Aucune dépense</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Commencez par créer votre première dépense.
                </p>
              </div>
            ) : (
              (() => {
                const startIndex = (currentPage - 1) * itemsPerPage;
                const endIndex = startIndex + itemsPerPage;
                const paginatedExpenses = expenses?.slice(startIndex, endIndex) || [];
                const totalPages = Math.ceil((expenses?.length || 0) / itemsPerPage);

                return (
                  <>
                    <div className="space-y-4">
                      {paginatedExpenses.map((expense: any) => {
                const status = EXPENSE_STATUS.find(s => s.value === expense.status);
                const paymentMethod = PAYMENT_METHODS.find(p => p.value === expense.paymentMethod);
                
                return (
                  <div key={expense.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div>
                          <h4 className="font-medium">{expense.description}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{expense.category?.name}</span>
                            {expense.account && (
                              <>
                                <span>•</span>
                                <span className="text-blue-600">{expense.account.accountCode}</span>
                              </>
                            )}
                            <span>•</span>
                            <span>{paymentMethod?.icon} {paymentMethod?.label}</span>
                            <span>•</span>
                            <span>{new Date(expense.expenseDate).toLocaleDateString('fr-FR')}</span>
                            {expense.category?.isMajor && (
                              <>
                                <span>•</span>
                                <Badge variant="outline" className="text-xs">Majeure</Badge>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium">
                          {formatPrice(parseFloat(expense.amount), settings?.currency)}
                        </p>
                        <Badge variant="secondary" className={status?.color}>
                          {status?.icon} {status?.label}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        {expense.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => approveExpenseMutation.mutate(expense.id)}
                              disabled={approveExpenseMutation.isPending}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => rejectExpenseMutation.mutate(expense.id)}
                              disabled={rejectExpenseMutation.isPending}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Détails de la dépense</DialogTitle>
                              <DialogDescription>
                                Informations complètes sur cette dépense
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm font-medium text-muted-foreground">Référence</Label>
                                  <p className="text-sm">{expense.reference}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium text-muted-foreground">Montant</Label>
                                  <p className="text-sm font-semibold">{formatPrice(parseFloat(expense.amount), settings?.currency)}</p>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm font-medium text-muted-foreground">Catégorie</Label>
                                  <p className="text-sm">{expense.category?.name || 'Non définie'}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium text-muted-foreground">Date</Label>
                                  <p className="text-sm">{new Date(expense.expenseDate).toLocaleDateString('fr-FR')}</p>
                                </div>
                              </div>
                              {expense.account && (
                                <div>
                                  <Label className="text-sm font-medium text-muted-foreground">Compte Comptable</Label>
                                  <p className="text-sm">{expense.account.accountCode} - {expense.account.accountName}</p>
                                </div>
                              )}
                              <div>
                                <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                                <p className="text-sm">{expense.description}</p>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm font-medium text-muted-foreground">Méthode de paiement</Label>
                                  <p className="text-sm">
                                    {PAYMENT_METHODS.find(m => m.value === expense.paymentMethod)?.label || expense.paymentMethod}
                                  </p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium text-muted-foreground">Statut</Label>
                                  <Badge variant="secondary" className={EXPENSE_STATUS.find(s => s.value === expense.status)?.color}>
                                    {EXPENSE_STATUS.find(s => s.value === expense.status)?.icon} {EXPENSE_STATUS.find(s => s.value === expense.status)?.label}
                                  </Badge>
                                </div>
                              </div>
                              {expense.notes && (
                                <div>
                                  <Label className="text-sm font-medium text-muted-foreground">Notes</Label>
                                  <p className="text-sm">{expense.notes}</p>
                                </div>
                              )}
                              {expense.approvedBy && (
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Approuvé par</Label>
                                    <p className="text-sm">{expense.approvedBy}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Date d'approbation</Label>
                                    <p className="text-sm">{new Date(expense.approvedAt).toLocaleDateString('fr-FR')}</p>
                                  </div>
                                </div>
                              )}
                              <div>
                                <Label className="text-sm font-medium text-muted-foreground">Créé le</Label>
                                <p className="text-sm">{new Date(expense.createdAt).toLocaleDateString('fr-FR')} à {new Date(expense.createdAt).toLocaleTimeString('fr-FR')}</p>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <ExpensePDF expense={expense} user={user} />
                    </div>
                  </div>
                        );
                      })}
                    </div>
                    
                    {totalPages > 1 && (
                      <Pagination className="mt-6">
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious 
                              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                              className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            >
                              Précédent
                            </PaginationPrevious>
                          </PaginationItem>
                          
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <PaginationItem key={page}>
                              <PaginationLink
                                onClick={() => setCurrentPage(page)}
                                isActive={currentPage === page}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          ))}
                          
                          <PaginationItem>
                            <PaginationNext
                              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                              className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            >
                              Suivant
                            </PaginationNext>
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    )}
                  </>
                );
              })()
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}