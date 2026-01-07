@echo off
chcp 65001 >nul
echo ========================================
echo   CONFIGURADOR DE ÍCONE - Morsmordre
echo ========================================
echo.

REM Atualizar nome do app
echo [1/3] Atualizando nome do app para "Morsmordre"...
powershell -Command "(Get-Content 'android\app\src\main\res\values\strings.xml') -replace '<string name=\"app_name\">.*?</string>', '<string name=\"app_name\">Morsmordre</string>' | Set-Content 'android\app\src\main\res\values\strings.xml'"
powershell -Command "(Get-Content 'android\app\src\main\res\values\strings.xml') -replace '<string name=\"title_activity_main\">.*?</string>', '<string name=\"title_activity_main\">Morsmordre</string>' | Set-Content 'android\app\src\main\res\values\strings.xml'"
echo ✓ Nome do app atualizado
echo.

REM Verificar se Node.js está disponível
where node >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [2/3] Node.js encontrado! Processando imagem...
    node --version
    echo.
    echo Verificando se sharp está instalado...
    npm list sharp >nul 2>&1
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo sharp não está instalado. Instalando...
        call npm install sharp --save-dev
        if %ERRORLEVEL% NEQ 0 (
            echo [ERRO] Falha ao instalar sharp
            echo.
            echo Instale manualmente com: npm install sharp --save-dev
            pause
            exit /b 1
        )
    )
    echo.
    echo Processando imagem e gerando ícones...
    node script\processar-imagem.js
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo ========================================
        echo   ÍCONE CONFIGURADO COM SUCESSO!
        echo ========================================
        echo.
        echo O nome do app foi alterado para "Morsmordre"
        echo Os ícones foram gerados em todos os tamanhos necessários
        echo.
    ) else (
        echo.
        echo [AVISO] Falha ao processar imagem automaticamente
    )
) else (
    echo [2/3] Node.js não encontrado
    echo.
    echo Para processar a imagem automaticamente:
    echo 1. Instale Node.js: https://nodejs.org/
    echo 2. Execute: npm install sharp --save-dev
    echo 3. Execute este script novamente
    echo.
)

echo.
echo [3/3] Verificando arquivos...
if exist "android\app\src\main\res\values\strings.xml" (
    echo ✓ strings.xml existe
) else (
    echo ✗ strings.xml não encontrado
)

echo.
echo ========================================
echo   CONFIGURAÇÃO CONCLUÍDA
echo ========================================
echo.
echo O nome do app foi alterado para "Morsmordre"
echo O texto aparecerá automaticamente abaixo do ícone no launcher do Android
echo.
pause

