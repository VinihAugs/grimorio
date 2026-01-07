#!/bin/bash

echo "========================================"
echo "  GERADOR DE APP iOS - NECRO-TOME"
echo "========================================"
echo ""

# Verifica se está no macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "[ERRO] Este script requer macOS!"
    echo "       Para gerar apps iOS, você precisa:"
    echo "       1. Um Mac com macOS instalado"
    echo "       2. Xcode instalado (via App Store)"
    echo "       3. Conta de desenvolvedor Apple (gratuita ou paga)"
    exit 1
fi

# Verifica se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "[ERRO] Node.js não encontrado! Instale o Node.js primeiro."
    exit 1
fi

# Verifica se Xcode está instalado
if ! command -v xcodebuild &> /dev/null; then
    echo "[ERRO] Xcode não encontrado!"
    echo "       Instale o Xcode via App Store."
    exit 1
fi

echo "[1/6] Instalando dependências do projeto..."
npm install
if [ $? -ne 0 ]; then
    echo "[ERRO] Falha ao instalar dependências!"
    exit 1
fi

echo ""
echo "[2/6] Instalando Capacitor iOS..."
npm install --save @capacitor/ios
if [ $? -ne 0 ]; then
    echo "[ERRO] Falha ao instalar Capacitor iOS!"
    exit 1
fi

echo ""
echo "[3/6] Construindo o projeto web..."
npm run build
if [ $? -ne 0 ]; then
    echo "[ERRO] Falha ao construir o projeto!"
    exit 1
fi

echo ""
echo "[4/6] Inicializando Capacitor (se necessário)..."
if [ ! -f "capacitor.config.ts" ]; then
    npx cap init "Necro-Tome" "com.necro.tome" --web-dir="dist/public"
    if [ $? -ne 0 ]; then
        echo "[ERRO] Falha ao inicializar Capacitor!"
        exit 1
    fi
fi

echo ""
echo "[5/6] Adicionando plataforma iOS (se necessário)..."
if [ ! -d "ios" ]; then
    npx cap add ios
    if [ $? -ne 0 ]; then
        echo "[ERRO] Falha ao adicionar plataforma iOS!"
        exit 1
    fi
fi

echo ""
echo "[6/6] Sincronizando arquivos com iOS..."
npx cap sync ios
if [ $? -ne 0 ]; then
    echo "[ERRO] Falha ao sincronizar arquivos!"
    exit 1
fi

echo ""
echo "========================================"
echo "  CONFIGURAÇÃO CONCLUÍDA!"
echo "========================================"
echo ""
echo "Próximos passos:"
echo ""
echo "1. Abra o Xcode"
echo "2. File > Open > Selecione a pasta 'ios/App'"
echo "3. Selecione o projeto 'App' no navegador"
echo "4. Configure seu Team/Signing em 'Signing & Capabilities'"
echo "5. Selecione um dispositivo ou simulador"
echo "6. Product > Archive (para gerar .ipa)"
echo "7. Window > Organizer > Distribute App (para TestFlight)"
echo ""
echo "OU use o script gerar-ipa.sh para gerar via linha de comando"
echo ""

