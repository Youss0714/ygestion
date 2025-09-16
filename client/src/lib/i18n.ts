// Système de traduction pour l'application
export type Language = 'fr' | 'en';

export interface Translations {
  // Navigation
  dashboard: string;
  clients: string;
  products: string;
  categories: string;
  invoices: string;
  sales: string;
  settings: string;
  export: string;
  logout: string;

  // Actions communes
  create: string;
  edit: string;
  delete: string;
  save: string;
  cancel: string;
  search: string;
  loading: string;
  
  // Dashboard
  revenue: string;
  invoiceCount: string;
  clientCount: string;
  productCount: string;
  recentInvoices: string;
  topProducts: string;
  quickActions: string;
  generateReport: string;
  exportData: string;
  viewAll: string;
  amount: string;
  date: string;
  actions: string;
  unknownClient: string;
  noSalesRecorded: string;
  sold: string;
  activeClients: string;
  newThisMonth: string;
  noNewClients: string;
  stockAlerts: string;
  vsLastMonth: string;
  noPreviousData: string;
  thisWeek: string;
  noRecentInvoices: string;
  bestSellingProducts: string;
  
  // Clients
  clientName: string;
  email: string;
  phone: string;
  address: string;
  company: string;
  newClient: string;
  editClient: string;
  searchClient: string;
  noClient: string;
  noClientFound: string;
  addFirstClient: string;
  tryModifySearch: string;
  manageClients: string;
  clientCreated: string;
  clientCreatedDesc: string;
  clientModified: string;
  clientModifiedDesc: string;
  clientDeleted: string;
  clientDeletedDesc: string;
  confirmDeleteClient: string;
  errorCreateClient: string;
  errorUpdateClient: string;
  errorDeleteClient: string;
  unauthorized: string;
  unauthorizedDesc: string;
  lastSync: string;
  minutesAgo: string;
  fullName: string;
  createdOn: string;

  // Invoices
  newInvoice: string;
  manageInvoices: string;
  searchInvoice: string;
  noInvoice: string;
  noInvoiceFound: string;
  createFirstInvoice: string;
  tryModifyFilters: string;
  allStatuses: string;
  invoiceNumber: string;
  client: string;
  status: string;
  dueDate: string;
  createInvoice: string;
  editInvoice: string;
  invoiceDetails: string;
  product: string;
  quantity: string;
  unitPrice: string;
  total: string;
  addProduct: string;
  taxRate: string;
  subtotal: string;
  tax: string;
  totalAmount: string;
  paymentMethod: string;
  notes: string;
  invoiceCreated: string;
  invoiceCreatedDesc: string;
  invoiceModified: string;
  invoiceModifiedDesc: string;
  invoiceDeleted: string;
  invoiceDeletedDesc: string;
  confirmDeleteInvoice: string;
  errorCreateInvoice: string;
  errorUpdateInvoice: string;
  errorDeleteInvoice: string;
  
  // Products
  productName: string;
  description: string;
  price: string;
  stock: string;
  category: string;
  newProduct: string;
  editProduct: string;
  
  // Invoice Status
  pending: string;
  paid: string;
  overdue: string;
  
  // Settings
  language: string;
  currency: string;
  profile: string;
  preferences: string;

  personalInfo: string;
  updateProfile: string;
  profileFirstName: string;
  profileLastName: string;
  profilePhone: string;
  profileCompany: string;
  profilePosition: string;
  profileAddress: string;
  profileBusinessType: string;
  
  // Messages
  success: string;
  error: string;
  confirmDelete: string;
  noData: string;
  
  // Accounting
  accounting: string;
  manageFinances: string;
  totalExpenses: string;
  pendingExpenses: string;
  approvedExpenses: string;
  totalImprestFunds: string;
  activeImprestFunds: string;
  totalRevenues: string;
  monthlyRevenues: string;
  recentRevenues: string;
  netResult: string;
  filterByPeriod: string;
  from: string;
  to: string;
  clear: string;
  
  // Accounting cards and tabs
  awaiting: string;
  approved: string;
  imprestFunds: string;
  expensesToApprove: string;
  validatedExpenses: string;
  activeFunds: string;
  benefit: string;
  revenuesMinusExpenses: string;
  selectedPeriod: string;
  displaying: string;
  
