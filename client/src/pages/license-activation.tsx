import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, Key, AlertCircle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface ActivationResponse {
  message: string;
  license: {
    key: string;
    clientName: string;
    activatedAt: string;
  };
}

export default function LicenseActivationPage() {
  const [formData, setFormData] = useState({
    key: "",
    clientName: "",
    deviceId: "",
  });
  
  const [isRedirecting, setIsRedirecting] = useState(false);
  const queryClient = useQueryClient();

  // Vérifier automatiquement si l'utilisateur est déjà activé
  useEffect(() => {
    const checkUserStatus = async () => {
      const currentUser = queryClient.getQueryData(["/api/user"]) as any;
      if (currentUser?.licenseActivated) {
        setIsRedirecting(true);
        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
      }
    };
    
    checkUserStatus();
  }, [queryClient]);

  const activationMutation = useMutation({
    mutationFn: async (data: typeof formData): Promise<ActivationResponse> => {
      const response = await fetch("/api/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erreur d'activation");
      }
      
      return response.json();
    },
    onSuccess: async () => {
      // Supprimer tous les caches pour éviter les données obsolètes
      queryClient.clear();
      
      // Attendre un peu et rediriger avec rechargement complet
      setTimeout(() => {
        window.location.replace("/");
      }, 1500);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.key.trim()) return;
    
    activationMutation.mutate({
      ...formData,
      deviceId: formData.deviceId || `device-${Date.now()}`, // Generate device ID if not provided
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Afficher un message de redirection si nécessaire
  if (isRedirecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-xl">
            <CardContent className="text-center space-y-4 pt-6">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-lg text-green-800 dark:text-green-200">
                Redirection en cours...
              </h3>
              <p className="text-sm text-muted-foreground">
                Accès au tableau de bord en cours
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
              <Key className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-2xl font-bold">YGestion</CardTitle>
            <CardDescription>
              Activation de licence
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {activationMutation.isSuccess ? (
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-green-800 dark:text-green-200">
                    Licence activée avec succès !
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Votre licence a été activée pour {activationMutation.data?.license.clientName || "votre appareil"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Clé: {activationMutation.data?.license.key}
                  </p>
                </div>
                <Button 
                  onClick={async () => {
                    // Vider tous les caches
                    queryClient.clear();
                    
                    // Rediriger avec rechargement complet
                    window.location.replace("/");
                  }} 
                  className="w-full"
                  data-testid="button-continue"
                >
                  Accéder à l'application
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="key">Clé d'activation *</Label>
                  <Input
                    id="key"
                    name="key"
                    type="text"
                    placeholder="WENIBAC-2025-001"
                    value={formData.key}
                    onChange={handleChange}
                    required
                    className="font-mono text-center"
                    data-testid="input-license-key"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clientName">Nom du client</Label>
                  <Input
                    id="clientName"
                    name="clientName"
                    type="text"
                    placeholder="H Hasan"
                    value={formData.clientName}
                    onChange={handleChange}
                    data-testid="input-client-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deviceId">ID de l'appareil (optionnel)</Label>
                  <Input
                    id="deviceId"
                    name="deviceId"
                    type="text"
                    placeholder="ABC123XYZ"
                    value={formData.deviceId}
                    onChange={handleChange}
                    className="font-mono"
                    data-testid="input-device-id"
                  />
                  <p className="text-xs text-muted-foreground">
                    Laissez vide pour générer automatiquement
                  </p>
                </div>

                {activationMutation.isError && (
                  <Alert variant="destructive" data-testid="alert-error">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {activationMutation.error?.message || "Erreur lors de l'activation"}
                    </AlertDescription>
                  </Alert>
                )}

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={!formData.key.trim() || activationMutation.isPending}
                  data-testid="button-activate"
                >
                  {activationMutation.isPending ? "Activation en cours..." : "Activer la licence"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Besoin d'une clé d'activation ? Contactez votre administrateur.
        </p>
      </div>
    </div>
  );
}