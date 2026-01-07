import { Search, X, Filter } from "lucide-react";
import { useState } from "react";

interface StickyHeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  title?: string;
  onFilterClick?: () => void;
  hasActiveFilters?: boolean;
}

export function StickyHeader({ 
  searchTerm, 
  setSearchTerm, 
  title = "Grimoire",
  onFilterClick,
  hasActiveFilters = false
}: StickyHeaderProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <header 
      className="sticky top-0 z-40 px-6 pt-safe pb-4 backdrop-blur-xl shadow-lg shadow-black/10 relative"
    >
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(/bg_rod.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.6,
          filter: 'blur(1px) brightness(0.7)',
        }}
      />
      <div className="flex flex-col gap-4 max-w-md mx-auto w-full relative z-10">
        <h1 className="text-2xl font-display tracking-widest text-center mt-2 relative text-white">
          <span className="relative z-10">{title === "Grimoire" ? "Grimório" : title}</span>
        </h1>
        
        <div className="relative group flex items-center gap-2">
          <div className="relative flex-1">
            <div className={`
              absolute inset-y-0 left-3 flex items-center pointer-events-none transition-colors duration-300
              ${isFocused ? "text-primary" : "text-muted-foreground"}
            `}>
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              placeholder="Pesquisar encantamentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className={`
                w-full bg-white/5 border rounded-xl py-3 pl-10 pr-10 text-sm text-white 
                placeholder:text-muted-foreground transition-all duration-300 font-sans
                ${isFocused 
                  ? "border-primary/50 bg-white/10 focus:ring-2 focus:ring-primary/30" 
                  : "border-white/10 hover:border-white/20"
                }
              `}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          {onFilterClick && (
            <button
              onClick={onFilterClick}
              className={`
                p-3 rounded-xl border transition-all duration-300 shrink-0
                ${hasActiveFilters
                  ? "bg-primary/20 border-primary/50 text-primary hover:bg-primary/30"
                  : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10 hover:text-white"
                }
              `}
            >
              <Filter className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
