// Sistema de tradução automática de feitiços com cache
// Suporta todas as escolas de magia, não apenas necromancia

// Traduções manuais para feitiços comuns de D&D 5e
// Estas são traduções oficiais ou amplamente aceitas pela comunidade brasileira
const translationCache: Record<string, string> = {
  // Cantrips (Level 0) - Bardo e outros
  "dancing-lights": "Luzes Dançantes",
  "guidance": "Orientação",
  "mending": "Consertar",
  "message": "Mensagem",
  "minor-illusion": "Ilusão Menor",
  "prestidigitation": "Prestidigitação",
  "resistance": "Resistência",
  "thaumaturgy": "Taumaturgia",
  "vicious-mockery": "Zombaria Cruel",
  "blade-ward": "Proteção com Lâmina",
  "friends": "Amigos",
  "true-strike": "Golpe Certeiro",
  "mage-hand": "Mão do Mago",
  "light": "Luz",
  "spare-the-dying": "Poupar os Moribundos",
  "toll-the-dead": "Dobrar os Mortos",
  "chill-touch": "Toque Gélido",
  "acid-splash": "Respingo Ácido",
  "blade-burst": "Explosão de Lâminas",
  "booming-blade": "Lâmina Trovejante",
  "create-bonfire": "Criar Fogueira",
  "control-flames": "Controlar Chamas",
  "fire-bolt": "Raio de Fogo",
  "frostbite": "Mordida de Gelo",
  "green-flame-blade": "Lâmina de Chama Verde",
  "produce-flame": "Produzir Chama",
  "ray-of-frost": "Raio de Gelo",
  "shocking-grasp": "Toque Chocante",
  "sword-burst": "Explosão de Espadas",
  "thunderclap": "Estrondo",
  "word-of-radiance": "Palavra de Radiância",
  "blade-ward": "Proteção com Lâmina",
  "friends": "Amigos",
  "true-strike": "Golpe Certeiro",
  
  // Level 1
  "cure-wounds": "Curar Ferimentos",
  "healing-word": "Palavra Curativa",
  "heroism": "Heroísmo",
  "shield": "Escudo",
  "magic-missile": "Mísseis Mágicos",
  "sleep": "Sono",
  "charm-person": "Enfeitiçar Pessoa",
  "disguise-self": "Disfarce",
  "detect-magic": "Detectar Magia",
  "identify": "Identificar",
  "comprehend-languages": "Compreender Idiomas",
  "feather-fall": "Queda Suave",
  "jump": "Salto",
  "longstrider": "Passo Longo",
  "alarm": "Alarme",
  "find-familiar": "Encontrar Familiar",
  "unseen-servant": "Servo Invisível",
  "burning-hands": "Mãos Flamejantes",
  "thunderwave": "Onda Trovejante",
  "color-spray": "Spray de Cores",
  "faerie-fire": "Fogo de Fada",
  "entangle": "Enredar",
  "goodberry": "Baga Boa",
  "speak-with-animals": "Falar com Animais",
  "animal-friendship": "Amizade com Animais",
  "detect-poison-and-disease": "Detectar Veneno e Doença",
  "purify-food-and-drink": "Purificar Comida e Bebida",
  "bane": "Desgraça",
  "bless": "Bênção",
  "command": "Comando",
  "create-or-destroy-water": "Criar ou Destruir Água",
  "guiding-bolt": "Raio Guia",
  "inflict-wounds": "Causar Ferimentos",
  "sanctuary": "Santuário",
  "shield-of-faith": "Escudo da Fé",
  "false-life": "Falsa Vida",
  "ray-of-sickness": "Raio de Enfermidade",
  
  // Level 2
  "aid": "Auxílio",
  "lesser-restoration": "Restauração Menor",
  "prayer-of-healing": "Oração de Cura",
  "spiritual-weapon": "Arma Espiritual",
  "blindness-deafness": "Cegueira e Surdez",
  "calm-emotions": "Acalmar Emoções",
  "hold-person": "Imobilizar Pessoa",
  "silence": "Silêncio",
  "zone-of-truth": "Zona da Verdade",
  "gentle-repose": "Repouso Suave",
  "ray-of-enfeeblement": "Raio de Enfraquecimento",
  "wither-and-bloom": "Murchar e Florescer",
  "misty-step": "Passo Nebuloso",
  "mirror-image": "Imagem Espelhada",
  "suggestion": "Sugestão",
  "invisibility": "Invisibilidade",
  "knock": "Arrombar",
  "levitate": "Levitar",
  "magic-mouth": "Boca Mágica",
  "rope-trick": "Truque da Corda",
  "see-invisibility": "Ver Invisibilidade",
  "spider-climb": "Escalar como Aranha",
  "web": "Teia",
  "gust-of-wind": "Rajada de Vento",
  "scorching-ray": "Raio Escaldante",
  "shatter": "Estilhaçar",
  "flame-blade": "Lâmina de Chama",
  "heat-metal": "Aquecer Metal",
  "moonbeam": "Raio de Lua",
  "pass-without-trace": "Passar sem Rastro",
  "spike-growth": "Crescimento de Espinhos",
  "barkskin": "Pele de Árvore",
  "beast-sense": "Sentido Animal",
  "locate-animals-or-plants": "Localizar Animais ou Plantas",
  "animal-messenger": "Mensageiro Animal",
  
  // Level 3
  "animate-dead": "Animar Mortos",
  "bestow-curse": "Conferir Maldição",
  "feign-death": "Fingir Morte",
  "life-transference": "Transferência de Vida",
  "revivify": "Revivificar",
  "speak-with-dead": "Falar com os Mortos",
  "spirit-shroud": "Manto Espiritual",
  "summon-undead": "Convocar Morto-Vivo",
  "vampiric-touch": "Toque Vampírico",
  "counterspell": "Contramágica",
  "dispel-magic": "Dissipar Magia",
  "fireball": "Bola de Fogo",
  "lightning-bolt": "Raio",
  "fly": "Voar",
  "haste": "Acelerar",
  "slow": "Lentidão",
  "hypnotic-pattern": "Padrão Hipnótico",
  "major-image": "Imagem Maior",
  "tongues": "Línguas",
  "glyph-of-warding": "Glifo de Guarda",
  "magic-circle": "Círculo Mágico",
  "nondetection": "Não Detecção",
  "remove-curse": "Remover Maldição",
  "water-breathing": "Respirar na Água",
  "water-walk": "Caminhar sobre a Água",
  "wind-wall": "Muralha de Vento",
  "call-lightning": "Chamar Relâmpago",
  "conjure-animals": "Conjurar Animais",
  "daylight": "Luz do Dia",
  "plant-growth": "Crescimento de Plantas",
  "speak-with-plants": "Falar com Plantas",
  "wind-wall": "Muralha de Vento",
  "beacon-of-hope": "Sinal de Esperança",
  "mass-healing-word": "Palavra Curativa em Massa",
  "spirit-guardians": "Guardiões Espirituais",
  "revivify": "Revivificar",
  
  // Level 4
  "blight": "Praga",
  "shadow-of-moil": "Sombra de Moil",
  "sickening-radiance": "Radiação Nauseante",
  "banishment": "Banimento",
  "dimension-door": "Porta Dimensional",
  "greater-invisibility": "Invisibilidade Maior",
  "polymorph": "Polimorfia",
  "wall-of-fire": "Muralha de Fogo",
  "confusion": "Confusão",
  "hallucinatory-terrain": "Terreno Alucinatório",
  "fabricate": "Fabricar",
  "stoneskin": "Pele de Pedra",
  "control-water": "Controlar Água",
  "ice-storm": "Tempestade de Gelo",
  "conjure-woodland-beings": "Conjurar Seres da Floresta",
  "dominate-beast": "Dominar Fera",
  "freedom-of-movement": "Liberdade de Movimento",
  "giant-insect": "Inseto Gigante",
  "grasping-vine": "Vinha Agarrante",
  "death-ward": "Proteção contra Morte",
  "divination": "Adivinhação",
  "guardian-of-faith": "Guardião da Fé",
  
  // Level 5
  "antilife-shell": "Casca Antivida",
  "contagion": "Contágio",
  "danse-macabre": "Dança Macabra",
  "enervation": "Enervação",
  "negative-energy-flood": "Inundação de Energia Negativa",
  "raise-dead": "Ressuscitar Mortos",
  "cloudkill": "Nuvem Mortal",
  "cone-of-cold": "Cone de Frio",
  "wall-of-force": "Muralha de Força",
  "dominate-person": "Dominar Pessoa",
  "modify-memory": "Modificar Memória",
  "scrying": "Visão Arcana",
  "teleportation-circle": "Círculo de Teletransporte",
  "conjure-elemental": "Conjurar Elemental",
  "control-winds": "Controlar Ventos",
  "insect-plague": "Praga de Insetos",
  "tree-stride": "Passo Arbóreo",
  "commune": "Comunhão",
  "flame-strike": "Golpe Flamejante",
  "greater-restoration": "Restauração Maior",
  "mass-cure-wounds": "Curar Ferimentos em Massa",
  "planar-binding": "Vínculo Planar",
  
  // Level 6
  "circle-of-death": "Círculo da Morte",
  "create-undead": "Criar Morto-Vivo",
  "eyebite": "Mordida do Olho",
  "harm": "Dano",
  "soul-cage": "Gaiola de Almas",
  "true-seeing": "Visão Verdadeira",
  "create-homunculus": "Criar Homúnculo",
  "disintegrate": "Desintegrar",
  "globe-of-invulnerability": "Globo de Invulnerabilidade",
  "chain-lightning": "Relâmpago em Cadeia",
  "sunbeam": "Raio Solar",
  "wall-of-ice": "Muralha de Gelo",
  "mass-suggestion": "Sugestão em Massa",
  "programmed-illusion": "Ilusão Programada",
  "true-seeing": "Visão Verdadeira",
  "contingency": "Contingência",
  "create-undead": "Criar Morto-Vivo",
  "flesh-to-stone": "Carne em Pedra",
  "magic-jar": "Jarra Mágica",
  "move-earth": "Mover Terra",
  "sunbeam": "Raio Solar",
  "transport-via-plants": "Transporte via Plantas",
  "wind-walk": "Caminhar no Vento",
  "word-of-recall": "Palavra de Recordação",
  "blade-barrier": "Barreira de Lâminas",
  "forbiddance": "Interdição",
  "harm": "Dano",
  "heal": "Curar",
  "heroes-feast": "Banquete dos Heróis",
  "planar-ally": "Aliado Planar",
  
  // Level 7
  "finger-of-death": "Dedo da Morte",
  "resurrection": "Ressurreição",
  "symbol": "Símbolo",
  "delayed-blast-fireball": "Bola de Fogo Retardada",
  "fire-storm": "Tempestade de Fogo",
  "prismatic-spray": "Spray Prismático",
  "reverse-gravity": "Reversão da Gravidade",
  "teleport": "Teletransporte",
  "etherealness": "Etericidade",
  "forcecage": "Gaiola de Força",
  "mirage-arcana": "Miragem Arcana",
  "project-image": "Projetar Imagem",
  "sequester": "Sequester",
  "simulacrum": "Simulacro",
  "conjure-celestial": "Conjurar Celestial",
  "divine-word": "Palavra Divina",
  "fire-storm": "Tempestade de Fogo",
  "plane-shift": "Mudança de Plano",
  "regenerate": "Regenerar",
  "resurrection": "Ressurreição",
  
  // Level 8
  "clone": "Clone",
  "demiplane": "Semiplano",
  "abrupt-junction": "Junção Abrupta",
  "antimagic-field": "Campo Antimagia",
  "incendiary-cloud": "Nuvem Incendiária",
  "maze": "Labirinto",
  "mind-blank": "Mente em Branco",
  "power-word-stun": "Palavra de Poder: Atordoar",
  "sunburst": "Explosão Solar",
  "dominate-monster": "Dominar Monstro",
  "feeblemind": "Mente Débil",
  "glibness": "Eloquência",
  "maddening-darkness": "Escuridão Enlouquecedora",
  "maze": "Labirinto",
  "animal-shapes": "Formas Animais",
  "antipathy-sympathy": "Antipatia/Simpatia",
  "control-weather": "Controlar Clima",
  "earthquake": "Terremoto",
  "feeblemind": "Mente Débil",
  "holy-aura": "Aura Sagrada",
  "sunburst": "Explosão Solar",
  
  // Level 9
  "astral-projection": "Projeção Astral",
  "power-word-kill": "Palavra de Poder: Matar",
  "true-resurrection": "Ressurreição Verdadeira",
  "wish": "Desejo",
  "meteor-swarm": "Enxame de Meteoros",
  "prismatic-wall": "Muralha Prismática",
  "time-stop": "Parar o Tempo",
  "weird": "Estranho",
  "foresight": "Previsão",
  "gate": "Portal",
  "imprisonment": "Aprisionamento",
  "mass-heal": "Curar em Massa",
  "power-word-heal": "Palavra de Poder: Curar",
  "true-resurrection": "Ressurreição Verdadeira",
  "storm-of-vengeance": "Tempestade de Vingança",
};

