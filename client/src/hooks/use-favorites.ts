import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertFavorite } from "@shared/schema";
import { apiUrl, getAuthHeaders } from "@/lib/api-config";

export function useFavorites() {
  return useQuery({
    queryKey: [api.favorites.list.path],
    queryFn: async () => {
      const res = await fetch(apiUrl(api.favorites.list.path), { 
        credentials: "include",
        headers: await getAuthHeaders()
      });
      if (!res.ok) throw new Error("Failed to fetch favorites");
      return api.favorites.list.responses[200].parse(await res.json());
    },
  });
}

export function useAddFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertFavorite) => {
      const validated = api.favorites.create.input.parse(data);
      const res = await fetch(apiUrl(api.favorites.create.path), {
        method: api.favorites.create.method,
        headers: await getAuthHeaders(),
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to add favorite");
      return api.favorites.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.favorites.list.path] });
    },
  });
}

export function useRemoveFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (spellIndex: string) => {
      const url = buildUrl(api.favorites.delete.path, { index: spellIndex });
      const res = await fetch(apiUrl(url), { 
        method: api.favorites.delete.method,
        headers: await getAuthHeaders(),
        credentials: "include" 
      });
      if (!res.ok) throw new Error("Failed to remove favorite");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.favorites.list.path] });
    },
  });
}
