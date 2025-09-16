import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "./useAuth";
import { Language } from "@/lib/i18n";
import { useEffect } from "react";

export interface UserSettings {
  currency: string;
  language: Language;
}

export function useSettings() {
  const { user } = useAuth();

  // Get the preferred language from localStorage if set during initial language selection
  const getInitialLanguage = (): Language => {
    const preferredLanguage = localStorage.getItem('preferredLanguage');
    return (preferredLanguage as Language) || "fr";
  };

  const { data: settings, isLoading } = useQuery<UserSettings>({
    queryKey: ["/api/user/settings"],
    enabled: !!user,
    select: (data: any) => ({
      currency: data?.currency || "XOF",
      language: (data?.language || getInitialLanguage()) as Language,
    }),
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: Partial<UserSettings>) => {
      const response = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newSettings),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erreur de mise à jour des paramètres");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
  });

  // Sync initial language preference with user settings if not already set
  useEffect(() => {
    const preferredLanguage = localStorage.getItem('preferredLanguage');
    const hasBeenSynced = localStorage.getItem('languageSynced');
    
    if (user && settings && preferredLanguage && !hasBeenSynced) {
      // If the preferred language is different from current settings, update it
      if (settings.language !== preferredLanguage) {
        updateSettingsMutation.mutate({
          language: preferredLanguage as Language,
          currency: settings.currency
        });
        localStorage.setItem('languageSynced', 'true');
      }
    }
  }, [user, settings, updateSettingsMutation]);

  return {
    settings,
    isLoading,
    updateSettings: updateSettingsMutation.mutate,
    isUpdating: updateSettingsMutation.isPending,
  };
}