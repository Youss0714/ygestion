import {
  pgTable,
  text,
  varchar,
  timestamp,
  serial,
  decimal,
  integer,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";
import { users } from "./auth";
import { chartOfAccounts } from "./chart-of-accounts";

export const expenseCategories = pgTable("expense_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  isMajor: boolean("is_major").default(false), // true for major expenses, false for minor
  userId: varchar("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const imprestFunds = pgTable("imprest_funds", {
  id: serial("id").primaryKey(),
  reference: varchar("reference", { length: 100 }).notNull().unique(),
  accountHolder: varchar("account_holder", { length: 255 }).notNull(), // Détenteur du compte
  initialAmount: decimal("initial_amount", { precision: 15, scale: 2 }).notNull(),
  currentBalance: decimal("current_balance", { precision: 15, scale: 2 }).notNull(),
  purpose: text("purpose").notNull(), // Objectif du fonds
  status: varchar("status", { length: 50 }).notNull().default("active"), // active, suspended, closed
  userId: varchar("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  reference: varchar("reference", { length: 100 }).notNull(), // Référence unique
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  categoryId: integer("category_id").notNull().references(() => expenseCategories.id),
  accountId: integer("account_id").references(() => chartOfAccounts.id), // Lien vers le plan comptable
  expenseDate: timestamp("expense_date").notNull(),
  paymentMethod: varchar("payment_method", { length: 50 }).notNull(), // cash, bank_transfer, check, card
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, approved, paid, rejected
  receiptUrl: varchar("receipt_url", { length: 500 }), // URL du reçu/justificatif
  notes: text("notes"),
  imprestId: integer("imprest_id").references(() => imprestFunds.id), // Lien vers le fonds d'avance
  userId: varchar("user_id").notNull().references(() => users.id),
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const imprestTransactions = pgTable("imprest_transactions", {
  id: serial("id").primaryKey(),
  reference: varchar("reference", { length: 100 }).notNull(),
  imprestId: integer("imprest_id").notNull().references(() => imprestFunds.id),
  type: varchar("type", { length: 50 }).notNull(), // deposit, withdrawal, expense
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  description: text("description").notNull(),
  balanceAfter: decimal("balance_after", { precision: 15, scale: 2 }).notNull(),
  expenseId: integer("expense_id").references(() => expenses.id), // Lié à une dépense si applicable
  receiptUrl: varchar("receipt_url", { length: 500 }),
  notes: text("notes"),
  userId: varchar("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const accountingReports = pgTable("accounting_reports", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // expense_summary, imprest_summary, monthly_report, yearly_report
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  data: jsonb("data").notNull(), // Données du rapport en JSON
  generatedBy: varchar("generated_by").notNull().references(() => users.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});