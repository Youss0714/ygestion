import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Shield, Key, AlertCircle, Check, X, Ban } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { License } from "@shared/schema";

export default function AdminLicensesPage() {
  const [adminToken, setAdminToken] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [newLicense, setNewLicense] = useState({
    key: "",
    clientName: "",
    createdBy: "Youssouphafils",
  });
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const queryClient = useQueryClient();

  // Query to fetch all licenses
  const {
    data: licenses,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-licenses"],
    queryFn: async (): Promise<License[]> => {
      const response = await fetch("/api/admin/licenses", {
        headers: {
          "x-admin-token": adminToken,
        },
      });
      
      if (!response.ok) {
        throw new Error("Accès refusé ou erreur serveur");
      }
      
      return response.json();
    },
    enabled: isAuthenticated,
  });

  // Mutation to create a new license
  const createLicenseMutation = useMutation({
    mutationFn: async (licenseData: typeof newLicense) => {
      const response = await fetch("/api/admin/licenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": adminToken,
        },
        body: JSON.stringify(licenseData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erreur lors de la création");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-licenses"] });
      setNewLicense({ key: "", clientName: "", createdBy: "Youssouphafils" });
      setCreateDialogOpen(false);
    },
  });

  // Mutation to revoke a license
  const revokeLicenseMutation = useMutation({
    mutationFn: async (key: string) => {
      const response = await fetch(`/api/admin/licenses/${key}/revoke`, {
        method: "PATCH",
        headers: {
          "x-admin-token": adminToken,
        },
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erreur lors de la révocation");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-licenses"] });
    },
  });

  const handleAuthenticate = () => {
    if (adminToken.trim()) {
      setIsAuthenticated(true);
    }
  };

  const handleCreateLicense = () => {
    if (!newLicense.key.trim()) return;
    createLicenseMutation.mutate(newLicense);
  };

  const generateLicenseKey = () => {
    const year = new Date().getFullYear();
    const random = Math.random().toString(36).substr(2, 3).toUpperCase();
    const sequence = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');
    return `WENIBAC-${year}-${sequence}-${random}`;
  };

  const getStatusBadge = (license: License) => {
    if (license.revokedAt) {
      return <Badge variant="destructive" className="flex items-center gap-1"><Ban className="w-3 h-3" />Révoquée</Badge>;
    }
    if (license.activated) {
      return <Badge variant="default" className="flex items-center gap-1 bg-green-500"><Check className="w-3 h-3" />Activée</Badge>;
    }
    return <Badge variant="secondary" className="flex items-center gap-1"><Key className="w-3 h-3" />En attente</Badge>;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <CardTitle className="text-2xl font-bold">Administration YGestion</CardTitle>
            <CardDescription>
              Accès réservé à l'administrateur
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="adminToken">Token d'administration</Label>
              <Input
                id="adminToken"
                type="password"
                placeholder="Entrez votre token admin"
                value={adminToken}
                onChange={(e) => setAdminToken(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAuthenticate()}
                data-testid="input-admin-token"
              />
            </div>

            <Button 
              onClick={handleAuthenticate}
              className="w-full"
              disabled={!adminToken.trim()}
              data-testid="button-authenticate"
            >
              Se connecter
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Administration des Licences</CardTitle>
                <CardDescription>
                  Gestion des clés d'activation YGestion
                </CardDescription>
              </div>
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-new-license">
                    <Plus className="w-4 h-4 mr-2" />
                    Nouvelle licence
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Créer une nouvelle licence</DialogTitle>
                    <DialogDescription>
                      Générez une nouvelle clé d'activation pour un client
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="licenseKey">Clé d'activation</Label>
                      <div className="flex gap-2">
                        <Input
                          id="licenseKey"
                          value={newLicense.key}
                          onChange={(e) => setNewLicense(prev => ({ ...prev, key: e.target.value }))}
                          className="font-mono"
                          placeholder="WENIBAC-2025-001-ABC"
                          data-testid="input-new-license-key"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setNewLicense(prev => ({ ...prev, key: generateLicenseKey() }))}
                          data-testid="button-generate-key"
                        >
                          Générer
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="clientName">Nom du client</Label>
                      <Input
                        id="clientName"
                        value={newLicense.clientName}
                        onChange={(e) => setNewLicense(prev => ({ ...prev, clientName: e.target.value }))}
                        placeholder="Nom du client"
                        data-testid="input-client-name-new"
                      />
                    </div>
                  </div>

                  {createLicenseMutation.isError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {createLicenseMutation.error?.message || "Erreur lors de la création"}
                      </AlertDescription>
                    </Alert>
                  )}

                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => setCreateDialogOpen(false)}
                      data-testid="button-cancel"
                    >
                      Annuler
                    </Button>
                    <Button 
                      onClick={handleCreateLicense}
                      disabled={!newLicense.key.trim() || createLicenseMutation.isPending}
                      data-testid="button-create-license"
                    >
                      {createLicenseMutation.isPending ? "Création..." : "Créer"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
        </Card>

        {/* Licenses Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Chargement des licences...</p>
                </div>
              </div>
            ) : error ? (
              <div className="p-6">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Erreur lors du chargement des licences. Vérifiez votre token d'administration.
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Clé</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Activée le</TableHead>
                    <TableHead>Créée le</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {licenses?.map((license) => (
                    <TableRow key={license.id}>
                      <TableCell>
                        <code className="bg-muted px-2 py-1 rounded font-mono text-sm">
                          {license.key}
                        </code>
                      </TableCell>
                      <TableCell>{license.clientName || "Non spécifié"}</TableCell>
                      <TableCell>{getStatusBadge(license)}</TableCell>
                      <TableCell>
                        {license.activatedAt ? (
                          format(new Date(license.activatedAt), "dd/MM/yyyy à HH:mm", { locale: fr })
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>
                        {license.createdAt ? (
                          format(new Date(license.createdAt), "dd/MM/yyyy à HH:mm", { locale: fr })
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>
                        {license.activated && !license.revokedAt && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => revokeLicenseMutation.mutate(license.key)}
                            disabled={revokeLicenseMutation.isPending}
                            data-testid={`button-revoke-${license.key}`}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Révoquer
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {licenses?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Aucune licence créée pour le moment
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        {licenses && licenses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{licenses.length}</div>
                  <p className="text-sm text-muted-foreground">Total licences</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {licenses.filter(l => l.activated && !l.revokedAt).length}
                  </div>
                  <p className="text-sm text-muted-foreground">Actives</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {licenses.filter(l => l.revokedAt).length}
                  </div>
                  <p className="text-sm text-muted-foreground">Révoquées</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}