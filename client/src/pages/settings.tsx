import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSettings } from "@/hooks/useSettings";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Header from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Settings as SettingsIcon, 
  Globe, 
  DollarSign,
  Save,
  Mail,
  HelpCircle,
  ExternalLink,
  Book,

  User
} from "lucide-react";
import { currencies, languages, useTranslation } from "@/lib/i18n";

import ProfileEditor from "@/components/profile-editor";

export default function Settings() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const { settings, updateSettings, isUpdating } = useSettings();
  const [localCurrency, setLocalCurrency] = useState("");
  const [localLanguage, setLocalLanguage] = useState("");
  
  const { t } = useTranslation(settings?.language);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Non autorisé",
        description: "Vous êtes déconnecté. Reconnexion...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Initialize local state with settings
  useEffect(() => {
    if (settings) {
      setLocalCurrency(settings.currency);
      setLocalLanguage(settings.language);
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      updateSettings({
        currency: localCurrency,
        language: localLanguage as "fr" | "en",
      });
      
      toast({
        title: "Paramètres sauvegardés",
        description: "Vos préférences ont été mises à jour avec succès.",
      });
      
      // Reload page to apply language changes
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Non autorisé",
          description: "Vous êtes déconnecté. Reconnexion...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les paramètres.",
        variant: "destructive",
      });
    }
  };

  const hasChanges = 
    localCurrency !== settings?.currency || 
    localLanguage !== settings?.language;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <Header 
        title={t('settings')}
        subtitle="Configurez vos préférences d'application"
      />

      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Language Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                {t('language')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="language">Langue de l'interface</Label>
                <Select 
                  value={localLanguage} 
                  onValueChange={setLocalLanguage}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une langue" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500">
                  La langue sélectionnée sera appliquée à toute l'interface.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                {t('personalInfo')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ProfileEditor />
              <p className="text-sm text-gray-500">
                {settings?.language === 'en' 
                  ? 'Update your personal and business information. This information will appear on your invoices.'
                  : 'Mettez à jour vos informations personnelles et d\'entreprise. Ces informations apparaîtront sur vos factures.'
                }
              </p>
            </CardContent>
          </Card>



          {/* Currency Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                {t('currency')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="currency">Devise par défaut</Label>
                <Select 
                  value={localCurrency} 
                  onValueChange={setLocalCurrency}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une devise" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.value} value={currency.value}>
                        {currency.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500">
                  Cette devise sera utilisée pour afficher tous les prix.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Developer Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                {settings?.language === 'en' ? 'Contact Developer' : 'Contacter le Développeur'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div>
                  <h3 className="font-medium text-blue-900">
                    {settings?.language === 'en' ? 'Need help or have suggestions?' : 'Besoin d\'aide ou des suggestions ?'}
                  </h3>
                  <p className="text-sm text-blue-700 mt-1">
                    {settings?.language === 'en' 
                      ? 'Contact the developer for support, feature requests, or bug reports.'
                      : 'Contactez le développeur pour du support, demandes de fonctionnalités ou signaler des bugs.'
                    }
                  </p>
                </div>
                <Button 
                  onClick={() => window.open('mailto:youssouphafils@gmail.com?subject=YGestion - Support', '_blank')}
                  variant="outline"
                  className="flex items-center gap-2 border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  <Mail className="w-4 h-4" />
                  {settings?.language === 'en' ? 'Send Email' : 'Envoyer Email'}
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                youssouphafils@gmail.com
              </p>
            </CardContent>
          </Card>

          {/* User Guide */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Book className="w-5 h-5" />
                {settings?.language === 'en' ? 'User Guide' : 'Guide d\'Utilisation'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium flex items-center gap-2 mb-2">
                    <HelpCircle className="w-4 h-4 text-blue-500" />
                    {settings?.language === 'en' ? 'Getting Started' : 'Premiers Pas'}
                  </h3>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                    <li>
                      {settings?.language === 'en' 
                        ? 'Start by adding your first clients in the Clients section'
                        : 'Commencez par ajouter vos premiers clients dans la section Clients'
                      }
                    </li>
                    <li>
                      {settings?.language === 'en' 
                        ? 'Create product categories and add your products with prices'
                        : 'Créez des catégories de produits et ajoutez vos produits avec leurs prix'
                      }
                    </li>
                    <li>
                      {settings?.language === 'en' 
                        ? 'Generate professional invoices and track your sales'
                        : 'Générez des factures professionnelles et suivez vos ventes'
                      }
                    </li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-medium flex items-center gap-2 mb-2">
                    <HelpCircle className="w-4 h-4 text-green-500" />
                    {settings?.language === 'en' ? 'Key Features' : 'Fonctionnalités Principales'}
                  </h3>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                    <li>
                      {settings?.language === 'en' 
                        ? 'Real-time dashboard with business analytics'
                        : 'Tableau de bord en temps réel avec analyses commerciales'
                      }
                    </li>
                    <li>
                      {settings?.language === 'en' 
                        ? 'PDF invoice generation and printing'
                        : 'Génération et impression de factures PDF'
                      }
                    </li>
                    <li>
                      {settings?.language === 'en' 
                        ? 'Automatic stock management and alerts'
                        : 'Gestion automatique des stocks et alertes'
                      }
                    </li>
                    <li>
                      {settings?.language === 'en' 
                        ? 'Multi-currency support (XOF, GHS)'
                        : 'Support multi-devises (XOF, GHS)'
                      }
                    </li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-medium flex items-center gap-2 mb-2">
                    <HelpCircle className="w-4 h-4 text-orange-500" />
                    {settings?.language === 'en' ? 'Tips & Tricks' : 'Conseils & Astuces'}
                  </h3>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                    <li>
                      {settings?.language === 'en' 
                        ? 'Set custom stock alert levels for each product'
                        : 'Définissez des seuils d\'alerte stock personnalisés pour chaque produit'
                      }
                    </li>
                    <li>
                      {settings?.language === 'en' 
                        ? 'Use the export feature to backup your business data'
                        : 'Utilisez la fonction export pour sauvegarder vos données commerciales'
                      }
                    </li>
                    <li>
                      {settings?.language === 'en' 
                        ? 'Print directly from invoice preview or download as PDF'
                        : 'Imprimez directement depuis l\'aperçu facture ou téléchargez en PDF'
                      }
                    </li>
                    <li>
                      {settings?.language === 'en' 
                        ? 'Monitor your top-selling products in the dashboard'
                        : 'Surveillez vos produits les plus vendus dans le tableau de bord'
                      }
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reset Language Selector */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                {settings?.language === 'en' ? 'Language Setup' : 'Configuration de Langue'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                <div>
                  <h3 className="font-medium text-gray-900">
                    {settings?.language === 'en' ? 'Reset Language Selector' : 'Réinitialiser le Sélecteur de Langue'}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {settings?.language === 'en' 
                      ? 'Show the language selection screen again on next app startup.'
                      : 'Afficher à nouveau l\'écran de sélection de langue au prochain démarrage.'
                    }
                  </p>
                </div>
                <Button 
                  onClick={() => {
                    localStorage.removeItem('initialLanguageSelected');
                    localStorage.removeItem('preferredLanguage');
                    localStorage.removeItem('languageSynced');
                    window.location.reload();
                  }}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Globe className="w-4 h-4" />
                  {settings?.language === 'en' ? 'Reset' : 'Réinitialiser'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button 
              onClick={handleSave}
              disabled={!hasChanges || isUpdating}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isUpdating ? "Sauvegarde..." : "Sauvegarder"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}