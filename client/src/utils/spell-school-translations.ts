// Traduções das escolas de magia
export const schoolTranslations: Record<string, string> = {
  "abjuration": "Abjuração",
  "conjuration": "Conjuração",
  "divination": "Adivinhação",
  "enchantment": "Encantamento",
  "evocation": "Evocação",
  "illusion": "Ilusão",
  "necromancy": "Necromancia",
  "transmutation": "Transmutação",
};

export function translateSchool(schoolName: string): string {
  return schoolTranslations[schoolName.toLowerCase()] || schoolName;
}

// Traduções de tipos de ataque
export const attackTypeTranslations: Record<string, string> = {
  "melee": "Corpo a Corpo",
  "ranged": "À Distância",
};

export function translateAttackType(attackType: string): string {
  return attackTypeTranslations[attackType.toLowerCase()] || attackType;
}

// Traduções de tipos de dano
export const damageTypeTranslations: Record<string, string> = {
  "acid": "Ácido",
  "bludgeoning": "Concussão",
  "cold": "Frio",
  "fire": "Fogo",
  "force": "Força",
  "lightning": "Relâmpago",
  "necrotic": "Necrótico",
  "piercing": "Perfurante",
  "poison": "Veneno",
  "psychic": "Psíquico",
  "radiant": "Radiante",
  "slashing": "Cortante",
  "thunder": "Trovão",
};

export function translateDamageType(damageType: string): string {
  return damageTypeTranslations[damageType.toLowerCase()] || damageType;
}

