import { 
  Skull, 
  Music, 
  Sparkles, 
  Cross, 
  Leaf, 
  Zap, 
  Sword, 
  Eye, 
  BookOpen, 
  Hand, 
  Shield, 
  Target 
} from "lucide-react";
import { type DnDClass } from "@shared/character-schema";

const classIcons: Record<DnDClass, typeof Skull> = {
  "Bárbaro": Hand,
  "Bardo": Music,
  "Bruxo": Sparkles,
  "Clérigo": Cross,
  "Druida": Leaf,
  "Feiticeiro": Zap,
  "Guerreiro": Sword,
  "Ladino": Eye,
  "Mago": BookOpen,
  "Monge": Hand,
  "Paladino": Shield,
  "Patrulheiro": Target,
};

interface ClassIconProps {
  className: DnDClass;
  size?: number;
  iconClassName?: string;
}

export function ClassIcon({ className: classType, size = 20, iconClassName, ...props }: ClassIconProps) {
  const Icon = classIcons[classType] || Skull;
  return <Icon size={size} className={iconClassName} {...props} />;
}