// Chave para localStorage
const CACHE_KEY = "spell-translations-cache";

// Carregar cache do localStorage
function loadCache(): Record<string, string> {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {
    console.warn("Erro ao carregar cache de traduções:", e);
  }
  return {};
}

// Salvar cache no localStorage
function saveCache(cache: Record<string, string>) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (e) {
    console.warn("Erro ao salvar cache de traduções:", e);
  }
}

// Cache em memória para esta sessão
let memoryCache: Record<string, string> = loadCache();

// Função para traduzir usando API (similar ao useTranslate, mas síncrona para cache)
async function translateSpellNameAPI(spellName: string): Promise<string> {
  try {
    // Tentativa 1: LibreTranslate
    try {
      const response = await fetch("https://libretranslate.de/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          q: spellName,
          source: "en",
          target: "pt",
          format: "text",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.translatedText) {
          return data.translatedText;
        }
      }
    } catch (e) {
      // Continua para próxima tentativa
    }

    // Tentativa 2: MyMemory API
    try {
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(spellName)}&langpair=en|pt`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.responseData && data.responseData.translatedText) {
          return data.responseData.translatedText;
        }
      }
    } catch (e) {
      // Fallback
    }

    return spellName;
  } catch (error) {
    console.error("Erro na tradução:", error);
    return spellName;
  }
}

/**
 * Verifica se uma tradução parece ruim (muito diferente do original ou contém caracteres estranhos)
 */
function isBadTranslation(original: string, translated: string): boolean {
  // Se a tradução for muito mais longa que o original (pode ser tradução literal ruim)
  if (translated.length > original.length * 2) {
    return true;
  }
  
  // Se contém caracteres especiais estranhos (exceto acentos e hífens)
  const strangeChars = /[<>{}[\]|\\^~`]/.test(translated);
  if (strangeChars) {
    return true;
  }
  
  // Se contém muitos números que não deveriam estar (exceto se o original também tiver)
  const hasNumbers = /\d/.test(translated);
  const originalHasNumbers = /\d/.test(original);
  if (hasNumbers && !originalHasNumbers) {
    return true;
  }
  
  // Se a tradução contém palavras muito estranhas (muitas maiúsculas no meio)
  const hasWeirdCaps = /[a-z][A-Z][a-z]/.test(translated);
  if (hasWeirdCaps) {
    return true;
  }
  
  // Se a tradução é idêntica ao original (API pode ter falhado, mas não é "ruim")
  if (translated.toLowerCase() === original.toLowerCase()) {
    return false; // Não é ruim, apenas não traduziu
  }
  
  return false;
}

