import { useState, useEffect } from "react";
import { Skull, Scroll, Zap, LogOut, Check, X, ChevronUp, ChevronDown, Settings, BookOpen } from "lucide-react";
import { clsx } from "clsx";
import { useAuth } from "@/contexts/AuthContext";
import { useFavorites } from "@/hooks/use-favorites";
import { useCharacter } from "@/contexts/CharacterContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ClassIcon } from "@/components/ClassIcon";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Profile() {
  const { user, logout } = useAuth();
  const { data: favorites } = useFavorites();
  const { selectedCharacter, updateCharacter } = useCharacter();
  const [location, setLocation] = useLocation();
  const [isEditingLevel, setIsEditingLevel] = useState(false);
  const [levelValue, setLevelValue] = useState(String(selectedCharacter?.level || 1));

  // Atualiza o valor do nível quando o personagem selecionado mudar
  useEffect(() => {
    if (selectedCharacter) {
      setLevelValue(String(selectedCharacter.level || 1));
    }
  }, [selectedCharacter]);

  const handleLogout = async () => {
    await logout();
  };

  const handleLevelClick = () => {
    if (!selectedCharacter) {
      alert("Selecione um personagem primeiro na tela de seleção de personagens.");
      return;
    }
    setLevelValue(String(selectedCharacter.level || 1));
    setIsEditingLevel(true);
  };

  const handleLevelSave = async () => {
    if (!selectedCharacter?.id) return;
    
    const newLevel = parseInt(levelValue);
    if (isNaN(newLevel) || newLevel < 1 || newLevel > 20) {
      alert("O nível deve ser entre 1 e 20");
      return;
    }

    try {
      await updateCharacter(selectedCharacter.id, { level: newLevel });
      setIsEditingLevel(false);
    } catch (error) {
    }
  };

  const handleLevelChange = (value: string) => {
    // Remove caracteres não numéricos (incluindo pontos decimais, sinais negativos, etc)
    const numericValue = value.replace(/[^0-9]/g, '');
    
    // Se estiver vazio, permite (para poder apagar e digitar novamente)
    if (numericValue === '') {
      setLevelValue('');
      return;
    }
    
    const num = parseInt(numericValue);
    
    // Não permite zero, negativos ou maior que 20
    // Se for zero ou negativo, força para 1
    if (num < 1) {
      setLevelValue('1');
    } else if (num > 20) {
      setLevelValue('20');
    } else {
      // Permite apenas valores inteiros entre 1 e 20
      setLevelValue(numericValue);
    }
  };

  const handleIncrement = () => {
    const current = parseInt(levelValue) || 1;
    if (current < 20) {
      setLevelValue(String(current + 1));
    }
  };

  const handleDecrement = () => {
    const current = parseInt(levelValue) || 1;
    if (current > 1) {
      setLevelValue(String(current - 1));
    }
  };

  const handleLevelCancel = () => {
    setLevelValue(String(selectedCharacter?.level || 1));
    setIsEditingLevel(false);
  };

  return (
    <div 
      className="min-h-screen pb-24 relative"
      style={{
        backgroundImage: 'url(/00320af7c4179486ff62cddd20499322.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="absolute inset-0 bg-background/20 z-0" />
      <div className="relative z-10">
      <header className="px-6 pt-safe pt-12 pb-8 bg-gradient-to-b from-secondary/20 to-transparent">
        <div className="flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-[#0f0f0f] border-2 border-primary p-1 mb-4 shadow-[0_0_20px_rgba(74,222,128,0.3)]">
            <div className="w-full h-full rounded-full bg-secondary/20 flex items-center justify-center overflow-hidden">
              {selectedCharacter?.avatar ? (
               <img 
                  src={selectedCharacter.avatar} 
                  alt={selectedCharacter.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Skull className="text-primary opacity-60" size={40} />
              )}
            </div>
          </div>
          <h1 className="text-2xl font-display text-white tracking-widest text-shadow-glow">
            {selectedCharacter?.name || "Sem Personagem"}
          </h1>
        </div>
      </header>

      <main className="px-6 max-w-md mx-auto space-y-6">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard icon={Scroll} label="Feitiços Favoritos" value={String(favorites?.length || 0)} />
          <StatCard 
            icon={selectedCharacter?.class ? () => <ClassIcon className={selectedCharacter.class} size={20} iconClassName="text-primary opacity-80" /> : Skull} 
            label="Classe" 
            value={selectedCharacter?.class || "N/A"} 
          />
          <StatCard 
            icon={Zap} 
            label="Nível" 
            value={selectedCharacter ? String(selectedCharacter.level || 1) : "N/A"} 
            onClick={handleLevelClick}
            editable={!!selectedCharacter}
          />
          <StatCard icon={Zap} label="Status" value="Online" />
        </div>

        {/* Grimório */}
        <button
          onClick={() => {
            if (!selectedCharacter) {
              alert("Selecione um personagem primeiro na tela de seleção de personagens.");
              return;
            }
            setLocation("/grimoire-notes");
          }}
          className="w-full bg-black/50 border border-white/10 rounded-2xl p-6 backdrop-blur-sm hover:bg-black/60 transition-colors text-left shadow-lg shadow-black/50"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="text-primary" size={24} />
              <h3 className="font-display text-lg text-white">Grimório</h3>
            </div>
            <ChevronUp className="text-muted-foreground rotate-90" size={20} />
          </div>
        </button>

        {/* Botão Alterar Perfil */}
        <button 
          onClick={() => setLocation("/characters")}
          className="w-full py-4 rounded-xl border-2 border-primary/60 text-primary font-display tracking-widest bg-black/40 hover:bg-black/50 transition-colors uppercase text-sm flex items-center justify-center gap-2"
        >
          <Settings size={18} />
          Alterar Perfil
        </button>

        {/* Botão Sair */}
        <button 
          onClick={handleLogout}
          className="w-full py-4 rounded-xl border-2 border-destructive/80 text-destructive font-display tracking-widest bg-black/40 hover:bg-black/50 transition-colors uppercase text-sm flex items-center justify-center gap-2"
        >
          <LogOut size={18} />
          Sair
        </button>

      </main>

      {/* Dialog para editar nível */}
      <Dialog open={isEditingLevel} onOpenChange={setIsEditingLevel}>
        <DialogContent className="bg-background border-white/10 text-white !rounded-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display text-white">
              EDITAR NÍVEL
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            <div>
              <label className="text-muted-foreground text-sm mb-3 block">
                Nível do Personagem (1-20)
              </label>
              <div className="relative flex items-center">
                <button
                  type="button"
                  onClick={handleDecrement}
                  disabled={parseInt(levelValue) <= 1}
                  className="absolute left-2 w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronDown className="text-primary" size={20} />
                </button>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={levelValue}
                  onChange={(e) => handleLevelChange(e.target.value)}
                  className="bg-white/5 border-primary text-white text-center text-3xl font-bold h-16 pl-14 pr-14"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleLevelSave();
                    } else if (e.key === "Escape") {
                      handleLevelCancel();
                    } else if (e.key === "ArrowUp") {
                      e.preventDefault();
                      handleIncrement();
                    } else if (e.key === "ArrowDown") {
                      e.preventDefault();
                      handleDecrement();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleIncrement}
                  disabled={parseInt(levelValue) >= 20}
                  className="absolute right-2 w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronUp className="text-primary" size={20} />
                </button>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleLevelSave}
                className="flex-1 bg-primary hover:bg-primary/80 text-black font-bold h-11"
              >
                <Check size={18} className="mr-2" />
                Salvar
              </Button>
              <Button
                variant="outline"
                onClick={handleLevelCancel}
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

function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  editable = false,
  onClick 
}: { 
  icon: any, 
  label: string, 
  value: string,
  editable?: boolean,
  onClick?: () => void
}) {
  return (
    <div 
      className={clsx(
        "bg-black/50 border border-white/10 rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all shadow-lg shadow-black/50",
        editable 
          ? "cursor-pointer hover:bg-black/60 hover:border-primary/50 active:scale-95" 
          : "hover:bg-black/60"
      )}
      onClick={editable ? onClick : undefined}
    >
      <Icon className="text-primary mb-2 opacity-80" size={20} />
      <span className="text-2xl font-display text-white mb-1">{value}</span>
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
    </div>
  );
}

function Ability({ name, desc }: { name: string, desc: string }) {
  return (
    <div>
      <h4 className="text-primary font-sans font-semibold text-sm mb-1">{name}</h4>
      <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
    </div>
  );
}
