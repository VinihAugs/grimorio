import { Link, useLocation } from "wouter";
import { Book, Star, User } from "lucide-react";
import { clsx } from "clsx";

export function Navigation() {
  const [location] = useLocation();

  const NavItem = ({ href, icon: Icon, label }: { href: string; icon: any; label: string }) => {
    const isActive = location === href;
    return (
      <Link href={href} className="flex-1">
        <div className={clsx(
          "flex flex-col items-center justify-center py-2 h-full transition-colors duration-200 cursor-pointer active:scale-95",
          isActive ? "text-primary" : "text-muted-foreground hover:text-gray-300"
        )}>
          <Icon size={24} className={clsx("mb-1", isActive && "drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]")} />
          <span className="text-[10px] uppercase tracking-wider font-semibold font-sans">{label}</span>
        </div>
      </Link>
    );
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-white/5 pb-safe pt-2 px-6 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
      <div className="flex justify-between items-center max-w-md mx-auto w-full">
        <NavItem href="/" icon={Book} label="Grimoire" />
        <NavItem href="/favorites" icon={Star} label="Favorites" />
        <NavItem href="/profile" icon={User} label="Profile" />
      </div>
    </nav>
  );
}
