import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import Header from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  FileText, 
  Edit, 
  Trash2, 
  Plus,
  Search,
  Eye,
  Download,
  Minus,
  Printer
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
import { insertInvoiceSchema, insertInvoiceItemSchema, insertClientSchema, TAX_RATES, INVOICE_STATUS, type Invoice, type InsertInvoice, type Client, type Product, type User } from "@shared/schema";
import { SimpleProductSelect } from "@/components/simple-product-select";
import { ClientSearch } from "@/components/client-search";
import { SimpleProductSelectV2 } from "@/components/simple-product-select-v2";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { useTranslation } from "@/lib/i18n";
import InvoicePDF from "@/components/invoice-pdf";
import { InvoiceListSkeleton, InvoiceFormSkeleton } from "@/components/loading-skeletons";

// Payment method options
const PAYMENT_METHODS = [
  { value: "cash", label: "💰 Espèces", icon: "💰" },
  { value: "bank_transfer", label: "🏦 Virement bancaire", icon: "🏦" },
  { value: "check", label: "💳 Chèque", icon: "💳" },
  { value: "card", label: "💳 Carte bancaire", icon: "💳" },
  { value: "mobile_money", label: "📱 Mobile Money", icon: "📱" },
];

const createInvoiceFormSchema = z.object({
  clientId: z.number().min(1, "Veuillez sélectionner un client"),
  status: z.string().min(1, "Veuillez sélectionner un statut"),
  tvaRate: z.string().min(1, "Veuillez sélectionner un taux de TVA"),
  paymentMethod: z.string().min(1, "Veuillez sélectionner un moyen de paiement"),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(z.object({
    productId: z.number().optional(),
    productName: z.string().min(1, "Nom du produit requis"),
    quantity: z.number().min(1, "Quantité doit être supérieure à 0"),
    priceHT: z.string().min(1, "Prix HT requis"),
  })).min(1, "Au moins un article est requis"),
});

type CreateInvoiceForm = z.infer<typeof createInvoiceFormSchema>;

