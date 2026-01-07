import { useState, useRef } from "react";
import { useCharacter } from "@/contexts/CharacterContext";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, User, Upload, Trash2, X } from "lucide-react";
import { type DnDClass } from "@shared/character-schema";
import { useVantaCells } from "@/hooks/use-vanta-cells";

export default function CharacterSelection() {
  const { user, logout } = useAuth();
  const { characters, selectedCharacter, selectCharacter, createCharacter, deleteCharacter, dndClasses, isLoading } = useCharacter();
  const [location, setLocation] = useLocation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    class: "" as DnDClass | "",
    avatar: null as File | null,
    avatarPreview: "" as string | null,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const vantaRef = useVantaCells();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("A imagem deve ter no máximo 5MB");
        return;
      }
      setFormData({
        ...formData,
        avatar: file,
        avatarPreview: URL.createObjectURL(file),
      });
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.class) {
      alert("Nome e classe são obrigatórios");
      return;
    }

    try {
      let avatarUrl = null;
      if (formData.avatar) {
        avatarUrl = await convertFileToBase64(formData.avatar);
      }

      await createCharacter({
        name: formData.name,
        class: formData.class as DnDClass,
        avatar: avatarUrl,
        level: 1,
      });

      setFormData({
        name: "",
        class: "" as DnDClass | "",
        avatar: null,
        avatarPreview: null,
      });
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Erro ao criar personagem:", error);
    }
  };

  const handleSelect = (character: typeof characters[0]) => {
    selectCharacter(character);
    setLocation("/");
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Tem certeza que deseja deletar este personagem?")) {
      await deleteCharacter(id);
      if (selectedCharacter?.id === id) {
        selectCharacter(null);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black relative">
        <div ref={vantaRef} className="absolute inset-0 z-0" />
        <div className="text-center space-y-4 relative z-10">
          <div className="animate-spin text-primary">⏳</div>
          <p className="text-muted-foreground">Carregando personagens...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative bg-black">
      <div ref={vantaRef} className="absolute inset-0 z-0" />
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative z-10 min-h-screen">
        <h1 className="text-3xl md:text-4xl font-display text-white text-center mb-12 tracking-wider">
          Quem vai partir em uma aventura?
        </h1>

        {/* Character Profiles - Horizontal Layout */}
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 mb-12">
          {/* Existing Characters */}
          {characters.map((character) => (
            <div
              key={character.id}
              className="flex flex-col items-center cursor-pointer group"
              onClick={() => handleSelect(character)}
            >
              <div className="relative">
                <div
                  className={`w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 transition-all duration-300 ${
                    selectedCharacter?.id === character.id
                      ? "border-primary shadow-[0_0_30px_rgba(74,222,128,0.6)] scale-105"
                      : "border-white/20 hover:border-white/40"
                  }`}
                >
                  {character.avatar ? (
                    <img
                      src={character.avatar}
                      alt={character.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center">
                      <User className="text-white/40" size={48} />
                    </div>
                  )}
                </div>
                {/* Delete button on hover */}
                <button
                  onClick={(e) => handleDelete(character.id!, e)}
                  className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-destructive/80 hover:bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  aria-label="Deletar personagem"
                >
                  <Trash2 size={16} />
                </button>
                {/* Selected indicator */}
                {selectedCharacter?.id === character.id && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-white" />
                  </div>
                )}
              </div>
              <p className="text-white text-center mt-4 text-lg font-medium">
                {character.name}
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                {character.class} - Nv.{character.level}
              </p>
            </div>
          ))}

          {/* Add New Character */}
          <div
            className="flex flex-col items-center cursor-pointer"
            onClick={() => setIsDialogOpen(true)}
          >
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-dashed border-white/30 hover:border-white/50 transition-all duration-300 bg-white/5 hover:bg-white/10 flex items-center justify-center">
              <Plus className="text-white/60" size={48} />
            </div>
            <p className="text-white text-center mt-4 text-lg font-medium">
              Adicionar Novo
            </p>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="px-6 pb-12 flex flex-col items-center gap-4">
        {selectedCharacter && (
          <Button
            onClick={() => setLocation("/")}
            className="bg-primary hover:bg-primary/80 text-black font-bold px-12 py-3 text-lg"
          >
            Continuar com {selectedCharacter.name}
          </Button>
        )}
        <button
          onClick={() => logout()}
          className="text-white/60 hover:text-white text-sm transition-colors"
        >
          Sair
        </button>
        </div>

        {/* Create Character Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-background border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display text-white">
              Criar Novo Personagem
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="name" className="text-muted-foreground">Nome</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nome do personagem"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div>
              <Label htmlFor="class" className="text-muted-foreground">Classe</Label>
              <Select
                value={formData.class}
                onValueChange={(value) => setFormData({ ...formData, class: value as DnDClass })}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Selecione uma classe" />
                </SelectTrigger>
                <SelectContent className="bg-background border-white/10">
                  {dndClasses.map((cls) => (
                    <SelectItem key={cls} value={cls} className="text-white">
                      {cls}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="avatar" className="text-muted-foreground">Avatar</Label>
              <div className="flex items-center gap-4 mt-2">
                {formData.avatarPreview ? (
                  <img
                    src={formData.avatarPreview}
                    alt="Preview"
                    className="w-24 h-24 rounded-full object-cover border-2 border-primary"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-white/5 border-2 border-dashed border-white/10 flex items-center justify-center">
                    <User className="text-muted-foreground" size={32} />
                  </div>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                >
                  <Upload size={18} className="mr-2" />
                  {formData.avatar ? "Trocar" : "Upload"}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleCreate}
                className="flex-1 bg-primary hover:bg-primary/80 text-black font-bold"
              >
                Criar
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  setFormData({
                    name: "",
                    class: "" as DnDClass | "",
                    avatar: null,
                    avatarPreview: null,
                  });
                }}
                className="bg-white/5 border-white/10 text-white hover:bg-white/10"
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
