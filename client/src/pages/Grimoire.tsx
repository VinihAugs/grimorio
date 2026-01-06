import { useState, useMemo, useEffect, useRef } from "react";
import gsap from "gsap";
import { useNecromancySpells } from "@/hooks/use-dnd-api";
import { StickyHeader } from "@/components/StickyHeader";
import { SpellCard } from "@/components/SpellCard";
import { SpellDrawer } from "@/components/SpellDrawer";
import { Sparkles } from "lucide-react";

export default function Grimoire() {
  const { data: spells, isLoading, error } = useNecromancySpells();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpellIndex, setSelectedSpellIndex] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filteredSpells = useMemo(() => {
    if (!spells) return [];
    const term = searchTerm.toLowerCase();
    return spells.filter(spell => 
      spell.name.toLowerCase().includes(term) ||
      spell.index.toLowerCase().includes(term)
    );
  }, [spells, searchTerm]);

  // Initial Entry Animation
  useEffect(() => {
    if (!isLoading && filteredSpells.length > 0 && listRef.current) {
      gsap.fromTo(
        ".spell-card-anim",
        { y: 50, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          stagger: 0.05, 
          ease: "power3.out", 
          duration: 0.8,
          clearProps: "all" // Important for interactions later
        }
      );
    }
  }, [isLoading, filteredSpells.length]); // Re-run if filter changes significantly if desired, but mostly on mount

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen px-6 text-center">
        <div className="space-y-4">
          <h2 className="text-destructive font-display text-xl">Conexão Cortada</h2>
          <p className="text-muted-foreground">As energias arcanas estão perturbadas.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 grimoire-texture">
      <StickyHeader searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      <main className="px-6 pt-6 max-w-md mx-auto" ref={listRef}>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Sparkles className="animate-spin text-primary" size={32} />
            <p className="text-muted-foreground font-display tracking-widest animate-pulse">Consultando os tomos...</p>
          </div>
        ) : filteredSpells.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground font-body italic">Nenhum feitiço encontrado com essa descrição.</p>
          </div>
        ) : (
          filteredSpells.map((spell, index) => (
            <div key={spell.index} className="spell-card-anim opacity-0"> 
              {/* Wrapper for GSAP to target without messing up component refs */}
              <SpellCard 
                spell={spell} 
                index={index}
                onClick={() => setSelectedSpellIndex(spell.index)} 
              />
            </div>
          ))
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
