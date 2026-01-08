import React, { createContext, useContext, useState, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { dndClasses, type Character, type CreateCharacter, type DnDClass } from "@shared/character-schema";
import { useToast } from "@/hooks/use-toast";
import { apiUrl } from "@/lib/api-config";

interface CharacterContextType {
  characters: Character[];
  selectedCharacter: Character | null;
  isLoading: boolean;
  selectCharacter: (character: Character | null) => void;
  createCharacter: (character: Omit<CreateCharacter, "userId">) => Promise<Character>;
  updateCharacter: (id: string, updates: Partial<Character>) => Promise<Character>;
  deleteCharacter: (id: string) => Promise<void>;
  dndClasses: readonly DnDClass[];
}

const CharacterContext = createContext<CharacterContextType | undefined>(undefined);

export const CharacterProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: characters = [], isLoading } = useQuery({
    queryKey: ["characters", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { getAuthHeaders } = await import("@/lib/api-config");
      const res = await fetch(apiUrl("/api/characters"), { 
        credentials: "include",
        headers: await getAuthHeaders()
      });
      if (!res.ok) throw new Error("Erro ao buscar personagens");
      return res.json() as Promise<Character[]>;
    },
    enabled: !!user?.id,
  });

  const createMutation = useMutation({
    mutationFn: async (character: Omit<CreateCharacter, "userId">) => {
      const { getAuthHeaders } = await import("@/lib/api-config");
      const res = await fetch(apiUrl("/api/characters"), {
        method: "POST",
        headers: await getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify(character),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Erro ao criar personagem");
      }
      return res.json() as Promise<Character>;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["characters", user?.id] });
      setSelectedCharacter(data);
      toast({
        title: "Personagem criado!",
        description: `${data.name} foi criado com sucesso.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar personagem",
        description: error.message || "Não foi possível criar o personagem",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Character> }) => {
      const res = await fetch(apiUrl(`/api/characters/${id}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updates),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Erro ao atualizar personagem");
      }
      return res.json() as Promise<Character>;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["characters", user?.id] });
      if (selectedCharacter?.id === data.id) {
        setSelectedCharacter(data);
      }
      toast({
        title: "Personagem atualizado!",
        description: `${data.name} foi atualizado com sucesso.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar personagem",
        description: error.message || "Não foi possível atualizar o personagem",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(apiUrl(`/api/characters/${id}`), {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Erro ao deletar personagem");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["characters", user?.id] });
      if (selectedCharacter && characters.some(c => c.id === selectedCharacter.id)) {
        setSelectedCharacter(null);
      }
      toast({
        title: "Personagem deletado",
        description: "O personagem foi removido com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao deletar personagem",
        description: error.message || "Não foi possível deletar o personagem",
        variant: "destructive",
      });
    },
  });

  const createCharacter = async (character: Omit<CreateCharacter, "userId">) => {
    return createMutation.mutateAsync(character);
  };

  const updateCharacter = async (id: string, updates: Partial<Character>) => {
    return updateMutation.mutateAsync({ id, updates });
  };

  const deleteCharacter = async (id: string) => {
    return deleteMutation.mutateAsync(id);
  };

  return (
    <CharacterContext.Provider
      value={{
        characters,
        selectedCharacter,
        isLoading,
        selectCharacter: setSelectedCharacter,
        createCharacter,
        updateCharacter,
        deleteCharacter,
        dndClasses,
      }}
    >
      {children}
    </CharacterContext.Provider>
  );
};

export const useCharacter = () => {
  const context = useContext(CharacterContext);
  if (context === undefined) {
    throw new Error("useCharacter must be used within a CharacterProvider");
  }
  return context;
};

