import {
  pgTable,
  text,
  varchar,
  timestamp,
  serial,
  decimal,
  integer,
  boolean,
  date,
} from "drizzle-orm/pg-core";
import { users } from "./auth";

// Main Cash Book - Transactions principales (revenus, achats, transferts)
export const cashBookEntries = pgTable("cash_book_entries", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  reference: varchar("reference", { length: 100 }).notNull(),
  date: date("date").notNull(),
  description: text("description").notNull(),
  type: varchar("type", { length: 20 }).notNull(), // 'income', 'expense', 'transfer'
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  account: varchar("account", { length: 100 }).notNull(), // Compte concerné
  counterparty: varchar("counterparty", { length: 255 }), // Contrepartie
  category: varchar("category", { length: 100 }),
  paymentMethod: varchar("payment_method", { length: 50 }).notNull(),
  receiptNumber: varchar("receipt_number", { length: 100 }),
  notes: text("notes"),
  isReconciled: boolean("is_reconciled").default(false),
  reconciledAt: timestamp("reconciled_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Petty Cash - Petites dépenses quotidiennes avec justificatifs
export const pettyCashEntries = pgTable("petty_cash_entries", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  date: date("date").notNull(),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 8, scale: 2 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  recipient: varchar("recipient", { length: 255 }),
  purpose: text("purpose"),
  receiptNumber: varchar("receipt_number", { length: 50 }),
  approvedBy: varchar("approved_by").references(() => users.id),
  status: varchar("status", { length: 20 }).default("pending").notNull(), // 'pending', 'approved', 'rejected'
  justification: text("justification"), // Justificatifs attachés
  runningBalance: decimal("running_balance", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Transaction Journal - Historique complet des opérations avec filtres
export const transactionJournal = pgTable("transaction_journal", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  entryDate: timestamp("entry_date").defaultNow().notNull(),
  transactionDate: timestamp("transaction_date").notNull(),
  reference: varchar("reference", { length: 100 }).notNull(),
  description: text("description").notNull(),
  sourceModule: varchar("source_module", { length: 50 }).notNull(), // 'cash_book', 'petty_cash', 'expenses', 'imprest'
  sourceId: integer("source_id").notNull(), // ID de l'enregistrement source
  debitAccount: varchar("debit_account", { length: 100 }),
  creditAccount: varchar("credit_account", { length: 100 }),
  debitAmount: decimal("debit_amount", { precision: 12, scale: 2 }),
  creditAmount: decimal("credit_amount", { precision: 12, scale: 2 }),
  runningBalance: decimal("running_balance", { precision: 12, scale: 2 }),
  createdBy: varchar("created_by").notNull().references(() => users.id),
});