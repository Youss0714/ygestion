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

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  userId: varchar("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  address: text("address"),
  company: varchar("company", { length: 255 }),
  userId: varchar("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  priceHT: decimal("price_ht", { precision: 15, scale: 2 }).notNull(), // Prix HT uniquement
  stock: integer("stock").default(0),
  alertStock: integer("alert_stock").default(10), // Seuil d'alerte pour le stock
  categoryId: integer("category_id").references(() => categories.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});