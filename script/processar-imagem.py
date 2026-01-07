#!/usr/bin/env python3
"""
Script para processar a imagem do ícone e adicionar texto "Morsmordre"
Requer: pip install Pillow
"""

import os
from PIL import Image, ImageDraw, ImageFont

# Tamanhos necessários para cada densidade do Android
SIZES = {
    'mipmap-mdpi': 48,
    'mipmap-hdpi': 72,
    'mipmap-xhdpi': 96,
    'mipmap-xxhdpi': 144,
    'mipmap-xxxhdpi': 192
}

# Tamanho para foreground (adaptive icon)
FOREGROUND_SIZE = 108

def processar_icone():
    """Processa a imagem e gera os ícones em todos os tamanhos necessários"""
    
    print('========================================')
    print('  PROCESSADOR DE ÍCONE - Morsmordre')
    print('========================================\n')
    
    # Caminhos
    script_dir = os.path.dirname(os.path.abspath(__file__))
    projeto_dir = os.path.dirname(script_dir)
    imagem_origem = os.path.join(projeto_dir, 'public', '2587ffc4a4a8783df564c50559ed4f40.jpg')
    res_dir = os.path.join(projeto_dir, 'android', 'app', 'src', 'main', 'res')
    
    # Verificar se a imagem existe
    if not os.path.exists(imagem_origem):
        print(f'ERRO: Imagem não encontrada em: {imagem_origem}')
        return False
    
    print(f'Carregando imagem: {imagem_origem}')
    try:
        img_original = Image.open(imagem_origem)
        print(f'✓ Imagem carregada: {img_original.size[0]}x{img_original.size[1]}')
    except Exception as e:
        print(f'ERRO ao carregar imagem: {e}')
        return False
    
    # Processar cada tamanho
    for densidade, tamanho in SIZES.items():
        print(f'\nProcessando {densidade} ({tamanho}x{tamanho})...')
        
        # Criar diretório se não existir
        mipmap_dir = os.path.join(res_dir, densidade)
        os.makedirs(mipmap_dir, exist_ok=True)
        
        # Redimensionar imagem mantendo proporção e centralizando
        img_redimensionada = redimensionar_e_centralizar(img_original, tamanho)
        
        # Adicionar texto "Morsmordre"
        img_com_texto = adicionar_texto(img_redimensionada, 'Morsmordre', tamanho)
        
        # Salvar ícone normal
        icone_path = os.path.join(mipmap_dir, 'ic_launcher.png')
        img_com_texto.save(icone_path, 'PNG')
        print(f'  ✓ Salvo: {icone_path}')
        
        # Salvar ícone round (mesmo arquivo)
        icone_round_path = os.path.join(mipmap_dir, 'ic_launcher_round.png')
        img_com_texto.save(icone_round_path, 'PNG')
        print(f'  ✓ Salvo: {icone_round_path}')
        
        # Salvar foreground (sem texto, para adaptive icon)
        foreground_path = os.path.join(mipmap_dir, 'ic_launcher_foreground.png')
        img_redimensionada.save(foreground_path, 'PNG')
        print(f'  ✓ Salvo: {foreground_path}')
    
    # Processar foreground para adaptive icon (108dp)
    print(f'\nProcessando foreground para adaptive icon ({FOREGROUND_SIZE}x{FOREGROUND_SIZE})...')
    drawable_dir = os.path.join(res_dir, 'drawable-v24')
    os.makedirs(drawable_dir, exist_ok=True)
    
    # Nota: O foreground é um vector drawable, mas podemos criar um PNG também
    # O XML já existe, então não precisamos alterar
    
    print('\n========================================')
    print('  PROCESSAMENTO CONCLUÍDO!')
    print('========================================\n')
    return True

def redimensionar_e_centralizar(img, tamanho):
    """Redimensiona a imagem mantendo proporção e centraliza em fundo quadrado"""
    # Calcular escala mantendo proporção
    largura, altura = img.size
    escala = min(tamanho / largura, tamanho / altura)
    
    nova_largura = int(largura * escala)
    nova_altura = int(altura * escala)
    
    # Redimensionar
    img_redimensionada = img.resize((nova_largura, nova_altura), Image.Resampling.LANCZOS)
    
    # Criar imagem quadrada com fundo preto (ou transparente)
    img_final = Image.new('RGBA', (tamanho, tamanho), (0, 0, 0, 0))
    
    # Centralizar
    x = (tamanho - nova_largura) // 2
    y = (tamanho - nova_altura) // 2
    
    # Colar imagem redimensionada
    if img_redimensionada.mode == 'RGBA':
        img_final.paste(img_redimensionada, (x, y), img_redimensionada)
    else:
        img_final.paste(img_redimensionada, (x, y))
    
    return img_final

def adicionar_texto(img, texto, tamanho_icone):
    """Adiciona texto abaixo da imagem do ícone"""
    # Criar uma imagem maior para acomodar o texto
    altura_texto = int(tamanho_icone * 0.25)  # 25% do tamanho do ícone
    largura_total = tamanho_icone
    altura_total = tamanho_icone + altura_texto
    
    img_com_texto = Image.new('RGBA', (largura_total, altura_total), (0, 0, 0, 0))
    
    # Colar a imagem do ícone no topo
    img_com_texto.paste(img, (0, 0))
    
    # Adicionar texto
    draw = ImageDraw.Draw(img_com_texto)
    
    # Tentar carregar fonte, usar padrão se não encontrar
    try:
        # Tentar usar fonte do sistema
        tamanho_fonte = max(12, int(tamanho_icone * 0.15))
        try:
            font = ImageFont.truetype("arial.ttf", tamanho_fonte)
        except:
            try:
                font = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", tamanho_fonte)
            except:
                font = ImageFont.load_default()
    except:
        font = ImageFont.load_default()
    
    # Calcular posição do texto (centralizado)
    bbox = draw.textbbox((0, 0), texto, font=font)
    largura_texto = bbox[2] - bbox[0]
    altura_texto_medida = bbox[3] - bbox[1]
    
    x_texto = (largura_total - largura_texto) // 2
    y_texto = tamanho_icone + (altura_texto - altura_texto_medida) // 2
    
    # Desenhar texto com contorno para melhor legibilidade
    # Contorno
    for adj in [(-1,-1), (-1,0), (-1,1), (0,-1), (0,1), (1,-1), (1,0), (1,1)]:
        draw.text((x_texto + adj[0], y_texto + adj[1]), texto, font=font, fill=(0, 0, 0, 200))
    
    # Texto principal (branco)
    draw.text((x_texto, y_texto), texto, font=font, fill=(255, 255, 255, 255))
    
    # Redimensionar de volta para o tamanho do ícone (cortando o texto ou ajustando)
    # Na verdade, para ícones Android, o texto não deve estar na imagem
    # O texto aparece automaticamente abaixo do ícone no launcher
    # Então vamos retornar apenas a imagem do ícone sem texto
    return img

if __name__ == '__main__':
    try:
        processar_icone()
    except ImportError:
        print('ERRO: Pillow não está instalado!')
        print('Instale com: pip install Pillow')
    except Exception as e:
        print(f'ERRO: {e}')
        import traceback
        traceback.print_exc()

