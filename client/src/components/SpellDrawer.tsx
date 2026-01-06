import { Drawer } from "vaul";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Star, Clock, Ruler, Shield, Sparkles } from "lucide-react";
import { useSpellDetail } from "@/hooks/use-dnd-api";
import { useFavorites, useAddFavorite, useRemoveFavorite } from "@/hooks/use-favorites";
import { clsx } from "clsx";

interface SpellDrawerProps {
  spellIndex: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SpellDrawer({ spellIndex, isOpen, onClose }: SpellDrawerProps) {
  const { data: spell, isLoading } = useSpellDetail(spellIndex);
  const titleRef = useRef<HTMLHeadingElement>(null);
  
  // Favorites logic
  const { data: favorites } = useFavorites();
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();
  
  const isFavorite = favorites?.some(f => f.spellIndex === spellIndex);

  const toggleFavorite = () => {
    if (!spell || !spellIndex) return;
    
    if (isFavorite) {
      removeFavorite.mutate(spellIndex);
    } else {
      addFavorite.mutate({
        spellIndex: spell.index,
        spellName: spell.name,
        level: String(spell.level),
      });
    }
  };

  // Animate text on open
  useEffect(() => {
    if (isOpen && spell && titleRef.current) {
      const text = titleRef.current.innerText;
      titleRef.current.innerHTML = text.split("").map(char => 
        `<span class="char opacity-0 inline-block" style="min-width: ${char === ' ' ? '0.3em' : '0'}">${char}</span>`
      ).join("");
      
      gsap.to(".char", {
        opacity: 1,
        y: 0,
        rotateX: 0,
        stagger: 0.03,
        duration: 0.6,
        ease: "back.out(1.7)",
        delay: 0.2
      });
    }
  }, [isOpen, spell]);

  return (
    <Drawer.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
        <Drawer.Content className="bg-background border-t border-white/10 flex flex-col rounded-t-[32px] mt-24 fixed bottom-0 left-0 right-0 max-h-[90vh] z-50 outline-none">
          <div className="p-4 bg-background/50 rounded-t-[32px] flex-1 overflow-y-auto">
            {/* Handle Bar */}
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-white/20 mb-8" />
            
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <Sparkles className="animate-spin text-primary" size={32} />
                <p className="text-muted-foreground font-display tracking-widest animate-pulse">Invocando conhecimento...</p>
              </div>
            ) : spell ? (
              <div className="max-w-md mx-auto pb-safe">
                <div className="flex justify-between items-start mb-6">
                  <h2 
                    ref={titleRef}
                    className="text-3xl font-display text-white text-shadow-glow leading-tight max-w-[80%]"
                  >
                    {spell.name}
                  </h2>
                  <button 
                    onClick={toggleFavorite}
                    className="p-3 rounded-full bg-white/5 hover:bg-white/10 active:scale-95 transition-all"
                  >
                    <Star 
                      className={clsx("transition-colors duration-300", isFavorite ? "fill-primary text-primary" : "text-muted-foreground")} 
                      size={24} 
                    />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-8">
                  <StatBox icon={Clock} label="Tempo de Conjuração" value={spell.casting_time} />
                  <StatBox icon={Ruler} label="Alcance" value={spell.range} />
                  <StatBox icon={Clock} label="Duração" value={spell.duration} />
                  <StatBox icon={Shield} label="Componentes" value={spell.components.join(", ")} />
                </div>

                <div className="space-y-4 text-gray-300 font-body text-lg leading-relaxed">
                  {spell.desc.map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                  
                  {spell.higher_level && spell.higher_level.length > 0 && (
                    <div className="mt-6 p-4 rounded-xl bg-secondary/10 border border-secondary/20">
                      <h4 className="text-secondary-foreground font-display mb-2 text-sm uppercase tracking-widest">Em Níveis Superiores</h4>
                      {spell.higher_level.map((p, i) => (
                        <p key={i} className="text-secondary-foreground/80 text-base">{p}</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>As páginas estão em branco...</p>
              </div>
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

function StatBox({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col items-center text-center">
      <Icon className="text-primary mb-2 opacity-80" size={18} />
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{label}</span>
      <span className="font-semibold text-sm text-gray-200">{value}</span>
    </div>
  );
}
