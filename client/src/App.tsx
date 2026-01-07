import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Navigation } from "@/components/Navigation";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { CharacterProvider } from "@/contexts/CharacterContext";

import Login from "@/pages/Login";
import CharacterSelection from "@/pages/CharacterSelection";
import Grimoire from "@/pages/Grimoire";
import Favorites from "@/pages/Favorites";
import Profile from "@/pages/Profile";
import GrimoireNotes from "@/pages/GrimoireNotes";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ component: Component, ...rest }: any) {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin text-primary">⏳</div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  return <Component {...rest} />;
}

function Router() {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();

  // Se estiver na tela de login e já tiver usuário, redireciona
  if (location === "/login" && user && !isLoading) {
    return <Redirect to="/characters" />;
  }

  if (isLoading && location !== "/login") {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin text-primary">⏳</div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/login">
        {user ? <Redirect to="/characters" /> : <Login />}
      </Route>
      <Route path="/characters">
        {user ? <CharacterSelection /> : <Redirect to="/login" />}
      </Route>
      <Route path="/">
        {user ? <Grimoire /> : <Redirect to="/login" />}
      </Route>
      <Route path="/favorites">
        {user ? <Favorites /> : <Redirect to="/login" />}
      </Route>
      <Route path="/profile">
        {user ? <Profile /> : <Redirect to="/login" />}
      </Route>
      <Route path="/grimoire-notes">
        {user ? <GrimoireNotes /> : <Redirect to="/login" />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CharacterProvider>
      <div className="bg-background min-h-screen text-foreground font-body selection:bg-primary/30">
        <Router />
        <Navigation />
        <Toaster />
      </div>
        </CharacterProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
