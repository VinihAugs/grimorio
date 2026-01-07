/**
 * Script para traduzir APENAS as descriptions de todas as magias
 * e adicionar o campo descriptionPt diretamente no JSON
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Função para traduzir texto usando API
async function translateText(text, retries = 5) {
  if (!text || !text.trim()) return text;
  
  // Dividir texto em partes menores se for muito longo (limite de ~5000 caracteres)
  const maxLength = 4000;
  if (text.length > maxLength) {
    const parts = [];
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
    
    const translatedParts = await Promise.all(parts.map(p => translateText(p, retries)));
    return translatedParts.join(' ');
  }
  
  for (let i = 0; i < retries; i++) {
    try {
      // Tentativa 1: LibreTranslate
      try {
        const response = await fetch("https://libretranslate.de/translate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            q: text,
            source: "en",
            target: "pt",
            format: "text",
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.translatedText && data.translatedText !== text) {
            return data.translatedText;
          }
        }
      } catch (e) {
        // Continua para próxima tentativa
      }

      // Tentativa 2: MyMemory API
      try {
        const response = await fetch(
          `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|pt`,
          {
            headers: {
              'User-Agent': 'Mozilla/5.0'
            }
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.responseData && data.responseData.translatedText && data.responseData.translatedText !== text) {
            return data.responseData.translatedText;
          }
        }
      } catch (e) {
        // Continua para próxima tentativa
      }
      
      // Tentativa 3: Google Translate (via API pública não oficial)
      try {
        const response = await fetch(
          `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=pt&dt=t&q=${encodeURIComponent(text)}`
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data[0] && data[0][0] && data[0][0][0]) {
            const translated = data[0].map((item) => item[0]).join('');
            if (translated && translated !== text) {
              return translated;
            }
          }
        }
      } catch (e) {
        // Continua para fallback
      }
    } catch (error) {
      // Silenciar erros individuais
    }
    
    // Aguardar antes de tentar novamente (backoff exponencial)
    if (i < retries - 1) {
      const waitTime = 3000 * (i + 1); // Aumentado para evitar rate limiting
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  // Se todas as tentativas falharem, retornar original
  console.warn(`⚠️  Não foi possível traduzir (tentativas esgotadas)`);
  return text;
}

async function translateDescriptions() {
  console.log('========================================');
  console.log('  TRADUTOR DE DESCRIÇÕES');
  console.log('========================================\n');
  
  const jsonPath = path.join(__dirname, '..', 'public', 'magias_dnd.json');
  
  // Ler o JSON
  console.log('📖 Lendo arquivo JSON...');
  const jsonContent = fs.readFileSync(jsonPath, 'utf-8');
  const spells = JSON.parse(jsonContent);
  
  console.log(`✅ ${spells.length} magias encontradas\n`);
  
  // Traduzir cada descrição
  let translated = 0;
  let skipped = 0;
  let errors = 0;
  
  for (let i = 0; i < spells.length; i++) {
    const spell = spells[i];
    const progress = `[${i + 1}/${spells.length}]`;
    
    // Pular se já tem tradução E ela é diferente do original (ou seja, realmente traduzida)
    if (spell.descriptionPt && spell.descriptionPt !== spell.description) {
      console.log(`${progress} ⏭️  ${spell.name} - já traduzida`);
      skipped++;
      continue;
    }
    
    // Se tem descriptionPt mas é igual ao original, remover para tentar traduzir novamente
    if (spell.descriptionPt === spell.description) {
      delete spell.descriptionPt;
    }
    
    if (!spell.description || !spell.description.trim()) {
      console.log(`${progress} ⏭️  ${spell.name} - sem descrição`);
      skipped++;
      continue;
    }
    
    console.log(`${progress} 🔄 Traduzindo: ${spell.name}...`);
    
    try {
      const translatedText = await translateText(spell.description);
      
      // Só salvar se a tradução for diferente do original (ou seja, realmente traduzida)
      if (translatedText && translatedText !== spell.description && translatedText.trim().length > 0) {
        spell.descriptionPt = translatedText;
        translated++;
        console.log(`  ✅ Traduzido com sucesso!`);
      } else {
        console.log(`  ⚠️  Tradução falhou - não será salva (tentará novamente na próxima execução)`);
        skipped++;
      }
      
      // Rate limiting - aguardar entre requisições (aumentado para evitar bloqueios)
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Salvar progresso a cada 10 traduções
      if (translated % 10 === 0) {
        console.log(`\n💾 Salvando progresso... (${translated} traduzidas)\n`);
        fs.writeFileSync(jsonPath, JSON.stringify(spells, null, 2), 'utf-8');
      }
      
    } catch (error) {
      console.error(`  ❌ Erro: ${error.message}`);
      errors++;
    }
  }
  
  // Salvar JSON final
  console.log('\n💾 Salvando JSON final...');
  fs.writeFileSync(jsonPath, JSON.stringify(spells, null, 2), 'utf-8');
  
  console.log('\n========================================');
  console.log('  TRADUÇÃO CONCLUÍDA!');
  console.log('========================================');
  console.log(`✅ Traduzidas: ${translated}`);
  console.log(`⏭️  Ignoradas: ${skipped}`);
  console.log(`❌ Erros: ${errors}`);
  console.log(`\n📁 Arquivo salvo em: ${jsonPath}\n`);
}

// Executar
translateDescriptions().catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});