/**
 * Traduz o nome de um feitiço
 * Prioridade:
 * 1. Tradução manual (termos específicos de D&D)
 * 2. Cache (localStorage + memória)
 * 3. API de tradução (com cache automático)
 * 4. Nome original (fallback)
 */
export async function translateSpellName(
  index: string,
  originalName: string
): Promise<string> {
  // 1. Verificar tradução manual primeiro
  if (translationCache[index]) {
    return translationCache[index];
  }

  // 2. Verificar cache
  if (memoryCache[index]) {
    const cached = memoryCache[index];
    // Se a tradução em cache parece ruim, tentar novamente
    if (!isBadTranslation(originalName, cached)) {
      return cached;
    }
    // Remove tradução ruim do cache
    delete memoryCache[index];
  }

  // 3. Traduzir via API e cachear
  const translated = await translateSpellNameAPI(originalName);
  
  // Verificar se a tradução é boa antes de cachear
  if (!isBadTranslation(originalName, translated)) {
    memoryCache[index] = translated;
    saveCache(memoryCache);
    return translated;
  }
  
  // Se a tradução é ruim, retornar o original e não cachear
  return originalName;
}

/**
 * Versão síncrona que usa cache apenas (para uso em componentes)
 * Se não houver cache, retorna o nome original
 */
