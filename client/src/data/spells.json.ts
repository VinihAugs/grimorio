// Importar o JSON diretamente como módulo
import spellsData from './magias_dnd.json';

export interface LocalSpell {
  name: string;
  level: number;
  school: string;
  classes: string[];
  actionType: string;
  concentration: boolean;
  ritual: boolean;
  range: string;
  components: string[];
  material: string;
  duration: string;
  description: string;
  higherLevel: string;
  // Campos traduzidos (opcionais - serão adicionados pelo script de tradução)
  descriptionPt?: string;
  materialPt?: string;
  higherLevelPt?: string;
}

// Mapeamento de classes em inglês para português
const classMapping: Record<string, string> = {
  "Barbarian": "Bárbaro",
  "Bard": "Bardo",
  "Cleric": "Clérigo",
  "Druid": "Druida",
  "Fighter": "Guerreiro",
  "Monk": "Monge",
  "Paladin": "Paladino",
  "Ranger": "Patrulheiro",
  "Rogue": "Ladino",
  "Sorcerer": "Feiticeiro",
  "Warlock": "Bruxo",
  "Wizard": "Mago",
};

// Mapeamento de escolas em inglês para português (índice da API)
const schoolMapping: Record<string, string> = {
  "Abjuration": "abjuration",
  "Conjuration": "conjuration",
  "Divination": "divination",
  "Enchantment": "enchantment",
  "Evocation": "evocation",
  "Illusion": "illusion",
  "Necromancy": "necromancy",
  "Transmutation": "transmutation",
};

/**
 * Converte uma magia do formato local para o formato esperado pela aplicação
 */
export function convertLocalSpellToSpellListItem(spell: LocalSpell, index: number) {
  // Criar um índice baseado no nome (normalizado)
  const spellIndex = spell.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
  
  return {
    index: spellIndex,
    name: spell.name,
    level: spell.level,
    url: `/api/spells/${spellIndex}`, // URL fictícia para compatibilidade
  };
}

/**
 * Converte uma magia do formato local para o formato de detalhe esperado
 */
export function convertLocalSpellToSpellDetail(spell: LocalSpell, index: string) {
  const spellIndex = index || spell.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
  
  // Usar versão traduzida se disponível e válida, senão usar original
  // Verificar se descriptionPt não é uma mensagem de erro
  const hasValidTranslation = spell.descriptionPt && 
    typeof spell.descriptionPt === 'string' &&
    !spell.descriptionPt.includes('QUERY LENGTH LIMIT') &&
    !spell.descriptionPt.includes('MAX ALLOWED QUERY') &&
    spell.descriptionPt !== spell.description;
  const descriptionToUse = hasValidTranslation && spell.descriptionPt 
    ? spell.descriptionPt 
    : (spell.description || '');
  const desc = descriptionToUse.split('\n\n').filter(p => p.trim());
  
  // Converter higherLevel para array se não estiver vazio (usar traduzido se disponível)
  const higherLevelToUse = spell.higherLevelPt || spell.higherLevel;
  const higher_level = higherLevelToUse ? [higherLevelToUse] : [];
  
  // Converter classes para o formato esperado
  const classes = spell.classes.map(cls => ({
    index: cls.toLowerCase(),
    name: classMapping[cls] || cls,
    url: `/api/classes/${cls.toLowerCase()}`,
  }));
  
  return {
    index: spellIndex,
    name: spell.name,
    desc,
    higher_level: higher_level.length > 0 ? higher_level : undefined,
    range: spell.range,
    components: spell.components,
    material: (spell.materialPt || spell.material) || undefined,
    ritual: spell.ritual,
    duration: spell.duration,
    concentration: spell.concentration,
    casting_time: spell.actionType,
    level: spell.level,
    school: {
      index: schoolMapping[spell.school] || spell.school.toLowerCase(),
      name: spell.school,
      url: `/api/magic-schools/${schoolMapping[spell.school] || spell.school.toLowerCase()}`,
    },
    classes,
    url: `/api/spells/${spellIndex}`,
  };
}

// Cache para os dados carregados (já carregados via import)
const spellsCache: LocalSpell[] = spellsData as LocalSpell[];

/**
 * Carrega todas as magias do JSON local (já carregado via import)
 */
/**
 * Carrega todas as magias do JSON local (já carregado via import)
 */
export function loadLocalSpells(): LocalSpell[] {
  return spellsCache;
}

/**
 * Busca uma magia pelo índice (nome normalizado)
 */
export function findSpellByIndex(index: string): LocalSpell | null {
  const spells = loadLocalSpells();
  const normalizedIndex = index.toLowerCase().replace(/[^a-z0-9]/g, '-');
  
  return spells.find(spell => {
    const spellIndex = spell.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    return spellIndex === normalizedIndex;
  }) || null;
}

/**
 * Filtra magias por classe (em português)
 */
export function filterSpellsByClass(spells: LocalSpell[], className: string): LocalSpell[] {
  // Converter classe em português para inglês
  const classInEnglish = Object.entries(classMapping).find(
    ([_, pt]) => pt === className
  )?.[0];
  
  if (!classInEnglish) return spells;
  
  return spells.filter(spell => spell.classes.includes(classInEnglish));
}

/**
 * Filtra magias por nível
 */
export function filterSpellsByLevel(spells: LocalSpell[], level: number): LocalSpell[] {
  return spells.filter(spell => spell.level === level);
}

/**
 * Filtra magias por escola
 */
export function filterSpellsBySchool(spells: LocalSpell[], schoolIndex: string): LocalSpell[] {
  // Converter índice da escola para nome em inglês
  const schoolName = Object.entries(schoolMapping).find(
    ([_, index]) => index === schoolIndex
  )?.[0];
  
  if (!schoolName) return spells;
  
  return spells.filter(spell => spell.school === schoolName);
}