export default function Invoices() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState<any>(null);
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

  const { data: invoices = [], isLoading: invoicesLoading } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices"],
    retry: false,
    refetchInterval: 45000, // Rafraîchit toutes les 45 secondes
    refetchIntervalInBackground: true,
    staleTime: 0,
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
    retry: false,
    refetchInterval: 60000, // Rafraîchit toutes les 60 secondes
    staleTime: 30000,
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    retry: false,
    refetchInterval: 60000, // Rafraîchit toutes les 60 secondes
    staleTime: 30000,
  });

  // Get user data for invoice header
  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
    retry: false,
    refetchInterval: 120000, // Rafraîchit toutes les 2 minutes
    staleTime: 60000,
  });

  const form = useForm<CreateInvoiceForm>({
    resolver: zodResolver(createInvoiceFormSchema),
    defaultValues: {
      clientId: undefined as any,
      status: "en_attente",
      tvaRate: "18.00",
      paymentMethod: "cash",
      dueDate: "",
      notes: "",
      items: [{ productId: undefined, productName: "", quantity: 1, priceHT: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const generateInvoiceNumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const invoiceCount = invoices.length + 1;
    return `FAC-${year}-${invoiceCount.toString().padStart(3, '0')}`;
  };

  const createMutation = useMutation({
    mutationFn: async (data: CreateInvoiceForm) => {
      // Calculate totals with new tax logic
      const totalHT = data.items.reduce((sum, item) => 
        sum + (item.quantity * parseFloat(item.priceHT)), 0
      );
      const tvaRateNum = parseFloat(data.tvaRate);
      const totalTVA = totalHT * (tvaRateNum / 100);
      const totalTTC = totalHT + totalTVA;

      const invoiceData: InsertInvoice = {
        number: generateInvoiceNumber(),
        clientId: data.clientId,
        status: data.status,
        totalHT: totalHT.toFixed(2),
        tvaRate: data.tvaRate,
        totalTVA: totalTVA.toFixed(2),
        totalTTC: totalTTC.toFixed(2),
        paymentMethod: data.paymentMethod,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        notes: data.notes,
        userId: "", // Will be set by backend
      };

      const items = data.items.map(item => ({
        productId: item.productId || null,
        productName: item.productName,
        quantity: item.quantity,
        priceHT: item.priceHT,
        totalHT: (item.quantity * parseFloat(item.priceHT)).toFixed(2),
      }));

      await apiRequest("POST", "/api/invoices", { invoice: invoiceData, items });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      toast({
        title: "Facture créée",
        description: "La facture a été créée avec succès.",
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
      console.error("Invoice creation error:", error);
      toast({
        title: "Erreur",
        description: (error as any)?.message || "Impossible de créer la facture.",
        variant: "destructive",
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await apiRequest("PUT", `/api/invoices/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Statut mis à jour",
        description: "Le statut de la facture a été mis à jour.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/invoices/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      toast({
        title: "Facture supprimée",
        description: "La facture a été supprimée avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la facture.",
        variant: "destructive",
      });
    },
  });

  // Client creation mutation
  const createClientMutation = useMutation({
    mutationFn: async (name: string) => {
      const clientData = { name: name.trim() };
      const response = await apiRequest("POST", "/api/clients", clientData);
      return await response.json();
    },
    onSuccess: (newClient: Client) => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      form.setValue("clientId", newClient.id);
      toast({
        title: "Client créé",
        description: `Le client "${newClient.name}" a été créé avec succès.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Impossible de créer le client: ${error.message || error}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateInvoiceForm) => {
    createMutation.mutate(data);
  };

  const getStatusBadge = (status: string) => {
    const statusInfo = INVOICE_STATUS.find(s => s.value === status);
    if (statusInfo) {
      return (
        <Badge className={statusInfo.color}>
          {statusInfo.icon} {statusInfo.label}
        </Badge>
      );
    }
    // Fallback for old statuses
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">✅ Payée</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">⏳ En attente</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800">⚠️ En retard</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('fr-FR', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numAmount) + ' F CFA';
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const getClientName = (clientId: number) => {
    const client = clients.find((c: Client) => c.id === clientId);
    return client?.name || 'Client inconnu';
  };

  const getPaymentMethodLabel = (paymentMethod: string) => {
    const method = PAYMENT_METHODS.find(m => m.value === paymentMethod);
    return method ? method.label : paymentMethod || '-';
  };

  const getProductPrice = (productId: number) => {
    const product = products.find((p: Product) => p.id === productId);
    return product?.priceHT || "0";
  };

  const getProductName = (productId: number) => {
    const product = products.find((p: Product) => p.id === productId);
    return product?.name || "";
  };

  const filteredInvoices = invoices.filter((invoice: Invoice) => {
    const matchesSearch = invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getClientName(invoice.clientId).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination calculations
  const totalItems = filteredInvoices.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedInvoices = filteredInvoices.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const watchedItems = form.watch("items");
  const watchedStatus = form.watch("status");
  
  // Tax rates for the selector (use the one from shared schema)
  // TAX_RATES is already imported from shared/schema.ts
  const watchedTvaRate = form.watch("tvaRate");
  const subtotal = watchedItems.reduce((sum, item) => 
    sum + (item.quantity * parseFloat(item.priceHT || "0")), 0
  );
  const tvaRateNum = parseFloat(watchedTvaRate || "18.00");
  const tax = subtotal * (tvaRateNum / 100);
  const total = subtotal + tax;

  if (isLoading || invoicesLoading) {
    return <InvoiceListSkeleton />;
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header 
        title={t('invoices')} 
        subtitle={t('manageInvoices')}
        action={{
          label: t('newInvoice'),
          onClick: () => setIsDialogOpen(true)
        }}
      />

      <main className="flex-1 overflow-y-auto p-6">
        {/* Filters */}
        <div className="mb-6 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder={t('searchInvoice')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allStatuses')}</SelectItem>
              {INVOICE_STATUS.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.icon} {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Invoices Table */}
        <Card>
          <CardHeader>
            <CardTitle>{t('invoices')}</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredInvoices.length === 0 ? (
              <div className="py-12 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || statusFilter !== "all" ? t('noInvoiceFound') : t('noInvoice')}
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || statusFilter !== "all"
                    ? t('tryModifyFilters')
                    : t('createFirstInvoice')
                  }
                </p>
                {!searchTerm && statusFilter === "all" && (
                  <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    {t('newInvoice')}
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
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
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('dueDate')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('paymentMethod')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedInvoices.map((invoice: Invoice) => (
                      <tr key={invoice.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {invoice.number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {getClientName(invoice.clientId)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(invoice.totalTTC)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Select
                            value={invoice.status}
                            onValueChange={(status) => updateStatusMutation.mutate({ id: invoice.id, status })}
                          >
                            <SelectTrigger className="w-44">
                              {getStatusBadge(invoice.status)}
                            </SelectTrigger>
                            <SelectContent>
                              {INVOICE_STATUS.map((status) => (
                                <SelectItem key={status.value} value={status.value}>
                                  {status.icon} {status.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {invoice.createdAt && formatDate(invoice.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {invoice.dueDate ? formatDate(invoice.dueDate) : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {getPaymentMethodLabel(invoice.paymentMethod)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // Fetch full invoice with items
                              fetch(`/api/invoices/${invoice.id}`, {
                                credentials: 'include'
                              })
                              .then(res => res.json())
                              .then(data => setViewingInvoice(data))
                              .catch(() => toast({
                                title: "Erreur",
                                description: "Impossible de charger la facture.",
                                variant: "destructive",
                              }));
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={async () => {
                              try {
                                // Fetch full invoice with items for PDF generation
                                const response = await fetch(`/api/invoices/${invoice.id}`, {
                                  credentials: 'include'
                                });
                                const fullInvoice = await response.json();
                                
                                // Generate PDF using the same logic as invoice-detail page
                                const { default: jsPDF } = await import('jspdf');
                                const { default: html2canvas } = await import('html2canvas');
                                
                                // Create a temporary hidden div with the invoice content
                                const tempDiv = document.createElement('div');
                                tempDiv.style.position = 'absolute';
                                tempDiv.style.left = '-9999px';
                                tempDiv.style.top = '0';
                                tempDiv.style.width = '210mm';
                                tempDiv.style.background = 'white';
                                tempDiv.style.padding = '20px';
                                
                                // Add invoice HTML content to temp div
                                tempDiv.innerHTML = `
                                  <div style="font-family: Arial, sans-serif; color: black; line-height: 1.6;">
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 40px;">
                                      <div style="display: flex; align-items: flex-start; gap: 16px;">

                                        <div>
                                          <h1 style="font-size: 36px; font-weight: bold; margin: 0;">FACTURE</h1>
                                          <p style="font-size: 18px; color: #666; margin: 8px 0;">${fullInvoice.number}</p>
                                        </div>
                                      </div>
                                      <div style="text-align: right;">
                                        <div style="font-size: 24px; font-weight: bold; color: #3b82f6; margin-bottom: 8px;">
                                          ${user?.company || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Mon Entreprise'}
                                        </div>
                                        <div style="font-size: 14px; color: #666;">
                                          ${user?.address ? `<p>${user.address}</p>` : ''}
                                          ${user?.email ? `<p>Email: ${user.email}</p>` : ''}
                                          ${user?.phone ? `<p>Tél: ${user.phone}</p>` : ''}
                                          ${user?.businessType ? `<p>Activité: ${user.businessType}</p>` : ''}
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px;">
                                      <div>
                                        <h3 style="font-weight: bold; margin-bottom: 12px;">Facturé à :</h3>
                                        <div style="color: #333;">
                                          <p style="font-weight: 500; margin: 4px 0;">${fullInvoice.client?.name || 'Client inconnu'}</p>
                                          ${fullInvoice.client?.company ? `<p style="margin: 4px 0;">${fullInvoice.client.company}</p>` : ''}
                                          ${fullInvoice.client?.email ? `<p style="margin: 4px 0;">${fullInvoice.client.email}</p>` : ''}
                                          ${fullInvoice.client?.phone ? `<p style="margin: 4px 0;">${fullInvoice.client.phone}</p>` : ''}
                                          ${fullInvoice.client?.address ? `<p style="margin: 4px 0; white-space: pre-line;">${fullInvoice.client.address}</p>` : ''}
                                        </div>
                                      </div>
                                      
                                      <div>
                                        <h3 style="font-weight: bold; margin-bottom: 12px;">Détails de la facture :</h3>
                                        <div style="color: #333;">
                                          <div style="display: flex; justify-content: space-between; margin: 8px 0;">
                                            <span>Date d'émission :</span>
                                            <span>${new Date(fullInvoice.issueDate).toLocaleDateString('fr-FR')}</span>
                                          </div>
                                          <div style="display: flex; justify-content: space-between; margin: 8px 0;">
                                            <span>Date d'échéance :</span>
                                            <span>${fullInvoice.dueDate ? new Date(fullInvoice.dueDate).toLocaleDateString('fr-FR') : 'Non définie'}</span>
                                          </div>
                                          <div style="display: flex; justify-content: space-between; margin: 8px 0;">
                                            <span>Statut :</span>
                                            <span style="color: #f59e0b; font-weight: 500;">En attente</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <h3 style="font-weight: bold; margin-bottom: 16px;">Articles</h3>
                                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 32px;">
                                      <thead>
                                        <tr style="background-color: #f9fafb;">
                                          <th style="padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb;">Description</th>
                                          <th style="padding: 12px; text-align: right; border-bottom: 1px solid #e5e7eb;">Qté</th>
                                          <th style="padding: 12px; text-align: right; border-bottom: 1px solid #e5e7eb;">Prix HT</th>
                                          <th style="padding: 12px; text-align: right; border-bottom: 1px solid #e5e7eb;">Total HT</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        ${fullInvoice.items?.map((item: any) => `
                                          <tr>
                                            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.productName}</td>
                                            <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e5e7eb;">${item.quantity}</td>
                                            <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e5e7eb;">${formatCurrency(item.priceHT)}</td>
                                            <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e5e7eb;">${formatCurrency(item.quantity * parseFloat(item.priceHT))}</td>
                                          </tr>
                                        `).join('') || ''}
                                      </tbody>
                                    </table>
                                    
                                    <div style="display: flex; justify-content: flex-end;">
                                      <div style="width: 300px;">
                                        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                                          <span>Total HT:</span>
                                          <span style="font-weight: 500;">${formatCurrency(fullInvoice.totalHT)}</span>
                                        </div>
                                        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                                          <span>TVA (${fullInvoice.tvaRate}%):</span>
                                          <span style="font-weight: 500;">${formatCurrency(fullInvoice.totalTTC - fullInvoice.totalHT)}</span>
                                        </div>
                                        <div style="display: flex; justify-content: space-between; padding: 12px 0; border-top: 2px solid #374151; font-weight: bold; font-size: 18px;">
                                          <span>Total TTC:</span>
                                          <span>${formatCurrency(fullInvoice.totalTTC)}</span>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    ${fullInvoice.notes ? `
                                      <div style="margin-top: 32px;">
                                        <h3 style="font-weight: bold; margin-bottom: 8px;">Notes</h3>
                                        <p style="color: #666; white-space: pre-line;">${fullInvoice.notes}</p>
                                      </div>
                                    ` : ''}
                                    
                                    <!-- Footer -->
                                    <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center; color: #666; font-size: 14px;">
                                      <p style="margin-bottom: 8px;">Merci pour votre confiance !</p>
                                      ${(user?.email || user?.phone) ? `
                                        <p style="margin: 0;">
                                          Pour toute question concernant cette facture, contactez-nous :
                                          ${user?.email ? `<br>Email : ${user.email}` : ''}
                                          ${user?.phone ? `<br>Téléphone : ${user.phone}` : ''}
                                        </p>
                                      ` : ''}
                                    </div>
                                  </div>
                                `;
                                
                                document.body.appendChild(tempDiv);
                                
                                // Generate canvas from the temp div
                                const canvas = await html2canvas(tempDiv, {
                                  scale: 1.5,
                                  useCORS: true,
                                  allowTaint: true,
                                  backgroundColor: '#ffffff',
                                  logging: false,
                                  width: tempDiv.scrollWidth,
                                  height: tempDiv.scrollHeight
                                });
                                
                                // Remove temp div
                                document.body.removeChild(tempDiv);
                                
                                // Create and save PDF
                                const pdf = new jsPDF({
                                  orientation: 'portrait',
                                  unit: 'mm',
                                  format: 'a4',
                                });
                                
                                const pageWidth = pdf.internal.pageSize.getWidth();
                                const pageHeight = pdf.internal.pageSize.getHeight();
                                const margin = 10;
                                const contentWidth = pageWidth - (2 * margin);
                                
                                const imgWidth = contentWidth;
                                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                                
                                const imgData = canvas.toDataURL('image/png', 0.95);
                                pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);
                                
                                const now = new Date();
                                const dateStr = now.toLocaleDateString('fr-FR').replace(/\//g, '-');
                                const timeStr = now.toLocaleTimeString('fr-FR').replace(/:/g, '-');
                                const filename = `Facture_${fullInvoice.number}_${dateStr}_${timeStr}.pdf`;
                                
                                pdf.save(filename);
                                
                                toast({
                                  title: "PDF téléchargé",
                                  description: `Facture ${fullInvoice.number} téléchargée avec succès`,
                                });
                                
                              } catch (error) {
                                console.error('Erreur lors de la génération du PDF:', error);
                                toast({
                                  title: "Erreur",
                                  description: "Impossible de générer le PDF",
                                  variant: "destructive",
                                });
                              }
                            }}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // Navigate to invoice detail page and trigger print
                              setLocation(`/invoices/${invoice.id}?print=true`);
                            }}
                          >
                            <Printer className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteMutation.mutate(invoice.id)}
                            disabled={deleteMutation.isPending}
                            className={deleteMutation.isPending ? "opacity-50" : ""}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
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
                  Affichage de {startIndex + 1} à {Math.min(endIndex, totalItems)} sur {totalItems} factures
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

        {/* Create Invoice Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('newInvoice')}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="clientId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('client')} *</FormLabel>
                        <FormControl>
                          <ClientSearch
                            value={field.value}
                            onChange={field.onChange}
                            placeholder={t('searchOrCreateClient')}
                            onCreateNew={(name) => createClientMutation.mutate(name)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('status')} *</FormLabel>
                        <Select 
                          onValueChange={field.onChange}
                          value={field.value || "en_attente"}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('selectStatus')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {INVOICE_STATUS.map((status) => (
                              <SelectItem key={status.value} value={status.value}>
                                {status.icon} {status.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tvaRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('taxRate')} *</FormLabel>
                        <Select 
                          onValueChange={field.onChange}
                          value={field.value || "18.00"}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('selectTaxRate')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {TAX_RATES.map((rate) => (
                              <SelectItem key={rate.value} value={rate.value}>
                                {rate.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('paymentMethod')} *</FormLabel>
                        <Select 
                          onValueChange={field.onChange}
                          value={field.value || "cash"}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('selectPaymentMethod')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PAYMENT_METHODS.map((method) => (
                              <SelectItem key={method.value} value={method.value}>
                                {method.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Afficher le champ de date d'échéance pour "en attente" et "partiellement réglée" */}
                  {(watchedStatus === "en_attente" || watchedStatus === "partiellement_reglee") && (
                    <FormField
                      control={form.control}
                      name="dueDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('dueDate')}</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                {/* Items */}
                <div>
                  <FormLabel className="text-base font-medium">{t('products')} *</FormLabel>
                  <div className="border border-gray-200 rounded-lg mt-2">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">{t('product')}</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">{t('quantity')}</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">{t('priceHT')}</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">{t('total')}</th>
                            <th className="px-4 py-2"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {fields.map((field, index) => (
                            <tr key={field.id}>
                              <td className="px-4 py-2">
                                <div className="space-y-2">
                                  <SimpleProductSelectV2
                                    value={form.watch(`items.${index}.productId`)}
                                    onChange={(productId) => {
                                      form.setValue(`items.${index}.productId`, productId);
                                    }}
                                    onProductSelect={(product) => {
                                      form.setValue(`items.${index}.productName`, product.name);
                                      form.setValue(`items.${index}.priceHT`, product.priceHT);
                                      form.trigger([`items.${index}.productName`, `items.${index}.priceHT`]);
                                    }}
                                    placeholder={t('searchProduct')}
                                  />
                                  <FormField
                                    control={form.control}
                                    name={`items.${index}.productName`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormControl>
                                          <Input placeholder={t('productServiceName')} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>
                              </td>
                              <td className="px-4 py-2">
                                <FormField
                                  control={form.control}
                                  name={`items.${index}.quantity`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Input 
                                          type="number" 
                                          min="1"
                                          {...field}
                                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </td>
                              <td className="px-4 py-2">
                                <FormField
                                  control={form.control}
                                  name={`items.${index}.priceHT`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Input 
                                          type="number" 
                                          step="0.01"
                                          min="0"
                                          placeholder="0.00"
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </td>
                              <td className="px-4 py-2 text-gray-900">
                                {formatCurrency(
                                  watchedItems[index]?.quantity * parseFloat(watchedItems[index]?.priceHT || "0") || 0
                                )}
                              </td>
                              <td className="px-4 py-2">
                                {fields.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => remove(index)}
                                  >
                                    <Minus className="w-4 h-4" />
                                  </Button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="p-4 border-t">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => append({ productId: undefined, productName: "", quantity: 1, priceHT: "" })}
                      >
                        <Plus className="mr-1 w-4 h-4" />
                        {t('addLine')}
                      </Button>
                    </div>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('notes')}</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder={t('additionalNotes')}
                          rows={3}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Totals */}
                <div className="grid grid-cols-2 gap-6">
                  <div></div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">{t('totalHT')}:</span>
                      <span className="text-sm font-medium">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">{t('tva')} ({tvaRateNum}%):</span>
                      <span className="text-sm font-medium">{formatCurrency(tax)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-base font-semibold">{t('totalTTC')}:</span>
                      <span className="text-base font-semibold">{formatCurrency(total)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    {t('cancel')}
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        <span>{t('creating')}...</span>
                      </div>
                    ) : (
                      t('createInvoice')
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* View Invoice Dialog */}
        {viewingInvoice && (
          <Dialog open={!!viewingInvoice} onOpenChange={() => setViewingInvoice(null)}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto print:max-w-none print:max-h-none print:overflow-visible">
              <DialogHeader className="print:hidden">
                <DialogTitle>Facture {viewingInvoice.number}</DialogTitle>
              </DialogHeader>
              <InvoicePDF invoice={viewingInvoice} user={user} />
            </DialogContent>
          </Dialog>
        )}
      </main>
    </div>
  );
}