export function translateSpellNameSync(
  index: string,
  originalName: string
): string {
  // Verificar tradução manual
  if (translationCache[index]) {
    return translationCache[index];
  }

  // Verificar cache
  if (memoryCache[index]) {
    const cached = memoryCache[index];
    // Se a tradução em cache parece ruim, retornar original
    if (isBadTranslation(originalName, cached)) {
      return originalName;
    }
    return cached;
  }

  // Retornar original se não houver cache
  return originalName;
}

/**
 * Pré-carregar traduções para uma lista de feitiços
 * Útil para traduzir todos os feitiços de uma vez
 */
export async function preloadTranslations(
  spells: Array<{ index: string; name: string }>
): Promise<void> {
  const toTranslate = spells.filter(
    (spell) => !memoryCache[spell.index] && !translationCache[spell.index]
  );

  // Traduzir em lotes para não sobrecarregar a API
  const batchSize = 5;
  for (let i = 0; i < toTranslate.length; i += batchSize) {
    const batch = toTranslate.slice(i, i + batchSize);
    await Promise.all(
      batch.map((spell) => translateSpellName(spell.index, spell.name))
    );
    // Pequeno delay entre lotes
    if (i + batchSize < toTranslate.length) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
}

/**
 * Adicionar tradução manual (para override de termos específicos)
 */
export function addManualTranslation(index: string, translation: string) {
  translationCache[index] = translation;
  memoryCache[index] = translation;
  saveCache(memoryCache);
}

/**
 * Limpar cache (útil para debug ou atualização)
 */
export function clearTranslationCache() {
  memoryCache = {};
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (e) {
    console.warn("Erro ao limpar cache:", e);
  }
}
