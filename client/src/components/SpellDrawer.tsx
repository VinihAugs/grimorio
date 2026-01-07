import { Drawer } from "vaul";
import { DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { useEffect, useRef, useState, useMemo } from "react";
import gsap from "gsap";
import { Star, Clock, Ruler, Shield, Sparkles, Sword, School, Users, BookOpen, FlaskConical } from "lucide-react";
import { useLocalSpellDetail } from "@/hooks/use-local-spells";
import { useFavorites, useAddFavorite, useRemoveFavorite } from "@/hooks/use-favorites";
import { useTranslate } from "@/hooks/use-translate";
import { translateSpellFields } from "@/utils/spell-field-translations";
import { translateSpellNameSync } from "@/data/spell-translations";
import { translateSchool, translateAttackType, translateDamageType } from "@/utils/spell-school-translations";
import { clsx } from "clsx";
import { useCharacter } from "@/contexts/CharacterContext";

interface SpellDrawerProps {
  spellIndex: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SpellDrawer({ spellIndex, isOpen, onClose }: SpellDrawerProps) {
  const { data: spell, isLoading } = useLocalSpellDetail(spellIndex);
  const titleRef = useRef<HTMLHeadingElement>(null);
  
  // O convertLocalSpellToSpellDetail já usa descriptionPt se disponível
  // Então spell.desc já deve estar traduzido se descriptionPt existir no JSON
  // Não precisamos tentar traduzir via API se já temos a tradução
  
  const descArray = useMemo(() => {
    if (!spell?.desc) return undefined;
    const desc = Array.isArray(spell.desc) ? spell.desc : [spell.desc];
    // Filtrar strings vazias e garantir que são strings
    return desc.filter(d => d && typeof d === 'string' && d.trim().length > 0);
  }, [spell?.desc, spellIndex]);
  
  const higherLevelArray = useMemo(() => {
    if (!spell?.higher_level) return undefined;
    if (Array.isArray(spell.higher_level)) {
      const filtered = spell.higher_level.filter(h => h && typeof h === 'string' && h.trim().length > 0);
      return filtered.length > 0 ? filtered : undefined;
    }
    // Se não for array, converter para array
    const higherLevel = spell.higher_level as string;
    return higherLevel && higherLevel.trim() ? [higherLevel] : undefined;
  }, [spell?.higher_level, spellIndex]);
  
  // Verificar se o texto já está em português (contém palavras comuns em português)
  // Se estiver, não precisa traduzir via API
  const isAlreadyTranslated = useMemo(() => {
    if (!descArray || descArray.length === 0) return false;
    const firstDesc = descArray[0];
    // Verificar se contém palavras comuns em português
    return /(você|esta|esse|aquele|com|para|por|que|uma|um|o|a|de|da|do|em|na|no|ao|à|seu|sua|seus|suas|dano|feitiço|conjuração|alcance|duração)/i.test(firstDesc);
  }, [descArray]);
  
  const materialIsTranslated = useMemo(() => {
    if (!spell?.material) return false;
    return /(você|esta|esse|aquele|com|para|por|que|uma|um|o|a|de|da|do|em|na|no|ao|à)/i.test(spell.material);
  }, [spell?.material]);
  
  // NÃO traduzir via API se já estiver traduzido
  // Como todas as descrições já foram traduzidas no JSON, não precisamos mais usar a API
  const needsTranslation = false; // Desabilitado - todas as traduções estão no JSON
  
  const { data: translatedDesc, isLoading: isTranslatingDesc } = useTranslate(
    undefined, // Nunca traduzir via API
    spellIndex ? `desc-${spellIndex}` : undefined
  );
  const { data: translatedHigherLevel, isLoading: isTranslatingHigher } = useTranslate(
    undefined, // Nunca traduzir via API
    spellIndex ? `higher-${spellIndex}` : undefined
  );
  
  // Tradução do componente material - também desabilitado
  const materialText = undefined; // Nunca traduzir via API
  
  const { data: translatedMaterial, isLoading: isTranslatingMaterial } = useTranslate(
    undefined, // Nunca traduzir via API
    spellIndex ? `material-${spellIndex}` : undefined
  );
  
  const isTranslating = false; // Nunca traduzir
  
  // Traduzir campos do feitiço (casting time, range, duration, components)
  const translatedFields = useMemo(() => {
    if (!spell) return null;
    return translateSpellFields({
      casting_time: spell.casting_time,
      range: spell.range,
      duration: spell.duration,
      components: spell.components,
    });
  }, [spell]);
  
  // Traduzir nome do feitiço
  const translatedSpellName = useMemo(() => {
    if (!spell) return "";
    return translateSpellNameSync(spell.index, spell.name);
  }, [spell]);
  
  // Favorites logic
  const { selectedCharacter } = useCharacter();
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
        // Adicionar characterId se houver personagem selecionado
        ...(selectedCharacter?.id && { characterId: selectedCharacter.id }),
      });
    }
  };

  // Animate text on open
  useEffect(() => {
    if (isOpen && spell && titleRef.current) {
      const text = translatedSpellName || spell.name;
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
  }, [isOpen, spell, translatedSpellName]);

  return (
    <Drawer.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
        <Drawer.Content className="bg-background border-t border-white/10 flex flex-col rounded-t-[32px] mt-24 fixed bottom-0 left-0 right-0 max-h-[90vh] z-50 outline-none">
          {/* Título e Descrição para acessibilidade (ocultos visualmente) */}
          <DrawerTitle className="sr-only">
            {spell ? (translatedSpellName || spell.name) : "Detalhes da Magia"}
          </DrawerTitle>
          <DrawerDescription className="sr-only">
            {spell ? `Detalhes completos da magia ${translatedSpellName || spell.name}` : "Carregando detalhes da magia"}
          </DrawerDescription>
          
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
                    {translatedSpellName || spell.name}
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

                {/* Informações Básicas */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <StatBox 
                    icon={Clock} 
                    label="Tempo de Conjuração" 
                    value={translatedFields?.casting_time || spell.casting_time} 
                  />
                  <StatBox 
                    icon={Ruler} 
                    label="Alcance" 
                    value={translatedFields?.range || spell.range} 
                  />
                  <StatBox 
                    icon={Clock} 
                    label="Duração" 
                    value={translatedFields?.duration || spell.duration} 
                  />
                  <StatBox 
                    icon={Shield} 
                    label="Componentes" 
                    value={translatedFields?.components || spell.components.join(", ")} 
                  />
                </div>

                {/* Informações Adicionais */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {spell.school && (
                    <StatBox 
                      icon={School} 
                      label="Escola" 
                      value={translateSchool(spell.school.name)} 
                    />
                  )}
                  {spell.attack_type && (
                    <StatBox 
                      icon={Sword} 
                      label="Tipo de Ataque" 
                      value={translateAttackType(spell.attack_type)} 
                    />
                  )}
                  {spell.ritual && (
                    <StatBox 
                      icon={BookOpen} 
                      label="Ritual" 
                      value="Sim" 
                    />
                  )}
                  {spell.concentration && (
                    <StatBox 
                      icon={Sparkles} 
                      label="Concentração" 
                      value="Sim" 
                    />
                  )}
                </div>

                {/* Material */}
                {spell.material && (
                  <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-start gap-3">
                      <FlaskConical className="text-primary mt-0.5 shrink-0" size={18} />
                      <div>
                        <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-1">
                          Componente Material
                        </span>
                        {isTranslatingMaterial ? (
                          <div className="flex items-center gap-2">
                            <Sparkles className="animate-spin text-primary" size={14} />
                            <span className="text-xs text-muted-foreground">Traduzindo...</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-200">
                            {spell.material}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Dano */}
                {spell.damage && (
                  <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="space-y-3">
                      {spell.damage.damage_type && (
                        <div>
                          <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-1">
                            Tipo de Dano
                          </span>
                          <span className="text-sm text-gray-200 font-semibold">
                            {translateDamageType(spell.damage.damage_type.name)}
                          </span>
                        </div>
                      )}
                      {spell.damage.damage_at_slot_level && Object.keys(spell.damage.damage_at_slot_level).length > 0 && (
                        <div>
                          <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-2">
                            Dano por Nível de Slot
                          </span>
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(spell.damage.damage_at_slot_level).map(([level, damage]) => (
                              <div key={level} className="text-xs">
                                <span className="text-muted-foreground">Nv. {level}:</span>{" "}
                                <span className="text-primary font-semibold">{damage}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {spell.damage.damage_at_character_level && Object.keys(spell.damage.damage_at_character_level).length > 0 && (
                        <div>
                          <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-2">
                            Dano por Nível de Personagem
                          </span>
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(spell.damage.damage_at_character_level).map(([level, damage]) => (
                              <div key={level} className="text-xs">
                                <span className="text-muted-foreground">Nv. {level}:</span>{" "}
                                <span className="text-primary font-semibold">{damage}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Classes e Subclasses */}
                {(spell.classes || spell.subclasses) && (
                  <div className="mb-6 space-y-3">
                    {spell.classes && spell.classes.length > 0 && (
                      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="flex items-start gap-3">
                          <Users className="text-primary mt-0.5 shrink-0" size={18} />
                          <div className="flex-1">
                            <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-2">
                              Classes
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {spell.classes.map((cls, i) => (
                                <span 
                                  key={i}
                                  className="text-xs px-2 py-1 rounded-md bg-primary/10 text-primary border border-primary/20"
                                >
                                  {cls.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {spell.subclasses && spell.subclasses.length > 0 && (
                      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="flex items-start gap-3">
                          <BookOpen className="text-primary mt-0.5 shrink-0" size={18} />
                          <div className="flex-1">
                            <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-2">
                              Subclasses
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {spell.subclasses.map((subclass, i) => (
                                <span 
                                  key={i}
                                  className="text-xs px-2 py-1 rounded-md bg-secondary/10 text-secondary-foreground border border-secondary/20"
                                >
                                  {subclass.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-4 text-gray-300 font-body text-lg leading-relaxed">
                  {/* Usar descArray diretamente - já vem traduzido do JSON via convertLocalSpellToSpellDetail */}
                  {(descArray || []).map((paragraph: string, i: number) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                  
                  {higherLevelArray && higherLevelArray.length > 0 ? (
                    <div className="mt-6 p-4 rounded-xl bg-secondary/10 border border-secondary/20">
                      <h4 className="text-secondary-foreground font-display mb-2 text-sm uppercase tracking-widest">Em Níveis Superiores</h4>
                      {higherLevelArray.map((p: string, i: number) => (
                        <p key={i} className="text-secondary-foreground/80 text-base">{p}</p>
                      ))}
                    </div>
                  ) : null}
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
