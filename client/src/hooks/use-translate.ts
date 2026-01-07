import { useQuery } from "@tanstack/react-query";

// Função para dividir texto em partes menores (limite de 500 caracteres para MyMemory)
function splitText(text: string, maxLength: number = 450): string[] {
  if (text.length <= maxLength) return [text];
  
  const parts: string[] = [];
  const sentences = text.split(/(?<=[.!?])\s+/);
  let currentPart = '';
  
  for (const sentence of sentences) {
    if ((currentPart + sentence).length > maxLength && currentPart) {
      parts.push(currentPart.trim());
      currentPart = sentence;
    } else {
      currentPart += (currentPart ? ' ' : '') + sentence;
    }
  }
  
  if (currentPart) parts.push(currentPart.trim());
  return parts;
}

// Função para traduzir texto usando API gratuita
async function translateText(text: string, targetLang: string = "pt"): Promise<string> {
  // Se o texto for muito longo, dividir em partes
  const maxLength = 450; // Limite seguro para MyMemory (500 chars com encoding)
  if (text.length > maxLength) {
    const parts = splitText(text, maxLength);
    const translatedParts = await Promise.all(parts.map(part => translateText(part, targetLang)));
    return translatedParts.join(' ');
  }
  
  try {
    // Tentativa 1: LibreTranslate (API gratuita e open source)
    try {
      const response = await fetch("https://libretranslate.de/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          q: text,
          source: "en",
          target: targetLang,
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

    // Tentativa 2: MyMemory API (gratuita, limite de 500 caracteres)
    try {
      // Verificar se não excede o limite
      if (text.length > 500) {
        throw new Error("Text too long for MyMemory API");
      }
      
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|pt`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.responseData && data.responseData.translatedText) {
          return data.responseData.translatedText;
        }
      }
    } catch (e) {
      // Continua para fallback
    }

    // Fallback: retorna o texto original se todas as APIs falharem
    return text;
  } catch (error) {
    console.error("Translation error:", error);
    return text;
  }
}

// Hook para traduzir um array de textos
export function useTranslate(texts: string[] | undefined, cacheKey?: string) {
  // Criar uma chave estável baseada no conteúdo dos textos para o cache
  const textsKey = texts ? texts.join("|") : "";
  
  return useQuery({
    queryKey: ["translate", cacheKey || textsKey, texts?.length || 0],
    queryFn: async () => {
      if (!texts || texts.length === 0) return [];
      
      // Traduz cada parágrafo
      const translated = await Promise.all(
        texts.map(text => translateText(text))
      );
      
      return translated;
    },
    enabled: !!texts && texts.length > 0,
    staleTime: 1000 * 60 * 60 * 24, // Cache por 24 horas
  });
}

// Função utilitária para traduzir texto simples
export async function translate(text: string): Promise<string> {
  return translateText(text);
}

