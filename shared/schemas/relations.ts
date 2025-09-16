import { relations } from "drizzle-orm";

// Import all tables
import { users, sessions } from "./auth";
import { licenses } from "./licenses";
import { categories, clients, products } from "./core";
import { invoices, invoiceItems, sales } from "./invoicing";
import { stockReplenishments } from "./inventory";
import { expenseCategories, expenses, imprestFunds, imprestTransactions, accountingReports } from "./accounting";
import { cashBookEntries, pettyCashEntries, transactionJournal } from "./treasury";
import { chartOfAccounts } from "./chart-of-accounts";
import { revenueCategories, revenues } from "./revenue";
import { businessAlerts } from "./alerts";

// User relations
export const usersRelations = relations(users, ({ many }) => ({
  clients: many(clients),
  products: many(products),
  categories: many(categories),
  invoices: many(invoices),
  sales: many(sales),
  stockReplenishments: many(stockReplenishments),
  expenseCategories: many(expenseCategories),
  expenses: many(expenses),
  imprestFunds: many(imprestFunds),
  imprestTransactions: many(imprestTransactions),
  accountingReports: many(accountingReports),
  cashBookEntries: many(cashBookEntries),
  pettyCashEntries: many(pettyCashEntries),
  transactionJournal: many(transactionJournal),
  revenueCategories: many(revenueCategories),
  revenues: many(revenues),
  chartOfAccounts: many(chartOfAccounts),
  businessAlerts: many(businessAlerts),
}));

// License relations
export const licensesRelations = relations(licenses, ({ }) => ({}));

// Core module relations
export const categoriesRelations = relations(categories, ({ one, many }) => ({
  user: one(users, {
    fields: [categories.userId],
    references: [users.id],
  }),
  products: many(products),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  user: one(users, {
    fields: [clients.userId],
    references: [users.id],
  }),
  invoices: many(invoices),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  user: one(users, {
    fields: [products.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  invoiceItems: many(invoiceItems),
  sales: many(sales),
  replenishments: many(stockReplenishments),
}));

// Invoicing relations
export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  user: one(users, {
    fields: [invoices.userId],
    references: [users.id],
  }),
  client: one(clients, {
    fields: [invoices.clientId],
    references: [clients.id],
  }),
  items: many(invoiceItems),
  sales: many(sales),
}));

export const invoiceItemsRelations = relations(invoiceItems, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceItems.invoiceId],
    references: [invoices.id],
  }),
  product: one(products, {
    fields: [invoiceItems.productId],
    references: [products.id],
  }),
}));

export const salesRelations = relations(sales, ({ one }) => ({
  user: one(users, {
    fields: [sales.userId],
    references: [users.id],
  }),
  invoice: one(invoices, {
    fields: [sales.invoiceId],
    references: [invoices.id],
  }),
  product: one(products, {
    fields: [sales.productId],
    references: [products.id],
  }),
}));

// Inventory relations
export const stockReplenishmentsRelations = relations(stockReplenishments, ({ one }) => ({
  user: one(users, {
    fields: [stockReplenishments.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [stockReplenishments.productId],
    references: [products.id],
  }),
}));

// Accounting relations
export const expenseCategoriesRelations = relations(expenseCategories, ({ one, many }) => ({
  user: one(users, {
    fields: [expenseCategories.userId],
    references: [users.id],
  }),
  expenses: many(expenses),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  user: one(users, {
    fields: [expenses.userId],
    references: [users.id],
  }),
  category: one(expenseCategories, {
    fields: [expenses.categoryId],
    references: [expenseCategories.id],
  }),
  account: one(chartOfAccounts, {
    fields: [expenses.accountId],
    references: [chartOfAccounts.id],
  }),
  imprestFund: one(imprestFunds, {
    fields: [expenses.imprestId],
    references: [imprestFunds.id],
  }),
  approver: one(users, {
    fields: [expenses.approvedBy],
    references: [users.id],
  }),
}));

export const imprestFundsRelations = relations(imprestFunds, ({ one, many }) => ({
  user: one(users, {
    fields: [imprestFunds.userId],
    references: [users.id],
  }),
  transactions: many(imprestTransactions),
}));

export const imprestTransactionsRelations = relations(imprestTransactions, ({ one }) => ({
  user: one(users, {
    fields: [imprestTransactions.userId],
    references: [users.id],
  }),
  imprestFund: one(imprestFunds, {
    fields: [imprestTransactions.imprestId],
    references: [imprestFunds.id],
  }),
  expense: one(expenses, {
    fields: [imprestTransactions.expenseId],
    references: [expenses.id],
  }),
}));

export const accountingReportsRelations = relations(accountingReports, ({ one }) => ({
  user: one(users, {
    fields: [accountingReports.userId],
    references: [users.id],
  }),
  generatedBy: one(users, {
    fields: [accountingReports.generatedBy],
    references: [users.id],
  }),
}));

// Treasury relations
export const cashBookEntriesRelations = relations(cashBookEntries, ({ one }) => ({
  user: one(users, {
    fields: [cashBookEntries.userId],
    references: [users.id],
  }),
}));

export const pettyCashEntriesRelations = relations(pettyCashEntries, ({ one }) => ({
  user: one(users, {
    fields: [pettyCashEntries.userId],
    references: [users.id],
  }),
  approver: one(users, {
    fields: [pettyCashEntries.approvedBy],
    references: [users.id],
  }),
}));

export const transactionJournalRelations = relations(transactionJournal, ({ one }) => ({
  user: one(users, {
    fields: [transactionJournal.userId],
    references: [users.id],
  }),
  creator: one(users, {
    fields: [transactionJournal.createdBy],
    references: [users.id],
  }),
}));

// Chart of accounts relations
export const chartOfAccountsRelations = relations(chartOfAccounts, ({ one, many }) => ({
  user: one(users, {
    fields: [chartOfAccounts.userId],
    references: [users.id],
  }),
  expenses: many(expenses),
}));

// Revenue relations
export const revenueCategoriesRelations = relations(revenueCategories, ({ one, many }) => ({
  user: one(users, {
    fields: [revenueCategories.userId],
    references: [users.id],
  }),
  revenues: many(revenues),
}));

export const revenuesRelations = relations(revenues, ({ one }) => ({
  user: one(users, {
    fields: [revenues.userId],
    references: [users.id],
  }),
  category: one(revenueCategories, {
    fields: [revenues.categoryId],
    references: [revenueCategories.id],
  }),
}));

// Alert relations
export const businessAlertsRelations = relations(businessAlerts, ({ one }) => ({
  user: one(users, {
    fields: [businessAlerts.userId],
    references: [users.id],
  }),
}));