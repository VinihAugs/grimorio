# Sistema de Tradução Automática de Feitiços

## 📋 Visão Geral

Este sistema traduz automaticamente os nomes dos feitiços de D&D 5e do inglês para português, usando APIs gratuitas de tradução com cache inteligente.

## ✨ Características

- ✅ **Automático**: Traduz todos os feitiços automaticamente, independente da escola de magia
- ✅ **Cache Inteligente**: Armazena traduções no localStorage para evitar requisições repetidas
- ✅ **Escalável**: Funciona para necromancia, evocation, conjuration, etc.
- ✅ **Override Manual**: Permite adicionar traduções manuais para termos específicos de D&D
- ✅ **Performance**: Pré-carrega traduções em background

## 🚀 Como Usar

### Uso Básico (Síncrono - usa cache)

```typescript
import { translateSpellNameSync } from "@/data/spell-translations";

const translated = translateSpellNameSync("chill-touch", "Chill Touch");
// Retorna: "Toque Gélido" (se estiver em cache) ou "Chill Touch" (se não)
```

### Uso Assíncrono (traduz via API se necessário)

```typescript
import { translateSpellName } from "@/data/spell-translations";

const translated = await translateSpellName("chill-touch", "Chill Touch");
// Traduz via API se não estiver em cache
```

### Pré-carregar Traduções

```typescript
import { preloadTranslations } from "@/data/spell-translations";

// Traduz todos os feitiços em background
await preloadTranslations(spells);
```

### Adicionar Tradução Manual

```typescript
import { addManualTranslation } from "@/data/spell-translations";

// Para termos específicos de D&D que precisam de tradução especializada
addManualTranslation("chill-touch", "Toque Gélido");
```

## 🔧 APIs Utilizadas

O sistema usa duas APIs gratuitas (com fallback):

1. **LibreTranslate** (https://libretranslate.de) - Open source
2. **MyMemory** (https://mymemory.translated.net) - Gratuita com limite

## 💾 Cache

As traduções são armazenadas em:
- **localStorage**: Persistente entre sessões
- **Memória**: Cache em tempo de execução

Para limpar o cache:
```typescript
import { clearTranslationCache } from "@/data/spell-translations";
clearTranslationCache();
```

## 📝 Notas

- As traduções são feitas automaticamente, mas podem não ser 100% precisas para termos específicos de D&D
- Use `addManualTranslation()` para corrigir traduções específicas
- O cache é compartilhado entre todas as escolas de magia
- As traduções são feitas em lotes para não sobrecarregar as APIs

## 🎯 Exemplo Completo

```typescript
import { 
  translateSpellNameSync, 
  preloadTranslations,
  addManualTranslation 
} from "@/data/spell-translations";

// 1. Adicionar tradução manual para termo específico
addManualTranslation("chill-touch", "Toque Gélido");

// 2. Pré-carregar traduções de uma lista
await preloadTranslations(spells);

// 3. Usar tradução síncrona (usa cache)
const translated = translateSpellNameSync("chill-touch", "Chill Touch");
```

