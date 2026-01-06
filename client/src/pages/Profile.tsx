import { Skull, Scroll, Award, Zap } from "lucide-react";
import { clsx } from "clsx";

export default function Profile() {
  return (
    <div className="min-h-screen bg-background pb-24 grimoire-texture">
      <header className="px-6 pt-safe pt-12 pb-8 bg-gradient-to-b from-secondary/20 to-transparent">
        <div className="flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-[#0f0f0f] border-2 border-primary p-1 mb-4 shadow-[0_0_20px_rgba(74,222,128,0.3)]">
            <div className="w-full h-full rounded-full bg-secondary/20 flex items-center justify-center overflow-hidden">
               {/* Unsplash Avatar placeholder */}
               {/* dark fantasy necromancer portrait hood */}
               <img 
                 src="https://pixabay.com/get/gb29d544c3e3faae0a6e7dd2d02f4a1c5175b1e38b915611aad93c54ad18bab24ec28fb6c47e51b120709224863d4668843f866b6840ec7de47afa99e5ce454e4_1280.jpg" 
                 alt="Necromancer Avatar"
                 className="w-full h-full object-cover opacity-80"
               />
            </div>
          </div>
          <h1 className="text-2xl font-display text-white tracking-widest text-shadow-glow">Seth Malagor</h1>
          <p className="text-primary text-sm font-sans uppercase tracking-widest mt-1">Lorde Lich • Nível 20</p>
        </div>
      </header>

      <main className="px-6 max-w-md mx-auto space-y-6">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard icon={Scroll} label="Feitiços Conhecidos" value="142" />
          <StatCard icon={Skull} label="Lacaios Erguidos" value="8.492" />
          <StatCard icon={Award} label="Almas Colhidas" value="666" />
          <StatCard icon={Zap} label="Capacidade de Mana" value="∞" />
        </div>

        {/* Character Details */}
        <div className="bg-white/5 border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
          <h3 className="font-display text-lg text-white mb-4 border-b border-white/10 pb-2">Dons Sombrios</h3>
          <div className="space-y-4">
            <Ability 
              name="Colheita Sombria" 
              desc="Quando você mata uma criatura com um feitiço, você recupera pontos de vida iguais ao dobro do nível do feitiço."
            />
            <Ability 
              name="Escravos Mortos-Vivos" 
              desc="Crie mortos-vivos adicionais ao conjurar Animais Mortos. Eles ganham PV e dano extra."
            />
            <Ability 
              name="Comandar Mortos-Vivos" 
              desc="Como uma ação, você pode escolher um morto-vivo que possa ver a até 60 pés."
            />
          </div>
        </div>

        <button className="w-full py-4 rounded-xl border border-destructive/30 text-destructive font-display tracking-widest hover:bg-destructive/10 transition-colors uppercase text-sm">
          Sair
        </button>

      </main>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center text-center hover:bg-white/10 transition-colors">
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
