import { Link } from "wouter";
import { AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-6">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <AlertTriangle className="h-20 w-20 text-destructive opacity-80" />
        </div>
        <h1 className="text-4xl font-display text-white tracking-widest">404</h1>
        <p className="text-xl text-muted-foreground font-body">
          This page has been lost to the void.
        </p>
        <Link href="/">
          <button className="px-8 py-3 rounded-xl bg-primary/10 text-primary border border-primary/20 font-display tracking-widest hover:bg-primary/20 transition-all uppercase text-sm">
            Return to Safety
          </button>
        </Link>
      </div>
    </div>
  );
}
