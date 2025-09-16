import {
  pgTable,
  text,
  varchar,
  timestamp,
  serial,
  boolean,
} from "drizzle-orm/pg-core";
import { users } from "./auth";

// Chart of Accounts - Plan comptable général  
export const chartOfAccounts = pgTable("chart_of_accounts", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 20 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  accountType: varchar("account_type", { length: 50 }).notNull(), // asset, liability, equity, revenue, expense
  parentCode: varchar("parent_code", { length: 20 }),
  isActive: boolean("is_active").default(true),
  description: text("description"),
  userId: varchar("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});