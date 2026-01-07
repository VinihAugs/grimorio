import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import type { DnDClass } from "@shared/character-schema";

interface SpellFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: {
    level: number | null;
    school: string | null;
    class: DnDClass | null;
  }) => void;
  onClearFilters: () => void;
  currentFilters: {
    level: number | null;
    school: string | null;
    class: DnDClass | null;
  };
  availableLevels: number[];
  availableClasses: readonly DnDClass[];
}

// Escolas de magia de D&D 5e
const magicSchools = [
  { value: "abjuration", label: "Abjuração" },
  { value: "conjuration", label: "Conjuração" },
  { value: "divination", label: "Adivinhação" },
  { value: "enchantment", label: "Encantamento" },
  { value: "evocation", label: "Evocação" },
  { value: "illusion", label: "Ilusão" },
  { value: "necromancy", label: "Necromancia" },
  { value: "transmutation", label: "Transmutação" },
];

export function SpellFiltersModal({
  isOpen,
  onClose,
  onApplyFilters,
  onClearFilters,
  currentFilters,
  availableLevels,
  availableClasses,
}: SpellFiltersModalProps) {
  const [localFilters, setLocalFilters] = useState(currentFilters);

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleClear = () => {
    const clearedFilters = {
      level: null,
      school: null,
      class: null,
    };
    setLocalFilters(clearedFilters);
    onClearFilters();
    onClose();
  };

  const hasActiveFilters = 
    localFilters.level !== null || 
    localFilters.school !== null || 
    localFilters.class !== null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-background border-white/10 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display text-white tracking-widest">
            FILTROS
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Filtro por Nível */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground uppercase tracking-widest">
              Nível
            </Label>
            <Select
              value={localFilters.level?.toString() || "all"}
              onValueChange={(value) =>
                setLocalFilters({
                  ...localFilters,
                  level: value === "all" ? null : parseInt(value),
                })
              }
            >
              <SelectTrigger className="bg-white/5 border-white/10 text-white hover:bg-white/10">
                <SelectValue placeholder="Todos os níveis" />
              </SelectTrigger>
              <SelectContent className="bg-background border-white/10">
                <SelectItem value="all" className="text-white hover:bg-white/10">
                  Todos os níveis
                </SelectItem>
                {availableLevels.map((level) => (
                  <SelectItem
                    key={level}
                    value={level.toString()}
                    className="text-white hover:bg-white/10"
                  >
                    Nível {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por Escola de Magia */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground uppercase tracking-widest">
              Escola de Magia
            </Label>
            <Select
              value={localFilters.school || "all"}
              onValueChange={(value) =>
                setLocalFilters({
                  ...localFilters,
                  school: value === "all" ? null : value,
                })
              }
            >
              <SelectTrigger className="bg-white/5 border-white/10 text-white hover:bg-white/10">
                <SelectValue placeholder="Todas as escolas" />
              </SelectTrigger>
              <SelectContent className="bg-background border-white/10">
                <SelectItem value="all" className="text-white hover:bg-white/10">
                  Todas as escolas
                </SelectItem>
                {magicSchools.map((school) => (
                  <SelectItem
                    key={school.value}
                    value={school.value}
                    className="text-white hover:bg-white/10"
                  >
                    {school.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por Classe */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground uppercase tracking-widest">
              Classe
            </Label>
            <Select
              value={localFilters.class || "all"}
              onValueChange={(value) =>
                setLocalFilters({
                  ...localFilters,
                  class: value === "all" ? null : (value as DnDClass),
                })
              }
            >
              <SelectTrigger className="bg-white/5 border-white/10 text-white hover:bg-white/10">
                <SelectValue placeholder="Todas as classes" />
              </SelectTrigger>
              <SelectContent className="bg-background border-white/10">
                <SelectItem value="all" className="text-white hover:bg-white/10">
                  Todas as classes
                </SelectItem>
                {availableClasses.map((dndClass) => (
                  <SelectItem
                    key={dndClass}
                    value={dndClass}
                    className="text-white hover:bg-white/10"
                  >
                    {dndClass}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleClear}
              variant="outline"
              className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10"
              disabled={!hasActiveFilters}
            >
              <X size={16} className="mr-2" />
              Limpar
            </Button>
            <Button
              onClick={handleApply}
              className="flex-1 bg-primary hover:bg-primary/80 text-black font-bold"
            >
              Filtrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

