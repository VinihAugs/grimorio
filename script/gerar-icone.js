import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Tamanhos necessários para cada densidade do Android
const sizes = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192
};

// Tamanhos para ícones round
const roundSizes = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192
};

console.log('========================================');
console.log('  GERADOR DE ÍCONE - Morsmordre');
console.log('========================================\n');

console.log('Este script irá processar a imagem e gerar os ícones do Android.');
console.log('Para processar a imagem com texto, você precisará:');
console.log('1. Instalar Python e Pillow: pip install Pillow');
console.log('2. Ou usar uma ferramenta online de processamento de imagem');
console.log('3. Ou usar ImageMagick se disponível\n');

console.log('Por enquanto, vamos:');
console.log('1. Atualizar o nome do app para "Morsmordre"');
console.log('2. Preparar a estrutura de arquivos\n');

// Atualizar strings.xml
const stringsPath = path.join(__dirname, '../android/app/src/main/res/values/strings.xml');
if (fs.existsSync(stringsPath)) {
  let stringsContent = fs.readFileSync(stringsPath, 'utf8');
  stringsContent = stringsContent.replace(/<string name="app_name">.*?<\/string>/, '<string name="app_name">Morsmordre</string>');
  stringsContent = stringsContent.replace(/<string name="title_activity_main">.*?<\/string>/, '<string name="title_activity_main">Morsmordre</string>');
  fs.writeFileSync(stringsPath, stringsContent);
  console.log('✓ strings.xml atualizado com nome "Morsmordre"');
} else {
  console.log('✗ strings.xml não encontrado');
}

console.log('\n========================================');
console.log('  PRÓXIMOS PASSOS');
console.log('========================================\n');
console.log('Para adicionar a imagem como ícone:');
console.log('1. Execute: npm install sharp (ou jimp)');
console.log('2. Ou use o script Python: python script/processar-imagem.py');
console.log('3. Ou processe manualmente a imagem e coloque nos diretórios mipmap-*/\n');

console.log('A imagem original está em: public/2587ffc4a4a8783df564c50559ed4f40.jpg');
console.log('Ela precisa ser redimensionada para os tamanhos acima e salva como:');
console.log('- android/app/src/main/res/mipmap-*/ic_launcher.png');
console.log('- android/app/src/main/res/mipmap-*/ic_launcher_round.png');
console.log('- android/app/src/main/res/mipmap-*/ic_launcher_foreground.png\n');

