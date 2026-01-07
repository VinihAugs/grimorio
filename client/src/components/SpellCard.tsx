import { useRef, useState } from "react";
import gsap from "gsap";
import { clsx } from "clsx";
import { Skull, ChevronRight } from "lucide-react";
import type { SpellListItem } from "@/hooks/use-local-spells";

interface SpellCardProps {
  spell: SpellListItem;
  onClick: () => void;
  index: number;
  isFavorite: boolean;
}

export function SpellCard({ spell, onClick, isFavorite }: SpellCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleTouchStart = () => {
    gsap.to(cardRef.current, { scale: 0.97, duration: 0.1, ease: "power1.out" });
  };

  const handleTouchEnd = () => {
    gsap.to(cardRef.current, { scale: 1, duration: 0.3, ease: "elastic.out(1, 0.5)" });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    gsap.to(cardRef.current, {
      y: -2,
      boxShadow: "0 10px 30px rgba(74, 222, 128, 0.15)",
      duration: 0.3,
      ease: "power2.out"
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    gsap.to(cardRef.current, {
      y: 0,
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
      duration: 0.3,
      ease: "power2.out"
    });
  };

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={(e) => {
        handleTouchEnd();
        handleMouseLeave();
      }}
      className={clsx(
        "relative group p-5 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden",
        "bg-gradient-to-br from-black/40 to-black/30 backdrop-blur-md",
        "border-white/10 hover:border-primary/30",
        "shadow-2xl shadow-black/50 hover:shadow-black/70",
        "active:scale-[0.97]"
      )}
    >
      {/* Animated background gradient */}
      <div 
        className={clsx(
          "absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 transition-opacity duration-500",
          isHovered ? "opacity-10" : "opacity-0"
        )}
      />
      
      {/* Decorative corner accents */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-primary/10 via-primary/5 to-transparent rounded-bl-2xl opacity-50" />
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-primary/5 to-transparent rounded-tr-2xl opacity-30" />
      
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(circle_at_1px_1px,_white_1px,_transparent_0)] bg-[length:20px_20px]" />
      
      <div className="relative flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className={clsx(
            "text-lg font-display transition-colors duration-300",
            "text-gray-100 group-hover:text-primary",
            "truncate"
          )}>
            {spell.name.replace(/<[^>]*>/g, '').trim() || spell.name}
          </h3>
          <div className="flex items-center mt-2 gap-2 flex-wrap">
            <span className={clsx(
              "text-xs font-sans uppercase tracking-widest px-2.5 py-1 rounded-md",
              "bg-primary/10 text-primary border border-primary/20",
              "backdrop-blur-sm"
            )}>
              Nv. {spell.level}
            </span>
            <span className={clsx(
              "text-xs font-sans uppercase tracking-widest",
              isFavorite ? "text-primary" : "text-muted-foreground/70"
            )}>
              • {isFavorite ? "Magia Conhecida" : "Magia Desconhecida"}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          <Skull 
            size={22} 
            className={clsx(
              "transition-all duration-300",
              isHovered ? "text-primary/80 scale-110" : "text-muted-foreground/30"
            )} 
          />
          <ChevronRight 
            size={16} 
            className={clsx(
              "transition-all duration-300",
              isHovered ? "text-primary translate-x-1 opacity-100" : "text-muted-foreground/20 opacity-0"
            )} 
          />
        </div>
      </div>

      {/* Hover glow effect */}
      <div 
        className={clsx(
          "absolute inset-0 rounded-2xl transition-opacity duration-500 pointer-events-none",
          "bg-gradient-to-r from-transparent via-primary/5 to-transparent",
          isHovered ? "opacity-100" : "opacity-0"
        )}
        style={{
          background: isHovered 
            ? "radial-gradient(circle at 50% 50%, rgba(74, 222, 128, 0.1), transparent 70%)"
            : "transparent"
        }}
      />
    </div>
  );
}
