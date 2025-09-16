import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Import all tables
import { users } from "./auth";
import { licenses } from "./licenses";
import { categories, clients, products } from "./core";
import { invoices, invoiceItems, sales } from "./invoicing";
import { stockReplenishments } from "./inventory";
import { expenseCategories, expenses, imprestFunds, imprestTransactions, accountingReports } from "./accounting";
import { cashBookEntries, pettyCashEntries, transactionJournal } from "./treasury";
import { chartOfAccounts } from "./chart-of-accounts";
import { revenueCategories, revenues } from "./revenue";
import { businessAlerts } from "./alerts";

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type License = typeof licenses.$inferSelect;
export type NewLicense = typeof licenses.$inferInsert;

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;

export type InvoiceItem = typeof invoiceItems.$inferSelect;
export type NewInvoiceItem = typeof invoiceItems.$inferInsert;

export type Sale = typeof sales.$inferSelect;
export type NewSale = typeof sales.$inferInsert;

export type StockReplenishment = typeof stockReplenishments.$inferSelect;
export type NewStockReplenishment = typeof stockReplenishments.$inferInsert;

export type ExpenseCategory = typeof expenseCategories.$inferSelect;
export type NewExpenseCategory = typeof expenseCategories.$inferInsert;

export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;

export type ImprestFund = typeof imprestFunds.$inferSelect;
export type NewImprestFund = typeof imprestFunds.$inferInsert;

export type ImprestTransaction = typeof imprestTransactions.$inferSelect;
export type NewImprestTransaction = typeof imprestTransactions.$inferInsert;

export type AccountingReport = typeof accountingReports.$inferSelect;
export type NewAccountingReport = typeof accountingReports.$inferInsert;

export type CashBookEntry = typeof cashBookEntries.$inferSelect;
export type NewCashBookEntry = typeof cashBookEntries.$inferInsert;

export type PettyCashEntry = typeof pettyCashEntries.$inferSelect;
export type NewPettyCashEntry = typeof pettyCashEntries.$inferInsert;

export type TransactionJournal = typeof transactionJournal.$inferSelect;
export type NewTransactionJournal = typeof transactionJournal.$inferInsert;

export type ChartOfAccount = typeof chartOfAccounts.$inferSelect;
export type NewChartOfAccount = typeof chartOfAccounts.$inferInsert;

export type RevenueCategory = typeof revenueCategories.$inferSelect;
export type NewRevenueCategory = typeof revenueCategories.$inferInsert;

export type Revenue = typeof revenues.$inferSelect;
export type NewRevenue = typeof revenues.$inferInsert;

export type BusinessAlert = typeof businessAlerts.$inferSelect;
export type NewBusinessAlert = typeof businessAlerts.$inferInsert;

// Zod schemas for validation
export const userInsertSchema = createInsertSchema(users);
export const categoryInsertSchema = createInsertSchema(categories);
export const clientInsertSchema = createInsertSchema(clients);
export const productInsertSchema = createInsertSchema(products);
export const invoiceInsertSchema = createInsertSchema(invoices);
export const invoiceItemInsertSchema = createInsertSchema(invoiceItems);
export const expenseInsertSchema = createInsertSchema(expenses).omit({ 
  reference: true,
  id: true,
  createdAt: true,
  approvedBy: true,
  approvedAt: true 
});
export const revenueInsertSchema = createInsertSchema(revenues).omit({ 
  reference: true,
  id: true,
  createdAt: true 
});
export const insertAccountingReportSchema = createInsertSchema(accountingReports).omit({ 
  id: true,
  createdAt: true 
});
export const insertBusinessAlertSchema = createInsertSchema(businessAlerts);
export const insertCashBookEntrySchema = createInsertSchema(cashBookEntries);
export const insertPettyCashEntrySchema = createInsertSchema(pettyCashEntries);
export const insertImprestFundSchema = createInsertSchema(imprestFunds).omit({ 
  reference: true,
  currentBalance: true,
  id: true,
  createdAt: true,
  updatedAt: true 
});
export const insertExpenseCategorySchema = createInsertSchema(expenseCategories);
export const insertRevenueCategorySchema = createInsertSchema(revenueCategories);
export const insertChartOfAccountSchema = createInsertSchema(chartOfAccounts);

// Additional schemas
export const insertClientSchema = clientInsertSchema;
export const insertProductSchema = productInsertSchema;
export const insertCategorySchema = categoryInsertSchema;
export const insertInvoiceSchema = invoiceInsertSchema;
export const insertInvoiceItemSchema = invoiceItemInsertSchema;
export const insertLicenseSchema = createInsertSchema(licenses);
export const insertStockReplenishmentSchema = createInsertSchema(stockReplenishments);
export const insertImprestTransactionSchema = createInsertSchema(imprestTransactions);
export const insertTransactionJournalSchema = createInsertSchema(transactionJournal);

// Legacy aliases for compatibility
export const insertExpenseSchema = expenseInsertSchema;
export const insertRevenueSchema = revenueInsertSchema;