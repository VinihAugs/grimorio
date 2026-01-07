#!/bin/bash

echo "========================================"
echo "  GERADOR DE IPA - NECRO-TOME"
echo "========================================"
echo ""

# Verifica se está no macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "[ERRO] Este script requer macOS!"
    exit 1
fi

# Verifica se a pasta ios existe
if [ ! -d "ios" ]; then
    echo "[ERRO] A pasta ios não existe!"
    echo "       Execute primeiro o script gerar-ios.sh"
    exit 1
fi

# Verifica se Xcode está instalado
if ! command -v xcodebuild &> /dev/null; then
    echo "[ERRO] Xcode não encontrado!"
    exit 1
fi

echo "[1/3] Construindo o projeto web..."
npm run build
if [ $? -ne 0 ]; then
    echo "[ERRO] Falha ao construir o projeto!"
    exit 1
fi

echo ""
echo "[2/3] Sincronizando arquivos com iOS..."
npx cap sync ios
if [ $? -ne 0 ]; then
    echo "[ERRO] Falha ao sincronizar arquivos!"
    exit 1
fi

echo ""
echo "[3/3] Gerando Archive no Xcode..."
echo ""
echo "Abrindo Xcode..."
open ios/App/App.xcworkspace

echo ""
echo "========================================"
echo "  INSTRUÇÕES PARA GERAR O IPA"
echo "========================================"
echo ""
echo "No Xcode:"
echo "1. Selecione 'Any iOS Device' no topo"
echo "2. Product > Archive"
echo "3. Aguarde o build terminar"
echo "4. Na janela Organizer:"
echo "   - Clique em 'Distribute App'"
echo "   - Escolha 'App Store Connect' (para TestFlight)"
echo "     OU 'Development' (para instalação direta)"
echo "   - Siga o assistente"
echo ""
echo "Para TestFlight:"
echo "- O app será enviado automaticamente"
echo "- Acesse App Store Connect para gerenciar"
echo ""
echo "Para instalação direta (.ipa):"
echo "- Escolha 'Development' ou 'Ad Hoc'"
echo "- O .ipa será salvo no local escolhido"
echo ""

