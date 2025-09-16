import {
  users,
  clients,
  products,
  categories,
  invoices,
  invoiceItems,
  sales,
  stockReplenishments,
  licenses,
  expenseCategories,
  expenses,
  imprestFunds,
  imprestTransactions,
  accountingReports,
  cashBookEntries,
  pettyCashEntries,
  transactionJournal,
  revenueCategories,
  revenues,

  type User,
  type NewUser,
  type Client,
  type Product,
  type Category,
  type Invoice,
  type InvoiceItem,
  type Sale,
  type StockReplenishment,
  type License,
  type ExpenseCategory,
  type Expense,
  type ImprestFund,
  type ImprestTransaction,
  type AccountingReport,
  type CashBookEntry,
  type PettyCashEntry,
  type TransactionJournal,
  type RevenueCategory,
  type Revenue,

  type NewClient,
  type NewProduct,
  type NewCategory,
  type NewInvoice,
  type NewInvoiceItem,
  type NewSale,
  type NewStockReplenishment,
  type NewLicense,
  type NewExpenseCategory,
  type NewExpense,
  type NewImprestFund,
  type NewImprestTransaction,
  type NewAccountingReport,
  type NewCashBookEntry,
  type NewPettyCashEntry,
  type NewTransactionJournal,
  type NewRevenueCategory,
  type NewRevenue,

  chartOfAccounts,
  businessAlerts,
  type ChartOfAccount,
  type NewBusinessAlert,
  type BusinessAlert,

} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sum, count, sql, like, or, gte, lte, isNotNull, ne } from "drizzle-orm";
import { randomBytes, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createLocalUser(user: NewUser): Promise<User>;
  upsertUser(user: NewUser): Promise<User>;
  updateUserProfile(id: string, profileData: Partial<User>): Promise<User>;
  updateUserSettings(id: string, settings: { currency?: string; language?: string }): Promise<User>;
  setUserLicenseActivated(id: string, activated: boolean): Promise<User>;
  
  // Méthodes pour la gestion des tentatives de connexion et verrouillage
  incrementLoginAttempts(email: string): Promise<void>;
  resetLoginAttempts(email: string): Promise<void>;
  lockAccount(email: string, lockDuration: number): Promise<void>;
  isAccountLocked(email: string): Promise<boolean>;
  checkUserForLogin(email: string): Promise<{ user: User | undefined; isLocked: boolean }>;

  
  // Client operations
  getClients(userId: string): Promise<Client[]>;
  getClient(id: number, userId: string): Promise<Client | undefined>;
  createClient(client: NewClient): Promise<Client>;
  updateClient(id: number, client: Partial<NewClient>, userId: string): Promise<Client>;
  deleteClient(id: number, userId: string): Promise<void>;
  searchClients(userId: string, query: string): Promise<Client[]>;
  
  // Product operations
  getProducts(userId: string): Promise<Product[]>;
  getProduct(id: number, userId: string): Promise<Product | undefined>;
  createProduct(product: NewProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<NewProduct>, userId: string): Promise<Product>;
  deleteProduct(id: number, userId: string): Promise<void>;
  searchProducts(userId: string, query: string): Promise<Product[]>;
  
  // Stock replenishment operations
  getStockReplenishments(userId: string): Promise<StockReplenishment[]>;
  getStockReplenishmentsByProduct(productId: number, userId: string): Promise<StockReplenishment[]>;
  createStockReplenishment(replenishment: NewStockReplenishment): Promise<StockReplenishment>;
  deleteStockReplenishment(id: number): Promise<void>;
  
  // Category operations
  getCategories(userId: string): Promise<Category[]>;
  getCategory(id: number, userId: string): Promise<Category | undefined>;
  createCategory(category: NewCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<NewCategory>, userId: string): Promise<Category>;
  deleteCategory(id: number, userId: string): Promise<void>;
  
  // Invoice operations
  getInvoices(userId: string): Promise<Invoice[]>;
  getInvoice(id: number, userId: string): Promise<Invoice | undefined>;
  getInvoiceWithItems(id: number, userId: string): Promise<(Invoice & { items: InvoiceItem[]; client: Client }) | undefined>;
  createInvoice(invoice: NewInvoice, items: Omit<NewInvoiceItem, 'invoiceId'>[]): Promise<Invoice>;
  updateInvoice(id: number, invoice: Partial<NewInvoice>, userId: string): Promise<Invoice>;
  deleteInvoice(id: number, userId: string): Promise<void>;
  
  // Sales operations
  getSales(userId: string): Promise<Sale[]>;
  createSale(sale: NewSale): Promise<Sale>;
  
  // Dashboard statistics
  getDashboardStats(userId: string): Promise<{
    revenue: number;
    invoiceCount: number;
    clientCount: number;
    productCount: number;
    recentInvoices: (Invoice & { client: Client })[];
    topProducts: (Product & { salesCount: number })[];
    lowStockProducts: Product[];
  }>;

  // License operations
  getLicenseByKey(key: string): Promise<License | undefined>;
  getAllLicenses(): Promise<License[]>;
  createLicense(license: NewLicense): Promise<License>;
  activateLicense(key: string, clientName?: string, deviceId?: string): Promise<License>;
  revokeLicense(key: string): Promise<License>;

  // Accounting operations
  
  // Expense Categories
  getExpenseCategories(userId: string): Promise<ExpenseCategory[]>;
  getExpenseCategory(id: number, userId: string): Promise<ExpenseCategory | undefined>;
  createExpenseCategory(category: NewExpenseCategory): Promise<ExpenseCategory>;
  updateExpenseCategory(id: number, category: Partial<NewExpenseCategory>, userId: string): Promise<ExpenseCategory>;
  deleteExpenseCategory(id: number, userId: string): Promise<void>;

  // Expenses
  getExpenses(userId: string): Promise<(Expense & { category: ExpenseCategory })[]>;
  getExpensesByPeriod(userId: string, startDate: Date, endDate: Date): Promise<(Expense & { category: ExpenseCategory })[]>;
  getExpense(id: number, userId: string): Promise<(Expense & { category: ExpenseCategory }) | undefined>;
  createExpense(expense: NewExpense): Promise<Expense>;
  updateExpense(id: number, expense: Partial<NewExpense>, userId: string): Promise<Expense>;
  deleteExpense(id: number, userId: string): Promise<void>;
  approveExpense(id: number, approvedBy: string, userId: string): Promise<Expense>;
  rejectExpense(id: number, userId: string): Promise<Expense>;

  // Imprest Funds
  getImprestFunds(userId: string): Promise<ImprestFund[]>;
  getImprestFund(id: number, userId: string): Promise<ImprestFund | undefined>;
  createImprestFund(fund: NewImprestFund): Promise<ImprestFund>;
  updateImprestFund(id: number, fund: Partial<NewImprestFund>, userId: string): Promise<ImprestFund>;
  deleteImprestFund(id: number, userId: string): Promise<void>;

  // Imprest Transactions
  getImprestTransactions(imprestId: number, userId: string): Promise<ImprestTransaction[]>;
  createImprestTransaction(transaction: NewImprestTransaction): Promise<ImprestTransaction>;
  
  // Accounting Reports
  getAccountingReports(userId: string): Promise<AccountingReport[]>;
  createAccountingReport(report: NewAccountingReport): Promise<AccountingReport>;
  deleteAccountingReport(id: number, userId: string): Promise<void>;

  // Accounting Statistics
  getAccountingStats(userId: string): Promise<{
    totalExpenses: number;
    pendingExpenses: number;
    approvedExpenses: number;
    totalImprestFunds: number;
    activeImprestFunds: number;
    totalRevenues: number;
    monthlyRevenues: number;
    recentRevenues: number;
    netResult: number;
    monthlyExpensesByCategory: { category: string; amount: number; allocatedAmount: number }[];
    recentExpenses: (Expense & { category: ExpenseCategory })[];
  }>;
  getAccountingStatsByPeriod(userId: string, startDate: Date, endDate: Date): Promise<{
    totalExpenses: number;
    pendingExpenses: number;
    approvedExpenses: number;
    totalImprestFunds: number;
    activeImprestFunds: number;
    totalRevenues: number;
    monthlyRevenues: number;
    recentRevenues: number;
    netResult: number;
    monthlyExpensesByCategory: { category: string; amount: number; allocatedAmount: number }[];
    recentExpenses: (Expense & { category: ExpenseCategory })[];
  }>;

  // Cash Book operations
  getCashBookEntries(userId: string): Promise<CashBookEntry[]>;
  getCashBookEntry(id: number, userId: string): Promise<CashBookEntry | undefined>;
  createCashBookEntry(data: NewCashBookEntry): Promise<CashBookEntry>;
  updateCashBookEntry(id: number, data: Partial<NewCashBookEntry>, userId: string): Promise<CashBookEntry>;
  deleteCashBookEntry(id: number, userId: string): Promise<void>;
  reconcileCashBookEntry(id: number, userId: string): Promise<CashBookEntry>;

  // Petty Cash operations
  getPettyCashEntries(userId: string): Promise<PettyCashEntry[]>;
  getPettyCashEntry(id: number, userId: string): Promise<PettyCashEntry | undefined>;
  createPettyCashEntry(data: NewPettyCashEntry): Promise<PettyCashEntry>;
  updatePettyCashEntry(id: number, data: Partial<NewPettyCashEntry>, userId: string): Promise<PettyCashEntry>;
  approvePettyCashEntry(id: number, approvedBy: string, userId: string): Promise<PettyCashEntry>;
  rejectPettyCashEntry(id: number, userId: string): Promise<PettyCashEntry>;
  deletePettyCashEntry(id: number, userId: string): Promise<void>;

  // Transaction Journal operations
  getTransactionJournal(userId: string, filters?: any): Promise<TransactionJournal[]>;
  addToTransactionJournal(data: NewTransactionJournal): Promise<TransactionJournal>;
  getTransactionJournalEntry(id: number, userId: string): Promise<TransactionJournal | undefined>;

  // Financial Dashboard
  getFinancialDashboardData(userId: string): Promise<any>;

  // Revenue operations
  getRevenueCategories(userId: string): Promise<RevenueCategory[]>;
  getRevenueCategory(id: number, userId: string): Promise<RevenueCategory | undefined>;
  createRevenueCategory(category: NewRevenueCategory): Promise<RevenueCategory>;
  updateRevenueCategory(id: number, category: Partial<NewRevenueCategory>, userId: string): Promise<RevenueCategory>;
  deleteRevenueCategory(id: number, userId: string): Promise<void>;

  getRevenues(userId: string): Promise<(Revenue & { category: RevenueCategory })[]>;
  getRevenuesByPeriod(userId: string, startDate: Date, endDate: Date): Promise<(Revenue & { category: RevenueCategory })[]>;
  getRevenue(id: number, userId: string): Promise<Revenue | undefined>;
  createRevenue(revenue: NewRevenue): Promise<Revenue>;
  updateRevenue(id: number, revenue: Partial<NewRevenue>, userId: string): Promise<Revenue>;
  deleteRevenue(id: number, userId: string): Promise<void>;

  // Business Alerts operations
  getBusinessAlerts(userId: string, unreadOnly?: boolean): Promise<BusinessAlert[]>;
  createBusinessAlert(alert: NewBusinessAlert): Promise<BusinessAlert>;
  markAlertAsRead(id: number, userId: string): Promise<void>;
  markAlertAsResolved(id: number, userId: string): Promise<void>;
  deleteBusinessAlert(id: number, userId: string): Promise<void>;
  generateStockAlerts(userId: string): Promise<BusinessAlert[]>;
  generateOverdueInvoiceAlerts(userId: string): Promise<BusinessAlert[]>;
  cleanupResolvedAlerts(userId: string, olderThanDays?: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: NewUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createLocalUser(userData: NewUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async updateUserProfile(id: string, profileData: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...profileData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserSettings(id: string, settings: { currency?: string; language?: string }): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...settings, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async setUserLicenseActivated(id: string, activated: boolean): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ licenseActivated: activated, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Méthodes pour la gestion des tentatives de connexion et verrouillage
  async incrementLoginAttempts(email: string): Promise<void> {
    // Approche simplifiée : incrémenter seulement si l'utilisateur existe
    // Pour éviter l'énumération, la logique d'authentification traitera tous les cas de la même manière
    await db
      .update(users)
      .set({ 
        loginAttempts: sql`${users.loginAttempts} + 1`,
        updatedAt: new Date() 
      })
      .where(eq(users.email, email));
  }

  async resetLoginAttempts(email: string): Promise<void> {
    await db
      .update(users)
      .set({ 
        loginAttempts: 0,
        lockUntil: null,
        updatedAt: new Date() 
      })
      .where(eq(users.email, email));
  }

  async lockAccount(email: string, lockDurationMinutes: number): Promise<void> {
    const lockUntil = new Date();
    lockUntil.setMinutes(lockUntil.getMinutes() + lockDurationMinutes);
    
    await db
      .update(users)
      .set({ 
        lockUntil: lockUntil,
        updatedAt: new Date() 
      })
      .where(eq(users.email, email));
  }

  async isAccountLocked(email: string): Promise<boolean> {
    const user = await this.getUserByEmail(email);
    if (!user || !user.lockUntil) return false;
    
    const now = new Date();
    const lockUntil = new Date(user.lockUntil);
    
    if (now < lockUntil) {
      return true;
    } else {
      // Déverrouiller automatiquement si la période de verrouillage est expirée
      await this.resetLoginAttempts(email);
      return false;
    }
  }

  async checkUserForLogin(email: string): Promise<{ user: User | undefined; isLocked: boolean }> {
    const user = await this.getUserByEmail(email);
    let isLocked = false;
    
    if (user && user.lockUntil) {
      const now = new Date();
      const lockUntil = new Date(user.lockUntil);
      
      if (now < lockUntil) {
        isLocked = true;
      } else {
        // Déverrouiller automatiquement si la période de verrouillage est expirée
        await this.resetLoginAttempts(email);
      }
    }
    
    return { user, isLocked };
  }




  // Client operations
  async getClients(userId: string): Promise<Client[]> {
    return db.select().from(clients).where(eq(clients.userId, userId)).orderBy(desc(clients.createdAt));
  }

  async getClient(id: number, userId: string): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(and(eq(clients.id, id), eq(clients.userId, userId)));
    return client;
  }

  async createClient(client: NewClient): Promise<Client> {
    const [newClient] = await db.insert(clients).values(client).returning();
    return newClient;
  }

  async updateClient(id: number, client: Partial<NewClient>, userId: string): Promise<Client> {
    const [updatedClient] = await db
      .update(clients)
      .set(client)
      .where(and(eq(clients.id, id), eq(clients.userId, userId)))
      .returning();
    return updatedClient;
  }

  async deleteClient(id: number, userId: string): Promise<void> {
    await db.delete(clients).where(and(eq(clients.id, id), eq(clients.userId, userId)));
  }

  async searchClients(userId: string, query: string): Promise<Client[]> {
    const searchTerm = `%${query.toLowerCase()}%`;
    return db.select().from(clients)
      .where(and(
        eq(clients.userId, userId),
        or(
          like(sql`LOWER(${clients.name})`, searchTerm),
          like(sql`LOWER(${clients.email})`, searchTerm),
          like(sql`LOWER(${clients.company})`, searchTerm)
        )
      ))
      .orderBy(desc(clients.createdAt))
      .limit(10);
  }

  // Product operations
  async getProducts(userId: string): Promise<Product[]> {
    return db.select().from(products).where(eq(products.userId, userId)).orderBy(desc(products.createdAt));
  }

  async getProduct(id: number, userId: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(and(eq(products.id, id), eq(products.userId, userId)));
    return product;
  }

  async createProduct(product: NewProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    
    // Automatically generate stock alerts after creating a product
    await this.generateStockAlerts(product.userId);
    
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<NewProduct>, userId: string): Promise<Product> {
    const [updatedProduct] = await db
      .update(products)
      .set(product)
      .where(and(eq(products.id, id), eq(products.userId, userId)))
      .returning();
    
    // Automatically generate stock alerts after updating a product
    await this.generateStockAlerts(userId);
    
    return updatedProduct;
  }

  async deleteProduct(id: number, userId: string): Promise<void> {
    await db.delete(products).where(and(eq(products.id, id), eq(products.userId, userId)));
  }

  async searchProducts(userId: string, query: string): Promise<Product[]> {
    const searchTerm = `%${query.toLowerCase()}%`;
    return db.select().from(products)
      .where(and(
        eq(products.userId, userId),
        or(
          like(sql`LOWER(${products.name})`, searchTerm),
          like(sql`LOWER(${products.description})`, searchTerm)
        )
      ))
      .orderBy(desc(products.createdAt))
      .limit(10);
  }

  // Stock replenishment operations
  async getStockReplenishments(userId: string): Promise<StockReplenishment[]> {
    const replenishments = await db
      .select({
        id: stockReplenishments.id,
        productId: stockReplenishments.productId,
        quantity: stockReplenishments.quantity,
        costPerUnit: stockReplenishments.costPerUnit,
        totalCost: stockReplenishments.totalCost,
        supplier: stockReplenishments.supplier,
        reference: stockReplenishments.reference,
        notes: stockReplenishments.notes,
        userId: stockReplenishments.userId,
        createdAt: stockReplenishments.createdAt,
        productName: products.name,
      })
      .from(stockReplenishments)
      .leftJoin(products, eq(stockReplenishments.productId, products.id))
      .where(eq(stockReplenishments.userId, userId))
      .orderBy(desc(stockReplenishments.createdAt));
    
    return replenishments as any;
  }

  async getStockReplenishmentsByProduct(productId: number, userId: string): Promise<StockReplenishment[]> {
    return db.select().from(stockReplenishments)
      .where(and(eq(stockReplenishments.productId, productId), eq(stockReplenishments.userId, userId)))
      .orderBy(desc(stockReplenishments.createdAt));
  }

  async createStockReplenishment(replenishment: NewStockReplenishment): Promise<StockReplenishment> {
    const [newReplenishment] = await db.insert(stockReplenishments).values(replenishment).returning();
    
    // Update product stock
    await db
      .update(products)
      .set({
        stock: sql`${products.stock} + ${replenishment.quantity}`
      })
      .where(eq(products.id, replenishment.productId));
    
    // Automatically generate stock alerts after replenishment
    await this.generateStockAlerts(replenishment.userId);
    
    return newReplenishment;
  }

  async deleteStockReplenishment(id: number): Promise<void> {
    await db.delete(stockReplenishments).where(eq(stockReplenishments.id, id));
  }

  // Category operations
  async getCategories(userId: string): Promise<Category[]> {
    return db.select().from(categories).where(eq(categories.userId, userId)).orderBy(desc(categories.createdAt));
  }

  async getCategory(id: number, userId: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(and(eq(categories.id, id), eq(categories.userId, userId)));
    return category;
  }

  async createCategory(category: NewCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  async updateCategory(id: number, category: Partial<NewCategory>, userId: string): Promise<Category> {
    const [updatedCategory] = await db
      .update(categories)
      .set(category)
      .where(and(eq(categories.id, id), eq(categories.userId, userId)))
      .returning();
    return updatedCategory;
  }

  async deleteCategory(id: number, userId: string): Promise<void> {
    await db.delete(categories).where(and(eq(categories.id, id), eq(categories.userId, userId)));
  }

  // Invoice operations
  async getInvoices(userId: string): Promise<Invoice[]> {
    return db.select().from(invoices).where(eq(invoices.userId, userId)).orderBy(desc(invoices.createdAt));
  }

  async getInvoice(id: number, userId: string): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(and(eq(invoices.id, id), eq(invoices.userId, userId)));
    return invoice;
  }

  async getInvoiceWithItems(id: number, userId: string): Promise<(Invoice & { items: InvoiceItem[]; client: Client }) | undefined> {
    const [invoice] = await db
      .select()
      .from(invoices)
      .leftJoin(clients, eq(invoices.clientId, clients.id))
      .where(and(eq(invoices.id, id), eq(invoices.userId, userId)));

    if (!invoice) return undefined;

    const items = await db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, id));

    return {
      ...invoice.invoices,
      items,
      client: invoice.clients!,
    };
  }

  async createInvoice(invoice: NewInvoice, items: Omit<NewInvoiceItem, 'invoiceId'>[]): Promise<Invoice> {
    const [newInvoice] = await db.insert(invoices).values(invoice).returning();
    
    if (items.length > 0) {
      const itemsWithInvoiceId = items.map(item => ({
        ...item,
        invoiceId: newInvoice.id,
      }));
      await db.insert(invoiceItems).values(itemsWithInvoiceId);

      // Always create sales records when an invoice is created (regardless of payment status)
      // This ensures proper accounting - a sale is recorded when the invoice is generated
      await this.createSalesFromInvoice(newInvoice.id, invoice.userId);
      
      // Always update stock when an invoice is created (regardless of payment status)
      // This reflects the physical reality that goods are delivered/reserved upon invoicing
      await this.updateStockAfterInvoiceCreation(itemsWithInvoiceId, invoice.userId);
      
      // Automatically generate overdue invoice alerts after creating invoices
      await this.generateOverdueInvoiceAlerts(invoice.userId);
    }

    return newInvoice;
  }

  async updateInvoice(id: number, invoice: Partial<NewInvoice>, userId: string): Promise<Invoice> {
    // Get the current invoice before updating
    const currentInvoice = await this.getInvoice(id, userId);
    
    const [updatedInvoice] = await db
      .update(invoices)
      .set(invoice)
      .where(and(eq(invoices.id, id), eq(invoices.userId, userId)))
      .returning();

    // Stock is already updated during invoice creation, no need to update again on status change
    
    // Automatically generate overdue invoice alerts after updating an invoice
    await this.generateOverdueInvoiceAlerts(userId);

    return updatedInvoice;
  }

  // Helper function to update stock after invoice creation
  private async updateStockAfterInvoiceCreation(items: NewInvoiceItem[], userId: string): Promise<void> {
    // Update stock for each product (prevent negative stock)
    for (const item of items.filter(item => item.productId)) {
      await db
        .update(products)
        .set({
          stock: sql`GREATEST(0, ${products.stock} - ${item.quantity})`
        })
        .where(and(
          eq(products.id, item.productId!),
          eq(products.userId, userId)
        ));
    }
    
    // Automatically generate stock alerts after updating stock
    await this.generateStockAlerts(userId);
  }

  // Helper function to create sales from invoice items
  private async createSalesFromInvoice(invoiceId: number, userId: string): Promise<void> {
    // Get invoice items
    const items = await db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, invoiceId));
    
    // Check if sales already exist for this invoice to avoid duplicates
    const existingSales = await db.select().from(sales).where(eq(sales.invoiceId, invoiceId));
    if (existingSales.length > 0) {
      return; // Sales already created for this invoice
    }
    
    // Create sales records for each item
    const salesData = items
      .filter(item => item.productId) // Only create sales for items with productId
      .map(item => ({
        invoiceId: invoiceId,
        productId: item.productId!,
        quantity: item.quantity,
        unitPrice: item.priceHT,
        total: item.totalHT,
        userId: userId,
      }));

    if (salesData.length > 0) {
      // Insert sales records
      await db.insert(sales).values(salesData);
    }
  }

  async deleteInvoice(id: number, userId: string): Promise<void> {
    // First delete sales records associated with this invoice
    await db.delete(sales).where(eq(sales.invoiceId, id));
    // Then delete invoice items
    await db.delete(invoiceItems).where(eq(invoiceItems.invoiceId, id));
    // Finally delete the invoice
    await db.delete(invoices).where(and(eq(invoices.id, id), eq(invoices.userId, userId)));
  }

  // Sales operations
  async getSales(userId: string): Promise<Sale[]> {
    return db.select().from(sales).where(eq(sales.userId, userId)).orderBy(desc(sales.createdAt));
  }

  async createSale(sale: NewSale): Promise<Sale> {
    const [newSale] = await db.insert(sales).values(sale).returning();
    return newSale;
  }

  // Dashboard statistics
  async getDashboardStats(userId: string): Promise<{
    revenue: number;
    invoiceCount: number;
    clientCount: number;
    productCount: number;
    recentInvoices: (Invoice & { client: Client })[];
    topProducts: (Product & { salesCount: number })[];
    lowStockProducts: Product[];
    revenueGrowth: number;
    invoiceGrowth: number;
    clientGrowth: number;
    recentInvoiceCount: number;
    recentClientCount: number;
  }> {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastWeek = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    // Current revenue (sum of all invoices HT - representing total sales)
    const revenueResult = await db
      .select({ total: sum(invoices.totalHT) })
      .from(invoices)
      .where(eq(invoices.userId, userId));
    
    const revenue = parseFloat(revenueResult[0]?.total || "0");

    // Previous month revenue for comparison
    const lastMonthRevenueResult = await db
      .select({ total: sum(invoices.totalHT) })
      .from(invoices)
      .where(and(
        eq(invoices.userId, userId),
        sql`${invoices.createdAt} >= ${lastMonth.toISOString()}`,
        sql`${invoices.createdAt} < ${thisMonth.toISOString()}`
      ));
    
    const lastMonthRevenue = parseFloat(lastMonthRevenueResult[0]?.total || "0");
    const revenueGrowth = lastMonthRevenue > 0 ? ((revenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;

    // Total invoice count
    const invoiceCountResult = await db
      .select({ count: count() })
      .from(invoices)
      .where(eq(invoices.userId, userId));
    
    const invoiceCount = invoiceCountResult[0]?.count || 0;

    // Recent invoices (this week)
    const recentInvoiceCountResult = await db
      .select({ count: count() })
      .from(invoices)
      .where(and(
        eq(invoices.userId, userId),
        sql`${invoices.createdAt} >= ${thisWeek.toISOString()}`
      ));
    
    const recentInvoiceCount = recentInvoiceCountResult[0]?.count || 0;

    // Previous week invoice count for comparison
    const lastWeekInvoiceCountResult = await db
      .select({ count: count() })
      .from(invoices)
      .where(and(
        eq(invoices.userId, userId),
        sql`${invoices.createdAt} >= ${lastWeek.toISOString()}`,
        sql`${invoices.createdAt} < ${thisWeek.toISOString()}`
      ));
    
    const lastWeekInvoiceCount = lastWeekInvoiceCountResult[0]?.count || 0;
    const invoiceGrowth = lastWeekInvoiceCount > 0 ? ((recentInvoiceCount - lastWeekInvoiceCount) / lastWeekInvoiceCount) * 100 : 0;

    // Total client count
    const clientCountResult = await db
      .select({ count: count() })
      .from(clients)
      .where(eq(clients.userId, userId));
    
    const clientCount = clientCountResult[0]?.count || 0;

    // Recent clients (this month)
    const recentClientCountResult = await db
      .select({ count: count() })
      .from(clients)
      .where(and(
        eq(clients.userId, userId),
        sql`${clients.createdAt} >= ${thisMonth.toISOString()}`
      ));
    
    const recentClientCount = recentClientCountResult[0]?.count || 0;

    // Previous month client count for comparison
    const lastMonthClientCountResult = await db
      .select({ count: count() })
      .from(clients)
      .where(and(
        eq(clients.userId, userId),
        sql`${clients.createdAt} >= ${lastMonth.toISOString()}`,
        sql`${clients.createdAt} < ${thisMonth.toISOString()}`
      ));
    
    const lastMonthClientCount = lastMonthClientCountResult[0]?.count || 0;
    const clientGrowth = lastMonthClientCount > 0 ? ((recentClientCount - lastMonthClientCount) / lastMonthClientCount) * 100 : 0;

    // Product count
    const productCountResult = await db
      .select({ count: count() })
      .from(products)
      .where(eq(products.userId, userId));
    
    const productCount = productCountResult[0]?.count || 0;

    // Recent invoices with client info
    const recentInvoices = await db
      .select()
      .from(invoices)
      .leftJoin(clients, eq(invoices.clientId, clients.id))
      .where(eq(invoices.userId, userId))
      .orderBy(desc(invoices.createdAt))
      .limit(4);

    const recentInvoicesFormatted = recentInvoices.map(row => ({
      ...row.invoices,
      client: row.clients!,
    }));

    // Top products by sales quantity
    const topProductsResult = await db
      .select({
        product: products,
        salesCount: sum(sales.quantity),
      })
      .from(products)
      .leftJoin(sales, eq(products.id, sales.productId))
      .where(eq(products.userId, userId))
      .groupBy(products.id)
      .orderBy(desc(sum(sales.quantity)))
      .limit(5);

    const topProducts = topProductsResult
      .map(row => ({
        ...row.product,
        salesCount: parseInt(row.salesCount || "0"),
      }))
      .sort((a, b) => b.salesCount - a.salesCount); // Ensure proper sorting by sales count

    // Low stock products (stock < 10)
    const lowStockProducts = await db
      .select()
      .from(products)
      .where(and(eq(products.userId, userId), eq(products.stock, 0)))
      .limit(10);

    return {
      revenue,
      invoiceCount,
      clientCount,
      productCount,
      recentInvoices: recentInvoicesFormatted,
      topProducts,
      lowStockProducts,
      revenueGrowth: Math.round(revenueGrowth * 100) / 100,
      invoiceGrowth: Math.round(invoiceGrowth * 100) / 100,
      clientGrowth: Math.round(clientGrowth * 100) / 100,
      recentInvoiceCount,
      recentClientCount,
    };
  }

  // License operations
  async getLicenseByKey(key: string): Promise<License | undefined> {
    const [license] = await db.select().from(licenses).where(eq(licenses.key, key));
    return license;
  }

  async getAllLicenses(): Promise<License[]> {
    return db.select().from(licenses).orderBy(desc(licenses.createdAt));
  }

  async createLicense(licenseData: NewLicense): Promise<License> {
    const [license] = await db.insert(licenses).values(licenseData).returning();
    return license;
  }

  async activateLicense(key: string, clientName?: string, deviceId?: string): Promise<License> {
    const [license] = await db
      .update(licenses)
      .set({
        activated: true,
        clientName,
        deviceId,
        activatedAt: new Date(),
      })
      .where(eq(licenses.key, key))
      .returning();
    return license;
  }

  async revokeLicense(key: string): Promise<License> {
    const [license] = await db
      .update(licenses)
      .set({
        activated: false,
        revokedAt: new Date(),
      })
      .where(eq(licenses.key, key))
      .returning();
    return license;
  }

  // Accounting operations implementation

  // Expense Categories
  async getExpenseCategories(userId: string): Promise<ExpenseCategory[]> {
    return db.select().from(expenseCategories).where(eq(expenseCategories.userId, userId)).orderBy(desc(expenseCategories.createdAt));
  }

  async getExpenseCategory(id: number, userId: string): Promise<ExpenseCategory | undefined> {
    const [category] = await db.select().from(expenseCategories).where(and(eq(expenseCategories.id, id), eq(expenseCategories.userId, userId)));
    return category;
  }

  async createExpenseCategory(category: NewExpenseCategory): Promise<ExpenseCategory> {
    const [newCategory] = await db.insert(expenseCategories).values(category).returning();
    return newCategory;
  }

  async updateExpenseCategory(id: number, category: Partial<NewExpenseCategory>, userId: string): Promise<ExpenseCategory> {
    const [updatedCategory] = await db
      .update(expenseCategories)
      .set(category)
      .where(and(eq(expenseCategories.id, id), eq(expenseCategories.userId, userId)))
      .returning();
    return updatedCategory;
  }

  async deleteExpenseCategory(id: number, userId: string): Promise<void> {
    await db.delete(expenseCategories).where(and(eq(expenseCategories.id, id), eq(expenseCategories.userId, userId)));
  }

  // Expenses
  async getExpenses(userId: string): Promise<any[]> {
    return await db
      .select({
        id: expenses.id,
        reference: expenses.reference,
        description: expenses.description,
        amount: expenses.amount,
        expenseDate: expenses.expenseDate,
        paymentMethod: expenses.paymentMethod,
        status: expenses.status,
        receiptUrl: expenses.receiptUrl,
        notes: expenses.notes,
        imprestId: expenses.imprestId,
        approvedBy: expenses.approvedBy,
        approvedAt: expenses.approvedAt,
        createdAt: expenses.createdAt,
        category: {
          id: expenseCategories.id,
          name: expenseCategories.name,
          isMajor: expenseCategories.isMajor,
        },
      })
      .from(expenses)
      .leftJoin(expenseCategories, eq(expenses.categoryId, expenseCategories.id))
      .where(eq(expenses.userId, userId))
      .orderBy(desc(expenses.createdAt));
  }

  async getExpensesByPeriod(userId: string, startDate: Date, endDate: Date): Promise<any[]> {
    return await db
      .select({
        id: expenses.id,
        reference: expenses.reference,
        description: expenses.description,
        amount: expenses.amount,
        expenseDate: expenses.expenseDate,
        paymentMethod: expenses.paymentMethod,
        status: expenses.status,
        receiptUrl: expenses.receiptUrl,
        notes: expenses.notes,
        imprestId: expenses.imprestId,
        approvedBy: expenses.approvedBy,
        approvedAt: expenses.approvedAt,
        createdAt: expenses.createdAt,
        category: {
          id: expenseCategories.id,
          name: expenseCategories.name,
          isMajor: expenseCategories.isMajor,
        },
      })
      .from(expenses)
      .leftJoin(expenseCategories, eq(expenses.categoryId, expenseCategories.id))
      .where(and(
        eq(expenses.userId, userId),
        gte(expenses.expenseDate, startDate),
        lte(expenses.expenseDate, endDate)
      ))
      .orderBy(desc(expenses.createdAt));
  }

  async getExpense(id: number, userId: string): Promise<any | undefined> {
    const [result] = await db
      .select({
        id: expenses.id,
        reference: expenses.reference,
        description: expenses.description,
        amount: expenses.amount,
        expenseDate: expenses.expenseDate,
        paymentMethod: expenses.paymentMethod,
        status: expenses.status,
        receiptUrl: expenses.receiptUrl,
        notes: expenses.notes,
        imprestId: expenses.imprestId,
        approvedBy: expenses.approvedBy,
        approvedAt: expenses.approvedAt,
        createdAt: expenses.createdAt,
        category: {
          id: expenseCategories.id,
          name: expenseCategories.name,
          isMajor: expenseCategories.isMajor,
        },
      })
      .from(expenses)
      .leftJoin(expenseCategories, eq(expenses.categoryId, expenseCategories.id))
      .where(and(eq(expenses.id, id), eq(expenses.userId, userId)));

    return result;
  }

  async createExpense(expense: NewExpense): Promise<Expense> {
    // Generate unique reference if not provided
    const reference = expense.reference || `EXP-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    
    // Create the expense without deducting from imprest fund yet
    const [newExpense] = await db.insert(expenses).values({ ...expense, reference }).returning();
    
    return newExpense;
  }

  async updateExpense(id: number, expense: Partial<NewExpense>, userId: string): Promise<Expense> {
    const [updatedExpense] = await db
      .update(expenses)
      .set(expense)
      .where(and(eq(expenses.id, id), eq(expenses.userId, userId)))
      .returning();
    return updatedExpense;
  }

  async deleteExpense(id: number, userId: string): Promise<void> {
    await db.delete(expenses).where(and(eq(expenses.id, id), eq(expenses.userId, userId)));
  }

  async approveExpense(id: number, approvedBy: string, userId: string): Promise<Expense> {
    return await db.transaction(async (tx) => {
      // Get the expense details first
      const [expense] = await tx.select().from(expenses).where(and(eq(expenses.id, id), eq(expenses.userId, userId)));
      if (!expense) throw new Error("Dépense introuvable");

      // Update expense status
      const [updatedExpense] = await tx
        .update(expenses)
        .set({ 
          status: 'approved', 
          approvedBy, 
          approvedAt: new Date() 
        })
        .where(and(eq(expenses.id, id), eq(expenses.userId, userId)))
        .returning();

      // If linked to an imprest fund, deduct the amount NOW (on approval)
      if (expense.imprestId) {
        // Get current fund balance
        const [fund] = await tx.select().from(imprestFunds).where(eq(imprestFunds.id, expense.imprestId));
        if (!fund) throw new Error("Fonds d'avance introuvable");
        
        const currentBalance = parseFloat(fund.currentBalance);
        const expenseAmount = parseFloat(expense.amount);
        
        if (currentBalance < expenseAmount) {
          throw new Error(`Solde insuffisant. Solde actuel: ${currentBalance} FCFA, Dépense: ${expenseAmount} FCFA`);
        }
        
        const newBalance = currentBalance - expenseAmount;
        
        // Update fund balance
        await tx.update(imprestFunds)
          .set({ currentBalance: newBalance.toString(), updatedAt: new Date() })
          .where(eq(imprestFunds.id, expense.imprestId));
        
        // Create imprest transaction record
        await tx.insert(imprestTransactions).values({
          reference: `ITX-${Date.now()}`,
          imprestId: expense.imprestId,
          type: 'expense',
          amount: expense.amount,
          description: `Dépense approuvée: ${expense.description}`,
          balanceAfter: newBalance.toString(),
          expenseId: expense.id,
          userId: expense.userId,
        });
      }

      // Note: Transaction journal integration removed for now

      return updatedExpense;
    });
  }

  async rejectExpense(id: number, userId: string): Promise<Expense> {
    return await db.transaction(async (tx) => {
      // Get the expense details first
      const [expense] = await tx.select().from(expenses).where(and(eq(expenses.id, id), eq(expenses.userId, userId)));
      if (!expense) throw new Error("Dépense introuvable");

      // Update expense status
      const [updatedExpense] = await tx
        .update(expenses)
        .set({ status: 'rejected' })
        .where(and(eq(expenses.id, id), eq(expenses.userId, userId)))
        .returning();

      // If the expense was already approved and linked to an imprest fund, restore the amount
      if (expense.status === 'approved' && expense.imprestId) {
        // Get current fund balance
        const [fund] = await tx.select().from(imprestFunds).where(eq(imprestFunds.id, expense.imprestId));
        if (fund) {
          const currentBalance = parseFloat(fund.currentBalance);
          const expenseAmount = parseFloat(expense.amount);
          const newBalance = currentBalance + expenseAmount;
          
          // Restore fund balance
          await tx.update(imprestFunds)
            .set({ currentBalance: newBalance.toString(), updatedAt: new Date() })
            .where(eq(imprestFunds.id, expense.imprestId));
          
          // Create imprest transaction record for the refund
          await tx.insert(imprestTransactions).values({
            reference: `ITX-${Date.now()}`,
            imprestId: expense.imprestId,
            type: 'refund',
            amount: expense.amount,
            description: `Remboursement dépense rejetée: ${expense.description}`,
            balanceAfter: newBalance.toString(),
            expenseId: expense.id,
            userId: expense.userId,
          });
        }
      }

      return updatedExpense;
    });
  }

  // Imprest Funds
  async getImprestFunds(userId: string): Promise<ImprestFund[]> {
    return db.select().from(imprestFunds).where(eq(imprestFunds.userId, userId)).orderBy(desc(imprestFunds.createdAt));
  }

  async getImprestFund(id: number, userId: string): Promise<ImprestFund | undefined> {
    const [fund] = await db.select().from(imprestFunds).where(and(eq(imprestFunds.id, id), eq(imprestFunds.userId, userId)));
    return fund;
  }

  async createImprestFund(fund: NewImprestFund): Promise<ImprestFund> {
    // Generate unique reference
    const reference = `IMP-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    const initialAmount = parseFloat(fund.initialAmount as any);
    const [newFund] = await db.insert(imprestFunds).values({ 
      ...fund, 
      reference,
      initialAmount: initialAmount.toString(),
      currentBalance: initialAmount.toString(),
    }).returning();
    return newFund;
  }

  async updateImprestFund(id: number, fund: Partial<NewImprestFund>, userId: string): Promise<ImprestFund> {
    const [updatedFund] = await db
      .update(imprestFunds)
      .set({ ...fund, updatedAt: new Date() })
      .where(and(eq(imprestFunds.id, id), eq(imprestFunds.userId, userId)))
      .returning();
    return updatedFund;
  }

  async deleteImprestFund(id: number, userId: string): Promise<void> {
    // First delete related transactions
    await db.delete(imprestTransactions).where(eq(imprestTransactions.imprestId, id));
    // Then delete the fund
    await db.delete(imprestFunds).where(and(eq(imprestFunds.id, id), eq(imprestFunds.userId, userId)));
  }

  // Imprest Transactions
  async getImprestTransactions(imprestId: number, userId: string): Promise<ImprestTransaction[]> {
    return db.select().from(imprestTransactions)
      .where(and(eq(imprestTransactions.imprestId, imprestId), eq(imprestTransactions.userId, userId)))
      .orderBy(desc(imprestTransactions.createdAt));
  }

  async createImprestTransaction(transaction: NewImprestTransaction): Promise<ImprestTransaction> {
    // Generate unique reference
    const reference = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    
    // Get current fund to calculate new balance
    const [fund] = await db.select().from(imprestFunds).where(eq(imprestFunds.id, transaction.imprestId));
    if (!fund) throw new Error("Imprest fund not found");
    
    const currentBalance = parseFloat(fund.currentBalance);
    const transactionAmount = parseFloat(transaction.amount as any);
    
    let newBalance: number;
    if (transaction.type === 'deposit') {
      newBalance = currentBalance + transactionAmount;
    } else {
      newBalance = currentBalance - transactionAmount;
      if (newBalance < 0) throw new Error("Insufficient funds");
    }
    
    // Create transaction
    const [newTransaction] = await db.insert(imprestTransactions).values({
      ...transaction,
      reference,
      amount: transactionAmount.toString(),
      balanceAfter: newBalance.toString(),
    }).returning();
    
    // Update fund balance
    await db.update(imprestFunds)
      .set({ 
        currentBalance: newBalance.toString(),
        updatedAt: new Date() 
      })
      .where(eq(imprestFunds.id, transaction.imprestId));
    
    return newTransaction;
  }

  // Accounting Reports
  async getAccountingReports(userId: string): Promise<AccountingReport[]> {
    return db.select().from(accountingReports).where(eq(accountingReports.userId, userId)).orderBy(desc(accountingReports.createdAt));
  }

  async createAccountingReport(report: NewAccountingReport): Promise<AccountingReport> {
    const [newReport] = await db.insert(accountingReports).values(report).returning();
    return newReport;
  }

  async deleteAccountingReport(id: number, userId: string): Promise<void> {
    await db.delete(accountingReports).where(and(eq(accountingReports.id, id), eq(accountingReports.userId, userId)));
  }

  // Accounting Statistics
  async getAccountingStats(userId: string): Promise<{
    totalExpenses: number;
    pendingExpenses: number;
    approvedExpenses: number;
    totalImprestFunds: number;
    activeImprestFunds: number;
    totalRevenues: number;
    monthlyRevenues: number;
    recentRevenues: number;
    netResult: number;
    monthlyExpensesByCategory: { category: string; amount: number; allocatedAmount: number }[];
    recentExpenses: (Expense & { category: ExpenseCategory })[];
  }> {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Total expenses amount (excluding rejected expenses)
    const totalExpensesResult = await db
      .select({ total: sum(expenses.amount) })
      .from(expenses)
      .where(and(
        eq(expenses.userId, userId),
        ne(expenses.status, "rejected")
      ));
    
    const totalExpenses = parseFloat(totalExpensesResult[0]?.total || "0");

    // Pending expenses count
    const pendingExpensesResult = await db
      .select({ count: count() })
      .from(expenses)
      .where(and(eq(expenses.userId, userId), eq(expenses.status, "pending")));
    
    const pendingExpenses = pendingExpensesResult[0]?.count || 0;

    // Approved expenses count
    const approvedExpensesResult = await db
      .select({ count: count() })
      .from(expenses)
      .where(and(eq(expenses.userId, userId), eq(expenses.status, "approved")));
    
    const approvedExpenses = approvedExpensesResult[0]?.count || 0;

    // Total imprest funds amount
    const totalImprestResult = await db
      .select({ total: sum(imprestFunds.currentBalance) })
      .from(imprestFunds)
      .where(eq(imprestFunds.userId, userId));
    
    const totalImprestFunds = parseFloat(totalImprestResult[0]?.total || "0");

    // Active imprest funds count
    const activeImprestResult = await db
      .select({ count: count() })
      .from(imprestFunds)
      .where(and(eq(imprestFunds.userId, userId), eq(imprestFunds.status, "active")));
    
    const activeImprestFunds = activeImprestResult[0]?.count || 0;

    // Monthly expenses by category with imprest fund allocation
    const monthlyExpensesByCategory = await db
      .select({
        category: expenseCategories.name,
        categoryId: expenseCategories.id,
        expenseAmount: sum(expenses.amount),
      })
      .from(expenses)
      .leftJoin(expenseCategories, eq(expenses.categoryId, expenseCategories.id))
      .where(and(
        eq(expenses.userId, userId),
        sql`${expenses.expenseDate} >= ${thisMonth.toISOString()}`,
        ne(expenses.status, "rejected")
      ))
      .groupBy(expenseCategories.name, expenseCategories.id);

    // Get imprest fund allocations for each category - using MAX to avoid counting the same fund multiple times
    const imprestAllocationByCategory = await db
      .select({
        categoryId: expenseCategories.id,
        category: expenseCategories.name,
        allocatedAmount: sql<string>`MAX(${imprestFunds.initialAmount})`,
      })
      .from(expenses)
      .leftJoin(expenseCategories, eq(expenses.categoryId, expenseCategories.id))
      .leftJoin(imprestFunds, eq(expenses.imprestId, imprestFunds.id))
      .where(and(
        eq(expenses.userId, userId),
        isNotNull(expenses.imprestId),
        eq(imprestFunds.status, "active")
      ))
      .groupBy(expenseCategories.id, expenseCategories.name, imprestFunds.id);

    const monthlyExpensesByCategoryFormatted = monthlyExpensesByCategory.map(row => {
      const allocation = imprestAllocationByCategory.find(alloc => 
        alloc.categoryId === row.categoryId
      );
      return {
        category: row.category || 'Sans catégorie',
        amount: parseFloat(row.expenseAmount || "0"),
        allocatedAmount: parseFloat(allocation?.allocatedAmount || "0"),
      };
    });

    // Recent expenses
    const recentExpensesResult = await db
      .select()
      .from(expenses)
      .leftJoin(expenseCategories, eq(expenses.categoryId, expenseCategories.id))
      .where(eq(expenses.userId, userId))
      .orderBy(desc(expenses.createdAt))
      .limit(5);

    const recentExpenses = recentExpensesResult.map(row => ({
      ...row.expenses,
      category: row.expense_categories!,
    }));

    // Total revenues amount
    const totalRevenuesResult = await db
      .select({ total: sum(revenues.amount) })
      .from(revenues)
      .where(eq(revenues.userId, userId));
    
    const totalRevenues = parseFloat(totalRevenuesResult[0]?.total || "0");

    // Monthly revenues (current month)
    const monthlyRevenuesResult = await db
      .select({ total: sum(revenues.amount) })
      .from(revenues)
      .where(and(
        eq(revenues.userId, userId),
        sql`${revenues.revenueDate} >= ${thisMonth.toISOString()}`
      ));
    
    const monthlyRevenues = parseFloat(monthlyRevenuesResult[0]?.total || "0");

    // Recent revenues count (last 30 days)
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const recentRevenuesResult = await db
      .select({ count: count() })
      .from(revenues)
      .where(and(
        eq(revenues.userId, userId),
        sql`${revenues.revenueDate} >= ${lastMonth.toISOString()}`
      ));
    
    const recentRevenues = recentRevenuesResult[0]?.count || 0;

    // Calculate net result (Revenues - Expenses)
    const netResult = totalRevenues - totalExpenses;

    return {
      totalExpenses,
      pendingExpenses,
      approvedExpenses,
      totalImprestFunds,
      activeImprestFunds,
      totalRevenues,
      monthlyRevenues,
      recentRevenues,
      netResult,
      monthlyExpensesByCategory: monthlyExpensesByCategoryFormatted,
      recentExpenses,
    };
  }

  async getAccountingStatsByPeriod(userId: string, startDate: Date, endDate: Date): Promise<{
    totalExpenses: number;
    pendingExpenses: number;
    approvedExpenses: number;
    totalImprestFunds: number;
    activeImprestFunds: number;
    totalRevenues: number;
    monthlyRevenues: number;
    recentRevenues: number;
    netResult: number;
    monthlyExpensesByCategory: { category: string; amount: number; allocatedAmount: number }[];
    recentExpenses: (Expense & { category: ExpenseCategory })[];
  }> {
    // Total expenses amount (excluding rejected expenses) for the period
    const totalExpensesResult = await db
      .select({ total: sum(expenses.amount) })
      .from(expenses)
      .where(and(
        eq(expenses.userId, userId),
        ne(expenses.status, "rejected"),
        gte(expenses.expenseDate, startDate),
        lte(expenses.expenseDate, endDate)
      ));
    
    const totalExpenses = parseFloat(totalExpensesResult[0]?.total || "0");

    // Pending expenses count for the period
    const pendingExpensesResult = await db
      .select({ count: count() })
      .from(expenses)
      .where(and(
        eq(expenses.userId, userId), 
        eq(expenses.status, "pending"),
        gte(expenses.expenseDate, startDate),
        lte(expenses.expenseDate, endDate)
      ));
    
    const pendingExpenses = pendingExpensesResult[0]?.count || 0;

    // Approved expenses count for the period
    const approvedExpensesResult = await db
      .select({ count: count() })
      .from(expenses)
      .where(and(
        eq(expenses.userId, userId), 
        eq(expenses.status, "approved"),
        gte(expenses.expenseDate, startDate),
        lte(expenses.expenseDate, endDate)
      ));
    
    const approvedExpenses = approvedExpensesResult[0]?.count || 0;

    // Total imprest funds amount (not filtered by period)
    const totalImprestResult = await db
      .select({ total: sum(imprestFunds.currentBalance) })
      .from(imprestFunds)
      .where(eq(imprestFunds.userId, userId));
    
    const totalImprestFunds = parseFloat(totalImprestResult[0]?.total || "0");

    // Active imprest funds count (not filtered by period)
    const activeImprestResult = await db
      .select({ count: count() })
      .from(imprestFunds)
      .where(and(
        eq(imprestFunds.userId, userId),
        eq(imprestFunds.status, "active")
      ));
    
    const activeImprestFunds = activeImprestResult[0]?.count || 0;

    // Total revenues for the period
    const totalRevenuesResult = await db
      .select({ total: sum(revenues.amount) })
      .from(revenues)
      .where(and(
        eq(revenues.userId, userId),
        gte(revenues.revenueDate, startDate),
        lte(revenues.revenueDate, endDate)
      ));
    
    const totalRevenues = parseFloat(totalRevenuesResult[0]?.total || "0");

    // Monthly revenues for the period
    const monthlyRevenues = totalRevenues;

    // Recent revenues for the period
    const recentRevenues = totalRevenues;

    // Monthly expenses by category for the period
    const monthlyExpensesByCategoryResult = await db
      .select({
        category: expenseCategories.name,
        amount: sum(expenses.amount),
      })
      .from(expenses)
      .leftJoin(expenseCategories, eq(expenses.categoryId, expenseCategories.id))
      .where(and(
        eq(expenses.userId, userId),
        ne(expenses.status, "rejected"),
        gte(expenses.expenseDate, startDate),
        lte(expenses.expenseDate, endDate)
      ))
      .groupBy(expenseCategories.name);

    const monthlyExpensesByCategoryFormatted = monthlyExpensesByCategoryResult.map(row => ({
      category: row.category || "Sans catégorie",
      amount: parseFloat(row.amount || "0"),
      allocatedAmount: 0,
    }));

    // Recent expenses for the period (limit to 5)
    const recentExpensesResult = await db
      .select({
        id: expenses.id,
        reference: expenses.reference,
        description: expenses.description,
        amount: expenses.amount,
        expenseDate: expenses.expenseDate,
        paymentMethod: expenses.paymentMethod,
        status: expenses.status,
        receiptUrl: expenses.receiptUrl,
        notes: expenses.notes,
        imprestId: expenses.imprestId,
        approvedBy: expenses.approvedBy,
        approvedAt: expenses.approvedAt,
        createdAt: expenses.createdAt,
        category: {
          id: expenseCategories.id,
          name: expenseCategories.name,
          isMajor: expenseCategories.isMajor,
        },
      })
      .from(expenses)
      .leftJoin(expenseCategories, eq(expenses.categoryId, expenseCategories.id))
      .where(and(
        eq(expenses.userId, userId),
        gte(expenses.expenseDate, startDate),
        lte(expenses.expenseDate, endDate)
      ))
      .orderBy(desc(expenses.createdAt))
      .limit(5) as (Expense & { category: ExpenseCategory })[];

    // Calculate net result for the period
    const netResult = totalRevenues - totalExpenses;

    return {
      totalExpenses,
      pendingExpenses,
      approvedExpenses,
      totalImprestFunds,
      activeImprestFunds,
      totalRevenues,
      monthlyRevenues,
      recentRevenues,
      netResult,
      monthlyExpensesByCategory: monthlyExpensesByCategoryFormatted,
      recentExpenses: recentExpensesResult,
    };
  }

  // ==========================================
  // CASH BOOK OPERATIONS
  // ==========================================
  
  async getCashBookEntries(userId: string): Promise<CashBookEntry[]> {
    return db.select().from(cashBookEntries).where(eq(cashBookEntries.userId, userId)).orderBy(desc(cashBookEntries.date));
  }

  async getCashBookEntry(id: number, userId: string): Promise<CashBookEntry | undefined> {
    const [entry] = await db.select().from(cashBookEntries).where(and(eq(cashBookEntries.id, id), eq(cashBookEntries.userId, userId)));
    return entry;
  }

  async createCashBookEntry(data: NewCashBookEntry): Promise<CashBookEntry> {
    // Generate unique reference
    const reference = `CB-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    
    const [newEntry] = await db.insert(cashBookEntries).values({
      ...data,
      reference,
      date: typeof data.date === 'string' ? data.date : (data.date as Date).toISOString().split('T')[0],
    }).returning();

    // Add to transaction journal
    await this.addToTransactionJournal({
      userId: data.userId,
      transactionDate: typeof data.date === 'string' ? new Date(data.date) : data.date as Date,
      reference,
      description: data.description,
      sourceModule: 'cash_book',
      sourceId: newEntry.id,
      debitAccount: data.type === 'expense' ? data.account : undefined,
      creditAccount: data.type === 'income' ? data.account : undefined,
      debitAmount: data.type === 'expense' ? data.amount : undefined,
      creditAmount: data.type === 'income' ? data.amount : undefined,
      createdBy: data.userId,
    });

    return newEntry;
  }

  async updateCashBookEntry(id: number, data: Partial<NewCashBookEntry>, userId: string): Promise<CashBookEntry> {
    const updateData: any = { ...data };
    if (updateData.date instanceof Date) {
      updateData.date = updateData.date.toISOString().split('T')[0];
    }
    
    const [updatedEntry] = await db
      .update(cashBookEntries)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(and(eq(cashBookEntries.id, id), eq(cashBookEntries.userId, userId)))
      .returning();
    return updatedEntry;
  }

  async deleteCashBookEntry(id: number, userId: string): Promise<void> {
    await db.delete(cashBookEntries).where(and(eq(cashBookEntries.id, id), eq(cashBookEntries.userId, userId)));
  }

  async reconcileCashBookEntry(id: number, userId: string): Promise<CashBookEntry> {
    const [updatedEntry] = await db
      .update(cashBookEntries)
      .set({
        isReconciled: true,
        reconciledAt: new Date(),
        updatedAt: new Date(),
      })
      .where(and(eq(cashBookEntries.id, id), eq(cashBookEntries.userId, userId)))
      .returning();
    return updatedEntry;
  }

  // ==========================================
  // PETTY CASH OPERATIONS
  // ==========================================
  
  async getPettyCashEntries(userId: string): Promise<PettyCashEntry[]> {
    return db.select().from(pettyCashEntries).where(eq(pettyCashEntries.userId, userId)).orderBy(desc(pettyCashEntries.date));
  }

  async getPettyCashEntry(id: number, userId: string): Promise<PettyCashEntry | undefined> {
    const [entry] = await db.select().from(pettyCashEntries).where(and(eq(pettyCashEntries.id, id), eq(pettyCashEntries.userId, userId)));
    return entry;
  }

  async createPettyCashEntry(data: NewPettyCashEntry): Promise<PettyCashEntry> {
    // Calculate running balance
    const lastEntry = await db
      .select({ runningBalance: pettyCashEntries.runningBalance })
      .from(pettyCashEntries)
      .where(eq(pettyCashEntries.userId, data.userId))
      .orderBy(desc(pettyCashEntries.createdAt))
      .limit(1);

    const lastBalance = parseFloat(lastEntry[0]?.runningBalance || "0");
    const newBalance = lastBalance - parseFloat(data.amount);

    const [newEntry] = await db.insert(pettyCashEntries).values({
      ...data,
      date: typeof data.date === 'string' ? data.date : (data.date as Date).toISOString().split('T')[0],
    }).returning();

    return newEntry;
  }

  async updatePettyCashEntry(id: number, data: Partial<NewPettyCashEntry>, userId: string): Promise<PettyCashEntry> {
    const updateData: any = { ...data };
    if (updateData.date instanceof Date) {
      updateData.date = updateData.date.toISOString().split('T')[0];
    }
    
    const [updatedEntry] = await db
      .update(pettyCashEntries)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(and(eq(pettyCashEntries.id, id), eq(pettyCashEntries.userId, userId)))
      .returning();
    return updatedEntry;
  }

  async approvePettyCashEntry(id: number, approvedBy: string, userId: string): Promise<PettyCashEntry> {
    const [updatedEntry] = await db
      .update(pettyCashEntries)
      .set({
        status: 'approved',
        approvedBy,
        updatedAt: new Date(),
      })
      .where(and(eq(pettyCashEntries.id, id), eq(pettyCashEntries.userId, userId)))
      .returning();

    if (updatedEntry) {
      // Add to transaction journal
      await this.addToTransactionJournal({
        userId,
        transactionDate: new Date(updatedEntry.date),
        reference: `PC-${updatedEntry.id}`,
        description: updatedEntry.description,
        sourceModule: 'petty_cash',
        sourceId: updatedEntry.id,
        debitAccount: 'petty_cash_expense',
        creditAccount: 'petty_cash',
        debitAmount: updatedEntry.amount,
        creditAmount: updatedEntry.amount,
        createdBy: approvedBy,
      });
    }

    return updatedEntry;
  }

  async rejectPettyCashEntry(id: number, userId: string): Promise<PettyCashEntry> {
    const [updatedEntry] = await db
      .update(pettyCashEntries)
      .set({
        status: 'rejected',
        updatedAt: new Date(),
      })
      .where(and(eq(pettyCashEntries.id, id), eq(pettyCashEntries.userId, userId)))
      .returning();
    return updatedEntry;
  }

  async deletePettyCashEntry(id: number, userId: string): Promise<void> {
    await db.delete(pettyCashEntries).where(and(eq(pettyCashEntries.id, id), eq(pettyCashEntries.userId, userId)));
  }

  // ==========================================
  // TRANSACTION JOURNAL OPERATIONS
  // ==========================================
  
  async getTransactionJournal(userId: string, filters?: any): Promise<TransactionJournal[]> {
    const conditions = [eq(transactionJournal.userId, userId)];

    if (filters?.startDate) {
      conditions.push(gte(transactionJournal.transactionDate, new Date(filters.startDate)));
    }
    if (filters?.endDate) {
      conditions.push(lte(transactionJournal.transactionDate, new Date(filters.endDate)));
    }
    if (filters?.sourceModule) {
      conditions.push(eq(transactionJournal.sourceModule, filters.sourceModule));
    }

    return await db
      .select()
      .from(transactionJournal)
      .where(and(...conditions))
      .orderBy(desc(transactionJournal.entryDate));
  }

  async addToTransactionJournal(data: NewTransactionJournal): Promise<TransactionJournal> {
    const [newEntry] = await db.insert(transactionJournal).values(data).returning();
    return newEntry;
  }

  async getTransactionJournalEntry(id: number, userId: string): Promise<TransactionJournal | undefined> {
    const [entry] = await db
      .select()
      .from(transactionJournal)
      .where(and(eq(transactionJournal.id, id), eq(transactionJournal.userId, userId)));
    return entry;
  }

  // ==========================================
  // FINANCIAL DASHBOARD OPERATIONS
  // ==========================================
  
  async getFinancialDashboardData(userId: string) {
    try {
      // Cash flow summary
      const cashFlowResult = await db
        .select({
          type: cashBookEntries.type,
          total: sum(cashBookEntries.amount),
        })
        .from(cashBookEntries)
        .where(and(
          eq(cashBookEntries.userId, userId),
          sql`${cashBookEntries.date} >= date_trunc('month', current_date)`
        ))
        .groupBy(cashBookEntries.type);

      // Account balances
      const accountBalances = await db
        .select({
          account: cashBookEntries.account,
          balance: sum(sql`CASE WHEN ${cashBookEntries.type} = 'income' THEN ${cashBookEntries.amount} ELSE -${cashBookEntries.amount} END`),
        })
        .from(cashBookEntries)
        .where(eq(cashBookEntries.userId, userId))
        .groupBy(cashBookEntries.account);

      // Recent transactions
      const recentTransactions = await db
        .select()
        .from(transactionJournal)
        .where(eq(transactionJournal.userId, userId))
        .orderBy(desc(transactionJournal.entryDate))
        .limit(10);

      // Petty cash summary
      const pettyCashSummary = await db
        .select({
          status: pettyCashEntries.status,
          count: count(),
          total: sum(pettyCashEntries.amount),
        })
        .from(pettyCashEntries)
        .where(and(
          eq(pettyCashEntries.userId, userId),
          sql`${pettyCashEntries.date} >= date_trunc('month', current_date)`
        ))
        .groupBy(pettyCashEntries.status);

      return {
        cashFlow: cashFlowResult.map(c => ({
          type: c.type,
          total: parseFloat(c.total || "0")
        })),
        accountBalances: accountBalances.map(a => ({
          account: a.account,
          balance: parseFloat(a.balance || "0")
        })),
        recentTransactions,
        pettyCashSummary: pettyCashSummary.map(p => ({
          status: p.status,
          count: p.count,
          total: parseFloat(p.total || "0")
        }))
      };
    } catch (error) {
      console.error("Error getting financial dashboard data:", error);
      throw error;
    }
  }

  // ==========================================
  // REVENUE OPERATIONS
  // ==========================================

  async getRevenueCategories(userId: string): Promise<RevenueCategory[]> {
    return await db
      .select()
      .from(revenueCategories)
      .where(eq(revenueCategories.userId, userId))
      .orderBy(desc(revenueCategories.createdAt));
  }

  async getRevenueCategory(id: number, userId: string): Promise<RevenueCategory | undefined> {
    const [category] = await db
      .select()
      .from(revenueCategories)
      .where(and(eq(revenueCategories.id, id), eq(revenueCategories.userId, userId)));
    return category;
  }

  async createRevenueCategory(categoryData: NewRevenueCategory): Promise<RevenueCategory> {
    const [category] = await db
      .insert(revenueCategories)
      .values(categoryData)
      .returning();
    return category;
  }

  async updateRevenueCategory(id: number, categoryData: Partial<NewRevenueCategory>, userId: string): Promise<RevenueCategory> {
    const [category] = await db
      .update(revenueCategories)
      .set(categoryData)
      .where(and(eq(revenueCategories.id, id), eq(revenueCategories.userId, userId)))
      .returning();
    return category;
  }

  async deleteRevenueCategory(id: number, userId: string): Promise<void> {
    await db
      .delete(revenueCategories)
      .where(and(eq(revenueCategories.id, id), eq(revenueCategories.userId, userId)));
  }

  async getRevenues(userId: string): Promise<(Revenue & { category: RevenueCategory })[]> {
    return await db
      .select({
        id: revenues.id,
        reference: revenues.reference,
        description: revenues.description,
        amount: revenues.amount,
        categoryId: revenues.categoryId,
        revenueDate: revenues.revenueDate,
        paymentMethod: revenues.paymentMethod,
        source: revenues.source,
        receiptUrl: revenues.receiptUrl,
        notes: revenues.notes,
        userId: revenues.userId,
        createdAt: revenues.createdAt,
        category: {
          id: revenueCategories.id,
          name: revenueCategories.name,
          description: revenueCategories.description,
          userId: revenueCategories.userId,
          createdAt: revenueCategories.createdAt,
        },
      })
      .from(revenues)
      .leftJoin(revenueCategories, eq(revenues.categoryId, revenueCategories.id))
      .where(eq(revenues.userId, userId))
      .orderBy(desc(revenues.createdAt)) as (Revenue & { category: RevenueCategory })[];
  }

  async getRevenuesByPeriod(userId: string, startDate: Date, endDate: Date): Promise<(Revenue & { category: RevenueCategory })[]> {
    return await db
      .select({
        id: revenues.id,
        reference: revenues.reference,
        description: revenues.description,
        amount: revenues.amount,
        categoryId: revenues.categoryId,
        revenueDate: revenues.revenueDate,
        paymentMethod: revenues.paymentMethod,
        source: revenues.source,
        receiptUrl: revenues.receiptUrl,
        notes: revenues.notes,
        userId: revenues.userId,
        createdAt: revenues.createdAt,
        category: {
          id: revenueCategories.id,
          name: revenueCategories.name,
          description: revenueCategories.description,
          userId: revenueCategories.userId,
          createdAt: revenueCategories.createdAt,
        },
      })
      .from(revenues)
      .leftJoin(revenueCategories, eq(revenues.categoryId, revenueCategories.id))
      .where(and(
        eq(revenues.userId, userId),
        gte(revenues.revenueDate, startDate),
        lte(revenues.revenueDate, endDate)
      ))
      .orderBy(desc(revenues.createdAt)) as (Revenue & { category: RevenueCategory })[];
  }

  async getRevenue(id: number, userId: string): Promise<Revenue | undefined> {
    const [revenue] = await db
      .select()
      .from(revenues)
      .where(and(eq(revenues.id, id), eq(revenues.userId, userId)));
    return revenue;
  }

  async createRevenue(revenueData: NewRevenue): Promise<Revenue> {
    const reference = `REV-${Date.now()}`;
    const [revenue] = await db
      .insert(revenues)
      .values({
        ...revenueData,
        reference,
      })
      .returning();
    return revenue;
  }

  async updateRevenue(id: number, revenueData: Partial<NewRevenue>, userId: string): Promise<Revenue> {
    const [revenue] = await db
      .update(revenues)
      .set(revenueData)
      .where(and(eq(revenues.id, id), eq(revenues.userId, userId)))
      .returning();
    return revenue;
  }

  async deleteRevenue(id: number, userId: string): Promise<void> {
    await db
      .delete(revenues)
      .where(and(eq(revenues.id, id), eq(revenues.userId, userId)));
  }

  // Business Alerts implementation
  async getBusinessAlerts(userId: string, unreadOnly: boolean = false): Promise<BusinessAlert[]> {
    const condition = unreadOnly 
      ? and(eq(businessAlerts.userId, userId), eq(businessAlerts.isRead, false))
      : eq(businessAlerts.userId, userId);
      
    return await db
      .select()
      .from(businessAlerts)
      .where(condition)
      .orderBy(desc(businessAlerts.createdAt));
  }

  async createBusinessAlert(alertData: NewBusinessAlert): Promise<BusinessAlert> {
    // Check if similar alert already exists (to avoid duplicates)
    if (alertData.entityType && alertData.entityId) {
      const existingAlert = await db
        .select()
        .from(businessAlerts)
        .where(and(
          eq(businessAlerts.userId, alertData.userId),
          eq(businessAlerts.type, alertData.type),
          eq(businessAlerts.entityType, alertData.entityType),
          eq(businessAlerts.entityId, alertData.entityId),
          eq(businessAlerts.isResolved, false)
        ))
        .limit(1);
        
      if (existingAlert.length > 0) {
        return existingAlert[0];
      }
    }

    const [alert] = await db
      .insert(businessAlerts)
      .values({
        ...alertData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return alert;
  }

  async markAlertAsRead(id: number, userId: string): Promise<void> {
    await db
      .update(businessAlerts)
      .set({ 
        isRead: true,
        updatedAt: new Date(),
      })
      .where(and(eq(businessAlerts.id, id), eq(businessAlerts.userId, userId)));
  }

  async markAlertAsResolved(id: number, userId: string): Promise<void> {
    await db
      .update(businessAlerts)
      .set({ 
        isResolved: true,
        isRead: true,
        updatedAt: new Date(),
      })
      .where(and(eq(businessAlerts.id, id), eq(businessAlerts.userId, userId)));
  }

  async deleteBusinessAlert(id: number, userId: string): Promise<void> {
    await db
      .delete(businessAlerts)
      .where(and(eq(businessAlerts.id, id), eq(businessAlerts.userId, userId)));
  }

  async generateStockAlerts(userId: string): Promise<BusinessAlert[]> {
    // First, mark all existing stock alerts as resolved to refresh them
    await db
      .update(businessAlerts)
      .set({ isResolved: true, updatedAt: new Date() })
      .where(and(
        eq(businessAlerts.userId, userId),
        or(eq(businessAlerts.type, "low_stock"), eq(businessAlerts.type, "critical_stock")),
        eq(businessAlerts.isResolved, false)
      ));

    // Get all products with low stock for this user
    const lowStockProducts = await db
      .select()
      .from(products)
      .where(and(
        eq(products.userId, userId),
        sql`${products.stock} <= ${products.alertStock}`
      ));

    const alerts: BusinessAlert[] = [];

    for (const product of lowStockProducts) {
      const stockLevel = product.stock || 0;
      const alertLevel = product.alertStock || 10;
      
      let severity: string, type: string, title: string, message: string;
      
      if (stockLevel === 0) {
        severity = "critical";
        type = "critical_stock";
        title = "Rupture de stock";
        message = `Le produit "${product.name}" est en rupture de stock.`;
      } else {
        severity = stockLevel <= alertLevel / 2 ? "high" : "medium";
        type = "low_stock";
        title = "Stock faible";
        message = `Le produit "${product.name}" a un stock faible: ${stockLevel} unité(s) restante(s).`;
      }

      // Force create new alert by bypassing duplicate check
      const [alert] = await db
        .insert(businessAlerts)
        .values({
          userId,
          type,
          severity,
          title,
          message,
          entityType: "product",
          entityId: product.id,
          metadata: {
            productName: product.name,
            currentStock: stockLevel,
            alertThreshold: alertLevel,
          },
          isRead: false,
          isResolved: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
      
      alerts.push(alert);
    }

    return alerts;
  }

  async generateOverdueInvoiceAlerts(userId: string): Promise<BusinessAlert[]> {
    // Get all unpaid invoices with due dates in the past
    const now = new Date();
    const nowString = now.toISOString();
    const overdueInvoices = await db
      .select({
        id: invoices.id,
        number: invoices.number,
        dueDate: invoices.dueDate,
        totalTTC: invoices.totalTTC,
        client: clients,
      })
      .from(invoices)
      .leftJoin(clients, eq(invoices.clientId, clients.id))
      .where(and(
        eq(invoices.userId, userId),
        or(eq(invoices.status, "en_attente"), eq(invoices.status, "partiellement_reglee")),
        isNotNull(invoices.dueDate),
        sql`${invoices.dueDate} < ${nowString}`
      ));

    const alerts: BusinessAlert[] = [];

    for (const invoice of overdueInvoices) {
      // Check if an alert already exists for this specific invoice
      const existingAlert = await db
        .select()
        .from(businessAlerts)
        .where(and(
          eq(businessAlerts.userId, userId),
          eq(businessAlerts.type, "overdue_invoice"),
          eq(businessAlerts.entityType, "invoice"),
          eq(businessAlerts.entityId, invoice.id),
          eq(businessAlerts.isResolved, false)
        ))
        .limit(1);

      // Skip if alert already exists for this invoice
      if (existingAlert.length > 0) {
        alerts.push(existingAlert[0]);
        continue;
      }

      const daysPastDue = Math.floor(
        (now.getTime() - new Date(invoice.dueDate!).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      const severity = daysPastDue > 30 ? "critical" : daysPastDue > 7 ? "high" : "medium";
      const title = "Facture échue";
      const message = `La facture ${invoice.number} de ${invoice.client?.name || "Client inconnu"} est échue depuis ${daysPastDue} jour(s).`;

      // Create new alert only if none exists
      const [alert] = await db
        .insert(businessAlerts)
        .values({
          userId,
          type: "overdue_invoice",
          severity,
          title,
          message,
          entityType: "invoice",
          entityId: invoice.id,
          metadata: {
            invoiceNumber: invoice.number,
            clientName: invoice.client?.name,
            amount: invoice.totalTTC,
            dueDate: invoice.dueDate?.toISOString(),
            daysPastDue,
          },
          isRead: false,
          isResolved: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
      
      alerts.push(alert);
    }

    return alerts;
  }

  async cleanupResolvedAlerts(userId: string, olderThanDays: number = 30): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
    
    await db
      .delete(businessAlerts)
      .where(and(
        eq(businessAlerts.userId, userId),
        eq(businessAlerts.isResolved, true),
        sql`${businessAlerts.updatedAt} < ${cutoffDate}`
      ));
  }

  async markAllAlertsAsRead(userId: string): Promise<number> {
    const result = await db
      .update(businessAlerts)
      .set({ 
        isRead: true, 
        updatedAt: new Date() 
      })
      .where(and(
        eq(businessAlerts.userId, userId),
        eq(businessAlerts.isRead, false)
      ))
      .returning();
    
    return result.length;
  }

}

export const storage = new DatabaseStorage();
