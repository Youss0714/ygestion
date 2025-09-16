import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import type { User } from "@shared/schema";

export function useAuth() {
  const { data: user, isLoading, refetch } = useQuery<User>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    staleTime: 0, // Always consider data stale to force refetch when needed
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes (React Query v5)
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    refetch,
  };
}
