import {
  pgTable,
  varchar,
  timestamp,
  serial,
  boolean,
} from "drizzle-orm/pg-core";

// Licenses table for activation system
export const licenses = pgTable("licenses", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  activated: boolean("activated").default(false),
  clientName: varchar("client_name", { length: 255 }),
  deviceId: varchar("device_id", { length: 255 }),
  createdBy: varchar("created_by", { length: 255 }).notNull(),
  activatedAt: timestamp("activated_at"),
  revokedAt: timestamp("revoked_at"),
  createdAt: timestamp("created_at").defaultNow(),
});