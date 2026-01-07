import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useVantaCells } from "@/hooks/use-vanta-cells";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, register } = useAuth();
  const { toast } = useToast();
  const vantaRef = useVantaCells();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (!name.trim()) {
          toast({
            title: "Erro",
            description: "Nome é obrigatório",
            variant: "destructive",
          });
          return;
        }
        await register(email, password, name);
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Algo deu errado",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 relative">
      <div ref={vantaRef} className="absolute inset-0 z-0" />
      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Logo/Title */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <Sparkles className="h-16 w-16 text-primary animate-pulse" />
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
            </div>
          </div>
          <h1 className="text-4xl font-display text-white tracking-widest">
            NECROMANTE
          </h1>
          <p className="text-muted-foreground font-body">
            {isLogin
              ? "Entre para acessar seu grimório"
              : "Crie sua conta para começar"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="name" className="text-muted-foreground">
                Nome
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10"
                  required={!isLogin}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-muted-foreground">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-white/5 border-white/10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-muted-foreground">
              Senha
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 bg-white/5 border-white/10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 font-display tracking-widest uppercase"
            disabled={isLoading}
          >
            {isLoading ? (
              <Sparkles className="animate-spin mr-2" size={18} />
            ) : null}
            {isLogin ? "Entrar" : "Criar Conta"}
          </Button>
        </form>

        {/* Toggle Login/Register */}
        <div className="text-center text-sm text-muted-foreground">
          {isLogin ? (
            <>
              Não tem uma conta?{" "}
              <button
                onClick={() => setIsLogin(false)}
                className="text-primary hover:underline font-semibold"
              >
                Criar conta
              </button>
            </>
          ) : (
            <>
              Já tem uma conta?{" "}
              <button
                onClick={() => setIsLogin(true)}
                className="text-primary hover:underline font-semibold"
              >
                Entrar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

