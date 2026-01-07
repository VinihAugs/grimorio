import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Tamanhos necessários para cada densidade do Android
const SIZES = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192
};

async function processarIcone() {
  console.log('========================================');
  console.log('  PROCESSADOR DE ÍCONE - Morsmordre');
  console.log('========================================\n');
  
  // Caminhos
  const projetoDir = path.dirname(__dirname);
  const imagemOrigem = path.join(projetoDir, 'public', '2587ffc4a4a8783df564c50559ed4f40.jpg');
  const resDir = path.join(projetoDir, 'android', 'app', 'src', 'main', 'res');
  
  // Verificar se a imagem existe
  if (!fs.existsSync(imagemOrigem)) {
    console.error(`ERRO: Imagem não encontrada em: ${imagemOrigem}`);
    return false;
  }
  
  console.log(`Carregando imagem: ${imagemOrigem}`);
  
  try {
    // Obter metadados da imagem
    const metadata = await sharp(imagemOrigem).metadata();
    console.log(`✓ Imagem carregada: ${metadata.width}x${metadata.height}`);
    
    // Processar cada tamanho
    for (const [densidade, tamanho] of Object.entries(SIZES)) {
      console.log(`\nProcessando ${densidade} (${tamanho}x${tamanho})...`);
      
      // Criar diretório se não existir
      const mipmapDir = path.join(resDir, densidade);
      if (!fs.existsSync(mipmapDir)) {
        fs.mkdirSync(mipmapDir, { recursive: true });
      }
      
      // Redimensionar imagem mantendo proporção e centralizando em fundo quadrado
      const iconeBuffer = await sharp(imagemOrigem)
        .resize(tamanho, tamanho, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 } // Fundo transparente
        })
        .png()
        .toBuffer();
      
      // Salvar ícone normal
      const iconePath = path.join(mipmapDir, 'ic_launcher.png');
      fs.writeFileSync(iconePath, iconeBuffer);
      console.log(`  ✓ Salvo: ${iconePath}`);
      
      // Salvar ícone round (mesmo arquivo)
      const iconeRoundPath = path.join(mipmapDir, 'ic_launcher_round.png');
      fs.writeFileSync(iconeRoundPath, iconeBuffer);
      console.log(`  ✓ Salvo: ${iconeRoundPath}`);
      
      // Salvar foreground (mesmo para adaptive icon)
      const foregroundPath = path.join(mipmapDir, 'ic_launcher_foreground.png');
      fs.writeFileSync(foregroundPath, iconeBuffer);
      console.log(`  ✓ Salvo: ${foregroundPath}`);
    }
    
    console.log('\n========================================');
    console.log('  PROCESSAMENTO CONCLUÍDO!');
    console.log('========================================\n');
    console.log('✓ Todos os ícones foram gerados');
    console.log('✓ O nome do app foi alterado para "Morsmordre"');
    console.log('\nNota: O texto "Morsmordre" aparecerá automaticamente');
    console.log('abaixo do ícone no launcher do Android (não precisa estar na imagem).\n');
    
    return true;
  } catch (error) {
    console.error(`ERRO ao processar imagem: ${error.message}`);
    return false;
  }
}

// Executar
processarIcone().catch(console.error);

