import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./simpleAuth";
import { 
  insertClientSchema, 
  insertProductSchema, 
  insertCategorySchema, 
  insertInvoiceSchema,
  insertInvoiceItemSchema,
  insertLicenseSchema,
  insertExpenseCategorySchema,
  insertExpenseSchema,
  insertImprestFundSchema,
  insertImprestTransactionSchema,
  insertAccountingReportSchema,
  insertCashBookEntrySchema,
  insertPettyCashEntrySchema,
  insertTransactionJournalSchema,
  insertRevenueCategorySchema,
  insertRevenueSchema,
  insertBusinessAlertSchema,
  insertStockReplenishmentSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  setupAuth(app);

  // Complete user profile
  app.post('/api/auth/complete-profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const profileData = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        phone: req.body.phone,
        company: req.body.company,
        position: req.body.position,
        address: req.body.address,
        businessType: req.body.businessType,
      };

      // Mise à jour du profil utilisateur
      const updatedUser = await storage.updateUserProfile(userId, profileData);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update user profile" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Automatically generate overdue invoice alerts when loading dashboard
      // But only do it periodically to avoid constant regeneration
      const now = new Date();
      const lastCheck = (req.session as any)?.lastAlertCheck;
      
      // Only check alerts every 5 minutes to avoid constant regeneration
      if (!lastCheck || (now.getTime() - lastCheck) > 5 * 60 * 1000) {
        await storage.generateOverdueInvoiceAlerts(userId);
        (req.session as any).lastAlertCheck = now.getTime();
      }
      
      const stats = await storage.getDashboardStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Client routes
  app.get("/api/clients", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const query = req.query.search as string;
      
      if (query) {
        // Search clients by name, email, or company
        const clients = await storage.searchClients(userId, query);
        res.json(clients);
      } else {
        const clients = await storage.getClients(userId);
        res.json(clients);
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  app.get("/api/clients/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const id = parseInt(req.params.id);
      const client = await storage.getClient(id, userId);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      console.error("Error fetching client:", error);
      res.status(500).json({ message: "Failed to fetch client" });
    }
  });

  app.post("/api/clients", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const clientData = insertClientSchema.parse({ ...req.body, userId });
      const client = await storage.createClient(clientData);
      res.json(client);
    } catch (error) {
      console.error("Error creating client:", error);
      res.status(400).json({ message: "Failed to create client" });
    }
  });

  app.put("/api/clients/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const id = parseInt(req.params.id);
      const clientData = insertClientSchema.partial().parse(req.body);
      const client = await storage.updateClient(id, clientData, userId);
      res.json(client);
    } catch (error) {
      console.error("Error updating client:", error);
      res.status(400).json({ message: "Failed to update client" });
    }
  });

  app.delete("/api/clients/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const id = parseInt(req.params.id);
      await storage.deleteClient(id, userId);
      res.json({ message: "Client deleted successfully" });
    } catch (error) {
      console.error("Error deleting client:", error);
      res.status(500).json({ message: "Failed to delete client" });
    }
  });

  // Product routes
  app.get("/api/products", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const query = req.query.search as string;
      
      if (query) {
        // Search products by name or description
        const products = await storage.searchProducts(userId, query);
        res.json(products);
      } else {
        const products = await storage.getProducts(userId);
        res.json(products);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id, userId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post("/api/products", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const productData = insertProductSchema.parse({ ...req.body, userId });
      const product = await storage.createProduct(productData);
      res.json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(400).json({ message: "Failed to create product" });
    }
  });

  app.put("/api/products/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const id = parseInt(req.params.id);
      const productData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(id, productData, userId);
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(400).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const id = parseInt(req.params.id);
      await storage.deleteProduct(id, userId);
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Stock replenishment routes
  app.get("/api/stock-replenishments", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const replenishments = await storage.getStockReplenishments(userId);
      res.json(replenishments);
    } catch (error) {
      console.error("Error fetching stock replenishments:", error);
      res.status(500).json({ message: "Failed to fetch stock replenishments" });
    }
  });

  app.get("/api/products/:productId/replenishments", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const productId = parseInt(req.params.productId);
      const replenishments = await storage.getStockReplenishmentsByProduct(productId, userId);
      res.json(replenishments);
    } catch (error) {
      console.error("Error fetching product replenishments:", error);
      res.status(500).json({ message: "Failed to fetch product replenishments" });
    }
  });

  app.post("/api/stock-replenishments", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const replenishmentData = insertStockReplenishmentSchema.parse({ ...req.body, userId });
      const replenishment = await storage.createStockReplenishment(replenishmentData);
      res.json(replenishment);
    } catch (error) {
      console.error("Error creating stock replenishment:", error);
      res.status(400).json({ message: "Failed to create stock replenishment" });
    }
  });

  app.delete("/api/stock-replenishments/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteStockReplenishment(id);
      res.json({ message: "Stock replenishment deleted successfully" });
    } catch (error) {
      console.error("Error deleting stock replenishment:", error);
      res.status(500).json({ message: "Failed to delete stock replenishment" });
    }
  });

  // Category routes
  app.get("/api/categories", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const categories = await storage.getCategories(userId);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post("/api/categories", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const categoryData = insertCategorySchema.parse({ ...req.body, userId });
      const category = await storage.createCategory(categoryData);
      res.json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(400).json({ message: "Failed to create category" });
    }
  });

  app.put("/api/categories/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const id = parseInt(req.params.id);
      const categoryData = insertCategorySchema.partial().parse(req.body);
      const category = await storage.updateCategory(id, categoryData, userId);
      res.json(category);
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(400).json({ message: "Failed to update category" });
    }
  });

  app.delete("/api/categories/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const id = parseInt(req.params.id);
      await storage.deleteCategory(id, userId);
      res.json({ message: "Category deleted successfully" });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Invoice routes
  app.get("/api/invoices", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const invoices = await storage.getInvoices(userId);
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  app.get("/api/invoices/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const id = parseInt(req.params.id);
      const invoice = await storage.getInvoiceWithItems(id, userId);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      console.error("Error fetching invoice:", error);
      res.status(500).json({ message: "Failed to fetch invoice" });
    }
  });

  app.get("/api/invoices/:id/details", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const id = parseInt(req.params.id);
      const invoice = await storage.getInvoiceWithItems(id, userId);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      console.error("Error fetching invoice details:", error);
      res.status(500).json({ message: "Failed to fetch invoice details" });
    }
  });

  // Custom schema to properly handle dueDate nullability and validation
  const createInvoiceSchema = z.object({
    invoice: z.object({
      number: z.string(),
      clientId: z.number(),
      status: z.string(),
      totalHT: z.union([z.string(), z.number()]).transform(val => String(val)),
      tvaRate: z.union([z.string(), z.number()]).transform(val => String(val)),
      totalTVA: z.union([z.string(), z.number()]).transform(val => String(val)),
      totalTTC: z.union([z.string(), z.number()]).transform(val => String(val)),
      paymentMethod: z.string(),
      dueDate: z.union([z.string(), z.null(), z.undefined()]).optional().nullable().transform(val => {
        if (!val || val === null || val === undefined) return null;
        return new Date(val);
      }),
      notes: z.string().optional(),
    }),
    items: z.array(insertInvoiceItemSchema.omit({ invoiceId: true })),
  });

  app.post("/api/invoices", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      console.log("Request body:", JSON.stringify(req.body, null, 2));
      
      // Manual validation before Zod parsing
      const invoiceData = req.body.invoice;
      if ((invoiceData.status === "en_attente" || invoiceData.status === "partiellement_reglee") && 
          (!invoiceData.dueDate || invoiceData.dueDate === null || invoiceData.dueDate === "")) {
        return res.status(400).json({ 
          message: "La date d'échéance est obligatoire pour les factures en attente ou partiellement réglées" 
        });
      }
      
      const { invoice, items } = createInvoiceSchema.parse(req.body);
      const finalInvoiceData = { ...invoice, userId };
      const newInvoice = await storage.createInvoice(finalInvoiceData, items);
      res.json(newInvoice);
    } catch (error: any) {
      console.error("Error creating invoice:", error);
      if (error.issues && error.issues.length > 0) {
        const dueDateError = error.issues.find((issue: any) => issue.path.includes('dueDate'));
        if (dueDateError) {
          return res.status(400).json({ message: dueDateError.message });
        }
      }
      res.status(400).json({ message: "Failed to create invoice" });
    }
  });

  app.put("/api/invoices/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const id = parseInt(req.params.id);
      const invoiceData = insertInvoiceSchema.partial().parse(req.body);
      const invoice = await storage.updateInvoice(id, invoiceData, userId);
      res.json(invoice);
    } catch (error) {
      console.error("Error updating invoice:", error);
      res.status(400).json({ message: "Failed to update invoice" });
    }
  });

  app.delete("/api/invoices/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const id = parseInt(req.params.id);
      await storage.deleteInvoice(id, userId);
      res.json({ message: "Invoice deleted successfully" });
    } catch (error) {
      console.error("Error deleting invoice:", error);
      res.status(500).json({ message: "Failed to delete invoice" });
    }
  });

  // Sales routes
  app.get("/api/sales", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const sales = await storage.getSales(userId);
      res.json(sales);
    } catch (error) {
      console.error("Error fetching sales:", error);
      res.status(500).json({ message: "Failed to fetch sales" });
    }
  });

  // Data export routes
  app.get("/api/export/clients", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const clients = await storage.getClients(userId);
      
      const csv = [
        "ID,Nom,Email,Téléphone,Entreprise,Adresse,Date de création",
        ...clients.map(client => 
          `${client.id},"${client.name}","${client.email || ''}","${client.phone || ''}","${client.company || ''}","${client.address || ''}","${client.createdAt?.toISOString() || ''}"`
        )
      ].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="clients.csv"');
      res.send(csv);
    } catch (error) {
      console.error("Error exporting clients:", error);
      res.status(500).json({ message: "Failed to export clients" });
    }
  });

  app.get("/api/export/products", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const products = await storage.getProducts(userId);
      
      const csv = [
        "ID,Nom,Description,Prix HT,Stock,Date de création",
        ...products.map(product => 
          `${product.id},"${product.name}","${product.description || ''}","${product.priceHT}","${product.stock}","${product.createdAt?.toISOString() || ''}"`
        )
      ].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="products.csv"');
      res.send(csv);
    } catch (error) {
      console.error("Error exporting products:", error);
      res.status(500).json({ message: "Failed to export products" });
    }
  });

  app.get("/api/export/invoices", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const invoices = await storage.getInvoices(userId);
      
      const csv = [
        "ID,Numéro,Client ID,Statut,Total HT,Taux TVA,Total TVA,Total TTC,Échéance,Date de création",
        ...invoices.map(invoice => 
          `${invoice.id},"${invoice.number}","${invoice.clientId}","${invoice.status}","${invoice.totalHT}","${invoice.tvaRate}","${invoice.totalTVA}","${invoice.totalTTC}","${invoice.dueDate?.toISOString() || ''}","${invoice.createdAt?.toISOString() || ''}"`
        )
      ].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="invoices.csv"');
      res.send(csv);
    } catch (error) {
      console.error("Error exporting invoices:", error);
      res.status(500).json({ message: "Failed to export invoices" });
    }
  });

  // User settings routes
  app.get("/api/user/settings", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      res.json({
        currency: user?.currency || "XOF",
        language: user?.language || "fr",
      });
    } catch (error) {
      console.error("Error fetching user settings:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des paramètres" });
    }
  });

  app.patch("/api/user/settings", isAuthenticated, async (req: any, res) => {
    try {
      const { currency, language } = req.body;
      const updatedUser = await storage.updateUserSettings(req.user.id, { currency, language });
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user settings:", error);
      res.status(500).json({ message: "Erreur lors de la mise à jour des paramètres" });
    }
  });

  // License activation route (public but session-aware)
  app.post("/api/activate", async (req: any, res) => {
    try {
      const { key, clientName, deviceId } = req.body;

      if (!key) {
        return res.status(400).json({ message: "Clé d'activation requise" });
      }

      // Check if license exists
      const license = await storage.getLicenseByKey(key);
      if (!license) {
        return res.status(404).json({ message: "Clé d'activation invalide" });
      }

      // Check if already activated
      if (license.activated) {
        return res.status(409).json({ message: "Cette clé a déjà été activée" });
      }

      // Check if revoked
      if (license.revokedAt) {
        return res.status(403).json({ message: "Cette clé a été révoquée" });
      }

      // Activate the license
      const activatedLicense = await storage.activateLicense(key, clientName, deviceId);
      
      // If user is authenticated, mark their account as license activated immediately
      if (req.user && req.user.id) {
        await storage.setUserLicenseActivated(req.user.id, true);
      } else {
        // Store license activation in session for later association
        if (req.session) {
          req.session.activatedLicenseKey = key;
        }
      }
      
      res.json({
        message: "Licence activée avec succès",
        license: {
          key: activatedLicense.key,
          clientName: activatedLicense.clientName,
          activatedAt: activatedLicense.activatedAt,
        },
      });
    } catch (error) {
      console.error("Error activating license:", error);
      res.status(500).json({ message: "Erreur lors de l'activation de la licence" });
    }
  });

  // Admin middleware to check for ADMIN_TOKEN
  const isAdmin = (req: any, res: any, next: any) => {
    const adminToken = req.headers["x-admin-token"];
    const expectedToken = process.env.ADMIN_TOKEN;

    if (!expectedToken) {
      console.error("ADMIN_TOKEN environment variable is not set");
      return res.status(500).json({ message: "Configuration serveur manquante" });
    }

    if (!adminToken || adminToken !== expectedToken) {
      return res.status(403).json({ message: "Accès admin refusé" });
    }

    next();
  };

  // Admin routes for Fatimata
  app.get("/api/admin/licenses", isAdmin, async (req, res) => {
    try {
      const licenses = await storage.getAllLicenses();
      res.json(licenses);
    } catch (error) {
      console.error("Error fetching licenses:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des licences" });
    }
  });

  app.post("/api/admin/licenses", isAdmin, async (req, res) => {
    try {
      const licenseData = insertLicenseSchema.parse(req.body);
      
      // Check if key already exists
      const existingLicense = await storage.getLicenseByKey(licenseData.key);
      if (existingLicense) {
        return res.status(409).json({ message: "Cette clé existe déjà" });
      }

      const newLicense = await storage.createLicense(licenseData);
      res.status(201).json(newLicense);
    } catch (error) {
      console.error("Error creating license:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Données invalides", errors: error.errors });
      } else {
        res.status(500).json({ message: "Erreur lors de la création de la licence" });
      }
    }
  });

  app.patch("/api/admin/licenses/:key/revoke", isAdmin, async (req, res) => {
    try {
      const { key } = req.params;
      
      const license = await storage.getLicenseByKey(key);
      if (!license) {
        return res.status(404).json({ message: "Licence introuvable" });
      }

      const revokedLicense = await storage.revokeLicense(key);
      res.json(revokedLicense);
    } catch (error) {
      console.error("Error revoking license:", error);
      res.status(500).json({ message: "Erreur lors de la révocation de la licence" });
    }
  });

  // ==========================================
  // ACCOUNTING MODULE ROUTES
  // ==========================================

  // Expense Categories routes
  app.get("/api/accounting/expense-categories", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const categories = await storage.getExpenseCategories(userId);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching expense categories:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des catégories de dépenses" });
    }
  });

  app.post("/api/accounting/expense-categories", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const categoryData = insertExpenseCategorySchema.parse({ ...req.body, userId });
      const category = await storage.createExpenseCategory(categoryData);
      res.json(category);
    } catch (error) {
      console.error("Error creating expense category:", error);
      res.status(400).json({ message: "Erreur lors de la création de la catégorie de dépense" });
    }
  });

  app.put("/api/accounting/expense-categories/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const id = parseInt(req.params.id);
      const categoryData = insertExpenseCategorySchema.partial().parse(req.body);
      const category = await storage.updateExpenseCategory(id, categoryData, userId);
      res.json(category);
    } catch (error) {
      console.error("Error updating expense category:", error);
      res.status(400).json({ message: "Erreur lors de la mise à jour de la catégorie de dépense" });
    }
  });

  app.delete("/api/accounting/expense-categories/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const id = parseInt(req.params.id);
      await storage.deleteExpenseCategory(id, userId);
      res.json({ message: "Catégorie de dépense supprimée avec succès" });
    } catch (error) {
      console.error("Error deleting expense category:", error);
      res.status(500).json({ message: "Erreur lors de la suppression de la catégorie de dépense" });
    }
  });

  // Expenses routes
  app.get("/api/accounting/expenses", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { startDate, endDate } = req.query;
      
      let expenses;
      if (startDate && endDate) {
        expenses = await storage.getExpensesByPeriod(userId, new Date(startDate as string), new Date(endDate as string));
      } else {
        expenses = await storage.getExpenses(userId);
      }
      
      res.json(expenses);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des dépenses" });
    }
  });

  app.get("/api/accounting/expenses/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const id = parseInt(req.params.id);
      const expense = await storage.getExpense(id, userId);
      if (!expense) {
        return res.status(404).json({ message: "Dépense introuvable" });
      }
      res.json(expense);
    } catch (error) {
      console.error("Error fetching expense:", error);
      res.status(500).json({ message: "Erreur lors de la récupération de la dépense" });
    }
  });

  app.post("/api/accounting/expenses", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Générer une référence unique
      const reference = `EXP-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
      
      // Convertir la date string en objet Date
      const expenseData = insertExpenseSchema.parse({ 
        ...req.body, 
        userId,
        reference,
        expenseDate: req.body.expenseDate ? new Date(req.body.expenseDate) : new Date()
      });
      
      const expense = await storage.createExpense(expenseData);
      res.json(expense);
    } catch (error) {
      console.error("Error creating expense:", error);
      res.status(400).json({ message: "Erreur lors de la création de la dépense" });
    }
  });

  app.put("/api/accounting/expenses/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const id = parseInt(req.params.id);
      const expenseData = insertExpenseSchema.partial().parse(req.body);
      const expense = await storage.updateExpense(id, expenseData, userId);
      res.json(expense);
    } catch (error) {
      console.error("Error updating expense:", error);
      res.status(400).json({ message: "Erreur lors de la mise à jour de la dépense" });
    }
  });

  app.patch("/api/accounting/expenses/:id/approve", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const approvedBy = req.user.id;
      const id = parseInt(req.params.id);
      const expense = await storage.approveExpense(id, approvedBy, userId);
      res.json(expense);
    } catch (error) {
      console.error("Error approving expense:", error);
      res.status(400).json({ message: "Erreur lors de l'approbation de la dépense" });
    }
  });

  app.patch("/api/accounting/expenses/:id/reject", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const id = parseInt(req.params.id);
      const expense = await storage.rejectExpense(id, userId);
      res.json(expense);
    } catch (error) {
      console.error("Error rejecting expense:", error);
      res.status(400).json({ message: "Erreur lors du rejet de la dépense" });
    }
  });

  app.delete("/api/accounting/expenses/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const id = parseInt(req.params.id);
      await storage.deleteExpense(id, userId);
      res.json({ message: "Dépense supprimée avec succès" });
    } catch (error) {
      console.error("Error deleting expense:", error);
      res.status(500).json({ message: "Erreur lors de la suppression de la dépense" });
    }
  });

  // Imprest Funds routes
  app.get("/api/accounting/imprest-funds", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const funds = await storage.getImprestFunds(userId);
      res.json(funds);
    } catch (error) {
      console.error("Error fetching imprest funds:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des fonds d'avance" });
    }
  });

  app.get("/api/accounting/imprest-funds/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const id = parseInt(req.params.id);
      const fund = await storage.getImprestFund(id, userId);
      if (!fund) {
        return res.status(404).json({ message: "Fonds d'avance introuvable" });
      }
      res.json(fund);
    } catch (error) {
      console.error("Error fetching imprest fund:", error);
      res.status(500).json({ message: "Erreur lors de la récupération du fonds d'avance" });
    }
  });

  app.post("/api/accounting/imprest-funds", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Générer une référence unique
      const reference = `FA-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
      
      // Préparer les données avec les champs requis
      const fundData = insertImprestFundSchema.parse({ 
        ...req.body, 
        userId,
        reference,
        currentBalance: req.body.initialAmount || '0' // currentBalance = initialAmount au début
      });
      
      const fund = await storage.createImprestFund(fundData);
      res.json(fund);
    } catch (error) {
      console.error("Error creating imprest fund:", error);
      res.status(400).json({ message: "Erreur lors de la création du fonds d'avance" });
    }
  });

  app.put("/api/accounting/imprest-funds/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const id = parseInt(req.params.id);
      const fundData = insertImprestFundSchema.partial().parse(req.body);
      const fund = await storage.updateImprestFund(id, fundData, userId);
      res.json(fund);
    } catch (error) {
      console.error("Error updating imprest fund:", error);
      res.status(400).json({ message: "Erreur lors de la mise à jour du fonds d'avance" });
    }
  });

  app.delete("/api/accounting/imprest-funds/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const id = parseInt(req.params.id);
      await storage.deleteImprestFund(id, userId);
      res.json({ message: "Fonds d'avance supprimé avec succès" });
    } catch (error) {
      console.error("Error deleting imprest fund:", error);
      res.status(500).json({ message: "Erreur lors de la suppression du fonds d'avance" });
    }
  });

  // Imprest Transactions routes
  app.get("/api/accounting/imprest-funds/:imprestId/transactions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const imprestId = parseInt(req.params.imprestId);
      const transactions = await storage.getImprestTransactions(imprestId, userId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching imprest transactions:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des transactions d'avance" });
    }
  });

  app.post("/api/accounting/imprest-transactions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const transactionData = insertImprestTransactionSchema.parse({ ...req.body, userId });
      const transaction = await storage.createImprestTransaction(transactionData);
      res.json(transaction);
    } catch (error) {
      console.error("Error creating imprest transaction:", error);
      res.status(400).json({ message: (error as Error).message || "Erreur lors de la création de la transaction d'avance" });
    }
  });

  // Accounting Reports routes
  app.get("/api/accounting/reports", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const reports = await storage.getAccountingReports(userId);
      res.json(reports);
    } catch (error) {
      console.error("Error fetching accounting reports:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des rapports comptables" });
    }
  });

  app.post("/api/accounting/reports", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Convertir les dates string en objets Date
      const reportData = insertAccountingReportSchema.parse({ 
        ...req.body, 
        userId,
        generatedBy: userId,
        periodStart: req.body.periodStart ? new Date(req.body.periodStart) : new Date(),
        periodEnd: req.body.periodEnd ? new Date(req.body.periodEnd) : new Date()
      });
      
      const report = await storage.createAccountingReport(reportData);
      res.json(report);
    } catch (error) {
      console.error("Error creating accounting report:", error);
      res.status(400).json({ message: "Erreur lors de la création du rapport comptable" });
    }
  });

  app.delete("/api/accounting/reports/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const id = parseInt(req.params.id);
      await storage.deleteAccountingReport(id, userId);
      res.json({ message: "Rapport comptable supprimé avec succès" });
    } catch (error) {
      console.error("Error deleting accounting report:", error);
      res.status(500).json({ message: "Erreur lors de la suppression du rapport comptable" });
    }
  });

  // Accounting Statistics route
  app.get("/api/accounting/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { startDate, endDate } = req.query;
      
      let stats;
      if (startDate && endDate) {
        stats = await storage.getAccountingStatsByPeriod(userId, new Date(startDate as string), new Date(endDate as string));
      } else {
        stats = await storage.getAccountingStats(userId);
      }
      
      res.json(stats);
    } catch (error) {
      console.error("Error fetching accounting stats:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des statistiques comptables" });
    }
  });

  // ==========================================
  // CASH BOOK ROUTES
  // ==========================================
  
  app.get("/api/accounting/cash-book", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const entries = await storage.getCashBookEntries(userId);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching cash book entries:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des entrées du livre de caisse" });
    }
  });

  app.get("/api/accounting/cash-book/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const id = parseInt(req.params.id);
      const entry = await storage.getCashBookEntry(id, userId);
      if (!entry) {
        return res.status(404).json({ message: "Entrée de caisse introuvable" });
      }
      res.json(entry);
    } catch (error) {
      console.error("Error fetching cash book entry:", error);
      res.status(500).json({ message: "Erreur lors de la récupération de l'entrée de caisse" });
    }
  });

  app.post("/api/accounting/cash-book", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const entryData = insertCashBookEntrySchema.parse({ ...req.body, userId });
      const entry = await storage.createCashBookEntry(entryData);
      res.json(entry);
    } catch (error) {
      console.error("Error creating cash book entry:", error);
      res.status(400).json({ message: "Erreur lors de la création de l'entrée de caisse" });
    }
  });

  app.put("/api/accounting/cash-book/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const id = parseInt(req.params.id);
      const entryData = insertCashBookEntrySchema.partial().parse(req.body);
      const entry = await storage.updateCashBookEntry(id, entryData, userId);
      res.json(entry);
    } catch (error) {
      console.error("Error updating cash book entry:", error);
      res.status(400).json({ message: "Erreur lors de la mise à jour de l'entrée de caisse" });
    }
  });

  app.patch("/api/accounting/cash-book/:id/reconcile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const id = parseInt(req.params.id);
      const entry = await storage.reconcileCashBookEntry(id, userId);
      res.json(entry);
    } catch (error) {
      console.error("Error reconciling cash book entry:", error);
      res.status(400).json({ message: "Erreur lors de la réconciliation de l'entrée de caisse" });
    }
  });

  app.delete("/api/accounting/cash-book/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const id = parseInt(req.params.id);
      await storage.deleteCashBookEntry(id, userId);
      res.json({ message: "Entrée de caisse supprimée avec succès" });
    } catch (error) {
      console.error("Error deleting cash book entry:", error);
      res.status(500).json({ message: "Erreur lors de la suppression de l'entrée de caisse" });
    }
  });

  // ==========================================
  // PETTY CASH ROUTES
  // ==========================================
  
  app.get("/api/accounting/petty-cash", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const entries = await storage.getPettyCashEntries(userId);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching petty cash entries:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des entrées de petite caisse" });
    }
  });

  app.get("/api/accounting/petty-cash/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const id = parseInt(req.params.id);
      const entry = await storage.getPettyCashEntry(id, userId);
      if (!entry) {
        return res.status(404).json({ message: "Entrée de petite caisse introuvable" });
      }
      res.json(entry);
    } catch (error) {
      console.error("Error fetching petty cash entry:", error);
      res.status(500).json({ message: "Erreur lors de la récupération de l'entrée de petite caisse" });
    }
  });

  app.post("/api/accounting/petty-cash", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const entryData = insertPettyCashEntrySchema.parse({ ...req.body, userId });
      const entry = await storage.createPettyCashEntry(entryData);
      res.json(entry);
    } catch (error) {
      console.error("Error creating petty cash entry:", error);
      res.status(400).json({ message: "Erreur lors de la création de l'entrée de petite caisse" });
    }
  });

  app.put("/api/accounting/petty-cash/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const id = parseInt(req.params.id);
      const entryData = insertPettyCashEntrySchema.partial().parse(req.body);
      const entry = await storage.updatePettyCashEntry(id, entryData, userId);
      res.json(entry);
    } catch (error) {
      console.error("Error updating petty cash entry:", error);
      res.status(400).json({ message: "Erreur lors de la mise à jour de l'entrée de petite caisse" });
    }
  });

  app.patch("/api/accounting/petty-cash/:id/approve", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const approvedBy = req.user.id;
      const id = parseInt(req.params.id);
      const entry = await storage.approvePettyCashEntry(id, approvedBy, userId);
      res.json(entry);
    } catch (error) {
      console.error("Error approving petty cash entry:", error);
      res.status(400).json({ message: "Erreur lors de l'approbation de l'entrée de petite caisse" });
    }
  });

  app.patch("/api/accounting/petty-cash/:id/reject", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const id = parseInt(req.params.id);
      const entry = await storage.rejectPettyCashEntry(id, userId);
      res.json(entry);
    } catch (error) {
      console.error("Error rejecting petty cash entry:", error);
      res.status(400).json({ message: "Erreur lors du rejet de l'entrée de petite caisse" });
    }
  });

  app.delete("/api/accounting/petty-cash/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const id = parseInt(req.params.id);
      await storage.deletePettyCashEntry(id, userId);
      res.json({ message: "Entrée de petite caisse supprimée avec succès" });
    } catch (error) {
      console.error("Error deleting petty cash entry:", error);
      res.status(500).json({ message: "Erreur lors de la suppression de l'entrée de petite caisse" });
    }
  });

  // ==========================================
  // TRANSACTION JOURNAL ROUTES
  // ==========================================
  
  app.get("/api/accounting/transaction-journal", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const filters = {
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        sourceModule: req.query.sourceModule as string,
      };
      const entries = await storage.getTransactionJournal(userId, filters);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching transaction journal:", error);
      res.status(500).json({ message: "Erreur lors de la récupération du journal des transactions" });
    }
  });

  app.get("/api/accounting/transaction-journal/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const id = parseInt(req.params.id);
      const entry = await storage.getTransactionJournalEntry(id, userId);
      if (!entry) {
        return res.status(404).json({ message: "Entrée de journal introuvable" });
      }
      res.json(entry);
    } catch (error) {
      console.error("Error fetching transaction journal entry:", error);
      res.status(500).json({ message: "Erreur lors de la récupération de l'entrée de journal" });
    }
  });

  app.post("/api/accounting/transaction-journal", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const entryData = insertTransactionJournalSchema.parse({ 
        ...req.body, 
        userId,
        createdBy: userId 
      });
      const entry = await storage.addToTransactionJournal(entryData);
      res.json(entry);
    } catch (error) {
      console.error("Error creating transaction journal entry:", error);
      res.status(400).json({ message: "Erreur lors de la création de l'entrée de journal" });
    }
  });

  // ==========================================
  // FINANCIAL DASHBOARD ROUTES
  // ==========================================
  
  app.get("/api/accounting/financial-dashboard", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const data = await storage.getFinancialDashboardData(userId);
      res.json(data);
    } catch (error) {
      console.error("Error fetching financial dashboard data:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des données du tableau de bord financier" });
    }
  });

  // ==========================================
  // REVENUE ROUTES
  // ==========================================
  
  // Revenue Categories routes
  app.get("/api/accounting/revenue-categories", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const categories = await storage.getRevenueCategories(userId);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching revenue categories:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des catégories de revenus" });
    }
  });

  app.post("/api/accounting/revenue-categories", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const categoryData = insertRevenueCategorySchema.parse({ ...req.body, userId });
      const category = await storage.createRevenueCategory(categoryData);
      res.json(category);
    } catch (error) {
      console.error("Error creating revenue category:", error);
      res.status(400).json({ message: "Erreur lors de la création de la catégorie de revenus" });
    }
  });

  app.put("/api/accounting/revenue-categories/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const id = parseInt(req.params.id);
      const categoryData = insertRevenueCategorySchema.partial().parse(req.body);
      const category = await storage.updateRevenueCategory(id, categoryData, userId);
      res.json(category);
    } catch (error) {
      console.error("Error updating revenue category:", error);
      res.status(400).json({ message: "Erreur lors de la mise à jour de la catégorie de revenus" });
    }
  });

  app.delete("/api/accounting/revenue-categories/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const id = parseInt(req.params.id);
      await storage.deleteRevenueCategory(id, userId);
      res.json({ message: "Catégorie de revenus supprimée avec succès" });
    } catch (error) {
      console.error("Error deleting revenue category:", error);
      res.status(500).json({ message: "Erreur lors de la suppression de la catégorie de revenus" });
    }
  });

  // Revenues routes
  app.get("/api/accounting/revenues", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { startDate, endDate } = req.query;
      
      let revenues;
      if (startDate && endDate) {
        revenues = await storage.getRevenuesByPeriod(userId, new Date(startDate as string), new Date(endDate as string));
      } else {
        revenues = await storage.getRevenues(userId);
      }
      
      res.json(revenues);
    } catch (error) {
      console.error("Error fetching revenues:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des revenus" });
    }
  });

  app.post("/api/accounting/revenues", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Générer une référence unique
      const reference = `REV-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
      
      // Convertir la date string en objet Date
      const revenueData = insertRevenueSchema.parse({ 
        ...req.body, 
        userId,
        reference,
        revenueDate: req.body.revenueDate ? new Date(req.body.revenueDate) : new Date()
      });
      
      const revenue = await storage.createRevenue(revenueData);
      res.json(revenue);
    } catch (error) {
      console.error("Error creating revenue:", error);
      res.status(400).json({ message: "Erreur lors de la création du revenu" });
    }
  });

  app.put("/api/accounting/revenues/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const id = parseInt(req.params.id);
      const revenueData = insertRevenueSchema.partial().parse(req.body);
      const revenue = await storage.updateRevenue(id, revenueData, userId);
      res.json(revenue);
    } catch (error) {
      console.error("Error updating revenue:", error);
      res.status(400).json({ message: "Erreur lors de la mise à jour du revenu" });
    }
  });

  app.delete("/api/accounting/revenues/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const id = parseInt(req.params.id);
      await storage.deleteRevenue(id, userId);
      res.json({ message: "Revenu supprimé avec succès" });
    } catch (error) {
      console.error("Error deleting revenue:", error);
      res.status(500).json({ message: "Erreur lors de la suppression du revenu" });
    }
  });

  // ==========================================
  // BUSINESS ALERTS ROUTES
  // ==========================================
  
  app.get("/api/alerts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const unreadOnly = req.query.unreadOnly === 'true';
      
      const alerts = await storage.getBusinessAlerts(userId, unreadOnly);
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des alertes" });
    }
  });

  app.post("/api/alerts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const alertData = insertBusinessAlertSchema.parse({ ...req.body, userId });
      const alert = await storage.createBusinessAlert(alertData);
      res.json(alert);
    } catch (error) {
      console.error("Error creating alert:", error);
      res.status(400).json({ message: "Erreur lors de la création de l'alerte" });
    }
  });

  app.patch("/api/alerts/:id/read", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const id = parseInt(req.params.id);
      await storage.markAlertAsRead(id, userId);
      res.json({ message: "Alerte marquée comme lue" });
    } catch (error) {
      console.error("Error marking alert as read:", error);
      res.status(400).json({ message: "Erreur lors de la modification de l'alerte" });
    }
  });

  app.patch("/api/alerts/mark-all-read", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const count = await storage.markAllAlertsAsRead(userId);
      res.json({ 
        message: `${count} alerte(s) marquée(s) comme lues`,
        count 
      });
    } catch (error) {
      console.error("Error marking all alerts as read:", error);
      res.status(500).json({ message: "Erreur lors de la modification des alertes" });
    }
  });

  app.patch("/api/alerts/:id/resolve", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const id = parseInt(req.params.id);
      await storage.markAlertAsResolved(id, userId);
      res.json({ message: "Alerte résolue" });
    } catch (error) {
      console.error("Error resolving alert:", error);
      res.status(400).json({ message: "Erreur lors de la résolution de l'alerte" });
    }
  });

  app.delete("/api/alerts/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const id = parseInt(req.params.id);
      await storage.deleteBusinessAlert(id, userId);
      res.json({ message: "Alerte supprimée" });
    } catch (error) {
      console.error("Error deleting alert:", error);
      res.status(500).json({ message: "Erreur lors de la suppression de l'alerte" });
    }
  });

  app.post("/api/alerts/generate/stock", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const alerts = await storage.generateStockAlerts(userId);
      res.json({ 
        message: `${alerts.length} alerte(s) de stock générée(s)`,
        alerts 
      });
    } catch (error) {
      console.error("Error generating stock alerts:", error);
      res.status(500).json({ message: "Erreur lors de la génération des alertes de stock" });
    }
  });

  app.post("/api/alerts/generate/overdue", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const alerts = await storage.generateOverdueInvoiceAlerts(userId);
      res.json({ 
        message: `${alerts.length} alerte(s) de factures échues générée(s)`,
        alerts 
      });
    } catch (error) {
      console.error("Error generating overdue alerts:", error);
      res.status(500).json({ message: "Erreur lors de la génération des alertes de factures échues" });
    }
  });

  app.delete("/api/alerts/cleanup", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const olderThanDays = parseInt(req.query.days as string) || 30;
      await storage.cleanupResolvedAlerts(userId, olderThanDays);
      res.json({ message: "Alertes nettoyées avec succès" });
    } catch (error) {
      console.error("Error cleaning up alerts:", error);
      res.status(500).json({ message: "Erreur lors du nettoyage des alertes" });
    }
  });





  const httpServer = createServer(app);
  return httpServer;
}
