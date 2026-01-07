// Traduções para campos específicos de feitiços D&D 5e

/**
 * Traduz tempo de conjuração
 */
export function translateCastingTime(time: string): string {
  const translations: Record<string, string> = {
    "1 action": "1 ação",
    "1 bonus action": "1 ação bônus",
    "1 reaction": "1 reação",
    "1 minute": "1 minuto",
    "10 minutes": "10 minutos",
    "1 hour": "1 hora",
    "8 hours": "8 horas",
    "12 hours": "12 horas",
    "24 hours": "24 horas",
    "1 ritual": "1 ritual",
  };

  // Tentar tradução exata primeiro
  if (translations[time.toLowerCase()]) {
    return translations[time.toLowerCase()];
  }

  // Traduzir números e unidades comuns
  return time
    .replace(/\b1 action\b/gi, "1 ação")
    .replace(/\b1 bonus action\b/gi, "1 ação bônus")
    .replace(/\b1 reaction\b/gi, "1 reação")
    .replace(/\b(\d+) minutes?\b/gi, "$1 minutos")
    .replace(/\b(\d+) hours?\b/gi, "$1 horas")
    .replace(/\b(\d+) days?\b/gi, "$1 dias");
}

/**
 * Traduz alcance
 */
export function translateRange(range: string): string {
  const translations: Record<string, string> = {
    "touch": "Toque",
    "self": "Pessoal",
    "5 feet": "1,5 metro",
    "10 feet": "3 metros",
    "30 feet": "9 metros",
    "60 feet": "18 metros",
    "90 feet": "27 metros",
    "120 feet": "36 metros",
    "150 feet": "45 metros",
    "300 feet": "90 metros",
    "500 feet": "150 metros",
    "1 mile": "1,6 km",
    "500 miles": "800 km",
    "unlimited": "Ilimitado",
    "sight": "Visão",
    "special": "Especial",
  };

  const lowerRange = range.toLowerCase().trim();
  
  // Tentar tradução exata
  if (translations[lowerRange]) {
    return translations[lowerRange];
  }

  // Traduzir padrões comuns
  return range
    .replace(/\btouch\b/gi, "Toque")
    .replace(/\bself\b/gi, "Pessoal")
    .replace(/\b(\d+) feet\b/gi, (match, feet) => {
      const meters = Math.round(parseInt(feet) * 0.3048);
      return `${meters} metros`;
    })
    .replace(/\b(\d+) miles?\b/gi, (match, miles) => {
      const km = Math.round(parseInt(miles) * 1.60934);
      return `${km} km`;
    })
    .replace(/\bunlimited\b/gi, "Ilimitado")
    .replace(/\bsight\b/gi, "Visão")
    .replace(/\bspecial\b/gi, "Especial");
}

/**
 * Traduz duração
 */
export function translateDuration(duration: string): string {
  const translations: Record<string, string> = {
    "instantaneous": "Instantânea",
    "concentration, up to 1 minute": "Concentração, até 1 minuto",
    "concentration, up to 10 minutes": "Concentração, até 10 minutos",
    "concentration, up to 1 hour": "Concentração, até 1 hora",
    "concentration, up to 8 hours": "Concentração, até 8 horas",
    "concentration, up to 24 hours": "Concentração, até 24 horas",
    "1 round": "1 rodada",
    "1 minute": "1 minuto",
    "10 minutes": "10 minutos",
    "1 hour": "1 hora",
    "8 hours": "8 horas",
    "12 hours": "12 horas",
    "24 hours": "24 horas",
    "7 days": "7 dias",
    "10 days": "10 dias",
    "30 days": "30 dias",
    "until dispelled": "Até ser dissipada",
    "until dispelled or triggered": "Até ser dissipada ou ativada",
    "special": "Especial",
    "permanent": "Permanente",
  };

  const lowerDuration = duration.toLowerCase().trim();
  
  // Tentar tradução exata
  if (translations[lowerDuration]) {
    return translations[lowerDuration];
  }

  // Traduzir padrões comuns
  return duration
    .replace(/\binstantaneous\b/gi, "Instantânea")
    .replace(/\bconcentration\b/gi, "Concentração")
    .replace(/\bup to\b/gi, "até")
    .replace(/\b(\d+) round\b/gi, "$1 rodada")
    .replace(/\b(\d+) rounds\b/gi, "$1 rodadas")
    .replace(/\b(\d+) minutes?\b/gi, "$1 minutos")
    .replace(/\b(\d+) hours?\b/gi, "$1 horas")
    .replace(/\b(\d+) days?\b/gi, "$1 dias")
    .replace(/\buntil dispelled\b/gi, "Até ser dissipada")
    .replace(/\buntil dispelled or triggered\b/gi, "Até ser dissipada ou ativada")
    .replace(/\bspecial\b/gi, "Especial")
    .replace(/\bpermanent\b/gi, "Permanente");
}

/**
 * Traduz componentes
 */
export function translateComponents(components: string[]): string {
  const componentMap: Record<string, string> = {
    "V": "Verbal",
    "S": "Somático",
    "M": "Material",
  };

  return components
    .map(comp => {
      const trimmed = comp.trim();
      // Se for apenas uma letra, traduzir
      if (componentMap[trimmed]) {
        return componentMap[trimmed];
      }
      // Se já tiver descrição de material, manter
      return trimmed;
    })
    .join(", ");
}

/**
 * Traduz todos os campos de um feitiço
 */
export function translateSpellFields(spell: {
  casting_time: string;
  range: string;
  duration: string;
  components: string[];
}) {
  return {
    casting_time: translateCastingTime(spell.casting_time),
    range: translateRange(spell.range),
    duration: translateDuration(spell.duration),
    components: translateComponents(spell.components),
  };
}

