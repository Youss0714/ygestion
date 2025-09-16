import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/header";
import { useTranslation } from "@/lib/i18n";
import { useSettings } from "@/hooks/useSettings";
import { 
  Download, 
  BookOpen, 
  Users, 
  Package, 
  FileText, 
  TrendingUp, 
  Settings, 
  Bell, 
  Calculator,
  CreditCard,
  BarChart3,
  FolderOutput,
  Shield,
  Smartphone,
  Globe,
  CheckCircle,
  AlertTriangle,
  Clock,
  DollarSign,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Printer
} from "lucide-react";

export default function UserGuide() {
  const { settings } = useSettings();
  const { t } = useTranslation(settings?.language);
  const [activeSection, setActiveSection] = useState("introduction");

  const handleDownloadPDF = async () => {
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: html2canvas } = await import('html2canvas');
      
      const element = document.querySelector('.guide-content') as HTMLElement;
      if (!element) {
        alert("Erreur: Contenu du guide non trouvé");
        return;
      }

      // Configure the canvas for better quality
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        height: element.scrollHeight,
        width: element.scrollWidth
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save('Guide-Utilisateur-YGestion.pdf');
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      alert('Erreur lors de la génération du PDF');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Guide Utilisateur YGestion</h1>
            <p className="text-muted-foreground mt-2">
              Guide complet pour maîtriser votre plateforme de gestion commerciale et comptable
            </p>
          </div>
          <Button onClick={handleDownloadPDF} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Télécharger PDF
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Table des matières */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Table des matières
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { id: "introduction", label: "Introduction", icon: BookOpen },
                  { id: "getting-started", label: "Premiers pas", icon: CheckCircle },
                  { id: "dashboard", label: "Tableau de bord", icon: BarChart3 },
                  { id: "clients", label: "Gestion des clients", icon: Users },
                  { id: "products", label: "Gestion des produits", icon: Package },
                  { id: "invoices", label: "Facturation", icon: FileText },
                  { id: "sales", label: "Ventes", icon: TrendingUp },
                  { id: "accounting", label: "Comptabilité", icon: Calculator },
                  { id: "alerts", label: "Alertes", icon: Bell },
                  { id: "settings", label: "Paramètres", icon: Settings },
                  { id: "export", label: "Export & Sauvegarde", icon: FolderOutput },
                  { id: "security", label: "Sécurité", icon: Shield },
                  { id: "mobile", label: "Utilisation mobile", icon: Smartphone },
                  { id: "support", label: "Support", icon: Globe }
                ].map((item) => (
                  <Button
                    key={item.id}
                    variant={activeSection === item.id ? "default" : "ghost"}
                    className="w-full justify-start text-sm"
                    onClick={() => setActiveSection(item.id)}
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Contenu principal */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-8 guide-content">
                
                {/* Introduction */}
                {activeSection === "introduction" && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold mb-4">Bienvenue dans YGestion</h2>
                      <p className="text-lg text-muted-foreground mb-6">
                        YGestion est une plateforme complète de gestion commerciale et comptable 
                        spécialement conçue pour les entreprises d'Afrique de l'Ouest.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Globe className="w-5 h-5" />
                            Multi-langue
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p>Interface disponible en français et anglais</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <DollarSign className="w-5 h-5" />
                            Multi-devises
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p>Support du F CFA (XOF) et du Cedi ghanéen (GHS)</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Calculator className="w-5 h-5" />
                            Comptabilité OHADA
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p>Conforme aux normes comptables OHADA</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Shield className="w-5 h-5" />
                            Sécurisé
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p>Données sécurisées avec authentification</p>
                        </CardContent>
                      </Card>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-3">Fonctionnalités principales</h3>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          Gestion complète des clients et produits
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          Facturation avec génération PDF automatique
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          Suivi des ventes et analyses
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          Module comptabilité complet (dépenses, revenus, rapports)
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          Gestion des stocks avec alertes automatiques
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          Export de données et sauvegarde
                        </li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* Premiers pas */}
                {activeSection === "getting-started" && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold mb-4">Premiers pas</h2>
                    
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                          <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
                          Inscription et Connexion
                        </h3>
                        <p className="mb-3">
                          Créez votre compte YGestion en fournissant votre email et un mot de passe sécurisé.
                        </p>
                        <div className="bg-muted p-4 rounded-lg">
                          <p className="font-medium mb-2">📧 Email requis :</p>
                          <ul className="list-disc list-inside space-y-1 text-sm">
                            <li>Utilisez un email valide et accessible</li>
                            <li>Vérifiez votre boîte de réception après inscription</li>
                          </ul>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                          <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
                          Sélection de la langue
                        </h3>
                        <p className="mb-3">
                          Choisissez votre langue préférée : français ou anglais. Vous pourrez la modifier plus tard dans les paramètres.
                        </p>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                          <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">3</span>
                          Compléter votre profil
                        </h3>
                        <p className="mb-3">
                          Renseignez vos informations d'entreprise :
                        </p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Nom et prénom</li>
                          <li>Téléphone</li>
                          <li>Nom de l'entreprise</li>
                          <li>Poste/fonction</li>
                          <li>Adresse complète</li>
                          <li>Type d'activité</li>
                          <li>Devise préférée (XOF ou GHS)</li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                          <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">4</span>
                          Activation de licence
                        </h3>
                        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-5 h-5 text-yellow-600" />
                            <p className="font-medium text-yellow-800">Période d'essai</p>
                          </div>
                          <p className="text-yellow-700 text-sm">
                            Vous disposez de 60 secondes pour explorer l'application avant d'activer votre licence.
                          </p>
                        </div>
                        <p className="mt-3">
                          Entrez votre clé de licence pour débloquer toutes les fonctionnalités.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tableau de bord */}
                {activeSection === "dashboard" && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold mb-4">Tableau de bord</h2>
                    
                    <p className="text-muted-foreground mb-6">
                      Le tableau de bord est votre centre de contrôle principal. Il affiche un aperçu complet 
                      de votre activité commerciale en temps réel.
                    </p>

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-semibold mb-3">📊 Statistiques clés</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <h4 className="font-medium text-blue-900">Chiffre d'affaires</h4>
                            <p className="text-sm text-blue-700">Total des revenus générés</p>
                          </div>
                          <div className="bg-green-50 p-4 rounded-lg">
                            <h4 className="font-medium text-green-900">Nombre de factures</h4>
                            <p className="text-sm text-green-700">Factures créées au total</p>
                          </div>
                          <div className="bg-purple-50 p-4 rounded-lg">
                            <h4 className="font-medium text-purple-900">Clients actifs</h4>
                            <p className="text-sm text-purple-700">Clients enregistrés</p>
                          </div>
                          <div className="bg-orange-50 p-4 rounded-lg">
                            <h4 className="font-medium text-orange-900">Produits en stock</h4>
                            <p className="text-sm text-orange-700">Articles dans l'inventaire</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold mb-3">🚀 Actions rapides</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <Button variant="outline" className="h-16 flex-col">
                            <Plus className="w-6 h-6 mb-1" />
                            Nouvelle facture
                          </Button>
                          <Button variant="outline" className="h-16 flex-col">
                            <Users className="w-6 h-6 mb-1" />
                            Ajouter client
                          </Button>
                          <Button variant="outline" className="h-16 flex-col">
                            <Package className="w-6 h-6 mb-1" />
                            Nouveau produit
                          </Button>
                          <Button variant="outline" className="h-16 flex-col">
                            <BarChart3 className="w-6 h-6 mb-1" />
                            Voir rapports
                          </Button>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold mb-3">⚡ Widgets d'information</h3>
                        <ul className="space-y-2">
                          <li><strong>Factures récentes :</strong> Les 5 dernières factures créées</li>
                          <li><strong>Produits populaires :</strong> Articles les plus vendus</li>
                          <li><strong>Alertes stock :</strong> Produits avec stock faible</li>
                          <li><strong>Nouveau ce mois :</strong> Nouveaux clients enregistrés</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Gestion des clients */}
                {activeSection === "clients" && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold mb-4">Gestion des clients</h2>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-semibold mb-3">➕ Ajouter un nouveau client</h3>
                        <ol className="list-decimal list-inside space-y-2">
                          <li>Cliquez sur le bouton "Nouveau client" <Button size="sm" className="mx-2"><Plus className="w-4 h-4" /></Button></li>
                          <li>Remplissez les informations obligatoires :
                            <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                              <li><strong>Nom complet :</strong> Nom du client ou de l'entreprise</li>
                              <li><strong>Email :</strong> Adresse email de contact</li>
                              <li><strong>Téléphone :</strong> Numéro de téléphone</li>
                              <li><strong>Adresse :</strong> Adresse physique complète</li>
                              <li><strong>Entreprise :</strong> Nom de l'entreprise (optionnel)</li>
                            </ul>
                          </li>
                          <li>Cliquez sur "Créer" pour enregistrer</li>
                        </ol>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold mb-3">🔍 Rechercher des clients</h3>
                        <p className="mb-3">
                          Utilisez la barre de recherche pour trouver rapidement un client par :
                        </p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Nom ou prénom</li>
                          <li>Nom d'entreprise</li>
                          <li>Adresse email</li>
                        </ul>
                        <div className="bg-muted p-4 rounded-lg mt-3">
                          <p className="text-sm">💡 <strong>Astuce :</strong> La recherche fonctionne en temps réel, tapez simplement les premières lettres.</p>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold mb-3">✏️ Modifier ou supprimer</h3>
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-medium mb-2">Modifier un client :</h4>
                            <ol className="list-decimal list-inside space-y-1">
                              <li>Trouvez le client dans la liste</li>
                              <li>Cliquez sur l'icône <Edit className="w-4 h-4 inline mx-1" /> Modifier</li>
                              <li>Modifiez les informations nécessaires</li>
                              <li>Cliquez sur "Enregistrer"</li>
                            </ol>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Supprimer un client :</h4>
                            <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                              <p className="text-red-800 text-sm mb-2">
                                ⚠️ <strong>Attention :</strong> La suppression d'un client est irréversible.
                              </p>
                              <ol className="list-decimal list-inside space-y-1 text-sm">
                                <li>Cliquez sur l'icône <Trash2 className="w-4 h-4 inline mx-1 text-red-600" /> Supprimer</li>
                                <li>Confirmez la suppression dans la boîte de dialogue</li>
                              </ol>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Gestion des produits */}
                {activeSection === "products" && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold mb-4">Gestion des produits</h2>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-semibold mb-3">📦 Catalogue produits</h3>
                        <p className="mb-4">
                          Gérez votre inventaire complet avec suivi automatique des stocks et alertes.
                        </p>
                        
                        <div>
                          <h4 className="font-medium mb-3">Créer un nouveau produit :</h4>
                          <ol className="list-decimal list-inside space-y-2">
                            <li>Cliquez sur "Nouveau produit"</li>
                            <li>Remplissez les informations :
                              <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                                <li><strong>Nom du produit :</strong> Nom commercial</li>
                                <li><strong>Description :</strong> Détails du produit</li>
                                <li><strong>Prix HT :</strong> Prix hors taxes</li>
                                <li><strong>Stock initial :</strong> Quantité en stock</li>
                                <li><strong>Seuil d'alerte :</strong> Stock minimum avant alerte</li>
                                <li><strong>Catégorie :</strong> Classification du produit</li>
                              </ul>
                            </li>
                            <li>Enregistrez le produit</li>
                          </ol>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold mb-3">📋 Gestion des catégories</h3>
                        <p className="mb-3">
                          Organisez vos produits par catégories pour une meilleure navigation.
                        </p>
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-medium text-blue-900 mb-2">Exemples de catégories :</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>• Électronique</div>
                            <div>• Vêtements</div>
                            <div>• Alimentation</div>
                            <div>• Services</div>
                            <div>• Matériel bureau</div>
                            <div>• Cosmétiques</div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold mb-3">📈 Gestion des stocks</h3>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">Réapprovisionnement :</h4>
                            <ol className="list-decimal list-inside space-y-1">
                              <li>Cliquez sur "Réapprovisionner" pour un produit</li>
                              <li>Indiquez la quantité reçue</li>
                              <li>Ajoutez le coût d'achat (optionnel)</li>
                              <li>Précisez le fournisseur et la référence</li>
                            </ol>
                          </div>
                          
                          <div>
                            <h4 className="font-medium mb-2">Alertes automatiques :</h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-yellow-50 p-3 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                                  <span className="font-medium text-yellow-800">Stock faible</span>
                                </div>
                                <p className="text-sm text-yellow-700">Quand le stock atteint le seuil d'alerte</p>
                              </div>
                              <div className="bg-red-50 p-3 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <AlertTriangle className="w-4 h-4 text-red-600" />
                                  <span className="font-medium text-red-800">Stock critique</span>
                                </div>
                                <p className="text-sm text-red-700">Quand le stock est à zéro</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Facturation */}
                {activeSection === "invoices" && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold mb-4">Module Facturation</h2>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-semibold mb-3">📄 Créer une facture</h3>
                        <ol className="list-decimal list-inside space-y-2">
                          <li><strong>Sélectionner le client :</strong> Choisissez dans la liste ou créez un nouveau client</li>
                          <li><strong>Ajouter des produits :</strong>
                            <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                              <li>Recherchez et sélectionnez vos produits</li>
                              <li>Ajustez les quantités</li>
                              <li>Modifiez les prix si nécessaire</li>
                            </ul>
                          </li>
                          <li><strong>Configurer la TVA :</strong> Choisissez le taux applicable (0%, 3%, 5%, 10%, 15%, 18%, 21%)</li>
                          <li><strong>Méthode de paiement :</strong>
                            <div className="grid grid-cols-2 gap-2 mt-2 ml-6">
                              <div>💰 Espèces</div>
                              <div>🏦 Virement bancaire</div>
                              <div>💳 Chèque</div>
                              <div>💳 Carte bancaire</div>
                              <div>📱 Mobile Money</div>
                            </div>
                          </li>
                          <li><strong>Date d'échéance :</strong> Définissez la date limite de paiement</li>
                          <li><strong>Notes :</strong> Ajoutez des commentaires si nécessaire</li>
                        </ol>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold mb-3">📊 Statuts des factures</h3>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="bg-yellow-50 p-4 rounded-lg">
                            <Badge variant="secondary" className="mb-2">⏳ En attente</Badge>
                            <p className="text-sm">Facture créée, en attente de paiement</p>
                          </div>
                          <div className="bg-green-50 p-4 rounded-lg">
                            <Badge variant="default" className="mb-2">✅ Payée</Badge>
                            <p className="text-sm">Paiement reçu intégralement</p>
                          </div>
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <Badge variant="outline" className="mb-2">💳 Partiellement réglée</Badge>
                            <p className="text-sm">Paiement partiel reçu</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold mb-3">🖨️ Actions sur les factures</h3>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <Eye className="w-5 h-5 text-blue-600" />
                            <div>
                              <p className="font-medium">Visualiser</p>
                              <p className="text-sm text-muted-foreground">Aperçu de la facture avant impression</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Download className="w-5 h-5 text-green-600" />
                            <div>
                              <p className="font-medium">Télécharger PDF</p>
                              <p className="text-sm text-muted-foreground">Export au format PDF pour envoi</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Printer className="w-5 h-5 text-purple-600" />
                            <div>
                              <p className="font-medium">Imprimer</p>
                              <p className="text-sm text-muted-foreground">Impression directe de la facture</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Edit className="w-5 h-5 text-orange-600" />
                            <div>
                              <p className="font-medium">Modifier</p>
                              <p className="text-sm text-muted-foreground">Éditer les détails de la facture</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Ventes */}
                {activeSection === "sales" && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold mb-4">Suivi des ventes</h2>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-semibold mb-3">📈 Tableau de bord des ventes</h3>
                        <p className="mb-4">
                          Analysez vos performances commerciales avec des statistiques détaillées et des graphiques interactifs.
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                            <h4 className="font-medium text-blue-900">Ventes par mois</h4>
                            <p className="text-sm text-blue-700">Évolution mensuelle du chiffre d'affaires</p>
                          </div>
                          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
                            <h4 className="font-medium text-green-900">Produits populaires</h4>
                            <p className="text-sm text-green-700">Articles les plus vendus</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold mb-3">🎯 Métriques clés</h3>
                        <ul className="space-y-2">
                          <li className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-green-600" />
                            <span><strong>Chiffre d'affaires total :</strong> Somme de toutes les ventes</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-blue-600" />
                            <span><strong>Nombre de transactions :</strong> Total des ventes réalisées</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-purple-600" />
                            <span><strong>Produits vendus :</strong> Quantités écoulées par produit</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-orange-600" />
                            <span><strong>Clients actifs :</strong> Clients ayant effectué des achats</span>
                          </li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold mb-3">📊 Filtres et analyses</h3>
                        <div className="space-y-3">
                          <div className="bg-muted p-4 rounded-lg">
                            <h4 className="font-medium mb-2">Filtrer par période :</h4>
                            <ul className="text-sm space-y-1">
                              <li>• Cette semaine</li>
                              <li>• Ce mois</li>
                              <li>• Cette année</li>
                              <li>• Période personnalisée</li>
                            </ul>
                          </div>
                          <div className="bg-muted p-4 rounded-lg">
                            <h4 className="font-medium mb-2">Grouper par :</h4>
                            <ul className="text-sm space-y-1">
                              <li>• Produit</li>
                              <li>• Client</li>
                              <li>• Catégorie</li>
                              <li>• Méthode de paiement</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Comptabilité */}
                {activeSection === "accounting" && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold mb-4">Module Comptabilité</h2>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-semibold mb-3">💰 Gestion des dépenses</h3>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">Créer une dépense :</h4>
                            <ol className="list-decimal list-inside space-y-1">
                              <li>Description détaillée de la dépense</li>
                              <li>Montant et date de la dépense</li>
                              <li>Catégorie (bureautique, transport, marketing, etc.)</li>
                              <li>Méthode de paiement utilisée</li>
                              <li>Justificatif/reçu (optionnel)</li>
                            </ol>
                          </div>
                          
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <h4 className="font-medium text-blue-900 mb-2">Workflow d'approbation :</h4>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <Badge variant="secondary">En attente</Badge>
                                <p className="mt-1">Dépense créée</p>
                              </div>
                              <div>
                                <Badge variant="default">Approuvée</Badge>
                                <p className="mt-1">Dépense validée</p>
                              </div>
                              <div>
                                <Badge variant="destructive">Rejetée</Badge>
                                <p className="mt-1">Dépense refusée</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold mb-3">🏦 Fonds d'avance (Imprest)</h3>
                        <p className="mb-3">
                          Gérez les fonds d'avance pour les dépenses récurrentes ou les missions.
                        </p>
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-medium mb-2">Créer un fonds d'avance :</h4>
                            <ul className="list-disc list-inside space-y-1">
                              <li>Désigner le détenteur du fonds</li>
                              <li>Définir le montant initial</li>
                              <li>Préciser l'objectif/usage</li>
                              <li>Établir les règles d'utilisation</li>
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="font-medium mb-2">Types de transactions :</h4>
                            <div className="grid grid-cols-3 gap-4">
                              <div className="bg-green-50 p-3 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <TrendingUp className="w-4 h-4 text-green-600" />
                                  <span className="font-medium text-green-800">Dépôt</span>
                                </div>
                                <p className="text-sm text-green-700">Ajout de fonds</p>
                              </div>
                              <div className="bg-red-50 p-3 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />
                                  <span className="font-medium text-red-800">Retrait</span>
                                </div>
                                <p className="text-sm text-red-700">Récupération de fonds</p>
                              </div>
                              <div className="bg-blue-50 p-3 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <CreditCard className="w-4 h-4 text-blue-600" />
                                  <span className="font-medium text-blue-800">Dépense</span>
                                </div>
                                <p className="text-sm text-blue-700">Utilisation directe</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold mb-3">📈 Gestion des revenus</h3>
                        <p className="mb-3">
                          Enregistrez tous vos revenus pour un suivi comptable complet.
                        </p>
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-medium mb-2">Types de revenus :</h4>
                            <ul className="list-disc list-inside space-y-1">
                              <li>Ventes de produits/services</li>
                              <li>Prestations exceptionnelles</li>
                              <li>Revenus financiers</li>
                              <li>Subventions et aides</li>
                              <li>Autres recettes</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold mb-3">📋 Rapports comptables</h3>
                        <p className="mb-3">
                          Générez des rapports détaillés pour vos analyses financières.
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-muted p-4 rounded-lg">
                            <h4 className="font-medium mb-2">Rapport de dépenses</h4>
                            <ul className="text-sm space-y-1">
                              <li>• Par catégorie</li>
                              <li>• Par période</li>
                              <li>• Par statut</li>
                            </ul>
                          </div>
                          <div className="bg-muted p-4 rounded-lg">
                            <h4 className="font-medium mb-2">Rapport de revenus</h4>
                            <ul className="text-sm space-y-1">
                              <li>• Évolution mensuelle</li>
                              <li>• Par source</li>
                              <li>• Comparaison annuelle</li>
                            </ul>
                          </div>
                          <div className="bg-muted p-4 rounded-lg">
                            <h4 className="font-medium mb-2">Bilan financier</h4>
                            <ul className="text-sm space-y-1">
                              <li>• Résultat net</li>
                              <li>• Trésorerie</li>
                              <li>• Fonds d'avance</li>
                            </ul>
                          </div>
                          <div className="bg-muted p-4 rounded-lg">
                            <h4 className="font-medium mb-2">Exports</h4>
                            <ul className="text-sm space-y-1">
                              <li>• Format PDF</li>
                              <li>• Format Excel</li>
                              <li>• Format CSV</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Alertes */}
                {activeSection === "alerts" && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold mb-4">Système d'alertes</h2>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-semibold mb-3">🔔 Types d'alertes automatiques</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertTriangle className="w-5 h-5 text-yellow-600" />
                              <span className="font-medium text-yellow-800">Stock faible</span>
                            </div>
                            <p className="text-sm text-yellow-700">
                              Quand un produit atteint son seuil d'alerte
                            </p>
                          </div>
                          
                          <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertTriangle className="w-5 h-5 text-red-600" />
                              <span className="font-medium text-red-800">Stock critique</span>
                            </div>
                            <p className="text-sm text-red-700">
                              Quand un produit n'a plus de stock
                            </p>
                          </div>
                          
                          <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Clock className="w-5 h-5 text-orange-600" />
                              <span className="font-medium text-orange-800">Facture en retard</span>
                            </div>
                            <p className="text-sm text-orange-700">
                              Quand une facture dépasse sa date d'échéance
                            </p>
                          </div>
                          
                          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <DollarSign className="w-5 h-5 text-blue-600" />
                              <span className="font-medium text-blue-800">Paiement dû</span>
                            </div>
                            <p className="text-sm text-blue-700">
                              Rappel des paiements à venir
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold mb-3">⚡ Niveaux de priorité</h3>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary">Faible</Badge>
                            <p>Informations générales, pas d'action urgente requise</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="default">Moyenne</Badge>
                            <p>Nécessite votre attention dans les prochains jours</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="destructive">Élevée</Badge>
                            <p>Requiert une action immédiate</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className="bg-red-600">Critique</Badge>
                            <p>Situation urgente, action immédiate nécessaire</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold mb-3">🎛️ Gestion des alertes</h3>
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-medium mb-2">Actions disponibles :</h4>
                            <ul className="space-y-2">
                              <li className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span><strong>Marquer comme lue :</strong> L'alerte reste visible mais n'est plus en attente</span>
                              </li>
                              <li className="flex items-center gap-2">
                                <Eye className="w-4 h-4 text-blue-600" />
                                <span><strong>Voir les détails :</strong> Accéder aux informations complètes</span>
                              </li>
                              <li className="flex items-center gap-2">
                                <Trash2 className="w-4 h-4 text-red-600" />
                                <span><strong>Supprimer :</strong> Retirer définitivement l'alerte</span>
                              </li>
                            </ul>
                          </div>
                          
                          <div className="bg-muted p-4 rounded-lg">
                            <h4 className="font-medium mb-2">💡 Actions en lot :</h4>
                            <ul className="text-sm space-y-1">
                              <li>• Marquer toutes les alertes comme lues</li>
                              <li>• Supprimer toutes les alertes résolues</li>
                              <li>• Filtrer par type ou priorité</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Paramètres */}
                {activeSection === "settings" && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold mb-4">Paramètres et configuration</h2>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-semibold mb-3">👤 Profil utilisateur</h3>
                        <p className="mb-3">
                          Gérez vos informations personnelles et d'entreprise.
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium mb-2">Informations personnelles :</h4>
                            <ul className="text-sm space-y-1">
                              <li>• Prénom et nom</li>
                              <li>• Adresse email</li>
                              <li>• Numéro de téléphone</li>
                              <li>• Photo de profil</li>
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Informations d'entreprise :</h4>
                            <ul className="text-sm space-y-1">
                              <li>• Nom de l'entreprise</li>
                              <li>• Poste/fonction</li>
                              <li>• Adresse complète</li>
                              <li>• Type d'activité</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold mb-3">🌍 Préférences linguistiques</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-2xl">🇫🇷</span>
                              <span className="font-medium">Français</span>
                            </div>
                            <p className="text-sm text-blue-700">
                              Interface complète en français
                            </p>
                          </div>
                          <div className="bg-green-50 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-2xl">🇬🇧</span>
                              <span className="font-medium">English</span>
                            </div>
                            <p className="text-sm text-green-700">
                              Full English interface
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold mb-3">💱 Gestion des devises</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-orange-50 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <DollarSign className="w-5 h-5 text-orange-600" />
                              <span className="font-medium">F CFA (XOF)</span>
                            </div>
                            <p className="text-sm text-orange-700">
                              Franc CFA d'Afrique de l'Ouest
                            </p>
                            <div className="mt-2 text-xs">
                              <p>Format : 1 000 F CFA</p>
                            </div>
                          </div>
                          <div className="bg-purple-50 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <DollarSign className="w-5 h-5 text-purple-600" />
                              <span className="font-medium">Cedi (GHS)</span>
                            </div>
                            <p className="text-sm text-purple-700">
                              Cedi ghanéen
                            </p>
                            <div className="mt-2 text-xs">
                              <p>Format : GH₵ 1,000.00</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-muted p-4 rounded-lg mt-4">
                          <p className="text-sm">
                            💡 <strong>Note :</strong> Le changement de devise affectera l'affichage 
                            de tous les montants dans l'application, mais ne convertira pas les données existantes.
                          </p>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold mb-3">🔔 Préférences de notifications</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div>
                              <p className="font-medium">Alertes de stock</p>
                              <p className="text-sm text-muted-foreground">Notifications pour stock faible</p>
                            </div>
                            <Button variant="outline" size="sm">Activer</Button>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div>
                              <p className="font-medium">Factures en retard</p>
                              <p className="text-sm text-muted-foreground">Rappels d'échéances</p>
                            </div>
                            <Button variant="outline" size="sm">Activer</Button>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div>
                              <p className="font-medium">Nouveaux paiements</p>
                              <p className="text-sm text-muted-foreground">Confirmation de réception</p>
                            </div>
                            <Button variant="outline" size="sm">Activer</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Export et Sauvegarde */}
                {activeSection === "export" && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold mb-4">Export et Sauvegarde</h2>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-semibold mb-3">📁 Types d'export disponibles</h3>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <h4 className="font-medium text-blue-900 mb-2">Clients</h4>
                            <ul className="text-sm text-blue-700 space-y-1">
                              <li>• Informations de contact</li>
                              <li>• Historique des achats</li>
                              <li>• Statistiques par client</li>
                            </ul>
                          </div>
                          <div className="bg-green-50 p-4 rounded-lg">
                            <h4 className="font-medium text-green-900 mb-2">Produits</h4>
                            <ul className="text-sm text-green-700 space-y-1">
                              <li>• Catalogue complet</li>
                              <li>• Niveaux de stock</li>
                              <li>• Prix et catégories</li>
                            </ul>
                          </div>
                          <div className="bg-purple-50 p-4 rounded-lg">
                            <h4 className="font-medium text-purple-900 mb-2">Factures</h4>
                            <ul className="text-sm text-purple-700 space-y-1">
                              <li>• Détails des factures</li>
                              <li>• Statuts de paiement</li>
                              <li>• Historique complet</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold mb-3">📊 Formats d'export</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-muted p-4 rounded-lg">
                            <h4 className="font-medium mb-2">CSV (Excel)</h4>
                            <ul className="text-sm space-y-1">
                              <li>• Compatible avec Excel</li>
                              <li>• Facile à manipuler</li>
                              <li>• Idéal pour les analyses</li>
                            </ul>
                          </div>
                          <div className="bg-muted p-4 rounded-lg">
                            <h4 className="font-medium mb-2">PDF</h4>
                            <ul className="text-sm space-y-1">
                              <li>• Factures individuelles</li>
                              <li>• Rapports formatés</li>
                              <li>• Prêt pour impression</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold mb-3">⏰ Procédure d'export</h3>
                        <ol className="list-decimal list-inside space-y-2">
                          <li>Accédez à la page "Export" dans le menu principal</li>
                          <li>Sélectionnez le type de données à exporter (clients, produits, factures)</li>
                          <li>Choisissez la période (optionnel) :
                            <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                              <li>Tout l'historique</li>
                              <li>Derniers 30 jours</li>
                              <li>Derniers 3 mois</li>
                              <li>Cette année</li>
                              <li>Période personnalisée</li>
                            </ul>
                          </li>
                          <li>Cliquez sur "Télécharger" pour lancer l'export</li>
                          <li>Le fichier se télécharge automatiquement dans votre dossier de téléchargements</li>
                        </ol>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold mb-3">💾 Sauvegarde automatique</h3>
                        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="font-medium text-green-800">Sauvegarde sécurisée</span>
                          </div>
                          <p className="text-sm text-green-700 mb-3">
                            Vos données sont automatiquement sauvegardées de manière sécurisée.
                          </p>
                          <ul className="text-sm text-green-700 space-y-1">
                            <li>• Sauvegarde en temps réel</li>
                            <li>• Stockage chiffré</li>
                            <li>• Accès multi-appareils</li>
                            <li>• Récupération en cas de problème</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sécurité */}
                {activeSection === "security" && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold mb-4">Sécurité et confidentialité</h2>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-semibold mb-3">🔒 Protection des données</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <h4 className="font-medium text-blue-900 mb-2">Chiffrement</h4>
                            <p className="text-sm text-blue-700">
                              Toutes vos données sont chiffrées en transit et au repos
                            </p>
                          </div>
                          <div className="bg-green-50 p-4 rounded-lg">
                            <h4 className="font-medium text-green-900 mb-2">Authentification</h4>
                            <p className="text-sm text-green-700">
                              Connexion sécurisée avec gestion des sessions
                            </p>
                          </div>
                          <div className="bg-purple-50 p-4 rounded-lg">
                            <h4 className="font-medium text-purple-900 mb-2">Isolation</h4>
                            <p className="text-sm text-purple-700">
                              Vos données sont isolées et privées
                            </p>
                          </div>
                          <div className="bg-orange-50 p-4 rounded-lg">
                            <h4 className="font-medium text-orange-900 mb-2">Conformité</h4>
                            <p className="text-sm text-orange-700">
                              Respect des réglementations en vigueur
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold mb-3">🔐 Bonnes pratiques de sécurité</h3>
                        <div className="space-y-3">
                          <div className="bg-muted p-4 rounded-lg">
                            <h4 className="font-medium mb-2">Mot de passe sécurisé :</h4>
                            <ul className="text-sm space-y-1">
                              <li>• Au moins 8 caractères</li>
                              <li>• Combinaison de lettres, chiffres et symboles</li>
                              <li>• Évitez les informations personnelles</li>
                              <li>• Changez-le régulièrement</li>
                            </ul>
                          </div>
                          
                          <div className="bg-muted p-4 rounded-lg">
                            <h4 className="font-medium mb-2">Navigation sécurisée :</h4>
                            <ul className="text-sm space-y-1">
                              <li>• Déconnectez-vous après utilisation</li>
                              <li>• N'utilisez pas d'ordinateurs publics</li>
                              <li>• Vérifiez l'URL de connexion</li>
                              <li>• Maintenez votre navigateur à jour</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold mb-3">🛡️ Système de licence</h3>
                        <p className="mb-3">
                          YGestion utilise un système de licence pour garantir la sécurité et l'authenticité.
                        </p>
                        <div className="space-y-3">
                          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                            <h4 className="font-medium text-yellow-800 mb-2">Période d'essai :</h4>
                            <p className="text-sm text-yellow-700">
                              60 secondes pour tester l'application avant activation
                            </p>
                          </div>
                          
                          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                            <h4 className="font-medium text-green-800 mb-2">Licence activée :</h4>
                            <p className="text-sm text-green-700">
                              Accès complet à toutes les fonctionnalités
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Utilisation mobile */}
                {activeSection === "mobile" && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold mb-4">Utilisation mobile</h2>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-semibold mb-3">📱 Design responsive</h3>
                        <p className="mb-4">
                          YGestion s'adapte automatiquement à tous les types d'écrans et d'appareils.
                        </p>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="bg-blue-50 p-4 rounded-lg text-center">
                            <Smartphone className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                            <h4 className="font-medium text-blue-900">Mobile</h4>
                            <p className="text-sm text-blue-700">Interface optimisée</p>
                          </div>
                          <div className="bg-green-50 p-4 rounded-lg text-center">
                            <Package className="w-8 h-8 mx-auto mb-2 text-green-600" />
                            <h4 className="font-medium text-green-900">Tablette</h4>
                            <p className="text-sm text-green-700">Affichage étendu</p>
                          </div>
                          <div className="bg-purple-50 p-4 rounded-lg text-center">
                            <Settings className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                            <h4 className="font-medium text-purple-900">Desktop</h4>
                            <p className="text-sm text-purple-700">Expérience complète</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold mb-3">✨ Fonctionnalités mobiles</h3>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                            <div>
                              <p className="font-medium">Navigation tactile optimisée</p>
                              <p className="text-sm text-muted-foreground">Boutons et liens facilement accessibles au doigt</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                            <div>
                              <p className="font-medium">Saisie simplifiée</p>
                              <p className="text-sm text-muted-foreground">Formulaires adaptés aux écrans tactiles</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                            <div>
                              <p className="font-medium">Tableaux scrollables</p>
                              <p className="text-sm text-muted-foreground">Navigation horizontale fluide dans les listes</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                            <div>
                              <p className="font-medium">Sidebar collapsible</p>
                              <p className="text-sm text-muted-foreground">Menu principal escamotable pour plus d'espace</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold mb-3">💡 Conseils d'utilisation mobile</h3>
                        <div className="bg-muted p-4 rounded-lg">
                          <ul className="space-y-2 text-sm">
                            <li>• <strong>Connexion stable :</strong> Assurez-vous d'avoir une bonne connexion internet</li>
                            <li>• <strong>Navigateur récent :</strong> Utilisez un navigateur à jour (Chrome, Safari, Firefox)</li>
                            <li>• <strong>Mode paysage :</strong> Rotation recommandée pour les tableaux</li>
                            <li>• <strong>Zoom adaptatif :</strong> L'interface s'ajuste automatiquement</li>
                            <li>• <strong>Sauvegarde auto :</strong> Vos modifications sont sauvegardées en temps réel</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Support */}
                {activeSection === "support" && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold mb-4">Support et assistance</h2>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-semibold mb-3">🆘 Comment obtenir de l'aide</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <h4 className="font-medium text-blue-900 mb-2">Guide utilisateur</h4>
                            <p className="text-sm text-blue-700 mb-3">
                              Ce guide complet couvre toutes les fonctionnalités
                            </p>
                            <Button size="sm" variant="outline">
                              <Download className="w-4 h-4 mr-2" />
                              Télécharger PDF
                            </Button>
                          </div>
                          <div className="bg-green-50 p-4 rounded-lg">
                            <h4 className="font-medium text-green-900 mb-2">Support technique</h4>
                            <p className="text-sm text-green-700 mb-3">
                              Contactez notre équipe pour assistance
                            </p>
                            <Button size="sm" variant="outline">
                              <Globe className="w-4 h-4 mr-2" />
                              Contacter
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold mb-3">❓ Questions fréquentes</h3>
                        <div className="space-y-4">
                          <div className="bg-muted p-4 rounded-lg">
                            <h4 className="font-medium mb-2">Comment changer de langue ?</h4>
                            <p className="text-sm">
                              Allez dans Paramètres → Préférences → Sélectionnez votre langue préférée.
                            </p>
                          </div>
                          
                          <div className="bg-muted p-4 rounded-lg">
                            <h4 className="font-medium mb-2">Comment activer ma licence ?</h4>
                            <p className="text-sm">
                              Après la période d'essai, entrez votre clé de licence dans la page d'activation.
                            </p>
                          </div>
                          
                          <div className="bg-muted p-4 rounded-lg">
                            <h4 className="font-medium mb-2">Mes données sont-elles sécurisées ?</h4>
                            <p className="text-sm">
                              Oui, toutes les données sont chiffrées et stockées de manière sécurisée.
                            </p>
                          </div>
                          
                          <div className="bg-muted p-4 rounded-lg">
                            <h4 className="font-medium mb-2">Comment exporter mes données ?</h4>
                            <p className="text-sm">
                              Utilisez la page Export pour télécharger vos données au format CSV ou PDF.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold mb-3">📞 Informations de contact</h3>
                        <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
                          <h4 className="font-medium text-blue-900 mb-4">Équipe YGestion</h4>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <Globe className="w-5 h-5 text-blue-600" />
                              <span>Support technique et commercial</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <Clock className="w-5 h-5 text-blue-600" />
                              <span>Disponible 7j/7 - Réponse sous 24h</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <Shield className="w-5 h-5 text-blue-600" />
                              <span>Support sécurisé et confidentiel</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold mb-3">🚀 Mises à jour et améliorations</h3>
                        <p className="mb-3">
                          YGestion évolue constamment pour répondre à vos besoins.
                        </p>
                        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                          <h4 className="font-medium text-green-800 mb-2">Nouvelles fonctionnalités :</h4>
                          <ul className="text-sm text-green-700 space-y-1">
                            <li>• Mises à jour automatiques</li>
                            <li>• Nouvelles fonctionnalités régulières</li>
                            <li>• Améliorations de performance</li>
                            <li>• Corrections de bugs rapides</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}