  // Tabs
  expenses: string;
  revenues: string;
  reports: string;
  
  // Expense Management
  expenseManagement: string;
  createManageExpenses: string;
  expenseList: string;
  manageBusinessExpenses: string;
  downloadCsv: string;
  newExpense: string;
  
  // Alerts
  alerts: string;
  lowStock: string;
  criticalStock: string;
  overdueInvoice: string;
  paymentDue: string;
  markAsRead: string;
  markAllAsRead: string;
  deleteAlert: string;
  severity: string;
  type: string;
  message: string;
  createdAt: string;
  
  // Landing page
  appTitle: string;
  appDescription: string;
  loginButton: string;
  createAccountButton: string;
  newUserText: string;
  clientManagement: string;
  clientManagementDesc: string;
  productCatalog: string;
  productCatalogDesc: string;
  invoicing: string;
  invoicingDesc: string;
  reporting: string;
  reportingDesc: string;
  whyChoose: string;
  modernInterface: string;
  modernInterfaceDesc: string;
  secure: string;
  secureDesc: string;
  dashboardTitle: string;
  dashboardDesc: string;
  readyToOptimize: string;
  joinCompanies: string;
  startNow: string;
}

export const translations: Record<Language, Translations> = {
  fr: {
    // Navigation
    dashboard: "Tableau de bord",
    clients: "Clients",
    products: "Produits",
    categories: "Catégories", 
    invoices: "Factures",
    sales: "Ventes",
    settings: "Paramètres",
    export: "Export",
    logout: "Déconnexion",

    // Actions communes
    create: "Créer",
    edit: "Modifier",
    delete: "Supprimer",
    save: "Enregistrer",
    cancel: "Annuler",
    search: "Rechercher",
    loading: "Chargement...",
    
    // Dashboard
    revenue: "Chiffre d'affaires",
    invoiceCount: "Factures",
    clientCount: "Clients",
    productCount: "Produits",
    recentInvoices: "Factures récentes",
    topProducts: "Produits populaires",
    quickActions: "Actions Rapides",
    generateReport: "Générer Rapport",
    exportData: "Exporter Données",
    viewAll: "Voir toutes",
    amount: "Montant",
    date: "Date",
    actions: "Actions",
    unknownClient: "Client inconnu",
    noSalesRecorded: "Aucune vente enregistrée",
    sold: "vendus",
    activeClients: "Clients Actifs",
    newThisMonth: "nouveaux ce mois",
    noNewClients: "Aucun nouveau client",
    stockAlerts: "ruptures de stock",
    vsLastMonth: "vs mois dernier",
    noPreviousData: "Aucune donnée précédente",
    thisWeek: "cette semaine",
    noRecentInvoices: "Aucune facture récente",
    bestSellingProducts: "Produits les Plus Vendus",
    
    // Clients
    clientName: "Nom du client",
    email: "Email",
    phone: "Téléphone",
    address: "Adresse",
    company: "Entreprise",
    newClient: "Nouveau Client",
    editClient: "Modifier le Client",
    searchClient: "Rechercher un client...",
    noClient: "Aucun client",
    noClientFound: "Aucun client trouvé",
    addFirstClient: "Commencez par ajouter votre premier client.",
    tryModifySearch: "Essayez de modifier votre recherche.",
    manageClients: "Gérez vos clients et leurs informations",
    clientCreated: "Client créé",
    clientCreatedDesc: "Le client a été créé avec succès.",
    clientModified: "Client modifié",
    clientModifiedDesc: "Le client a été modifié avec succès.",
    clientDeleted: "Client supprimé",
    clientDeletedDesc: "Le client a été supprimé avec succès.",
    confirmDeleteClient: "Êtes-vous sûr de vouloir supprimer ce client ?",
    errorCreateClient: "Impossible de créer le client.",
    errorUpdateClient: "Impossible de modifier le client.",
    errorDeleteClient: "Impossible de supprimer le client.",
    unauthorized: "Non autorisé",
    unauthorizedDesc: "Vous êtes déconnecté. Reconnexion...",
    lastSync: "Dernière synchronisation",
    minutesAgo: "Il y a 2 minutes",
    fullName: "Nom complet",
    createdOn: "Créé le",

    // Invoices
    newInvoice: "Nouvelle Facture",
    manageInvoices: "Gérez vos factures et paiements",
    searchInvoice: "Rechercher une facture...",
    noInvoice: "Aucune facture",
    noInvoiceFound: "Aucune facture trouvée",
    createFirstInvoice: "Commencez par créer votre première facture.",
    tryModifyFilters: "Essayez de modifier vos filtres.",
    allStatuses: "Tous les statuts",
    invoiceNumber: "Numéro",
    client: "Client",
    dueDate: "Date d'échéance",
    createInvoice: "Créer une facture",
    editInvoice: "Modifier la facture",
    invoiceDetails: "Détails de la facture",
    product: "Produit",
    quantity: "Quantité",
    unitPrice: "Prix unitaire HT",
    total: "Total",
    addProduct: "Ajouter un produit",
    taxRate: "Taux de TVA",
    subtotal: "Sous-total",
    tax: "TVA",
    totalAmount: "Total TTC",
    paymentMethod: "Mode de paiement",
    notes: "Notes",
    searchOrCreateClient: "Rechercher ou créer un client...",
    selectStatus: "Sélectionner statut",
    selectTaxRate: "Sélectionner TVA",
    selectPaymentMethod: "Sélectionner le moyen de paiement",
    productsServices: "Produits/Services",
    priceHT: "Prix HT",
    searchProduct: "Rechercher un produit...",
    productServiceName: "Nom du produit/service",
    addLine: "Ajouter une ligne",
    additionalNotes: "Notes additionnelles",
    totalHT: "Total HT",
    tva: "TVA",
    totalTTC: "Total TTC",
    creating: "Création",
    invoiceCreated: "Facture créée",
    invoiceCreatedDesc: "La facture a été créée avec succès.",
    invoiceModified: "Facture modifiée",
    invoiceModifiedDesc: "La facture a été modifiée avec succès.",
    invoiceDeleted: "Facture supprimée",
    invoiceDeletedDesc: "La facture a été supprimée avec succès.",
    confirmDeleteInvoice: "Êtes-vous sûr de vouloir supprimer cette facture ?",
    errorCreateInvoice: "Impossible de créer la facture.",
    errorUpdateInvoice: "Impossible de modifier la facture.",
    errorDeleteInvoice: "Impossible de supprimer la facture.",
    
    // Products
    manageProducts: "Gérez votre catalogue de produits",
    productName: "Nom du produit",
    description: "Description",
    price: "Prix",
    stock: "Stock",
    category: "Catégorie",
    newProduct: "Nouveau Produit",
    editProduct: "Modifier le Produit",
    noProduct: "Aucun produit",
    noProductFound: "Aucun produit trouvé",
    addFirstProduct: "Commencez par ajouter votre premier produit.",
    noCategory: "Sans catégorie",
    unknownCategory: "Catégorie inconnue",
    outOfStock: "Rupture",
    lowStock: "Stock faible",
    inStock: "En stock",
    productCreated: "Produit créé",
    productCreatedDesc: "Le produit a été créé avec succès.",
    productModified: "Produit modifié",
    productModifiedDesc: "Le produit a été modifié avec succès.",
    productDeleted: "Produit supprimé",
    productDeletedDesc: "Le produit a été supprimé avec succès.",
    errorCreateProduct: "Impossible de créer le produit.",
    errorUpdateProduct: "Impossible de modifier le produit.",
    errorDeleteProduct: "Impossible de supprimer le produit.",
    replenishmentAdded: "Réapprovisionnement ajouté",
    replenishmentAddedDesc: "Le stock a été réapprovisionné avec succès.",
    errorAddReplenishment: "Impossible d'ajouter le réapprovisionnement.",
    replenishStock: "Réapprovisionner le stock",
    replenishmentHistory: "Historique des réapprovisionnements",
    deleteProduct: "Supprimer le produit",
    productNamePlaceholder: "Attiéké complet",
    descriptionPlaceholder: "Plat traditionnel ivoirien à base de manioc",
    selectCategory: "Sélectionner une catégorie",
    stockAlertThreshold: "Seuil d'alerte stock",
    stockManagedAutomatically: "Le stock est géré automatiquement via les réapprovisionnements et les ventes",
    modify: "Modifier",
    units: "unités",
    
    // Invoice Status
    pending: "En attente",
    paid: "Payée",
    overdue: "En retard",
    
    // Settings
    language: "Langue",
    currency: "Devise",
    profile: "Profil",
    preferences: "Préférences",

    personalInfo: "Informations personnelles",
    updateProfile: "Mettre à jour le profil",
    profileFirstName: "Prénom",
    profileLastName: "Nom",
    profilePhone: "Téléphone",
    profileCompany: "Entreprise",
    profilePosition: "Poste",
    profileAddress: "Adresse",
    profileBusinessType: "Type d'activité",
    
    // Messages
    success: "Succès",
    error: "Erreur",
    confirmDelete: "Êtes-vous sûr de vouloir supprimer cet élément ?",
    noData: "Aucune donnée disponible",
    
    // Accounting
    accounting: "Comptabilité",
    manageFinances: "Gérez vos finances, dépenses et avances en toute sécurité",
    totalExpenses: "Dépenses totales",
    pendingExpenses: "Dépenses en attente",
    approvedExpenses: "Dépenses approuvées",
    totalImprestFunds: "Fonds d'avance totaux",
    activeImprestFunds: "Fonds d'avance actifs",
    totalRevenues: "Revenus totaux",
    monthlyRevenues: "Revenus mensuels",
    recentRevenues: "Revenus récents",
    netResult: "Résultat net",
    filterByPeriod: "Filtrer par période",
    from: "Du",
    to: "Au",
    clear: "Effacer",
    
    // Cartes et onglets comptabilité
    awaiting: "En attente",
    approved: "Approuvées",
    imprestFunds: "Fonds d'avance",
    expensesToApprove: "Dépenses à approuver",
    validatedExpenses: "Dépenses validées",
    activeFunds: "fonds actifs",
    benefit: "Bénéfice",
    revenuesMinusExpenses: "Revenus - Dépenses",
    selectedPeriod: "Période sélectionnée",
    displaying: "Affichage des statistiques du",
    
    // Onglets
    expenses: "Dépenses",
    revenues: "Revenus",
    reports: "Reports",
    
    // Gestion des dépenses
    expenseManagement: "Gestion des dépenses",
    createManageExpenses: "Créez et gérez toutes vos dépenses d'entreprise",
    expenseList: "Liste des dépenses",
    manageBusinessExpenses: "Gérez toutes vos dépenses d'entreprise",
    downloadCsv: "Télécharger CSV",
    newExpense: "Nouvelle dépense",
    
    // Alerts
    alerts: "Alertes",
    criticalStock: "Rupture de stock",
    overdueInvoice: "Facture échue",
    paymentDue: "Paiement dû",
    markAsRead: "Marquer comme lu",
    markAllAsRead: "Marquer toutes comme lues",
    deleteAlert: "Supprimer l'alerte",
    severity: "Sévérité",
    type: "Type",
    message: "Message",
    createdAt: "Créé le",
    
    // Landing page
    appTitle: "YGestion",
    appDescription: "Application complète de gestion commerciale pour optimiser vos ventes, gérer vos clients et suivre votre activité en temps réel.",
    loginButton: "Se connecter",
    createAccountButton: "Créer un compte",
    newUserText: "Nouveau sur YGestion ? Créez votre compte et complétez votre profil pour commencer.",
    clientManagement: "Gestion des Clients",
    clientManagementDesc: "Centralisez toutes les informations de vos clients et leur historique d'achat.",
    productCatalog: "Catalogue Produits",
    productCatalogDesc: "Organisez vos produits par catégories et suivez vos stocks en temps réel.",
    invoicing: "Facturation",
    invoicingDesc: "Créez et gérez vos factures facilement avec génération PDF automatique.",
    reporting: "Reporting",
    reportingDesc: "Analysez vos performances avec des rapports détaillés et des exports CSV.",
    whyChoose: "Pourquoi choisir YGestion ?",
    modernInterface: "Interface Moderne",
    modernInterfaceDesc: "Interface intuitive et responsive, accessible depuis n'importe quel appareil.",
    secure: "Sécurisé",
    secureDesc: "Authentification sécurisée et données protégées avec chiffrement.",
    dashboardTitle: "Tableau de Bord",
    dashboardDesc: "Visualisez vos KPIs et suivez l'évolution de votre activité en temps réel.",
    readyToOptimize: "Prêt à optimiser votre gestion commerciale ?",
    joinCompanies: "Rejoignez les entreprises qui font confiance à YGestion pour leur croissance.",
    startNow: "Démarrer maintenant",
  },
  
  en: {
    // Navigation
    dashboard: "Dashboard",
    clients: "Clients",
    products: "Products",
    categories: "Categories",
    invoices: "Invoices",
    sales: "Sales",
    settings: "Settings",
    export: "Export",
    logout: "Logout",

    // Actions communes
    create: "Create",
    edit: "Edit",
    delete: "Delete",
    save: "Save",
    cancel: "Cancel",
    search: "Search",
    loading: "Loading...",
    
    // Dashboard
    revenue: "Revenue",
    invoiceCount: "Invoices",
    clientCount: "Clients",
    productCount: "Products",
    recentInvoices: "Recent Invoices",
    topProducts: "Top Products",
    quickActions: "Quick Actions",
    generateReport: "Generate Report",
    exportData: "Export Data",
    viewAll: "View All",
    amount: "Amount",
    date: "Date",
    actions: "Actions",
    unknownClient: "Unknown client",
    noSalesRecorded: "No sales recorded",
    sold: "sold",
    activeClients: "Active Clients",
    newThisMonth: "new this month",
    noNewClients: "No new clients",
    stockAlerts: "stock alerts",
    vsLastMonth: "vs last month",
    noPreviousData: "No previous data",
    thisWeek: "this week",
    noRecentInvoices: "No recent invoices",
    bestSellingProducts: "Best Selling Products",
    
    // Clients
    clientName: "Client Name",
    email: "Email",
    phone: "Phone",
    address: "Address",
    company: "Company",
    newClient: "New Client",
    editClient: "Edit Client",
    searchClient: "Search client...",
    noClient: "No clients",
    noClientFound: "No client found",
    addFirstClient: "Start by adding your first client.",
    tryModifySearch: "Try modifying your search.",
    manageClients: "Manage your clients and their information",
    clientCreated: "Client created",
    clientCreatedDesc: "The client has been created successfully.",
    clientModified: "Client modified",
    clientModifiedDesc: "The client has been modified successfully.",
    clientDeleted: "Client deleted",
    clientDeletedDesc: "The client has been deleted successfully.",
    confirmDeleteClient: "Are you sure you want to delete this client?",
    errorCreateClient: "Unable to create client.",
    errorUpdateClient: "Unable to update client.",
    errorDeleteClient: "Unable to delete client.",
    unauthorized: "Unauthorized",
    unauthorizedDesc: "You are logged out. Reconnecting...",
    lastSync: "Last sync",
    minutesAgo: "2 minutes ago",
    fullName: "Full Name",
    createdOn: "Created on",

    // Invoices
    newInvoice: "New Invoice",
    manageInvoices: "Manage your invoices and payments",
    searchInvoice: "Search invoice...",
    noInvoice: "No invoices",
    noInvoiceFound: "No invoice found",
    createFirstInvoice: "Start by creating your first invoice.",
    tryModifyFilters: "Try modifying your filters.",
    allStatuses: "All statuses",
    invoiceNumber: "Number",
    client: "Client",
    dueDate: "Due Date",
    createInvoice: "Create Invoice",
    editInvoice: "Edit Invoice",
    invoiceDetails: "Invoice Details",
    product: "Product",
    quantity: "Quantity",
    unitPrice: "Unit Price (excl. tax)",
    total: "Total",
    addProduct: "Add Product",
    taxRate: "Tax Rate",
    subtotal: "Subtotal",
    tax: "Tax",
    totalAmount: "Total Amount",
    paymentMethod: "Payment Method",
    notes: "Notes",
    searchOrCreateClient: "Search or create a client...",
    selectStatus: "Select status",
    selectTaxRate: "Select tax rate",
    selectPaymentMethod: "Select payment method",
    productsServices: "Products/Services",
    priceHT: "Price (excl. tax)",
    searchProduct: "Search product...",
    productServiceName: "Product/service name",
    addLine: "Add line",
    additionalNotes: "Additional notes",
    totalHT: "Total (excl. tax)",
    tva: "Tax",
    totalTTC: "Total (incl. tax)",
    creating: "Creating",
    invoiceCreated: "Invoice created",
    invoiceCreatedDesc: "The invoice has been created successfully.",
    invoiceModified: "Invoice modified",
    invoiceModifiedDesc: "The invoice has been modified successfully.",
    invoiceDeleted: "Invoice deleted",
    invoiceDeletedDesc: "The invoice has been deleted successfully.",
    confirmDeleteInvoice: "Are you sure you want to delete this invoice?",
    errorCreateInvoice: "Unable to create invoice.",
    errorUpdateInvoice: "Unable to update invoice.",
    errorDeleteInvoice: "Unable to delete invoice.",
    
    // Products
    manageProducts: "Manage your product catalog",
    productName: "Product Name",
    description: "Description",
    price: "Price",
    stock: "Stock",
    category: "Category",
    newProduct: "New Product",
    editProduct: "Edit Product",
    noProduct: "No products",
    noProductFound: "No product found",
    addFirstProduct: "Start by adding your first product.",
    noCategory: "No category",
    unknownCategory: "Unknown category",
    outOfStock: "Out of stock",
    lowStock: "Low stock",
    inStock: "In stock",
    productCreated: "Product created",
    productCreatedDesc: "The product has been created successfully.",
    productModified: "Product modified",
    productModifiedDesc: "The product has been modified successfully.",
    productDeleted: "Product deleted",
    productDeletedDesc: "The product has been deleted successfully.",
    errorCreateProduct: "Unable to create product.",
    errorUpdateProduct: "Unable to update product.",
    errorDeleteProduct: "Unable to delete product.",
    replenishmentAdded: "Replenishment added",
    replenishmentAddedDesc: "Stock has been replenished successfully.",
    errorAddReplenishment: "Unable to add replenishment.",
    replenishStock: "Replenish stock",
    replenishmentHistory: "Replenishment history",
    deleteProduct: "Delete product",
    productNamePlaceholder: "Complete attiéké",
    descriptionPlaceholder: "Traditional Ivorian dish made from cassava",
    selectCategory: "Select a category",
    stockAlertThreshold: "Stock alert threshold",
    stockManagedAutomatically: "Stock is managed automatically via replenishments and sales",
    modify: "Modify",
    units: "units",
    
    // Invoice Status
    pending: "Pending",
    paid: "Paid",
    overdue: "Overdue",
    
    // Settings
    language: "Language",
    currency: "Currency",
    profile: "Profile",
    preferences: "Preferences",

    personalInfo: "Personal Information",
    updateProfile: "Update Profile",
    profileFirstName: "First Name",
    profileLastName: "Last Name",
    profilePhone: "Phone",
    profileCompany: "Company",
    profilePosition: "Position",
    profileAddress: "Address",
    profileBusinessType: "Business Type",
    
    // Messages
    success: "Success",
    error: "Error",
    confirmDelete: "Are you sure you want to delete this item?",
    noData: "No data available",
    
    // Accounting
    accounting: "Accounting",
    manageFinances: "Manage your finances, expenses and advances securely",
    totalExpenses: "Total Expenses",
    pendingExpenses: "Pending Expenses",
    approvedExpenses: "Approved Expenses",
    totalImprestFunds: "Total Imprest Funds",
    activeImprestFunds: "Active Imprest Funds",
    totalRevenues: "Total Revenues",
    monthlyRevenues: "Monthly Revenues",
    recentRevenues: "Recent Revenues",
    netResult: "Net Result",
    filterByPeriod: "Filter by period",
    from: "From",
    to: "To",
    clear: "Clear",
    
    // Accounting cards and tabs
    awaiting: "Pending",
    approved: "Approved",
    imprestFunds: "Imprest Funds",
    expensesToApprove: "Expenses to approve",
    validatedExpenses: "Validated expenses",
    activeFunds: "active funds",
    benefit: "Benefit",
    revenuesMinusExpenses: "Revenues - Expenses",
    selectedPeriod: "Selected Period",
    displaying: "Displaying statistics from",
    
    // Tabs
    expenses: "Expenses",
    revenues: "Revenues",
    reports: "Reports",
    
    // Expense Management
    expenseManagement: "Expense Management",
    createManageExpenses: "Create and manage all your business expenses",
    expenseList: "Expense List",
    manageBusinessExpenses: "Manage all your business expenses",
    downloadCsv: "Download CSV",
    newExpense: "New Expense",
    
    // Alerts
    alerts: "Alerts",
    criticalStock: "Out of Stock",
    overdueInvoice: "Overdue Invoice",
    paymentDue: "Payment Due",
    markAsRead: "Mark as read",
    markAllAsRead: "Mark all as read",
    deleteAlert: "Delete alert",
    severity: "Severity",
    type: "Type",
    message: "Message",
    createdAt: "Created at",
    
    // Landing page
    appTitle: "YGestion",
    appDescription: "Complete business management application to optimize your sales, manage your clients and track your activity in real time.",
    loginButton: "Sign In",
    createAccountButton: "Create Account",
    newUserText: "New to YGestion? Create your account and complete your profile to get started.",
    clientManagement: "Client Management",
    clientManagementDesc: "Centralize all your client information and their purchase history.",
    productCatalog: "Product Catalog",
    productCatalogDesc: "Organize your products by categories and track your inventory in real time.",
    invoicing: "Invoicing",
    invoicingDesc: "Create and manage your invoices easily with automatic PDF generation.",
    reporting: "Reporting",
    reportingDesc: "Analyze your performance with detailed reports and CSV exports.",
    whyChoose: "Why choose YGestion?",
    modernInterface: "Modern Interface",
    modernInterfaceDesc: "Intuitive and responsive interface, accessible from any device.",
    secure: "Secure",
    secureDesc: "Secure authentication and protected data with encryption.",
    dashboardTitle: "Dashboard",
    dashboardDesc: "Visualize your KPIs and track your business activity evolution in real time.",
    readyToOptimize: "Ready to optimize your business management?",
    joinCompanies: "Join the companies that trust YGestion for their growth.",
    startNow: "Start Now",
  }
};

