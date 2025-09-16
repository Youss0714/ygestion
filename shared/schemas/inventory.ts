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
import { products } from "./core";

// Table pour gérer les réapprovisionnements de stock
export const stockReplenishments = pgTable("stock_replenishments", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull(),
  costPerUnit: decimal("cost_per_unit", { precision: 15, scale: 2 }), // Coût d'achat par unité
  totalCost: decimal("total_cost", { precision: 15, scale: 2 }), // Coût total du réapprovisionnement
  supplier: varchar("supplier", { length: 255 }), // Nom du fournisseur
  reference: varchar("reference", { length: 100 }), // Référence de la commande/livraison
  notes: text("notes"), // Notes sur le réapprovisionnement
  userId: varchar("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});