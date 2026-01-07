/**
 * Script para traduzir todas as magias do JSON usando API de tradução
 * 
 * Uso: node script/traduzir-magias.js
 * 
 * Este script traduz description, material e higherLevel de todas as magias
 * e adiciona os campos descriptionPt, materialPt e higherLevelPt ao JSON
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Função para traduzir texto usando API
async function translateText(text, retries = 3) {
  if (!text || !text.trim()) return text;
  
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
    } catch (error) {
      console.error(`Erro na tentativa ${i + 1}:`, error.message);
    }
    
    // Aguardar antes de tentar novamente
    if (i < retries - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  
  // Se todas as tentativas falharem, retornar original
  console.warn(`⚠️  Não foi possível traduzir: "${text.substring(0, 50)}..."`);
  return text;
}

async function translateSpells() {
  console.log('========================================');
  console.log('  TRADUTOR DE MAGIAS');
  console.log('========================================\n');
  
  const jsonPath = path.join(__dirname, '..', 'client', 'src', 'data', 'magias_dnd.json');
  const backupPath = path.join(__dirname, '..', 'client', 'src', 'data', 'magias_dnd.json.backup');
  
  // Ler o JSON
  console.log('📖 Lendo arquivo JSON...');
  const jsonContent = fs.readFileSync(jsonPath, 'utf-8');
  const spells = JSON.parse(jsonContent);
  
  console.log(`✅ ${spells.length} magias encontradas\n`);
  
  // Criar backup
  console.log('💾 Criando backup...');
  fs.writeFileSync(backupPath, jsonContent);
  console.log(`✅ Backup criado: ${backupPath}\n`);
  
  // Traduzir cada magia
  let translated = 0;
  let skipped = 0;
  
  for (let i = 0; i < spells.length; i++) {
    const spell = spells[i];
    const progress = `[${i + 1}/${spells.length}]`;
    
    console.log(`${progress} Traduzindo: ${spell.name}...`);
    
    try {
      // Traduzir descrição
      if (spell.description && !spell.descriptionPt) {
        console.log(`  📝 Traduzindo descrição...`);
        spell.descriptionPt = await translateText(spell.description);
        await new Promise(resolve => setTimeout(resolve, 500)); // Rate limiting
      }
      
      // Traduzir material
      if (spell.material && spell.material.trim() && !spell.materialPt) {
        console.log(`  🧪 Traduzindo material...`);
        spell.materialPt = await translateText(spell.material);
        await new Promise(resolve => setTimeout(resolve, 500)); // Rate limiting
      }
      
      // Traduzir higher level
      if (spell.higherLevel && spell.higherLevel.trim() && !spell.higherLevelPt) {
        console.log(`  ⬆️  Traduzindo níveis superiores...`);
        spell.higherLevelPt = await translateText(spell.higherLevel);
        await new Promise(resolve => setTimeout(resolve, 500)); // Rate limiting
      }
      
      translated++;
      console.log(`  ✅ Concluído!\n`);
      
    } catch (error) {
      console.error(`  ❌ Erro: ${error.message}\n`);
      skipped++;
    }
  }
  
  // Salvar JSON atualizado
  console.log('\n💾 Salvando JSON traduzido...');
  fs.writeFileSync(jsonPath, JSON.stringify(spells, null, 2), 'utf-8');
  
  console.log('\n========================================');
  console.log('  TRADUÇÃO CONCLUÍDA!');
  console.log('========================================');
  console.log(`✅ Traduzidas: ${translated}`);
  console.log(`⚠️  Ignoradas: ${skipped}`);
  console.log(`\n📁 Arquivo salvo em: ${jsonPath}`);
  console.log(`💾 Backup disponível em: ${backupPath}\n`);
}

// Executar
translateSpells().catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});

