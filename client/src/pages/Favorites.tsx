import { useState, useMemo } from "react";
import { useFavorites } from "@/hooks/use-favorites";
import { StickyHeader } from "@/components/StickyHeader";
import { SpellCard } from "@/components/SpellCard";
import { SpellDrawer } from "@/components/SpellDrawer";
import { Sparkles, Star } from "lucide-react";

export default function Favorites() {
  const { data: favorites, isLoading } = useFavorites();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpellIndex, setSelectedSpellIndex] = useState<string | null>(null);

  const filteredFavorites = useMemo(() => {
    if (!favorites) return [];
    const term = searchTerm.toLowerCase();
    return favorites.filter(fav => 
      fav.spellName.toLowerCase().includes(term) ||
      fav.spellIndex.toLowerCase().includes(term)
    );
  }, [favorites, searchTerm]);

  // Transform favorite to SpellListItem shape for the card
  const getSpellItem = (fav: any) => ({
    index: fav.spellIndex,
    name: fav.spellName,
    level: Number(fav.level),
    url: `/api/spells/${fav.spellIndex}`
  });

  return (
    <div className="min-h-screen bg-background pb-24 grimoire-texture">
      <StickyHeader 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm} 
        title="Feitiços Preparados" 
      />

      <main className="px-6 pt-6 max-w-md mx-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Sparkles className="animate-spin text-primary" size={32} />
          </div>
        ) : filteredFavorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-50">
            <Star size={48} className="text-muted-foreground" />
            <p className="text-muted-foreground font-body max-w-xs">
              Você ainda não preparou nenhum feitiço. Marque-os com uma estrela no Grimório para adicioná-los aqui.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredFavorites.map((fav, index) => (
              <SpellCard 
                key={fav.id}
                spell={getSpellItem(fav)} 
                index={index}
                onClick={() => setSelectedSpellIndex(fav.spellIndex)} 
              />
            ))}
          </div>
        )}
      </main>

      <SpellDrawer 
        spellIndex={selectedSpellIndex} 
        isOpen={!!selectedSpellIndex} 
        onClose={() => setSelectedSpellIndex(null)} 
      />
    </div>
  );
}
