import {
  pgTable,
  text,
  varchar,
  timestamp,
  serial,
  decimal,
  integer,
} from "drizzle-orm/pg-core";
import { users } from "./auth";
import { clients, products } from "./core";

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  number: varchar("number", { length: 50 }).notNull(),
  clientId: integer("client_id").notNull().references(() => clients.id),
  status: varchar("status", { length: 50 }).notNull().default("en_attente"), // en_attente, payee, partiellement_reglee
  totalHT: decimal("total_ht", { precision: 15, scale: 2 }).notNull(), // Total HT
  tvaRate: decimal("tva_rate", { precision: 5, scale: 2 }).notNull(), // Taux TVA choisi (3%, 5%, 10%, 15%, 18%, 21%)
  totalTVA: decimal("total_tva", { precision: 15, scale: 2 }).notNull(), // Montant TVA calculé
  totalTTC: decimal("total_ttc", { precision: 15, scale: 2 }).notNull(), // Total TTC final
  paymentMethod: varchar("payment_method", { length: 50 }).notNull().default("cash"), // cash, bank_transfer, check, card, mobile_money
  dueDate: timestamp("due_date"),
  notes: text("notes"),
  userId: varchar("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const invoiceItems = pgTable("invoice_items", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").notNull().references(() => invoices.id),
  productId: integer("product_id").references(() => products.id),
  productName: varchar("product_name", { length: 255 }).notNull(),
  quantity: integer("quantity").notNull(),
  priceHT: decimal("price_ht", { precision: 15, scale: 2 }).notNull(), // Prix HT unitaire
  totalHT: decimal("total_ht", { precision: 15, scale: 2 }).notNull(), // Total HT ligne (quantity * priceHT)
});

export const sales = pgTable("sales", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").notNull().references(() => invoices.id),
  productId: integer("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 15, scale: 2 }).notNull(),
  total: decimal("total", { precision: 15, scale: 2 }).notNull(),
  userId: varchar("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});