export const taxRates = [
  { value: "3.00", label: "3%" },
  { value: "5.00", label: "5%" },
  { value: "10.00", label: "10%" },
  { value: "15.00", label: "15%" },
  { value: "18.00", label: "18%" },
  { value: "21.00", label: "21%" },
];

export const currencies = [
  { value: "XOF", label: "XOF - Franc CFA", symbol: "XOF" },
  { value: "GHS", label: "GHS - Cedi ghanéen", symbol: "GH₵" },
];

export const languages = [
  { value: "fr", label: "Français" },
  { value: "en", label: "English" },
];

// Hook pour utiliser les traductions avec support des paramètres utilisateur
export function useTranslation(language?: Language) {
  // Si aucune langue n'est fournie, essayer de récupérer depuis le localStorage
  const currentLanguage = language || 
    (typeof window !== 'undefined' ? localStorage.getItem('preferredLanguage') as Language : null) || 
    'fr';
    
  return {
    t: (key: keyof Translations) => translations[currentLanguage][key] || translations['fr'][key] || key,
    language: currentLanguage,
  };
}

// Fonction pour formater les prix selon la devise
export function formatPrice(amount: number | string, currency: string = 'XOF'): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  switch (currency) {
    case 'XOF':
      return `${numAmount.toLocaleString('fr-FR')} F CFA`;
    case 'GHS':
      return `GH₵ ${numAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    default:
      // Fallback pour XOF par défaut
      return `${numAmount.toLocaleString('fr-FR')} F CFA`;
  }
}