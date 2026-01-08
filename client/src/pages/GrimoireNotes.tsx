import { useState } from "react";
import { useCharacter } from "@/contexts/CharacterContext";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Trash2, Edit2, ArrowLeft, Save, X, BookOpen } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiUrl, getAuthHeaders } from "@/lib/api-config";

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function GrimoireNotes() {
  const { selectedCharacter } = useCharacter();
  const [location, setLocation] = useLocation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [formData, setFormData] = useState({ title: "", content: "" });
  const queryClient = useQueryClient();
  const { toast: showToast } = useToast();

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ["notes", selectedCharacter?.id],
    queryFn: async () => {
      if (!selectedCharacter?.id) return [];
      const res = await fetch(apiUrl(`/api/notes/${selectedCharacter.id}`), { 
        credentials: "include",
        headers: await getAuthHeaders()
      });
      if (!res.ok) throw new Error("Erro ao buscar notas");
      return res.json() as Promise<Note[]>;
    },
    enabled: !!selectedCharacter?.id,
  });

  const createMutation = useMutation({
    mutationFn: async (note: { title: string; content: string }) => {
      if (!selectedCharacter?.id) throw new Error("Personagem não selecionado");
      const res = await fetch(apiUrl("/api/notes"), {
        method: "POST",
        headers: await getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify({
          ...note,
          characterId: selectedCharacter.id,
        }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Erro ao criar nota");
      }
      return res.json() as Promise<Note>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", selectedCharacter?.id] });
      setIsDialogOpen(false);
      setFormData({ title: "", content: "" });
      showToast({
        title: "Nota criada!",
        description: "Sua nota foi salva com sucesso.",
      });
    },
    onError: (error: any) => {
      showToast({
        title: "Erro ao criar nota",
        description: error.message || "Não foi possível criar a nota",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Note> }) => {
      const res = await fetch(apiUrl(`/api/notes/${id}`), {
        method: "PUT",
        headers: await getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify(updates),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Erro ao atualizar nota");
      }
      return res.json() as Promise<Note>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", selectedCharacter?.id] });
      setIsDialogOpen(false);
      setEditingNote(null);
      setFormData({ title: "", content: "" });
      showToast({
        title: "Nota atualizada!",
        description: "Sua nota foi atualizada com sucesso.",
      });
    },
    onError: (error: any) => {
      showToast({
        title: "Erro ao atualizar nota",
        description: error.message || "Não foi possível atualizar a nota",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(apiUrl(`/api/notes/${id}`), {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Erro ao deletar nota");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", selectedCharacter?.id] });
      showToast({
        title: "Nota deletada",
        description: "A nota foi removida com sucesso.",
      });
    },
    onError: (error: any) => {
      showToast({
        title: "Erro ao deletar nota",
        description: error.message || "Não foi possível deletar a nota",
        variant: "destructive",
      });
    },
  });

  const handleCreate = () => {
    setEditingNote(null);
    setFormData({ title: "", content: "" });
    setIsDialogOpen(true);
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setFormData({ title: note.title, content: note.content });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.title.trim()) {
      showToast({
        title: "Erro",
        description: "O título é obrigatório",
        variant: "destructive",
      });
      return;
    }

    if (editingNote) {
      updateMutation.mutate({ id: editingNote.id, updates: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (note: Note) => {
    setNoteToDelete(note);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (noteToDelete) {
      deleteMutation.mutate(noteToDelete.id);
      setIsDeleteDialogOpen(false);
      setNoteToDelete(null);
    }
  };

  if (!selectedCharacter) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Selecione um personagem primeiro</p>
          <Button onClick={() => setLocation("/characters")}>
            Selecionar Personagem
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background grimoire-texture pb-24">
      <div className="max-w-2xl mx-auto px-6 py-8 relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => setLocation("/profile")}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft size={20} className="mr-2" />
            Voltar
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-display text-white tracking-widest">
              GRIMÓRIO
            </h1>
            {notes.length > 0 && (
              <Button
                onClick={handleCreate}
                className="w-10 h-10 rounded-full bg-primary hover:bg-primary/80 text-black flex items-center justify-center p-0"
                size="icon"
              >
                <BookOpen size={20} />
              </Button>
            )}
          </div>
          <div className="w-20" /> {/* Spacer */}
        </div>


        {/* Notes List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin text-primary">⏳</div>
            <p className="text-muted-foreground mt-4">Carregando notas...</p>
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Nenhuma nota criada ainda</p>
            <Button onClick={handleCreate}>
              <Plus size={18} className="mr-2" />
              Criar Primeira Nota
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => (
              <div
                key={note.id}
                className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-display text-white flex-1">
                    {note.title}
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(note)}
                      className="text-primary hover:text-primary hover:bg-primary/10"
                    >
                      <Edit2 size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(note)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {note.content || <span className="italic">Sem conteúdo</span>}
                </p>
                {note.updatedAt && (
                  <p className="text-xs text-muted-foreground mt-3">
                    Atualizado em {new Date(note.updatedAt).toLocaleDateString("pt-BR")}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-background border-white/10 text-white !rounded-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-display text-white">
                {editingNote ? "EDITAR NOTA" : "NOVA NOTA"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-muted-foreground text-sm mb-2 block">
                  Título
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Título da nota"
                  className="bg-white/5 border-white/10 text-white"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-muted-foreground text-sm mb-2 block">
                  Conteúdo
                </label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Escreva suas notas aqui..."
                  className="bg-white/5 border-white/10 text-white min-h-[200px]"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleSave}
                  className="flex-1 bg-primary hover:bg-primary/80 text-black font-bold h-11"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  <Save size={18} className="mr-2" />
                  Salvar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setEditingNote(null);
                    setFormData({ title: "", content: "" });
                  }}
                  className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10 h-11"
                >
                  <X size={18} className="mr-2" />
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="bg-background border-white/10 text-white !rounded-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-display text-white">
                CONFIRMAR EXCLUSÃO
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <p className="text-muted-foreground">
                Tem certeza que deseja deletar a nota <strong className="text-white">"{noteToDelete?.title}"</strong>?
                Esta ação não pode ser desfeita.
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={confirmDelete}
                  className="flex-1 bg-destructive hover:bg-destructive/80 text-white font-bold h-11"
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 size={18} className="mr-2" />
                  Deletar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDeleteDialogOpen(false);
                    setNoteToDelete(null);
                  }}
                  className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10 h-11"
                >
                  <X size={18} className="mr-2" />
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

