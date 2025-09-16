-- YGestion - Database Schema for PostgreSQL
-- Application complète de gestion d'entreprise pour le marché africain
-- Support des devises XOF et GHS, multi-langue (français/anglais)

-- This schema is managed by Drizzle ORM
-- Use 'npm run db:push' to apply changes to the database

-- Core tables structure (managed by Drizzle):
-- - sessions: User session storage
-- - users: Main user management with business profile
-- - categories: Product categories
-- - clients: Customer management
-- - products: Product catalog with stock management
-- - invoices: Invoice management with multi-currency support
-- - invoice_items: Invoice line items
-- - sales: Sales tracking
-- - stock_replenishments: Inventory replenishment tracking
-- - licenses: Software license activation system

-- Accounting module tables:
-- - expense_categories: Expense categorization
-- - expenses: Expense tracking with approval workflow
-- - imprest_funds: Imprest fund management
-- - imprest_transactions: Imprest fund transactions
-- - accounting_reports: Generated reports
-- - cash_book_entries: Main cash book transactions
-- - petty_cash_entries: Petty cash management
-- - transaction_journal: Complete transaction history
-- - chart_of_accounts: OHADA-compliant chart of accounts
-- - revenue_categories: Revenue categorization
-- - revenues: Revenue tracking
-- - business_alerts: Automated business alerts

-- Note: This file is for reference only.
-- The actual schema is defined in shared/schema.ts using Drizzle ORM.
-- Run 'npm run db:push' to sync schema changes to the database.