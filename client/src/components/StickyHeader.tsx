import { Search } from "lucide-react";

interface StickyHeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  title?: string;
}

export function StickyHeader({ searchTerm, setSearchTerm, title = "Grimoire" }: StickyHeaderProps) {
  return (
    <header className="sticky top-0 z-40 px-6 pt-safe pb-4 bg-[#0f0f0f]/80 backdrop-blur-xl border-b border-white/5">
      <div className="flex flex-col gap-4 max-w-md mx-auto w-full">
        <h1 className="text-2xl font-display text-white tracking-widest text-center mt-2">
          {title}
        </h1>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <input
            type="text"
            placeholder="Search incantations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-sans"
          />
        </div>
      </div>
    </header>
  );
}
