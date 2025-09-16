// Tax rates available for invoices
export const TAX_RATES = [
  { value: "0.00", label: "Aucune (0%)" },
  { value: "3.00", label: "3%" },
  { value: "5.00", label: "5%" },
  { value: "10.00", label: "10%" },
  { value: "15.00", label: "15%" },
  { value: "18.00", label: "18%" },
  { value: "21.00", label: "21%" },
] as const;

// Invoice status options
export const INVOICE_STATUS = [
  { value: "en_attente", label: "En attente", icon: "⏳", color: "bg-yellow-100 text-yellow-800" },
  { value: "payee", label: "Payée", icon: "✅", color: "bg-green-100 text-green-800" },
  { value: "partiellement_reglee", label: "Partiellement réglée", icon: "💳", color: "bg-blue-100 text-blue-800" },
] as const;

// Accounting constants
export const EXPENSE_STATUS = [
  { value: "pending", label: "En attente", icon: "⏳", color: "bg-yellow-100 text-yellow-800" },
  { value: "approved", label: "Approuvée", icon: "✅", color: "bg-blue-100 text-blue-800" },
  { value: "paid", label: "Payée", icon: "💰", color: "bg-green-100 text-green-800" },
  { value: "rejected", label: "Rejetée", icon: "❌", color: "bg-red-100 text-red-800" },
] as const;

// Payment methods
export const PAYMENT_METHODS = [
  { value: "cash", label: "Espèces", icon: "💵" },
  { value: "bank_transfer", label: "Virement bancaire", icon: "🏦" },
  { value: "check", label: "Chèque", icon: "🧾" },
  { value: "card", label: "Carte", icon: "💳" },
  { value: "mobile_money", label: "Mobile Money", icon: "📱" },
] as const;

// Account types for chart of accounts
export const ACCOUNT_TYPES = [
  { value: "asset", label: "Actif" },
  { value: "liability", label: "Passif" },
  { value: "equity", label: "Capitaux propres" },
  { value: "revenue", label: "Revenus" },
  { value: "expense", label: "Charges" },
] as const;

// Alert types
export const ALERT_TYPES = [
  { value: "low_stock", label: "Stock faible", severity: "medium" },
  { value: "critical_stock", label: "Stock critique", severity: "high" },
  { value: "overdue_invoice", label: "Facture en retard", severity: "high" },
  { value: "payment_due", label: "Paiement dû", severity: "medium" },
] as const;

// Severity levels
export const SEVERITY_LEVELS = [
  { value: "low", label: "Faible", color: "bg-gray-100 text-gray-800" },
  { value: "medium", label: "Moyen", color: "bg-yellow-100 text-yellow-800" },
  { value: "high", label: "Élevé", color: "bg-orange-100 text-orange-800" },
  { value: "critical", label: "Critique", color: "bg-red-100 text-red-800" },
] as const;

// Imprest fund status
export const IMPREST_STATUS = [
  { value: "active", label: "Actif", icon: "✅", color: "bg-green-100 text-green-800" },
  { value: "suspended", label: "Suspendu", icon: "⏸️", color: "bg-orange-100 text-orange-800" },
  { value: "closed", label: "Fermé", icon: "🔒", color: "bg-red-100 text-red-800" },
] as const;

// Imprest transaction types
export const IMPREST_TRANSACTION_TYPES = [
  { value: "deposit", label: "Dépôt", icon: "⬇️", color: "bg-green-100 text-green-800" },
  { value: "withdrawal", label: "Retrait", icon: "⬆️", color: "bg-blue-100 text-blue-800" },
  { value: "expense", label: "Dépense", icon: "💰", color: "bg-red-100 text-red-800" },
] as const;

// Report types
export const REPORT_TYPES = [
  { value: "expense_summary", label: "Résumé des dépenses" },
  { value: "imprest_summary", label: "Résumé des avances" },
  { value: "monthly_report", label: "Rapport mensuel" },
  { value: "yearly_report", label: "Rapport annuel" },
] as const;

// Cash book types
export const CASH_BOOK_TYPES = [
  { value: "income", label: "Recette", icon: "⬇️", color: "bg-green-100 text-green-800" },
  { value: "expense", label: "Dépense", icon: "⬆️", color: "bg-red-100 text-red-800" },
  { value: "transfer", label: "Transfert", icon: "↔️", color: "bg-blue-100 text-blue-800" },
] as const;