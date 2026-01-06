import { useRef } from "react";
import gsap from "gsap";
import { clsx } from "clsx";
import { Skull } from "lucide-react";
import type { SpellListItem } from "@/hooks/use-dnd-api";

interface SpellCardProps {
  spell: SpellListItem;
  onClick: () => void;
  index: number;
}

export function SpellCard({ spell, onClick }: SpellCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = () => {
    gsap.to(cardRef.current, { scale: 0.96, duration: 0.1, ease: "power1.out" });
  };

  const handleTouchEnd = () => {
    gsap.to(cardRef.current, { scale: 1, duration: 0.2, ease: "elastic.out(1, 0.5)" });
  };

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
      className={clsx(
        "relative group p-4 mb-3 rounded-xl border border-white/5 bg-white/5 backdrop-blur-sm",
        "active:bg-white/10 transition-colors cursor-pointer overflow-hidden",
        "shadow-lg shadow-black/20"
      )}
    >
      {/* Decorative corner accent */}
      <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-xl" />
      
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-display text-gray-100 group-active:text-primary transition-colors">
            {spell.name}
          </h3>
          <div className="flex items-center mt-1 space-x-2">
            <span className="text-xs font-sans text-muted-foreground uppercase tracking-widest bg-black/40 px-2 py-0.5 rounded">
              Level {spell.level}
            </span>
            <span className="text-xs font-sans text-secondary-foreground/60 uppercase tracking-widest">
              Necromancy
            </span>
          </div>
        </div>
        <Skull size={20} className="text-muted-foreground/30 group-active:text-primary/50 transition-colors" />
      </div>
    </div>
  );
}
