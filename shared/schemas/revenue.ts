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

// Revenue Categories - Catégories de revenus
export const revenueCategories = pgTable("revenue_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  userId: varchar("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Revenues - Enregistrement des revenus
export const revenues = pgTable("revenues", {
  id: serial("id").primaryKey(),
  reference: varchar("reference", { length: 100 }).notNull(),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  categoryId: integer("category_id").notNull().references(() => revenueCategories.id),
  revenueDate: timestamp("revenue_date").notNull(),
  paymentMethod: varchar("payment_method", { length: 50 }).notNull(), // cash, bank_transfer, check, card
  source: varchar("source", { length: 255 }), // Source du revenu (client, vente, service, etc.)
  receiptUrl: varchar("receipt_url", { length: 500 }),
  notes: text("notes"),
  userId: varchar("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});