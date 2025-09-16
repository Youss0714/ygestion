import {
  pgTable,
  text,
  varchar,
  timestamp,
  serial,
  integer,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";
import { users } from "./auth";

// Business Alerts table
export const businessAlerts = pgTable("business_alerts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type", { length: 50 }).notNull(), // 'low_stock', 'overdue_invoice', 'critical_stock', 'payment_due'
  severity: varchar("severity", { length: 20 }).default("medium"), // 'low', 'medium', 'high', 'critical'
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  entityType: varchar("entity_type", { length: 50 }), // 'product', 'invoice', 'client'
  entityId: integer("entity_id"), // ID de l'entité concernée
  metadata: jsonb("metadata"), // Données additionnelles (stock level, due date, etc.)
  isRead: boolean("is_read").default(false),
  isResolved: boolean("is_resolved").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});