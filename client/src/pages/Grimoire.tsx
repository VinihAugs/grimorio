import { useState, useMemo, useEffect, useRef } from "react";
import gsap from "gsap";
import { useFilteredLocalSpells } from "@/hooks/use-local-spells";
import { useCharacter } from "@/contexts/CharacterContext";
import { useFavorites } from "@/hooks/use-favorites";
import { StickyHeader } from "@/components/StickyHeader";
import { SpellCard } from "@/components/SpellCard";
import { SpellDrawer } from "@/components/SpellDrawer";
import { SpellFiltersModal } from "@/components/SpellFiltersModal";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { translateSpellNameSync, preloadTranslations } from "@/data/spell-translations";
import type { DnDClass } from "@shared/character-schema";
import { dndClasses } from "@shared/character-schema";
import { useVantaCells } from "@/hooks/use-vanta-cells";

export default function Grimoire() {
  const { selectedCharacter } = useCharacter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpellIndex, setSelectedSpellIndex] = useState<string | null>(null);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [filters, setFilters] = useState<{
    level: number | null;
    school: string | null;
    class: DnDClass | null;
  }>({
    level: null,
    school: null,
    class: null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const listRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const vantaRef = useVantaCells();

  // Determinar qual classe usar: filtro tem prioridade sobre personagem
  const activeClass = filters.class || selectedCharacter?.class || null;
  
  // Verificar se há filtros ativos
  const hasActiveFilters = filters.level !== null || filters.school !== null || filters.class !== null;
  
  // Usar dados locais do JSON - muito mais rápido!
  const { data: spells, isLoading, error } = useFilteredLocalSpells({
    class: hasActiveFilters ? activeClass : null, // Só usar classe se houver filtros ativos
    level: filters.level,
    school: filters.school,
  });


  // Buscar favoritos para verificar quais magias são conhecidas
  const { data: favorites } = useFavorites();
  const favoriteIndexes = useMemo(() => {
    return new Set(favorites?.map(f => f.spellIndex) || []);
  }, [favorites]);

  // Get unique levels from spells
  const availableLevels = useMemo(() => {
    if (!spells) return [];
    const levels = new Set(spells.map(spell => spell.level));
    return Array.from(levels).sort((a, b) => a - b);
  }, [spells]);

  // Não precisamos mais buscar detalhes separadamente
  // O hook useFilteredSpells já faz isso quando necessário usando Promise.all
  const isLoadingDetails = false;

  // Pré-carregar traduções quando os feitiços forem carregados
  useEffect(() => {
    if (spells && spells.length > 0) {
      preloadTranslations(spells);
    }
  }, [spells]);

  const filteredSpells = useMemo(() => {
    if (!spells) return [];
    const term = searchTerm.toLowerCase();
    
    // Filtrar e traduzir (usando versão síncrona que usa cache)
    let filtered = spells
      .map(spell => {
        const cleanName = spell.name.replace(/<[^>]*>/g, '').trim();
        const translated = translateSpellNameSync(spell.index, cleanName);
        return {
          ...spell,
          translatedName: translated
        };
      })
      .filter(spell => {
        // Filtro de busca
        const matchesSearch = 
          spell.translatedName.toLowerCase().includes(term) ||
          spell.name.toLowerCase().includes(term) ||
          spell.index.toLowerCase().includes(term);
        
        // Se não há filtros ativos, mostrar todas as magias (apenas filtrar por busca)
        if (!hasActiveFilters) {
          return matchesSearch;
        }
        
        // Se há filtros ativos, os filtros de nível e escola já foram aplicados pela API
        // (exceto quando há classe + nível/escola, que é filtrado no hook)
        // Aqui só precisamos filtrar por busca de texto
        
        return matchesSearch;
      });
    
    // Ordenar por nível primeiro, depois alfabeticamente
    filtered.sort((a, b) => {
      // Primeiro ordena por nível (ascendente)
      if (a.level !== b.level) {
        return a.level - b.level;
      }
      // Se o nível for igual, ordena alfabeticamente pelo nome traduzido
      return a.translatedName.localeCompare(b.translatedName, 'pt-BR');
    });
    
    return filtered;
  }, [spells, searchTerm, hasActiveFilters]);

  // Resetar página quando filtros mudarem
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, searchTerm]);

  // Scroll para o topo quando a página mudar
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  // Calcular paginação
  const paginatedSpells = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredSpells.slice(startIndex, endIndex);
  }, [filteredSpells, currentPage]);

  const totalPages = Math.ceil(filteredSpells.length / itemsPerPage);

  // Initial Entry Animation
  useEffect(() => {
    if (!isLoading && !isLoadingDetails && paginatedSpells.length > 0 && listRef.current) {
      const cards = listRef.current.querySelectorAll(".spell-card-anim");
      gsap.fromTo(
        cards,
        { y: 50, opacity: 0, scale: 0.95 },
        { 
          y: 0, 
          opacity: 1, 
          scale: 1,
          stagger: 0.03, 
          ease: "power3.out", 
          duration: 0.6,
          clearProps: "all"
        }
      );
    }
  }, [isLoading, isLoadingDetails, paginatedSpells.length, currentPage]);

  // Não precisa mais verificar personagem selecionado - sempre mostra todas as magias por padrão

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen px-6 text-center grimoire-texture">
        <div className="space-y-4">
          <div className="relative">
            <Sparkles className="h-16 w-16 text-destructive mx-auto animate-pulse" />
            <div className="absolute inset-0 bg-destructive/20 blur-xl rounded-full" />
          </div>
          <h2 className="text-destructive font-display text-xl tracking-widest">CONEXÃO CORTADA</h2>
          <p className="text-muted-foreground font-body">As energias arcanas estão perturbadas.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32 relative overflow-hidden">
      <div ref={vantaRef} className="absolute inset-0 z-0" />
      <div className="relative z-10">

      <StickyHeader 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm}
        onFilterClick={() => setShowFiltersModal(true)}
        hasActiveFilters={filters.level !== null || filters.school !== null || filters.class !== null}
      />

      {/* Results count */}
      {!isLoading && !isLoadingDetails && filteredSpells.length > 0 && (
        <div className="px-6 pt-4 pb-2 max-w-md mx-auto">
          <p className="text-xs text-muted-foreground font-sans uppercase tracking-widest">
            {filteredSpells.length} {filteredSpells.length === 1 ? "encantamento encontrado" : "encantamentos encontrados"}
          </p>
        </div>
      )}

      <main className="px-6 pt-4 max-w-md mx-auto relative" ref={containerRef}>
        <div ref={listRef} className="space-y-3">
          {isLoading || isLoadingDetails ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="relative">
                <Sparkles className="animate-spin text-primary" size={32} />
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
              </div>
              <p className="text-muted-foreground font-display tracking-widest animate-pulse">
                {isLoading ? "Consultando os tomos..." : "Aplicando filtros..."}
              </p>
            </div>
          ) : filteredSpells.length === 0 ? (
            <div className="text-center py-20 space-y-4">
              <div className="relative inline-block">
                <Sparkles className="h-12 w-12 text-muted-foreground/30 mx-auto" />
                <div className="absolute inset-0 bg-muted-foreground/10 blur-xl rounded-full" />
              </div>
              <p className="text-muted-foreground font-body italic">
                Nenhum feitiço encontrado com essa descrição.
              </p>
              {(searchTerm || filters.level !== null || filters.school !== null || filters.class !== null) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setFilters({ level: null, school: null, class: null });
                  }}
                  className="mt-4 bg-white/5 border-white/10 text-white hover:bg-white/10"
                >
                  Limpar filtros
                </Button>
              )}
            </div>
          ) : (
            <>
              {paginatedSpells.map((spell, index) => {
                const globalIndex = (currentPage - 1) * itemsPerPage + index;
                const isFavorite = favoriteIndexes.has(spell.index);
                return (
                  <div key={spell.index} className="spell-card-anim"> 
                    <SpellCard 
                      spell={{
                        ...spell,
                        name: spell.translatedName // Usar nome traduzido
                      }} 
                      index={globalIndex}
                      isFavorite={isFavorite}
                      onClick={() => setSelectedSpellIndex(spell.index)} 
                    />
                  </div>
                );
              })}
            </>
          )}
        </div>
      </main>

      {/* Paginação */}
      {!isLoading && !isLoadingDetails && totalPages > 1 && (
        <div className="px-6 pt-6 pb-4 max-w-md mx-auto">
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="bg-white/5 border-white/10 text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className={
                      currentPage === pageNum
                        ? "bg-primary text-black hover:bg-primary/90 min-w-[40px]"
                        : "bg-white/5 border-white/10 text-white hover:bg-white/10 min-w-[40px]"
                    }
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="bg-white/5 border-white/10 text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Próxima
            </Button>
          </div>
        </div>
      )}

        <SpellDrawer 
          spellIndex={selectedSpellIndex} 
          isOpen={!!selectedSpellIndex} 
          onClose={() => setSelectedSpellIndex(null)} 
        />

        <SpellFiltersModal
          isOpen={showFiltersModal}
          onClose={() => setShowFiltersModal(false)}
          onApplyFilters={setFilters}
          onClearFilters={() => {
            setFilters({ level: null, school: null, class: null });
          }}
          currentFilters={filters}
          availableLevels={availableLevels}
          availableClasses={dndClasses}
        />
      </div>
    </div>
  );
}
